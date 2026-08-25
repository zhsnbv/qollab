import { useRef, useState } from 'react';

// Свайп вниз по шапке листа — закрыть. Тянем панель за пальцем; если увели
// дальше порога или дёрнули резко, отпускание закрывает лист, иначе панель
// возвращается на место.
const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 0.5; // px/ms

export default function useSheetSwipe(onClose) {
  const [dy, setDy] = useState(0);
  const [snap, setSnap] = useState(false);
  const startY = useRef(0);
  const startAt = useRef(0);
  const shift = useRef(0);
  const active = useRef(false);

  const start = (e) => {
    startY.current = e.touches[0].clientY;
    startAt.current = Date.now();
    shift.current = 0;
    active.current = true;
    setSnap(false);
  };

  const move = (e) => {
    if (!active.current) return;
    const moved = e.touches[0].clientY - startY.current;
    // Вверх лист не растягиваем — только небольшое сопротивление
    shift.current = moved > 0 ? moved : moved / 6;
    setDy(shift.current);
  };

  const end = () => {
    if (!active.current) return;
    active.current = false;
    const speed = shift.current / Math.max(1, Date.now() - startAt.current);
    setSnap(true);
    if (shift.current > CLOSE_DISTANCE || speed > CLOSE_VELOCITY) {
      onClose();
      return;
    }
    shift.current = 0;
    setDy(0);
  };

  return {
    // на шапку листа
    handlers: { onTouchStart: start, onTouchMove: move, onTouchEnd: end, onTouchCancel: end },
    // на саму панель
    style: dy ? { transform: `translateY(${Math.max(0, dy)}px)` } : undefined,
    className: snap ? 'sheet-snap' : '',
  };
}
