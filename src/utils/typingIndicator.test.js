import test from 'node:test';
import assert from 'node:assert/strict';
import { typingSubtitle } from './typingIndicator.js';

test('typing labels distinguish direct, single, multiple and crowded group chats', () => {
  assert.equal(typingSubtitle([]), null);
  assert.equal(typingSubtitle(['Аяжан']), 'печатает…');
  assert.equal(typingSubtitle([{short:'Динара Т.'}], true), 'Динара Т. печатает…');
  assert.equal(typingSubtitle(['Динара Т.', 'Нурлан Б.'], true), 'Динара Т. и ещё 1 печатают…');
  assert.equal(typingSubtitle(['Динара Т.', 'Нурлан Б.', 'Арман А.'], true), 'Динара Т. и ещё 2 печатают…');
  assert.equal(typingSubtitle(['1', '2', '3', '4', '5'], true), 'Несколько участников печатают…');
});
