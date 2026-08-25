import { useEffect } from 'react';
import SheetTop from './SheetTop';
import useSheetSwipe from '../utils/useSheetSwipe';
import { Checkmark20Filled } from '@fluentui/react-icons';
import Portal from './Portal';
import { pushScrim, popScrim } from '../utils/scrim';
import './ActionSheet.css';

// Контекстное меню экрана — листом снизу, а не выпадающим меню: на телефоне
// до нижней части экрана дотянуться проще, и это тот же паттерн, что у
// остальных шитов прототипа.
export default function ActionSheet({ title, items, onClose, onPick, selected, iconsLeft }) {
  const swipe = useSheetSwipe(onClose);
  // Режим выбора: иконка уходит влево, справа у активного пункта — галочка.
  // iconsLeft — та же раскладка, но без галочек (список вложений).
  const isSelect = selected !== undefined;
  const leading = isSelect || iconsLeft;

  // Затемняем заодно и полосу статуса: оверлей должен перекрывать весь экран
  useEffect(() => { pushScrim(); return popScrim; }, []);
  return (
    <Portal><div className="asheet-wrap">
      <button className="asheet-scrim" onClick={onClose} aria-label="Закрыть" />
      <div className={`asheet ${swipe.className}`} style={swipe.style}>
        <SheetTop onClose={onClose} swipe={swipe} />
        {title && <h3 className="asheet-title">{title}</h3>}
        <div className="asheet-list">
          {items.map(({ id, label, sub, Icon, danger }) => (
            <button
              className={`asheet-item ${danger ? 'danger' : ''} ${leading ? 'select' : ''}`}
              key={id}
              onClick={() => onPick(id)}
            >
              {leading && <Icon />}
              <span className="asheet-label">
                {label}
                {sub && <span className="asheet-sub">{sub}</span>}
              </span>
              {isSelect && selected === id && <Checkmark20Filled className="asheet-check" />}
              {!leading && <Icon />}
            </button>
          ))}
        </div>
        <button className="asheet-cancel" onClick={onClose}>Отмена</button>
      </div>
    </div></Portal>
  );
}
