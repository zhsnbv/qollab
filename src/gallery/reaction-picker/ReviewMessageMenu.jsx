import { useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowReply24Regular, Copy24Regular, Edit24Regular, Pin24Regular, PinOff24Regular,
  Share24Regular, Delete24Regular, CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
import '../../components/MessageMenu.css';
import { Plus } from '@phosphor-icons/react';
import { REACTIONS } from '../../components/MessageMenu';
import { mobileMenuGeometry } from './menuGeometry';

// Mobile moves a copy only as far as needed to fit both panels.
// Desktop anchors the panels to the cursor and leaves the message in place.
// Review-only copy of the current menu; the main chat flow is unchanged.

const GAP = 10;  // просвет между сообщением и панелями
const EDGE = 12; // минимальный отступ от краёв экрана


export default function ReviewMessageMenu({ msg, mine, rect, node, onClose, onAction, onReact, onExpand, selected, platform, pointer }) {
  const wrapRef = useRef(null);
  const cloneRef = useRef(null);
  const reactRef = useRef(null);
  const listRef = useRef(null);
  // Пока не измерили сцену, содержимое не показываем: иначе первый кадр
  // отрисовался бы в углу и панели дёрнулись бы на место.
  const [box, setBox] = useState(null);

  const side = mine ? 'right' : 'left';

  const items = [
    { id: 'reply', label: 'Ответить', Icon: ArrowReply24Regular },
    { id: 'copy', label: 'Скопировать', Icon: Copy24Regular },
    // Правим только текст: у своих отправленных сообщений kind === 'text',
    // поэтому проверка «нет kind» прятала «Изменить» как раз там, где оно нужно
    ...(mine && msg.kind !== 'photo' && msg.kind !== 'video'
      ? [{ id: 'edit', label: 'Изменить', Icon: Edit24Regular }] : []),
    {
      id: 'pin',
      label: msg.pinned ? 'Открепить' : 'Закрепить',
      Icon: msg.pinned ? PinOff24Regular : Pin24Regular,
    },
    { id: 'forward', label: 'Переслать', Icon: Share24Regular },
    { id: 'delete', label: 'Удалить', Icon: Delete24Regular, danger: true },
    { id: 'select', label: 'Выбрать', Icon: CheckmarkCircle24Regular, divided: true },
  ];

  // Keep the original row geometry; its external margin is not part of its box.
  useLayoutEffect(() => {
    if (platform === 'mobile' && node && cloneRef.current) {
      cloneRef.current.replaceChildren(node.cloneNode(true));
    }
  }, [node, platform]);

  useLayoutEffect(() => {
    if (!rect || !wrapRef.current) return;
    const stage = wrapRef.current.getBoundingClientRect();
    const row = node ? node.getBoundingClientRect() : rect;
    const bubbleNode = node?.querySelector('.msg-bubble, .msg-document');
    const measured = bubbleNode?.getBoundingClientRect() || rect;
    const bubble = bubbleNode ? { ...measured.toJSON(), top: row.top + (node.querySelector('.msg-col')?.offsetTop || 0) + bubbleNode.offsetTop, height: bubbleNode.offsetHeight } : measured;
    const reactH = reactRef.current?.offsetHeight || 0;
    const listH = listRef.current?.scrollHeight || 0;
    const reactW = reactRef.current?.offsetWidth || 328;
    if (platform === 'web') {
      const x = pointer?.x ?? bubble.right - stage.left;
      const y = pointer?.y ?? bubble.top - stage.top;
      const height = reactH + GAP + listH;
      const left = Math.max(EDGE, Math.min(stage.width - EDGE - reactW, x + 8));
      const top = Math.max(EDGE, Math.min(stage.height - EDGE - height, y + 8));
      setBox({ left, top, origin: x > left + reactW / 2 ? 'right top' : 'left top', listMax: Math.min(listH, stage.height - EDGE * 2 - reactH - GAP) });
      return;
    }
    const originalTop = bubble.top - stage.top;
    const geometry = mobileMenuGeometry({ originalTop, bubbleHeight: bubble.height, stageHeight: stage.height, reactionHeight: reactH, listHeight: listH });
    setBox({
      ...geometry,
      left: Math.max(EDGE, Math.min(bubble.left - stage.left, stage.width - EDGE - reactW)),
      rowTop: row.top - stage.top + geometry.shift,
      rowLeft: row.left - stage.left,
      rowWidth: row.width,
    });
  }, [rect, node, msg.id, platform, pointer]);

  const mobile = platform === 'mobile';
  const offset = box ? { left: `${box.left}px` } : undefined;

  return (
    <div className={`msgmenu-wrap rp-context-menu rp-context-menu--${platform}`} ref={wrapRef} data-ready={box ? 'yes' : 'no'} data-shift={box?.shift || 0} data-cursor-x={pointer?.x} data-cursor-y={pointer?.y}>
      <button className="msgmenu-scrim" onClick={onClose} aria-label="Закрыть" />

      <div className="rp-menu-group" style={box ? mobile
        ? { '--rp-start-y': `${-box.shift}px` }
        : { left: `${box.left}px`, top: `${box.top}px`, '--rp-origin': box.origin } : undefined}>
      {/* Mobile lifts an exact copy; desktop keeps the original bubble in place. */}
      {mobile && <div
        className="msgmenu-source"
        ref={cloneRef}
        aria-hidden="true"
        style={box ? { top: `${box.rowTop}px`, left: `${box.rowLeft}px`, width: `${box.rowWidth}px` } : undefined}
      />}

      <div
        className={`msgmenu-reactions msgmenu--${side}`}
        ref={reactRef}
        style={box && mobile ? { top: `${box.reactTop}px`, ...offset } : undefined}
        data-ready={box ? 'yes' : 'no'}
      >
        {REACTIONS.map((r) => (
          <button className="msgmenu-reaction" aria-pressed={selected === r} key={r} onClick={() => onReact(r)} aria-label={`Реакция ${r}`}>
            <span>{r}</span>
          </button>
        ))}
        <button className="msgmenu-reaction rp-more" onClick={onExpand} aria-label="Все реакции" title="Все реакции"><Plus size={24} /></button>
      </div>

      <div
        className={`msgmenu-list msgmenu--${side}`}
        ref={listRef}
        style={box ? { ...(mobile ? { top: `${box.listTop}px`, ...offset } : {}), maxHeight: `${box.listMax}px` } : undefined}
        data-ready={box ? 'yes' : 'no'}
      >
        {items.map(({ id, label, Icon, danger, divided }) => (
          <button
            className={`msgmenu-item ${danger ? 'danger' : ''} ${divided ? 'divided' : ''}`}
            key={id}
            onClick={() => onAction(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
