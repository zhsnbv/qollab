import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReviewMessageMenu from '../gallery/reaction-picker/ReviewMessageMenu';
import EmojiPicker from '../gallery/reaction-picker/EmojiPicker';
import { MobileActivityScreen, MobileActivitySummary } from './MobileMessageActivity';
import { normalizeMessageActivity } from './messageActivityModel';
import '../gallery/reaction-picker/ReactionPickerReview.css';
import './MobileMessageMenu.css';

// The real chats and handoff share one menu, activity list, and full emoji picker.
export default function MobileMessageMenu({ selected, onClose, onReact, activity: activityInput, initialView = 'menu', capture = false, ...menu }) {
  const [expanded, setExpanded] = useState(false);
  const [activityOpen, setActivityOpen] = useState(initialView === 'activity');
  const [closing, setClosing] = useState(false);
  const pending = useRef(null);
  const root = useRef(null);
  const activity = normalizeMessageActivity({...activityInput, mine: menu.mine === true});
  const canOpenActivity = activity.people.length > 0;
  const activityKey = [activity.label, activity.personalReadAt || '', activityOpen].join('|');

  useLayoutEffect(() => {
    const siblings = [...root.current.parentElement.children].filter(el => el !== root.current);
    const original = siblings.map(el => el.inert);
    const previousFocus = document.activeElement;
    siblings.forEach(el => { el.inert = true; });
    return () => {
      siblings.forEach((el, i) => { el.inert = original[i]; });
      if (!capture) requestAnimationFrame(() => {
        const target = previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : menu.node;
        target?.focus?.({preventScroll:true});
      });
    };
  }, [capture, menu.node]);

  useLayoutEffect(() => {
    if (expanded || activityOpen || !menu.node) return;
    const previous = menu.node.style.visibility;
    menu.node.style.visibility = 'hidden';
    return () => { menu.node.style.visibility = previous; };
  }, [expanded, activityOpen, menu.node]);

  useEffect(() => {
    if (!closing) return;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260;
    const timer = setTimeout(() => {
      if (pending.current !== null) onReact(pending.current);
      else onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [closing, onReact, onClose]);

  useEffect(() => {
    if (capture) return;
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (expanded) setClosing(true);
      else onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [expanded, capture, onClose]);

  const trapFocus = event => {
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const targets = [...root.current.querySelectorAll('button:not([disabled]), [tabindex="0"], input')].filter(el => el.getClientRects().length > 0 && el.tabIndex >= 0 && !el.closest('[inert], [aria-hidden="true"]'));
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const close = () => { if (!closing) setClosing(true); };
  const choose = emoji => {
    if (closing) return;
    pending.current = emoji;
    setClosing(true);
  };

  return <div ref={root} className="rp-stage mobile-reaction-menu" role={expanded ? undefined : "dialog"} aria-modal={expanded ? undefined : true}
    aria-label={expanded ? 'Все реакции' : activityOpen && canOpenActivity ? activity.title : 'Меню сообщения'} onKeyDown={trapFocus} data-capture={capture || undefined}>
    <button className={`rp-picker-scrim ${closing ? 'is-closing' : ''}`} aria-label="Закрыть меню" tabIndex={-1} onClick={expanded ? close : onClose} />
    {expanded ? <div className="rp-picker-position">
      <EmojiPicker platform="mobile" selected={selected} onSelect={choose} onClose={close}
        closing={closing} messageText={menu.msg.text || 'Вложение'} />
    </div> : activityOpen && canOpenActivity ? <MobileActivityScreen activity={activity} capture={capture} onBack={onClose} /> :
      <ReviewMessageMenu {...menu} platform="mobile" selected={selected} backdrop={false} capture={capture}
        activityKey={activityKey} activitySlot={<MobileActivitySummary activity={activity} onOpen={() => setActivityOpen(true)} />}
        onClose={onClose} onReact={onReact} onExpand={() => setExpanded(true)} />}
  </div>;
}
