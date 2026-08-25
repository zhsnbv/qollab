import { useState } from 'react';
import Portal from './Portal';
import SheetTop from './SheetTop';
import useSheetSwipe from '../utils/useSheetSwipe';
import { STATUSES } from '../data/statuses';
import './StatusSheet.css';

// Выбор своего статуса. В отличие от обычного листа действий здесь выбор
// подтверждается кнопкой: пункт можно примерить, не применяя сразу.
export default function StatusSheet({ value, onClose, onPick }) {
  const [picked, setPicked] = useState(value || null);
  const swipe = useSheetSwipe(onClose);

  return (
    <Portal>
      <div className="stsheet-wrap">
        <button className="stsheet-scrim" onClick={onClose} aria-label="Закрыть" />
        <div className={`stsheet ${swipe.className}`} style={swipe.style} role="dialog" aria-label="Мой статус">
          <SheetTop onClose={onClose} swipe={swipe} />
          <div className="stsheet-head">
            <h3>Мой статус</h3>
          </div>

          <div className="stsheet-list">
            {STATUSES.map(({ id, label, hint, tone, Icon }) => (
              <button
                key={id}
                className="stsheet-item"
                onClick={() => setPicked(picked === id ? null : id)}
              >
                <span className={`stsheet-ico stsheet-ico--${tone}`}><Icon /></span>
                <span className="stsheet-texts">
                  <span className="stsheet-label">{label}</span>
                  <span className="stsheet-hint">{hint}</span>
                </span>
                <span className={`stsheet-radio ${picked === id ? 'on' : ''}`} />
              </button>
            ))}
          </div>

          <button className="stsheet-apply" onClick={() => onPick(picked)}>
            {picked ? 'Выбрать' : 'Убрать статус'}
          </button>
        </div>
      </div>
    </Portal>
  );
}
