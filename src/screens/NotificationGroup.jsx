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

  // Каждый день — своя секция: липкая пилюля живёт внутри неё, поэтому
  // следующая дата естественно выталкивает предыдущую, а не накладывается.
  // Так же собрана лента чата.
  const daySections = group.items.reduce((acc, n) => {
    const last = acc[acc.length - 1];
    if (last && last.day === n.day) last.items.push(n);
    else acc.push({ day: n.day, items: [n] });
    return acc;
  }, []);

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
        {daySections.map((section) => (
          <section className="ng-day-section" key={section.day}>
            <div className="ng-day">{section.day}</div>
            {section.items.map((n, i) => (
              <div className="ng-row" key={i}>
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
            ))}
          </section>
        ))}
        <div className="ng-bottom-spacer" />
      </div>
    </div>
  );
}
