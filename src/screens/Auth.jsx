import { useEffect, useRef, useState } from 'react';
import { CaretLeft, X, Briefcase, User, ChatCircleDots, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown20Regular, Checkmark20Filled, Dismiss20Regular } from '@fluentui/react-icons';
import { useCompany } from '../context/CompanyContext';
import OnboardingArt from '../components/OnboardingArt';
import './Auth.css';

// Авторизация (Figma node 24627-79594): онбординг → выбор рабочего
// пространства → номер телефона → SMS-код, плюс отдельная ветка гостя.
// Шаги держим локальным состоянием, а не роутами: флоу линейный, а «назад»
// внутри него не должен засорять историю браузера.
const STEP = {
  onboarding: 'onboarding',
  company: 'company',
  phone: 'phone',
  otp: 'otp',
  guest: 'guest',
};

// Демо-правила, чтобы в прототипе были достижимы все нарисованные состояния:
// «+7 700 …» проходит дальше, другой код оператора не находится в системе,
// не-казахстанский номер отбивается инлайн-ошибкой. Верны код из макета и
// 888888 — второй нужен, чтобы на демо не вспоминать цифры из Figma.
const KZ_PREFIX = '77';
// Прототип: подходит любой код из шести цифр
const CODE_LENGTH = 6;
const OTP_LEN = 6;
const RESEND_SEC = 58;
const MAX_ATTEMPTS = 3;

const digits = (s) => s.replace(/\D/g, '');

// +7 700 000 09 91
// Приводим ввод к казахстанскому виду: 8 в начале меняем на 7, недостающую
// семёрку подставляем сами, лишние цифры отбрасываем. Раньше state хранил всё
// набранное, из-за чего после одиннадцатой цифры кнопка снова гасла.
function normalizePhone(raw) {
  const d = digits(raw).replace(/^8/, '7');
  if (!d) return '';
  return (d.startsWith('7') ? d : `7${d}`).slice(0, 11);
}

function formatPhone(raw) {
  const d = digits(raw).replace(/^8/, '7').slice(0, 11);
  if (!d) return '';
  const p = d.startsWith('7') ? d : '7' + d;
  const parts = ['+' + p.slice(0, 1)];
  if (p.length > 1) parts.push(p.slice(1, 4));
  if (p.length > 4) parts.push(p.slice(4, 7));
  if (p.length > 7) parts.push(p.slice(7, 9));
  if (p.length > 9) parts.push(p.slice(9, 11));
  return parts.join(' ');
}

// «+7 7** *** ** 91» — как в макете экрана с кодом
function maskPhone(raw) {
  const d = digits(raw);
  return `+7 ${d.slice(1, 2)}** *** ** ${d.slice(9, 11)}`;
}

