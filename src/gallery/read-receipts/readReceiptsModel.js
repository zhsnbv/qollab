import { formatActivityDate } from '../../utils/activityDate.js';

export const DEMO_NOW = '2026-10-14T11:00:00+05:00';
const TIME_ZONE = 'Asia/Almaty';

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
  return formatActivityDate(value, now, TIME_ZONE);
}

export function readSummary({ mine, readers, personal = false, now = DEMO_NOW }) {
  if (!mine || readers.length === 0) return null;
  return personal ? readTime(readers[0].readAt, now) : `Прочитали ${readers.length}`;
}

// One person occupies one row even when they both read and reacted.
export function mergeReadActivity(readers, reactions) {
  const people = new Map(getReaders(readers).map(reader => [reader.userId, { ...reader }]));
  for (const reaction of reactions) {
    if (!reaction.userId || !reaction.emoji || !Number.isFinite(Date.parse(reaction.reactedAt))) continue;
    const previous = people.get(reaction.userId);
    if (previous?.reactedAt && Date.parse(previous.reactedAt) > Date.parse(reaction.reactedAt)) continue;
    people.set(reaction.userId, { ...reaction, ...previous, emoji: reaction.emoji, reactedAt: reaction.reactedAt });
  }
  const lastEvent = person => Math.max(Date.parse(person.readAt) || 0, Date.parse(person.reactedAt) || 0);
  return [...people.values()].sort((a, b) => Number(Boolean(b.emoji)) - Number(Boolean(a.emoji)) || lastEvent(b) - lastEvent(a) || a.name.localeCompare(b.name, 'ru') || a.userId.localeCompare(b.userId));
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

export function demoReactions(readers) {
  return readers.slice(0, 3).map((reader, index) => ({ userId: reader.userId, name: reader.name, avatar: reader.avatar,
    emoji: ['❤️', '👍', '😂'][index], reactedAt: new Date(Date.parse(reader.readAt) + (index + 1) * 30000).toISOString() }));
}

export const RECEIPT_STATES = [
  { id: 'zero', title: 'Никто не прочитал', note: '0 · строки в меню нет', count: 0, view: 'menu' },
  { id: 'one', title: 'Один читатель', note: 'Прочитали 1', count: 1, view: 'menu' },
  { id: 'two', title: 'Два читателя', note: '2 · счётчик просмотров', count: 2, view: 'menu' },
  { id: 'many', title: 'Несколько читателей', note: '6 · счётчик просмотров', count: 6, view: 'menu' },
  { id: 'list-one', title: 'Список · один', note: 'Аватар, имя, время, галочки', count: 1, view: 'list' },
  { id: 'list-two', title: 'Список · двое', note: 'Ровно два прочтения', count: 2, view: 'list' },
  { id: 'list-many', title: 'Список · несколько', note: 'Длинное имя и одинаковое время', count: 6, view: 'list' },
  { id: 'large', title: 'Большая группа', note: '94 · обычная прокрутка', count: 94, view: 'list' },
  { id: 'personal', title: 'Личный чат · меню', note: 'Прочтение собеседником', count: 1, view: 'menu', personal: true },
  { id: 'personal-list', title: 'Личный чат · статус', note: 'Дата и галочки, без перехода', count: 1, view: 'menu', personal: true },
  { id: 'incoming', title: 'Чужое сообщение', note: 'Строка доступна только автору', count: 6, view: 'menu', incoming: true },
  { id: 'combined', title: 'Реакции и просмотры · меню', note: 'Одна строка, два счётчика', count: 6, view: 'menu', combined: true },
  { id: 'combined-list', title: 'Реакции и просмотры · список', note: 'Один человек — одна строка', count: 6, view: 'list', combined: true },
];
