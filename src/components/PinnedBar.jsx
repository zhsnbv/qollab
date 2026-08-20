import { Pin16Filled, TextBulletListSquare24Regular, Dismiss20Regular } from '@fluentui/react-icons';
import './PinnedBar.css';

// Плашка закреплённого сообщения под шапкой чата: показывает последнее,
// по тапу открывает список всех закреплённых.
export function PinnedBar({ message, count, onOpenList }) {
  if (!message) return null;
  return (
    <button className="pinbar" onClick={onOpenList}>
      <span className="pinbar-line" />
      <span className="pinbar-texts">
        <span className="pinbar-label"><Pin16Filled />Закреплённое</span>
        <span className="pinbar-text">{message.text || previewOf(message)}</span>
      </span>
      {count > 1 && <span className="pinbar-count">{count}</span>}
      <span className="pinbar-list-ico"><TextBulletListSquare24Regular /></span>
    </button>
  );
}

// У медиа и голосовых текста нет — показываем тип вложения
function previewOf(m) {
  if (m.kind === 'photo') return 'Фотография';
  if (m.kind === 'video') return 'Видео';
  if (m.kind === 'voice') return 'Голосовое сообщение';
  if (m.kind === 'document') return m.name || 'Документ';
  return 'Сообщение';
}

// Список закреплённых — лист снизу, как остальные шиты прототипа
export function PinnedList({ items, onClose, onUnpin, onUnpinAll }) {
  return (
    <div className="pinlist-wrap">
      <button className="pinlist-scrim" onClick={onClose} aria-label="Закрыть" />
      <div className="pinlist">
        <span className="pinlist-handle" />
        <div className="pinlist-header">
          <h3 className="pinlist-title">Закреплённые сообщения</h3>
          <button className="pinlist-close" onClick={onClose} aria-label="Закрыть"><Dismiss20Regular /></button>
        </div>

        <div className="pinlist-body">
          {items.map((m) => (
            <div className="pinlist-row" key={m.id}>
              <span className="pinlist-row-texts">
                <span className="pinlist-row-author">{m.mine ? 'Вы' : m.author?.short || m.author}</span>
                <span className="pinlist-row-text">{m.text || previewOf(m)}</span>
              </span>
              <button className="pinlist-unpin" onClick={() => onUnpin(m.id)}>Открепить</button>
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <button className="pinlist-all" onClick={onUnpinAll}>Открепить все сообщения</button>
        )}
      </div>
    </div>
  );
}
