import test from 'node:test';
import assert from 'node:assert/strict';
import { messageMenuCapabilities } from './messageMenuActions.js';

test('only own text and links can be edited, including legacy messages without kind', () => {
  for (const kind of [undefined, 'text', 'link']) {
    assert.equal(messageMenuCapabilities({ kind, text: 'Макеты готовы' }, true).edit, true);
    assert.equal(messageMenuCapabilities({ kind, text: 'Макеты готовы' }, false).edit, false);
  }
  for (const kind of ['voice', 'document', 'profile', 'photo', 'video']) {
    assert.equal(messageMenuCapabilities({ kind, text: 'Подпись' }, true).edit, false);
  }
  assert.equal(messageMenuCapabilities({ text: 'Имя', profile: { id: 'person' } }, true).edit, false);
});

test('copy remains available for text, attachment captions and profile links', () => {
  for (const message of [
    { text: 'Сообщение' }, { kind: 'link', text: 'https://example.test' },
    { kind: 'photo', text: 'Подпись' }, { kind: 'profile', profile: { id: 'person' } },
  ]) assert.equal(messageMenuCapabilities(message, false).copy, true);
});

test('empty attachments do not offer a copy action that would copy an empty string', () => {
  for (const message of [
    { kind: 'voice', duration: '0:12' }, { kind: 'document', name: 'Макеты.pdf' },
    { kind: 'photo' }, { kind: 'video' }, { kind: 'text', text: '  ' },
  ]) assert.equal(messageMenuCapabilities(message, true).copy, false);
});