function LangSwitch({ lang, onChange }) {
  return (
    <div className="auth-lang">
      {['Қаз', 'Рус'].map((l) => (
        <button
          key={l}
          className={`auth-lang-btn${lang === l ? ' active' : ''}`}
          onClick={() => onChange(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Dialog({ title, text, actions, stacked }) {
  return (
    <div className="auth-dialog-wrap">
      <div className="auth-dialog">
        <div className="auth-dialog-body">
          {title && <h3 className="auth-dialog-title">{title}</h3>}
          {text}
        </div>
        <div className={`auth-dialog-actions${stacked || actions.length > 2 ? ' col' : ''}`}>
          {actions.map((a) => (
            <button key={a.label} className="auth-dialog-btn" onClick={a.onClick}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Капча Cloudflare из макета: пока «идёт проверка», код запросить нельзя.
function Turnstile({ done }) {
  return (
    <div className="turnstile">
      {done
        ? <CheckCircle size={24} weight="fill" color="var(--color-success)" />
        : <span className="turnstile-spinner" />}
      <span className="turnstile-text">{done ? 'Успешно.' : 'Идет проверка...'}</span>
      <span className="turnstile-brand">
        <img src="/img/auth/cloudflare.svg" alt="" width="26" height="18" />
        <b>CLOUDFLARE</b>
        <i>Privacy • Terms</i>
      </span>
    </div>
  );
}

export default function Auth() {
  const { signIn } = useAuth();
  const [step, setStep] = useState(STEP.onboarding);
  const { company, companyId, setCompanyId, companies } = useCompany();
  const [sheet, setSheet] = useState(false);
  const [lang, setLang] = useState('Рус');


  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [dialog, setDialog] = useState(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [left, setLeft] = useState(RESEND_SEC);
  const otpRef = useRef(null);

  const [guest, setGuest] = useState({ last: '', first: '', middle: '', birth: '', sex: 'm' });
  // Гость идёт тем же путём «номер → код», но в конце получает форму
  // регистрации, а не сразу вход: его номера в учётках сотрудников нет.
  const [guestFlow, setGuestFlow] = useState(false);

  // Капча «проверяет» только пока открыт экран телефона
  useEffect(() => {
    if (step !== STEP.phone) return;
    setCaptcha(false);
    const t = setTimeout(() => setCaptcha(true), 1200);
    return () => clearTimeout(t);
  }, [step]);

  // Обратный отсчёт до повторной отправки кода
  useEffect(() => {
    if (step !== STEP.otp || left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);

  useEffect(() => {
    if (step === STEP.otp) otpRef.current?.focus();
  }, [step]);

  const phoneDigits = digits(phone);
  const phoneReady = phoneDigits.length === 11 && captcha;

  const requestCode = () => {
    if (!phoneDigits.startsWith(KZ_PREFIX)) {
      setPhoneError('Номер введен неверно, или в вашей стране приложение не доступно');
      return;
    }
    setPhoneError('');
    setDialog({
      kind: 'confirm',
      title: 'Вы ввели следующий номер телефона:',
      text: (
        <>
          <p className="auth-dialog-phone">{formatPhone(phone)}</p>
          <p>Номер верен, или вы хотите изменить его?</p>
        </>
      ),
    });
  };

  const goToOtp = () => {
    setCode('');
    setCodeError('');
    setAttempts(0);
    setLeft(RESEND_SEC);
    setStep(STEP.otp);
  };

  const confirmPhone = () => {
    setDialog(null);
    // Прототип показывают вживую, поэтому подходит любой казахстанский номер:
    // формат уже проверен в requestCode, отдельной «базы сотрудников» тут нет.
    goToOtp();
  };

  const submitCode = (value) => {
    if (value.length === CODE_LENGTH) {
      if (guestFlow) setStep(STEP.guest);
      else signIn();
      return;
    }
    const n = attempts + 1;
    setAttempts(n);
    if (n >= MAX_ATTEMPTS) {
      setCodeError('Превышен лимит попыток ввода кода. Запросите код повторно');
    } else {
      setCodeError('Код введен неверно');
    }
  };

  const onCodeChange = (v) => {
    const d = digits(v).slice(0, OTP_LEN);
    setCode(d);
    if (codeError && attempts < MAX_ATTEMPTS) setCodeError('');
    if (d.length === OTP_LEN) submitCode(d);
  };

  const resend = () => {
    if (attempts >= MAX_ATTEMPTS) {
      // Третий сценарий из макета: повторная отправка упирается в лимит SMS
      setDialog({ kind: 'sms' });
      return;
    }
    setCode('');
    setCodeError('');
    setLeft(RESEND_SEC);
  };

  const guestReady = guest.first.trim().length > 0;

  // Стрелка «назад» слева, крестик справа — как в макете
  const top = (title, onBack, closeIcon) => {
    const btn = (
      <button className="auth-top-btn" onClick={onBack} aria-label={closeIcon ? 'Закрыть' : 'Назад'}>
        {closeIcon ? <X size={24} /> : <CaretLeft size={24} />}
      </button>
    );
    const gap = <span className="auth-top-btn hdr-spacer" aria-hidden="true" />;
    return (
      <header className="auth-top">
        {closeIcon ? gap : btn}
        <h1 className="auth-top-title">{title}</h1>
        {closeIcon ? btn : gap}
      </header>
    );
  };

  if (step === STEP.onboarding) {
    return (
      <div className="auth">
        <div className="auth-scroll auth-onb">
          <OnboardingArt />
          <h1 className="auth-onb-title">Добро пожаловать в qollab!</h1>
          <p className="auth-onb-text">
            Единая цифровая экосистема. Получите доступ к рабочим сервисам,
            HR-инструментам и возможностям для сотрудников и партнеров.
          </p>
          <button className="auth-company" onClick={() => setSheet(true)}>
            <span className="auth-company-dot" style={{ background: company.accent }} />
            <span className="auth-company-texts">
              <span className="auth-company-label">Рабочее пространство</span>
              <span className="auth-company-name">{company.full}</span>
            </span>
            <ChevronDown20Regular className="auth-company-caret" />
          </button>
          <button className="auth-btn auth-btn--primary" onClick={() => { setGuestFlow(false); setStep(STEP.phone); }}>
            Войти
          </button>
          <a className="auth-policy" href="#policy" onClick={(e) => e.preventDefault()}>
            Политика конфиденциальности
          </a>
          <div className="auth-version">App Version: v2.8.2</div>
          <div className="auth-onb-lang"><LangSwitch lang={lang} onChange={setLang} /></div>
        </div>

        {sheet && (
          <div className="auth-sheet-wrap">
            <button className="auth-sheet-scrim" onClick={() => setSheet(false)} aria-label="Закрыть" />
            <div className="auth-sheet">
              <span className="auth-sheet-handle" />
              <div className="auth-sheet-header">
                <h3 className="auth-sheet-title">Выберите пространство</h3>
                <button className="auth-sheet-close" onClick={() => setSheet(false)} aria-label="Закрыть">
                  <Dismiss20Regular />
                </button>
              </div>
              <div className="auth-sheet-list">
                {companies.map((c) => (
                  <button
                    className={`auth-sheet-row ${c.id === companyId ? 'active' : ''}`}
                    key={c.id}
                    onClick={() => { setCompanyId(c.id); setSheet(false); }}
                  >
                    <span className="auth-sheet-dot" style={{ background: c.accent }} />
                    <span className="auth-sheet-texts">
                      <span className="auth-sheet-name">{c.full}</span>
                      <span className="auth-sheet-domain">{c.domain}</span>
                    </span>
                    {c.id === companyId && <Checkmark20Filled className="auth-sheet-check" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === STEP.phone) {
    return (
      <div className="auth">
        {top('Авторизация', () => setStep(STEP.onboarding))}
        <div className="auth-scroll">
          <div className="auth-lang-row"><LangSwitch lang={lang} onChange={setLang} /></div>
          <div className="auth-badge"><User size={32} weight="fill" /></div>
          <h2 className="auth-title">Вход по номеру телефона</h2>

          <div className={`auth-field auth-field--single${phoneError ? ' error' : ''}`}>
            <input
              className="auth-input"
              inputMode="tel"
              placeholder="+7"
              value={phone ? formatPhone(phone) : ''}
              onChange={(e) => { setPhone(normalizePhone(e.target.value)); setPhoneError(''); }}
            />
            {phone && (
              <button className="auth-clear" onClick={() => { setPhone(''); setPhoneError(''); }} aria-label="Очистить">
                <XCircle size={20} weight="fill" />
              </button>
            )}
          </div>
          {phoneError && <p className="auth-error">{phoneError}</p>}

          <button className="auth-btn auth-btn--primary" disabled={!phoneReady} onClick={requestCode}>
            Получить код
          </button>

          <Turnstile done={captcha} />

          <p className="auth-legal">
            Продолжая, вы подтверждаете передачу своих данных сервису qollab: имя,
            фамилия, отчество, номер телефона, дата рождения и пол. Также вы
            принимаете условия <a href="#terms" onClick={(e) => e.preventDefault()}>пользовательского соглашения</a>.
          </p>
        </div>

        {dialog?.kind === 'confirm' && (
          <Dialog
            title={dialog.title}
            text={dialog.text}
            actions={[
              { label: 'Изменить', onClick: () => setDialog(null) },
              { label: 'ОК', onClick: confirmPhone },
            ]}
          />
        )}
        {dialog?.kind === 'notfound' && (
          <Dialog
            stacked
            title="Ваш номер не найден"
            text={<p>Номер телефона не связан с учетной записью сотрудника ERG. Проверьте ввод или войдите как гость.</p>}
            actions={[
              { label: 'Попробовать ещё раз', onClick: () => setDialog(null) },
              { label: 'Войти как гость', onClick: () => { setDialog(null); setGuestFlow(true); goToOtp(); } },
            ]}
          />
        )}
      </div>
    );
  }

  if (step === STEP.otp) {
    const cells = Array.from({ length: OTP_LEN }, (_, i) => code[i] || '');
    return (
      <div className="auth">
        {top('Авторизация', () => setStep(STEP.phone))}
        <div className="auth-scroll">
          <div className="auth-lang-row"><LangSwitch lang={lang} onChange={setLang} /></div>
          <div className="auth-badge"><ChatCircleDots size={32} weight="fill" /></div>
          <h2 className="auth-title">Введите код подтверждения</h2>
          <p className="auth-sub auth-sub--phone">
            Придёт в SMS на номер <b>{maskPhone(phone)}</b>
          </p>

          {/* Одно поле под всеми ячейками: так работает автоподстановка кода из
              SMS и не приходится вручную гонять фокус между шестью инпутами. */}
          <div className="otp" onClick={() => otpRef.current?.focus()}>
            <input
              ref={otpRef}
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
            />
            {cells.map((c, i) => (
              <span
                key={i}
                className={`otp-cell${codeError ? ' error' : ''}${!codeError && i === code.length ? ' active' : ''}`}
              >
                {c}
              </span>
            ))}
          </div>
          {codeError && <p className="auth-error auth-error--center">{codeError}</p>}

          <button className="auth-btn auth-btn--ghost" disabled={left > 0 && !codeError} onClick={resend}>
            {left > 0 && !codeError
              ? `Запросить новый код можно через 00:${String(left).padStart(2, '0')}`
              : 'Запросить новый код'}
          </button>
        </div>

        {dialog?.kind === 'sms' && (
          <Dialog
            title="Не удалось отправить SMS на указанный вами номер"
            text={<p>Пожалуйста, проверьте введенный номер телефона и повторите попытку через 1 час</p>}
            actions={[{ label: 'ОК', onClick: () => { setDialog(null); setStep(STEP.phone); } }]}
          />
        )}
      </div>
    );
  }

  // Регистрация гостя
  const field = (key, label, placeholder, required) => (
    <label className="guest-field">
      <span className="guest-label">{label}{required && <i> *</i>}</span>
      <input
        className="auth-input guest-input"
        placeholder={placeholder}
        value={guest[key]}
        onChange={(e) => setGuest({ ...guest, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="auth">
      {top('Регистрация гостя', () => { setGuestFlow(false); setStep(STEP.onboarding); }, true)}
      <div className="auth-scroll">
        {field('last', 'Фамилия', 'Ваша фамилия')}
        {field('first', 'Имя', 'Ваше имя', true)}
        {field('middle', 'Отчество', 'Ваше отчество')}
        {field('birth', 'Дата рождения', 'дд.мм.гггг')}

        <div className="guest-field">
          <span className="guest-label">Пол</span>
          <div className="guest-sex">
            {[['m', 'Мужской'], ['f', 'Женский']].map(([v, l]) => (
              <button
                key={v}
                className={`guest-radio${guest.sex === v ? ' on' : ''}`}
                onClick={() => setGuest({ ...guest, sex: v })}
              >
                <span className="guest-dot" />{l}
              </button>
            ))}
          </div>
        </div>

        <button className="auth-btn auth-btn--primary" disabled={!guestReady} onClick={signIn}>
          Сохранить и войти
        </button>
      </div>
    </div>
  );
}
