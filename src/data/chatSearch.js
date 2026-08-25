// Данные для поиска в чатах (Figma node 25122-109552). Сообщения держим
// отдельным плоским списком: во вкладке «Сообщения» ищем именно по тексту,
// а не по названию чата.
export const recentPeople = [
  { id: 'ivan', name: 'Иван', avatar: '/img/chats/daniyar.png' },
  { id: 'asel', name: 'Асель', initials: 'АТ', tint: 'orange' },
  { id: 'alua', name: 'Алуа', avatar: '/img/chats/ayazhan.png' },
  { id: 'kanat', name: 'Канат', avatar: '/img/chats/daniyar.png' },
  { id: 'arman', name: 'Арман', avatar: '/img/chats/aray.png' },
  { id: 'erlan', name: 'Ерлан', avatar: '/img/chats/aray.png' },
];

export const chatMessages = [
  {
    id: 'm1', chat: 'Арман И.', avatar: '/img/chats/daniyar.png',
    time: '16:56', text: 'Нурлан! Как дела?',
  },
  {
    id: 'm2', chat: 'Асет Т.', avatar: '/img/chats/aray.png',
    time: '11:56', prefix: 'Вы: ', text: 'Нурлан?',
  },
  {
    id: 'm3', chat: 'BTS-PR01DEV', avatar: '/img/chats/bts-pr.png',
    time: 'вс', prefix: 'Арман Т.: ', text: 'Нурлан сегодня празднует ДР!',
  },
  {
    id: 'm4', chat: 'BTS-PR01DEV', avatar: '/img/chats/bts-pr.png',
    time: '31.01', prefix: 'Алия Ж.: ', text: 'Спросите у Нурлана',
  },
  {
    id: 'm5', chat: 'Аяжан Сериккызы', avatar: '/img/chats/ayazhan.png',
    time: '13:21', text: 'Салем, там задача по отчёту горит',
  },
  {
    id: 'm6', chat: 'Данияр Кенжебаев', avatar: '/img/chats/daniyar.png',
    time: '10:51', text: 'Вот зал куда мы ходим на тренировки',
  },
  {
    id: 'm7', chat: 'Ерлан Абишев', avatar: '/img/chats/aray.png',
    time: '09:01', text: 'Подпиши этот договор до конца недели',
  },
  {
    id: 'm8', chat: 'PR01DEV + ROBOTS', avatar: '/img/chats/bts-pr.png',
    time: '11:34', prefix: 'Арман А.: ', text: 'Релиз сдвинули на пятницу',
  },
];

const norm = (s) => (s || '').toLowerCase();

export function searchMessages(query) {
  const q = norm(query.trim());
  if (!q) return [];
  return chatMessages.filter((m) => norm(m.text).includes(q) || norm(m.chat).includes(q));
}

// Режем строку на куски вокруг совпадения — подсветку рисует уже компонент.
export function splitMatch(text, query) {
  const q = query.trim();
  if (!q) return [{ text, hit: false }];
  const parts = [];
  let rest = text;
  let idx = norm(rest).indexOf(norm(q));
  while (idx !== -1) {
    if (idx > 0) parts.push({ text: rest.slice(0, idx), hit: false });
    parts.push({ text: rest.slice(idx, idx + q.length), hit: true });
    rest = rest.slice(idx + q.length);
    idx = norm(rest).indexOf(norm(q));
  }
  if (rest) parts.push({ text: rest, hit: false });
  return parts;
}
