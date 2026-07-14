// Разделитель дня в чате: «Сегодня» / «Вчера» / «12 июля» — вычисляется от
// строки времени последнего сообщения в списке чатов (Chats.jsx), которая
// бывает в виде «13:21» (сегодня), «вчера», короткого дня недели («пн», «вт»…)
// или даты «02.07».
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']; // индекс совпадает с Date#getDay()
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d) {
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

export function dayLabel(timeStr, now = new Date()) {
  const today = startOfDay(now);
  if (!timeStr || /^\d{1,2}:\d{2}$/.test(timeStr)) return 'Сегодня';

  const normalized = timeStr.trim().toLowerCase();
  if (normalized === 'вчера') return 'Вчера';
  if (normalized === 'сегодня') return 'Сегодня';

  const weekday = WEEKDAYS.indexOf(normalized);
  if (weekday !== -1) {
    const diff = (today.getDay() - weekday + 7) % 7 || 7; // ближайший прошедший такой день недели
    const d = new Date(today);
    d.setDate(d.getDate() - diff);
    return formatDate(d);
  }

  const m = normalized.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (m) {
    const d = startOfDay(new Date(today.getFullYear(), Number(m[2]) - 1, Number(m[1])));
    const diffDays = Math.round((today - d) / 86400000);
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    return formatDate(d);
  }

  return 'Сегодня';
}
