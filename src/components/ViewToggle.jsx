import './ViewToggle.css';

// Переключатель «сетка / список». Общий для вкладки «Сервисы» и боттом-шита
// «Все сервисы» — раньше стили жили в CSS шита, и экран молча зависел бы от
// того, что шит где-то подключён.
export default function ViewToggle({ view, onChange, labels, className = '', groupLabel = 'Вид отображения' }) {
  return (
    <div className={`view-toggle ${className}`} role="group" aria-label={groupLabel}>
      <button
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        type="button"
        aria-label={labels?.grid || 'Сеткой'}
        aria-pressed={view === 'grid'}
      >
        <span className="toggle-ico toggle-ico--grid" aria-hidden="true" />
        {labels?.grid && <span>{labels.grid}</span>}
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        type="button"
        aria-label={labels?.list || 'Списком'}
        aria-pressed={view === 'list'}
      >
        <span className="toggle-ico toggle-ico--list" aria-hidden="true" />
        {labels?.list && <span>{labels.list}</span>}
      </button>
    </div>
  );
}
