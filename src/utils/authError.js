// Нормализация ошибок авторизации — по разделу 8 плана «Улучшение ошибок
// авторизации и экрана технической ошибки».
//
// Главная мысль плана: клиент обязан отличать ожидаемую пользовательскую
// ситуацию (просроченный код) от настоящего сбоя. Поэтому неизвестный 400
// НЕ считается неверным кодом — он уходит в общий экран с деталями.
//
// Функция ни при каких данных не бросает исключение: пустое тело, HTML вместо
// JSON и битый JSON — это тоже нормальные ответы, которые нужно расклассифицировать.

export const KIND = {
  otpExpired: 'otp_expired',
  otpInvalid: 'otp_invalid',
  userNotFound: 'user_not_found',
  accountConflict: 'account_conflict',
  rateLimit: 'rate_limit',
  network: 'network',
  server: 'server',
  invalidResponse: 'invalid_response',
  unknown: 'unknown',
};

export const STAGE = {
  sendCode: 'send_code',
  confirmCode: 'confirm_code',
  registerGuest: 'register_guest',
  initSession: 'initialize_session',
};

// Числовые коды KK Bridge остаются как есть (решение 13.5 плана). Семантические
// имена появятся отдельным этапом, поэтому таблица одна и в одном месте.
const CODE_KIND = {
  1: KIND.otpExpired,
  2: KIND.otpInvalid,
  5: KIND.userNotFound,
  7: KIND.accountConflict,
  10: KIND.rateLimit,
};

// Ожидаемые ошибки остаются на шаге ввода кода и не открывают общий экран.
// Лимит попыток по прикладному коду — подсказка на месте; HTTP 429 приходит
// от транспорта и требует экрана с понятным временем ожидания (раздел 6).
export function isInline(err) {
  if (!err) return false;
  if (err.kind === KIND.otpExpired || err.kind === KIND.otpInvalid) return true;
  return err.kind === KIND.rateLimit && err.httpStatus !== 429;
}

function readBody(raw) {
  // Тело может прийти строкой, объектом или не прийти вовсе
  if (raw == null) return { json: null, text: '' };
  if (typeof raw === 'object') return { json: raw, text: '' };
  const text = String(raw);
  try {
    const json = JSON.parse(text);
    return json && typeof json === 'object' ? { json, text } : { json: null, text };
  } catch {
    return { json: null, text };
  }
}

// На время совместимого rollout читаем три варианта имени поля (раздел 7.1)
function readCode(json) {
  if (!json) return undefined;
  const raw = json.error_code ?? json.errorCode ?? json.err_code;
  if (raw == null || raw === '') return undefined;
  return String(raw);
}

