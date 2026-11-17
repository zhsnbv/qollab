// Cloudflare static assets do not implement byte ranges. Keep this workaround
// scoped to small chat MP4s; app and Storybook retain their static routing.
// https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests
const PREFIX = '/video/chat-themes/';
// Runtime buffering guard for our own bundled files, not a catalog size policy.
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;

function plain(status, text, extra = {}) {
  return new Response(text, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}

// null means ignore the Range header (unknown unit, malformed, or multipart).
// false means a valid-looking byte range cannot select any bytes.
function byteRange(value, size) {
  if (!value) return null;
  const unit = /^bytes\s*=\s*(.*)$/i.exec(value.trim());
  if (!unit || unit[1].includes(',')) return null;
  const match = /^(\d*)-(\d*)$/.exec(unit[1].trim());
  if (!match || (!match[1] && !match[2])) return null;
  const total = BigInt(size);
  if (!match[1]) {
    const suffix = BigInt(match[2]);
    if (!suffix || !size) return false;
    return [Number(suffix >= total ? 0n : total - suffix), size - 1];
  }
  const start = BigInt(match[1]);
  const end = match[2] ? BigInt(match[2]) : total - 1n;
  if (!size || start >= total || end < start) return false;
  return [Number(start), Number(end >= total ? total - 1n : end)];
}

function ifRangeMatches(value, headers) {
  if (!value) return true;
  const validator = value.trim();
  if (validator.startsWith('W/')) return false;
  if (validator.startsWith('"')) {
    const etag = headers.get('ETag');
    return Boolean(etag && !etag.startsWith('W/') && validator === etag);
  }
  const modified = headers.get('Last-Modified');
  const date = Date.parse(validator);
  // If-Range uses exact validator equality, unlike If-Unmodified-Since.
  return Boolean(modified && Number.isFinite(date) && date === Date.parse(modified));
}

function notModified(request, headers) {
  const noneMatch = request.headers.get('If-None-Match');
  if (noneMatch !== null) {
    const current = headers.get('ETag')?.replace(/^W\//, '');
    return (noneMatch.match(/(?:W\/)?"[^"]*"|\*/g) || []).some(tag => tag === '*' || (current && tag.replace(/^W\//, '') === current));
  }
  const since = Date.parse(request.headers.get('If-Modified-Since') || '');
  const modified = Date.parse(headers.get('Last-Modified') || '');
  return Number.isFinite(since) && Number.isFinite(modified) && modified <= since;
}

async function boundedBody(response) {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_VIDEO_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

async function serveVideo(request, env) {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith(PREFIX)) return env.ASSETS.fetch(request);
  if (!/^\/video\/chat-themes\/[a-zA-Z0-9_-]+\.mp4$/.test(pathname)) return plain(404, 'Video not found');
  if (request.method !== 'GET' && request.method !== 'HEAD') return plain(405, 'Method not allowed', { Allow: 'GET, HEAD' });

  const sourceHeaders = new Headers(request.headers);
  for (const name of ['Range', 'If-Range', 'If-None-Match', 'If-Modified-Since']) sourceHeaders.delete(name);
  sourceHeaders.set('Accept-Encoding', 'identity');
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET', headers: sourceHeaders, redirect: 'manual' }));
  // Missing assets may resolve to the SPA shell. Never return HTML as a video.
  if (asset.status !== 200 || asset.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'video/mp4') {
    await asset.body?.cancel();
    return plain(asset.status >= 500 ? 502 : 404, 'Video not found');
  }
  const encoding = asset.headers.get('Content-Encoding');
  if (encoding && encoding !== 'identity') { await asset.body?.cancel(); return plain(502, 'Unexpected video encoding'); }
  const declared = asset.headers.get('Content-Length');
  const declaredSize = declared !== null && /^\d+$/.test(declared) ? Number(declared) : null;
  if (declaredSize !== null && declaredSize > MAX_VIDEO_BYTES) { await asset.body?.cancel(); return plain(413, 'Video exceeds range-serving limit'); }

  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.delete('Content-Range');
  headers.delete('Content-Encoding');
  if (notModified(request, headers)) {
    await asset.body?.cancel();
    headers.delete('Content-Length');
    return new Response(null, { status: 304, headers });
  }
  // Range is defined for GET, not HEAD. HEAD always describes the full object.
  if (request.method === 'HEAD' && declaredSize !== null) {
    await asset.body?.cancel();
    return new Response(null, { status: 200, headers });
  }
  const bytes = await boundedBody(asset);
  if (bytes === null) return plain(413, 'Video exceeds range-serving limit');
  const size = bytes.byteLength;
  headers.set('Content-Length', String(size));
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
  const range = ifRangeMatches(request.headers.get('If-Range'), headers) ? byteRange(request.headers.get('Range'), size) : null;
  if (range === false) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Content-Length', '0');
    return new Response(null, { status: 416, headers });
  }
  if (range) {
    const [start, end] = range;
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(bytes.subarray(start, end + 1), { status: 206, headers });
  }
  return new Response(bytes, { status: 200, headers });
}

export default { fetch: serveVideo };
