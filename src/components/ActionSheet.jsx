import './ActionSheet.css';

// Контекстное меню экрана — листом снизу, а не выпадающим меню: на телефоне
// до нижней части экрана дотянуться проще, и это тот же паттерн, что у
// остальных шитов прототипа.
export default function ActionSheet({ title, items, onClose, onPick }) {
  return (
    <div className="asheet-wrap">
      <button className="asheet-scrim" onClick={onClose} aria-label="Закрыть" />
      <div className="asheet">
        <span className="asheet-handle" />
        {title && <h3 className="asheet-title">{title}</h3>}
        <div className="asheet-list">
          {items.map(({ id, label, Icon, danger }) => (
            <button
              className={`asheet-item ${danger ? 'danger' : ''}`}
              key={id}
              onClick={() => onPick(id)}
            >
              <span className="asheet-label">{label}</span>
              <Icon />
            </button>
          ))}
        </div>
        <button className="asheet-cancel" onClick={onClose}>Отмена</button>
      </div>
    </div>
  );
}
