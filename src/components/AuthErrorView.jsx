import { useState } from 'react';
import {
  Warning24Filled, CloudOff24Filled, Clock24Filled,
  ChevronDown20Filled, Copy20Filled, Checkmark20Filled,
} from '@fluentui/react-icons';
import { KIND, screenText, stageText, buildCopyPayload, redact } from '../utils/authError';
import { APP_VERSION } from '../config';
import './AuthErrorView.css';

const ICON = {
  [KIND.network]: CloudOff24Filled,
  [KIND.rateLimit]: Clock24Filled,
};

// Платформа для деталей — без идентификаторов устройства: поддержке нужен класс
// клиента, а не отпечаток браузера.
function platform() {
  const ua = navigator.userAgent || '';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Web';
  return `${os} · веб-прототип`;
}

function Row({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="aerr-row">
      <span className="aerr-row-k">{label}</span>
      <span className="aerr-row-v">{value}</span>
    </div>
  );
}

// Экран технической ошибки авторизации (этапы 4-5 плана).
// Основной текст без HTTP-терминов и имён сервисов; всё техническое живёт
// под явным раскрытием и копируется одной кнопкой уже очищенным от секретов.
export default function AuthErrorView({ error, onRetry, onRestart, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const { title, text } = screenText(error);
  const Icon = ICON[error.kind] || Warning24Filled;
  const ctx = { app: APP_VERSION, platform: platform() };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyPayload(error, ctx));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* буфер недоступен — деталь остаётся выделяемой руками */ }
  };

  return (
    <div className="aerr">
      <div className={`aerr-badge aerr-badge--${error.kind}`}><Icon /></div>
      <h2 className="aerr-title">{title}</h2>
      <p className="aerr-text">{text}</p>

      <button className="auth-btn auth-btn--primary" onClick={onRetry}>Попробовать снова</button>
      <button className="auth-btn auth-btn--ghost" onClick={onRestart}>Начать заново</button>

      <button
        className="aerr-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Показать технические детали
        <ChevronDown20Filled className={open ? 'aerr-chev open' : 'aerr-chev'} />
      </button>

      {open && (
        <div className="aerr-details">
          <Row label="Этап" value={stageText(error.stage)} />
          <Row label="HTTP-статус" value={error.httpStatus} />
          <Row label="Код ошибки" value={error.errorCode} />
          <Row label="Request ID" value={error.requestId} />
          <Row label="Приложение" value={ctx.app} />
          <Row label="Платформа" value={ctx.platform} />
          {/* Серверный debug показываем как есть, но уже без секретов */}
          <div className="aerr-debug">{redact(error.debug || error.rawResponseText || error.statusText || '—')}</div>
          <button className="aerr-copy" onClick={copy}>
            {copied ? <Checkmark20Filled /> : <Copy20Filled />}
            {copied ? 'Скопировано' : 'Скопировать детали'}
          </button>
        </div>
      )}
    </div>
  );
}
