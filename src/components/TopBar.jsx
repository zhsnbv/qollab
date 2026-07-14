import './TopBar.css';

// Оригинальная серая иконка «три точки» из Figma.
export function DotsIcon() {
  return <img src="/img/common/dots.svg" alt="" width="20" height="20" />;
}

// Топбар кор-раздела. Заголовок слева, произвольные экшены справа.
// Если logo=true — вместо текста показывается лого Qollab.
export default function TopBar({ title, logo, actions }) {
  return (
    <header className="topbar">
      {logo ? (
        <img className="topbar-logo" src="/img/common/qollab-logo.svg" alt="Qollab" />
      ) : (
        <h1 className="topbar-title">{title}</h1>
      )}
      <div className="topbar-actions">
        {actions ?? (
          <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
        )}
      </div>
    </header>
  );
}
