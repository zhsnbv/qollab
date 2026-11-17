import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAT_PRESETS, BUBBLE_COLORS, getChatPreset, resolveChatAppearance, patchChatAppearance, appearanceClass, appearanceStyle } from './chatThemeCatalog.js';

test('catalog has 33 complete presets, with 15 actual videos and two preserved static photos', () => {
  assert.equal(CHAT_PRESETS.length, 33);
  assert.equal(new Set(CHAT_PRESETS.map(theme => theme.id)).size, 33);
  assert.deepEqual(Object.fromEntries(['standard', 'gradient', 'pattern', 'art', 'photo', 'live'].map(group => [group, CHAT_PRESETS.filter(theme => theme.group === group).length])), { standard: 1, gradient: 5, pattern: 5, art: 5, photo: 2, live: 15 });
  for (const theme of CHAT_PRESETS) {
    assert.equal(theme.wallpaper, theme.id === 'standard' ? 'plain' : theme.id);
    assert.equal(theme.pattern, theme.group === 'pattern');
    assert.equal(theme.video, theme.group === 'live' ? `/video/chat-themes/${theme.id}.mp4` : null);
    const posterId = theme.id === 'live-lake' ? 'live-steppe' : ['live-coast', 'live-prism', 'live-poppies'].includes(theme.id) ? `${theme.id}-v11` : theme.id;
    if (['art', 'photo', 'live'].includes(theme.group)) assert.equal(theme.poster, `/img/chat-themes/${posterId}.webp`);
    else assert.equal(theme.poster, null);
    const selected = patchChatAppearance({}, 'erg', { preset: theme.id });
    assert.equal(resolveChatAppearance(selected, 'erg').preset, theme.id);
    assert.equal(resolveChatAppearance(selected, 'erg').motion, theme.group === 'live', 'only actual canonical videos enable motion');
  }
  assert.equal(BUBBLE_COLORS.length, 8, 'legacy exports remain available, but are not the selectable catalog');
});

test('known selection always wins over stale colors, wallpaper, pattern and palette', () => {
  const saved = { preset: 'grad-mint', wallpaper: 'dunes', incoming: 'slate', outgoing: 'rose', pattern: true, palette: { incoming: { light: '#000000' } }, video: '/arbitrary.mp4', motion: true };
  const actual = resolveChatAppearance({ chatAppearance: { erg: saved } }, 'erg');
  const canonical = getChatPreset('grad-mint');
  for (const key of ['wallpaper', 'incoming', 'outgoing', 'pattern', 'palette', 'video']) assert.deepEqual(actual[key], canonical[key]);
  assert.equal(actual.motion, false);
  assert.deepEqual(appearanceStyle(saved), appearanceStyle(canonical));
  assert.equal(appearanceClass(saved), appearanceClass(canonical));
  assert.ok(!appearanceClass(saved).includes('dunes'));
});

test('legacy custom wallpapers migrate by visual family instead of retaining individual overrides', () => {
  const expected = {
    plain: 'standard', sand: 'grad-sunset', sage: 'grad-sage', sky: 'grad-horizon', lilac: 'grad-horizon', mist: 'grad-coast',
    dunes: 'art-fields', botanical: 'pattern-garden', orbits: 'pattern-orbit', 'paper-garden': 'art-fields', tidal: 'art-coast',
    'aurora-live': 'live-prism', 'silk-live': 'live-poppies', 'tide-live': 'live-coast',
  };
  for (const [wallpaper, id] of Object.entries(expected)) {
    const resolved = resolveChatAppearance({ chatAppearance: { erg: { preset: 'custom', wallpaper, incoming: 'slate', outgoing: 'slate' } } }, 'erg');
    assert.equal(resolved.preset, id, wallpaper);
    assert.equal(resolved.incoming, getChatPreset(id).incoming);
    assert.equal(resolved.outgoing, getChatPreset(id).outgoing);
  }
  assert.equal(resolveChatAppearance({ chatAppearance: { erg: { preset: 'air' } } }, 'erg').preset, 'grad-horizon');
  assert.equal(resolveChatAppearance({ chatAppearance: { erg: { preset: 'custom', wallpaper: 'art-cabin' } } }, 'erg').preset, 'art-cabin');
  assert.equal(resolveChatAppearance({ chatAppearance: { erg: { preset: 'unknown', wallpaper: 'missing' } } }, 'erg').preset, 'standard');
});

