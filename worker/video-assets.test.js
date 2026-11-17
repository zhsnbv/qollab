import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './video-assets.js';
const serveVideo = worker.fetch;
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;

const URL = 'https://example.test/video/chat-themes/live-sky-blue.mp4';
const BODY = Uint8Array.from({ length: 10 }, (_, i) => i);
const MODIFIED = 'Tue, 17 Nov 2026 07:00:00 GMT';
function fixture({ body = BODY, headers = {}, status = 200 } = {}) {
  const seen = [];
  const env = { ASSETS: { async fetch(request) {
    seen.push(request);
    return new Response(body, { status, headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(body.byteLength), ETag: '"v1"', 'Last-Modified': MODIFIED, 'Cache-Control': 'public, max-age=3600', ...headers } });
  } } };
  return { env, seen };
}
const request = (range, extra = {}, method = 'GET') => new Request(URL, { method, headers: { ...(range ? { Range: range } : {}), ...extra } });
async function data(response) { return [...new Uint8Array(await response.arrayBuffer())]; }

test('ordinary GET preserves bytes and validators and advertises ranges', async () => {
  const { env } = fixture(); const r = await serveVideo(request(), env);
  assert.equal(r.status, 200); assert.deepEqual(await data(r), [...BODY]);
  assert.equal(r.headers.get('Accept-Ranges'), 'bytes'); assert.equal(r.headers.get('Content-Length'), '10');
  assert.equal(r.headers.get('ETag'), '"v1"'); assert.equal(r.headers.get('Cache-Control'), 'public, max-age=3600');
});

test('Safari two-byte probe gets actual 206 bytes and ASSETS sees full GET', async () => {
  const { env, seen } = fixture(); const r = await serveVideo(request('bytes=0-1', { 'If-Range': '"v1"' }), env);
  assert.equal(r.status, 206); assert.deepEqual(await data(r), [0, 1]);
  assert.equal(r.headers.get('Content-Range'), 'bytes 0-1/10'); assert.equal(r.headers.get('Content-Length'), '2');
  assert.equal(seen[0].method, 'GET'); assert.equal(seen[0].headers.get('Range'), null);
  assert.equal(seen[0].headers.get('If-Range'), null); assert.equal(seen[0].headers.get('Accept-Encoding'), 'identity');
});

for (const [value, expected, contentRange] of [
  ['bytes=3-5', [3, 4, 5], 'bytes 3-5/10'], ['bytes=7-', [7, 8, 9], 'bytes 7-9/10'],
  ['bytes=-3', [7, 8, 9], 'bytes 7-9/10'], ['bytes=8-999', [8, 9], 'bytes 8-9/10'],
  ['bytes=-999999999999999999999', [...BODY], 'bytes 0-9/10'],
]) test(`single range ${value}`, async () => {
  const { env } = fixture(); const r = await serveVideo(request(value), env);
  assert.equal(r.status, 206); assert.equal(r.headers.get('Content-Range'), contentRange); assert.deepEqual(await data(r), expected);
});

for (const value of ['bytes=10-', 'bytes=5-2', 'bytes=-0', 'bytes=999999999999999999999-']) test(`unsatisfiable ${value}`, async () => {
  const { env } = fixture(); const r = await serveVideo(request(value), env);
  assert.equal(r.status, 416); assert.equal(r.headers.get('Content-Range'), 'bytes */10'); assert.equal(r.headers.get('Content-Length'), '0'); assert.deepEqual(await data(r), []);
});

for (const value of ['bytes=0-1,4-5', 'items=0-1', 'bytes=wat', 'bytes=-']) test(`unsupported or malformed ${value} is ignored`, async () => {
  const { env } = fixture(); const r = await serveVideo(request(value), env);
  assert.equal(r.status, 200); assert.equal(r.headers.get('Content-Range'), null); assert.deepEqual(await data(r), [...BODY]);
});

test('HEAD has no body and describes full representation even with Range', async () => {
  const { env, seen } = fixture(); const r = await serveVideo(request('bytes=0-1', {}, 'HEAD'), env);
  assert.equal(r.status, 200); assert.equal(r.headers.get('Content-Length'), '10'); assert.deepEqual(await data(r), []); assert.equal(seen[0].method, 'GET');
});

