import { useEffect } from 'react';

// Высота каркаса привязывается к видимой области (visualViewport), а не к
// 100dvh: на iOS клавиатура dvh не уменьшает, поэтому нижняя часть экрана —
// вместе с полем ввода — оставалась под клавиатурой. Теперь при её появлении
// каркас физически становится ниже, и панель ввода поднимается сама, без
// компенсирующих отступов.
//
// Ставим переменные один раз на весь документ: каркас общий для всех экранов.
export function useViewportFit() {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!vv) return undefined;

    let raf;
    const apply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // offsetTop вычитать нельзя: при сдвиге страницы он «съедает» высоту
        // клавиатуры, и компенсация перестаёт срабатывать.
        const kb = Math.max(0, window.innerHeight - vv.height);
        root.style.setProperty('--vvh', `${vv.height}px`);
        // Каркас сдвигаем вслед за видимой областью: если iOS увёл страницу
        // вверх к полю ввода, без этого низ каркаса уезжает под клавиатуру.
        root.style.setProperty('--vvtop', `${vv.offsetTop}px`);
        root.style.setProperty('--kb', `${kb}px`);
        root.classList.toggle('kb', kb > 80);
        // Страницу держим прибитой: иначе iOS уводит её вверх вслед за фокусом
        window.scrollTo(0, 0);
      });
    };

    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--vvh');
      root.style.removeProperty('--kb');
      root.classList.remove('kb');
    };
  }, []);
}

// Экраны с лентой сообщений дополнительно прокручиваются к последнему
// сообщению, когда клавиатура открылась.
export function useKeyboardInset(scrollRef) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onChange = () => {
      const b = scrollRef?.current;
      if (b) requestAnimationFrame(() => { b.scrollTop = b.scrollHeight; });
    };
    vv.addEventListener('resize', onChange);
    return () => vv.removeEventListener('resize', onChange);
  }, [scrollRef]);
}
