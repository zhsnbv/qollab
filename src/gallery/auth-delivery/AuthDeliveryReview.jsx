import { useEffect, useId, useRef, useState } from 'react';
import { CaretLeft, ChatCircleDots, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { copy, createDelivery, remainingSeconds, restoreDelivery, sendSms, formatCountdown, COOLDOWN_MS, SESSION_KEY, DEMO_DEVICE } from './model';
import { maskPhone } from '../../utils/phone';
import { applyTheme } from '../../utils/theme';
import bellSvg from '/public/img/auth/code-bell.svg?raw';
import '../../screens/Auth.css';
import './AuthDeliveryReview.css';

const scenarios = [
  { id: 'qollab-wait', channel: 'qollab', ready: false, title: 'Код в Qollab', note: 'Таймер идёт' },
  { id: 'qollab-ready', channel: 'qollab', ready: true, title: 'Нет доступа к Qollab', note: 'SMS доступна' },
  { id: 'sms-wait', channel: 'sms', ready: false, title: 'Код по SMS', note: 'Таймер идёт' },
  { id: 'sms-ready', channel: 'sms', ready: true, title: 'Повторная SMS', note: 'Таймер завершён' },
];
const boardCases = [
  ...scenarios,
  { ...scenarios[1], id: 'qollab-captcha', note: 'Капча над кнопкой', captcha: true },
  { ...scenarios[3], id: 'sms-captcha', note: 'Капча над кнопкой', captcha: true },
  { ...scenarios[1], id: 'qollab-sending', note: 'Отправка SMS', sending: true },
  { ...scenarios[3], id: 'sms-sending', note: 'Отправка нового кода', sending: true },
];
const DEMO_PHONE = '+77001234567';

function CaptchaPreview({ lang, status, onCheck }) {
  const t = copy[lang];
  return <div className="turnstile ad-captcha" data-testid="delivery-captcha" aria-busy={status === 'checking'}>
    {status === 'passed' ? <CheckCircle size={24} weight="fill" color="var(--color-success)" />
      : status === 'checking' ? <span className="turnstile-spinner" />
        : <button className="ad-captcha-check" onClick={onCheck} aria-label={t.robot} />}
    <span className="turnstile-text" role="status">{status === 'passed' ? t.passed : status === 'checking' ? t.checking : t.robot}</span>
    <span className="turnstile-brand"><img src="/img/auth/cloudflare.svg" alt="" width="26" height="18" /><b>CLOUDFLARE</b><i>Privacy • Terms</i></span>
  </div>;
}

function initialDelivery() {
  const requested = scenarios.find(item => item.id === new URLSearchParams(window.location.search).get('state'));
  if (requested) return createDelivery(requested.channel, requested.ready);
  try { return restoreDelivery(sessionStorage.getItem(SESSION_KEY)); }
  catch { return createDelivery(); }
}

// Reuses Auth.jsx's layout, six-cell single input, Auth.css and Qollab tokens.
// Kept outside Auth so review does not alter the working login flow.
function CodeScreen({ lang, setLang, delivery, left, onSendSms, onBack, sending = false, captcha = false, captchaStatus = 'passed', onCheckCaptcha, deviceName }) {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const input = useRef(null);
  const id = useId();
  const t = copy[lang];
  const inQollab = delivery.channel === 'qollab';
  const time = formatCountdown(left);
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
    const dialog = document.getElementById(`${id}-success`);
    dialog?.focus();
  }, [success, id]);

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
        {inQollab ? <span className="ad-bell" dangerouslySetInnerHTML={{__html: bellSvg}} /> : <ChatCircleDots size={32} weight="fill" />}
      </div>
      <h2 className="auth-title">{t.title}</h2>
      <p className="auth-sub auth-sub--phone" data-testid="delivery-description">
        {inQollab ? deviceName ? <>{t.deviceBefore}<b>{deviceName}</b>{t.deviceAfter}</> : t.qollab : <>{t.sms} <b>{maskPhone(DEMO_PHONE)}</b></>}
      </p>
      <div className="otp">
        <input ref={input} className="otp-input" inputMode="numeric" autoComplete="one-time-code"
          aria-label={t.code} aria-invalid={invalid} aria-describedby={invalid ? 'delivery-code-error' : undefined}
          maxLength={6} value={code} disabled={sending} onChange={event => changeCode(event.target.value)} />
        {Array.from({length: 6}, (_, index) => <span key={index} aria-hidden="true"
          className={`otp-cell${invalid ? ' error' : ''}${!invalid && index === code.length ? ' active' : ''}`}>
          {code[index] || ''}
        </span>)}
      </div>
      {invalid && <p className="auth-error auth-error--center" id="delivery-code-error" role="alert">{t.invalid}</p>}
      {captcha && left === 0 && <CaptchaPreview lang={lang} status={captchaStatus} onCheck={onCheckCaptcha} />}
      {sending ? <div className="ad-send-status" role="status" data-testid="delivery-sending" aria-label={t.sending}>
        <span className="ad-spinner" aria-hidden="true" /><span className="ad-sr-only">{t.sending}</span>
      </div> : <button className={`auth-btn auth-btn--ghost${left > 0 ? ' ad-resend-wait' : ''}`}
        data-testid="delivery-resend" disabled={left > 0 || success || (captcha && captchaStatus !== 'passed')} onClick={onSendSms}>
        {left > 0 ? <><span>{inQollab ? t.qollabWait : t.smsWait}</span><span className="ad-countdown">{time}</span></> : label}
      </button>}
    </div>
    {success && <div className="auth-dialog-wrap" onKeyDown={event => { if (event.key === 'Escape') closeSuccess(); }}>
      <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <div className="auth-dialog-body">
          <CheckCircle size={32} weight="fill" color="var(--color-success)" />
          <h3 className="auth-dialog-title" id={`${id}-title`}>{t.success}</h3>
          <p>{t.successText}</p>
        </div>
        <div className="auth-dialog-actions"><button id={`${id}-success`} className="auth-dialog-btn" onClick={closeSuccess}>{t.return}</button></div>
      </div>
    </div>}
  </section>;
}

