// A lifted message leaves its chat surface, so DOM cloning alone loses the
// inherited palette and the selectors scoped to that surface. Keep that context
// inside the copy only; the action panels and emoji picker remain app-colored.
const BUBBLE_CLASSES = ['qa-bubbles', 'qa-custom-in', 'qa-custom-out'];
const INHERITED_TEXT = ['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'];

const computedStyle = node => node.ownerDocument.defaultView.getComputedStyle(node);

export function mountMessageMenuClone(source, host) {
  const context = source.ownerDocument.createElement('div');
  context.className = ['msgmenu-theme-context', ...BUBBLE_CLASSES.filter(name => source.closest(`.${name}`))].join(' ');
  const computed = computedStyle(source);
  // Custom properties include workspace tokens, the chosen bubble palette,
  // reaction fills and read-status colors. No wallpaper/layout class is copied.
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    if (property.startsWith('--')) context.style.setProperty(property, computed.getPropertyValue(property));
  }
  for (const property of INHERITED_TEXT) context.style.setProperty(property, computed.getPropertyValue(property));

  const clone = source.cloneNode(true);
  clone.style.visibility = 'visible';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.inert = true;
  const column = source.querySelector('.msg-col');
  const clonedColumn = clone.querySelector('.msg-col');
  if (column && clonedColumn) {
    // Integer offsetWidth changes wrapping for columns with fractional widths.
    clonedColumn.style.width = computedStyle(column).width;
    clonedColumn.style.maxWidth = 'none';
    clonedColumn.style.flex = '0 0 auto';
  }
  context.append(clone);
  host.replaceChildren(context);
  return clone;
}
