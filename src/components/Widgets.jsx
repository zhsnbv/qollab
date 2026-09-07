import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mail24Filled, CalendarLtr24Filled, Link24Filled,
  ShieldCheckmark24Filled, BookOpen24Filled,
  TicketDiagonal24Filled, Headset24Filled, CheckmarkCircle24Filled,
  HeartPulse24Filled, Airplane24Filled,
  Heart20Filled, BriefcaseMedical20Filled,
  ChevronRight20Filled, ChevronRight16Filled,
} from '@fluentui/react-icons';
import { useWidgets } from '../context/WidgetsContext';
import Toast from './Toast';
import { widgetData, usefulLinks } from '../data/widgets';
import './Widgets.css';

// Глифы шапок — Fluent filled, как в макете. У встреч в макете лежит тот же
// конверт, что и у почты (осталось от копипасты карточки) — ставим календарь.
export const WIDGET_ICONS = {
  Mail: Mail24Filled,
  Calendar: CalendarLtr24Filled,
  Link: Link24Filled,
  Shield: ShieldCheckmark24Filled,
  Book: BookOpen24Filled,
};

// Строки «Полезных ссылок» и плитки экрана безопасности. Иконки везде
// одного набора — Fluent filled: пары из Phosphor рядом с фирменными
// глифами шапок читались как два разных языка в одной карточке.
export const LINK_ICONS = {
  Ticket: TicketDiagonal24Filled,
  Headset: Headset24Filled,
  Check: CheckmarkCircle24Filled,
  Pulse: HeartPulse24Filled,
  Airplane: Airplane24Filled,
  Heart: Heart20Filled,
  Medical: BriefcaseMedical20Filled,
};

// Взаимодействие у карточек разное — по тому, сколько у виджета адресов.
// Где внутри свой список ссылок (почта, встречи, полезные ссылки), тапается
// каждая строка, а шапка и подвал ведут в сам сервис. Где адрес один
// (безопасность, журнал), действие тоже одно — кнопка внизу.
const NAV = {
  mail: { head: 'Откроется почта', foot: 'Перейти в почту' },
  meet: { head: 'Откроется календарь встреч', foot: 'Перейти в календарь' },
  links: { head: null, foot: null },
  safety: { head: null, foot: 'Открыть', open: 'Откроется экран безопасности' },
  journal: { head: null, foot: 'Открыть', open: 'Откроется свежий выпуск журнала' },
};

// Высота строк зафиксирована: карточки в ленте одной высоты, и от этих чисел
// зависит, сколько строк влезает и на сколько отъезжает полоска «сейчас».
const ROW_H = 41;
const MEET_ROWS = 6;

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const minsOf = (d) => d.getHours() * 60 + d.getMinutes();

// «Ещё 1 встреча / 2 встречи / 5 встреч»
const plural = (n, one, few, many) => {
  const t = n % 100;
  if (t > 10 && t < 20) return many;
  const u = n % 10;
  if (u === 1) return one;
  if (u >= 2 && u <= 4) return few;
  return many;
};

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

function meetState(m, mins) {
  if (mins >= toMin(m.to)) return 'past';
  if (mins >= toMin(m.from)) return 'now';
  return 'next';
}

// Встреч в дне больше, чем строк в карточке. Показываем окно вокруг текущей
// встречи с одной прошедшей для контекста: список, приколоченный к началу дня,
// к вечеру показывал бы одно прошлое, а нужная встреча пряталась бы.
export function meetWindow(list, mins, max = MEET_ROWS) {
  let i = list.findIndex((m) => toMin(m.to) > mins);
  if (i < 0) i = list.length;
  const start = Math.max(0, Math.min(i - 1, list.length - max));
  return { start, items: list.slice(start, start + max), rest: Math.max(0, list.length - start - max) };
}

// Строки таймлайна одной высоты. Полоска «сейчас» едет внутри строки
// пропорционально времени: слот строки тянется от её начала до начала
// следующей, поэтому маркер всегда стоит ровно у той встречи, на которой надо
// быть, а в перерыве — в промежутке между ними. Вне дня полоски нет.
export function nowTop(list, mins) {
  const starts = list.map((m) => toMin(m.from));
  const end = toMin(list[list.length - 1].to);
  if (mins < starts[0] || mins >= end) return null;
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= mins) i += 1;
  const a = starts[i];
  const b = i + 1 < starts.length ? starts[i + 1] : end;
  return (i + (mins - a) / (b - a)) * ROW_H;
}

export function Timeline({ list, now, onRow }) {
  const mins = minsOf(now);
  const top = nowTop(list, mins);
  return (
    <div className="wg-tl" style={{ height: list.length * ROW_H }}>
      {list.map((m) => (
        <button
          className={`wg-tl-row wg-tl-row--${meetState(m, mins)}`}
          key={m.id}
          onClick={() => onRow(`Откроется встреча «${m.title}»`)}
        >
          <span className="wg-tl-time">{m.from}</span>
          <span className="wg-tl-title">{m.title}</span>
        </button>
      ))}
      {top != null && <span className="wg-now" style={{ top }} aria-hidden="true" />}
    </div>
  );
}

