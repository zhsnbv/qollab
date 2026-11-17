import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

async function loadComponent(file) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(file, import.meta.url))],
    bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic', loader: { '.css': 'empty' },
    plugins: [{ name: 'external-packages', setup(builder) {
      builder.onResolve({ filter: /^[^./]/ }, args => ({ path: import.meta.resolve(args.path), external: true }));
    } }],
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const [{ default: SettingsRouteStack }, { default: SettingsPage }] = await Promise.all([
  loadComponent('./SettingsRouteStack.jsx'), loadComponent('./SettingsPage.jsx'),
]);
const inRouter = (element, route = '/settings') => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [route] }, element));

test('initial deep-link markup exposes exactly one active pane and retains inert ancestors', () => {
  const location = { pathname: '/settings/chat-theme', key: 'direct', state: null };
  const html = inRouter(createElement(SettingsRouteStack, {
    location, renderLocation: entry => createElement(SettingsPage, { title: entry.pathname }, 'Content'),
  }), location.pathname);
  const panes = [...html.matchAll(/<div[^>]*class="st-route-layer"[^>]*>/g)].map(match => match[0]);
  assert.equal(panes.length, 3);
  assert.equal(panes.filter(pane => pane.includes('data-active="true"')).length, 1);
  assert.ok(panes.slice(0, -1).every(pane => pane.includes('inert=""') && pane.includes('aria-hidden="true"') && pane.includes('data-visible="false"')));
  assert.ok(!panes.at(-1).includes('inert=""'));
  assert.ok(panes.at(-1).includes('aria-hidden="false"'));
  assert.equal((html.match(/data-motion="none"/g) || []).length, 3);
  assert.match(html, /data-transition="none"/);
});

test('normal app routes do not create a settings wrapper or intercept interaction', () => {
  const html = inRouter(createElement(SettingsRouteStack, {
    location: { pathname: '/chats', key: 'chats' }, renderLocation: () => createElement('button', null, 'Unused'),
  }), '/chats');
  assert.equal(html, '');
});

test('SettingsPage preserves defaults and accepts the fixed-preview scroll layout class', () => {
  const normal = inRouter(createElement(SettingsPage, { title: 'Настройки' }, createElement('p', null, 'Содержимое')));
  assert.match(normal, /class="st-scroll"/);
  assert.match(normal, /class="st-bottom-spacer"/);
  assert.match(normal, /aria-label="Назад"/);
  const fixed = inRouter(createElement(SettingsPage, { title: 'Темы чатов', contentClassName: 'sc-theme-layout' }, 'Каталог'));
  assert.match(fixed, /class="st-scroll sc-theme-layout"/);
  assert.match(fixed, /<h1 class="st-title">Темы чатов<\/h1>/);
});
