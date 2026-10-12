import test from 'node:test';
import assert from 'node:assert/strict';
import { documentHasContent, documentText, legacyDeltaToBlocks } from './blockDocument.js';

test('legacy text keeps formatting, links, heading and nested lists', () => {
  const original = { ops: [{ insert: 'Раздел' }, { insert: '\n', attributes: { header: 2 } }, { insert: 'Первый', attributes: { bold: true } }, { insert: '\n', attributes: { list: 'ordered' } }, { insert: 'Ссылка', attributes: { link: 'https://qollab.kz/', italic: true } }, { insert: '\n', attributes: { list: 'bullet', indent: 1 } }] };
  const before = JSON.stringify(original);
  const blocks = legacyDeltaToBlocks(original);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].props.level, 2);
  assert.equal(blocks[1].content[0].styles.bold, true);
  assert.equal(blocks[1].children[0].type, 'bulletListItem');
  assert.equal(blocks[1].children[0].content[0].href, 'https://qollab.kz/');
  assert.equal(documentText({ format: 'blocknote', blocks }), 'Раздел\nПервый\nСсылка');
  assert.equal(JSON.stringify(original), before);
});

test('legacy media, alignment, font size and audit sections survive conversion', () => {
  const blocks = legacyDeltaToBlocks({ ops: [{ insert: 'Охрана труда\n' }, { insert: 'Цитата', attributes: { size: 'large' } }, { insert: '\n', attributes: { blockquote: true, align: 'center' } }, { insert: { image: '/photo.png' } }, { insert: { video: 'https://youtube.com/embed/aqz-KE-bpKQ' } }] }, 'audit');
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'quote');
  assert.equal(blocks[1].props.textAlignment, 'center');
  assert.equal(blocks[1].content[0].styles.fontSize, 'large');
  assert.equal(blocks[2].props.url, '/photo.png');
  assert.equal(blocks[3].type, 'embed');
});

test('empty, media-only and table documents are handled by feed disclosure and lead', () => {
  assert.equal(documentHasContent({ format: 'blocknote', blocks: [{ type: 'paragraph', content: [] }] }), false);
  assert.equal(documentHasContent({ format: 'blocknote', blocks: [{ type: 'image', props: { url: '/photo.png' } }] }), true);
  const document = { format: 'blocknote', version: 1, blocks: [{ type: 'table', content: { rows: [{ cells: [[{ type: 'text', text: 'Тема' }], { content: [{ type: 'text', text: 'Итог' }] }] }] } }] };
  assert.equal(documentText(document), 'Тема\tИтог');
  assert.deepEqual(legacyDeltaToBlocks(document), document.blocks);
  assert.notEqual(legacyDeltaToBlocks(document), document.blocks);
});
