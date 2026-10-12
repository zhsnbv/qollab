import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublication, mergePublicationState, latestPublications } from './publicationModel.js';
import { commentCount, appendComment } from '../../gallery/publications-mobile/mobileDiscussion.js';

test('legacy search entries keep a stable identity, media and readable content', () => {
  const source = { channel: 'BTS News', title: 'Релиз', excerpt: 'Описание релиза', thumb: '/release.jpg', likes: '1 240', comments: '5' };
  const channels = [{ id: 'bts-news', name: 'BTS News', avatar: '/bts.png' }];
  const post = normalizePublication(source, channels);
  assert.equal(post.id, normalizePublication({ ...source }, channels).id);
  assert.equal(post.channelId, 'bts-news');
  assert.equal(post.likes, 1240);
  assert.equal(post.images[0].src, '/release.jpg');
  assert.equal(post.description.ops[0].insert, 'Описание релиза\n');
  assert.equal(post.comments, true);
});

test('article state keeps explicit IDs, disabled comments and complete project fields', () => {
  const post = normalizePublication({ id: 'project', channelId: 'erg-production', type: 'project', title: 'Проект', comments: false, effect: 50, authors: ['author'], problem: 'Проблема', images: [{ src: '/image.webp' }] });
  assert.equal(post.id, 'project'); assert.equal(post.comments, false); assert.equal(post.effect, 50);
  assert.deepEqual(post.authors, ['author']); assert.equal(post.problem, 'Проблема');
});

test('feed and reader derive identical reactions and threaded comment counts', () => {
  const post = normalizePublication({ id: 'news', title: 'Новость', likes: 42 });
  let thread = appendComment([], null, { id: 'c1', text: 'Первый', replies: [] });
  thread = appendComment(thread, 'c1', { id: 'c2', text: 'Ответ', replies: [] });
  const saved = { likes: { news: true }, threads: { news: thread } };
  const feed = mergePublicationState(post, saved, commentCount);
  const reader = mergePublicationState(post, JSON.parse(JSON.stringify(saved)), commentCount);
  assert.deepEqual(feed, reader); assert.equal(feed.commentCount, 2); assert.equal(feed.liked, true);
  assert.equal(feed.likes, 42); // The display adds one only once.
  assert.equal(post.commentCount, 0); // Never mutate source content.
});

test('home shows the four newest articles without changing the feed order', () => {
  const posts = [
    { id: 'pinned', date: '21 июл 2026, 15:24' },
    { id: 'morning', date: '9 окт 2026, 10:22' },
    { id: 'yesterday', date: '8 окт 2026, 16:49' },
    { id: 'newest', publishedAt: '2026-10-10T12:00:00Z' },
    { id: 'midday', date: '9 окт 2026, 11:16' },
    { id: 'unknown' },
  ];
  assert.deepEqual(latestPublications(posts).map(post => post.id), ['newest', 'midday', 'morning', 'yesterday']);
  assert.equal(posts[0].id, 'pinned');
});
