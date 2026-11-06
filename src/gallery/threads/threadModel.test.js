import test from 'node:test';
import assert from 'node:assert/strict';
import { addReply, canThread, channelReplies, initialThreads, markRead, myThreads, participates, unreadThreads, THREAD_CASES, confirmedReplies, setReplyStatus, deleteFailedReply, deleteThreadMessage, rootLabel } from './threadModel.js';

test('thread eligibility is limited to open and private groups', () => {
  for (const type of ['direct', 'bot', 'threads', 'notifications', undefined]) assert.equal(canThread(type), false);
  assert.ok(canThread('open_group') && canThread('private_group'));
});
test('reading a stranger thread does not create participation', () => {
  const t = initialThreads('visitor')[0];
  assert.equal(participates(t), false);
  assert.equal(participates(markRead(t)), false);
  assert.equal(myThreads([t]).length, 0);
  assert.ok(t.replies.length > 0);
});
test('each implicit participation trigger works independently', () => {
  const author = initialThreads('participant-author')[0];
  assert.ok(author.replies.every(r => r.author !== 'me' && !r.mentions?.includes('me')));
  for (const id of ['participant-author', 'participant-reply', 'participant-mention']) assert.ok(participates(initialThreads(id)[0]));
  assert.equal(participates({ ...author, replies: [] }), false);
});
test('private thread replies stay out of the group and add participation', () => {
  const t = initialThreads('thread-empty')[0];
  const next = addReply(t, { id: 'new', text: 'Ответ' });
  assert.equal(t.replies.length, 0);
  assert.equal(next.replies.length, 1);
  assert.ok(participates(next));
  assert.equal(channelReplies(next).length, 0);
});
test('cross-posting keeps one reply object with a group visibility flag', () => {
  const next = addReply(initialThreads('thread-empty')[0], { id: 'both', text: 'В обе ленты', showInChannel: true });
  assert.equal(next.replies.length, 1);
  assert.equal(channelReplies(next)[0], next.replies[0]);
  assert.equal(next.unread, 0);
});
test('retry and blank submits cannot create duplicate replies', () => {
  const t = addReply(initialThreads('thread-empty')[0], { id: 'retry', text: 'Отправить' });
  assert.equal(addReply(t, { id: 'retry', text: 'Отправить' }), t);
  assert.equal(addReply(t, { id: 'blank', text: '  ' }), t);
  assert.equal(addReply({ ...t, channelType: 'direct' }, { id: 'direct', text: 'no' }).replies.length, 1);
});
test('badge counts unread discussions; reading retains total reply count', () => {
  const all = initialThreads('threads');
  assert.equal(unreadThreads(all), 2);
  const read = all.map((t, i) => i === 0 ? markRead(t) : t);
  assert.equal(unreadThreads(read), 1);
  assert.equal(read[0].replies.length, all[0].replies.length);
  assert.equal(read[0].unread, 0);
});
test('latest activity reorders across groups and empty participation is empty', () => {
  const list = myThreads(initialThreads('threads'));
  assert.equal(new Set(list.map(t => t.group)).size, 3);
  assert.equal(myThreads(initialThreads('list-empty')).length, 0);
  assert.equal(myThreads([...list, { ...list[2], id: 'newest', updated: 100 }])[0].id, 'newest');
  const replied = addReply(list[2], { id: 'latest', text: 'Новый ответ', updated: 100 });
  assert.equal(myThreads([list[0], list[1], replied])[0].id, replied.id);
});
test('review cases have unique routes and cover every original Figma frame', () => {
  assert.equal(new Set(THREAD_CASES.map(c => c.id)).size, THREAD_CASES.length);
  assert.equal(new Set(THREAD_CASES.filter(c => c.figmaNode).map(c => c.figmaNode)).size, 14);
  for (const c of THREAD_CASES) {
    assert.ok(initialThreads(c.id).length);
    for (const t of initialThreads(c.id)) assert.ok(t.unread <= t.replies.length);
  }
});

test('deleting a root redacts its title while preserving the thread, its replies and unread count', () => {
  const [original] = initialThreads('threads');
  const deleted = deleteThreadMessage(original, original.id);
  assert.equal(deleted.id, original.id);
  assert.equal(deleted.title, '');
  assert.equal(rootLabel(deleted), 'Сообщение удалено');
  assert.deepEqual(channelReplies(deleted), channelReplies(original));
  assert.deepEqual(myThreads([deleted]), [deleted]);
  assert.equal(deleted.unread, original.unread);
  assert.equal(deleteThreadMessage(deleted, deleted.id), deleted);
  assert.equal(confirmedReplies(addReply(deleted, { id: 'another', text: 'Ещё ответ' })).length, 4);
});

