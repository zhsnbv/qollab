import { useNotificationBack } from '../utils/useNotificationBack';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, GearSix } from '@phosphor-icons/react';
import { notificationGroups } from '../data/notifications';
import './Notifications.css';
import NotificationIcon from '../components/NotificationIcon';
import { useScrolled } from '../utils/useScrolled';

// Список групп уведомлений (Figma node 24351:90018). Открывается по колокольчику
// в шапке Главной; каждая строка ведёт в ленту своей группы.
export default function Notifications() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();
  const [closing, close] = useNotificationBack('/');
  const language = new URLSearchParams(window.location.search).get('lang') || 'ru';



  return (
    <div className={`notifs ${closing ? 'closing' : ''}`}>
      <header className={`nt-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="nt-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="nt-title">Уведомления</h1>
        <button
          className="nt-gear"
          aria-label="Настройка уведомлений"
          onClick={() => navigate('/settings/notifications', { state: { background: location } })}
        >
          <GearSix size={20} weight="fill" />
        </button>
      </header>

      <div className="nt-scroll" onScroll={onScroll}>
        <div className="nt-card">
          {notificationGroups.map((g) => (
            <button className="nt-row" key={g.id} onClick={() => navigate(`/notifications/${g.id}`, { state: { background: location } })}>
              <NotificationIcon group={g} />
              <span className="nt-texts">
                <span className="nt-row-head">
                  <span className="nt-name">{g.names[language] || g.name}</span>
                  <span className="nt-when">{g.when}</span>
                </span>
                <span className="nt-row-last">
                  <span className="nt-last">{g.lastService && <strong>{g.lastService}: </strong>}{g.last}</span>
                  {g.unread > 0 && <span className="nt-dot" />}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="nt-bottom-spacer" />
      </div>
    </div>
  );
}
