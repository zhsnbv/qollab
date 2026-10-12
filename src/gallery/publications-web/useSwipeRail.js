import { useLayoutEffect, useRef } from 'react';

export default function useSwipeRail(index, count, onChange) {
  const rail = useRef(null), gesture = useRef(null), blockClick = useRef(false);
  const animation = useRef(null), dragFrame = useRef(null), settleTimer = useRef(null);
  const currentIndex = useRef(index), change = useRef(onChange);
  currentIndex.current = index; change.current = onChange;
  const stop = () => { cancelAnimationFrame(animation.current); animation.current = null; clearTimeout(settleTimer.current); };
  const targetLeft = (element, i) => Math.min(element.children[i]?.offsetLeft || 0, Math.max(0, element.scrollWidth - element.clientWidth));
  const nearest = () => {
    const element = rail.current;
    if (!element?.children.length) return 0;
    return [...element.children].reduce((best, _, i) => Math.abs(targetLeft(element, i) - element.scrollLeft) < Math.abs(targetLeft(element, best) - element.scrollLeft) ? i : best, 0);
  };
  const commit = next => { currentIndex.current = next; change.current(next); };
  const go = (next, smooth = true) => {
    const element = rail.current;
    if (!element?.children[next]) return;
    stop(); cancelAnimationFrame(dragFrame.current);
    const from = element.scrollLeft, target = targetLeft(element, next), distance = target - from;
    // Restore native snapping only after the eased movement reaches its exact snap point.
    element.classList.add('is-settling'); element.classList.remove('is-dragging');
    const finish = () => { element.scrollLeft = target; animation.current = null; element.classList.remove('is-settling'); commit(next); };
    if (!smooth || Math.abs(distance) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    const started = performance.now(), duration = Math.min(420, Math.max(220, Math.abs(distance) * .5));
    const tick = now => {
      const time = Math.min((now - started) / duration, 1);
      element.scrollLeft = from + distance * (1 - (1 - time) ** 3);
      if (time < 1) animation.current = requestAnimationFrame(tick); else finish();
    };
    animation.current = requestAnimationFrame(tick);
  };
  useLayoutEffect(() => {
    const element = rail.current;
    if (!element) return;
    let width = element.clientWidth;
    element.scrollLeft = Math.min(element.children[currentIndex.current]?.offsetLeft || 0, Math.max(0, element.scrollWidth - width));
    const observer = new ResizeObserver(() => {
      if (Math.abs(element.clientWidth - width) < 1) return;
      width = element.clientWidth;
      cancelAnimationFrame(animation.current); animation.current = null;
      element.classList.remove('is-settling', 'is-dragging');
      element.scrollLeft = Math.min(element.children[currentIndex.current]?.offsetLeft || 0, Math.max(0, element.scrollWidth - width));
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(animation.current); cancelAnimationFrame(dragFrame.current); clearTimeout(settleTimer.current); };
  }, [count]);
  const finishDrag = event => {
    const point = gesture.current; gesture.current = null;
    if (!point) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!point.dragged) { rail.current?.classList.remove('is-dragging'); return; }
    cancelAnimationFrame(dragFrame.current);
    rail.current.scrollLeft = point.scroll - (point.lastX - point.x);
    const distance = point.x - point.lastX;
    const velocity = performance.now() - point.lastTime < 100 ? -point.velocity : 0;
    let next = nearest();
    const intentional = Math.abs(distance) > Math.max(45, rail.current.clientWidth * .16) || (Math.abs(velocity) > .45 && Math.abs(distance) > 16);
    if (event.type !== 'pointercancel' && intentional && next === point.index) next += Math.sign(distance);
    go(Math.max(0, Math.min(count - 1, next)));
  };
  const settleNative = () => { if (!gesture.current?.dragged && animation.current === null) commit(nearest()); };
  return { ref: rail, go, handlers: {
    onScroll: () => {
      if (gesture.current?.dragged || animation.current !== null) return;
      clearTimeout(settleTimer.current); settleTimer.current = setTimeout(settleNative, 140);
    },
    onScrollEnd: settleNative,
    onPointerDown: event => {
      blockClick.current = false;
      if (count < 2 || event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button:not(.pw-carousel-image):not(.pw-video-preview), iframe')) return;
      const element = event.currentTarget;
      element.classList.add('is-dragging'); stop(); element.classList.remove('is-settling');
      gesture.current = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), velocity: 0, scroll: element.scrollLeft, index: nearest(), dragged: false };
    },
    onPointerMove: event => {
      const point = gesture.current;
      if (!point) return;
      const dx = event.clientX - point.x, dy = event.clientY - point.y;
      if (!point.dragged) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; event.currentTarget.classList.remove('is-dragging'); return; }
        point.dragged = true; blockClick.current = true; event.currentTarget.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      const now = performance.now();
      point.velocity = (event.clientX - point.lastX) / Math.max(1, now - point.lastTime);
      point.lastX = event.clientX; point.lastTime = now;
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = requestAnimationFrame(() => { if (rail.current) rail.current.scrollLeft = point.scroll - (point.lastX - point.x); });
    },
    onPointerUp: finishDrag, onPointerCancel: finishDrag,
    onPointerLeave: event => { if (!gesture.current?.dragged) { gesture.current = null; event.currentTarget.classList.remove('is-dragging'); } },
    onWheel: () => { stop(); rail.current?.classList.remove('is-settling', 'is-dragging'); },
    onClickCapture: event => { if (blockClick.current && event.detail !== 0) { blockClick.current = false; event.preventDefault(); event.stopPropagation(); } },
  } };
}
