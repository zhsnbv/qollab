import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { messageDeliveryState } from '../utils/messageDelivery.js';

// Compile the actual components for SSR. Styles are checked separately by the
// source contrast audit; no DOM, browser, screenshot or network is simulated.
async function loadComponent(file) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(file, import.meta.url))],
    bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic',
    loader: { '.css': 'empty' },
    plugins: [{ name: 'external-packages', setup(builder) {
      builder.onResolve({ filter: /^[^./]/ }, args => ({ path: import.meta.resolve(args.path), external: true }));
    } }],
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const [{ default: Message, TimeRow }, { default: MessageDeliveryStatus }] = await Promise.all([
  loadComponent('./Message.jsx'), loadComponent('./MessageDeliveryStatus.jsx'),
]);
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));
const labels = { sending: 'Отправляется', sent: 'Отправлено', delivered: 'Доставлено', read: 'Прочитано', failed: 'Не отправлено' };

test('delivery states distinguish pending, sent, delivered, read and failed semantics', () => {
  const state = messageDeliveryState;
  assert.equal(state('sending').icon, 'clock');
  assert.equal(state('sent').icon, 'single-check');
  assert.equal(state('delivered').icon, 'double-check');
  assert.equal(state('read').icon, 'double-check');
  assert.equal(state('failed').icon, 'warning');
  assert.deepEqual(['sending', 'sent', 'delivered'].map(id => state(id).tone), ['neutral', 'neutral', 'neutral']);
  assert.equal(state('read').tone, 'read');
  assert.equal(state('failed').tone, 'failed');
  for (const unknown of [undefined, null, '', 'unknown', 'constructor', '__proto__']) {
    assert.equal(state(unknown).id, 'delivered', 'unknown legacy status must not claim a message was read');
  }
});

test('status component exposes one accessible label and the correct distinct glyphs', () => {
  const glyphs = {};
  for (const [status, label] of Object.entries(labels)) {
    const html = render(MessageDeliveryStatus, { status });
    assert.equal((html.match(/role="img"/g) || []).length, 1);
    assert.match(html, new RegExp(`aria-label="${label}"`));
    assert.match(html, /<svg[^>]*aria-hidden="true"/);
    assert.match(html, new RegExp(`data-delivery-state="${status}"`));
    glyphs[status] = html.match(/<path[^>]+>/)?.[0];
    assert.ok(glyphs[status]);
  }
  assert.notEqual(glyphs.sending, glyphs.sent);
  assert.notEqual(glyphs.sent, glyphs.delivered);
  assert.equal(glyphs.delivered, glyphs.read, 'same double-check shape, semantically distinct tone');
  assert.notEqual(glyphs.failed, glyphs.delivered);
  const decorative = render(MessageDeliveryStatus, { status: 'read', decorative: true, size: 18, className: 'activity-read' });
  assert.match(decorative, /message-delivery-status activity-read/);
  assert.match(decorative, /width="18"/);
  assert.doesNotMatch(decorative, /aria-label|role="img"/);
  assert.match(decorative, /<span[^>]*aria-hidden="true"/);
});

test('actual text, media, voice, document, profile and link messages retain every status and timestamp', () => {
  const samples = [
    { kind: 'text', text: 'Сообщение' },
    { kind: 'photo', img: '/test-photo.webp', text: 'Подпись' },
    { kind: 'video', img: '/test-poster.webp' },
    { kind: 'voice', duration: '0:15' },
    { kind: 'document', name: 'Отчёт.pdf', size: '2 МБ' },
    { kind: 'profile', profile: { name: 'Алия Серикова', initials: 'АС', role: 'Дизайнер' } },
    { kind: 'link', text: 'https://example.com' },
  ];
  for (const sample of samples) for (const [status, label] of Object.entries(labels)) {
    const msg = { ...sample, id: `${sample.kind}-${status}`, status, time: '12:34' };
    const own = render(Message, { msg, mine: true });
    assert.match(own, new RegExp(`data-status="${status}"`));
    assert.equal((own.match(/class="message-delivery-status"/g) || []).length, 1, `${msg.id}: exactly one status`);
    assert.match(own, new RegExp(`aria-label="${label}"`));
    assert.match(own, /class="msg-time">12:34<\/span>/);
    const incoming = render(Message, { msg, mine: false });
    assert.doesNotMatch(incoming, /message-delivery-status|data-status=/, `${msg.id}: no outgoing status on received message`);
    assert.match(incoming, /class="msg-time">12:34<\/span>/);
  }
});

test('reactions, embedded content and every timestamp variant keep a single status', () => {
  const msg = { id: 'reaction', text: 'Сообщение', time: '12:34', status: 'failed' };
  for (const extras of [
    { reactions: { '❤️': [{ id: 'me', initials: 'Я' }] } },
    { bubbleFooter: createElement('div', null, 'Вложение') },
  ]) {
    const html = render(Message, { msg, mine: true, ...extras });
    assert.match(html, /msg-time-row--inline/);
    assert.equal((html.match(/data-delivery-state="failed"/g) || []).length, 1);
  }
  for (const variant of ['overlay', 'inline', 'static', 'overlay-dark']) {
    for (const status of Object.keys(labels)) {
      const html = render(TimeRow, { mine: true, status, variant, time: '01:23' });
      assert.match(html, new RegExp(`msg-time-row--${variant}`));
      assert.match(html, new RegExp(`data-delivery-state="${status}"`));
      assert.match(html, /01:23/);
    }
  }
});
