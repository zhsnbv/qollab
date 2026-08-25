import './StatusBubble.css';

// Статус под аватаркой. У себя бабл кликабельный (открывает выбор),
// у коллеги — просто подпись.
export default function StatusBubble({ status, onClick }) {
  if (!status) return null;
  const { Icon, short, tone } = status;
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag className={`sbubble sbubble--${tone}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      {/* Хвостик рисуем вектором: у него вогнутые бока, поэтому обычный
          CSS-треугольник тут не подходит */}
      <svg className="sbubble-tail" width="16" height="9" viewBox="0 0 16 9" aria-hidden="true">
        <path d="M8 0c.9 3.1 3.3 6.5 8 9H0c4.7-2.5 7.1-5.9 8-9Z" fill="currentColor" />
      </svg>
      <Icon />
      <span>{short}</span>
    </Tag>
  );
}
