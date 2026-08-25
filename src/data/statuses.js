import {
  SubtractCircle24Filled, PersonWalking24Filled, Clock24Filled,
  ClockAlarm24Filled, WeatherMoon24Filled, Beach24Filled,
} from '@fluentui/react-icons';

// Статусы, которые человек ставит себе сам (Figma 25206-90416). Отпуск сюда не
// входит: он приходит из HR вместе с датами и перебивает выбранный вручную.
export const STATUSES = [
  {
    id: 'dnd', label: 'Не беспокоить', short: 'Не беспокоить',
    hint: 'Коллеги увидят, что вы не хотите, чтобы вас отвлекали',
    tone: 'danger', Icon: SubtractCircle24Filled,
  },
  {
    id: 'away', label: 'Нет на месте', short: 'Нет на месте',
    hint: 'Временно недоступен',
    tone: 'muted', Icon: PersonWalking24Filled,
  },
  {
    id: 'busy', label: 'Занят', short: 'Занят(-а)',
    hint: 'Коллеги будут видеть, что вы заняты',
    tone: 'warning', Icon: Clock24Filled,
  },
  {
    id: 'brb', label: 'Скоро вернусь', short: 'Скоро вернусь',
    hint: 'Отошёл ненадолго',
    tone: 'violet', Icon: ClockAlarm24Filled,
  },
  {
    id: 'off', label: 'Не на работе', short: 'Не на работе',
    hint: 'Нерабочее время',
    tone: 'success', Icon: WeatherMoon24Filled,
  },
];

// Отпуск выставляется автоматически, поэтому в списке выбора его нет —
// зато он показывается баблом с диапазоном дат.
export const vacationStatus = (from, to) => ({
  id: 'vacation',
  short: `В отпуске ${from} – ${to}`,
  tone: 'accent',
  Icon: Beach24Filled,
});

export const statusById = (id) => STATUSES.find((s) => s.id === id);