function DeliveryBoard({ theme }) {
  return <main className="ad-board" id="auth-delivery-board">
    <header className="ad-board-header">
      <p>QOLLAB · QM-2557</p>
      <h1>Авторизация · доставка кода</h1>
      <p>36 экранов · 402 × 820 px · русский и казахский · обе темы · правки 15.10.2026</p>
      <a href="?lang=ru&device=1&state=qollab-wait">Открыть интерактивный прототип</a>
    </header>
    <section className="ad-board-group" id="auth-delivery-device-board">
      <h2>Код отправлен на устройство · 15.10.2026</h2>
      <div className="ad-board-grid">
        {['light', 'dark'].flatMap(mode => ['ru', 'kk'].map(language => <figure key={`${mode}-${language}-device`}>
          <figcaption><strong>{language === 'ru' ? 'Русский' : 'Қазақша'} · {mode === 'light' ? 'Светлая тема' : 'Тёмная тема'}</strong>
            <p>{DEMO_DEVICE} · Таймер идёт</p></figcaption>
          <div className={`ad-board-screen${mode !== theme ? ' ad-theme-override' : ''}`} data-theme={mode} data-export-screen={`${mode}-${language}-device-wait`} inert>
            <CodeScreen lang={language} delivery={createDelivery('qollab', false, COOLDOWN_MS)} left={60} deviceName={DEMO_DEVICE} />
          </div>
        </figure>))}
      </div>
    </section>
    {['light', 'dark'].flatMap((mode) => ['ru', 'kk'].map(language => <section className="ad-board-group" key={`${mode}-${language}`}>
      <h2>{language === 'ru' ? 'Русский' : 'Қазақша'} · {mode === 'light' ? 'Светлая тема' : 'Тёмная тема'}</h2>
      <div className="ad-board-grid">
      {boardCases.map((scenario, index) => <figure key={scenario.id}>
        <figcaption><strong>{String(index + 1).padStart(2, '0')} · {language === 'ru' ? 'Русский' : 'Қазақша'}</strong>
          <p>{scenario.title} · {scenario.note}</p></figcaption>
        <div className={`ad-board-screen${mode !== theme ? ' ad-theme-override' : ''}`} data-theme={mode} data-export-screen={`${mode}-${language}-${scenario.id}`} inert>
          <CodeScreen lang={language} delivery={createDelivery(scenario.channel, scenario.ready, COOLDOWN_MS)}
            left={scenario.ready ? 0 : 60} captcha={scenario.captcha} sending={scenario.sending} />
        </div>
      </figure>)}
      </div></section>))}
  </main>;
}

