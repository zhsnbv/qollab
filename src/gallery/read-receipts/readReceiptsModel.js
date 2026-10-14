export const DEMO_NOW = '2026-10-14T11:00:00+05:00';
const TIME_ZONE = 'Asia/Almaty';
const day = value => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));

// Only real read events from other people belong in the list. No delivered section.
export function getReaders(entries, authorId) {
  const unique = new Map();
  for (const entry of entries) {
    if (!entry.userId || entry.userId === authorId || !entry.readAt || !Number.isFinite(Date.parse(entry.readAt))) continue;
    const previous = unique.get(entry.userId);
    if (!previous || Date.parse(entry.readAt) > Date.parse(previous.readAt)) unique.set(entry.userId, entry);
  }
  return [...unique.values()].sort((a, b) => Date.parse(b.readAt) - Date.parse(a.readAt)
    || a.name.localeCompare(b.name, 'ru') || a.userId.localeCompare(b.userId));
}

export function readTime(value, now = DEMO_NOW) {
  const time = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  if (day(value) === day(now)) return `сегодня в ${time}`;
  if (day(value) === day(Date.parse(now) - 86400000)) return `вчера в ${time}`;
  const date = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', ...(new Date(value).getUTCFullYear() !== new Date(now).getUTCFullYear() ? { year: 'numeric' } : {}) }).format(new Date(value));
  return `${date} в ${time}`;
}

export function readSummary({ mine, readers, now = DEMO_NOW }) {
  if (!mine || readers.length === 0) return null;
  return readers.length === 1 ? `Прочитано ${readTime(readers[0].readAt, now)}` : `Просмотров сообщения: ${readers.length}`;
}

const people = [
  ['ayazhan', 'Аяжан Сериккызы', '/img/chats/ayazhan.png'],
  ['daniyar', 'Данияр Кульманов', '/img/chats/daniyar.png'],
  ['aray', 'Арай Жумабекова', '/img/chats/aray.png'],
  ['arman', 'Арман Абдрахманов', null],
  ['nurlan', 'Нурлан Бейсенов', null],
  ['alexandra', 'Александра Константинопольская-Рождественская', null],
];
export function demoReaders(count) {
  return getReaders(Array.from({ length: count }, (_, index) => {
    const person = people[index % people.length];
    return { userId: `${person[0]}-${index}`, name: index < 6 ? person[1] : `${['Алина', 'Аскар', 'Дамир', 'Елена', 'Мадина', 'Сергей'][index % 6]} ${['Ахметова', 'Бекенов', 'Иманов', 'Ким', 'Садыкова', 'Петров'][index % 6]}`, avatar: index < 3 ? person[2] : null,
      readAt: count === 1 ? '2026-10-13T16:35:00+05:00' : new Date(Date.parse(DEMO_NOW) - 300000 - Math.floor(index / 3) * 120000).toISOString() };
  }), 'me');
}

export const RECEIPT_STATES = [
  { id: 'zero', title: 'Никто не прочитал', note: '0 · строки в меню нет', count: 0, view: 'menu' },
  { id: 'one', title: 'Один читатель', note: '1 · время в строке', count: 1, view: 'menu' },
  { id: 'two', title: 'Два читателя', note: '2 · счётчик просмотров', count: 2, view: 'menu' },
  { id: 'many', title: 'Несколько читателей', note: '6 · счётчик просмотров', count: 6, view: 'menu' },
  { id: 'list-one', title: 'Список · один', note: 'Аватар, имя, время, галочки', count: 1, view: 'list' },
  { id: 'list-two', title: 'Список · двое', note: 'Ровно два прочтения', count: 2, view: 'list' },
  { id: 'list-many', title: 'Список · несколько', note: 'Длинное имя и одинаковое время', count: 6, view: 'list' },
  { id: 'large', title: 'Большая группа', note: '94 · обычная прокрутка', count: 94, view: 'list' },
  { id: 'personal', title: 'Личный чат · меню', note: 'Прочтение собеседником', count: 1, view: 'menu', personal: true },
  { id: 'personal-list', title: 'Личный чат · список', note: 'Всегда один человек', count: 1, view: 'list', personal: true },
  { id: 'incoming', title: 'Чужое сообщение', note: 'Строка доступна только автору', count: 6, view: 'menu', incoming: true },
];
