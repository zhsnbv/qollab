import {
  ArrowReply24Regular, Copy24Regular, Edit24Regular, Pin24Regular, PinOff24Regular,
  Share24Regular, Delete24Regular, CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
import './MessageMenu.css';

// Меню сообщения по долгому нажатию: строка реакций сверху, действия списком.
// Само сообщение подсвечивается на затемнённом фоне — как в проде.
export const REACTIONS = ['❤️', '👍', '😂', '👌', '😮', '🙏'];

export default function MessageMenu({ msg, mine, rect, onClose, onAction, onReact }) {
  // Меню открывается от сообщения: если оно в нижней половине экрана —
  // раскрываем вверх, иначе вниз, чтобы список не уезжал за край.
  const openUp = rect && rect.top > window.innerHeight * 0.45;
  const side = mine ? 'right' : 'left';

  const items = [
    { id: 'reply', label: 'Ответить', Icon: ArrowReply24Regular },
    { id: 'copy', label: 'Скопировать', Icon: Copy24Regular },
    ...(mine && !msg.kind ? [{ id: 'edit', label: 'Изменить', Icon: Edit24Regular }] : []),
    {
      id: 'pin',
      label: msg.pinned ? 'Открепить' : 'Закрепить',
      Icon: msg.pinned ? PinOff24Regular : Pin24Regular,
    },
    { id: 'forward', label: 'Переслать', Icon: Share24Regular },
    { id: 'delete', label: 'Удалить', Icon: Delete24Regular, danger: true },
    { id: 'select', label: 'Выбрать', Icon: CheckmarkCircle24Regular, divided: true },
  ];

  return (
    <div className="msgmenu-wrap">
      <button className="msgmenu-scrim" onClick={onClose} aria-label="Закрыть" />
      <div className={`msgmenu msgmenu--${side} ${openUp ? 'up' : 'down'}`}>
        <div className="msgmenu-reactions">
          {REACTIONS.map((r) => (
            <button className="msgmenu-reaction" key={r} onClick={() => onReact(r)} aria-label={`Реакция ${r}`}>
              {r}
            </button>
          ))}
        </div>

        <div className="msgmenu-list">
          {items.map(({ id, label, Icon, danger, divided }) => (
            <button
              className={`msgmenu-item ${danger ? 'danger' : ''} ${divided ? 'divided' : ''}`}
              key={id}
              onClick={() => onAction(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
