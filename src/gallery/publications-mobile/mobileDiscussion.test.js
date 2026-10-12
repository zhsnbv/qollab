import test from 'node:test';
import assert from 'node:assert/strict';
import { appendComment, commentCount, sortComments, toggleCommentLike } from './mobileDiscussion.js';

const items = [{ id: 'parent', text: 'First', likes: 2, createdAt: 1, replies: [{ id: 'reply', likes: 0, replies: [] }] }, { id: 'second', likes: 6, createdAt: 2, replies: [] }];
test('adding a nested reply updates the total without changing other threads or the original', () => {
  const updated = appendComment(items, 'reply', { id: 'new', text: 'Nested', replies: [] });
  assert.equal(commentCount(updated), 4);
  assert.equal(commentCount(items), 3);
  assert.equal(updated[0].replies[0].replies[0].text, 'Nested');
  assert.deepEqual(updated[1], items[1]);
});
test('top-level comments and likes can be persisted and restored together', () => {
  const updated = toggleCommentLike(appendComment(items, null, { id: 'mine', likes: 0, createdAt: 3, replies: [] }), 'reply');
  const restored = JSON.parse(JSON.stringify(updated));
  assert.equal(restored[0].replies[0].liked, true);
  assert.equal(toggleCommentLike(restored, 'reply')[0].replies[0].liked, false);
  assert.equal(commentCount(restored), 4);
});
test('new and popular sorting leave original order and nested replies intact', () => {
  const updated = appendComment(items, null, { id: 'mine', likes: 0, createdAt: 3, replies: [] });
  assert.equal(sortComments(updated, 'new')[0].id, 'mine');
  assert.equal(sortComments(updated, 'popular')[0].id, 'second');
  assert.equal(updated[0].id, 'parent');
  assert.equal(sortComments(updated, 'new')[2].replies[0].id, 'reply');
});
