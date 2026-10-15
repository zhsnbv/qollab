import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { EDITORIAL_POSTS, EDITORIAL_CASE_POSTS, addEditorialSamples, EDITORIAL_SAMPLE_BATCH } from './editorialSamples.js';
import { WEB_CASES, MOBILE_CASES } from '../publication-screens/cases.js';

test('editorial articles have separate identities, complete bodies, real media and source links', () => {
  assert.equal(new Set(EDITORIAL_POSTS.map(post => post.id)).size, EDITORIAL_POSTS.length);
  for (const post of EDITORIAL_POSTS) {
    const body = post.description.ops.map(op => op.insert).join('');
    assert.ok(body.length > 700);
    assert.notEqual(body.trim(), post.lead.trim());
    assert.ok(post.images.every(image => existsSync(new URL(`../../../public${image.src}`, import.meta.url))));
    assert.equal(new URL(post.source.url).hostname.replace(/^www\./, ''), 'erg.kz');
    assert.equal(post.mediaBackdrop, 'solid');
  }
  for (const cases of [WEB_CASES, MOBILE_CASES]) {
    for (const [rubric, post] of Object.entries(EDITORIAL_CASE_POSTS)) {
      assert.equal(cases.find(item => item.id === `rubric-${rubric}`).post, post);
    }
  }
});

test('existing feeds receive articles once without overwriting edits or restoring deleted samples', () => {
  const edited = { ...EDITORIAL_POSTS[0], title: 'Редакторская правка' };
  const saved = { posts: [{ id: 'personal' }, edited], discussions: { [edited.id]: [{ id: 'comment' }] }, feedSubscriptions: { 'erg-sport': false } };
  const result = addEditorialSamples(saved);
  assert.equal(result.posts.find(post => post.id === edited.id), edited);
  assert.equal(result.feedSubscriptions, saved.feedSubscriptions);
  assert.equal(result.discussions[edited.id], saved.discussions[edited.id]);
  assert.ok(result.sampleBatches.includes(EDITORIAL_SAMPLE_BATCH));
  assert.equal(addEditorialSamples(result), result);
  const afterDeletion = { ...result, posts: result.posts.filter(post => post.id !== edited.id) };
  assert.equal(addEditorialSamples(afterDeletion), afterDeletion);
});
