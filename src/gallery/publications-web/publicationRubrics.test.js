import test from 'node:test';
import assert from 'node:assert/strict';
import { PUBLICATION_RUBRICS, publicationRubric, rubricStyle, rubricValue } from './publicationRubrics.js';
import { normalizeArticleResult } from './assistantArticle.js';

test('historical invented labels are hidden without mutating saved posts', () => {
  for (const legacy of ['digital', 'people', 'appointments', 'events']) {
    const post = Object.freeze({ rubric: legacy, type: 'project', title: 'Работы на участке' });
    assert.equal(rubricValue(post), 'none');
    assert.equal(post.rubric, legacy);
    assert.equal(post.type, 'project');
  }
});
test('channel inference never replaces an explicit editor choice', () => {
  assert.equal(rubricValue({ channel: 'ERG Sport' }), 'sport');
  assert.equal(rubricValue({ channel: 'Eco Life' }), 'ecology');
  assert.equal(rubricValue({ channel: 'ERG Sport', rubric: 'none' }), 'none');
  assert.equal(rubricValue({ channel: 'ERG Sport', rubric: 'safety' }), 'safety');
  assert.equal(rubricValue({ rubric: 'unsupported' }), 'none');
});
test('assistant accepts only current editorial rubrics and ignores invented responses', () => {
  for (const rubric of [...PUBLICATION_RUBRICS.map(item => item.value), 'digital']) {
    const result = normalizeArticleResult(JSON.stringify({ article: { title: 'Статья', lead: 'Кратко', body: 'Содержание', rubric } }), { type: 'news' });
    assert.equal(result.patch.rubric, rubric === 'digital' ? undefined : rubric);
  }
});

test('Canva taxonomy contains exactly the four agreed editorial rubrics', () => {
  assert.deepEqual(PUBLICATION_RUBRICS.map(item => item.value), ['sport', 'safety', 'production', 'ecology']);
});

test('post type styling takes precedence over saved rubric without relabeling the article', () => {
  const audit = Object.freeze({ type: 'audit', rubric: 'safety' });
  const project = Object.freeze({ type: 'project', rubric: 'safety' });
  assert.equal(publicationRubric(audit), undefined);
  assert.equal(publicationRubric(project), undefined);
  assert.notEqual(rubricStyle(audit)['--pw-rubric-band'], rubricStyle(project)['--pw-rubric-band']);
  assert.equal(rubricStyle(audit)['--pw-cover-title'], '#fff');
  assert.equal(audit.rubric, 'safety');
});
