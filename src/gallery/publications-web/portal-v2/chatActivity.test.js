import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePortalReactions, portalReadEntries, togglePortalReaction, portalReactionGroups, recordPortalRead, seedPortalActivity, isPrivateChat } from './chatActivity.js';
import { messageActivity } from '../../reaction-details/reactionDetailsModel.js';
const at = new Date('2026-10-14T07:00:00Z');
const peer = { id: 'peer', name: 'Коллега' };
const reaction = { user: peer, emoji: '👍', createdAt: at.toISOString() };

test('reaction chips toggle only the current user and keep other reactors', () => {
  const message = { reactions: [reaction] };
  togglePortalReaction(message, '👍', at);
  assert.equal(portalReactionGroups(message)['👍'].length, 2);
  togglePortalReaction(message, '❤️', at);
  assert.equal(portalReactionGroups(message)['👍'].length, 1);
  assert.equal(portalReactionGroups(message)['❤️'].length, 1);
  togglePortalReaction(message, '❤️', at);
  assert.deepEqual(message.reactions, [reaction]);
});
test('incoming, bot and notification messages never expose read events', () => {
  const message = { readEntries: [{ user: peer, createdAt: at.toISOString() }] };
  assert.deepEqual(portalReadEntries(message, { members: '6' }), []);
  assert.deepEqual(portalReadEntries({ ...message, own: true }, { kind: 'bot' }), []);
  assert.deepEqual(portalReadEntries({ ...message, own: true }, { kind: 'notifications' }), []);
});
test('author read entries exclude self, invalid events and duplicates', () => {
  const message = { own: true, readEntries: [{ user: peer, createdAt: at.toISOString() }, { user: peer, createdAt: '2026-10-14T06:00:00Z' }, { user: { id: 'me' }, createdAt: at.toISOString() }, { user: { id: 'broken' }, createdAt: 'invalid' }] };
  assert.deepEqual(portalReadEntries(message, {}), [{ user: peer, createdAt: at.toISOString() }]);
});
test('group activity is one person per row while retaining both timestamps', () => {
  const contact = { members: '73 участника', messages: Array.from({ length: 4 }, (_, index) => ({ own: index === 3, status: index === 3 ? 'read' : '', reactions: [] })) };
  seedPortalActivity(contact, at);
  const message = contact.messages[3];
  const entries = messageActivity(message.reactions, portalReadEntries(message, contact), message.own);
  assert.equal(entries.length, 6);
  assert.equal(entries.filter(entry => entry.readAt && entry.reactions.length).length, 3);
});
test('receipt events arrive from simulated delivery and private chats remain private', () => {
  const contact = { id: 'peer', name: 'Коллега', avatar: 'chat-ayazhan.png' }, message = { own: true, status: 'sent' };
  assert.equal(isPrivateChat(contact), true);
  assert.equal(portalReadEntries(message, contact).length, 0);
  recordPortalRead(message, contact, at);
  recordPortalRead(message, contact, at);
  assert.equal(message.status, 'read');
  assert.equal(portalReadEntries(message, contact).length, 1);
  assert.equal(normalizePortalReactions([reaction, { ...reaction, createdAt: 'invalid' }]).length, 1);
});
