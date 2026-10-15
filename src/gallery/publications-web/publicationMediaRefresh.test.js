import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { refreshPublicationMedia, LEGACY_PUBLICATION_MEDIA } from './publicationMediaRefresh.js';

const image = (id, name) => ({ id, src: '/img/publications-web/' + name, caption: '', status: null });

test('saved articles get clean photos without losing copy, settings or selected cover', () => {
  const post = { id: 'news', title: 'Правка редактора', description: { ops: [{ insert: 'Основной текст' }] }, liked: true, comments: false, coverImageId: 'second', images: [image('first', 'prod-power-plant.webp'), image('second', 'prod-power-plant-02.webp')] };
  const result = refreshPublicationMedia(post);
  assert.equal(result.images.length, 1);
  assert.equal(result.images[0].src, '/img/publications-web/prod-power-plant-02.webp');
  assert.equal(result.coverImageId, 'first');
  assert.equal(result.title, post.title);
  assert.equal(result.description, post.description);
  assert.equal(result.liked, true);
  assert.equal(result.comments, false);
  assert.equal(post.images.length, 2);
  assert.equal(refreshPublicationMedia(result), result);
});

test('uploaded files, captions and repeat photos remain untouched', () => {
  const custom = { images: [{ id: 'a', src: 'https://example.com/prod-fire-drill.webp' }, { id: 'b', src: 'blob:upload' }, { id: 'c', src: 'blob:upload' }] };
  assert.equal(refreshPublicationMedia(custom), custom);
  const captioned = { images: [{ ...image('first', 'prod-furnace-01.webp'), caption: 'Комментарий редактора' }, image('second', 'prod-furnace-02.webp')] };
  assert.equal(refreshPublicationMedia(captioned).images.length, 2);
  assert.equal(refreshPublicationMedia(captioned).images[0].caption, 'Комментарий редактора');
});

test('project text slides become two real photos; video posters and all assets resolve', () => {
  const post = { body: 'Решение проекта', conclusion: 'Результаты', images: [1, 2, 3].map(n => image(`aglo-${n}`, `prod-aglo-project-0${n}.webp`)), videos: [{ url: 'https://youtu.be/example', poster: '/img/publications-web/prod-furnace-01.webp' }] };
  const result = refreshPublicationMedia(post);
  assert.equal(result.images.length, 2);
  assert.equal(result.body, post.body);
  assert.equal(result.conclusion, post.conclusion);
  assert.equal(result.videos[0].poster, '/img/publications-web/prod-furnace-02.webp');
  for (const name of Object.values(LEGACY_PUBLICATION_MEDIA)) {
    assert.ok(existsSync(new URL(`../../../public/img/publications-web/${name}`, import.meta.url)), name);
  }
});
