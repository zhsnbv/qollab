import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReviewMessageMenu from '../gallery/reaction-picker/ReviewMessageMenu';
import EmojiPicker from '../gallery/reaction-picker/EmojiPicker';
import '../gallery/reaction-picker/ReactionPickerReview.css';
import './MobileMessageMenu.css';

// Use the approved picker in real chats, retaining the chat's action handlers.
export default function MobileMessageMenu({ selected, onClose, onReact, ...menu }) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const pending = useRef(null);
  const root = useRef(null);

  useLayoutEffect(() => {
    const siblings = [...root.current.parentElement.children].filter(el => el !== root.current);
    const original = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    return () => siblings.forEach((el, i) => { el.inert = original[i]; });
  }, []);

  useLayoutEffect(() => {
    if (expanded || !menu.node) return;
    const previous = menu.node.style.visibility;
    menu.node.style.visibility = 'hidden';
    return () => { menu.node.style.visibility = previous; };
  }, [expanded, menu.node]);

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
    const escape = event => {
      if (event.key !== 'Escape') return;
      if (expanded) setClosing(true);
      else onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [expanded, onClose]);

  const close = () => { if (!closing) setClosing(true); };
  const choose = emoji => {
    if (closing) return;
    pending.current = emoji;
    setClosing(true);
  };

  return <div ref={root} className="rp-stage mobile-reaction-menu">
    <button className={`rp-picker-scrim ${closing ? 'is-closing' : ''}`} aria-label="Закрыть реакции" onClick={expanded ? close : onClose} />
    {expanded ? <>
      <div className="rp-picker-position">
        <EmojiPicker platform="mobile" selected={selected} onSelect={choose} onClose={close}
          closing={closing} messageText={menu.msg.text || 'Вложение'} />
      </div>
    </> : <ReviewMessageMenu {...menu} platform="mobile" selected={selected} backdrop={false}
      onClose={onClose} onReact={onReact} onExpand={() => setExpanded(true)} />}
  </div>;
}
