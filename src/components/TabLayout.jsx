import { useRef, useState } from 'react';

// Обёртка кор-раздела: фиксированный топбар сверху и прокручиваемая область
// контента под ним. Таб-бар живёт в App и лежит поверх — он плавающий, поэтому
// .scroll-area просто получает нижний отступ, чтобы контент из-под него выходил.
// При скролле у топбара плавно проявляется мягкая тень.
export default function TabLayout({ topbar, children }) {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  const onScroll = (e) => {
    if (ticking.current) return;
    ticking.current = true;
    const top = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrolled(top > 4);
      ticking.current = false;
    });
  };

  return (
    <>
      <div className={`topbar-slot ${scrolled ? 'scrolled' : ''}`}>{topbar}</div>
      <div className="scroll-area scroll-area--tabbar" onScroll={onScroll}>{children}</div>
    </>
  );
}
