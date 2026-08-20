import './TopBar.css';

// Оригинальная серая иконка «три точки» из Figma.
export function DotsIcon() {
  return <img src="/img/common/dots.svg" alt="" width="20" height="20" />;
}

// Топбар кор-раздела. Заголовок слева, произвольные экшены справа.
// Если logo=true — вместо текста показывается лого Qollab. Если передан
// onLogoClick — лого становится кнопкой (на «Главной» переключает тему).
export default function TopBar({ title, logo, actions, onLogoClick }) {
  return (
    <header className="topbar">
      {logo ? (
        onLogoClick ? (
          <button className="topbar-logo-btn pressable" onClick={onLogoClick} aria-label="Переключить тему">
            <span className="topbar-logo" role="img" aria-label="Qollab" />
          </button>
        ) : (
          <span className="topbar-logo" role="img" aria-label="Qollab" />
        )
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
