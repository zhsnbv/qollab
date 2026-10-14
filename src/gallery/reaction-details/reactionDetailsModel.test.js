import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_NOW, formatTime, groupReactions, reactionFixtures, readers, readLabel, singleReader, sortReactions, toggleReaction, messageActivity, activityLabel, shortTime } from './reactionDetailsModel.js';

test('read receipt count is author-only', () => {
  assert.equal(readLabel(false, readers), null);
  assert.equal(readLabel(true, []), null);
  assert.equal(readLabel(true, singleReader), 'Прочитали 1');
  assert.equal(readLabel(true, readers), 'Прочитали 3');
});

test('combined activity deduplicates people and keeps reaction and read timestamps', () => {
  const reactions = reactionFixtures('list');
  const list = messageActivity(reactions, readers, true);
  assert.equal(list.length, 6);
  const person = list.find(item => item.user.id === readers[0].user.id);
  assert.equal(person.readAt, readers[0].createdAt);
  assert.equal(person.reactions[0].createdAt, reactions[0].createdAt);
  assert.equal(activityLabel(reactions, readers, true), '6 реакций · 3 прочитали');
  assert.ok(messageActivity(reactions, readers, false).every(item => !item.readAt));
  assert.equal(activityLabel(reactions, readers, false), '6 реакций');
  assert.equal(activityLabel([], []), null);
  assert.equal(activityLabel(reactions, readers, undefined), '6 реакций');
  assert.ok(messageActivity(reactions, readers, undefined).every(item => !item.readAt));
});

test('private read timestamp is short and read-only fixtures have no reactions', () => {
  assert.equal(shortTime(singleReader[0].createdAt), 'Вчера, 16:35');
  assert.equal(shortTime(DEMO_NOW), 'Сегодня, 11:30');
  assert.equal(reactionFixtures('personal').length, 0);
  assert.equal(reactionFixtures('readers-list').length, 0);
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
