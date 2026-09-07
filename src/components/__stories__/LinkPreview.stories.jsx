import LinkPreview from '../LinkPreview';
import { parseInternalLink, extractFirstInternalLink } from '../../utils/internalLink';
import { resetLinkPreviewCache, setPreviewLatency } from '../../utils/linkPreviewApi';
import '../../screens/ChatRoom.css';

export default {
  title: 'Организмы/Карточка внутренней ссылки',
  component: LinkPreview,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Карточка под текстом сообщения для внутренних ссылок Qollab — прототип по плану '
          + '«Карточки внутренних ссылок в чатах» от 03.09.2026.\n\n'
          + 'В MVP два типа: mini-app и приглашение в групповой канал. Исходный текст ссылки '
          + 'остаётся в сообщении и работает как fallback: тап по нему и тап по карточке '
          + 'приводят к одному и тому же действию. Карточка в сообщении всегда одна — первая '
          + 'подходящая ссылка в порядке документа.\n\n'
          + 'Ошибка, `403` и `404` не оставляют вечную «Загрузку»: карточка просто исчезает. '
          + 'Служебные команды (auth, sessions, access, chats) и внешние адреса карточку '
          + 'не получают вовсе — по замыслу, чтобы их не пересылали как контент.',
      },
    },
  },
};

// Бабл вокруг карточки: без него не видно, что белая плашка одинаково читается
// и на сером чужом сообщении, и на оранжевом своём.
function Bubble({ mine, text, children }) {
  return (
    <div className={`msg ${mine ? 'msg--mine' : 'msg--their'} msg--first msg--last`}>
      {!mine && <span className="msg-avatar-slot" />}
      <div className="msg-col">
        <div className="msg-bubble">
          <div className="msg-text">{text}</div>
          {children}
          <span className="msg-time-row msg-time-row--overlay"><span className="msg-time">12:24</span></span>
        </div>
      </div>
    </div>
  );
}

function Demo({ url, text, mine, note }) {
  const link = parseInternalLink(url);
  return (
    <div className="cr-messages" style={{ padding: 16 }}>
      <Bubble mine={mine} text={text || url}>
        {link && <LinkPreview link={link} onOpen={() => {}} />}
      </Bubble>
      {note && <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.45, color: 'var(--color-weak)' }}>{note}</p>}
    </div>
  );
}

export const МиниАппИзКаталога = {
  name: 'Mini-app — попадание в каталог',
  render: () => (
    <Demo
      url="https://link.qollab.kz/apps?command=apps&id=mail-2&to_url=%2Finbox"
      text="Правки жду на почте"
      note="Приложение уже есть в гидратированном каталоге, поэтому запроса нет и скелетон не мигает. Параметр to_url влияет на действие, но пользователю не показывается."
    />
  ),
};

export const МиниАппЧерезЗапрос = {
  name: 'Mini-app — запрос к preview',
  render: () => {
    resetLinkPreviewCache();
    setPreviewLatency({ endpoint: 420 });
    return (
      <Demo
        url="https://link.qollab.kz/?command=apps&id=ticket"
        text="Заведи тикет тут"
        note="Приложения нет в каталоге — идём в GET /mini_apps/v1/auth/{id}/preview. Скелетон держит финальные габариты, поэтому бабл не прыгает после загрузки."
      />
    );
  },
};

export const Скелетон = {
  name: 'Загрузка',
  render: () => {
    resetLinkPreviewCache();
    setPreviewLatency({ endpoint: 10 ** 7 });
    return (
      <Demo
        url="https://link.qollab.kz/?command=apps&id=ticket"
        text="Заведи тикет тут"
        note="Состояние загрузки, зафиксированное для просмотра. Иконка 40×40, три строки текста и полоса действия — ровно те же габариты, что у загруженной карточки."
      />
    );
  },
};

export const ПриглашениеНеУчастнику = {
  name: 'Приглашение — не участник',
  render: () => (
    <Demo
      url="https://link.qollab.kz/?command=invite&token=inv_7f3ac2"
      text="Залетай в группу продукта"
      note="Preview-запрос read-only: он не вступает в канал и не меняет состав участников. Кнопка — «Вступить»."
    />
  ),
};

