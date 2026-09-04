import { CalendarLtr24Filled, ChevronRight20Filled } from '@fluentui/react-icons';
import Widgets, { Timeline } from '../Widgets';
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
          'Лента виджетов после блока сервисов — по макету Figma. Карточка одной высоты на всех '
          + '(303px), следующая подглядывает из-за края на 24px: на вебе виджеты стоят колонкой '
          + 'справа, на телефоне такой колонки нет. У каждой карточки крашеная шапка со своим '
          + 'глифом и счётчиком, тело — своё: почта показывает письма, встречи — таймлайн дня, '
          + 'ссылки и объявления — строки со стрелкой. Тап по карточке целиком открывает сервис '
          + '(по ТЗ отдельной кнопки внутри нет).',
      },
    },
  },
};

export const Лента = {
  render: () => <div style={{ paddingTop: 16 }}><Widgets /></div>,
};

// Карточка встреч отдельно: у таймлайна четыре состояния, и в живой ленте
// поймать их нельзя — она показывает то, что сейчас на часах.
function MeetCard({ at, note }) {
  const [h, m] = at.split(':').map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  const mins = h * 60 + m;
  const left = widgetData.meetings.filter((x) => {
    const [eh, em] = x.to.split(':').map(Number);
    return eh * 60 + em > mins;
  }).length;

  return (
    <div style={{ padding: 16 }}>
      <div className="wgs">
        <div className="wgs-card wg-tone--success" style={{ width: '100%' }}>
          <div className="wgs-cap">
            <span className="wgs-ico"><CalendarLtr24Filled /></span>
            <span className="wgs-name">Встречи на сегодня</span>
            {left > 0
              ? <span className="wgs-count">{left}</span>
              : <ChevronRight20Filled className="wgs-chev" />}
          </div>
          <div className="wgs-body">
            <Timeline list={widgetData.meetings} now={now} />
          </div>
        </div>
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
      note="Полоска стоит внутри идущей встречи, её рельса сплошная, время строки прячется под плашкой."
    />
  ),
};

export const ТаймлайнПерерыв = {
  name: 'Таймлайн — перерыв',
  render: () => (
    <MeetCard
      at="12:30"
      note="Идущей встречи нет: полоска стоит в промежутке, ни одна строка не подсвечена."
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
      note="Все встречи прошли: рельсы приглушённо зелёные, полоски нет, счётчик в шапке сменился шевроном."
    />
  ),
};