test('removing a cross-post updates both feeds and keeps previous participation while replies remain', () => {
  const [original] = initialThreads('threads');
  const partial = deleteThreadMessage(deleteThreadMessage(original, original.id), 'r1');
  assert.equal(partial.unread, 2);
  assert.equal(confirmedReplies(partial).length, 2);
  assert.deepEqual(channelReplies(partial).map(r => r.id), ['r2']);
  assert.ok(participates(partial));
  assert.equal(deleteThreadMessage(partial, 'r1'), partial);
  assert.equal(deleteThreadMessage(partial, 'r2').unread, 1);
});

test('only a deleted root with no surviving confirmed replies closes, in either deletion order', () => {
  const [original, other] = initialThreads('delete-root');
  const live = deleteThreadMessage(original, 'r1');
  assert.notEqual(live.status, 'closed');
  assert.equal(addReply(live, { id: 'fresh', text: 'Снова' }).replies.length, 1);
  const rootFirst = deleteThreadMessage(deleteThreadMessage(original, original.id), 'r1');
  const repliesFirst = deleteThreadMessage(live, live.id);
  assert.deepEqual(rootFirst, repliesFirst);
  assert.equal(rootFirst.id, original.id);
  assert.equal(rootFirst.status, 'closed');
  assert.deepEqual(myThreads([rootFirst, other]), [other]);
  assert.equal(unreadThreads([rootFirst, other]), unreadThreads([other]));
  assert.equal(addReply(rootFirst, { id: 'late', text: 'Опоздал' }), rootFirst);
  assert.equal(deleteThreadMessage(rootFirst, 'r1'), rootFirst);
});

test('a pending delivery cannot resurrect a thread closed by deleting the last sent reply', () => {
  const [original] = initialThreads('deleted-root-thread');
  const pending = addReply(original, { id: 'pending', text: 'Текст', status: 'sending', showInChannel: true });
  const closed = deleteThreadMessage(pending, 'r1');
  assert.equal(closed.status, 'closed');
  assert.equal(setReplyStatus(closed, 'pending', 'sent'), closed);
  assert.deepEqual(channelReplies(closed), []);
});


test('pending and failed replies stay local and do not inflate counts or participation', () => {
  const initial = initialThreads('thread-empty')[0];
  const sending = addReply(initial, { id: 'outbox-1', text: 'В обе ленты', showInChannel: true, status: 'sending' });
  assert.equal(sending.replies.length, 1);
  assert.equal(confirmedReplies(sending).length, 0);
  assert.equal(channelReplies(sending).length, 0);
  assert.equal(participates(sending), false);
  assert.equal(sending.updated, initial.updated);
  const failed = setReplyStatus(sending, 'outbox-1', 'failed');
  assert.equal(failed.replies[0].status, 'failed');
  assert.equal(confirmedReplies(failed).length, 0);
  assert.equal(channelReplies(failed).length, 0);
  assert.equal(participates(failed), false);
});

test('retry sends the same message once, preserving its text and group option', () => {
  const sending = addReply(initialThreads('thread-empty')[0], { id: 'outbox-2', text: 'В обе ленты', showInChannel: true, status: 'sending' });
  const failed = setReplyStatus(sending, 'outbox-2', 'failed');
  const retry = setReplyStatus(failed, 'outbox-2', 'sending');
  const sent = setReplyStatus(retry, 'outbox-2', 'sent', 100);
  assert.equal(sent.replies.length, 1);
  assert.equal(sent.replies[0].text, 'В обе ленты');
  assert.equal(sent.replies[0].status, 'sent');
  assert.equal(channelReplies(sent)[0], sent.replies[0]);
  assert.equal(confirmedReplies(sent).length, 1);
  assert.ok(participates(sent));
  assert.equal(setReplyStatus(sent, 'outbox-2', 'sent'), sent);
  assert.equal(setReplyStatus(sent, 'outbox-2', 'failed'), sent);
});

test('deleting a failed message cannot delete a sent one or resurrect on a late callback', () => {
  const failed = initialThreads('send-error')[0];
  const deleted = deleteFailedReply(failed, 'demo-failed');
  assert.equal(deleted.replies.length, failed.replies.length - 1);
  assert.equal(setReplyStatus(deleted, 'demo-failed', 'sent'), deleted);
  assert.deepEqual(deleteFailedReply(deleted, 'r1').replies, deleted.replies);
});
