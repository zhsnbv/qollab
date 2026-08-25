import './StatusBubble.css';

// Статус под аватаркой. У себя бабл кликабельный (открывает выбор),
// у коллеги — просто подпись.
export default function StatusBubble({ status, onClick }) {
  if (!status) return null;
  const { Icon, short, tone } = status;
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag className={`sbubble sbubble--${tone}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <Icon />
      <span>{short}</span>
    </Tag>
  );
}
