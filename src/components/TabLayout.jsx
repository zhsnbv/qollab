import { useEffect, useRef, useState } from 'react';
import './TabLayout.css';

const MAX_PULL = 92;  // докуда контент вообще уезжает вниз
const TRIGGER = 62;   // с какого смещения жест засчитывается
const HOLD = 54;      // высота полосы, пока идёт обновление

// Обёртка кор-раздела: фиксированный топбар сверху и прокручиваемая область
// контента под ним. Таб-бар живёт в App и лежит поверх — он плавающий, поэтому
// .scroll-area просто получает нижний отступ, чтобы контент из-под него выходил.
// При скролле у топбара плавно проявляется мягкая тень.
export default function TabLayout({ topbar, children, onRefresh }) {
  const [scrolled, setScrolled] = useState(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [animated, setAnimated] = useState(false);
  const areaRef = useRef(null);
  const ticking = useRef(false);
  const busy = useRef(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  const onScroll = (e) => {
    if (ticking.current) return;
    ticking.current = true;
    const top = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrolled(top > 4);
      ticking.current = false;
    });
  };

  // Тянем контент сами, а не полагаемся на «резинку»: только так под ним можно
  // показать белую подложку и удержать полосу со спиннером на время обновления.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    let startY = 0, startX = 0, active = false, dist = 0, timer;

    const run = async () => {
      busy.current = true;
      setRefreshing(true);
      setPull(HOLD);
      // Минимальная длительность: жест должен ощущаться, даже если экрану
      // нечего перезагружать и обновление отрабатывает мгновенно.
      await Promise.all([
        Promise.resolve(refreshRef.current?.()).catch(() => {}),
        new Promise((done) => { timer = setTimeout(done, 700); }),
      ]);
      setRefreshing(false);
      setPull(0);
      busy.current = false;
    };

    const start = (e) => {
      active = false;
      if (busy.current || el.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      dist = 0;
      active = true;
      setAnimated(false);
    };

    const move = (e) => {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      // Скролл вверх и горизонтальные карусели отдаём браузеру
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
        if (!dist) active = false;
        return;
      }
      e.preventDefault();
      dist = Math.min(MAX_PULL, dy * 0.5);
      setPull(dist);
    };

    const end = () => {
      if (!active) return;
      active = false;
      setAnimated(true);
      if (dist >= TRIGGER) run();
      else setPull(0);
      dist = 0;
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, []);

  return (
    <>
      <div className={`topbar-slot ${scrolled ? 'scrolled' : ''}`}>{topbar}</div>
      <div className="tab-scroll">
        {/* Подложка продолжает белый фон шапки: контент уезжает вниз, и сверху
            открывается она, а не серый фон приложения */}
        <div className="ptr" style={{ height: `${pull}px` }} aria-hidden="true">
          <span
            className={`spinner ptr-spinner ${refreshing ? 'is-spin' : ''}`}
            style={{
              opacity: Math.min(1, pull / TRIGGER),
              transform: refreshing ? undefined : `rotate(${Math.round(pull * 3)}deg)`,
            }}
          />
        </div>
        <div
          ref={areaRef}
          className={`scroll-area scroll-area--tabbar ${animated ? 'ptr-anim' : ''}`}
          onScroll={onScroll}
          style={{ transform: pull ? `translateY(${pull}px)` : undefined }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
