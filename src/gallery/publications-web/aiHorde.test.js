import test from 'node:test';
import assert from 'node:assert/strict';
import { generateArticleWithAiHorde } from './aiHorde.js';

test('cancelling a queued request cancels its server job and never returns a result', async t => {
  const controller = new AbortController();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, method: options.method || 'GET' });
    if (url.includes('/status/models')) return Response.json([{ name: 'koboldcpp/google/gemma-3-4b-it', count: 1, queued: 0 }]);
    if (options.method === 'POST') {
      return { ok: true, json: async () => { controller.abort(); return { id: 'test-job' }; } };
    }
    if (options.method === 'DELETE') return Response.json({});
    throw new Error('Unexpected request');
  });
  await assert.rejects(generateArticleWithAiHorde('Тестовый текст для редактирования.', { signal: controller.signal }), { name: 'AbortError' });
  assert.deepEqual(calls.map(call => call.method), ['GET', 'POST', 'DELETE']);
  assert.ok(calls.at(-1).url.endsWith('/generate/text/status/test-job'));
});

test('absence of a supported model is an explicit error, not fabricated output', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([{ name: 'thinking-model', count: 1, queued: 0 }]));
  await assert.rejects(generateArticleWithAiHorde('Тестовый текст.', { signal: new AbortController().signal }), /Квилли временно недоступен/);
});

test('continues truncated JSON in the same turn and returns actual provider text', async t => {
  let calls = 0; const prompts = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.includes('/status/models')) return Response.json([{ name: 'koboldcpp/gemma-3-4b-it', count: 1, queued: 0 }]);
    if (options.method === 'POST') { prompts.push(JSON.parse(options.body).prompt); return Response.json({ id: `job-${++calls}` }); }
    return Response.json({ done: true, generations: [{ text: calls === 1 ? '<qollab_article>{"article":' : '{"title":"Статья"}}</qollab_article>' }] });
  });
  const result = await generateArticleWithAiHorde('Задача', { signal: new AbortController().signal });
  assert.equal(calls, 2);
  assert.ok(prompts[1].endsWith('<qollab_article>{"article":'));
  assert.equal(result.text, '<qollab_article>{"article":{"title":"Статья"}}</qollab_article>');
});
