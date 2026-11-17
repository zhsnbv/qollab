#!/usr/bin/env node
/** Analytical CSS contrast audit, not a browser/layout or screenshot test.
 * Runs with the repository's installed dependencies: node scripts/check-settings-colors.mjs
 * Uses opaque message surfaces; complex wallpaper pixels are deliberately not guessed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { CHAT_PRESETS, appearanceClass, appearanceStyle, resolveChatAppearance } from '../src/utils/chatThemeCatalog.js';
import { MESSAGE_DELIVERY_STATES, messageDeliveryState } from '../src/utils/messageDelivery.js';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, process.argv[2] || 'artifacts/settings-redesign-2026-11-17/v8');
const sourceFiles = [
  'src/utils/chatAppearance.js', 'src/utils/chatThemeCatalog.js',
  'src/styles/tokens.css', 'src/styles/companies.css', 'src/screens/ChatRoom.css',
  'src/screens/ChatAppearance.css', 'src/screens/SettingsChatThemes.css', 'src/components/ProfileShareCard.css',
  'src/components/MessageReactions.css', 'src/components/LinkPreview.css', 'src/components/MessageDeliveryStatus.css',
  'src/components/MessageDeliveryStatus.jsx', 'src/utils/messageDelivery.js',
  'src/components/Message.jsx', 'src/screens/DMChat.jsx',
];
const sources = Object.fromEntries(sourceFiles.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const authorColors = sources['src/screens/DMChat.jsx'].match(/const NAME_COLORS = \[([^\]]+)\]/)?.[1].match(/#[\da-f]{6}/gi);
assert.ok(authorColors?.length, 'Actual group-chat author palette must be present');

// Only the standard subset needed by audited nodes is supported. Dynamic states
// and media queries are intentionally excluded; mobile/base styles are the target.
const rules = [];
for (const file of sourceFiles.filter(file => file.endsWith('.css'))) {
  postcss.parse(sources[file], { from: file }).walkRules(rule => {
    if (rule.parent.type !== 'root') return;
    const declarations = rule.nodes.filter(node => node.type === 'decl');
    for (const selector of split(rule.selector, ',')) rules.push({ selector, declarations, file, line: rule.source.start.line });
  });
}
function split(value, delimiter) {
  const result = []; let depth = 0; let start = 0;
  for (let i = 0; i < value.length; i++) {
    if ('(['.includes(value[i])) depth++;
    if (')]'.includes(value[i])) depth--;
    if (depth === 0 && value[i] === delimiter) { result.push(value.slice(start, i).trim()); start = i + 1; }
  }
  result.push(value.slice(start).trim()); return result.filter(Boolean);
}
function matchesCompound(selector, node) {
  if (!node) return false;
  let text = selector;
  for (const kind of ['is', 'not', 'where']) {
    let begin;
    while ((begin = text.indexOf(`:${kind}(`)) >= 0) {
      let end = begin + kind.length + 2; let depth = 1;
      for (; depth && end < text.length; end++) { if (text[end] === '(') depth++; if (text[end] === ')') depth--; }
      const inner = text.slice(begin + kind.length + 2, end - 1);
      const matched = split(inner, ',').some(part => matches(part, node));
      if (kind === 'not' ? matched : !matched) return false;
      text = text.slice(0, begin) + text.slice(end);
    }
  }
  if (text.includes(':root')) { if (node.tag !== 'html') return false; text = text.replace(':root', ''); }
  if (text.includes(':')) return false; // interactive/dynamic state not measured
  for (const [, attr, operator, value] of text.matchAll(/\[([\w-]+)(\*?=)?["']?([^\]"']*)["']?\]/g)) {
    const actual = attr === 'class' ? node.classes.join(' ') : node.attrs[attr];
    if (operator === '*=' ? !actual?.includes(value) : operator ? actual !== value : actual == null) return false;
  }
  text = text.replace(/\[[^\]]+\]/g, '');
  if ([...text.matchAll(/\.([\w-]+)/g)].some(([, cls]) => !node.classes.includes(cls))) return false;
  if (text.includes('#')) return false;
  const tag = text.match(/^[\w-]+/)?.[0];
  return !tag || tag === node.tag;
}
function matches(selector, node) {
  const parts = split(selector.replace(/\s*>\s*/g, '>'), ' ');
  function matchAt(index, current) {
    const child = split(parts[index], '>');
    for (let i = child.length - 1; i >= 0; i--) {
      if (!matchesCompound(child[i], current)) return false;
      if (i) current = current.parent;
    }
    if (index === 0) return true;
    for (let ancestor = current.parent; ancestor; ancestor = ancestor.parent) if (matchAt(index - 1, ancestor)) return true;
    return false;
  }
  return matchAt(parts.length - 1, node);
}
function specificity(selector) {
  let text = selector; let extra = 0;
  text = text.replace(/:(?:is|not)\(([^()]*)\)/g, (_, body) => { extra += Math.max(...split(body, ',').map(specificity)); return ''; });
  text = text.replace(/:where\([^()]*\)/g, '');
  return extra + (text.match(/#[\w-]+/g)?.length || 0) * 10000 +
    (text.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g)?.length || 0) * 100 +
    (text.replace(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g, '').match(/(?:^|[ >])\w+/g)?.length || 0);
}
function element(tag, classes = '', parent = null, inline = {}, attrs = {}, presentation = {}) {
  const node = { tag, classes: classes.split(' ').filter(Boolean), parent, attrs, props: { ...presentation }, vars: { ...parent?.vars }, origins: {}, priorities: {} };
  for (const rule of rules) {
    if (!matches(rule.selector, node)) continue;
    for (const decl of rule.declarations) {
      const priority = specificity(rule.selector) + (decl.important ? 1000000 : 0);
      if (priority < (node.priorities[decl.prop] ?? -1)) continue;
      node.props[decl.prop] = decl.value; node.priorities[decl.prop] = priority;
      node.origins[decl.prop] = `${rule.file}:${rule.line} ${rule.selector}`;
    }
  }
  for (const [prop, value] of Object.entries(inline)) {
    if ((node.priorities[prop] ?? 0) >= 1000000) continue;
    node.props[prop] = value; node.origins[prop] = 'inline (Message.jsx or appearanceStyle)';
  }
  for (const [prop, value] of Object.entries(node.props)) if (prop.startsWith('--')) node.vars[prop] = value;
  return node;
}
function resolve(value, node, depth = 0) {
  if (depth > 30) throw new Error(`CSS variable cycle: ${value}`);
  let text = value;
  while (text?.includes('var(')) {
    const start = text.indexOf('var('); let end = start + 4; let level = 1;
    for (; level && end < text.length; end++) { if (text[end] === '(') level++; if (text[end] === ')') level--; }
    const [key, fallback] = split(text.slice(start + 4, end - 1), ',');
    const replacement = node.vars[key] ?? fallback;
    if (replacement == null) throw new Error(`Undefined ${key}`);
    text = text.slice(0, start) + resolve(replacement, node, depth + 1) + text.slice(end);
  }
  return text;
}
function color(value) {
  if (value === 'transparent' || value === 'none') return [0, 0, 0, 0];
  if (value === '#fff' || value === 'white') return [255, 255, 255, 1];
  if (value === '#000' || value === 'black') return [0, 0, 0, 1];
  if (/^#[\da-f]{3,8}$/i.test(value)) {
    let hex = value.slice(1); if (hex.length <= 4) hex = [...hex].map(char => char + char).join('');
    return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16)).concat(hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1);
  }
  if (/^rgba?\(/.test(value)) {
    const parts = value.slice(value.indexOf('(') + 1, -1).split(/[\s, /]+/).filter(Boolean);
    return parts.slice(0, 3).map(channel => parseFloat(channel) * (channel.endsWith('%') ? 2.55 : 1))
      .concat(parts[3] == null ? 1 : parseFloat(parts[3]) / (parts[3].endsWith('%') ? 100 : 1));
  }
  if (value.startsWith('color(srgb ')) {
    const [channels, alpha = '1'] = value.slice(11, -1).split('/');
    return channels.trim().split(/\s+/).map(Number).map(channel => channel * 255).concat(Number(alpha));
  }
  if (value.startsWith('oklab(')) {
    const [channels, alpha = '1'] = value.slice(6, -1).split('/');
    const [L, a, b] = channels.trim().split(/\s+/).map(Number);
    const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
    const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
    const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
    const linear = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
    return linear.map(channel => Math.min(1, Math.max(0, channel <= .0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - .055)) * 255).concat(Number(alpha));
  }
  if (value.startsWith('color-mix(')) {
    const [space, left, right] = split(value.slice(10, -1), ',');
    if (space !== 'in srgb') throw new Error(`Unsupported mixing space ${space}`);
    const stop = term => { const match = term.match(/^(.*)\s+(\d+(?:\.\d+)?)%$/); return { rgb: color(match ? match[1] : term), weight: match ? Number(match[2]) / 100 : null }; };
    const a = stop(left); const b = stop(right); const wa = a.weight ?? (b.weight == null ? .5 : 1 - b.weight); const wb = b.weight ?? 1 - wa;
    const alpha = a.rgb[3] * wa + b.rgb[3] * wb;
    return a.rgb.slice(0, 3).map((v, i) => alpha ? (v * a.rgb[3] * wa + b.rgb[i] * b.rgb[3] * wb) / alpha : 0).concat(alpha);
  }
  throw new Error(`Unsupported color expression: ${value}`);
}
function over(fg, bg) { return fg.slice(0, 3).map((channel, i) => channel * fg[3] + bg[i] * (1 - fg[3])).concat(1); }
function foreground(node) {
  const raw = resolve(node.props.color, node);
  return !raw || raw === 'inherit' || raw === 'currentColor' ? foreground(node.parent) : color(raw);
}
function background(node) {
  if (!node) return [255, 255, 255, 1];
  const raw = resolve(node.props.background ?? node.props['background-color'], node);
  if (!raw || raw === 'inherit') return background(node.parent);
  const fill = color(raw);
  // An opaque message/plate fully covers the wallpaper. Do not pretend to
  // rasterize a gradient or photograph that cannot affect this pixel.
  return fill[3] === 1 ? fill : over(fill, background(node.parent));
}
function luminance(rgb) { return rgb.slice(0, 3).map(c => { const v = c / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0); }
function contrast(fg, bg) { const a = luminance(over(fg, bg)); const b = luminance(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); }
const hex = rgb => '#' + rgb.slice(0, 3).map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
assert.equal(contrast(color('#000'), color('#fff')), 21, 'WCAG black/white reference');
assert.equal(contrast(color('#fff'), color('#fff')), 1, 'WCAG identical colors reference');
assert.equal(hex(over(color('rgba(0, 0, 0, 0.5)'), color('#fff'))), '#808080', 'sRGB alpha composition');
assert.equal(hex(over(color('rgb(0 0 0 / 78%)'), color('#fff'))), '#383838', 'Modern rgb alpha composition');
assert.equal(hex(color('color-mix(in srgb, #ffffff 50%, #000000)')), '#808080', 'opaque sRGB mix');
assert.equal(hex(over(color('color-mix(in srgb, #000000 50%, transparent)'), color('#fff'))), '#808080', 'premultiplied transparent mix');
assert.equal(hex(color('oklab(1 0 0)')), '#ffffff', 'OKLab white reference');
assert.equal(hex(color('oklab(0 0 0)')), '#000000', 'OKLab black reference');
assert.ok(CHAT_PRESETS.length > 0, 'Canonical preset catalog must not be empty');
assert.equal(new Set(CHAT_PRESETS.map(preset => preset.id)).size, CHAT_PRESETS.length, 'Preset ids must be unique');
function check(role, node, threshold = 4.5, property = 'color') {
  const bg = background(property === 'background' ? node.parent : node);
  const fg = property === 'background' ? color(resolve(node.props.background, node)) : foreground(node);
  const ratio = contrast(fg, bg);
  return { role, foreground: hex(over(fg, bg)), background: hex(bg), ratio: +ratio.toFixed(4), threshold, pass: ratio >= threshold, source: node.origins[property] || 'inherited' };
}
function checkEdge(role, node) {
  const outline = resolve(node.props.outline, node);
  const match = outline?.match(/^1px solid (.+)$/);
  const fill = background(node);
  const edge = match ? color(match[1]) : fill;
  const darker = luminance(edge) < luminance(fill);
  const offset = node.props['outline-offset'];
  const shadow = node.props['box-shadow'] ?? 'none';
  const softMix = edge.slice(0, 3).every((channel, index) => Math.abs(channel - fill[index] * .94) < .001);
  return { role, surface: hex(fill), edge: hex(edge), ratio: +contrast(edge, fill).toFixed(4), darker, softMix, outline, offset, shadow, widthCost: 0, pass: !!match && edge[3] === 1 && darker && softMix && offset === '-1px' && shadow === 'none' };
}
function auditVariant(company, theme, direction, preset) {
  const html = element('html', '', null, {}, { 'data-theme': theme, 'data-company': company });
  const selected = resolveChatAppearance({ chatAppearance: { [company]: { preset: preset.id } } }, company);
  const surface = element('div', appearanceClass(selected), html, appearanceStyle(selected));
  const message = element('div', `msg msg--${direction === 'incoming' ? 'their' : 'mine'}`, surface);
  const col = element('div', 'msg-col', message); const bubble = element('div', 'msg-bubble', col);
  const records = [];
  const add = (role, tag, classes, parent = bubble, inlineStyle = {}, threshold = 4.5, presentation = {}) => {
    const node = element(tag, classes, parent, inlineStyle, {}, presentation); records.push(check(role, node, threshold)); return node;
  };
  add('body', 'div', 'msg-text');
  const time = element('span', 'msg-time-row msg-time-row--overlay', bubble);
  add('timestamp', 'span', 'msg-time', time);
  const inlineTime = element('span', 'msg-time-row msg-time-row--inline', element('div', 'msg-footer', bubble));
  add('timestampWithReactions', 'span', 'msg-time', inlineTime);
  const statusColors = [];
  const statusChecks = (context, parent) => {
    for (const status of Object.keys(MESSAGE_DELIVERY_STATES)) {
      const state = messageDeliveryState(status);
      const wrapper = element('span', 'message-delivery-status', parent, {}, { 'data-delivery-state': state.id, 'data-delivery-tone': state.tone });
      const glyph = element('svg', '', wrapper, {}, {}, { fill: 'currentColor' });
      const result = check(`status.${context}.${status}`, glyph, 3);
      records.push(result); statusColors.push({ context, status, foreground: result.foreground });
      if (status === 'read' && preset.palette) {
        const readTheme = context === 'overMedia' ? 'dark' : theme;
        assert.equal(result.foreground, preset.palette.read[readTheme].toLowerCase(), `${company}/${theme}/${preset.id}/${context} must use the selected read color, not bubble/timestamp ink`);
      }
    }
    const contextColors = statusColors.filter(row => row.context === context);
    assert.equal(new Set(contextColors.filter(row => ['sending', 'sent', 'delivered'].includes(row.status)).map(row => row.foreground)).size, 1, 'Unconfirmed delivery states remain neutral');
    assert.notEqual(contextColors.find(row => row.status === 'read').foreground, contextColors.find(row => row.status === 'delivered').foreground, 'Read status is visually distinct');
  };
  statusChecks('bubble', time);
  statusChecks('reactionFooter', inlineTime);
  add('link', 'a', 'msg-link'); add('mention', 'span', 'msg-mention'); add('forwarded', 'div', 'msg-forwarded-label');
  if (direction === 'incoming') for (const author of authorColors) add(`author.${author}`, 'div', 'msg-author-inline', bubble, { color: author });
  const quote = element('div', 'msg-quote', bubble);
  add('quote.text', 'div', 'msg-quote-text', quote);
  for (const author of authorColors) add(`quote.author.${author}`, 'div', 'msg-quote-head', quote, { color: author });
  const voice = element('div', 'msg-bubble msg-bubble--voice', col);
  add('voice.duration', 'span', 'voice-time', voice);
  statusChecks('voice', element('span', 'msg-time-row msg-time-row--overlay', voice));
  const play = element('button', 'voice-play', voice); add('voice.playIcon', 'svg', '', play, {}, 3, { color: '#fff' });
  const wave = element('i', '', element('span', 'voice-wave', voice)); records.push(check('voice.waveform', wave, 3, 'background'));
  const document = element('div', 'msg-document', col);
  const docBody = element('span', 'msg-document-body', document);
  add('document.name', 'span', 'msg-document-name', docBody); add('document.size', 'span', 'msg-document-size', docBody);
  add('document.icon', 'svg', '', element('span', 'msg-document-icon', document), {}, 3, { color: 'var(--color-primary)' });
  // File time is outside the message but has its own opaque plate. Verify that
  // invariant so the contrast remains independent of the selected wallpaper.
  const staticTime = element('span', 'msg-time-row msg-time-row--static', col);
  assert.equal(color(resolve(staticTime.props.background, staticTime))[3], 1, 'Document timestamp plate must be opaque');
  add('document.externalTimeOnPlate', 'span', 'msg-time', staticTime);
  statusChecks('documentPlate', staticTime);
  const mediaBubble = element('div', 'msg-bubble msg-bubble--media', col);
  statusChecks('mediaFooter', element('span', 'msg-time-row msg-time-row--overlay', mediaBubble));
  const profileBubble = element('div', 'msg-bubble msg-bubble--profile', col);
  statusChecks('profileFooter', element('span', 'msg-time-row msg-time-row--overlay', profileBubble));
  const listSurface = element('div', 'chat-list', html, { ...appearanceStyle(selected), background: 'var(--color-white)' });
  statusChecks('chatList', listSurface);
  // The lightest possible photo is the worst background beneath a black plate.
  // Checking white therefore bounds every pixel of a legacy media overlay.
  const photo = element('div', '', surface, { background: '#ffffff' });
  statusChecks('overMedia', element('span', 'msg-time-row msg-time-row--overlay-dark', photo));
  const profile = element('button', 'share-person-card', bubble); const info = element('span', 'share-person-info', profile);
  add('profile.name', 'strong', '', info); add('profile.role', 'span', '', info); add('profile.label', 'small', '', info);
  add('profile.chevron', 'svg', 'share-person-chevron', profile, {}, 3);
  add('profile.avatarInitials', 'span', 'share-person-avatar', profile);
  for (const own of [false, true]) {
    const reaction = element('button', `rx-pill${own ? ' own' : ''}`, element('div', 'rx', bubble));
    add(`reaction.${own ? 'own' : 'other'}.count`, 'span', 'rx-count', reaction);
  }
  // Reactions on voice/documents are siblings; --bubble-bg may differ here.
  const siblingReaction = element('button', 'rx-pill', element('div', 'rx', col));
  add('reaction.sibling.count', 'span', 'rx-count', siblingReaction);
  const preview = element('button', 'lp', bubble); const previewBody = element('span', 'lp-body', preview);
  for (const name of ['kind', 'title', 'sub', 'note']) add(`linkPreview.${name}`, 'span', `lp-${name}`, previewBody);
  add('linkPreview.action', 'span', 'lp-cta', preview);
  const miniature = element('i', direction === 'incoming' ? 'sc-mini-in' : 'sc-mini-out', surface);
  const edges = [checkEdge('message', bubble), checkEdge('document', document), checkEdge('catalogMiniature', miniature)];
  return { id: `${company}/${theme}/${direction}/${preset.id}`, company, theme, direction, preset: preset.id, group: preset.group, wallpaper: preset.wallpaper, pattern: preset.pattern, checks: records, edges, failures: records.filter(row => !row.pass).length };
}

const variants = [];
for (const company of ['erg', 'integra']) for (const theme of ['light', 'dark']) for (const direction of ['incoming', 'outgoing']) for (const preset of CHAT_PRESETS) variants.push(auditVariant(company, theme, direction, preset));
// Neutral states cannot pick up a palette-dependent bubble/timestamp color.
for (const company of ['erg', 'integra']) for (const theme of ['light', 'dark']) {
  const rows = variants.filter(variant => variant.company === company && variant.theme === theme).flatMap(variant => variant.checks);
  const roles = new Set(rows.filter(row => /^status\..+\.(sending|sent|delivered)$/.test(row.role)).map(row => row.role));
  for (const role of roles) assert.equal(new Set(rows.filter(row => row.role === role).map(row => row.foreground)).size, 1, `${company}/${theme}/${role} must remain neutral across all presets and directions`);
}
const matrix = [];
for (const company of ['erg', 'integra']) for (const theme of ['light', 'dark']) for (const preset of CHAT_PRESETS) {
  const ids = [`${company}/${theme}/incoming/${preset.id}`, `${company}/${theme}/outgoing/${preset.id}`];
  const pair = ids.map(id => variants.find(item => item.id === id));
  matrix.push({ company, theme, preset: preset.id, group: preset.group, incoming: preset.incoming, outgoing: preset.outgoing, wallpaper: preset.wallpaper, pattern: preset.pattern, poster: preset.poster, video: preset.video, variants: ids, opaqueTextPass: pair.every(item => item.checks.filter(check => check.threshold === 4.5).every(check => check.pass)), edgesPass: pair.every(item => item.edges.every(check => check.pass)), wallpaperPixels: 'not rasterized; message and document-time surfaces are opaque' });
}
const failures = variants.flatMap(item => item.checks.filter(check => !check.pass).map(check => ({ variant: item.id, ...check }))).sort((a, b) => a.ratio - b.ratio);
const edgeChecks = variants.flatMap(item => item.edges.map(check => ({ variant: item.id, ...check })));
const roleSummary = [...new Set(variants.flatMap(variant => variant.checks.map(check => check.role)))].map(role => {
  const rows = variants.flatMap(item => item.checks.filter(check => check.role === role).map(check => ({ variant: item.id, ...check })));
  const worst = rows.reduce((a, b) => a.ratio < b.ratio ? a : b);
  return { role, failingVariants: rows.filter(row => !row.pass).length, variants: rows.length, worst: { variant: worst.variant, ratio: worst.ratio, threshold: worst.threshold } };
});
const report = {
  method: 'Analytical sRGB/WCAG contrast from source CSS for a bounded static DOM model; NOT a rendered/browser/visual test.',
  generatedAt: new Date().toISOString(),
  sourceHashes: Object.fromEntries(sourceFiles.map(file => [file, crypto.createHash('sha256').update(sources[file]).digest('hex')])),
  scope: { selectionModel: 'Canonical preset only; wallpaper, pattern and both bubble colors belong to the selected preset.', presets: CHAT_PRESETS.length, groups: Object.fromEntries([...new Set(CHAT_PRESETS.map(preset => preset.group))].map(group => [group, CHAT_PRESETS.filter(preset => preset.group === group).length])), companies: 2, themes: 2, directions: 2, presetConfigurations: matrix.length, directionVariants: variants.length },
  limitations: [
    'Each canonical preset is audited in both directions for ERG and Integra in light/dark modes. Individual color/wallpaper permutations are not selectable and are not enumerated.',
    'No screenshot, clipping, font rasterization, browser cascade, interaction or reduced-motion validation is claimed.',
    'Gradients, illustration/poster pixels and pattern pixels are not rasterized. Message surfaces and the external document-time plate are opaque, so those pixels do not affect measured text contrast.',
    'CSS model handles source base rules, descendant/child classes, attributes, :is/:not/:where, inherited variables, inline color and !important. Media queries and transient pseudo states are excluded.',
    'Text uses 4.5:1; meaningful icons/waveform use 3:1. Body text, labels, timestamps and metadata are normal small text.',
    'CSS source order is tokens, company overrides, ChatRoom, ChatAppearance, catalog styles, ProfileShareCard, MessageReactions, LinkPreview, MessageDeliveryStatus. Relevant scoped overrides have higher specificity; verify actual bundle order in browser.',
    'Avatar photos, raster logos and emoji glyph pixels are not numeric text samples. Avatar initials and their authored surfaces are checked.',
  ],
  totals: { checks: variants.reduce((sum, item) => sum + item.checks.length, 0), failedChecks: failures.length, matrixOpaqueTextPass: matrix.filter(item => item.opaqueTextPass).length },
  edges: { method: 'Decorative 1px inner outline: exactly 94% actual fill + 6% black, opaque, no shadow, negative offset. It is not a text contrast requirement. Outline does not alter the CSS box dimensions.', checks: edgeChecks.length, failedChecks: edgeChecks.filter(check => !check.pass), minimumEdgeToFillContrast: Math.min(...edgeChecks.map(check => check.ratio)), rows: edgeChecks },
  delivery: { states: Object.keys(MESSAGE_DELIVERY_STATES), contexts: ['bubble', 'reactionFooter', 'voice', 'documentPlate', 'mediaFooter', 'profileFooter', 'chatList', 'overMedia'], iconThreshold: 3, neutralInvariantAcrossPresets: true, checks: variants.reduce((sum, item) => sum + item.checks.filter(check => check.role.startsWith('status.')).length, 0), source: 'Actual MessageDeliveryStatus wrapper data attributes and CSS, with canonical per-theme read variables.' },
  roleSummary, failures, variants, matrix,
};
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'color-audit.json'), JSON.stringify(report, null, 2) + '\n');
const lines = [report.method, `Generated: ${report.generatedAt}`, `Source matrix: ${CHAT_PRESETS.length} canonical presets × 2 companies × 2 themes = ${matrix.length} configurations; both directions = ${variants.length} opaque-surface variants.`, `Checks: ${report.totals.checks}; failing: ${failures.length}.`, `Edges: ${edgeChecks.length}; failing: ${report.edges.failedChecks.length}; every edge uses 94% fill + 6% black, with no shadow or added box width.`, '', 'Worst by role (ratio / target, failures / variants):', ...roleSummary.map(row => `${row.role}: ${row.worst.ratio.toFixed(2)} / ${row.worst.threshold}; ${row.failingVariants}/${row.variants} failures; ${row.worst.variant}`), '', 'Worst 25 individual checks:', ...failures.slice(0, 25).map(row => `${row.variant} ${row.role}: ${row.ratio.toFixed(2)} / ${row.threshold}; ${row.foreground} on ${row.background}`), '', 'Limits:', ...report.limitations.map(line => `- ${line}`), ''];
fs.writeFileSync(path.join(output, 'color-audit.txt'), lines.join('\n'));
console.log(lines.slice(0, 5).join('\n'));
console.log(`Reports written to ${path.relative(root, output)}`);
if (failures.length || report.edges.failedChecks.length) process.exitCode = 1;

