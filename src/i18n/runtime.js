// Рантайм перевода. Сюда ведут все вызовы, которые расставил babel-plugin-i18n.
//
// Ключ перевода — сама русская строка: словарь отдельно от кода, код остаётся
// читаемым, а промах по словарю отдаёт русский оригинал, а не пустоту.
//
// Язык читается синхронно при загрузке модуля, потому что часть текстов лежит
// в data/* и вычисляется прямо при импорте. Плагин добавляет импорт рантайма
// в начало каждого файла, поэтому к этому моменту язык уже известен.
import { kk } from './kk';
import { applyRules } from './rules';

export const LANG_KEY = 'qollab.lang';
export const LANGS = [
  { id: 'ru', label: 'Рус', title: 'Русский' },
  { id: 'kk', label: 'Қаз', title: 'Қазақша' },
];
// По умолчанию — русский: на нём написан весь исходный интерфейс, и казахский
// пока догоняет его по покрытию. Язык меняют в настройках или через ?lang=kk.
export const DEFAULT_LANG = 'ru';

const DICTS = { kk, ru: null };

function read() {
  // ?lang= сильнее сохранённого: по такой ссылке экран открывается на нужном
  // языке у любого, кому её отправили.
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (DICTS[q] !== undefined) return q;
    const saved = localStorage.getItem(LANG_KEY);
    if (DICTS[saved] !== undefined) return saved;
  } catch { /* приватный режим */ }
  return DEFAULT_LANG;
}

let lang = typeof window === 'undefined' ? DEFAULT_LANG : read();
let dict = DICTS[lang] || null;

if (typeof document !== 'undefined') document.documentElement.lang = lang;

export const getLang = () => lang;

// Перевод. Строка без перевода возвращается как есть — на экране останется
// русский, и это видно, в отличие от пустого места.
export function t(ru) {
  if (!dict) return ru;
  const hit = dict[ru];
  if (hit !== undefined) return hit;
  // Пробел и знаки препинания по краям в словаре не хранятся: одна и та же
  // фраза встречается и с точкой, и без.
  const core = ru.trim();
  if (core !== ru && dict[core] !== undefined) return ru.replace(core, dict[core]);
  // Счётчики, даты и статусы в словаре не лежат: их вариантов сотни,
  // и разбираются они по форме строки. Подробности — в rules.js.
  return applyRules(ru, t) ?? ru;
}

// Смена языка перезагружает страницу. Тексты из data/* вычисляются один раз
// при импорте модуля, и перерисовкой их не догнать — перезагрузка честнее
// половинчатого переключения, при котором часть экрана осталась бы на старом.
export function setLang(next) {
  if (DICTS[next] === undefined || lang === next) return;
  try { localStorage.setItem(LANG_KEY, next); } catch { /* приватный режим */ }
  const url = new URL(window.location.href);
  if (url.searchParams.has('lang')) url.searchParams.set('lang', next);
  window.location.replace(url);
}
