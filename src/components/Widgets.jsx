import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail24Filled, CalendarLtr24Filled, Link24Filled,
  Megaphone24Filled, ShieldCheckmark24Filled, BookOpen24Filled,
  ChevronRight20Filled,
} from '@fluentui/react-icons';
import {
  Lifebuoy, Headset, CheckFat, HandHeart, SuitcaseRolling, CaretRight,
} from '@phosphor-icons/react';
import { useWidgets } from '../context/WidgetsContext';
import Toast from './Toast';
import { widgetData, usefulLinks } from '../data/widgets';
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

// Глифы шапок — Fluent filled, как в макете. У встреч в макете лежит тот же
// конверт, что и у почты (осталось от копипасты карточки) — ставим календарь.
export const WIDGET_ICONS = {
  Mail: Mail24Filled,
  Calendar: CalendarLtr24Filled,
  Link: Link24Filled,
  Megaphone: Megaphone24Filled,
  Shield: ShieldCheckmark24Filled,
  Book: BookOpen24Filled,
};

// Строки «Полезных ссылок» — Phosphor, те же иконки, что в «Актуальном».
export const LINK_ICONS = { Lifebuoy, Headset, CheckFat, HandHeart, SuitcaseRolling };

const ROW_H = 42;

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const pad = (n) => String(n).padStart(2, '0');

// Часы тикают сами: полоска «сейчас» должна ехать, пока экран открыт,
// иначе таймлайн врёт уже через несколько минут.
function useClock(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

// Строки таймлайна одной высоты — как в макете. Полоска «сейчас» едет внутри
// строки пропорционально времени: слот строки тянется от её начала до начала
// следующей, поэтому маркер всегда стоит ровно у той встречи, на которой надо
// быть, а в перерыве — в промежутке между ними.
function nowMark(list, mins) {
  const starts = list.map((m) => toMin(m.from));
  const end = toMin(list[list.length - 1].to);
  // Вне дня полоски нет: прижатая к краю, она только мешала бы — состояние
  // и так читается по рельсам (всё серое или всё зелёное).
  if (mins < starts[0] || mins >= end) return null;
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= mins) i += 1;
  const a = starts[i];
  const b = i + 1 < starts.length ? starts[i + 1] : end;
  // Плашку держим внутри тела: у самых краёв её срезал бы кант карточки.
  const full = list.length * ROW_H;
  const top = Math.max(9, Math.min(full - 9, (i + (mins - a) / (b - a)) * ROW_H));
  // Плашка со временем стоит на колонке времени. Если она пришлась на время
  // строки — само время прячем: две цифры друг на друге читать невозможно.
  // 18 = половина плашки (8) + половина строки времени (9) + зазор: ближе
  // этого они уже наезжают друг на друга.
  const over = list.findIndex((m, k) => Math.abs(top - (k * ROW_H + ROW_H / 2)) < 18);
  return { top, over };
}

function meetState(m, mins) {
  if (mins >= toMin(m.to)) return 'past';
  if (mins >= toMin(m.from)) return 'now';
  return 'next';
}

export function Timeline({ list, now }) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const mark = nowMark(list, mins);
  return (
    <div className="wg-tl" style={{ height: list.length * ROW_H }}>
      {list.map((m, i) => (
        <div
          className={`wg-tl-row wg-tl-row--${meetState(m, mins)} ${mark && mark.over === i ? 'wg-tl-row--masked' : ''}`}
          key={m.id}
        >
          <span className="wg-tl-time">{m.from}</span>
          <span className="wg-tl-title">{m.title}</span>
        </div>
      ))}
      {mark && (
        <div className="wg-now" style={{ top: mark.top }} aria-hidden="true">
          <span className="wg-now-chip">{pad(now.getHours())}:{pad(now.getMinutes())}</span>
        </div>
      )}
    </div>
  );
}