for (const [validator, status] of [['"v1"', 206], ['"stale"', 200], ['W/"v1"', 200], [MODIFIED, 206], ['Mon, 16 Nov 2026 07:00:00 GMT', 200], ['Wed, 18 Nov 2026 07:00:00 GMT', 200], ['invalid', 200]]) test(`If-Range ${validator}`, async () => {
  const { env } = fixture(); const r = await serveVideo(request('bytes=0-1', { 'If-Range': validator }), env);
  assert.equal(r.status, status); assert.equal((await data(r)).length, status === 206 ? 2 : 10);
});

test('weak response ETag cannot satisfy If-Range', async () => {
  const { env } = fixture({ headers: { ETag: 'W/"v1"' } }); const r = await serveVideo(request('bytes=0-1', { 'If-Range': '"v1"' }), env); assert.equal(r.status, 200);
});

test('If-None-Match is evaluated before Range and emits bodyless 304', async () => {
  const { env, seen } = fixture(); const r = await serveVideo(request('bytes=0-1', { 'If-None-Match': 'W/"v1"' }), env);
  assert.equal(r.status, 304); assert.deepEqual(await data(r), []); assert.equal(r.headers.get('Content-Length'), null); assert.equal(seen[0].headers.get('If-None-Match'), null);
});

test('If-Modified-Since works; a nonmatching ETag takes precedence', async () => {
  const { env } = fixture(); assert.equal((await serveVideo(request(null, { 'If-Modified-Since': MODIFIED }), env)).status, 304);
  assert.equal((await serveVideo(request(null, { 'If-None-Match': '"other"', 'If-Modified-Since': MODIFIED }), env)).status, 200);
});

test('unknown asset SPA fallback becomes 404 rather than HTML video', async () => {
  const { env } = fixture({ body: new TextEncoder().encode('<html>SPA</html>'), headers: { 'Content-Type': 'text/html' } });
  assert.equal((await serveVideo(request('bytes=0-1'), env)).status, 404);
});

test('non-video paths inside prefix are 404 without fetching', async () => {
  const { env, seen } = fixture(); const r = await serveVideo(new Request('https://example.test/video/chat-themes/index.html'), env);
  assert.equal(r.status, 404); assert.equal(seen.length, 0);
});

test('outside prefix preserves original static app/Storybook handling', async () => {
  const original = new Request('https://example.test/storybook/iframe.html'); const expected = new Response('storybook');
  const env = { ASSETS: { fetch(r) { assert.equal(r, original); return expected; } } };
  assert.equal(await serveVideo(original, env), expected);
});

test('unsupported method is rejected without fetching', async () => {
  const { env, seen } = fixture(); const r = await serveVideo(new Request(URL, { method: 'POST' }), env);
  assert.equal(r.status, 405); assert.equal(r.headers.get('Allow'), 'GET, HEAD'); assert.equal(seen.length, 0);
});

test('oversized declared file is rejected before buffering', async () => {
  const { env } = fixture({ headers: { 'Content-Length': String(MAX_VIDEO_BYTES + 1) } }); assert.equal((await serveVideo(request(), env)).status, 413);
});

test('missing length is bounded and HEAD still computes correct length', async () => {
  const env = { ASSETS: { fetch: () => new Response(BODY, { headers: { 'Content-Type': 'video/mp4' } }) } };
  const r = await serveVideo(request(null, {}, 'HEAD'), env); assert.equal(r.status, 200); assert.equal(r.headers.get('Content-Length'), '10'); assert.deepEqual(await data(r), []);
  const huge = { ASSETS: { fetch: () => new Response(new Uint8Array(MAX_VIDEO_BYTES + 1), { headers: { 'Content-Type': 'video/mp4' } }) } };
  assert.equal((await serveVideo(request(), huge)).status, 413);
});

test('unexpected compressed representation cannot be sliced as MP4 bytes', async () => {
  const { env } = fixture({ headers: { 'Content-Encoding': 'gzip' } }); assert.equal((await serveVideo(request('bytes=0-1'), env)).status, 502);
});
