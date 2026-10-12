import { useEffect, useId, useRef } from 'react';
import Portal from '../../components/Portal';
import SheetTop from '../../components/SheetTop';
import useSheetSwipe from '../../utils/useSheetSwipe';
import { pushScrim, popScrim } from '../../utils/scrim';

export default function MobileSheet({ title, onClose, children, tall = false, className = '', variant = 'review' }) {
  const app = variant === 'app';
  const root = useRef(null), titleId = useId(), swipe = useSheetSwipe(onClose);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => { if (app) { pushScrim(); return popScrim; } }, [app]);
  useEffect(() => {
    const previous = document.activeElement;
    const element = root.current;
    element.querySelector('.sheet-close')?.focus({ preventScroll: true });
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const targets = [...element.querySelectorAll('button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]')].filter(node => node.getClientRects().length);
      const first = targets[0], last = targets.at(-1);
      if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); requestAnimationFrame(() => { if (previous?.isConnected) previous.focus({ preventScroll: true }); }); };
  }, []);
  return <Portal><div className={`${app ? 'comments-overlay open app-publication-sheet' : 'pm-sheet-overlay'} pm-publications pw-app`} onClick={onClose}>
    <section ref={root} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`${app ? 'comments-sheet' : 'pm-sheet'} ${tall ? (app ? 'comments-sheet--tall' : 'pm-sheet--tall') : ''} ${className} ${swipe.className}`} style={swipe.style} onClick={event => event.stopPropagation()}>
      <SheetTop onClose={onClose} swipe={swipe}><h2 className={app ? 'comments-title' : undefined} id={titleId}>{title}</h2></SheetTop>
      {children}
    </section>
  </div></Portal>;
}
