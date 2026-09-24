import test from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
const { notificationKey, notificationMode, saveNotificationMode } = await import('./chatNotifications.js');
test('list and profile resolve the same conversation, without sharing unrelated modes', () => {
  assert.equal(notificationKey({ to: '/chats/prodev' }), 'prodev');
  assert.equal(notificationKey({ profileId: 'ayazhan', title: 'Аяжан' }), 'ayazhan');
  assert.equal(notificationKey({ id: 'gen-1', title: 'Коллега' }), 'Коллега');
  assert.equal(notificationKey({ kind: 'bot' }), 'ergiz');
  assert.equal(notificationMode({ to: '/chats/prodev', muted: true }, { prodev: 'mentions' }), 'mentions');
  assert.equal(notificationMode({ profileId: 'ayazhan' }, { prodev: 'off' }), 'on');
});
test('saved changes preserve other chats, reject invalid modes and survive malformed storage', () => {
  saveNotificationMode('prodev', 'mentions');
  saveNotificationMode('ayazhan', 'off');
  assert.deepEqual(JSON.parse(storage.get('qollab-chat-notifications-v1')), { prodev: 'mentions', ayazhan: 'off' });
  assert.throws(() => saveNotificationMode('prodev', 'silent'));
  storage.set('qollab-chat-notifications-v1', 'broken');
  saveNotificationMode('prodev', 'on');
  assert.deepEqual(JSON.parse(storage.get('qollab-chat-notifications-v1')), { prodev: 'on' });
});
test('storage failure is surfaced rather than reported as a successful change', () => {
  localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => saveNotificationMode('prodev', 'off'), /Quota exceeded/);
});