test('legacy global wallpaper belongs to ERG, and workspace selections remain isolated', () => {
  const original = { wallpaper: 'sky', theme: 'auto', reaction: '🔥', chatAppearance: { integra: { preset: 'live-earth' } } };
  assert.equal(resolveChatAppearance(original, 'erg').preset, 'grad-horizon');
  assert.equal(resolveChatAppearance(original, 'integra').preset, 'live-earth');
  assert.equal(resolveChatAppearance({ wallpaper: 'sky' }, 'integra').preset, 'standard');
  const next = patchChatAppearance(original, 'erg', { preset: 'art-fields', outgoing: 'blue', wallpaper: 'sky' });
  assert.deepEqual(next.chatAppearance.erg, { preset: 'art-fields' }, 'only the selected preset id is persisted');
  assert.deepEqual(next.chatAppearance.integra, original.chatAppearance.integra);
  assert.equal(next.theme, 'auto');
  assert.equal(next.reaction, '🔥');
  assert.equal(original.chatAppearance.erg, undefined, 'input preferences are not mutated');
  const reset = patchChatAppearance(next, 'erg', 'standard');
  assert.equal(resolveChatAppearance(reset, 'erg').preset, 'standard', 'explicit standard overrides a leftover global wallpaper');
  assert.equal(resolveChatAppearance(reset, 'integra').preset, 'live-earth');
});

test('individual colors, wallpaper, pattern, motion and invalid ids cannot be patched', () => {
  const preferences = { chatAppearance: { erg: { preset: 'pattern-play' } } };
  for (const patch of [{ incoming: 'white' }, { outgoing: 'slate' }, { wallpaper: 'art-cabin' }, { pattern: false }, { motion: true }, { preset: 'custom' }, { preset: 'missing' }, {}, null, undefined]) {
    assert.equal(patchChatAppearance(preferences, 'erg', patch), preferences);
  }
  for (const company of ['', null, '__proto__', 'constructor']) assert.equal(patchChatAppearance(preferences, company, { preset: 'standard' }), preferences);
  assert.equal(resolveChatAppearance(null, 'erg').preset, 'standard');
  assert.equal(resolveChatAppearance({ chatAppearance: [] }, 'erg').preset, 'standard');
});

test('styles use the canonical preset in actual chat and catalog preview without changing workspace tokens', () => {
  assert.deepEqual(appearanceStyle(getChatPreset('standard')), {});
  for (const preset of CHAT_PRESETS.slice(1)) {
    const fromResolved = appearanceStyle(resolveChatAppearance({ chatAppearance: { erg: { preset: preset.id } } }, 'erg'));
    const fromTile = appearanceStyle(preset);
    assert.deepEqual(fromResolved, fromTile);
    assert.equal(Object.keys(fromTile).length, 10);
    assert.ok(Object.keys(fromTile).every(key => key.startsWith('--chat-')));
    assert.equal(fromTile['--chat-in-light'], preset.palette.incoming.light);
    assert.equal(fromTile['--chat-out-dark'], preset.palette.outgoing.dark);
    assert.equal(fromTile['--chat-status-read-light'], preset.palette.read.light);
    assert.equal(fromTile['--chat-status-read-dark'], preset.palette.read.dark);
    assert.ok(appearanceClass(preset).includes('qa-custom-in qa-custom-out'));
  }
  assert.deepEqual(appearanceStyle({ preset: 'missing', palette: { incoming: { light: '#000000' } } }), {});
});

