import test from 'node:test';
import assert from 'node:assert/strict';
import { articleSnapshot, createArticlePrompt, markdownDocument, normalizeArticleResult } from './assistantArticle.js';
import { documentText } from './blockDocument.js';
const context = { type: 'news', people: ['ivan'], companies: ['Компания'] };
const answer = article => `<qollab_article>${JSON.stringify({ article, message: 'Готово', warnings: [] })}</qollab_article>`;
const base = { title: 'Новый заголовок', lead: 'Краткое описание', body: '## Работа команды\nПроверили **оборудование**.\n- Первый шаг' };
test('whole article maps to editable text blocks, no settings or injected fields are accepted', () => {
  const { patch } = normalizeArticleResult(answer({ ...base, type: 'project', comments: false, anonymous: true, images: ['injected'], rubric: 'production' }), context);
  assert.equal(patch.title, base.title);
  assert.equal(patch.description.blocks[0].type, 'heading');
  assert.equal(patch.description.blocks[2].type, 'bulletListItem');
  assert.equal(patch.description.blocks[1].content[1].styles.bold, true);
  for (const name of ['type', 'comments', 'anonymous', 'images']) assert.equal(name in patch, false);
});
test('malformed, incomplete, HTML and embedded image results fail without applying partial output', () => {
  for (const raw of ['<qollab_article>{"article":', answer({ ...base, lead: '' }), answer({ ...base, body: '<script>alert(1)</script>' }), answer({ ...base, body: '![img](https://x.test/a)' }), answer({ ...base, title: 'x'.repeat(201) })]) assert.throws(() => normalizeArticleResult(raw, context));
});
test('project maps all six sections, strips duplicate prefix and validates people, money, company', () => {
  const { patch, warnings } = normalizeArticleResult(answer({ ...base, title: 'Проект-улучшение: Рельс', problem: 'Проблема', idea: 'Идея', difficulties: 'Согласование', conclusion: 'Результат', contacts: '', effect: 12, company: 'Компания', author: 'ivan', authors: ['ivan', 'unknown'], dossiers: { ivan: 'Инженер', unknown: 'Неизвестный' } }), { ...context, type: 'project' });
  assert.equal(patch.title, 'Рельс'); assert.equal(patch.effect, 12); assert.equal(patch.description, undefined);
  assert.equal(patch.body, base.body); assert.equal(patch.problem, 'Проблема'); assert.equal(warnings.length, 0);
  assert.deepEqual(patch.authors, ['ivan']); assert.deepEqual(patch.dossiers, { ivan: 'Инженер' });
});
test('missing project facts are warnings, invalid ratings and IDs are not filled', () => {
  const project = normalizeArticleResult(answer({ ...base, effect: -12 }), { ...context, type: 'project' });
  assert.ok(project.warnings.length); assert.equal(project.patch.effect, undefined);
  const audit = normalizeArticleResult(answer({ ...base, rating: 6, responsible: 'invented', company: 'invented' }), { ...context, type: 'audit' });
  assert.equal(audit.patch.rating, undefined); assert.equal(audit.patch.responsible, undefined); assert.equal(audit.patch.company, undefined);
});
test('source includes files, existing draft and previous result but never photo bytes', () => {
  const draft = { type: 'news', title: 'Исходник', description: markdownDocument('Текст'), images: [{ src: 'privatebytes' }], comments: true };
  const prompt = createArticlePrompt({ draft, prompt: 'Сделай короче', files: [{ kind: 'document', name: 'a.txt', text: 'Материал' }, { kind: 'image', src: 'privatebytes' }], messages: [{ role: 'assistant', text: 'Вариант', result: { patch: { title: 'Предыдущий вариант' } } }], people: [], companies: [] });
  assert.ok(prompt.includes('Материал')); assert.ok(prompt.includes('Предыдущий вариант')); assert.ok(!prompt.includes('privatebytes'));
  assert.equal(articleSnapshot(draft).comments, undefined);
  assert.equal(documentText(markdownDocument('Проверка')), 'Проверка');
});
test('oversize source is rejected, not silently truncated', () => {
  assert.throws(() => createArticlePrompt({ draft: { type: 'news' }, prompt: 'Статья', files: [{ kind: 'document', text: 'а'.repeat(13000), name: 'a.txt' }], messages: [], people: [], companies: [] }), /до 12 000 символов/);
});

test('quoted schemas in reasoning never count as the finished article', () => {
  const preamble = 'Answer as <qollab_article>...</qollab_article>. Thinking about the source.';
  assert.throws(() => normalizeArticleResult(preamble, context));
  const { patch } = normalizeArticleResult(preamble + answer(base), context);
  assert.equal(patch.title, base.title);
});
test('news prompt does not leak a participant directory into article facts', () => {
  const prompt = createArticlePrompt({ draft: { type: 'news' }, prompt: 'Книжный клуб', messages: [], files: [], people: [{ value: 'ivan', label: 'Иванов Иван' }], companies: [{ value: 'Компания' }] });
  assert.ok(!prompt.includes('Иванов Иван')); assert.ok(!prompt.includes('Компания'));
});
