import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, BellSimple } from '@phosphor-icons/react';
import { notificationGroups } from '../data/notifications';
import './NotificationGroup.css';

// Лента уведомлений одной группы (Figma node 24351:90312). По структуре это
// чат: разделители по дням, аватар группы слева, карточка-«сообщение» справа —
// название сервиса, заголовок, текст, опциональные картинка и кнопка, время.
export default function NotificationGroup() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const group = notificationGroups.find((g) => g.id === groupId);
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

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

  // Группируем по дню, сохраняя порядок: разделитель рисуем при смене дня.
  let lastDay = null;

  return (
    <div className={`ngroup ${closing ? 'closing' : ''}`}>
      <header className="ng-top">
        <button className="ng-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <span className="ng-avatar" style={{ background: group.tone }}>
          <BellSimple size={20} weight="fill" color="#fff" />
        </span>
        <span className="ng-titles">
          <span className="ng-name">{group.name}</span>
          <span className="ng-sub">Уведомления</span>
        </span>
      </header>

      <div className="ng-scroll">
        {group.items.map((n, i) => {
          const showDay = n.day !== lastDay;
          lastDay = n.day;
          return (
            <div key={i}>
              {showDay && (
                <div className="ng-day"><span className="ng-day-line" />{n.day}<span className="ng-day-line" /></div>
              )}
              <div className="ng-row">
                <span className="ng-row-avatar" style={{ background: group.tone }}>
                  <BellSimple size={16} weight="fill" color="#fff" />
                </span>
                <div className="ng-msg">
                  <div className="ng-service">{n.service}</div>
                  <div className="ng-msg-title">{n.title}</div>
                  {n.img && <div className="ng-img"><img src={n.img} alt="" loading="lazy" /></div>}
                  <div className="ng-text">{n.text}</div>
                  {n.action && <button className="ng-action">{n.action}</button>}
                  <div className="ng-time">{n.time}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="ng-bottom-spacer" />
      </div>
    </div>
  );
}
