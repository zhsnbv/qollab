import test from 'node:test';
import assert from 'node:assert/strict';
import { demoReaders, getReaders, readSummary, readTime } from './readReceiptsModel.js';

test('read details are visible only to the author and never for zero readers', () => {
  assert.equal(readSummary({ mine: false, readers: demoReaders(6) }), null);
  assert.equal(readSummary({ mine: true, readers: [] }), null);
});
test('one reader uses time; exactly two switches to the count', () => {
  assert.equal(readSummary({ mine: true, readers: demoReaders(1) }), 'Прочитано вчера в 16:35');
  assert.equal(readSummary({ mine: true, readers: demoReaders(2) }), 'Просмотров сообщения: 2');
  assert.equal(readSummary({ mine: true, readers: demoReaders(94) }), 'Просмотров сообщения: 94');
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
  assert.equal(readTime('2026-10-13T20:05:00Z'), 'сегодня в 01:05');
  assert.equal(readTime('2026-10-13T18:59:00Z'), 'вчера в 23:59');
  assert.equal(readTime('2026-10-10T11:35:00Z'), '10 октября в 16:35');
  assert.equal(readTime('2025-10-10T11:35:00Z'), '10 октября 2025 г. в 16:35');
});
