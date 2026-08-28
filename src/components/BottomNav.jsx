import { useLayoutEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from './NavIcons';
import './BottomNav.css';

// Плавающий таб-бар по макету Tab bar (node 23742-7540): скруглённый, на блюре.
// Активный таб — filled-иконка оранжевым на серой полупрозрачной плашке, которая
// переезжает между табами. Подписи под иконками — отступление от макета
// (в нём их нет): размер и отступы по HIG, цвет наследуется от иконки.
//
// ВАЖНО: монтируется один раз в App, а не в TabLayout. Иначе на каждой смене
// роута компонент пересоздавался бы и плашке было бы не между чем анимироваться.
const tabs = [
  { to: '/', label: 'Главная', icon: 'home' },
  { to: '/posts', label: 'Лента', icon: 'news' },
  { to: '/services', label: 'Сервисы', icon: 'grid' },
  { to: '/chats', label: 'Чаты', icon: 'chat', badge: 3 },
  { to: '/profile', label: 'Профиль', icon: 'person' },
];

// Плашка шире слота на столько — из макета (78 при слоте 69). Половина запаса
// заложена в боковой паддинг бара, поэтому на крайних табах она сама встаёт
// ровно в 4px от края и подрезать её положение не нужно.
const PILL_OVERHANG = 9;

// '/' матчим точно, остальные по префиксу: /chats/dm тоже подсвечивает «Чаты».
function activeIndex(pathname) {
  const i = tabs.findIndex((t) => t.to !== '/' && pathname.startsWith(t.to));
  return i === -1 ? 0 : i;
}

// Повторный тап по активному табу возвращает список наверх — привычка из
// системных приложений. Роут при этом не меняется, поэтому переход отменяем:
// иначе экран перемонтировался бы ради ничего.
function scrollTabToTop(e) {
  e.preventDefault();
  const area = document.querySelector('.scroll-area');
  if (!area || area.scrollTop === 0) return;
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  area.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

export default function BottomNav() {
  const location = useLocation();
  // Оверлеи (канал, статья, уведомления, поиск) открываются поверх вкладки и
  // сами ни одному табу не соответствуют — подсветку берём с экрана-подложки,
  // иначе она сваливалась на «Главную».
  const index = activeIndex(location.state?.background?.pathname || location.pathname);
  const barRef = useRef(null);
  const pillRef = useRef(null);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const pill = pillRef.current;
    if (!bar || !pill) return;

    // Ставим плашку по центру активного таба. Двигаем только transform — он
    // уезжает на композитор и не дёргается, даже когда новый экран монтируется
    // и занимает главный поток.
    const place = (animate) => {
      const tab = bar.children[index + 1]; // +1: первым ребёнком идёт сама плашка
      if (!tab) return;
      const b = bar.getBoundingClientRect();
      const t = tab.getBoundingClientRect();
      const w = t.width + PILL_OVERHANG;
      pill.style.width = `${w}px`;
      const x = t.left - b.left + (t.width - w) / 2;
      if (!animate) pill.style.transition = 'none';
      pill.style.transform = `translateX(${x}px)`;
      if (!animate) {
        void pill.offsetWidth; // применяем мгновенно, затем возвращаем переход
        pill.style.transition = '';
      }
    };

    place(mounted.current);
    mounted.current = true;

    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [index]);

  return (
    <nav className="bottomnav">
      <div className="bottomnav-row" ref={barRef}>
        <span className="navtab-pill" ref={pillRef} aria-hidden="true" />
        {tabs.map(({ to, label, icon, badge }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            // className функцией, чтобы NavLink не подставлял свой .active по
            // текущему пути: на оверлеях (/banner, /search, /services) ни один
            // таб не совпадает с роутом, и подсветка слетала — иконка активного
            // таба чернела, хотя плашка оставалась под ним. Красим по тому же
            // index, по которому позиционируется плашка.
            className={() => `navtab${i === index ? ' active' : ''}`}
            onClick={(e) => { if (i === index) scrollTabToTop(e); }}
          >
            <span className="navtab-icon-wrap">
              <NavIcon name={icon} active={i === index} />
              {badge ? <span className="navtab-badge">{badge}</span> : null}
            </span>
            <span className="navtab-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
