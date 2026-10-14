import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowBendUpLeft, CaretRight, Checks, CheckCircle, Copy, PencilSimple, Plus, PushPin, Share, Smiley, Trash, X } from '@phosphor-icons/react';
import EmojiPicker from '../../reaction-picker/EmojiPicker';
import { activityLabel, messageActivity, shortTime, formatTime } from '../../reaction-details/reactionDetailsModel';
import './WebMessageMenu.css';

const quickReactions = ['❤️', '👍', '😂', '👌', '😮', '🙏'];
function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  return <span className="qwm-avatar">{user.avatar && !failed ? <img src={user.avatar} alt="" onError={() => setFailed(true)} /> : user.initials || user.name?.split(' ').slice(0, 2).map(part => part[0]).join('') || '?'}</span>;
}

// The layer is positioned inside its parent: a real portal viewport or a handoff stage.
export default function WebMessageMenu({ message, reactions = [], readEntries = [], personal = false, position = { x: 12, y: 12 }, onClose, onReact, onAction, capture = false, initialDetails = false, allowDelete = message.mine, now = new Date() }) {
  const layer = useRef(null), stack = useRef(null), summary = useRef(null), popover = useRef(null), more = useRef(null), closeTimer = useRef(null), pickerAnchor = useRef(null);
  const id = useId();
  const [box, setBox] = useState(null), [details, setDetails] = useState(initialDetails), [flyout, setFlyout] = useState(null), [picker, setPicker] = useState(false), [pickerBox, setPickerBox] = useState(null);
  const allowedReads = personal ? [] : readEntries;
  const label = activityLabel(reactions, allowedReads, Boolean(message.mine));
  const entries = messageActivity(reactions, allowedReads, Boolean(message.mine));
  const title = reactions.length ? (message.mine && allowedReads.length ? 'Реакции и просмотры' : 'Реакции') : 'Просмотры';
  const keepOpen = () => clearTimeout(closeTimer.current);
  const hideSoon = () => { keepOpen(); closeTimer.current = setTimeout(() => { if (!popover.current?.contains(document.activeElement)) setDetails(false); }, 180); };
  const reveal = () => { keepOpen(); setDetails(true); };
  const hideDetails = () => { keepOpen(); setDetails(false); summary.current?.focus({ preventScroll: true }); };
  const closePicker = () => { setPicker(false); requestAnimationFrame(() => more.current?.focus({ preventScroll: true })); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useLayoutEffect(() => {
    const container = layer.current;
    const place = () => {
      if (!stack.current || !container) return;
      setBox({ left: Math.max(8, Math.min(position.x, container.clientWidth - stack.current.offsetWidth - 8)), top: Math.max(8, Math.min(position.y, container.clientHeight - stack.current.offsetHeight - 8)) });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [position.x, position.y, label, picker]);
  useLayoutEffect(() => {
    if (!details || !box || !popover.current || !summary.current) return;
    const container = layer.current, bounds = stack.current.getBoundingClientRect(), row = summary.current.getBoundingClientRect();
    const scale = bounds.width / stack.current.offsetWidth;
    const side = box.left + stack.current.offsetWidth + 6 + 288 <= container.clientWidth - 8 ? 'right' : 'left';
    const top = Math.max(8 - box.top, Math.min((row.top - bounds.top) / scale, container.clientHeight - box.top - popover.current.offsetHeight - 8));
    const proposedLeft = box.left + (side === 'right' ? stack.current.offsetWidth + 6 : -294);
    const left = Math.max(8, Math.min(proposedLeft, container.clientWidth - 296)) - box.left;
    setFlyout({ side, top, left });
  }, [details, box, reactions.length, readEntries.length]);
  useEffect(() => { if (!capture) stack.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true }); }, [capture]);
  const openPicker = () => {
    const container = layer.current;
    setDetails(false);
    const width = Math.min(376, container.clientWidth - 16), height = Math.min(476, container.clientHeight - 16);
    setPickerBox({ left: Math.max(8, Math.min(box.left + 232 - width, container.clientWidth - width - 8)), top: Math.max(8, Math.min(box.top, container.clientHeight - height - 8)), width, height });
    setPicker(true);
  };
  const movePicker = position => setPickerBox(previous => ({ ...previous, ...position }));
  const navigate = event => {
    if (picker) return;
    if (event.key === 'Escape' || (event.key === 'ArrowLeft' && details)) { event.preventDefault(); event.stopPropagation(); if (details) hideDetails(); else onClose(); return; }
    if (event.key === 'ArrowRight' && event.target === summary.current) { event.preventDefault(); reveal(); requestAnimationFrame(() => popover.current?.querySelector('[tabindex="0"]')?.focus()); return; }
    if (event.target.closest('.qwm-activity') && event.key !== 'Tab') return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    const items = [...stack.current.querySelectorAll('button, [tabindex="0"]')];
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey) ? -1 : 1) + items.length) % items.length;
    items[next]?.focus({ preventScroll: true });
  };
  const actions = [
    ['reply', 'Ответить', ArrowBendUpLeft], ['copy', 'Копировать', Copy],
    ...(message.mine && message.text ? [['edit', 'Изменить', PencilSimple]] : []),
    ['pin', message.pinned ? 'Открепить' : 'Закрепить', PushPin], ['forward', 'Переслать', Share],
    ...(allowDelete ? [['delete', 'Удалить', Trash]] : []), ['select', message.selected ? 'Снять выбор' : 'Выбрать', CheckCircle],
  ];
  return <div className="qwm-layer rp-conversation" ref={layer} onKeyDown={navigate}>
    <button type="button" className="qwm-dismiss" aria-label="Закрыть меню" tabIndex={-1} onClick={onClose} />
    <div className="qwm-stack" ref={stack} style={box || { visibility: 'hidden' }} hidden={picker}>
      <div className="qwm-quick" aria-label="Быстрые реакции">{quickReactions.map(emoji => <button type="button" key={emoji} aria-label={`Реакция ${emoji}`} aria-pressed={reactions.some(item => item.user.id === 'me' && item.emoji === emoji)} onClick={() => onReact(emoji)}>{emoji}</button>)}<button type="button" ref={more} aria-label="Все эмодзи" onClick={openPicker}><Plus size={18} /></button></div>
      <div className="qwm-menu" role="menu" aria-label="Меню сообщения">
        {personal && message.mine && readEntries.length > 0 && <div className="qwm-personal-read" aria-label={`Прочитано ${formatTime(readEntries[0].createdAt, now)}`}><Checks size={16} /><time dateTime={readEntries[0].createdAt}>{shortTime(readEntries[0].createdAt, now)}</time></div>}
        {label && <div className="qwm-meta"><button type="button" className="qwm-meta-row" role="menuitem" ref={summary} aria-haspopup="true" aria-expanded={details} aria-controls={details ? id : undefined} onMouseEnter={reveal} onMouseLeave={hideSoon} onClick={reveal}>
          {reactions.length ? <Smiley size={16} /> : <Checks size={16} />}<span>{label}</span><CaretRight size={12} />
        </button></div>}
        {actions.map(([key, text, Icon]) => <button type="button" role="menuitem" className={`qwm-action ${key === 'delete' ? 'qwm-danger' : ''} ${key === 'select' ? 'qwm-separated' : ''}`} key={key} onMouseEnter={() => setDetails(false)} onClick={() => onAction(key)}><Icon size={16} /><span>{text}</span></button>)}
      </div>
      {details && label && <div className={`qwm-flyout qwm-flyout--${flyout?.side || 'left'}`} style={{ top: flyout?.top ?? 44, ...(flyout ? { left: flyout.left, right: 'auto' } : {}) }} onMouseEnter={keepOpen} onMouseLeave={hideSoon}>
        <section className="qwm-activity" ref={popover} id={id} aria-label={title}>
          <header className="qwm-activity-head"><h2>{title}</h2><span>{entries.length}</span><button type="button" onClick={hideDetails} aria-label="Закрыть список"><X size={16} /></button></header>
          <div className="qwm-list-scroll" tabIndex={0} aria-label="Участники и время"><ul>{entries.map(({ user, reactions: userReactions, readAt }) => <li key={user.id}>
            <Avatar user={user} /><div className="qwm-person-text"><strong title={user.name}>{user.name}</strong><div className="qwm-person-times">
              {userReactions.length > 0 && <span title={`Реакция: ${formatTime(userReactions[0].createdAt, now)}`}><Smiley size={12} /><time dateTime={userReactions[0].createdAt}>{shortTime(userReactions[0].createdAt, now)}</time></span>}
              {readAt && <span title={`Прочитано: ${formatTime(readAt, now)}`}><Checks size={13} /><time dateTime={readAt}>{shortTime(readAt, now)}</time></span>}
            </div></div>{userReactions.length > 0 ? <span className="qwm-person-emoji" aria-label={`Реакции: ${userReactions.map(item => item.emoji).join(' ')}`}>{userReactions.map(item => item.emoji).join('')}</span> : <Checks size={17} className="qwm-read-check" />}
          </li>)}</ul></div>
        </section>
      </div>}
    </div>
    {picker && <div className="qwm-picker-position" ref={pickerAnchor} style={pickerBox}><EmojiPicker platform="web" selected={reactions.find(item => item.user.id === 'me')?.emoji} onSelect={onReact} onClose={closePicker} onMove={movePicker} messageText={message.text || 'Вложение'} /></div>}
  </div>;
}
