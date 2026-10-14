import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReaders, demoReactions, getReaders, mergeReadActivity, readSummary, readTime, RECEIPT_STATES } from './readReceiptsModel.js';

test('read details are visible only to the author and never for zero readers', () => {
  assert.equal(readSummary({ mine: false, readers: demoReaders(6) }), null);
  assert.equal(readSummary({ mine: true, readers: [] }), null);
});
test('group read count is concise for one, two, and large groups', () => {
  assert.equal(readSummary({ mine: true, readers: demoReaders(1) }), 'Прочитали 1');
  assert.equal(readSummary({ mine: true, readers: demoReaders(2) }), 'Прочитали 2');
  assert.equal(readSummary({ mine: true, readers: demoReaders(94) }), 'Прочитали 94');
});
test('private reads show only a date; the old list link now opens a static menu', () => {
  assert.equal(readSummary({ mine: true, readers: demoReaders(1), personal: true }), 'Вчера, 16:35');
  assert.equal(readSummary({ mine: false, readers: demoReaders(1), personal: true }), null);
  assert.equal(readSummary({ mine: true, readers: [], personal: true }), null);
  assert.ok(RECEIPT_STATES.filter(state => state.personal).every(state => state.view === 'menu'));
});
test('combined activity keeps one row per person and both event timestamps', () => {
  const readers = demoReaders(6), reactions = demoReactions(readers);
  const rows = mergeReadActivity(readers, reactions);
  assert.equal(rows.length, 6);
  assert.equal(rows.filter(row => row.emoji).length, 3);
  for (const reaction of reactions) {
    const row = rows.find(person => person.userId === reaction.userId);
    assert.equal(row.readAt, readers.find(person => person.userId === reaction.userId).readAt);
    assert.equal(row.reactedAt, reaction.reactedAt);
  }
  assert.deepEqual(rows.slice(0, 3).map(row => row.userId), reactions.slice().reverse().map(row => row.userId));
});
test('combined activity includes reaction-only people and keeps their latest reaction', () => {
  const onlyReaction = { userId: 'reactor', name: 'Реактор', emoji: '❤️', reactedAt: '2026-10-14T07:00:00Z' };
  const rows = mergeReadActivity(demoReaders(2), [onlyReaction, { ...onlyReaction, emoji: '👍', reactedAt: '2026-10-14T06:00:00Z' }, { ...onlyReaction, userId: 'invalid', reactedAt: 'invalid' }]);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].userId, 'reactor');
  assert.equal(rows[0].emoji, '❤️');
  assert.equal(rows[0].readAt, undefined);
});
test('author, delivered-only rows, invalid dates, and duplicate users are excluded', () => {
  const rows = [
    { userId: 'me', name: 'Автор', readAt: '2026-10-14T09:00:00Z' },
    { userId: 'unread', name: 'Не прочитал', deliveredAt: '2026-10-14T08:00:00Z', readAt: null },
    { userId: 'broken', name: 'Ошибка', readAt: 'invalid' },
    { userId: 'a', name: 'Алина', readAt: '2026-10-14T08:00:00Z' },
    { userId: 'a', name: 'Алина', readAt: '2026-10-14T08:05:00Z' },
  ];
  const readers = getReaders(rows, 'me');
  assert.deepEqual(readers.map(row => row.userId), ['a']);
  assert.equal(readers[0].readAt, '2026-10-14T08:05:00Z');
});
test('newest read first, equal timestamps ordered by name without changing input', () => {
  const rows = [
    { userId: 'd', name: 'Данияр', readAt: '2026-10-14T08:00:00Z' },
    { userId: 'a', name: 'Алина', readAt: '2026-10-14T08:00:00Z' },
    { userId: 'n', name: 'Нурлан', readAt: '2026-10-14T08:10:00Z' },
  ];
  assert.deepEqual(getReaders(rows, 'me').map(row => row.userId), ['n', 'a', 'd']);
  assert.deepEqual(rows.map(row => row.userId), ['d', 'a', 'n']);
});
test('read time uses Almaty calendar days across UTC midnight and year boundaries', () => {
  assert.equal(readTime('2026-10-13T20:05:00Z'), 'Сегодня, 01:05');
  assert.equal(readTime('2026-10-13T18:59:00Z'), 'Вчера, 23:59');
  assert.equal(readTime('2026-10-10T11:35:00Z'), '10 окт., 16:35');
  assert.equal(readTime('2025-10-10T11:35:00Z'), '10 окт. 2025 г., 16:35');
});
