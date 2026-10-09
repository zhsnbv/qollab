const EDGE = 12;
const GAP = 10;

export function mobileMenuGeometry({ originalTop, bubbleHeight, stageHeight, reactionHeight, listHeight }) {
  const minTop = EDGE + reactionHeight + GAP;
  const maxTop = stageHeight - EDGE - bubbleHeight - GAP - listHeight;
  const top = Math.max(minTop, Math.min(originalTop, maxTop));
  const listTop = top + bubbleHeight + GAP;
  return { top, shift: top - originalTop, reactTop: top - GAP - reactionHeight, listTop, listMax: Math.max(0, stageHeight - EDGE - listTop) };
}
