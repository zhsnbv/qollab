import { useEffect } from 'react';

// Компенсация клавиатуры iOS в полноэкранных/боттом-шит слоях: сжимаем окно
// на высоту клавиатуры (--kb) и гасим нативный pan вьюпорта, чтобы верх
// оставался прибитым к месту. Слушаем И resize (конец анимации клавиатуры),
// И scroll (сам процесс авто-скролла к полю ввода) — иначе между фокусом на
// инпуте и концом анимации верх на мгновение «уезжает», а потом дёргается
// на место, а внизу до появления клавиатуры остаётся пустой зазор.
export function useKeyboardInset(scrollRef) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let raf;
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kb = Math.max(0, window.innerHeight - vv.height);
        document.documentElement.style.setProperty('--kb', `${kb}px`);
        document.documentElement.classList.toggle('kb', kb > 0);
        window.scrollTo(0, 0);
        const b = scrollRef?.current;
        if (b) b.scrollTop = b.scrollHeight;
      });
    };
    vv.addEventListener('resize', onChange);
    vv.addEventListener('scroll', onChange);
    return () => {
      vv.removeEventListener('resize', onChange);
      vv.removeEventListener('scroll', onChange);
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty('--kb');
      document.documentElement.classList.remove('kb');
    };
  }, [scrollRef]);
}
