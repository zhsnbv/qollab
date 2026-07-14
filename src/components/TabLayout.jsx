import { useRef, useState } from 'react';
import BottomNav from './BottomNav';

// Обёртка кор-раздела: фиксированный топбар сверху, фиксированный навбар снизу,
// между ними — прокручиваемая область контента (как в нативных приложениях).
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
      <div className="scroll-area" onScroll={onScroll}>{children}</div>
      <BottomNav />
    </>
  );
}
