import { useRef, useState } from 'react';

// Общий драг-реордер для списков настроек: избранные сервисы и виджеты
// переставляются одинаково, поэтому логика живёт в одном месте.
// Драг-реордер указателем: тащим за ручку (DotsSixVertical), список
// переупорядочивается «на лету» — как только палец/курсор проходит середину
// соседней строки. FLIP-анимацию соседей не делаем (не критично для этого
// объёма списка) — едет плавно только сама перетаскиваемая строка.
export function useReorder(count, setList) {
  const rowRefs = useRef([]);
  const drag = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragY, setDragY] = useState(0);

  const onPointerDown = (index) => (e) => {
    e.preventDefault();
    const height = rowRefs.current[index]?.getBoundingClientRect().height || 64;
    drag.current = { from: index, current: index, startY: e.clientY, height };
    setDragIndex(index);
    setDragY(0);

    const move = (ev) => {
      if (!drag.current) return;
      const delta = ev.clientY - drag.current.startY;
      setDragY(delta);
      const shift = Math.round(delta / drag.current.height);
      const target = Math.min(count - 1, Math.max(0, drag.current.from + shift));
      const from = drag.current.current;
      // from/target — обычные числа, а не drag.current, захватываем их в
      // замыкание: апдейтер setList React может вызвать отложенно
      // (после следующего pointermove/up), и к этому моменту drag.current
      // уже обнулён обработчиком up — обращение к нему падало с
      // «Cannot read properties of null».
      if (target !== from) {
        drag.current.current = target;
        setList((list) => {
          const next = [...list];
          const [moved] = next.splice(from, 1);
          next.splice(target, 0, moved);
          return next;
        });
      }
    };
    const up = () => {
      drag.current = null;
      setDragIndex(null);
      setDragY(0);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return { rowRefs, dragIndex, dragY, onPointerDown };
}
