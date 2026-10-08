import { useEffect, useRef, useState } from 'react';
import { Bell, CaretLeft, ChatCircleDots, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { copy, createDelivery, remainingSeconds, restoreDelivery, sendSms, SESSION_KEY } from './model';
import '../../screens/Auth.css';
import './AuthDeliveryReview.css';

const scenarios = [
  { id: 'qollab-wait', channel: 'qollab', ready: false, title: 'Код в Qollab', note: 'Таймер идёт' },
  { id: 'qollab-ready', channel: 'qollab', ready: true, title: 'Нет доступа к Qollab', note: 'SMS доступна' },
  { id: 'sms-wait', channel: 'sms', ready: false, title: 'Код по SMS', note: 'Таймер идёт' },
  { id: 'sms-ready', channel: 'sms', ready: true, title: 'Повторная SMS', note: 'Таймер завершён' },
];

function initialDelivery() {
  const requested = scenarios.find(item => item.id === new URLSearchParams(window.location.search).get('state'));
  if (requested) return createDelivery(requested.channel, requested.ready);
  try { return restoreDelivery(sessionStorage.getItem(SESSION_KEY)); }
  catch { return createDelivery(); }
}

// Reuses Auth.jsx's layout, six-cell single input, Auth.css and Qollab tokens.
// Kept outside Auth so review does not alter the working login flow.
function CodeScreen({ lang, setLang, delivery, left, onSendSms, onBack }) {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const input = useRef(null);
  const t = copy[lang];
  const inQollab = delivery.channel === 'qollab';
  const time = `00:${String(left).padStart(2, '0')}`;
  const label = left > 0
    ? `${inQollab ? t.qollabWait : t.smsWait} ${time}`
    : inQollab ? t.qollabReady : t.smsReady;

  const changeCode = value => {
    const next = value.replace(/\D/g, '').slice(0, 6);
    setCode(next);
    setInvalid(false);
    if (next.length === 6) {
      if (next === '000000') {
        setCode('');
        setInvalid(true);
      } else setSuccess(true);
    }
  };

  useEffect(() => {
    if (!success) return;
    const dialog = document.getElementById('delivery-success');
    dialog?.focus();
  }, [success]);

  const closeSuccess = () => {
    setSuccess(false);
    setCode('');
    input.current?.focus();
  };

  return <section className="auth ad-code-screen" lang={lang} aria-label={t.auth} data-channel={delivery.channel}>
    <header className="auth-top">
      <button className="auth-top-btn" onClick={onBack} aria-label={t.back}><CaretLeft size={24} /></button>
      <h1 className="auth-top-title">{t.auth}</h1>
      <span className="auth-top-btn hdr-spacer" aria-hidden="true" />
    </header>
    <div className="auth-scroll" inert={success ? true : undefined}>
      <div className="auth-lang-row"><div className="auth-lang" aria-label="Language">
        {[['kk', 'Қаз'], ['ru', 'Рус']].map(([id, title]) => <button key={id}
          className={`auth-lang-btn${lang === id ? ' active' : ''}`}
          aria-pressed={lang === id} onClick={() => setLang(id)}>{title}</button>)}
      </div></div>
      <div className="auth-badge" aria-hidden="true">
        {inQollab ? <Bell size={32} weight="fill" /> : <ChatCircleDots size={32} weight="fill" />}
      </div>
      <h2 className="auth-title">{t.title}</h2>
      <p className="auth-sub auth-sub--phone" data-testid="delivery-description">
        {inQollab ? t.qollab : <>{t.sms} <b>+7 700 *** ** 67</b></>}
      </p>
      <div className="otp">
        <input ref={input} className="otp-input" inputMode="numeric" autoComplete="one-time-code"
          aria-label={t.code} aria-invalid={invalid} aria-describedby={invalid ? 'delivery-code-error' : undefined}
          maxLength={6} value={code} onChange={event => changeCode(event.target.value)} />
        {Array.from({length: 6}, (_, index) => <span key={index} aria-hidden="true"
          className={`otp-cell${invalid ? ' error' : ''}${!invalid && index === code.length ? ' active' : ''}`}>
          {code[index] || ''}
        </span>)}
      </div>
      {invalid && <p className="auth-error auth-error--center" id="delivery-code-error" role="alert">{t.invalid}</p>}
      <button className="auth-btn auth-btn--ghost"
        data-testid="delivery-resend" disabled={left > 0 || success} onClick={onSendSms}>{label}</button>
    </div>
    {success && <div className="auth-dialog-wrap" onKeyDown={event => { if (event.key === 'Escape') closeSuccess(); }}>
      <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="delivery-success-title">
        <div className="auth-dialog-body">
          <CheckCircle size={32} weight="fill" color="var(--color-success)" />
          <h3 className="auth-dialog-title" id="delivery-success-title">{t.success}</h3>
          <p>{t.successText}</p>
        </div>
        <div className="auth-dialog-actions"><button id="delivery-success" className="auth-dialog-btn" onClick={closeSuccess}>{t.return}</button></div>
      </div>
    </div>}
  </section>;
}

function DeliveryBoard() {
  return <main className="ad-board" id="auth-delivery-board">
    <header className="ad-board-header">
      <p>QOLLAB · QM-2557</p>
      <h1>Авторизация · доставка кода</h1>
      <p>8 экранов · 402 × 820 px · русский и казахский · согласовано 08.10.2026</p>
      <a href="?lang=ru">Открыть интерактивный прототип</a>
    </header>
    <div className="ad-board-grid">
      {['ru', 'kk'].flatMap((language, row) => scenarios.map((scenario, index) => <figure key={`${language}-${scenario.id}`}>
        <figcaption><strong>0{row * 4 + index + 1} · {language === 'ru' ? 'Русский' : 'Қазақша'}</strong>
          <p>{scenario.title} · {scenario.note}</p></figcaption>
        <div className="ad-board-screen" data-export-screen={`${language}-${scenario.id}`} inert>
          <CodeScreen lang={language} delivery={createDelivery(scenario.channel, scenario.ready, 30_000)}
            left={scenario.ready ? 0 : 30} />
        </div>
      </figure>))}
    </div>
  </main>;
}

export default function AuthDeliveryReview() {
  const board = new URLSearchParams(window.location.search).get('view') === 'board';
  const [delivery, setDelivery] = useState(initialDelivery);
  const [lang, setLang] = useState(() => new URLSearchParams(window.location.search).get('lang') === 'kk' ? 'kk' : 'ru');
  const [now, setNow] = useState(Date.now);
  const [screenVersion, setScreenVersion] = useState(0);
  const left = remainingSeconds(delivery.resendAt, now);
  const current = `${delivery.channel}-${left > 0 ? 'wait' : 'ready'}`;

  useEffect(() => {
    document.documentElement.classList.add('auth-delivery-review');
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.company = 'erg';
    document.title = 'QM-2557 · Авторизация · Qollab';
    const url = new URL(window.location.href);
    url.searchParams.delete('state');
    window.history.replaceState(null, '', url);
    return () => document.documentElement.classList.remove('auth-delivery-review');
  }, []);

  useEffect(() => {
    if (board) return;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(delivery)); } catch { /* Demo still works without storage. */ }
  }, [delivery, board]);

  useEffect(() => {
    if (board) return;
    const sync = () => setNow(Date.now());
    const interval = setInterval(sync, 250);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [board]);

  const choose = scenario => {
    const time = Date.now();
    setNow(time);
    setDelivery(createDelivery(scenario.channel, scenario.ready, time));
    setScreenVersion(value => value + 1);
    // Explicit demo presets should apply once. Reloads restore the real deadline.
    const url = new URL(window.location.href);
    url.searchParams.delete('state');
    window.history.replaceState(null, '', url);
  };
  const requestSms = () => {
    const time = Date.now();
    const next = sendSms(delivery, time);
    if (next === delivery) return;
    setNow(time);
    setDelivery(next);
    setScreenVersion(value => value + 1);
  };
  const changeLanguage = value => {
    setLang(value);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', value);
    window.history.replaceState(null, '', url);
  };

  if (board) return <DeliveryBoard />;

  return <main className="ad-review">
    <header className="ad-review-header">
      <div className="ad-review-brand"><img src="/img/auth/app-icon.svg" width="32" height="32" alt="" /><span>qollab <i>/</i> QM-2557</span><span className="ad-review-tag">Согласовано</span></div>
      <h1>Куда отправлен код</h1>
      <p>Авторизация с понятной подсказкой о доставке — в существующем дизайне Qollab.</p>
    </header>
    <div className="ad-review-layout">
      <aside className="ad-review-panel">
        <h2>Состояния экрана</h2>
        <p>Выбери состояние и проверь его в телефоне справа.</p>
        <div className="ad-scenarios">
          {scenarios.map((scenario, index) => <button key={scenario.id} data-testid={scenario.id}
            className={`ad-scenario${current === scenario.id ? ' is-selected' : ''}`}
            aria-pressed={current === scenario.id} onClick={() => choose(scenario)}>
            <span className="ad-scenario-number">0{index + 1}</span>
            <span><strong>{scenario.title}</strong><small>{scenario.note}</small></span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>)}
        </div>
        <div className="ad-review-notes">
          <h3>Что проверить</h3>
          <p>В Qollab — колокольчик и подсказка про «Уведомления». После таймера кнопка отправляет SMS и меняет экран.</p>
          <p>Язык переключается внутри телефона. Таймер продолжает идти при смене языка, сворачивании вкладки и перезагрузке.</p>
          <p>Введи любые 6 цифр для подтверждения. <b>000000</b> покажет ошибку ввода.</p>
        </div>
        <div className="ad-review-footnote"><span className="ad-review-dot" />Отдельный прототип. Отправка и проверка кода имитируются.</div>
        <a className="ad-review-source" href="?view=board">Все экраны для Figma <ArrowRight size={14} /></a><br />
        <a className="ad-review-source" href="https://jira2.erg.kz/browse/QM-2557" target="_blank" rel="noreferrer">Открыть задачу QM-2557 <ArrowRight size={14} /></a>
      </aside>
      <div className="ad-preview">
        <div className="ad-preview-caption"><span>{lang === 'ru' ? 'Русский' : 'Қазақша'}</span><span>402 × 820</span></div>
        <div className="ad-phone" data-testid="delivery-phone">
          <CodeScreen key={`${screenVersion}-${delivery.sentAt}`} lang={lang} setLang={changeLanguage} delivery={delivery} left={left}
            onSendSms={requestSms} onBack={() => document.querySelector('.ad-scenario.is-selected')?.focus()} />
        </div>
        <p className="ad-preview-note">{delivery.channel === 'qollab' ? 'Код в уведомлениях Qollab' : 'Код отправлен по SMS'}<span>·</span>{left > 0 ? `Доступно через ${left} с` : 'Повторная отправка доступна'}</p>
      </div>
    </div>
  </main>;
}
