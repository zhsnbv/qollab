// Оформление: светлое, тёмное или по системе. Режим живёт в localStorage
// (в отличие от рабочего пространства, это настройка устройства, а не сессии),
// а на <html data-theme> всегда стоит уже вычисленная тема — токены в
// styles/tokens.css смотрят именно на неё.
export const THEME_KEY = 'qollab.theme';
export const THEME_MODES = ['light', 'dark', 'auto'];

const SURFACE = { light: '#ffffff', dark: '#2b2a27' };

export function getThemeMode() {
  const saved = localStorage.getItem(THEME_KEY);
  return THEME_MODES.includes(saved) ? saved : 'light';
}

const systemPrefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// Из режима получаем конкретную тему: auto спрашивает систему.
export function resolveTheme(mode) {
  if (mode === 'auto') return systemPrefersDark() ? 'dark' : 'light';
  return mode === 'dark' ? 'dark' : 'light';
}

export function applyTheme(mode) {
  const theme = resolveTheme(mode);
  document.documentElement.dataset.theme = theme;
  // Статус-бар и адресная строка красятся в цвет поверхности
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = SURFACE[theme];
  return theme;
}

export function setThemeMode(mode) {
  try { localStorage.setItem(THEME_KEY, mode); } catch { /* ignore */ }
  return applyTheme(mode);
}

// Следим за системной темой: нужно только в режиме «автоматически».
export function watchSystemTheme(getMode) {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mq) return () => {};
  const onChange = () => { if (getMode() === 'auto') applyTheme('auto'); };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

// Переключение тапом по логотипу на «Главной» осталось: оно фиксирует
// конкретную тему, поэтому режим перестаёт быть автоматическим.
export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setThemeMode(next);
}
