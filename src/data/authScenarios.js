// Ответы «сервера» для прототипа: по одному на каждую строку матрицы ошибок
// (раздел 6 плана). В проде это реальные ответы api-proxy, здесь — фиксированные
// заготовки, чтобы каждое состояние можно было показать вживую.
//
// Тела намеренно разные по форме: где-то полный envelope, где-то старое имя
// поля errorCode, где-то HTML вместо JSON — нормализатор обязан справиться
// со всеми, не уронив экран.

const rid = () => `3ef6bf71-${Math.floor(Math.random() * 90000 + 10000)}`;

export const authScenarios = [
  {
    id: 'ok',
    label: 'Успех',
    respond: () => null,
  },
  {
    id: 'expired',
    label: 'Код просрочен',
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      headers: { 'x-request-id': rid() },
      body: {
        status_code: 400,
        status: 'Bad Request',
        error_code: '1',
        debug: 'SmsConfirm: bridge responded 400: Code expired',
      },
    }),
  },
  {
    id: 'invalid',
    label: 'Код неверный',
    // Старое имя поля — проверяем совместимость на время rollout
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      body: {
        errorCode: 2,
        requestId: rid(),
        debug: 'SmsConfirm: bridge responded 400: Code invalid',
      },
    }),
  },
  {
    id: 'limit',
    label: 'Лимит попыток',
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      body: {
        error_code: '10',
        request_id: rid(),
        debug: 'SmsConfirm: bridge responded 400: Attempt limit reached',
      },
    }),
  },
  {
    id: 'notfound',
    label: 'Номер не найден',
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      body: { error_code: '5', request_id: rid(), debug: 'SmsConfirm: bridge responded 400: User not found' },
    }),
  },
  {
    id: 'rate',
    label: 'HTTP 429',
    respond: () => ({
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'x-request-id': rid(), 'retry-after': '120' },
      body: { status_code: 429, status: 'Too Many Requests', debug: 'rate limit exceeded for msisdn bucket' },
    }),
  },
  {
    id: 'server',
    label: 'HTTP 500',
    respond: () => ({
      status: 500,
      statusText: 'Internal Server Error',
      body: {
        status_code: 500,
        status: 'Internal Server Error',
        error_code: 'BRIDGE_INTERNAL_ERROR',
        request_id: rid(),
        debug: 'user: bridge_service: SmsConfirm: post https://bridge.internal/confirm: EOF',
      },
    }),
  },
  {
    id: 'gateway',
    label: 'HTTP 502',
    respond: () => ({
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'x-request-id': rid() },
      body: '<html><head><title>502 Bad Gateway</title></head><body>nginx</body></html>',
    }),
  },
  {
    id: 'unknown',
    label: 'Незнакомый код',
    // Неизвестный 400 не должен превращаться в «код введён неверно» (принцип 5.3)
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      body: { error_code: '99', request_id: rid(), debug: 'SmsConfirm: bridge responded 400: Unmapped bridge failure' },
    }),
  },
  {
    id: 'broken',
    label: 'Битое тело',
    respond: () => ({
      status: 400,
      statusText: 'Bad Request',
      body: '{"status":"Bad Request", "error_code": ',
    }),
  },
  {
    id: 'network',
    label: 'Нет сети',
    respond: () => ({ thrown: new TypeError('Network request failed') }),
  },
  {
    id: 'leaky',
    label: 'Утечка в debug',
    // Проверка редактора: сервер по ошибке положил в debug телефон, код и токен
    respond: () => ({
      status: 500,
      statusText: 'Internal Server Error',
      body: {
        error_code: 'BRIDGE_INTERNAL_ERROR',
        request_id: rid(),
        debug: 'SmsConfirm failed for +7 701 234 56 78, otp=418254, authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abc123 — upstream timeout',
      },
    }),
  },
];

export const scenarioById = (id) => authScenarios.find((s) => s.id === id) || authScenarios[0];
