import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSettingsStack, createSettingsStack, finishSettingsTransition, isSettingsLocation, settingsHistoryEntries, settingsLocationChain, settingsParentPath } from './settingsNavigation.js';

const loc = (pathname, key, background, extraState = {}) => ({ pathname, key, search: '', hash: '', state: { ...extraState, ...(background ? { background } : {}) } });
const profile = loc('/profile', 'profile');
const main = loc('/settings', 'main', profile);
const appearance = loc('/settings/appearance', 'appearance', main);
const chatTheme = loc('/settings/chat-theme', 'themes', appearance);
const motion = state => Object.fromEntries(state.layers.map(layer => [layer.location.pathname, layer.motion]));

function settled(location) { return createSettingsStack(location); }

test('direct deep entry reconstructs settings ancestors without an entry animation', () => {
  const state = settled(loc('/settings/chat-theme', 'direct'));
  assert.deepEqual(state.desired.map(item => item.pathname), ['/settings', '/settings/appearance', '/settings/chat-theme']);
  assert.equal(state.direction, 'none');
  assert.equal(state.active, '/settings/chat-theme');
  assert.ok(state.layers.every(layer => layer.motion === 'none'));
});

test('partial and cyclic background state is bounded, without duplicating layers', () => {
  const partial = loc('/settings/chat-theme', 'partial', { pathname: '/settings/appearance' });
  assert.deepEqual(settingsLocationChain(partial).map(item => item.pathname), ['/settings', '/settings/appearance', '/settings/chat-theme']);
  const circular = loc('/settings', 'cycle');
  circular.state.background = circular;
  assert.equal(settingsLocationChain(circular).length, 1);
  assert.equal(isSettingsLocation(loc('/settings-other', 'other')), false);
});

test('push retains the exact parent route and animates both adjacent layers', () => {
  const state = advanceSettingsStack(settled(main), appearance, 'PUSH');
  assert.equal(state.direction, 'push');
  assert.equal(state.layers[0].location, main);
  assert.deepEqual(motion(state), { '/settings': 'push-under', '/settings/appearance': 'push-in' });
  const complete = finishSettingsTransition(state, state.token);
  assert.equal(complete.layers.length, 2);
  assert.equal(complete.layers[0].location, main);
  assert.ok(complete.layers.every(layer => layer.motion === 'none'));
});

test('browser Back retains an inaccessible outgoing layer until animation completion', () => {
  const state = advanceSettingsStack(settled(chatTheme), appearance, 'POP');
  assert.equal(state.direction, 'pop');
  assert.equal(state.active, '/settings/appearance');
  assert.deepEqual(motion(state), { '/settings': 'none', '/settings/appearance': 'pop-under', '/settings/chat-theme': 'pop-out' });
  assert.equal(state.layers.at(-1).location, chatTheme);
  const complete = finishSettingsTransition(state, state.token);
  assert.deepEqual(complete.layers.map(layer => layer.location.pathname), ['/settings', '/settings/appearance']);
});

test('browser Forward is a push even though the router reports POP', () => {
  const state = advanceSettingsStack(settled(appearance), chatTheme, 'POP');
  assert.equal(state.direction, 'push');
  assert.equal(state.layers.at(-1).motion, 'push-in');
});

test('quick second Back drops the older outgoing layer and ignores stale completion', () => {
  const first = advanceSettingsStack(settled(chatTheme), appearance, 'POP');
  const second = advanceSettingsStack(first, main, 'POP');
  assert.deepEqual(motion(second), { '/settings': 'pop-under', '/settings/appearance': 'pop-out' });
  assert.equal(finishSettingsTransition(second, first.token), second);
  const complete = finishSettingsTransition(second, second.token);
  assert.deepEqual(complete.layers.map(layer => layer.location.pathname), ['/settings']);
});

test('Back during incoming animation reverses direction without a queued navigation', () => {
  const first = advanceSettingsStack(settled(main), appearance, 'PUSH');
  const second = advanceSettingsStack(first, main, 'POP');
  assert.equal(second.direction, 'pop');
  assert.equal(second.active, '/settings');
  assert.equal(finishSettingsTransition(second, first.token), second);
});

test('leaving settings retains only the departing layer and then removes the stack', () => {
  const state = advanceSettingsStack(settled(main), profile, 'POP');
  assert.equal(state.direction, 'pop');
  assert.equal(state.active, null);
  assert.deepEqual(motion(state), { '/settings': 'pop-out' });
  assert.equal(finishSettingsTransition(state, state.token).layers.length, 0);
});

test('unrelated app routes never produce settings layers or transitions', () => {
  const chats = loc('/chats', 'chats');
  const chat = loc('/chats/dm', 'dm', chats);
  const state = advanceSettingsStack(settled(chats), chat, 'PUSH');
  assert.equal(state.layers.length, 0);
  assert.equal(state.direction, 'none');
});

test('replace redirects do not push; explicit deep-link back can still pop', () => {
  const oldWallpaper = loc('/settings/wallpaper', 'old', appearance);
  const redirect = advanceSettingsStack(settled(oldWallpaper), chatTheme, 'REPLACE');
  assert.equal(redirect.direction, 'none');
  const fallback = loc('/settings/appearance', 'fallback', undefined, { settingsTransition: 'pop' });
  assert.equal(advanceSettingsStack(settled(chatTheme), fallback, 'REPLACE').direction, 'pop');
  assert.equal(settingsParentPath('/settings/chat-theme'), '/settings/appearance');
  assert.equal(settingsParentPath('/settings/storage'), '/settings');
});

test('review history supplies a real linked chain for every Back entry', () => {
  const entries = settingsHistoryEntries('/settings/chat-theme');
  assert.deepEqual(entries.map(entry => entry.pathname), ['/settings', '/settings/appearance', '/settings/chat-theme']);
  assert.equal(entries[0].state, null);
  assert.equal(entries[1].state.background, entries[0]);
  assert.equal(entries[2].state.background, entries[1]);
  for (const entry of entries) assert.equal(settled(entry).active, entry.pathname);
});

test('the same route event is idempotent and query changes do not animate a new screen', () => {
  const previous = settled(chatTheme);
  assert.equal(advanceSettingsStack(previous, chatTheme, 'PUSH'), previous);
  const next = advanceSettingsStack(previous, { ...chatTheme, key: 'filter', search: '?filter=art' }, 'PUSH');
  assert.equal(next.direction, 'none');
  assert.equal(next.layers.at(-1).location.search, '?filter=art');
});
