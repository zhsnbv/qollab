import test from 'node:test';
import assert from 'node:assert/strict';
import { mountMessageMenuClone } from './messageMenuClone.js';

// Small DOM boundary fixture: source and portal are deliberately disconnected.
// Guard context isolation, remounts and fractional sizing without a browser
// dependency; these checks do not replace visual comparison of resolved paint.
function fixture(values = {}, classes = []) {
  const style = () => ({ setProperty(name, value) { this[name] = value; } });
  const computed = {
    length: Object.keys(values).length,
    item: index => Object.keys(values)[index],
    getPropertyValue: name => values[name] || '',
  };
  const column = {};
  const clonedColumn = { style: style() };
  const clone = { style: style(), querySelector: () => clonedColumn };
  const document = {
    defaultView: { getComputedStyle: node => node === column ? { width: '191.625px' } : computed },
    createElement: () => ({ style: style(), children: [], append(child) { this.children.push(child); } }),
  };
  column.ownerDocument = document;
  const source = {
    ownerDocument: document,
    style: { visibility: 'hidden', transform: 'translateX(18px)' },
    closest: selector => classes.includes(selector.slice(1)) ? {} : null,
    querySelector: () => column,
    cloneNode: () => clone,
  };
  const host = { style: style(), replaceChildren(child) { this.child = child; } };
  return { source, host, clone, clonedColumn };
}

test('lifted copy keeps palette, workspace and reaction variables inside its own context', () => {
  const values = {
    '--chat-in-light': '#e8edf5', '--chat-out-light': '#506a8f',
    '--chat-out-ink-light': '#ffffff', '--bubble-bg': '#506a8f',
    '--color-primary': '#ef9f32', '--chat-status-read-light': '#15503f',
    color: 'rgb(24, 32, 43)', 'font-family': 'Inter',
  };
  const { source, host, clone } = fixture(values, ['qa-bubbles', 'qa-custom-in', 'qa-custom-out', 'qa-wallpaper', 'qa-wall-art-coast']);
  mountMessageMenuClone(source, host);
  assert.equal(host.child.className, 'msgmenu-theme-context qa-bubbles qa-custom-in qa-custom-out');
  for (const [property, value] of Object.entries(values)) assert.equal(host.child.style[property], value);
  assert.equal(host.style['--chat-out-light'], undefined, 'panel host must not acquire the bubble palette');
  assert.equal(host.style['--chat-status-read-light'], undefined, 'reader panels must not acquire the themed read accent');
  assert.equal(host.child.children[0], clone);
  assert.equal(source.style.visibility, 'hidden', 'the real message stays hidden until the menu restores it');
  assert.equal(clone.style.visibility, 'visible');
  assert.equal(clone.inert, true);
});

test('remounting from an uncustomized source cannot retain the previous palette', () => {
  const custom = fixture({ '--chat-out-light': '#506a8f' }, ['qa-bubbles', 'qa-custom-out']);
  mountMessageMenuClone(custom.source, custom.host);
  const standard = fixture({ '--color-primary': '#ffaa00' }, ['qa-bubbles']);
  mountMessageMenuClone(standard.source, custom.host);
  assert.equal(custom.host.child.className, 'msgmenu-theme-context qa-bubbles');
  assert.equal(custom.host.child.style['--chat-out-light'], undefined);
  assert.equal(custom.host.child.style['--color-primary'], '#ffaa00');
});

test('moving out of the chat flex layout keeps fractional column width', () => {
  const { source, host, clonedColumn } = fixture();
  mountMessageMenuClone(source, host);
  assert.equal(clonedColumn.style.width, '191.625px');
  assert.equal(clonedColumn.style.maxWidth, 'none');
  assert.equal(clonedColumn.style.flex, '0 0 auto');
});
