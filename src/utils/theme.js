// Тёмная тема временно переключается ТОЛЬКО тапом по логотипу qollab на
// «Главной» (по просьбе заказчика). Значение живёт на <html data-theme>,
// поэтому сохраняется при переходах между вкладками SPA.
// Токены темы см. в styles/tokens.css (html[data-theme="dark"]).
export function toggleTheme() {
  const el = document.documentElement;
  const next = el.dataset.theme === 'dark' ? 'light' : 'dark';
  el.dataset.theme = next;
  // Синхронизируем цвет статус-бара/адресной строки (Safari, PWA).
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === 'dark' ? '#2b2a27' : '#ffffff';
}
