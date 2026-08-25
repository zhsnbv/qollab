import { useState } from 'react';
import { Dismiss20Regular } from '@fluentui/react-icons';
import Portal from './Portal';
import { STATUSES } from '../data/statuses';
import './StatusSheet.css';

// Выбор своего статуса. В отличие от обычного листа действий здесь выбор
// подтверждается кнопкой: пункт можно примерить, не применяя сразу.
export default function StatusSheet({ value, onClose, onPick }) {
  const [picked, setPicked] = useState(value || null);

  return (
    <Portal>
      <div className="stsheet-wrap">
        <button className="stsheet-scrim" onClick={onClose} aria-label="Закрыть" />
        <div className="stsheet" role="dialog" aria-label="Мой статус">
          <div className="stsheet-head">
            <h3>Мой статус</h3>
            <button className="stsheet-close" onClick={onClose} aria-label="Закрыть">
              <Dismiss20Regular />
            </button>
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