function readRetryAfter(headers) {
  const h = headers || {};
  const key = Object.keys(h).find((k) => k.toLowerCase() === 'retry-after');
  const n = key ? Number(h[key]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function readRequestId(json, headers) {
  const fromBody = json?.request_id ?? json?.requestId;
  if (fromBody) return String(fromBody);
  const h = headers || {};
  const key = Object.keys(h).find((k) => k.toLowerCase() === 'x-request-id');
  return key ? String(h[key]) : undefined;
}

/**
 * @param {object} input
 * @param {string} input.stage   — шаг авторизации из STAGE
 * @param {number} [input.status] — HTTP-статус; нет статуса = запрос не дошёл
 * @param {string} [input.statusText]
 * @param {*}      [input.body]   — тело ответа: объект, строка или ничего
 * @param {object} [input.headers]
 * @param {Error}  [input.thrown] — исключение fetch/timeout
 */
export function normalizeAuthError({ stage, status, statusText, body, headers, thrown }) {
  const base = { stage, httpStatus: status, statusText };

  // Запрос не дошёл — это сеть, а не сервер
  if (thrown || status == null) {
    return {
      ...base,
      kind: KIND.network,
      debug: thrown ? String(thrown.message || thrown) : 'Ответ не получен',
    };
  }

  const { json, text } = readBody(body);
  const errorCode = readCode(json);
  const requestId = readRequestId(json, headers);
  const debug = json?.debug ? String(json.debug) : undefined;
  // Сырое тело показываем только когда структурированного debug нет (решение 13.2)
  const rawResponseText = !debug && text ? text.slice(0, 2000) : undefined;

  const common = { ...base, errorCode, requestId, debug, rawResponseText };

  // Стабильный код важнее статуса: по нему и определяется пользовательский текст
  if (errorCode && CODE_KIND[errorCode]) {
    return { ...common, kind: CODE_KIND[errorCode] };
  }

  if (status === 429) return { ...common, kind: KIND.rateLimit, retryAfter: readRetryAfter(headers) };
  if (status >= 500) return { ...common, kind: KIND.server };

  // Тело есть, но прочитать нечего — ни JSON, ни debug: отдельный вид, чтобы
  // в телеметрии было видно, что сломался контракт, а не бизнес-логика.
  if (!json && text) return { ...common, kind: KIND.invalidResponse };

  return { ...common, kind: KIND.unknown };
}

// ── Тексты ────────────────────────────────────────────────────────────────
// Inline-подсказки на шаге ввода кода
export const INLINE_TEXT = {
  [KIND.otpExpired]: 'Срок действия кода истёк. Запросите новый код',
  [KIND.otpInvalid]: 'Код введён неверно. Проверьте и попробуйте снова',
  [KIND.rateLimit]: 'Слишком много попыток. Запросите новый код чуть позже',
};

// Общий экран. Ни HTTP-терминов, ни имён сервисов, ни цепочки ошибок.
export const SCREEN_TEXT = {
  [KIND.network]: {
    title: 'Нет подключения к интернету',
    text: 'Проверьте соединение и попробуйте снова.',
  },
  [KIND.server]: {
    title: 'Не удалось войти',
    text: 'Сервис авторизации временно недоступен. Попробуйте ещё раз. Если ошибка повторится, передайте технические детали службе поддержки.',
  },
  [KIND.rateLimit]: {
    title: 'Слишком много попыток',
    text: 'Мы временно ограничили вход. Подождите и попробуйте снова.',
  },
  [KIND.invalidResponse]: {
    title: 'Не удалось войти',
    text: 'Сервер ответил неожиданно. Попробуйте ещё раз. Если ошибка повторится, передайте технические детали службе поддержки.',
  },
  [KIND.unknown]: {
    title: 'Не удалось войти',
    text: 'Что-то пошло не так. Попробуйте ещё раз. Если ошибка повторится, передайте технические детали службе поддержки.',
  },
};

// «Через 2 мин» вместо «подождите»: время ожидания сервер присылает в
// Retry-After, и человеку полезнее конкретика, чем расплывчатая просьба.
function waitText(sec) {
  if (sec < 60) return `${sec} сек`;
  const min = Math.ceil(sec / 60);
  const tail = min % 10 === 1 && min % 100 !== 11 ? 'минуту' : 'мин';
  return min === 1 ? '1 минуту' : `${min} ${tail}`;
}

export function screenText(err) {
  const base = SCREEN_TEXT[err?.kind] || SCREEN_TEXT[KIND.unknown];
  if (err?.kind === KIND.rateLimit && err.retryAfter) {
    return { ...base, text: `Мы временно ограничили вход. Попробуйте снова через ${waitText(err.retryAfter)}.` };
  }
  return base;
}

const STAGE_TEXT = {
  [STAGE.sendCode]: 'Запрос кода',
  [STAGE.confirmCode]: 'Подтверждение кода',
  [STAGE.registerGuest]: 'Регистрация гостя',
  [STAGE.initSession]: 'Создание сессии',
};
export const stageText = (stage) => STAGE_TEXT[stage] || stage;

// ── Очистка от секретов ───────────────────────────────────────────────────
// Детали уходят в буфер обмена и дальше в переписку с поддержкой, поэтому
// вычищаем всё, что может оказаться секретом или персональными данными.
const REDACTORS = [
  // JWT
  [/\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]+/g, '[token]'],
  // token/secret/password/authorization в любом виде «поле: значение»
  // Значение может идти с префиксом Bearer — съедаем его вместе с токеном,
  // иначе в тексте остаётся хвост, который потом чистится второй раз.
  [/\b(access[_-]?token|refresh[_-]?token|token|secret|password|authorization|cookie|api[_-]?key)\b\s*[:=]\s*"?(?:Bearer\s+)?[^\s",}]+/gi, '$1: [redacted]'],
  // Bearer-заголовок
  [/\bBearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]'],
  // Телефон: и в E.164, и с разделителями
  [/\+?\d[\d\s()-]{9,17}\d/g, '[phone]'],
  // Одноразовый код рядом со словом или отдельным полем
  [/\b(otp|code|sms|pin)\b\s*[:=]\s*"?\d{4,8}/gi, '$1: [redacted]'],
];

export function redact(value) {
  let out = String(value ?? '');
  for (const [re, to] of REDACTORS) out = out.replace(re, to);
  return out;
}

// Формат буфера обмена стабильный — по нему поддержка ищет запрос в логах
export function buildCopyPayload(err, ctx = {}) {
  const lines = [
    'Qollab authorization error',
    `Stage: ${err.stage || '—'}`,
    `HTTP status: ${err.httpStatus ?? '—'}`,
    `Error code: ${err.errorCode ?? '—'}`,
    `Request ID: ${err.requestId ?? '—'}`,
    `App: ${ctx.app || '—'}`,
    `Platform: ${ctx.platform || '—'}`,
    `Details: ${redact(err.debug || err.rawResponseText || err.statusText || '—')}`,
  ];
  return lines.join('\n');
}
