import { Dismiss20Regular } from '@fluentui/react-icons';

// Шапка листа снизу: ручка, а под ней строка с заголовком и крестиком —
// они всегда на одной линии. Свайп по всей шапке закрывает лист, обработчики
// приходят из useSheetSwipe.
export default function SheetTop({ onClose, swipe, children }) {
  return (
    <div className="sheet-top" {...(swipe?.handlers || {})}>
      <span className="sheet-grab" />
      <div className="sheet-head">
        {children}
        <button className="sheet-close" onClick={onClose} aria-label="Закрыть">
          <Dismiss20Regular />
        </button>
      </div>
    </div>
  );
}
