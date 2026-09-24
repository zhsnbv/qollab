import { useNotificationBack } from '../utils/useNotificationBack';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { notificationGroups } from '../data/notifications';
import NotificationMiniAppIcon from '../components/NotificationMiniAppIcon';
import './NotificationGroup.css';
export default function NotificationDetail() {
  const { groupId, messageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const group = notificationGroups.find(g => g.id === groupId);
  const [closing, close] = useNotificationBack(`/notifications/${groupId}`);
  const message = group?.items.find(n => n.id === messageId);
  return <div className={`ngroup ${closing ? 'closing' : ''}`}>
    <header className="ng-top"><button className="ng-back" aria-label="Назад" onClick={close}><CaretLeft size={24} /></button><NotificationMiniAppIcon service={message?.service} size={40} /><span className="ng-name">{message?.service || 'Уведомление не найдено'}</span></header>
    {message && <div className="ng-scroll"><article className="ng-msg ng-detail"><h1 className="ng-msg-title">{message.title}</h1><p className="ng-text">{message.detail || message.text}</p><span className="ng-time">{message.day}, {message.time}</span>{message.href && <button className="ng-action" onClick={() => navigate(message.href, { state: { background: location } })}>Открыть ЕСЭД</button>}</article></div>}
  </div>;
}
