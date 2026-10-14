// Local review fixtures only. Production reactions already arrive with each post.
export const DEMO_NOW = new Date('2026-10-14T11:30:00+05:00');
const people = [
  { id: 'ayazhan', name: 'Аяжан Даркеева', avatar: '/img/chats/ayazhan.png', initials: 'АД' },
  { id: 'daniyar', name: 'Данияр Кульманов', avatar: '/img/chats/daniyar.png', initials: 'ДК' },
  { id: 'erlan', name: 'Ерлан Абишев', avatar: '/img/chats/aray.png', initials: 'ЕА' },
  { id: 'arman', name: 'Арман Алимжанов', initials: 'АА' },
  { id: 'alina', name: 'Алина Сейтжанова', initials: 'АС' },
  { id: 'alex', name: 'Александр Константинопольский', initials: 'АК' },
];
export const me = { id: 'me', name: 'Вы', initials: 'Я' };
export const scenarios = [
  { id: 'menu', title: 'Своё сообщение', note: 'Прочтения + реакции' },
  { id: 'one-reader', title: 'Один читатель', note: 'Прочитано + время' },
  { id: 'incoming', title: 'Чужое сообщение', note: 'Только реакции' },
  { id: 'list', title: 'Реакции и просмотры', note: 'Один список без дублей' },
  { id: 'single', title: 'Одна реакция', note: 'Вложенный список' },
  { id: 'long', title: 'Длинный список', note: 'Прокрутка, длинное имя' },
  { id: 'readers-one', title: 'Один просмотр', note: 'Список из одного человека' },
  { id: 'readers-list', title: 'Просмотры', note: 'Прочитавшие и время' },
  { id: 'readers-long', title: 'Много просмотров', note: 'Прокрутка списка' },
  { id: 'no-readers', title: 'Никто не прочитал', note: 'Только строка реакций' },
  { id: 'no-reactions', title: 'Без реакций', note: 'В меню нет строки' },
  { id: 'personal', title: 'Личная переписка', note: 'Дата и галочки без перехода' },
];
export function reactionFixtures(scenario) {
  const count = scenario === 'no-reactions' || scenario.startsWith('readers-') || scenario === 'personal' ? 0 : scenario === 'single' ? 1 : scenario === 'long' ? 24 : 6;
  return Array.from({ length: count }, (_, i) => ({
    user: i < 6 ? people[i] : { id: `person-${i}`, name: ['Дарья Ким', 'Ерлан Сулейменов', 'Наталья Иванова', 'Алексей Смирнов', 'Айгерим Тлеубергенова', 'Михаил Петров'][i % 6], initials: ['ДК', 'ЕС', 'НИ', 'АС', 'АТ', 'МП'][i % 6] },
    emoji: ['👍', '❤️', '👍', '😂', '❤️', '🙏'][i % 6],
    createdAt: new Date(DEMO_NOW.getTime() - (i === 4 || i === 5 ? (i - 3) * 86400000 : (i + 1) * 120000)).toISOString(),
  }));
}
export const readers = people.slice(0, 3).map((user, i) => ({ user, createdAt: new Date(DEMO_NOW.getTime() - (i + 1) * 180000).toISOString() }));
export const singleReader = [{ user: people[0], createdAt: '2026-10-13T16:35:00+05:00' }];
export function sortReactions(reactions) {
  return [...reactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function groupReactions(reactions) {
  return reactions.reduce((groups, { emoji, user }) => { (groups[emoji] ||= []).push(user); return groups; }, {});
}
export function toggleReaction(reactions, emoji, user = me, now = DEMO_NOW) {
  const selected = reactions.some(item => item.user.id === user.id && item.emoji === emoji);
  const others = reactions.filter(item => item.user.id !== user.id);
  return selected ? others : [...others, { user, emoji, createdAt: now.toISOString() }];
}
export function formatTime(value, now = DEMO_NOW) {
  const date = new Date(value);
  const options = { timeZone: 'Asia/Almaty' };
  const day = d => new Intl.DateTimeFormat('en-CA', options).format(d);
  const time = new Intl.DateTimeFormat('ru-RU', { ...options, hour: '2-digit', minute: '2-digit' }).format(date);
  if (day(date) === day(now)) return `Сегодня в ${time}`;
  if (day(date) === day(new Date(now.getTime() - 86400000))) return `Вчера в ${time}`;
  return `${new Intl.DateTimeFormat('ru-RU', { ...options, day: 'numeric', month: 'short', ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) }).format(date)} в ${time}`;
}
export function readLabel(mine, entries) {
  if (!mine || entries.length === 0) return null;
  return `Прочитали ${entries.length}`;
}

export function shortTime(value, now = DEMO_NOW) {
  return formatTime(value, now).replace('Сегодня в ', '').replace('Вчера в ', 'Вчера, ').replace(' в ', ', ');
}

export function activityLabel(reactions, readEntries, mine = false) {
  const count = reactions.length;
  const readersCount = mine ? new Set(readEntries.map(item => item.user.id)).size : 0;
  const plural = count % 10 === 1 && count % 100 !== 11 ? 'реакция' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'реакции' : 'реакций';
  return count && readersCount ? `${count} ${plural} · ${readersCount} прочитали` : count ? `${count} ${plural}` : readersCount ? `Прочитали ${readersCount}` : null;
}

// A person appears once, even when they both read and reacted. Keep both times.
export function messageActivity(reactions, readEntries, mine = false) {
  const people = new Map();
  for (const { user, createdAt } of mine ? readEntries : []) {
    const existing = people.get(user.id);
    if (!existing || Date.parse(createdAt) > Date.parse(existing.readAt)) people.set(user.id, { user, readAt: createdAt, reactions: [] });
  }
  for (const { user, emoji, createdAt } of reactions) {
    const person = people.get(user.id) || { user, reactions: [] };
    const duplicate = person.reactions.find(item => item.emoji === emoji);
    if (!duplicate) person.reactions.push({ emoji, createdAt });
    else if (Date.parse(createdAt) > Date.parse(duplicate.createdAt)) duplicate.createdAt = createdAt;
    people.set(user.id, person);
  }
  return [...people.values()].sort((a, b) => Number(b.reactions.length > 0) - Number(a.reactions.length > 0)
    || Math.max(...b.reactions.map(item => Date.parse(item.createdAt)), Date.parse(b.readAt) || 0) - Math.max(...a.reactions.map(item => Date.parse(item.createdAt)), Date.parse(a.readAt) || 0)
    || a.user.name.localeCompare(b.user.name, 'ru'));
}
