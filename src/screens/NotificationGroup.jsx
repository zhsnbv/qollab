import { useNotificationBack } from '../utils/useNotificationBack';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, BellSimple } from '@phosphor-icons/react';
import { notificationGroups } from '../data/notifications';
import './NotificationGroup.css';
import NotificationIcon from '../components/NotificationIcon';
import NotificationMiniAppIcon from '../components/NotificationMiniAppIcon';

// Лента уведомлений одной группы (Figma node 24351:90312). По структуре это
// чат: разделители по дням, аватар группы слева, карточка-«сообщение» справа —
// название сервиса, заголовок, текст, опциональные картинка и кнопка, время.
export default function NotificationGroup({ previewEmpty = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();
  const group = notificationGroups.find((g) => g.id === groupId);
  const [closing, close] = useNotificationBack('/notifications');
  const language = new URLSearchParams(window.location.search).get('lang') || 'ru';



  if (!group) {
    return (
      <div className="ngroup">
        <header className="ng-top">
          <button className="ng-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
          <h1 className="ng-name">Не найдено</h1>
        </header>
      </div>
    );
  }

  // Каждый день — своя секция: липкая пилюля живёт внутри неё, поэтому
  // следующая дата естественно выталкивает предыдущую, а не накладывается.
  // Так же собрана лента чата.
  const items = previewEmpty ? [] : group.items;
  const daySections = items.reduce((acc, n) => {
    const last = acc[acc.length - 1];
    if (last && last.day === n.day) last.items.push(n);
    else acc.push({ day: n.day, items: [n] });
    return acc;
  }, []);

  return (
    <div className={`ngroup ${closing ? 'closing' : ''}`}>
      <header className="ng-top">
        <button className="ng-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <NotificationIcon group={group} size={40} />
        <span className="ng-titles">
          <span className="ng-name">{group.names[language] || group.name}</span>
          <span className="ng-sub">Уведомления</span>
        </span>
      </header>

      <div className={`ng-scroll ${!items.length ? 'ng-scroll--empty' : ''}`}>
        {!items.length && <div className="ng-empty"><div className="ng-empty-art"><span><BellSimple size={40} weight="regular" aria-hidden="true" /></span></div><h2>Пока нет уведомлений</h2><p>Здесь появятся уведомления миниаппов этой категории.</p></div>}
        <div className="ng-messages">{daySections.map((section) => (
          <section className="ng-day-section" key={section.day}>
            <div className="ng-day">{section.day}</div>
            {section.items.map((n) => (
              <div className="ng-row" key={n.id}>
                <NotificationMiniAppIcon service={n.service} />
                <div className="ng-msg">
                  <div className="ng-service">{n.service}</div>
                  {n.title && <div className="ng-msg-title">{n.title}</div>}
                  {n.img && <div className="ng-img"><img src={n.img} alt="" loading="lazy" /></div>}
                  <div className="ng-text">{n.text}</div>
                  {n.action && <button className="ng-action" onClick={() => navigate(`/notifications/${group.id}/${n.id}`, { state: { background: location } })}>{n.action}</button>}
                  <div className="ng-time">{n.day === 'Сегодня' ? 'Чт' : 'Ср'} {n.time}</div>
                </div>
              </div>
            ))}
          </section>
        ))}</div>
      </div>
    </div>
  );
}