// A separate browser QA run can supply computed styles. Read-only consumption
// verifies the numeric colors independently; this script never drives a browser.
const renderedFile = path.join(output, 'rendered-colors.json');
if (fs.existsSync(renderedFile)) {
  const samples = JSON.parse(fs.readFileSync(renderedFile, 'utf8'));
  const renderedChecks = [];
  for (const state of samples) for (const row of state.rows) for (const bubble of row.bubbles) {
    const bg = color(bubble.background);
    assert.equal(bg[3], 1, 'Rendered bubble must be opaque for wallpaper-independent contrast');
    const direction = bubble.mine ? 'outgoing' : 'incoming';
    const id = `${state.company}/${state.theme}/${direction}/${row.preset}`;
    const source = variants.find(variant => variant.id === id);
    assert.ok(source, `Missing source variant ${id}`);
    const body = contrast(color(bubble.ink), bg);
    const time = contrast(color(bubble.time), bg);
    const sourceBody = source.checks.find(check => check.role === 'body').ratio;
    const sourceTime = source.checks.find(check => check.role === 'timestamp').ratio;
    renderedChecks.push({ company: state.company, theme: state.theme, preset: row.preset, wallpaper: row.wallpaper, direction, body, timestamp: time, bodyPass: body >= 4.5, timestampPass: time >= 4.5, overflow: bubble.overflow, sourceDifference: { body: Math.abs(body - sourceBody), timestamp: Math.abs(time - sourceTime) } });
  }
  const minimum = (rows, role) => {
    const worst = rows.reduce((a, b) => a[role] <= b[role] ? a : b);
    return { contrast: +worst[role].toFixed(5), target: 4.5, company: worst.company, theme: worst.theme, preset: worst.preset, wallpaper: worst.wallpaper, direction: worst.direction };
  };
  const summary = {
    method: 'Independent WCAG numeric calculation from browser-produced computed rgb()/color(srgb) styles; no browser was operated by this audit script.',
    generatedAt: new Date().toISOString(),
    input: path.relative(root, renderedFile),
    inputHash: crypto.createHash('sha256').update(fs.readFileSync(renderedFile)).digest('hex'),
    states: samples.length, renderedCells: samples.reduce((sum, item) => sum + item.rows.length, 0), renderedBubbles: renderedChecks.length,
    renderedChecks: renderedChecks.length * 2,
    failures: renderedChecks.filter(check => !check.bodyPass || !check.timestampPass),
    overflows: renderedChecks.filter(check => check.overflow),
    minimumBody: minimum(renderedChecks, 'body'), minimumTimestamp: minimum(renderedChecks, 'timestamp'),
    maximumSourceDifference: { body: Math.max(...renderedChecks.map(check => check.sourceDifference.body)), timestamp: Math.max(...renderedChecks.map(check => check.sourceDifference.timestamp)) },
    byState: samples.map(state => {
      const rows = renderedChecks.filter(check => check.company === state.company && check.theme === state.theme);
      return { company: state.company, theme: state.theme, bubbles: rows.length, minimumBody: minimum(rows, 'body').contrast, minimumTimestamp: minimum(rows, 'timestamp').contrast };
    }),
    scopeNote: 'Rendered rows are identified by canonical preset id. A preset owns its wallpaper, pattern and both bubble colors; individual mixed color/wallpaper permutations are not selectable.',
    metadataAgreementTolerance: .001,
  };
  summary.matchesAnalyticalSource = Object.values(summary.maximumSourceDifference).every(delta => delta < summary.metadataAgreementTolerance);
  if (summary.failures.length || !summary.matchesAnalyticalSource) process.exitCode = 1;
  fs.writeFileSync(path.join(output, 'rendered-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(`Rendered: ${summary.renderedBubbles} bubbles; body min ${summary.minimumBody.contrast}; timestamp min ${summary.minimumTimestamp.contrast}; failures ${summary.failures.length}; overflows ${summary.overflows.length}; source match ${summary.matchesAnalyticalSource}.`);
}

const richFile = path.join(output, 'rendered-rich.json');
if (fs.existsSync(richFile)) {
  const states = JSON.parse(fs.readFileSync(richFile, 'utf8'));
  const checks = [];
  for (const state of states) for (const row of state.rows) for (const item of row.items) {
    // Capture order is the element itself, then successive ancestors. Build the
    // pixel from the outermost surface inward with normal source-over alpha.
    const bg = item.backgrounds.toReversed().reduce((behind, raw) => over(color(raw), behind), [255, 255, 255, 1]);
    const ratio = contrast(color(item.ink), bg);
    const threshold = /msg-document-icon|message-delivery-status/.test(item.class) ? 3 : 4.5;
    assert.ok(CHAT_PRESETS.some(preset => preset.id === row.preset), `Unknown rich-message preset ${row.preset}`);
    checks.push({ company: state.company, theme: state.theme, preset: row.preset, direction: item.mine ? 'outgoing' : 'incoming', role: item.class, text: item.text, foreground: hex(over(color(item.ink), bg)), background: hex(bg), ratio, threshold, pass: ratio >= threshold });
  }
  const groups = [...new Set(checks.map(check => check.role))].map(role => {
    const rows = checks.filter(check => check.role === role);
    const min = rows.reduce((a, b) => a.ratio <= b.ratio ? a : b);
    return { role, count: rows.length, failures: rows.filter(check => !check.pass).length, minimum: { ...min, ratio: +min.ratio.toFixed(5) } };
  });
  const richSummary = {
    method: 'Independent numeric contrast from captured rich-message foreground colors and complete ancestor background chains, including CSS color(srgb) and OKLab values.',
    generatedAt: new Date().toISOString(), input: path.relative(root, richFile), inputHash: crypto.createHash('sha256').update(fs.readFileSync(richFile)).digest('hex'),
    states: states.length, presetRows: states.reduce((sum, state) => sum + state.rows.length, 0), checks: checks.length,
    failures: checks.filter(check => !check.pass), groups,
    scopeNote: 'Captured text and document-icon colors are checked. This does not claim image/logo pixel contrast, voice-play SVG pixel sampling, geometry or visual approval. Source audit independently covers additional semantic roles such as voice waveform/play and link preview.',
  };
  fs.writeFileSync(path.join(output, 'rendered-rich-summary.json'), JSON.stringify(richSummary, null, 2) + '\n');
  if (richSummary.failures.length) process.exitCode = 1;
  const summaryFile = path.join(output, 'rendered-summary.json');
  if (fs.existsSync(summaryFile)) {
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    summary.richMessages = { checks: checks.length, failures: richSummary.failures.length, report: path.relative(root, path.join(output, 'rendered-rich-summary.json')), minimumText: Math.min(...checks.filter(check => check.threshold === 4.5).map(check => check.ratio)), minimumIcon: Math.min(...checks.filter(check => check.threshold === 3).map(check => check.ratio)) };
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2) + '\n');
  }
  console.log(`Rendered rich messages: ${checks.length} checks; ${richSummary.failures.length} failures.`);
}
