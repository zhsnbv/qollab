import test from 'node:test';
import assert from 'node:assert/strict';
import { chatWallpaperAncestorsVisible, shouldPlayChatWallpaper, watchChatWallpaperPlayback } from './chatWallpaperPlayback.js';

class Events {
  listeners = new Map();
  addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  emit(name, extra = {}) { for (const listener of [...(this.listeners.get(name) || [])]) listener({ type: name, ...extra }); }
  count() { return [...this.listeners.values()].reduce((sum, values) => sum + values.size, 0); }
}
function node(parentElement, attributes = {}, classes = []) {
  return {
    parentElement, attributes: new Map(Object.entries(attributes)), classList: { contains: value => classes.includes(value) },
    computed: { display: 'block', visibility: 'visible', contentVisibility: 'visible', opacity: '1' },
    hasAttribute(key) { return this.attributes.has(key); }, getAttribute(key) { return this.attributes.get(key) ?? null; },
  };
}
function harness({ withoutIntersection = false, play } = {}) {
  const page = node(null), route = node(page, { 'data-active': 'true', 'data-visible': 'true' });
  const layer = node(route, { 'aria-hidden': 'true' }, ['qa-wallpaper-layers']);
  const video = Object.assign(new Events(), { parentElement: layer, paused: true, readyState: 4, plays: 0, pauses: 0,
    play() { this.plays++; this.paused = false; return play ? play() : Promise.resolve(); },
    pause() { this.pauses++; this.paused = true; this.emit('pause'); },
    rect: { width: 300, height: 500, left: 0, top: 0, right: 300, bottom: 500 },
    getBoundingClientRect() { return this.rect; },
  });
  const doc = Object.assign(new Events(), { hidden: false });
  const reduced = Object.assign(new Events(), { matches: false });
  const connection = Object.assign(new Events(), { saveData: false });
  const win = Object.assign(new Events(), { innerWidth: 400, innerHeight: 800, getComputedStyle: item => item.computed, matchMedia: () => reduced });
  let intersection, mutation;
  if (!withoutIntersection) win.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; intersection = this; }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    show(visible) { this.callback([{ target: this.target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); }
  };
  win.MutationObserver = class {
    observed = [];
    constructor(callback) { this.callback = callback; mutation = this; }
    observe(target, options) { this.observed.push({ target, options }); }
    disconnect() { this.disconnected = true; }
    change() { this.callback([]); }
  };
  const shown = [], failures = [];
  const dispose = watchChatWallpaperPlayback(video, { onVisible: value => shown.push(value), onFailure: () => failures.push(true) }, { window: win, document: doc, navigator: { connection } });
  return { video, page, route, layer, doc, reduced, connection, win, shown, failures, dispose, intersection, mutation };
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('every visibility, data and accessibility gate independently disables decorative playback', () => {
  const normal = { inViewport: true };
  assert.equal(shouldPlayChatWallpaper(normal), true);
  for (const patch of [{ hasVideo: false }, { miniature: true }, { reducedMotion: true }, { saveData: true }, { pageVisible: false }, { inViewport: false }, { ancestorsVisible: false }, { failed: true }]) {
    assert.equal(shouldPlayChatWallpaper({ ...normal, ...patch }), false, JSON.stringify(patch));
  }
  assert.equal(shouldPlayChatWallpaper({}), false, 'visibility must be established before playing');
});

test('decorative aria-hidden is allowed but retained inert/hidden route ancestors are not', () => {
  const h = harness();
  const visible = () => chatWallpaperAncestorsVisible(h.video, item => item.computed);
  assert.equal(visible(), true);
  for (const [name, value] of [['inert', ''], ['hidden', ''], ['aria-hidden', 'true'], ['data-active', 'false'], ['data-visible', 'false']]) {
    const previous = h.route.attributes.get(name);
    h.route.attributes.set(name, value);
    assert.equal(visible(), false, name);
    if (previous === undefined) h.route.attributes.delete(name); else h.route.attributes.set(name, previous);
  }
  for (const [name, value] of [['display', 'none'], ['visibility', 'hidden'], ['visibility', 'collapse'], ['contentVisibility', 'hidden'], ['opacity', '0']]) {
    const previous = h.page.computed[name]; h.page.computed[name] = value;
    assert.equal(visible(), false, `${name}:${value}`); h.page.computed[name] = previous;
  }
  assert.equal(h.mutation.observed.length, 3, 'all route ancestors are watched, not just the layer itself');
  h.dispose();
});

test('no offscreen play; resolved play promise never exposes video before the playing event', async () => {
  const h = harness();
  assert.equal(h.video.plays, 0);
  h.intersection.show(true);
  assert.equal(h.video.plays, 1);
  await tick();
  assert.deepEqual(h.shown, []);
  h.video.emit('playing');
  assert.deepEqual(h.shown, [true]);
  h.video.emit('waiting');
  assert.deepEqual(h.shown, [true], 'valid decoded frame stays visible during a buffered loop boundary');
  h.video.readyState = 1; h.video.emit('waiting');
  assert.deepEqual(h.shown, [true, false]);
  h.video.emit('playing');
  h.intersection.show(false);
  assert.equal(h.video.paused, true);
  assert.deepEqual(h.shown, [true, false, true, false]);
  h.dispose();
});

test('retaining a screen in the stack pauses it; restoring the same instance resumes only when active', () => {
  const h = harness();
  h.intersection.show(true); h.video.emit('playing');
  h.route.attributes.set('inert', ''); h.route.attributes.set('data-active', 'false'); h.mutation.change();
  assert.equal(h.video.paused, true);
  assert.equal(h.shown.at(-1), false);
  h.intersection.show(true);
  assert.equal(h.video.plays, 1, 'intersection alone cannot restart an inactive route');
  h.route.attributes.delete('inert'); h.route.attributes.set('data-active', 'true'); h.mutation.change();
  assert.equal(h.video.plays, 2);
  assert.equal(h.shown.at(-1), false, 'poster stays visible until playback actually resumes');
  h.video.emit('playing'); assert.equal(h.shown.at(-1), true);
  h.dispose();
});

test('reduced motion, save-data and hidden-tab changes pause and restore the poster immediately', () => {
  const h = harness();
  h.intersection.show(true);
  for (const [source, property, event] of [[h.reduced, 'matches', 'change'], [h.connection, 'saveData', 'change'], [h.doc, 'hidden', 'visibilitychange']]) {
    h.video.emit('playing');
    const plays = h.video.plays;
    source[property] = true; source.emit(event);
    assert.equal(h.video.paused, true, property);
    assert.equal(h.shown.at(-1), false, property);
    h.mutation.change(); assert.equal(h.video.plays, plays);
    source[property] = false; source.emit(event);
    assert.equal(h.video.plays, plays + 1);
  }
  h.dispose();
});

test('autoplay rejection fails once to a poster without a retry loop', async () => {
  const h = harness({ play: () => Promise.reject(new Error('NotAllowedError')) });
  h.intersection.show(true);
  await tick();
  assert.equal(h.video.paused, true);
  assert.equal(h.failures.length, 1);
  h.intersection.show(true); h.mutation.change(); h.video.emit('playing');
  assert.equal(h.video.plays, 1);
  assert.ok(!h.shown.includes(true));
  h.dispose();
});

test('media error removes the visual video path and ignores later playing events', () => {
  const h = harness();
  h.intersection.show(true); h.video.emit('playing'); h.video.emit('error');
  assert.equal(h.video.paused, true);
  assert.deepEqual(h.shown, [true, false]);
  assert.equal(h.failures.length, 1);
  h.video.emit('playing'); h.video.emit('error');
  assert.equal(h.failures.length, 1);
  assert.equal(h.shown.at(-1), false);
  h.dispose();
});

test('interrupted pending play does not turn an expected AbortError into a failed theme', async () => {
  let reject;
  const h = harness({ play: () => new Promise((resolve, rejectPlay) => { reject = rejectPlay; }) });
  h.intersection.show(true);
  h.doc.hidden = true; h.doc.emit('visibilitychange');
  reject(new Error('AbortError')); await tick();
  assert.equal(h.failures.length, 0);
  h.doc.hidden = false; h.doc.emit('visibilitychange');
  assert.equal(h.video.plays, 2);
  h.dispose();
});

test('cleanup removes listeners/observers, pauses video and ignores late async completion', async () => {
  let reject;
  const h = harness({ play: () => new Promise((resolve, rejectPlay) => { reject = rejectPlay; }) });
  h.intersection.show(true); h.dispose();
  reject(new Error('late rejection')); await tick();
  assert.equal(h.failures.length, 0);
  assert.equal(h.video.paused, true);
  assert.equal(h.video.count() + h.doc.count() + h.reduced.count() + h.connection.count() + h.win.count(), 0);
  assert.equal(h.intersection.disconnected, true);
  assert.equal(h.mutation.disconnected, true);
  h.intersection.show(true); h.mutation.change();
  assert.equal(h.video.plays, 1);
});

test('fallback without IntersectionObserver still respects viewport bounds and cleans up capture scroll', () => {
  const h = harness({ withoutIntersection: true });
  assert.equal(h.video.plays, 1);
  h.video.rect.top = 900; h.video.rect.bottom = 1400; h.win.emit('scroll');
  assert.equal(h.video.paused, true);
  h.video.rect.top = 0; h.video.rect.bottom = 500; h.win.emit('resize');
  assert.equal(h.video.plays, 2);
  h.dispose(); assert.equal(h.win.count(), 0);
});


test('CSS ancestor reveal can resume after its animation without another DOM attribute change', () => {
  const h = harness();
  h.page.computed.opacity = '0';
  h.intersection.show(true);
  assert.equal(h.video.plays, 0);
  h.page.computed.opacity = '1';
  h.doc.emit('animationend', { target: h.page });
  assert.equal(h.video.plays, 1);
  h.video.emit('playing');
  h.video.emit('emptied');
  assert.deepEqual(h.shown, [true, false]);
  h.dispose();
});
