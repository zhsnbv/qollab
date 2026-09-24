import { useSyncExternalStore } from 'react';

const KEY = 'qollab-chat-notifications-v1';
const listeners = new Set();
const valid = (mode) => ['on', 'mentions', 'off'].includes(mode);
function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Object.fromEntries(Object.entries(value).filter(([, mode]) => valid(mode)));
  } catch { return {}; }
}
let modes = read();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
if (typeof window !== 'undefined') window.addEventListener('storage', (event) => {
  if (event.key === KEY || event.key === null) { modes = read(); emit(); }
});
export function useChatNotificationModes() {
  return useSyncExternalStore(subscribe, () => modes, () => modes);
}
export function notificationKey(chat) {
  return chat.notificationKey || (chat.to === '/chats/prodev' ? 'prodev' : chat.kind === 'bot' ? 'ergiz' : chat.profileId || chat.title);
}
export function notificationMode(chat, saved) {
  return saved[notificationKey(chat)] || (chat.muted ? 'off' : 'on');
}
export function saveNotificationMode(key, mode) {
  if (!key || !valid(mode)) throw new Error('Invalid notification mode');
  const next = { ...read(), [key]: mode };
  localStorage.setItem(KEY, JSON.stringify(next));
  modes = next;
  emit();
}
