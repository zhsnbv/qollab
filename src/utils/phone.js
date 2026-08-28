// Казахстанский номер в одном месте: сначала эти функции жили в экране входа,
// но тот же ввод понадобился форме SOS-контакта — копия сразу начала бы
// расходиться с оригиналом.
export const digits = (s) => s.replace(/\D/g, '');

// +7 700 000 09 91
// Приводим ввод к казахстанскому виду: 8 в начале меняем на 7, недостающую
// семёрку подставляем сами, лишние цифры отбрасываем. Раньше state хранил всё
// набранное, из-за чего после одиннадцатой цифры кнопка снова гасла.
export function normalizePhone(raw) {
  const d = digits(raw).replace(/^8/, '7');
  if (!d) return '';
  return (d.startsWith('7') ? d : `7${d}`).slice(0, 11);
}

export function formatPhone(raw) {
  const d = digits(raw).replace(/^8/, '7').slice(0, 11);
  if (!d) return '';
  const p = d.startsWith('7') ? d : `7${d}`;
  const parts = [`+${p.slice(0, 1)}`];
  if (p.length > 1) parts.push(p.slice(1, 4));
  if (p.length > 4) parts.push(p.slice(4, 7));
  if (p.length > 7) parts.push(p.slice(7, 9));
  if (p.length > 9) parts.push(p.slice(9, 11));
  return parts.join(' ');
}

// «+7 7** *** ** 91» — как в макете экрана с кодом
export function maskPhone(raw) {
  const d = digits(raw);
  return `+7 ${d.slice(1, 2)}** *** ** ${d.slice(9, 11)}`;
}

// Номер набран полностью: +7 и десять цифр
export const isPhoneFull = (raw) => digits(raw).length === 11;
