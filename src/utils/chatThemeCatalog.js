// Pure catalog and preference model. A chat theme is one indivisible preset.
const swatch = (light, dark, ink, darkInk = '#F3F5F7') => Object.freeze({ light, dark, ink, darkInk });
const palette = (incoming, outgoing) => Object.freeze({ incoming, outgoing });

// Kept for older integrations and audits; the settings UI selects presets only.
export const BUBBLE_COLORS = Object.freeze([
  { id: 'default', name: 'Стандартный' },
  { id: 'peach', name: 'Персик', light: '#FBE0C8', dark: '#63422E', ink: '#4A3326', darkInk: '#FFF0E2' },
  { id: 'blue', name: 'Лазурь', light: '#D6E8FF', dark: '#254C76', ink: '#213E61', darkInk: '#E2EEFF' },
  { id: 'mint', name: 'Мята', light: '#D5EDE2', dark: '#284F43', ink: '#244A3B', darkInk: '#DDF6E9' },
  { id: 'lavender', name: 'Ирис', light: '#E5DDF8', dark: '#493D6B', ink: '#443360', darkInk: '#F0E7FF' },
  { id: 'rose', name: 'Роза', light: '#F8DDE4', dark: '#68414E', ink: '#663D49', darkInk: '#FFE9F0' },
  { id: 'slate', name: 'Графит', light: '#39444D', dark: '#45525D', ink: '#FFFFFF', darkInk: '#FFFFFF' },
  { id: 'white', name: 'Жемчуг', light: '#FFFFFF', dark: '#30343B', ink: '#333940', darkInk: '#ECEEF3' },
].map(Object.freeze));

function preset(id, name, group, colors, poster = null) {
  return Object.freeze({
    id, name, group, wallpaper: id === 'standard' ? 'plain' : id,
    incoming: colors ? `${id}-in` : 'default', outgoing: colors ? `${id}-out` : 'default',
    palette: colors, pattern: group === 'pattern', poster, video: null,
  });
}

export const CHAT_PRESETS = Object.freeze([
  preset('standard', 'Стандартная', 'standard', null),
  preset('grad-horizon', 'Горизонт', 'gradient', palette(swatch('#F7F8FC', '#2B303D', '#303A50'), swatch('#DDE4F7', '#3D4966', '#2D3955', '#EDF2FF'))),
  preset('grad-sunset', 'Закат', 'gradient', palette(swatch('#FFF8F3', '#332D2B', '#4D3930'), swatch('#F8DDCB', '#594035', '#543629', '#FFF1E7'))),
  preset('grad-sage', 'Шалфей', 'gradient', palette(swatch('#F7F9F2', '#2C322D', '#344339'), swatch('#DBE8CD', '#3E503A', '#30462C', '#EFF8E6'))),
  preset('grad-mint', 'Мята', 'gradient', palette(swatch('#F2FAF7', '#263431', '#2C4540'), swatch('#CFEAE0', '#315248', '#24473E', '#EAF9F3'))),
  preset('grad-coast', 'Побережье', 'gradient', palette(swatch('#F4FAFC', '#29343B', '#2E424E'), swatch('#D0E5EE', '#354F60', '#284350', '#EAF5FC'))),
  preset('pattern-day', 'День', 'pattern', palette(swatch('#FFFCF6', '#34312B', '#494033'), swatch('#F2E1C5', '#574835', '#4D3C27', '#FFF5E5'))),
  preset('pattern-orbit', 'Орбиты', 'pattern', palette(swatch('#F8F7FC', '#2D2D3B', '#3C3652'), swatch('#E4DBF3', '#4B3E61', '#423254', '#F5EDFF'))),
  preset('pattern-garden', 'Сад', 'pattern', palette(swatch('#F7FAF3', '#29342D', '#33473A'), swatch('#D9E8CD', '#3B513D', '#30452F', '#ECF8E9'))),
  preset('pattern-travel', 'Путешествие', 'pattern', palette(swatch('#F5FAFC', '#28343B', '#2C424E'), swatch('#D4E7F0', '#344D61', '#294153', '#EAF5FF'))),
  preset('pattern-play', 'Игра', 'pattern', palette(swatch('#FCF7F9', '#342C33', '#4C3542'), swatch('#F1D8E3', '#553A4A', '#543343', '#FFF0F7'))),
  preset('art-coast', 'Берег', 'art', palette(swatch('#FFFCF5', '#313330', '#42453B'), swatch('#D9E9E3', '#3A514A', '#30483E', '#EDF9F3')), '/img/chat-themes/art-coast.webp'),
  preset('art-alpine', 'Альпы', 'art', palette(swatch('#F8FBFD', '#29343F', '#304455'), swatch('#D6E6F3', '#3A4D63', '#2C435A', '#EDF5FF')), '/img/chat-themes/art-alpine.webp'),
  preset('art-cabin', 'Домик', 'art', palette(swatch('#FAF8EF', '#323329', '#434332'), swatch('#E6E4CC', '#494D35', '#42442A', '#F6F7E5')), '/img/chat-themes/art-cabin.webp'),
  preset('art-lighthouse', 'Маяк', 'art', palette(swatch('#FCFAF7', '#323235', '#43434A'), swatch('#D8E6EB', '#3A4D58', '#30434D', '#EDF7FB')), '/img/chat-themes/art-lighthouse.webp'),
  preset('art-fields', 'Поля', 'art', palette(swatch('#FFFAF0', '#353127', '#4C412E'), swatch('#F0E2C4', '#574B32', '#4E3F26', '#FFF6E2')), '/img/chat-themes/art-fields.webp'),
  preset('live-coast', 'Прибой', 'live', palette(swatch('#F5FBFA', '#283636', '#2E4648'), swatch('#CFE7E9', '#345054', '#29474A', '#EAFAFC')), '/img/chat-themes/live-coast.webp'),
  preset('live-lake', 'Озеро', 'live', palette(swatch('#F8FAF5', '#2B342F', '#38483C'), swatch('#D9E6D5', '#3D5140', '#344831', '#EFF9EA')), '/img/chat-themes/live-lake.webp'),
  preset('live-earth', 'Планета', 'live', palette(swatch('#F5F8FC', '#26323F', '#304258'), swatch('#D2E1F5', '#344A69', '#2C405D', '#ECF4FF')), '/img/chat-themes/live-earth.webp'),
  preset('live-prism', 'Призма', 'live', palette(swatch('#FAF8FD', '#312D3C', '#42364F'), swatch('#E6DDF5', '#4B3F62', '#443253', '#F6EEFF')), '/img/chat-themes/live-prism.webp'),
  preset('live-poppies', 'Маки', 'live', palette(swatch('#FFF8F5', '#362E2F', '#503B3D'), swatch('#F3D6D8', '#57383E', '#562F36', '#FFF0F2')), '/img/chat-themes/live-poppies.webp'),
]);