export default function AuthDeliveryReview() {
  const board = new URLSearchParams(window.location.search).get('view') === 'board';
  const [delivery, setDelivery] = useState(initialDelivery);
  const [lang, setLang] = useState(() => new URLSearchParams(window.location.search).get('lang') === 'kk' ? 'kk' : 'ru');
  const [now, setNow] = useState(Date.now);
  const [screenVersion, setScreenVersion] = useState(0);
  const [theme, setTheme] = useState(() => new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light');
  const [captcha, setCaptcha] = useState(() => new URLSearchParams(window.location.search).get('captcha') === '1');
  const [showDevice, setShowDevice] = useState(() => new URLSearchParams(window.location.search).get('device') === '1');
  const [captchaStatus, setCaptchaStatus] = useState('idle');
  const [sending, setSending] = useState(false);
  const pending = useRef(null);
  const captchaPending = useRef(null);
  const left = remainingSeconds(delivery.resendAt, now);
  const current = `${delivery.channel}-${left > 0 ? 'wait' : 'ready'}`;

  useEffect(() => {
    document.documentElement.classList.add('auth-delivery-review');
    document.documentElement.dataset.company = 'erg';
    document.title = 'QM-2557 · Авторизация · Qollab';
    const url = new URL(window.location.href);
    url.searchParams.delete('state');
    window.history.replaceState(null, '', url);
    return () => document.documentElement.classList.remove('auth-delivery-review');
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => () => { clearTimeout(pending.current); clearTimeout(captchaPending.current); }, []);

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
    clearTimeout(pending.current);
    clearTimeout(captchaPending.current);
    setSending(false);
    setCaptchaStatus('idle');
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
    if (sending || remainingSeconds(delivery.resendAt) > 0 || (captcha && captchaStatus !== 'passed')) return;
    setSending(true);
    pending.current = setTimeout(() => {
      const time = Date.now();
      setNow(time);
      setDelivery(sendSms(delivery, time));
      setSending(false);
      setCaptchaStatus('idle');
      setScreenVersion(value => value + 1);
    }, 1200);
  };
  const checkCaptcha = () => {
    if (captchaStatus !== 'idle') return;
    setCaptchaStatus('checking');
    captchaPending.current = setTimeout(() => setCaptchaStatus('passed'), 1200);
  };
  const changeTheme = value => {
    setTheme(value);
    const url = new URL(window.location.href);
    url.searchParams.set('theme', value);
    window.history.replaceState(null, '', url);
  };
  const changeLanguage = value => {
    setLang(value);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', value);
    window.history.replaceState(null, '', url);
  };
  const changeDevice = value => {
    setShowDevice(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('device', '1');
    else url.searchParams.delete('device');
    window.history.replaceState(null, '', url);
  };

  if (board) return <DeliveryBoard theme={theme} />;

  return <main className="ad-review">
    <header className="ad-review-header">
      <div className="ad-review-brand"><img src="/img/auth/app-icon.svg" width="32" height="32" alt="" /><span>qollab <i>/</i> QM-2557</span><span className="ad-review-tag">Правки 15.10</span></div>
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
        <div className="ad-review-options">
          <div className="auth-lang" aria-label="Тема">
            {[['light', 'Светлая'], ['dark', 'Тёмная']].map(([value, title]) => <button key={value}
              className={`auth-lang-btn${theme === value ? ' active' : ''}`} aria-pressed={theme === value} onClick={() => changeTheme(value)}>{title}</button>)}
          </div>
          <label><input type="checkbox" checked={captcha} onChange={event => { clearTimeout(captchaPending.current); setCaptcha(event.target.checked); setCaptchaStatus('idle'); }} disabled={sending} /> Показать капчу на экранах 2 и 4</label>
          <label><input type="checkbox" checked={showDevice} onChange={event => changeDevice(event.target.checked)} /> Показать устройство {DEMO_DEVICE}</label>
        </div>
        <div className="ad-review-notes">
          <h3>Что проверить</h3>
          <p>В Qollab — колокольчик и подсказка про «Уведомления». После таймера кнопка отправляет SMS и меняет экран.</p>
          <p>Таймер начинается с 01:00 и сохраняется при смене языка, темы и перезагрузке. Во время отправки кнопка заменяется индикатором.</p>
          <p>Введи любые 6 цифр для подтверждения. <b>000000</b> покажет ошибку ввода.</p>
        </div>
        <div className="ad-review-footnote"><span className="ad-review-dot" />Отдельный прототип. Капча, отправка и проверка кода имитируются.</div>
        <a className="ad-review-source" href="?view=board">Все экраны для Figma <ArrowRight size={14} /></a><br />
        <a className="ad-review-source" href="https://jira2.erg.kz/browse/QM-2557" target="_blank" rel="noreferrer">Открыть задачу QM-2557 <ArrowRight size={14} /></a>
      </aside>
      <div className="ad-preview">
        <div className="ad-preview-caption"><span>{lang === 'ru' ? 'Русский' : 'Қазақша'}</span><span>402 × 820</span></div>
        <div className="ad-phone" data-testid="delivery-phone">
          <CodeScreen key={`${screenVersion}-${delivery.sentAt}`} lang={lang} setLang={changeLanguage} delivery={delivery} left={left}
            deviceName={showDevice ? DEMO_DEVICE : undefined}
            sending={sending} captcha={captcha} captchaStatus={captchaStatus} onCheckCaptcha={checkCaptcha}
            onSendSms={requestSms} onBack={() => document.querySelector('.ad-scenario.is-selected')?.focus()} />
        </div>
        <p className="ad-preview-note">{delivery.channel === 'qollab' ? 'Код в уведомлениях Qollab' : 'Код отправлен по SMS'}<span>·</span>{sending ? 'Отправляем код…' : left > 0 ? `Доступно через ${left} с` : 'Повторная отправка доступна'}</p>
      </div>
    </div>
  </main>;
}
