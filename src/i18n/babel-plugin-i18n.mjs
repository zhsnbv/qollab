// Автоматическая локализация исходников.
//
// В прототипе около двух тысяч русских строк, разбросанных по ста с лишним
// файлам, и ещё больше русских комментариев. Оборачивать каждую строку руками
// значило бы переписать весь проект и потерять комментарии, поэтому переводом
// занимается сборка: плагин находит в коде кириллические литералы и заменяет
// их на вызов __t(). Словаря нет — строка возвращается как есть, поэтому
// непереведённое место остаётся русским, а не пустым.
//
// Комментарии плагин не трогает по построению: он работает с деревом разбора,
// где комментариев просто нет.
import * as t from '@babel/types';

const CYR = /[А-Яа-яЁё]/;
const RUNTIME = '/src/i18n/runtime.js';
const SKIP = [
  '/src/i18n/', '/src/gallery/', '/src/docs/', '/__stories__/',
  // Сама витрина — инструмент дизайнера, а не экран приложения: её шапка,
  // фильтры и подписи остаются русскими, иначе получается полуперевод, где
  // заголовок казахский, а названия групп рядом — русские.
  '/src/screens/AllScreens.jsx',
];

// Пробелы в JSX схлопываются: перенос строки с отступом исчезает совсем,
// а пробел внутри строки значим. Повторяем это правило, чтобы слова не слипались.
const edge = (ws) => (ws && !ws.includes('\n') ? ' ' : '');

export default function pluginI18n() {
  return {
    name: 'qollab-i18n',
    visitor: {
      Program: {
        enter(path, state) {
          const file = state.filename || '';
          // Сам словарь и рантайм переводить нельзя — получится рекурсия.
          // Витрина, сторибук и документация — тексты для команды, а не для
          // пользователя: их читает дизайнер, и они остаются на русском.
          state.skip = SKIP.some((dir) => file.includes(dir));
          if (state.skip) return;
          state.used = false;
          state.id = path.scope.generateUidIdentifier('t');
        },
        // Импорт добавляем в конце: если в файле не нашлось ни одной строки,
        // лишней зависимости не появляется.
        exit(path, state) {
          if (state.skip || !state.used) return;
          path.unshiftContainer('body', t.importDeclaration(
            [t.importSpecifier(t.cloneNode(state.id), t.identifier('t'))],
            t.stringLiteral(RUNTIME),
          ));
        },
      },
      StringLiteral(path, state) {
        if (state.skip || !CYR.test(path.node.value)) return;
        const { parent, node } = path;
        // Импорты, ключи объектов и уже обёрнутые строки пропускаем
        if (t.isImportDeclaration(parent) || t.isExportDeclaration(parent)) return;
        if (t.isObjectProperty(parent) && parent.key === node && !parent.computed) return;
        if (t.isJSXAttribute(parent) && !LOCALIZED_ATTR.has(parent.name.name)) return;
        if (t.isCallExpression(parent) && t.isIdentifier(parent.callee, { name: state.id.name })) return;
        state.used = true;
        const call = t.callExpression(t.cloneNode(state.id), [t.stringLiteral(node.value)]);
        // Значением атрибута может быть только строка или {выражение}
        path.replaceWith(t.isJSXAttribute(parent) ? t.jsxExpressionContainer(call) : call);
        path.skip();
      },
      TemplateLiteral(path, state) {
        if (state.skip) return;
        if (t.isTaggedTemplateExpression(path.parent)) return;
        if (!path.node.quasis.some((q) => CYR.test(q.value.cooked ?? ''))) return;
        state.used = true;
        // Склейку собираем вручную: заменить кусок шаблона вызовом нельзя,
        // поэтому шаблон превращается в сложение строк.
        const parts = [];
        path.node.quasis.forEach((q, i) => {
          const text = q.value.cooked ?? '';
          if (text) {
            parts.push(CYR.test(text)
              ? t.callExpression(t.cloneNode(state.id), [t.stringLiteral(text)])
              : t.stringLiteral(text));
          }
          if (path.node.expressions[i]) parts.push(path.node.expressions[i]);
        });
        if (!parts.length) return;
        if (parts.length === 1 && !t.isStringLiteral(parts[0])) parts.unshift(t.stringLiteral(''));
        path.replaceWith(parts.reduce((a, b) => t.binaryExpression('+', a, b)));
        path.skip();
      },
      JSXText(path, state) {
        if (state.skip || !CYR.test(path.node.value)) return;
        const raw = path.node.value;
        const core = raw.trim();
        const lead = edge(raw.slice(0, raw.indexOf(core)));
        const trail = edge(raw.slice(raw.indexOf(core) + core.length));
        state.used = true;
        let expr = t.callExpression(t.cloneNode(state.id), [t.stringLiteral(core)]);
        if (lead) expr = t.binaryExpression('+', t.stringLiteral(lead), expr);
        if (trail) expr = t.binaryExpression('+', expr, t.stringLiteral(trail));
        path.replaceWith(t.jsxExpressionContainer(expr));
        path.skip();
      },
    },
  };
}

// Атрибуты, текст которых видит пользователь. Остальные (className, id, src…)
// трогать нельзя.
const LOCALIZED_ATTR = new Set([
  'aria-label', 'aria-valuetext', 'placeholder', 'title', 'alt', 'label', 'note', 'hint',
]);
