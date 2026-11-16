import { useCompany } from '../context/CompanyContext';
import { getSettingsPreferences, updateSettingsPreferences, useSettingsPreferences } from './settingsPreferences';

export const DEFAULT_CHAT_APPEARANCE = { wallpaper: 'plain', incoming: 'default', outgoing: 'default', pattern: false, motion: true, preset: 'standard' };
export const BUBBLE_COLORS = [
  { id: 'default', name: 'Стандартный' },
  { id: 'peach', name: 'Персик', light: '#FBE0C8', dark: '#63422E', ink: '#4A3326', darkInk: '#FFF0E2' },
  { id: 'blue', name: 'Лазурь', light: '#D6E8FF', dark: '#254C76', ink: '#213E61', darkInk: '#E2EEFF' },
  { id: 'mint', name: 'Мята', light: '#D5EDE2', dark: '#284F43', ink: '#244A3B', darkInk: '#DDF6E9' },
  { id: 'lavender', name: 'Ирис', light: '#E5DDF8', dark: '#493D6B', ink: '#443360', darkInk: '#F0E7FF' },
  { id: 'rose', name: 'Роза', light: '#F8DDE4', dark: '#68414E', ink: '#663D49', darkInk: '#FFE9F0' },
  { id: 'slate', name: 'Графит', light: '#39444D', dark: '#45525D', ink: '#FFFFFF', darkInk: '#FFFFFF' },
  { id: 'white', name: 'Жемчуг', light: '#FFFFFF', dark: '#30343B', ink: '#333940', darkInk: '#ECEEF3' },
];

export const CHAT_PRESETS = [
  { id: 'standard', name: 'Стандартная', group: 'classic', wallpaper: 'plain', incoming: 'default', outgoing: 'default', pattern: false },
  { id: 'air', name: 'Воздух', group: 'classic', wallpaper: 'sky', incoming: 'white', outgoing: 'blue', pattern: false },
  { id: 'apricot', name: 'Абрикос', group: 'classic', wallpaper: 'sand', incoming: 'white', outgoing: 'peach', pattern: true },
  { id: 'matcha', name: 'Матча', group: 'classic', wallpaper: 'sage', incoming: 'white', outgoing: 'mint', pattern: true },
  { id: 'aurora-live', name: 'Сияние', group: 'live', wallpaper: 'aurora-live', incoming: 'white', outgoing: 'lavender', pattern: false },
  { id: 'silk-live', name: 'Шёлк', group: 'live', wallpaper: 'silk-live', incoming: 'white', outgoing: 'rose', pattern: false },
  { id: 'tide-live', name: 'Прилив', group: 'live', wallpaper: 'tide-live', incoming: 'white', outgoing: 'mint', pattern: false },
  { id: 'paper', name: 'Бумажный сад', group: 'art', wallpaper: 'paper-garden', incoming: 'white', outgoing: 'peach', pattern: false },
  { id: 'tidal', name: 'Линии прилива', group: 'art', wallpaper: 'tidal', incoming: 'white', outgoing: 'blue', pattern: false },
  { id: 'space', name: 'Орбиты', group: 'art', wallpaper: 'orbits', incoming: 'white', outgoing: 'lavender', pattern: false },
];

// Legacy wallpaper belongs to ERG only. Other workspaces retain their own defaults.
export function resolveChatAppearance(preferences, companyId) {
  const legacy = companyId === 'erg' && preferences.wallpaper && preferences.wallpaper !== 'plain'
    ? { wallpaper: preferences.wallpaper, preset: 'custom' } : {};
  return { ...DEFAULT_CHAT_APPEARANCE, ...legacy, ...preferences.chatAppearance?.[companyId] };
}
export function patchChatAppearance(preferences, companyId, patch) {
  return { ...preferences, chatAppearance: { ...preferences.chatAppearance, [companyId]: { ...resolveChatAppearance(preferences, companyId), ...patch, preset: patch.preset || 'custom' } } };
}
export function useChatAppearance() {
  const { company, companyId } = useCompany();
  const preferences = useSettingsPreferences();
  return {
    company, companyId, appearance: resolveChatAppearance(preferences, companyId),
    update: patch => updateSettingsPreferences(patchChatAppearance(getSettingsPreferences(), companyId, patch)),
  };
}
export const appearanceClass = appearance => `qa-wallpaper qa-bubbles qa-wall-${appearance.wallpaper}${appearance.pattern ? ' qa-pattern' : ''}${appearance.motion === false ? ' qa-motion-off' : ''}${appearance.incoming !== 'default' ? ' qa-custom-in' : ''}${appearance.incoming === 'slate' ? ' qa-graphite-in' : ''}${appearance.outgoing !== 'default' ? ' qa-custom-out' : ''}`;
export function appearanceStyle(appearance) {
  const style = {};
  for (const [direction, key] of [['in', 'incoming'], ['out', 'outgoing']]) {
    const color = BUBBLE_COLORS.find(item => item.id === appearance[key]);
    if (!color?.light) continue;
    style[`--chat-${direction}-light`] = color.light;
    style[`--chat-${direction}-dark`] = color.dark;
    style[`--chat-${direction}-ink-light`] = color.ink;
    style[`--chat-${direction}-ink-dark`] = color.darkInk;
  }
  return style;
}
