import { employees } from '../data/employees.js';

export const ACTIVE_SHARE_CHATS = [
  { id: 'saved', name: 'Избранное', saved: true },
  { id: 'ayazhan', name: 'Аяжан Сериккызы', role: 'Руководитель проекта', avatar: '/img/chats/ayazhan.png' },
  { id: 'daniyar', name: 'Данияр Кенжебаев', role: 'Коллега', avatar: '/img/chats/daniyar.png' },
  { id: 'prodev', name: 'PR01DEV + ROBOTS', kind: 'group', avatar: '/img/chats/bts-pr.png' },
  { id: 'bugs', name: 'qollab Bugs & Offers', kind: 'group', initials: 'QB', tint: 'violet' },
  { id: 'redesign', name: 'Редизайн qollab app & web', kind: 'group', initials: 'PQ', tint: 'green' },
  { id: 'mobile', name: 'mobile dev', kind: 'group', initials: 'MD', tint: 'green' },
  { id: 'ergiz', name: 'ERGiz — Искусственный интеллект', kind: 'bot', avatar: '/img/chats/ergiz-avatar.png' },
];

const normalize = value => String(value || '').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
export function searchShareRecipients(query, active = ACTIVE_SHARE_CHATS, directory = employees) {
  const q = normalize(query);
  const digits = q.replace(/\D/g, '');
  const match = item => [item.name, item.role, item.company].some(value => normalize(value).includes(q))
    || (digits.length >= 3 && String(item.phone || '').replace(/\D/g, '').includes(digits));
  const chats = active.filter(item => !item.dismissed && (!q || match(item)));
  const activeIds = new Set(active.map(item => item.id));
  const activeNames = new Set(active.map(item => normalize(item.name)));
  const people = q ? directory.filter(item => !item.dismissed && !activeIds.has(item.id) && !activeNames.has(normalize(item.name)) && match(item)) : [];
  return { chats, people };
}

export function profilePayload(person) {
  // Only the public preview fields travel with the contact card.
  const { id, name, avatar, initials, tint, role } = person;
  return { kind: 'profile', profile: { id, name, avatar, initials, tint, role } };
}

export function forwardedPayload(message, author = 'Коллега') {
  const { id: _id, time: _time, status: _status, mine: _mine, reactions: _reactions, pinned: _pinned, ...content } = message;
  const name = typeof author === 'object' ? author.short : author;
  return { ...content, forwardedFrom: message.forwardedFrom || name || 'Коллега' };
}

export function shareLink(payload, origin = window.location.origin) {
  if (payload?.profile) return `${origin}/person?id=${encodeURIComponent(payload.profile.id)}`;
  const source = payload?.source || { chatId: 'prodev', messageId: 'share-demo-message' };
  const route = source.chatId === 'prodev' ? '/chats/prodev?' : `/chats/dm?chat=${encodeURIComponent(source.chatId)}&`;
  return `${origin}${route}message=${encodeURIComponent(source.messageId)}`;
}

export function resolveShareChat(id) {
  return ACTIVE_SHARE_CHATS.find(item => item.id === id) || employees.find(item => item.id === id && !item.dismissed);
}
export function recipientChat(recipient) {
  return { ...recipient, profileId: recipient.id, title: recipient.name, initials: recipient.initials || recipient.name.split(' ').slice(0, 2).map(word => word[0]).join(''), fresh: true, preview: '', time: '', kind: recipient.saved ? 'saved' : recipient.kind };
}

const KEY = 'qollab-share-demo-v1';
const EVENT = 'qollab-share-changed';
let fallback = { chats: {}, sources: {} };
export function readShareStore() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || fallback; } catch { return fallback; }
}
function writeShareStore(store) {
  fallback = store;
  try { sessionStorage.setItem(KEY, JSON.stringify(store)); } catch { /* The current session still works without storage. */ }
  window.dispatchEvent(new Event(EVENT));
}
export function rememberShareSource(message, chatId, author) {
  const store = readShareStore();
  const payload = { ...forwardedPayload(message, author), source: message.source || { chatId, messageId: message.id } };
  store.sources[`${chatId}:${message.id}`] = message;
  writeShareStore(store);
  return payload;
}
export function deliverShare(recipient, payload) {
  const store = readShareStore();
  const message = { ...payload, id: `shared-${crypto.randomUUID()}`, mine: true, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), createdAt: Date.now(), status: 'delivered' };
  const previous = store.chats[recipient.id]?.messages || [];
  store.chats[recipient.id] = { recipient, messages: [...previous, message] };
  writeShareStore(store);
  return message;
}
export function sharedChatMessages(id) { return readShareStore().chats[id]?.messages || []; }
export function sharedSourceMessage(chatId, messageId) { return readShareStore().sources[`${chatId}:${messageId}`]; }
export function subscribeShares(callback) { window.addEventListener(EVENT, callback); return () => window.removeEventListener(EVENT, callback); }

export function sendShareToChat(recipient, payload, navigate) {
  deliverShare(recipient, payload);
  navigate(recipient.id === 'prodev' ? '/chats/prodev' : '/chats/dm', { state: { chat: recipientChat(recipient), shareSent: true } });
}

export function shareChatId(chat) {
  if (chat?.to === '/chats/prodev') return 'prodev';
  return chat?.profileId || ACTIVE_SHARE_CHATS.find(item => item.name === chat?.title)?.id || chat?.id || chat?.title;
}
export function mergeSharedChats(chats, store) {
  const deliveries = Object.entries(store.chats).filter(([, entry]) => entry.messages.length);
  const touched = new Set(deliveries.map(([id]) => id));
  const shared = deliveries.map(([id, entry]) => {
    const existing = chats.find(chat => shareChatId(chat) === id);
    const last = entry.messages.at(-1);
    return { ...existing, ...recipientChat(entry.recipient), id: existing?.id || id, to: id === 'prodev' ? '/chats/prodev' : undefined, historyPreview: existing?.historyPreview ?? existing?.preview, historyTime: existing?.historyTime ?? existing?.time, preview: last.profile ? `Профиль: ${last.profile.name}` : last.text || last.name || 'Вложение', time: last.time, fresh: existing ? false : true, lastMine: true, lastStatus: last.status, sharedAt: last.createdAt, unreadCount: undefined, unreadReaction: false };
  }).sort((a, b) => b.sharedAt - a.sharedAt);
  return [...shared, ...chats.filter(chat => !touched.has(shareChatId(chat)))];
}

export function removeSharedMessage(messageId) {
  const store = readShareStore();
  for (const entry of Object.values(store.chats)) entry.messages = entry.messages.filter(message => message.id !== messageId);
  writeShareStore(store);
}
