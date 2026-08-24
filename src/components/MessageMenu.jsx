import { useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowReply24Regular, Copy24Regular, Edit24Regular, Pin24Regular, PinOff24Regular,
  Share24Regular, Delete24Regular, CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
import './MessageMenu.css';

// Меню сообщения по долгому нажатию. Само сообщение остаётся на своём месте,
// но поднимается над размытым фоном — сразу видно, на что нажали. Реакции
// встают над ним, действия — под ним, и всё привязано к его рамке.
export const REACTIONS = ['❤️', '👍', '😂', '👌', '😮', '🙏'];

const GAP = 10;  // просвет между сообщением и панелями
const EDGE = 12; // минимальный отступ от краёв экрана

export default function MessageMenu({ msg, mine, rect, node, onClose, onAction, onReact }) {
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

  // Копия сообщения: точная, потому что снимается с самого узла в ленте
  useLayoutEffect(() => {
    if (node && cloneRef.current) cloneRef.current.replaceChildren(node.cloneNode(true));
  }, [node]);

  useLayoutEffect(() => {
    if (!rect || !wrapRef.current) return;
    const stage = wrapRef.current.getBoundingClientRect();
    // Панели держатся за рамку самого пузыря, копия — за строку целиком
    // (в неё входит аватар, и по ней же считаются высоты)
    const row = node ? node.getBoundingClientRect() : rect;
    const top = rect.top - stage.top;
    const reactH = reactRef.current?.offsetHeight || 0;
    const listH = listRef.current?.offsetHeight || 0;

    // Сообщение стоит там же, где стояло. Сдвигаем всю группу, только если
    // иначе панели вылезут за экран, и сначала спасаем реакции: без них
    // непонятно, что меню вообще открылось.
    let shift = 0;
    const bottomOverflow = (top + rect.height + GAP + listH) - (stage.height - EDGE);
    if (bottomOverflow > 0) shift -= bottomOverflow;
    const topOverflow = EDGE - (top + shift - GAP - reactH);
    if (topOverflow > 0) shift += topOverflow;

    // Если после сдвига действия всё равно не помещаются — прокручиваем их
    const listTop = top + shift + rect.height + GAP;
    setBox({
      top: top + shift,
      // Реакции прижимаем низом к верху сообщения — считаем от низа сцены
      reactBottom: stage.height - (top + shift) + GAP,
      height: rect.height,
      left: rect.left - stage.left,
      right: stage.right - rect.right,
      listMax: Math.max(160, stage.height - EDGE - listTop),
      // Копия строки: своя рамка, но сдвигается вместе с остальным
      rowTop: row.top - stage.top + shift,
      rowLeft: row.left - stage.left,
      rowWidth: row.width,
    });
  }, [rect, node, msg.id]);

  const offset = box ? { [side]: `${side === 'right' ? box.right : box.left}px` } : null;

  return (
    <div className="msgmenu-wrap" ref={wrapRef}>
      <button className="msgmenu-scrim" onClick={onClose} aria-label="Закрыть" />

      {/* Копия сообщения поверх затемнения — на своём месте */}
      <div
        className="msgmenu-source"
        ref={cloneRef}
        aria-hidden="true"
        style={box ? { top: `${box.rowTop}px`, left: `${box.rowLeft}px`, width: `${box.rowWidth}px` } : undefined}
      />

      <div
        className={`msgmenu-reactions msgmenu--${side}`}
        ref={reactRef}
        style={box ? { bottom: `${box.reactBottom}px`, ...offset } : undefined}
        data-ready={box ? 'yes' : 'no'}
      >
        {REACTIONS.map((r) => (
          <button className="msgmenu-reaction" key={r} onClick={() => onReact(r)} aria-label={`Реакция ${r}`}>
            {r}
          </button>
        ))}
      </div>

      <div
        className={`msgmenu-list msgmenu--${side}`}
        ref={listRef}
        style={box ? { top: `${box.top + box.height + GAP}px`, maxHeight: `${box.listMax}px`, ...offset } : undefined}
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
  );
}
