import assert from 'node:assert/strict';
import test from 'node:test';
import { addFeedSamples, FEED_SAMPLE_BATCH, MORE_FEED_POSTS } from './feedSamples.js';
import { addProductionImprovement, IMPROVEMENT_SAMPLE_BATCH, PRODUCTION_IMPROVEMENT } from './productionImprovement.js';

test('adds new content once and preserves edits, discussions and subscriptions', () => {
  const edited = { ...MORE_FEED_POSTS[0], title: 'Мой отредактированный проект', liked: true };
  const personal = { id: 'my-post', title: 'Моя статья' };
  const saved = { posts: [edited, personal], discussions: { [edited.id]: [{ id: 'reply' }] }, channel: { subscribed: false }, feedSubscriptions: { 'bts-news': false } };
  const result = addFeedSamples(saved);
  assert.equal(result.posts.length, MORE_FEED_POSTS.length + 1);
  assert.equal(result.posts.find(post => post.id === edited.id), edited);
  assert.equal(result.posts.find(post => post.id === personal.id), personal);
  assert.equal(result.channel, saved.channel);
  assert.equal(result.feedSubscriptions, saved.feedSubscriptions);
  assert.equal(result.discussions[edited.id], saved.discussions[edited.id]);
  assert.deepEqual(result.discussions[MORE_FEED_POSTS[1].id], []);
  assert.deepEqual(result.sampleBatches, [FEED_SAMPLE_BATCH]);
  assert.equal(addFeedSamples(result), result);
  const afterDeletion = { ...result, posts: result.posts.filter(post => post.id !== edited.id) };
  assert.equal(addFeedSamples(afterDeletion), afterDeletion);
  assert.equal(saved.posts.length, 2);
});

test('production improvement upgrades an existing feed without overwriting or resurrecting posts', () => {
  const saved = { posts: [{ id: 'personal', title: 'Моя статья' }], sampleBatches: [FEED_SAMPLE_BATCH], channel: { subscribed: false }, discussions: { personal: [{ id: 'comment' }] } };
  const added = addProductionImprovement(saved);
  assert.equal(added.posts[0], PRODUCTION_IMPROVEMENT);
  assert.equal(added.posts[1], saved.posts[0]);
  assert.equal(added.channel, saved.channel);
  assert.equal(added.discussions.personal, saved.discussions.personal);
  assert.deepEqual(added.discussions[PRODUCTION_IMPROVEMENT.id], []);
  assert.deepEqual(added.sampleBatches, [FEED_SAMPLE_BATCH, IMPROVEMENT_SAMPLE_BATCH]);
  assert.equal(addProductionImprovement(added), added);
  const edited = { ...PRODUCTION_IMPROVEMENT, title: 'Мои правки', effect: 75 };
  const withEdits = { ...saved, posts: [edited, ...saved.posts] };
  assert.equal(addProductionImprovement(withEdits).posts, withEdits.posts);
  const deleted = { ...added, posts: saved.posts };
  assert.equal(addProductionImprovement(deleted), deleted);
});
