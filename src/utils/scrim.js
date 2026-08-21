import { SURFACE, setStatusColor, resetStatusColor } from './theme';

// Затемняющий оверлей до полосы статуса не достаёт: в PWA её красит система по
// meta theme-color. Пока лист открыт, гасим и её — иначе поверх затемнённого
// экрана остаётся светлая полоса.
const DIM = 0.6; // столько остаётся от цвета поверхности под скримом 40%

let depth = 0;

export function pushScrim() {
  depth += 1;
  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  setStatusColor(dim(SURFACE[theme]));
}

export function popScrim() {
  depth = Math.max(0, depth - 1);
  // Цвет не запоминаем, а пересчитываем от текущей темы: пока лист открыт,
  // её могли переключить — как раз из листа «Оформление».
  if (!depth) resetStatusColor();
}

function dim(hex) {
  const h = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * DIM));
  return `rgb(${rgb.join(', ')})`;
}
