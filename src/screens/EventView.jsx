import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, ShareNetwork, Check } from '@phosphor-icons/react';
import { events } from '../data/feed';
import './EventView.css';

// Просмотр мероприятия (Figma node 24799-3477): основная информация, описание
// с картинкой и выбор даты участия. Три белых блока с зазором 8, как в макете.
export default function EventView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [closing, setClosing] = useState(false);

  const id = location.state?.id;
  const e = events.find((x) => x.id === id) || events[0];

  // Занятые слоты выбрать нельзя, поэтому предвыбираем первый свободный
  const [slot, setSlot] = useState(() => e.slots.find((s) => !s.full)?.id || null);
  const [joined, setJoined] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const info = [
    ['Автор', e.author],
    ['Дата начала', e.start],
    ['Организация', e.company],
    ['Дата завершения', e.end],
  ];

  return (
    <div className={`eventview ${closing ? 'closing' : ''}`}>
      <header className="ev-top">
        <button className="ev-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="ev-title">Мероприятие</h1>
        <span className="ev-back" aria-hidden="true" />
      </header>

      <div className="ev-scroll">
        <section className="ev-card">
          <h2 className="ev-h">Основная информация</h2>
          <div className="ev-info">
            {info.map(([label, value]) => (
              <div className="ev-info-row" key={label}>
                <div className="ev-info-label">{label}</div>
                <div className="ev-info-value">{value}</div>
              </div>
            ))}
          </div>
          <button className="ev-share">
            <ShareNetwork size={20} />Поделиться мероприятием
          </button>
        </section>

        <section className="ev-card">
          <h2 className="ev-h">{e.title}</h2>
          <p className="ev-about">{e.about}</p>
          <div className="ev-photo"><img src={e.img} alt="" /></div>
        </section>

        <section className="ev-card">
          <h2 className="ev-h">{e.title}</h2>
          <div className="ev-slots">
            {e.slots.map((s) => {
              const checked = slot === s.id;
              return (
                <button
                  className={`ev-slot ${s.full ? 'full' : ''}`}
                  key={s.id}
                  onClick={() => !s.full && setSlot(s.id)}
                  disabled={s.full}
                >
                  <span className={`ev-check ${checked ? 'on' : ''}`}>
                    {checked && <Check size={14} weight="bold" />}
                  </span>
                  <span className="ev-slot-texts">
                    <span className="ev-slot-label">{s.label}</span>
                    <span className="ev-slot-sub">Максимальное количество заявок: {s.limit}</span>
                    {s.full && <span className="ev-slot-tag">Количество заявок достигло лимита</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            className="ev-join"
            disabled={!slot || joined}
            onClick={() => setJoined(true)}
          >
            {joined ? 'Вы участвуете' : 'Участвовать'}
          </button>
        </section>

        <div className="ev-bottom-spacer" />
      </div>
    </div>
  );
}
