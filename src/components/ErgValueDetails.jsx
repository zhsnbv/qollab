import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Portal from './Portal';
import useSheetSwipe from '../utils/useSheetSwipe';
import './ErgValueDetails.css';

const VALUES = {
  safety: {
    title: 'Безопасность',
    text: 'Мы ставим безопасное поведение превыше всего. Мы обеспечиваем все условия труда нашим сотрудникам и подрядчикам, постоянно работаем над предотвращением всех видов травматизма.',
  },
  unity: {
    title: 'Единство',
    text: 'Мы работаем как одна неравнодушная команда — вместе двигаемся к достижению поставленных целей, мы с уважением относимся к культурным традициям в регионах присутствия.',
  },
  responsibility: {
    title: 'Ответственность',
    text: 'Мы выполняем взятые на себя обязательства перед нашими сотрудниками, их семьями, клиентами, партнёрами, акционерами и обществом. Мы ответственно относимся к вверенным нам ресурсам и окружающей среде. Мы строим культуру взаимного доверия и уважения в группе, а также с партнёрами и клиентами.',
  },
  development: {
    title: 'Развитие',
    text: 'Мы ценим наших людей и создаем условия для их развития. Мы рационально внедряем новые технологии и развиваемся как организация. Мы обеспечиваем устойчивое развитие группы.',
  },
  efficiency: {
    title: 'Эффективность',
    text: 'Мы работаем ради результата, а не ради работы. Достигая результата, мы бережно относимся к своим ресурсам. Мы отдаем приоритет тому, что имеет наибольшее значение. Мы минимизируем усилия, которые не приносят ценности.',
  },
};

export default function ErgValueDetails({ valueId, trigger, onClose, web = false, dark = false }) {
  const value = VALUES[valueId];
  const layer = useRef(null);
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  const textId = useId();
  const swipe = useSheetSwipe(onClose);

  useEffect(() => {
    if (!value) return undefined;
    const host = layer.current.parentElement;
    const siblings = [...host.children].filter(node => node !== layer.current);
    const saved = siblings.map(node => [node, node.inert]);
    saved.forEach(([node]) => { node.inert = true; });
    const scrollRoot = web ? document.documentElement : host.querySelector('.scroll-area');
    const overflow = scrollRoot?.style.overflow;
    if (scrollRoot) scrollRoot.style.overflow = 'hidden';
    panel.current.focus();
    const keyboard = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        // The content is informational; the close control is the sole tab stop.
        e.preventDefault();
        panel.current.querySelector('button').focus();
      }
    };
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('keydown', keyboard, true);
      saved.forEach(([node, inert]) => { node.inert = inert; });
      if (scrollRoot) scrollRoot.style.overflow = overflow;
      requestAnimationFrame(() => {
        const target = trigger?.isConnected ? trigger : host.querySelector(`[data-erg-value="${valueId}"]`);
        target?.focus({ preventScroll: true });
      });
    };
  }, [value, valueId, trigger, web]);

  if (!value) return null;
  const glyph = ['safety', 'unity', 'efficiency'].includes(valueId);
  const content = <div ref={layer} className={`erg-detail-layer ${web ? 'erg-detail-layer--web' : ''}${web && dark ? ' erg-detail-layer--dark' : ''}`}>
    <div className="erg-detail-backdrop" onClick={onClose} aria-hidden="true" />
    <section ref={panel} className={`erg-detail-panel ${!web ? swipe.className : ''}`} style={!web ? swipe.style : undefined}
      role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={textId} tabIndex={-1}>
      <div className="erg-detail-hero" {...(!web ? swipe.handlers : {})}>
        <img className="erg-detail-art" src="/img/erg/value-detail-hero.png" width="402" height="238" alt="" />
        <img className={`erg-detail-glyph ${glyph ? '' : 'erg-detail-glyph--small'}`} src={`/img/erg/${valueId}${glyph ? '-glyph' : ''}.svg`} alt="" />
        {!web && <span className="erg-detail-grab" />}
      </div>
      <button type="button" className="erg-detail-close" onClick={onClose} aria-label="Закрыть">×</button>
      <div className="erg-detail-copy">
        <h2 id={titleId}>{value.title}</h2>
        <p id={textId}>{value.text}</p>
      </div>
      {!web && <div className="erg-detail-safe-area" />}
    </section>
  </div>;
  return web ? createPortal(content, document.body) : <Portal>{content}</Portal>;
}
