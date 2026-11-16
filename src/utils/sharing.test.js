import test from 'node:test';
import assert from 'node:assert/strict';
import { searchShareRecipients, profilePayload, forwardedPayload, shareLink, mergeSharedChats } from './sharing.js';
test('search handles formatted phones, hides dismissed employees and deduplicates active chats', () => {
  const active = [{ id: 'one', name: 'Алёна С.' }];
  const people = [{ id: 'one', name: 'Алёна С.', phone: '+77010000000' }, { id: 'two', name: 'Другой', phone: '+7 (701) 234-56-78' }, { id: 'old', name: 'Алёна Старая', dismissed: true }];
  assert.deepEqual(searchShareRecipients('алена', active, people).chats, active);
  assert.equal(searchShareRecipients('алёна', active, people).people.length, 0);
  assert.equal(searchShareRecipients('701 234', active, people).people[0].id, 'two');
  assert.equal(searchShareRecipients('', active, people).people.length, 0);
});
test('sharing a profile includes preview fields only and encodes a stable deep link', () => {
  const payload = profilePayload({ id: 'user / 2', name: 'Имя', role: 'Дизайнер', phone: 'secret', tabNumber: 'secret' });
  assert.equal(payload.profile.phone, undefined);
  assert.equal(payload.profile.tabNumber, undefined);
  assert.equal(shareLink(payload, 'https://demo.example'), 'https://demo.example/person?id=user%20%2F%202');
});
test('forwarding keeps the original author and profile payload without stale delivery metadata', () => {
  const source = { ...profilePayload({ id: 'one', name: 'Аяжан' }), id: 'old', mine: false, status: 'read', time: '11:00', forwardedFrom: 'Первый автор' };
  const copy = forwardedPayload(source, 'Второй автор');
  assert.equal(copy.forwardedFrom, 'Первый автор');
  assert.equal(copy.profile.name, 'Аяжан');
  assert.equal(copy.id, undefined);
  assert.equal(copy.status, undefined);
});
test('sent cards appear once at the top of chats, with correct recipient and preview', () => {
  const chats = [{ id: 'base-2', title: 'Данияр Кенжебаев', avatar: '/avatar.png', preview: 'Старая переписка', time: '10:00' }, { id: 'untouched', title: 'Другой' }];
  const store = { chats: { daniyar: { recipient: { id: 'daniyar', name: 'Данияр Кенжебаев' }, messages: [{ profile: { name: 'Аяжан' }, createdAt: 2, time: '11:32', status: 'delivered' }] } } };
  const result = mergeSharedChats(chats, store);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, 'base-2');
  assert.equal(result[0].profileId, 'daniyar');
  assert.equal(result[0].preview, 'Профиль: Аяжан');
  assert.equal(result[0].historyPreview, 'Старая переписка');
  assert.equal(result[0].historyTime, '10:00');
  assert.equal(result[1].id, 'untouched');
});
