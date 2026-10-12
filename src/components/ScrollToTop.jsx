import { useEffect, useState } from 'react';
import { ChevronDoubleUp20Regular } from '@fluentui/react-icons';
import './ScrollToTop.css';

export default function ScrollToTop({ scrollRef, aboveBar = false, tabBar = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const area = scrollRef.current;
    if (!area) return;
    const update = () => setVisible(area.scrollTop > Math.max(320, area.clientHeight * .75));
    update();
    area.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(area);
    return () => {
      area.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [scrollRef]);

  return <button
    type="button"
    className={`scroll-to-top ${visible ? 'is-visible' : ''} ${aboveBar ? 'scroll-to-top--above-bar' : ''} ${tabBar ? 'scroll-to-top--tabbar' : ''}`}
    aria-label="Наверх"
    title="Наверх"
    aria-hidden={!visible}
    tabIndex={visible ? 0 : -1}
    onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}
  ><ChevronDoubleUp20Regular aria-hidden="true" /></button>;
}
