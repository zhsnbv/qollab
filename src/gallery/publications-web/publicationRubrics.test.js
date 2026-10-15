import test from 'node:test';
import assert from 'node:assert/strict';
import { PUBLICATION_RUBRICS, rubricValue } from './publicationRubrics.js';
import { normalizeArticleResult } from './assistantArticle.js';

test('saved legacy rubric choices remain readable without mutating a post', () => {
  for (const legacy of ['digital', 'people', 'appointments', 'events']) {
    const post = Object.freeze({ rubric: legacy, type: 'project', title: 'Работы на участке' });
    assert.equal(rubricValue(post), 'production');
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
test('assistant accepts all current editorial rubrics and maps legacy responses', () => {
  for (const rubric of [...PUBLICATION_RUBRICS.map(item => item.value), 'digital']) {
    const result = normalizeArticleResult(JSON.stringify({ article: { title: 'Статья', lead: 'Кратко', body: 'Содержание', rubric } }), { type: 'news' });
    assert.equal(result.patch.rubric, rubric === 'digital' ? 'production' : rubric);
  }
});
