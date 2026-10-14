const EDGE = 12;
const GAP = 10;

// Keep quick reactions and at least a few actions reachable on short screens.
// A very tall attachment is clipped inside its lifted copy, never over the menu.
export function mobileMenuGeometry({ originalTop, bubbleHeight, stageHeight, reactionHeight, listHeight }) {
  const actionReserve = Math.min(listHeight, 120);
  const visibleHeight = Math.max(0, Math.min(bubbleHeight, stageHeight - EDGE * 2 - reactionHeight - GAP * 2 - actionReserve));
  const minTop = EDGE + reactionHeight + GAP;
  const maxTop = stageHeight - EDGE - visibleHeight - GAP - listHeight;
  const top = Math.max(minTop, Math.min(originalTop, maxTop));
  const listTop = top + visibleHeight + GAP;
  return { top, shift: top - originalTop, visibleHeight, reactTop: top - GAP - reactionHeight, listTop, listMax: Math.max(0, stageHeight - EDGE - listTop) };
}