const BY_ID = new Map(CHAT_PRESETS.map(theme => [theme.id, theme]));
export const getChatPreset = id => BY_ID.get(id) || CHAT_PRESETS[0];

// Old custom choices become a coherent preset with the closest wallpaper mood.
const LEGACY_WALLPAPERS = Object.freeze({
  plain: 'standard', sand: 'grad-sunset', sage: 'grad-sage', sky: 'grad-horizon', lilac: 'grad-horizon', mist: 'grad-coast',
  dunes: 'art-fields', botanical: 'pattern-garden', orbits: 'pattern-orbit', 'paper-garden': 'art-fields', tidal: 'art-coast',
  'aurora-live': 'live-prism', 'silk-live': 'live-poppies', 'tide-live': 'live-coast',
});
const LEGACY_PRESETS = Object.freeze({ air: 'grad-horizon', apricot: 'grad-sunset', matcha: 'grad-sage', 'aurora-live': 'live-prism', 'silk-live': 'live-poppies', 'tide-live': 'live-coast', paper: 'art-fields', tidal: 'art-coast', space: 'pattern-orbit' });
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validCompany = companyId => typeof companyId === 'string' && companyId.length > 0 && !['__proto__', 'prototype', 'constructor'].includes(companyId);

function appearanceFor(theme) {
  return { ...theme, preset: theme.id, motion: !!theme.video };
}
export const DEFAULT_CHAT_APPEARANCE = Object.freeze(appearanceFor(CHAT_PRESETS[0]));

export function resolveChatAppearance(preferences = {}, companyId) {
  const all = isRecord(preferences?.chatAppearance) ? preferences.chatAppearance : {};
  const saved = validCompany(companyId) && Object.hasOwn(all, companyId) ? all[companyId] : undefined;
  const presetId = typeof saved === 'string' ? saved : saved?.preset;
  // A known preset wins over every stale individual field and palette value.
  if (BY_ID.has(presetId)) return appearanceFor(BY_ID.get(presetId));
  const wallpaper = isRecord(saved) ? saved.wallpaper : undefined;
  if (BY_ID.has(wallpaper)) return appearanceFor(BY_ID.get(wallpaper));
  if (wallpaper && Object.hasOwn(LEGACY_WALLPAPERS, wallpaper)) return appearanceFor(getChatPreset(LEGACY_WALLPAPERS[wallpaper]));
  if (Object.hasOwn(LEGACY_PRESETS, presetId || '')) return appearanceFor(getChatPreset(LEGACY_PRESETS[presetId]));
  // The original global wallpaper belonged to ERG, never another workspace.
  if (saved === undefined && companyId === 'erg') return appearanceFor(getChatPreset(LEGACY_WALLPAPERS[preferences?.wallpaper]));
  return appearanceFor(CHAT_PRESETS[0]);
}

export function patchChatAppearance(preferences = {}, companyId, patch) {
  const presetId = typeof patch === 'string' ? patch : isRecord(patch) ? patch.preset : undefined;
  if (!validCompany(companyId) || !BY_ID.has(presetId)) return preferences;
  const all = isRecord(preferences?.chatAppearance) ? preferences.chatAppearance : {};
  return { ...preferences, chatAppearance: { ...all, [companyId]: { preset: presetId } } };
}

const selectedTheme = appearance => getChatPreset(typeof appearance === 'string' ? appearance : appearance?.preset || appearance?.id);
export function appearanceClass(appearance) {
  const theme = selectedTheme(appearance);
  return `qa-wallpaper qa-bubbles qa-wall-${theme.wallpaper}${theme.pattern ? ' qa-pattern' : ''}${theme.video ? '' : ' qa-motion-off'}${theme.palette ? ' qa-custom-in qa-custom-out' : ''}`;
}
export function appearanceStyle(appearance) {
  const colors = selectedTheme(appearance).palette;
  if (!colors) return {};
  const style = {};
  for (const [direction, key] of [['in', 'incoming'], ['out', 'outgoing']]) {
    const color = colors[key];
    style[`--chat-${direction}-light`] = color.light;
    style[`--chat-${direction}-dark`] = color.dark;
    style[`--chat-${direction}-ink-light`] = color.ink;
    style[`--chat-${direction}-ink-dark`] = color.darkInk;
  }
  return style;
}
