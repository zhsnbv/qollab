import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDots, EnvelopeSimple, WarningCircle, ShieldCheck, LinkSimple, BookOpen,
} from '@phosphor-icons/react';
import { useWidgets } from '../context/WidgetsContext';
import Toast from './Toast';
import { widgetData } from '../data/widgets';
import './Widgets.css';

// Куда ведёт тап по карточке. По ТЗ кликабельна вся карточка целиком,
// а не отдельная кнопка внутри неё.
const OPENS = {
  meet: 'Откроется экран «Мои встречи»',
  mail: 'Откроется почта',
  important: 'Откроется объявление',
  safety: 'Откроется экран безопасности',
  links: 'Откроется список ссылок',
  journal: 'Откроется свежий выпуск журнала',
};

export const WIDGET_ICONS = {
  CalendarDots, EnvelopeSimple, WarningCircle, ShieldCheck, LinkSimple, BookOpen,
};

// Тело каждого виджета своё: виджет тем и полезен, что показывает суть сервиса,
// а не одинаковую плашку со счётчиком. Состав — по пп. 1.1 и 2.1 ТЗ.
function Body({ id }) {
  if (id === 'meet') {
    const list = widgetData.meetings.slice(0, 3);
    if (!list.length) return <div className="wg-msg"><b>На сегодня встреч нет</b></div>;
    return (
      <>
        <div className="wg-stack">
          {list.map((m) => (
            <div className={`wg-meet ${m.now ? 'wg-meet--now' : ''}`} key={m.id}>
              <span className="wg-meet-cal"><CalendarDots size={12} weight="fill" /></span>
              <span className="wg-meet-t">
                <span className="wg-meet-title">{m.title}</span>
                <span className="wg-meet-time">
                  {m.from} - {m.to}{m.now ? ' · идёт сейчас' : ''}
                </span>
              </span>
            </div>
          ))}
        </div>
        {widgetData.meetingsMore > 0 && (
          <div className="wg-more">Ещё {widgetData.meetingsMore} встречи</div>
        )}
      </>
    );
  }

  if (id === 'mail') {
    const { messages } = widgetData.mail;
    if (!messages.length) return <div className="wg-msg"><b>Новых писем нет</b></div>;
    return (
      <div className="wg-stack">
        {messages.map((m) => (
          <div className="wg-mail" key={m.id}>
            <span className={`wg-mail-dot ${m.unread ? '' : 'wg-mail-dot--read'}`} />
            <span className="wg-mail-from">{m.from}</span>
            <span className="wg-mail-sub">{m.subject}</span>
            <span className="wg-mail-time">{m.time}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'safety') {
    return (
      <>
        <div>
          <div className="wg-big">{widgetData.safetyDays}</div>
          <div className="wg-sub">дней без травм</div>
        </div>
        <div className="wg-foot">Включая подрядные организации</div>
      </>
    );
  }

  if (id === 'important') {
    return (
      <>
        <div className="wg-text">
          {widgetData.important.text}: <b>{widgetData.important.value}</b>
        </div>
        <span className="wg-btn">Открыть</span>
      </>
    );
  }

  if (id === 'links') {
    return (
      <div className="wg-stack">
        {widgetData.links.map((l) => (
          <span className="wg-link" key={l}><span />{l}</span>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="wg-text">{widgetData.journal}</div>
      <span className="wg-btn">Открыть</span>
    </>
  );
}

// Лента виджетов после блока сервисов. На вебе виджеты стоят колонкой справа,
// на телефоне такой колонки нет — отсюда горизонтальная лента с подглядыванием
// следующей карточки.
export default function Widgets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { widgets } = useWidgets();
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState('');

  // Шаг ленты считаем по самой карточке, а не по константе: ширина зависит
  // от экрана, и на узком захардкоженное число промахивалось бы мимо точек.
  const onScroll = (e) => {
    const rail = e.currentTarget;
    const card = rail.firstElementChild;
    if (!card) return;
    const step = card.offsetWidth + 10;
    setActive(Math.min(widgets.length - 1, Math.round(rail.scrollLeft / step)));
  };

  const openSettings = () => navigate('/widgets/settings', { state: { background: location } });

  // Экранов назначения в прототипе ещё нет — честно говорим, что откроется,
  // вместо карточки, которая молча не реагирует на тап.
  const open = (id) => setToast(OPENS[id] || 'Откроется сервис');

  return (
    <section className="wgs">
      <div className="wgs-head">
        <h3 className="section-title" style={{ margin: 0 }}>Виджеты</h3>
        <button className="section-link" onClick={openSettings}>Настроить</button>
      </div>

      <div className="wgs-rail no-scrollbar" onScroll={onScroll}>
        {widgets.map((w) => {
          const Icon = WIDGET_ICONS[w.icon];
          return (
            <button className="wgs-card" key={w.id} onClick={() => open(w.id)}>
              <div className="wgs-top">
                <span className="wgs-ico">{Icon && <Icon size={16} weight="fill" />}</span>
                <span className="wgs-name">{w.title}</span>
                {w.id === 'mail' && <span className="wgs-pill">{widgetData.mail.unread}</span>}
              </div>
              <Body id={w.id} />
            </button>
          );
        })}
      </div>

      <Toast text={toast} onDone={() => setToast('')} />

      {widgets.length > 1 && (
        <div className="wgs-dots" aria-hidden="true">
          {widgets.map((w, i) => (
            <span className={`wgs-dot ${i === active ? 'on' : ''}`} key={w.id} />
          ))}
        </div>
      )}
    </section>
  );
}
