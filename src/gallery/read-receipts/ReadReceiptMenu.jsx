import { useLayoutEffect, useRef, useState } from 'react';
import { Checks, CaretRight, HeartStraight } from '@phosphor-icons/react';
import { ArrowReply24Regular, Copy24Regular, Edit24Regular, Pin24Regular, Share24Regular, Delete24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { REACTIONS } from '../../components/MessageMenu';
import { mobileMenuGeometry } from '../reaction-picker/menuGeometry';
import '../../components/MessageMenu.css';

// Isolated QM-2604 menu. Shared menus remain available to concurrent QM-2611 work.
export default function ReadReceiptMenu({ msg, rect, node, summary, personal, combined, onClose, onReaders, onAction, capture }) {
  const root = useRef(null), copy = useRef(null), reactions = useRef(null), list = useRef(null);
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    if (!node || !root.current) return;
    copy.current.replaceChildren(node.cloneNode(true));
    const stage = root.current.getBoundingClientRect(), row = node.getBoundingClientRect();
    const bubble = node.querySelector('.msg-bubble');
    const bounds = bubble?.getBoundingClientRect() || rect;
    const geometry = mobileMenuGeometry({ originalTop: bounds.top - stage.top, bubbleHeight: bounds.height, stageHeight: stage.height, reactionHeight: reactions.current.offsetHeight, listHeight: list.current.scrollHeight });
    setBox({ ...geometry, rowTop: row.top - stage.top + geometry.shift, rowLeft: row.left - stage.left, rowWidth: row.width });
  }, [rect, node, summary]);
  const ready = !!box;
  useLayoutEffect(() => { if (!capture && ready) list.current?.querySelector('button')?.focus({ preventScroll: true }); }, [ready, capture]);
  const items = [
    ['reply', 'Ответить', ArrowReply24Regular], ['copy', 'Копировать', Copy24Regular],
    ...(msg.mine ? [['edit', 'Изменить', Edit24Regular]] : []),
    ['pin', 'Закрепить', Pin24Regular], ['forward', 'Переслать', Share24Regular],
    ['delete', 'Удалить', Delete24Regular], ['select', 'Выбрать', CheckmarkCircle24Regular],
  ];
  const keyDown = event => {
    if (event.key !== 'Tab') return;
    const buttons = [...root.current.querySelectorAll('.rr-menu-reactions button, .rr-menu-list button')];
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return <div className="msgmenu-wrap rr-menu" ref={root} data-ready={box ? 'yes' : 'no'} onKeyDown={keyDown} role="dialog" aria-modal="true" aria-label="Меню сообщения">
    <button className="msgmenu-scrim" onClick={onClose} aria-label="Закрыть меню" tabIndex={-1} />
    <div className="msgmenu-source" ref={copy} aria-hidden="true" style={box ? { top: box.rowTop, left: box.rowLeft, width: box.rowWidth } : undefined} />
    <div className="msgmenu-reactions rr-menu-reactions" ref={reactions} style={box ? { top: box.reactTop } : undefined}>
      {REACTIONS.map(emoji => <button key={emoji} className="msgmenu-reaction" aria-label={`Реакция ${emoji}`} onClick={() => onAction(`Реакция ${emoji}`)}>{emoji}</button>)}
    </div>
    <div className="msgmenu-list rr-menu-list" ref={list} style={box ? { top: box.listTop, maxHeight: box.listMax } : undefined}>
      {summary && (personal ? <div className="rr-summary rr-summary-static" aria-label={`Прочитано: ${summary}`}>
        <Checks size={18} aria-hidden="true" /><span>{summary}</span>
      </div> : <button className="rr-summary" onClick={onReaders} aria-label={summary}>
        {combined ? <HeartStraight size={18} aria-hidden="true" /> : <Checks size={18} aria-hidden="true" />}<span>{summary}</span><CaretRight size={14} weight="bold" aria-hidden="true" />
      </button>)}
      {items.map(([id, label, Icon]) => <button key={id} className={`msgmenu-item ${id === 'delete' ? 'danger' : ''} ${id === 'select' ? 'divided' : ''}`} onClick={() => onAction(label)}><Icon /><span>{label}</span></button>)}
    </div>
  </div>;
}
