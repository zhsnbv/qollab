import { useEffect } from 'react';
import './Toast.css';

// Кратковременное уведомление о результате действия («Скопировано»,
// «Сообщение переслано»). В отличие от status chip, который остаётся в ленте
// как след события, тост живёт пару секунд и ничего не оставляет.
export default function Toast({ text, onDone, duration = 2200 }) {
  useEffect(() => {
    if (!text) return undefined;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [text, duration, onDone]);

  if (!text) return null;
  return <div className="toast" role="status">{text}</div>;
}
