import { useCallback, useState } from 'react';

// Тень под шапкой появляется, как только контент уехал вверх. Отдельным хуком,
// потому что у каждого экрана свой скролл-контейнер, а поведение общее.
// Экранам, где шапку и без того отделяет бордер, тень не нужна — там хук
// просто не используется (иначе линия и тень дублируют друг друга).
export function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback((e) => {
    setScrolled(e.currentTarget.scrollTop > 2);
  }, []);
  return [scrolled, onScroll];
}