// Read current native standard colors instead of duplicating brand/theme values.
const tokenCss = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const companyCss = readFileSync(new URL('../styles/companies.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
function declarations(css, selector) {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `Missing CSS scope ${selector}`);
  const open = css.indexOf('{', start), close = css.indexOf('}', open);
  return Object.fromEntries([...css.slice(open + 1, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
}
function standardColors(company, mode, direction) {
  const vars = { ...declarations(tokenCss, ':root') };
  if (mode === 'dark') Object.assign(vars, declarations(tokenCss, 'html[data-theme="dark"], .ru-board-frame'));
  if (company === 'integra') Object.assign(vars, declarations(companyCss, 'html[data-company="integra"] {'));
  if (company === 'integra' && mode === 'dark') Object.assign(vars, declarations(companyCss, 'html[data-company="integra"][data-theme="dark"]'));
  return { background: vars[direction === 'incoming' ? '--color-background' : '--color-primary-bg-hover'], ink: vars['--color-text'] };
}
const rgb = hex => {
  assert.match(hex, /^#[\da-f]{6}$/i);
  return hex.slice(1).match(/../g).map(part => parseInt(part, 16));
};
const mix = (a, b, weight) => a.map((value, index) => value * weight + b[index] * (1 - weight));
const luminance = rgb => rgb.map(value => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);

test('all 33 presets retain readable bodies, metadata, voice bars, reactions and darker edges in both brands/themes', t => {
  let surfaces = 0;
  const minima = { body: Infinity, metadata: Infinity, waveform: Infinity, reaction: Infinity };
  for (const preset of CHAT_PRESETS) for (const company of ['erg', 'integra']) for (const mode of ['light', 'dark']) for (const direction of ['incoming', 'outgoing']) {
    const swatch = preset.palette?.[direction];
    const values = swatch ? { background: swatch[mode], ink: swatch[mode === 'light' ? 'ink' : 'darkInk'] } : standardColors(company, mode, direction);
    const bg = rgb(values.background), ink = rgb(values.ink);
    const ratios = { body: contrast(ink, bg), metadata: contrast(mix(ink, bg, .85), bg), waveform: contrast(mix(ink, bg, .7), bg), reaction: contrast(ink, mix(bg, [0, 0, 0], .88)) };
    for (const [role, value] of Object.entries(ratios)) {
      const minimum = role === 'waveform' ? 3 : 4.5;
      assert.ok(value >= minimum, `${preset.id}/${company}/${mode}/${direction} ${role}: ${value.toFixed(3)} < ${minimum}`);
      minima[role] = Math.min(minima[role], value);
    }
    assert.ok(luminance(mix(bg, [0, 0, 0], .94)) < luminance(bg), `${preset.id}: edge must be darker than its own surface`);
    surfaces++;
  }
  assert.equal(surfaces, 264);
  t.diagnostic(`264 opaque surfaces; minimum contrast ${Object.entries(minima).map(([key, value]) => `${key}=${value.toFixed(3)}`).join(', ')}. Includes current native ERG/Integra standard colors.`);
});


test('each themed read accent is canonical and contrasts with both message directions', t => {
  let minimum = Infinity;
  for (const preset of CHAT_PRESETS.slice(1)) for (const mode of ['light', 'dark']) {
    const accent = rgb(preset.palette.read[mode]);
    assert.ok(Object.isFrozen(preset.palette.read));
    for (const direction of ['incoming', 'outgoing']) {
      const ratio = contrast(accent, rgb(preset.palette[direction][mode]));
      assert.ok(ratio >= 3, `${preset.id}/${mode}/${direction}: read icon ${ratio.toFixed(3)} < 3`);
      minimum = Math.min(minimum, ratio);
    }
    const stale = { preset: preset.id, palette: { read: { light: '#ffffff', dark: '#000000' } } };
    assert.equal(appearanceStyle(stale)[`--chat-status-read-${mode}`], preset.palette.read[mode]);
  }
  t.diagnostic(`128 custom-theme surfaces; minimum read-icon contrast ${minimum.toFixed(3)}. Standard workspace accents are checked from component CSS in check-settings-colors.mjs.`);
});


test('saved lake selections resolve to the requested night steppe without losing workspace state', () => {
  const saved = { preset: 'live-lake', name: 'Озеро', poster: '/img/chat-themes/live-lake.webp', palette: { read: { light: '#426C42', dark: '#ABD3A5' } } };
  for (const company of ['erg', 'integra']) {
    const appearance = resolveChatAppearance({ chatAppearance: { [company]: saved } }, company);
    assert.equal(appearance.preset, 'live-lake');
    assert.equal(appearance.name, 'Ночная степь');
    assert.equal(appearance.poster, '/img/chat-themes/live-steppe.webp');
    assert.equal(appearance.video, null);
    assert.equal(appearance.motion, false);
    assert.deepEqual(appearance.palette, getChatPreset('live-lake').palette);
  }
  assert.equal(saved.poster, '/img/chat-themes/live-lake.webp');
  assert.deepEqual([...readFileSync(new URL('../../public/img/chat-themes/live-steppe.webp', import.meta.url)).subarray(0, 4)], [82, 73, 70, 70]);
});


test('all canonical poster and video assets exist with the correct file signature', () => {
  for (const theme of CHAT_PRESETS) for (const [kind, asset] of [['poster', theme.poster], ['video', theme.video]]) {
    if (!asset) continue;
    const data = readFileSync(new URL(`../../public${asset}`, import.meta.url));
    assert.ok(data.byteLength > 128, `${theme.id}: ${kind} is not an empty placeholder`);
    if (kind === 'poster') {
      assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF', asset);
      assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP', asset);
    } else assert.equal(data.subarray(4, 8).toString('ascii'), 'ftyp', asset);
  }
});

test('photo reclassification preserves both old selections and exact static palettes', () => {
  for (const [id, name, poster] of [['live-lake', 'Ночная степь', 'live-steppe'], ['live-earth', 'Планета', 'live-earth']]) {
    const expected = getChatPreset(id);
    for (const company of ['erg', 'integra']) {
      const saved = { preset: id, group: 'live', video: '/old-arbitrary.mp4', motion: true };
      const actual = resolveChatAppearance({ chatAppearance: { [company]: saved } }, company);
      assert.equal(actual.preset, id);
      assert.equal(actual.name, name);
      assert.equal(actual.group, 'photo');
      assert.equal(actual.poster, `/img/chat-themes/${poster}.webp`);
      assert.equal(actual.video, null);
      assert.equal(actual.motion, false);
      assert.deepEqual(actual.palette, expected.palette);
      assert.ok(appearanceClass(actual).includes('qa-motion-off'));
    }
  }
  assert.equal(getChatPreset('live-lake').palette.outgoing.light, '#DFE0F4');
  assert.equal(getChatPreset('live-lake').palette.outgoing.dark, '#414965');
  assert.equal(getChatPreset('live-earth').palette.outgoing.light, '#D2E1F5');
  assert.equal(getChatPreset('live-earth').palette.outgoing.dark, '#344A69');
});
