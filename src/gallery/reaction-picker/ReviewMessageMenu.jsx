import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
// Shared by the live mobile chats and their handoff scenes.

const GAP = 10;  // просвет между сообщением и панелями
const EDGE = 12; // минимальный отступ от краёв экрана


export default function ReviewMessageMenu({ msg, mine, rect, node, onClose, onAction, onReact, onExpand, selected, platform, pointer, backdrop = true, activitySlot, activityKey, capture = false }) {
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
    { id: 'copy', label: 'Копировать', Icon: Copy24Regular },
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

  useLayoutEffect(() => {
    if (platform !== 'mobile' || !node || !cloneRef.current) return;
    const clone = node.cloneNode(true);
    clone.style.visibility = 'visible';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.inert = true;
    // Preserve the actual text wrap when the copy leaves the chat's flex layout.
    const column = node.querySelector('.msg-col');
    const clonedColumn = clone.querySelector('.msg-col');
    if (column && clonedColumn) {
      // offsetWidth rounds down fractional pixels and can wrap one more line.
      clonedColumn.style.width = getComputedStyle(column).width;
      clonedColumn.style.maxWidth = 'none';
      clonedColumn.style.flex = '0 0 auto';
    }
    cloneRef.current.replaceChildren(clone);
  }, [node, platform]);

  useLayoutEffect(() => {
    if (!rect || !wrapRef.current) return;
    const measure = () => {
      const root = wrapRef.current;
      const stage = root.getBoundingClientRect();
      const scaleX = stage.width / root.offsetWidth || 1;
      const scaleY = stage.height / root.offsetHeight || 1;
      const local = value => ({
        top: (value.top - stage.top) / scaleY,
        left: (value.left - stage.left) / scaleX,
        right: (value.right - stage.left) / scaleX,
        width: value.width / scaleX, height: value.height / scaleY,
      });
      const row = local(node?.getBoundingClientRect() || rect);
      const content = local(node?.querySelector('.msg-col')?.getBoundingClientRect() || rect);
      const bubble = local(node?.querySelector('.msg-bubble, .msg-document')?.getBoundingClientRect() || rect);
      const reactH = reactRef.current?.offsetHeight || 0;
      const listH = listRef.current?.scrollHeight || 0;
      const reactW = reactRef.current?.offsetWidth || 328;
      const listW = listRef.current?.offsetWidth || 232;
      const width = root.clientWidth, height = root.clientHeight;
      if (platform === 'web') {
        const x = pointer?.x ?? bubble.right;
        const y = pointer?.y ?? bubble.top;
        const left = Math.max(EDGE, Math.min(width - EDGE - reactW, x + 8));
        const top = Math.max(EDGE, Math.min(height - EDGE - reactH - GAP - listH, y + 8));
        setBox({ left, top, origin: x > left + reactW / 2 ? 'right top' : 'left top', listMax: Math.max(0, Math.min(listH, height - EDGE * 2 - reactH - GAP)) });
        return;
      }
      const geometry = mobileMenuGeometry({ originalTop: content.top, bubbleHeight: content.height, stageHeight: height, reactionHeight: reactH, listHeight: listH });
      setBox({
        ...geometry,
        left: Math.max(EDGE, Math.min(mine ? bubble.right - reactW : bubble.left, width - EDGE - reactW)),
        listLeft: Math.max(EDGE, Math.min(mine ? bubble.right - listW : bubble.left, width - EDGE - listW)),
        rowTop: row.top + geometry.shift,
        rowLeft: row.left,
        rowWidth: row.width,
        rowMax: Math.max(0, geometry.visibleHeight + content.top - row.top),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapRef.current);
    if (node) observer.observe(node);
    window.visualViewport?.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.visualViewport?.removeEventListener('resize', measure); };
  }, [rect, node, msg.id, mine, platform, pointer, activityKey]);

  const ready = !!box;
  useEffect(() => {
    if (!capture && ready) reactRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [capture, ready]);

  const keyDown = event => {
    if (event.key !== 'Tab') return;
    const controls = [...wrapRef.current.querySelectorAll('.msgmenu-reactions button, .msgmenu-list button')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  const mobile = platform === 'mobile';
  const offset = box ? { left: `${box.left}px` } : undefined;

  return (
    <div className={`msgmenu-wrap rp-context-menu rp-context-menu--${platform}`} ref={wrapRef} onKeyDown={keyDown} role={backdrop ? "dialog" : undefined} aria-modal={backdrop ? true : undefined} aria-label={backdrop ? "Меню сообщения" : undefined} data-capture={capture || undefined} data-ready={box ? 'yes' : 'no'} data-shift={box?.shift || 0} data-cursor-x={pointer?.x} data-cursor-y={pointer?.y}>
      {backdrop && <button className="msgmenu-scrim" onClick={onClose} aria-label="Закрыть" />}

      <div className="rp-menu-group" style={box ? mobile
        ? { '--rp-start-y': `${-box.shift}px` }
        : { left: `${box.left}px`, top: `${box.top}px`, '--rp-origin': box.origin } : undefined}>
      {/* Mobile lifts an exact copy; desktop keeps the original bubble in place. */}
      {mobile && <div
        className="msgmenu-source"
        ref={cloneRef}
        aria-hidden="true"
        style={box ? { top: `${box.rowTop}px`, left: `${box.rowLeft}px`, width: `${box.rowWidth}px`, maxHeight: `${box.rowMax}px`, overflow: 'hidden' } : undefined}
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
        <button className="msgmenu-reaction rp-more" onClick={onExpand} aria-label="Все реакции" title="Все реакции"><Plus size={18} /></button>
      </div>

      <div
        className={`msgmenu-list msgmenu--${side}`}
        ref={listRef}
        style={box ? { ...(mobile ? { top: `${box.listTop}px`, left: `${box.listLeft}px` } : {}), maxHeight: `${box.listMax}px` } : undefined}
        data-ready={box ? 'yes' : 'no'}
      >
        {activitySlot}
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
