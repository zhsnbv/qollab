import AuthErrorView from '../AuthErrorView';
import { normalizeAuthError, isInline, INLINE_TEXT, KIND, STAGE } from '../../utils/authError';
import { authScenarios } from '../../data/authScenarios';
import '../../screens/Auth.css';

export default {
  title: 'Экраны/Ошибка авторизации',
  component: AuthErrorView,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Прототип по плану «Улучшение ошибок авторизации и экрана технической ошибки» '
          + 'от 03.09.2026.\n\n'
          + 'Главный принцип: клиент отличает ожидаемую пользовательскую ситуацию от сбоя. '
          + 'Просроченный и неверный код остаются подсказкой на шаге ввода и разными текстами; '
          + 'незнакомый `400` неверным кодом не считается и уходит на общий экран.\n\n'
          + 'На общем экране нет ни HTTP-терминов, ни имён сервисов, ни цепочки ошибок — всё '
          + 'техническое живёт под раскрытием и копируется одной кнопкой. Перед копированием '
          + 'детали чистятся от телефона, кода, токенов и заголовков авторизации.\n\n'
          + '«Попробовать снова» возвращает на сохранённый шаг и ничего не запрашивает — новая '
          + 'SMS без явного действия пользователя не уходит. «Начать заново» очищает состояние.',
      },
    },
  },
};

const from = (id) => {
  const raw = authScenarios.find((s) => s.id === id).respond();
  return normalizeAuthError({ stage: STAGE.confirmCode, ...raw });
};

function Screen({ id, note }) {
  return (
    <div className="auth">
      <div className="auth-scroll">
        <AuthErrorView error={from(id)} onRetry={() => {}} onRestart={() => {}} />
        {note && <p style={{ marginTop: 20, fontSize: 13, lineHeight: 1.45, color: 'var(--color-weak)' }}>{note}</p>}
      </div>
    </div>
  );
}

export const СерверНедоступен = {
  name: 'Сервер недоступен (500)',
  render: () => <Screen id="server" note="Основной текст без «Bad Request» и внутренней цепочки. Всё техническое — под раскрытием." />,
};

export const ШлюзВернулHTML = {
  name: 'Шлюз вернул HTML (502)',
  render: () => <Screen id="gateway" note="Тело не JSON, поэтому структурированного debug нет — в деталях показываем сырой ответ, обрезанный и очищенный." />,
};

export const НезнакомыйКод = {
  name: 'Незнакомый код (400)',
  render: () => <Screen id="unknown" note="Неизвестный 400 не превращается в «код введён неверно»: показываем общий шаблон и оставляем код в деталях." />,
};

export const БитоеТело = {
  name: 'Битое тело ответа',
  render: () => <Screen id="broken" note="Повреждённый JSON не роняет разбор и не оставляет бесконечную загрузку." />,
};

export const НетСети = {
  name: 'Нет сети',
  render: () => <Screen id="network" note="Запрос не дошёл — это сеть, а не сбой сервиса, и текст с иконкой другие." />,
};

export const СлишкомМногоПопыток = {
  name: 'Слишком много попыток (429)',
  render: () => <Screen id="rate" note="Время ожидания берём из заголовка Retry-After и говорим его человеку, а не предлагаем «повторить сейчас»." />,
};

export const УтечкаВDebug = {
  name: 'Очистка деталей от секретов',
  render: () => <Screen id="leaky" note="Сервер по ошибке положил в debug телефон, одноразовый код и Bearer-токен. До экрана и до буфера обмена они не доходят." />,
};

// Живая таблица разбора: что нормализатор делает с каждым ответом
const ROWS = [
  ['error_code: "1"', { status: 400, body: { error_code: '1' } }],
  ['errorCode: 2', { status: 400, body: { errorCode: 2 } }],
  ['err_code: "10"', { status: 400, body: { err_code: '10' } }],
  ['error_code: "5"', { status: 400, body: { error_code: '5' } }],
  ['error_code: "99"', { status: 400, body: { error_code: '99' } }],
  ['400 без кода', { status: 400, body: {} }],
  ['429 + Retry-After', { status: 429, headers: { 'Retry-After': '90' } }],
  ['500', { status: 500 }],
  ['502 + HTML', { status: 502, body: '<html>502</html>' }],
  ['битый JSON', { status: 400, body: '{"a":' }],
  ['пустое тело', { status: 400, body: null }],
  ['fetch упал', { thrown: new TypeError('Network request failed') }],
];

export const РазборОтветов = {
  name: 'Разбор ответов',
  parameters: {
    docs: { description: { story: 'Что нормализатор делает с каждой формой ответа и куда это ведёт пользователя.' } },
  },
  render: () => (
    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.5 }}>
      {ROWS.map(([label, input]) => {
        const e = normalizeAuthError({ stage: STAGE.confirmCode, ...input });
        const branch = isInline(e)
          ? { text: `подсказка на шаге кода: «${INLINE_TEXT[e.kind]}»`, color: 'var(--wg-green)' }
          : e.kind === KIND.userNotFound || e.kind === KIND.accountConflict
            ? { text: 'существующая развилка «сотрудник или гость»', color: 'var(--wg-blue)' }
            : { text: 'общий экран ошибки', color: 'var(--color-primary)' };
        return (
          <div key={label} style={{ padding: '9px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ color: 'var(--color-heading)', fontWeight: 600 }}>{label}</div>
            <div style={{ color: 'var(--color-weak)' }}>{e.kind}</div>
            <div style={{ color: branch.color }}>{branch.text}</div>
          </div>
        );
      })}
    </div>
  ),
};
