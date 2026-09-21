// Сбор строк, которые реально попадут в перевод. Берём не «всю кириллицу», а
// результат работы самого плагина: так список расходится с поведением сборки
// ровно на ноль строк, а комментарии (их в проекте больше, чем текста) в него
// не попадают по построению.
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { transformAsync } from '@babel/core';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import i18n from '../src/i18n/babel-plugin-i18n.mjs';

const traverse = _traverse.default || _traverse;
const files = globSync('src/**/*.{js,jsx}').filter((f) => !f.endsWith('.test.js'));
const found = new Map();

for (const file of files) {
  const code = readFileSync(file, 'utf8');
  if (!/[А-Яа-яЁё]/.test(code)) continue;
  const out = await transformAsync(code, {
    filename: `/${file}`, plugins: [i18n], parserOpts: { plugins: ['jsx'] },
    configFile: false, babelrc: false,
  });
  const ast = parse(out.code, { sourceType: 'module', plugins: ['jsx'] });
  let local = null;
  traverse(ast, {
    ImportDeclaration(p) {
      if (p.node.source.value.endsWith('/i18n/runtime.js')) local = p.node.specifiers[0].local.name;
    },
    CallExpression(p) {
      if (!local || p.node.callee.name !== local) return;
      const arg = p.node.arguments[0];
      if (arg?.type !== 'StringLiteral') return;
      if (!found.has(arg.value)) found.set(arg.value, new Set());
      found.get(arg.value).add(file);
    },
  });
}

const rows = [...found.entries()]
  .map(([text, set]) => ({ text, files: [...set] }))
  .sort((a, b) => a.text.localeCompare(b.text, 'ru'));
writeFileSync(process.argv[2] || 'i18n-strings.json', JSON.stringify(rows, null, 2));
console.log(`строк: ${rows.length}`);
