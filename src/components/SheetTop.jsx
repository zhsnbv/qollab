import { Dismiss20Regular } from '@fluentui/react-icons';

// Шапка листа снизу: ручка и крестик. Свайп по ней закрывает лист — за это
// отвечает useSheetSwipe, обработчики приходят снаружи.
export default function SheetTop({ onClose, swipe }) {
  return (
    <div className="sheet-top" {...(swipe?.handlers || {})}>
      <span className="sheet-grab" />
      <button className="sheet-close" onClick={onClose} aria-label="Закрыть">
        <Dismiss20Regular />
      </button>
    </div>
  );
}