// Тело каждого виджета своё: виджет тем и полезен, что показывает суть сервиса,
// а не одинаковую плашку со счётчиком.
function Body({ id, now, onRow }) {
  if (id === 'meet') {
    const list = widgetData.meetings;
    if (!list.length) return <div className="wg-msg"><b>На сегодня встреч нет</b></div>;
    return <Timeline list={meetWindow(list, minsOf(now)).items} now={now} onRow={onRow} />;
  }

  if (id === 'mail') {
    const { messages } = widgetData.mail;
    if (!messages.length) return <div className="wg-msg"><b>Новых писем нет</b></div>;
    return messages.map((m) => (
      <button className="wg-mail" key={m.id} onClick={() => onRow(`Откроется письмо «${m.subject}»`)}>
        <span className="wg-mail-top">
          {m.unread && <span className="wg-dot" />}
          <span className="wg-mail-from">{m.from}</span>
          <span className="wg-mail-time">{m.time}</span>
        </span>
        <span className="wg-mail-sub">{m.subject}</span>
        <span className="wg-mail-snip">{m.snippet}</span>
      </button>
    ));
  }

  if (id === 'links') {
    return usefulLinks.map(({ icon, title, sub }) => {
      const Icon = LINK_ICONS[icon];
      return (
        <button className="wg-row" key={title} onClick={() => onRow(`Откроется «${title}»`)}>
          <span className="wg-row-ico">{Icon && <Icon />}</span>
          <span className="wg-row-t">
            <span className="wg-row-title">{title}</span>
            <span className="wg-row-sub">{sub}</span>
          </span>
          <ChevronRight16Filled className="wg-row-chev" />
        </button>
      );
    });
  }

  if (id === 'safety') {
    const s = widgetData.safety;
    return (
      <div className="wg-safe">
        <div className="wg-safe-note">{s.note}</div>
        <div className="wg-safe-days">
          <span className="wg-big">{s.days}</span>
          <span className="wg-safe-label">{s.daysLabel}</span>
        </div>
        <div className="wg-safe-stats">
          {s.stats.map((st) => {
            const Icon = LINK_ICONS[st.icon];
            return (
              <div className="wg-safe-stat" key={st.id}>
                <span className="wg-safe-ico">{Icon && <Icon />}</span>
                <span className="wg-safe-num">{st.value}</span>
                <span className="wg-safe-cap">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const { name, issue, cover } = widgetData.journal;
  return (
    <div className="wg-mag">
      <img className="wg-mag-cover" src={cover} alt="" />
      <div className="wg-mag-name">{name}</div>
      <div className="wg-mag-issue">{issue}</div>
    </div>
  );
}

// Счётчик в шапке: у почты — непрочитанные, у встреч — сколько ещё сегодня
// предстоит.
function headCount(id, now) {
  if (id === 'mail') return widgetData.mail.unread;
  if (id === 'meet') {
    const mins = minsOf(now);
    return widgetData.meetings.filter((m) => toMin(m.to) > mins).length || null;
  }
  return null;
}

// Подвал у встреч не просто ведёт в сервис, а честно говорит, сколько встреч
// не поместилось: карточка одной высоты со всеми, растить её нельзя.
function footLabel(id, now) {
  const nav = NAV[id];
  if (id !== 'meet') return nav.foot;
  const { rest } = meetWindow(widgetData.meetings, minsOf(now));
  if (!rest) return nav.foot;
  return `Ещё ${rest} ${plural(rest, 'встреча', 'встречи', 'встреч')}`;
}

function Card({ w, now, onOpen }) {
  const Icon = WIDGET_ICONS[w.icon];
  const nav = NAV[w.id];
  const count = headCount(w.id, now);
  const foot = footLabel(w.id, now);
  const openMsg = nav.open || nav.head;

  const cap = (
    <>
      <span className="wgs-ico">{Icon && <Icon />}</span>
      <span className="wgs-name">{w.title}</span>
      {count != null && <span className="wgs-count">{count}</span>}
      {nav.head && <ChevronRight20Filled className="wgs-chev" />}
    </>
  );

  return (
    <article className={`wgs-card wg-tone--${w.tone}`}>
      {nav.head
        ? <button className="wgs-cap wgs-cap--link" onClick={() => onOpen(nav.head)}>{cap}</button>
        : <div className="wgs-cap">{cap}</div>}

      <div className="wgs-body">
        <Body id={w.id} now={now} onRow={onOpen} />
      </div>

      {foot && (
        <button className="wgs-foot" onClick={() => onOpen(openMsg)}>
          <span>{foot}</span>
          <ChevronRight16Filled />
        </button>
      )}
    </article>
  );
}

// Лента виджетов внутри карточки сервисов. На вебе виджеты стоят колонкой
// справа, на телефоне такой колонки нет — отсюда горизонтальная лента с
// подглядыванием следующей карточки.
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

  return (
    <section className="wgs">
      <div className="wgs-head">
        <h3 className="section-title" style={{ margin: 0 }}>Виджеты</h3>
        <button className="section-link" onClick={openSettings}>Настроить</button>
      </div>

      <div className="wgs-rail no-scrollbar" onScroll={onScroll}>
        {widgets.map((w) => (
          <Card key={w.id} w={w} now={now} onOpen={setToast} />
        ))}
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
