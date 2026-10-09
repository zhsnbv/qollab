import { useRef, useState } from 'react';

// Same dismiss thresholds as useSheetSwipe, with pointer support for the review.
const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = .5;
const EDGE = 12;

export default function usePickerGesture({ platform, root, onMove, onClose, closing }) {
  const gesture = useRef(null);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [handled, setHandled] = useState(false);

  const start = event => {
    if (closing || gesture.current || event.button !== 0 || event.target.closest('button, input, a')) return;
    const panel = root.current;
    const stage = panel?.closest('.rp-conversation');
    if (!stage) return;
    gesture.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY, at: event.timeStamp,
      lastY: event.clientY, lastAt: event.timeStamp, velocity: 0, dy: 0,
      left: panel.parentElement.offsetLeft, top: panel.parentElement.offsetTop,
      maxX: stage.clientWidth - panel.offsetWidth - EDGE,
      maxY: stage.clientHeight - panel.offsetHeight - EDGE,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setHandled(true);
    setDragging(true);
  };
  const move = event => {
    const g = gesture.current;
    if (!g || event.pointerId !== g.id) return;
    if (platform === 'web') {
      onMove({
        left: Math.max(EDGE, Math.min(g.maxX, g.left + event.clientX - g.x)),
        top: Math.max(EDGE, Math.min(g.maxY, g.top + event.clientY - g.y)),
      });
    } else {
      const elapsed = event.timeStamp - g.lastAt;
      if (elapsed > 0) g.velocity = (event.clientY - g.lastY) / elapsed;
      g.lastY = event.clientY;
      g.lastAt = event.timeStamp;
      g.dy = Math.max(0, event.clientY - g.y);
      setDy(g.dy);
    }
  };
  const end = (event, cancelled = false) => {
    const g = gesture.current;
    if (!g || event.pointerId !== g.id) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(g.id)) event.currentTarget.releasePointerCapture(g.id);
    const recent = event.timeStamp - g.lastAt < 100;
    if (!cancelled && platform === 'mobile' && (g.dy > CLOSE_DISTANCE || (g.dy > 12 && recent && g.velocity > CLOSE_VELOCITY))) onClose();
    else setDy(0);
  };
  return {
    handlers: { onPointerDown: start, onPointerMove: move, onPointerUp: end, onPointerCancel: event => end(event, true), onLostPointerCapture: event => end(event, true) },
    style: { '--rp-drag-y': `${dy}px` },
    className: `${dragging ? 'is-dragging' : ''} ${handled ? 'has-dragged' : ''}`,
  };
}
