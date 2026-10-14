// Use calendar days in the displayed timezone; 24 hours is not always one day.
export function formatActivityDate(value, now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  if (value == null || value === '') return '';
  const date = new Date(value), today = new Date(now);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(today.getTime())) return '';
  const calendar = new Intl.DateTimeFormat('en-CA', {timeZone, year:'numeric', month:'2-digit', day:'2-digit'});
  const parts = input => Object.fromEntries(calendar.formatToParts(input).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const eventDay = parts(date), currentDay = parts(today);
  const serial = day => Date.UTC(day.year, day.month - 1, day.day) / 86400000;
  const difference = serial(currentDay) - serial(eventDay);
  const clock = new Intl.DateTimeFormat('ru-RU', {timeZone, hour:'2-digit', minute:'2-digit'}).format(date);
  const label = difference === 0 ? 'Сегодня' : difference === 1 ? 'Вчера' :
    new Intl.DateTimeFormat('ru-RU', {timeZone, day:'numeric', month:'short', ...(eventDay.year !== currentDay.year ? {year:'numeric'} : {})}).format(date);
  return label + ', ' + clock;
}
