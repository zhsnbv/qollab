import { NavLink } from 'react-router-dom';
import './BottomNav.css';

// Иконки — оригинальные PNG из Figma (public/img/nav, @4x): у каждого таба два
// состояния — цветная (активный) и серая плоская (неактивный), как в макете.
// PNG, а не SVG: у иконок картиночные заливки-градиенты, SVG-экспорт их ломает.
const tabs = [
  { to: '/', label: 'Главная', icon: 'home', end: true },
  { to: '/posts', label: 'Лента', icon: 'news' },
  { to: '/services', label: 'Сервисы', icon: 'services' },
  { to: '/chats', label: 'Чаты', icon: 'chats', badge: 3 },
  { to: '/profile', label: 'Профиль', icon: 'profile' },
];

// Лёгкий bounce всего таба (иконка + текст) ПОСЛЕ нажатия:
// проигрываем одноразовую анимацию и снимаем класс по её окончанию.
function bounce(e) {
  const el = e.currentTarget;
  el.classList.remove('bounce');
  void el.offsetWidth; // рестарт анимации
  el.classList.add('bounce');
}

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      <div className="bottomnav-row">
        {tabs.map(({ to, label, icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="navtab"
            onClick={bounce}
            onAnimationEnd={(e) => e.currentTarget.classList.remove('bounce')}
          >
            {({ isActive }) => (
              <span className="navtab-inner">
                <span className="navtab-icon-wrap">
                  <img className="navtab-icon" src={`/img/nav/${icon}${isActive ? '' : '-grey'}.png`} alt="" />
                  {badge ? <span className="navtab-badge">{badge}</span> : null}
                </span>
                <span className="navtab-label">{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
