import './ViewToggle.css';

// Переключатель «сетка / список». Общий для вкладки «Сервисы» и боттом-шита
// «Все сервисы» — раньше стили жили в CSS шита, и экран молча зависел бы от
// того, что шит где-то подключён.
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        aria-label="Сеткой"
        aria-pressed={view === 'grid'}
      >
        <span className="toggle-ico toggle-ico--grid" />
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        aria-label="Списком"
        aria-pressed={view === 'list'}
      >
        <span className="toggle-ico toggle-ico--list" />
      </button>
    </div>
  );
}
