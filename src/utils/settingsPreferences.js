import { useSyncExternalStore } from 'react';

const KEY = 'qollab.settings.v2';
const DEFAULTS = { reaction: '❤️', wallpaper: 'plain', retention: 'month', limit: '5' };
const listeners = new Set();
let saved;
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
let preferences = { ...DEFAULTS, ...saved };
export const getSettingsPreferences = () => preferences;
export function updateSettingsPreferences(patch) {
  preferences = { ...preferences, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(preferences)); } catch { /* Session still works. */ }
  listeners.forEach(listener => listener());
}
export function useSettingsPreferences() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getSettingsPreferences, getSettingsPreferences);
}
export const WALLPAPERS = [
  { id: 'plain', name: 'Стандартные', kind: 'plain' },
  { id: 'sand', name: 'Тёплый свет', kind: 'mesh' },
  { id: 'sage', name: 'Тихий сад', kind: 'mesh' },
  { id: 'sky', name: 'Воздух', kind: 'mesh' },
  { id: 'lilac', name: 'Аврора', kind: 'mesh' },
  { id: 'mist', name: 'Север', kind: 'mesh' },
  { id: 'dunes', name: 'Дюны', kind: 'illustration' },
  { id: 'botanical', name: 'Ботаника', kind: 'illustration' },
  { id: 'orbits', name: 'Орбиты', kind: 'illustration' },
  { id: 'paper-garden', name: 'Бумажный сад', kind: 'illustration' },
  { id: 'tidal', name: 'Линии прилива', kind: 'illustration' },
  { id: 'aurora-live', name: 'Сияние', kind: 'live' },
  { id: 'silk-live', name: 'Шёлк', kind: 'live' },
  { id: 'tide-live', name: 'Прилив', kind: 'live' },
];
export const CACHE_CATEGORIES = [
  { id: 'video', name: 'Видео', mb: 1240, color: '#3D7EFF' },
  { id: 'photo', name: 'Фото', mb: 680, color: '#25C98D' },
  { id: 'files', name: 'Файлы', mb: 320, color: '#FFAE36' },
  { id: 'audio', name: 'Аудио', mb: 120, color: '#9C5AF7' },
  { id: 'other', name: 'Другое', mb: 40, color: '#F35E86' },
];
export const formatStorage = mb => mb >= 1000 ? `${(mb / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ГБ` : `${mb} МБ`;
