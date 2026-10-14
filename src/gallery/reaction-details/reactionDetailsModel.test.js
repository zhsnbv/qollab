import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_NOW, formatTime, groupReactions, reactionFixtures, readers, readLabel, singleReader, sortReactions, toggleReaction } from './reactionDetailsModel.js';

test('read receipts are author-only, singular includes time and plural includes count', () => {
  assert.equal(readLabel(false, readers), null);
  assert.equal(readLabel(true, []), null);
  assert.equal(readLabel(true, singleReader), 'Прочитано вчера в 16:35');
  assert.equal(readLabel(true, readers), 'Просмотров сообщения: 3');
});
test('count represents individual reactions, not distinct emoji', () => {
  const reactions = reactionFixtures('list');
  const groups = groupReactions(reactions);
  assert.equal(reactions.length, 6);
  assert.equal(Object.keys(groups).length, 4);
  assert.equal(Object.values(groups).flat().length, 6);
  assert.deepEqual(groupReactions(reactionFixtures('no-reactions')), {});
});
test('capsule toggles own reaction and preserves every other user', () => {
  const base = reactionFixtures('list');
  const added = toggleReaction(base, '👍');
  assert.equal(added.length, 7);
  assert.equal(groupReactions(added)['👍'].length, 3);
  const replaced = toggleReaction(added, '❤️');
  assert.equal(replaced.length, 7);
  assert.deepEqual(replaced.filter(item => item.user.id !== 'me'), base);
  assert.deepEqual(toggleReaction(replaced, '❤️'), base);
  assert.equal(base.length, 6);
});
test('removing last reaction leaves no entry or capsule', () => {
  const one = toggleReaction([], '👍');
  assert.equal(one.length, 1);
  assert.deepEqual(toggleReaction(one, '👍'), []);
});
test('flat list is newest-first without mutating source', () => {
  const base = reactionFixtures('long').reverse();
  const before = base.map(item => item.createdAt);
  const sorted = sortReactions(base);
  assert.equal(sorted.length, 24);
  assert.ok(new Date(sorted[0].createdAt) > new Date(sorted.at(-1).createdAt));
  assert.deepEqual(base.map(item => item.createdAt), before);
});
test('time handles today, yesterday and earlier dates in Almaty timezone', () => {
  assert.equal(formatTime(DEMO_NOW), 'Сегодня в 11:30');
  assert.equal(formatTime('2026-10-13T16:35:00+05:00'), 'Вчера в 16:35');
  assert.match(formatTime('2026-10-12T11:30:00+05:00'), /^12 окт.* в 11:30$/);
});