// Тело каждого виджета своё: виджет тем и полезен, что показывает суть сервиса,
// а не одинаковую плашку со счётчиком. Состав — по пп. 1.1 и 2.1 ТЗ.
function Body({ id, now }) {
  if (id === 'meet') {
    const list = widgetData.meetings;
    if (!list.length) return <div className="wg-msg"><b>На сегодня встреч нет</b></div>;
    return <Timeline list={list} now={now} />;
  }

  if (id === 'mail') {
    const { messages } = widgetData.mail;
    if (!messages.length) return <div className="wg-msg"><b>Новых писем нет</b></div>;
    return messages.map((m) => (
      <div className="wg-mail" key={m.id}>
        <div className="wg-mail-top">
          {m.unread && <span className="wg-dot" />}
          <span className="wg-mail-from">{m.from}</span>
          <span className="wg-mail-time">{m.time}</span>
        </div>
        <div className="wg-mail-sub">{m.subject}</div>
        <div className="wg-mail-snip">{m.snippet}</div>
      </div>
    ));
  }

  if (id === 'links') {
    return usefulLinks.map(({ icon, title, sub }) => {
      const Icon = LINK_ICONS[icon];
      return (
        <div className="wg-row" key={title}>
          {Icon && <Icon size={24} color="var(--color-primary)" />}
          <span className="wg-row-t">
            <span className="wg-row-title">{title}</span>
            <span className="wg-row-sub">{sub}</span>
          </span>
          <CaretRight size={16} color="var(--color-light)" />
        </div>
      );
    });
  }

  if (id === 'important') {
    return widgetData.important.map((n) => (
      <div className="wg-row" key={n.id}>
        <span className="wg-row-t">
          <span className="wg-row-title">{n.title}</span>
          <span className="wg-row-sub">{n.sub}</span>
        </span>
        <CaretRight size={16} color="var(--color-light)" />
      </div>
    ));
  }

  if (id === 'safety') {
    return (
      <div className="wg-stat">
        <div className="wg-big">{widgetData.safetyDays}</div>
        <div className="wg-sub">дней без травм</div>
        <div className="wg-foot">Включая подрядные организации</div>
      </div>
    );
  }

  const { issue, date, lead } = widgetData.journal;
  return (
    <div className="wg-stat">
      <div className="wg-big wg-big--sm">{issue}</div>
      <div className="wg-sub">{date}</div>
      <div className="wg-foot">{lead}</div>
    </div>
  );
}

// Счётчик в шапке: у почты — непрочитанные, у встреч — сколько ещё сегодня
// предстоит. Там, где считать нечего, макет показывает шеврон.
function headCount(id, now) {
  if (id === 'mail') return widgetData.mail.unread;
  if (id === 'meet') {
    const mins = now.getHours() * 60 + now.getMinutes();
    return widgetData.meetings.filter((m) => toMin(m.to) > mins).length || null;
  }
  return null;
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
  const now = useClock();

  // Активную точку ищем по ближайшей карточке, а не делением на шаг: у
  // последней карточки прокрутка упирается в конец ленты, и деление всегда
  // не дотягивало до неё — точка застревала на предпоследней.
  const onScroll = (e) => {
    const rail = e.currentTarget;
    const x = rail.scrollLeft + parseFloat(getComputedStyle(rail).paddingLeft);
    let best = 0;
    let min = Infinity;
    Array.from(rail.children).forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - x);
      if (d < min) { min = d; best = i; }
    });
    setActive(best);
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
          const count = headCount(w.id, now);
          return (
            <button
              className={`wgs-card wg-tone--${w.tone}`}
              key={w.id}
              onClick={() => open(w.id)}
            >
              <div className="wgs-cap">
                <span className="wgs-ico">{Icon && <Icon />}</span>
                <span className="wgs-name">{w.title}</span>
                {count != null
                  ? <span className="wgs-count">{count}</span>
                  : <ChevronRight20Filled className="wgs-chev" />}
              </div>
              <div className={`wgs-body ${w.id === 'links' ? 'wgs-body--fade' : ''}`}>
                <Body id={w.id} now={now} />
              </div>
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
