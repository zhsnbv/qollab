import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAT_PRESETS } from '../utils/chatThemeCatalog.js';

const result = await build({
  entryPoints: [fileURLToPath(new URL('./ChatWallpaper.jsx', import.meta.url))],
  bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic', loader: { '.css': 'empty' },
  plugins: [{ name: 'external-packages', setup(builder) {
    builder.onResolve({ filter: /^[^./]/ }, args => ({ path: import.meta.resolve(args.path), external: true }));
  } }],
});
const { default: ChatWallpaper } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const render = (appearance, miniature = false) => renderToStaticMarkup(createElement(ChatWallpaper, { appearance, miniature }));

test('all 33 catalog miniatures remain static and never create or preload a video', () => {
  for (const theme of CHAT_PRESETS) {
    const html = render(theme, true);
    assert.doesNotMatch(html, /<video|\.mp4|rel="preload"[^>]*as="video"/, theme.id);
    if (theme.poster) {
      assert.ok(html.includes(`src="${theme.poster}"`), theme.id);
      assert.match(html, /loading="lazy"/);
    }
  }
});

test('15 actual live previews start invisible and retain a real poster underneath', () => {
  const themes = CHAT_PRESETS.filter(theme => theme.video);
  assert.equal(themes.length, 15);
  for (const theme of themes) {
    const html = render(theme);
    assert.equal((html.match(/<video/g) || []).length, 1, theme.id);
    assert.ok(html.includes(`src="${theme.video}"`));
    assert.ok(html.includes(`poster="${theme.poster}"`));
    assert.ok(html.indexOf('<img') < html.indexOf('<video'), 'poster must be painted below video');
    assert.match(html, /style="opacity:0"/);
    assert.match(html, /preload="none"/);
    assert.match(html, /muted=""/);
    assert.match(html, /loop=""/);
    assert.match(html, /playsInline=""/);
    assert.doesNotMatch(html, /autoPlay|controls=/, 'only the visibility policy may initiate playback');
  }
});

test('preserved photo themes and all other static presets never create a video', () => {
  for (const theme of CHAT_PRESETS.filter(theme => !theme.video)) {
    const html = render(theme);
    assert.doesNotMatch(html, /<video/, theme.id);
    if (theme.group === 'gradient') assert.match(html, /qa-wallpaper-grain/);
    if (theme.group === 'pattern') assert.match(html, /qa-pattern-layer/);
  }
  for (const id of ['live-lake', 'live-earth']) {
    const html = render({ preset: id, group: 'live', video: '/untrusted.mp4', poster: '/stale.webp' });
    assert.doesNotMatch(html, /<video|untrusted|stale/);
  }
});
