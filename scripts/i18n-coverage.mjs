// Отчёт о покрытии: какие строки интерфейса остались без перевода.
// Учитывает и словарь, и правила, поэтому «102 публикации» промахом не считается.
import { readFileSync } from 'node:fs';
import { kk } from '../src/i18n/kk.js';
import { applyRules } from '../src/i18n/rules.js';

const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const t = (ru) => kk[ru] ?? kk[ru.trim()] ?? applyRules(ru, t) ?? ru;

const miss = rows.filter((r) => t(r.text) === r.text);
console.log(`всего: ${rows.length}, переведено: ${rows.length - miss.length}, осталось: ${miss.length}`);
if (process.argv[3] === '--list') miss.forEach((r) => console.log(JSON.stringify(r.text), r.files.join(' ')));
