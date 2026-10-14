import test from 'node:test';
import assert from 'node:assert/strict';
import { mobileMenuGeometry } from './menuGeometry.js';

for (const originalTop of [0, 80, 400, 790]) {
  test(`mobile panels remain reachable for message at ${originalTop}`, () => {
    const box = mobileMenuGeometry({ originalTop, bubbleHeight: 120, stageHeight: 820, reactionHeight: 44, listHeight: 320 });
    assert.ok(box.reactTop >= 12);
    assert.ok(box.listTop + Math.min(320, box.listMax) <= 808);
    assert.equal(box.listTop - box.top, 130);
    assert.equal(box.visibleHeight, 120);
  });
}
test('tall attachments leave actions visible on a short viewport', () => {
  const box = mobileMenuGeometry({ originalTop: 100, bubbleHeight: 600, stageHeight: 420, reactionHeight: 44, listHeight: 320 });
  assert.ok(box.visibleHeight < 600);
  assert.ok(box.listMax >= 120);
  assert.ok(box.reactTop >= 12);
  assert.ok(box.listTop + box.listMax <= 408);
});
