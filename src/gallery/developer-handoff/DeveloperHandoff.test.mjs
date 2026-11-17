import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { CHAT_PRESETS } from '../../utils/chatThemeCatalog.js';
import { DOCS, SOURCE_MAP, storyUrl } from './handoffContent.js';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const metadata = JSON.parse(readFileSync(new URL('./mediaMetadata.json', import.meta.url), 'utf8'));

test('hub media metadata matches every canonical runtime video, without stale entries', () => {
  const live = CHAT_PRESETS.filter(theme => theme.video);
  assert.equal(live.length, 15);
  assert.deepEqual(Object.keys(metadata).sort(), live.map(theme => theme.id).sort());
  for (const theme of live) {
    const item = metadata[theme.id];
    assert.equal(item.bytes, statSync(resolve(root, `public${theme.video}`)).size, `${theme.id}: regenerate media metadata`);
    assert.equal(item.width, 720);
    assert.equal(item.height, 1280);
    assert.equal(item.audio, false);
    assert.equal(item.codec, 'h264');
    assert.ok([9, 24].includes(item.duration));
    assert.ok(existsSync(resolve(root, `public${theme.poster}`)));
  }
});
test('every theme has its actual wallpaper assets and documented source paths exist', () => {
  assert.equal(CHAT_PRESETS.length, 33);
  for (const theme of CHAT_PRESETS) {
    const asset = theme.poster || (theme.pattern ? `/img/chat-themes/${theme.id}.svg` : theme.group === 'gradient' ? `/img/chat-themes/grain-${theme.id.slice(5)}.svg` : null);
    if (asset) assert.ok(existsSync(resolve(root, `public${asset}`)), asset);
  }
  for (const [path] of [...SOURCE_MAP.flatMap(([, files]) => files), ...DOCS]) assert.ok(existsSync(resolve(root, path)), path);
});
test('Storybook URLs retain verified Cyrillic story IDs and same-origin delivery', () => {
  assert.equal(decodeURIComponent(storyUrl('темычатов')), '/storybook/?path=/story/экраны-настройки--темычатов');
  assert.equal(decodeURIComponent(storyUrl('память')), '/storybook/?path=/story/экраны-настройки--память');
});
