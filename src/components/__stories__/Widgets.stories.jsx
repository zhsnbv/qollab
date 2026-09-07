import {
  CalendarLtr24Filled, ChevronRight20Filled, ChevronRight16Filled,
} from '@fluentui/react-icons';
import Widgets, { Timeline, meetWindow } from '../Widgets';
import { widgetData } from '../../data/widgets';

export default {
  title: 'Организмы/Виджеты главной',
  component: Widgets,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Лента виджетов лежит в своей карточке под блоком сервисов. Карточка виджета одной '
          + 'высоты со всеми (341px), следующая подглядывает из-за края: на вебе виджеты стоят '
          + 'колонкой справа, на телефоне такой колонки нет. '
          + 'Подложек у карточек виджетов нет — цветом различаются только глифы, и все они '
          + 'из одного набора, Fluent filled.\n\n'
          + 'Взаимодействие разное и зависит от того, сколько у виджета адресов. У почты, встреч '
          + 'и ссылок свой список — тапается каждая строка, а шапка и подвал ведут в сам сервис. '
          + 'У экрана безопасности и журнала адрес один, поэтому и действие одно — кнопка внизу, '
          + 'а шапка не кликается и шеврона у неё нет.',
      },
    },
  },
};

export const Лента = {
  render: () => <div style={{ padding: 16 }}><Widgets /></div>,
};

// Карточка встреч отдельно: у таймлайна четыре состояния, и в живой ленте
// поймать их нельзя — она показывает то, что сейчас на часах.
function MeetCard({ at, note }) {
  const [h, m] = at.split(':').map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  const mins = h * 60 + m;
  const { items } = meetWindow(widgetData.meetings, mins);
  const hidden = widgetData.meetings.length - items.length;
  const left = widgetData.meetings.filter((x) => {
    const [eh, em] = x.to.split(':').map(Number);
    return eh * 60 + em > mins;
  }).length;

  return (
    <div style={{ padding: 16 }}>
      <div className="wgs">
        <article className="wgs-card" style={{ width: '100%' }}>
          <button className="wgs-cap wgs-cap--link">
            <span className="wgs-ico"><CalendarLtr24Filled /></span>
            <span className="wgs-name">Встречи на сегодня</span>
            {left > 0 && <span className="wgs-count">{left}</span>}
            <ChevronRight20Filled className="wgs-chev" />
          </button>
          <div className="wgs-body">
            <Timeline list={items} now={now} onRow={() => {}} />
          </div>
          <button className="wgs-foot">
            <span>{hidden ? `Ещё ${hidden} встреч` : 'Перейти в календарь'}</span>
            <ChevronRight16Filled />
          </button>
        </article>
      </div>
      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-weak)' }}>{note}</p>
    </div>
  );
}

export const ТаймлайнВстречаИдёт = {
  name: 'Таймлайн — встреча идёт',
  render: () => (
    <MeetCard
      at="15:20"
      note="Идущая встреча набрана жирным, её рельса и время — акцентные. На полоске «сейчас» стоит текущее время: у него своя колонка справа, поэтому оно не наезжает на названия."
    />
  ),
};

export const ТаймлайнПерерыв = {
  name: 'Таймлайн — перерыв',
  render: () => (
    <MeetCard
      at="13:30"
      note="Идущей встречи нет: полоска с текущим временем стоит в промежутке, ни одна строка не выделена."
    />
  ),
};

export const ТаймлайнДеньНеНачался = {
  name: 'Таймлайн — день не начался',
  render: () => (
    <MeetCard
      at="07:40"
      note="Все встречи впереди: рельсы серые, полоски нет — показывать её у самого края нечего."
    />
  ),
};

export const ТаймлайнДеньЗакончился = {
  name: 'Таймлайн — день закончился',
  render: () => (
    <MeetCard
      at="21:15"
      note="Все встречи прошли: строки приглушены, полоски нет, счётчик из шапки убран."
    />
  ),
};
