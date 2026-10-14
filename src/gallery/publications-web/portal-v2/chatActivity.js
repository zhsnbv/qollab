// Session-only chat data. Both portal chat surfaces render this same model.
import { groupReactions, toggleReaction } from '../../reaction-details/reactionDetailsModel.js';

export const portalMe = { id: 'me', name: 'Вы', initials: 'Я' };
const asset = name => `/portal-v2/assets/${name}`;
const demoParticipants = [
  { id: 'ayazhan', name: 'Аяжан Сериккызы', avatar: asset('chat-ayazhan.png') },
  { id: 'daniyar', name: 'Данияр Кенжебаев', avatar: asset('chat-daniyar.png') },
  { id: 'nurlan', name: 'Нурлан Бейсенов', avatar: asset('chat-nurlan.png') },
  { id: 'arai', name: 'Арай Абишева', avatar: asset('chat-arai.png') },
  { id: 'aliya', name: 'Алия Сеитова', avatar: asset('chat-avatar-extra.png') },
  { id: 'arman', name: 'Арман Ибраимов', initials: 'АИ' },
];
export const isGroupChat = contact => Boolean(contact.members || contact.kind === 'group');
export const isPrivateChat = contact => !isGroupChat(contact) && !['bot', 'notifications'].includes(contact.kind);
const validTime = value => Number.isFinite(Date.parse(value));

export function normalizePortalReactions(reactions = []) {
  const users = new Map();
  for (const reaction of reactions) {
    if (!reaction?.user?.id || !reaction.emoji || !validTime(reaction.createdAt)) continue;
    const old = users.get(reaction.user.id);
    if (!old || Date.parse(reaction.createdAt) >= Date.parse(old.createdAt)) users.set(reaction.user.id, reaction);
  }
  return [...users.values()];
}
export function portalReadEntries(message, contact) {
  if (!message.own || ['bot', 'notifications'].includes(contact.kind)) return [];
  const readers = new Map();
  for (const entry of message.readEntries || []) {
    if (!entry?.user?.id || entry.user.id === portalMe.id || !validTime(entry.createdAt)) continue;
    const old = readers.get(entry.user.id);
    if (!old || Date.parse(entry.createdAt) > Date.parse(old.createdAt)) readers.set(entry.user.id, entry);
  }
  return [...readers.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function togglePortalReaction(message, emoji, at = new Date()) {
  message.reactions = toggleReaction(normalizePortalReactions(message.reactions), emoji, portalMe, at);
  return message.reactions;
}
export function portalReactionGroups(message) {
  return groupReactions(normalizePortalReactions(message.reactions));
}

// Seed the existing prototype messages, never synthesize reads when rendering.
export function seedPortalActivity(contact, at = new Date()) {
  if (['bot', 'notifications'].includes(contact.kind)) return;
  const group = isGroupChat(contact);
  const peers = group ? demoParticipants : [{ id: contact.id, name: contact.name, avatar: asset(contact.avatar) }];
  contact.messages.forEach((message, index) => {
    const sentAt = at.getTime() - (contact.messages.length - index + 1) * 180000;
    message.createdAt ||= new Date(sentAt).toISOString();
    if (message.own && message.status === 'read' && !message.readEntries) {
      message.readEntries = peers.slice(0, group ? 6 : 1).map((user, peerIndex) => ({ user, createdAt: new Date(sentAt + 30000 + peerIndex * 10000).toISOString() }));
    }
    if (group && index === (message.own ? 3 : 0) && !message.reactions.length) {
      message.reactions = peers.slice(0, 3).map((user, peerIndex) => ({ user, emoji: ['❤️', '👍', '😂'][peerIndex], createdAt: new Date(sentAt + 95000 + peerIndex * 10000).toISOString() }));
    }
  });
}
export function recordPortalRead(message, contact, at = new Date()) {
  if (!message.own || ['bot', 'notifications'].includes(contact.kind)) return;
  const peer = isGroupChat(contact) ? demoParticipants.find(person => person.id === 'arman') : { id: contact.id, name: contact.name, avatar: asset(contact.avatar) };
  message.readEntries ||= [];
  if (!message.readEntries.some(entry => entry.user.id === peer.id)) message.readEntries.push({ user: peer, createdAt: at.toISOString() });
  message.status = 'read';
}