export const ПриглашениеУчастнику = {
  name: 'Приглашение — уже участник',
  render: () => (
    <Demo
      mine
      url="https://link.qollab.kz/?command=invite&token=inv_bts91d"
      text="Скинул ссылку на наш канал"
      note="Для того, кто уже в канале, действие другое — «Открыть». Заодно видно карточку на своём (оранжевом) бабле."
    />
  ),
};

export const ПриглашениеНедействительно = {
  name: 'Приглашение — недействительно',
  render: () => (
    <Demo
      url="https://link.qollab.kz/?command=invite&token=inv_expired"
      text="Вот ссылка на группу"
      note="Отозванное или несуществующее приглашение не раскрывает, что за группа: ни названия, ни аватарки, ни действия."
    />
  ),
};

export const НедоступноеПриложение = {
  name: 'Нет доступа — карточки нет',
  render: () => (
    <Demo
      url="https://link.qollab.kz/?command=apps&id=hr-admin"
      text="Тут админка HR"
      note="Приложение существует, но эта аудитория его не видит (403). Карточка не появляется вовсе, обычная ссылка остаётся рабочим fallback — вечной «Загрузки» нет."
    />
  ),
};

export const СлужебнаяИВнешняя = {
  name: 'Служебная и внешняя ссылка',
  render: () => (
    <div className="cr-messages" style={{ padding: 16 }}>
      <Demo url="https://link.qollab.kz/?command=sessions" text="Управление сессиями: https://link.qollab.kz/?command=sessions" />
      <Demo url="https://figma.com/design/qollab/PR-482" text="https://figma.com/design/qollab/PR-482" />
      <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.45, color: 'var(--color-weak)' }}>
        Команда не из allowlist и внешний адрес карточки не получают: карточка нужна только тому,
        что осознанно пересылают как контент.
      </p>
    </div>
  ),
};

// Наглядная таблица правил парсера — то, что в плане расписано чек-листом 9.1
const CASES = [
  ['https://link.qollab.kz/?command=apps&id=mail-2', 'universal link, mini-app'],
  ['qollab://?command=invite&token=inv_7f3ac2', 'собственная схема, приглашение'],
  ['HTTPS://LINK.QOLLAB.KZ/?command=apps&id=x', 'регистр схемы и хоста нормализуется'],
  ['https://link.qollab.kz.evil.example/?command=apps&id=x', 'похожий хост отклоняется'],
  ['https://user@link.qollab.kz/?command=apps&id=x', 'userinfo-спуф отклоняется'],
  ['https://link.qollab.kz/?command=sessions', 'служебная команда — не карточка'],
  ['https://link.qollab.kz/?command=apps', 'без id — не карточка'],
  ['https://figma.com/design/x', 'внешний адрес — не карточка'],
];
const TEXTS = [
  ['смотри https://link.qollab.kz/?command=apps&id=mail-2.', 'точка предложения не входит в адрес'],
  ['`https://link.qollab.kz/?command=apps&id=mail-2`', 'адрес в коде игнорируется'],
  ['[почта](https://link.qollab.kz/?command=apps&id=mail-2) и https://link.qollab.kz/?command=invite&token=inv_7f3ac2', 'markdown-подпись, берётся первая'],
  ['https://figma.com/x потом https://link.qollab.kz/?command=invite&token=inv_7f3ac2', 'внешняя пропускается, берётся внутренняя'],
];

export const ПравилаРазбора = {
  name: 'Правила разбора ссылок',
  parameters: {
    docs: { description: { story: 'Живая таблица: что парсер считает внутренней ссылкой, а что нет.' } },
  },
  render: () => (
    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.5 }}>
      {[['Адрес', CASES, parseInternalLink], ['Текст сообщения', TEXTS, extractFirstInternalLink]].map(([head, rows, fn]) => (
        <div key={head} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{head}</div>
          {rows.map(([input, label]) => {
            const res = fn(input);
            return (
              <div key={input} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ wordBreak: 'break-all', color: 'var(--color-heading)' }}>{input}</div>
                <div style={{ color: 'var(--color-weak)' }}>{label}</div>
                <div style={{ color: res ? 'var(--wg-green)' : 'var(--color-light)', fontWeight: 600 }}>
                  {res ? `→ ${res.type}` : '→ карточки нет'}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ),
};
