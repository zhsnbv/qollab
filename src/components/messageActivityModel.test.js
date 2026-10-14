import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMessageActivity, compactActivityTime} from './messageActivityModel.js';
const readAt='2026-10-14T05:55:00Z', reactedAt='2026-10-14T05:56:00Z';
const readers=[{userId:'a',name:'Алина',readAt},{userId:'b',name:'Борис',readAt}];
const reactions={'👍':[{id:'a',name:'Алина',reactedAt},{id:'me',name:'Вы',reactedAt}]};

test('read privacy is opt-in even when reaction payload carries read metadata',()=>{
 for(const mine of [false,undefined,null,1]){
  const a=normalizeMessageActivity({mine,readers,reactions:{'👍':[{id:'a',name:'Алина',readAt,reactedAt}]}});
  assert.equal(a.readCount,0);assert.equal(a.people.length,1);assert.equal(a.people[0].readAt,undefined);
 }
});
test('combined people are unique and retain separate timestamps and counts',()=>{
 const a=normalizeMessageActivity({mine:true,readers,reactions});
 assert.equal(a.readCount,2);assert.equal(a.reactionCount,2);assert.equal(a.people.length,3);
 assert.equal(a.label,'2 реакции · 2 прочитали');
 const person=a.people.find(p=>p.userId==='a');assert.equal(person.readAt,readAt);assert.equal(person.reactedAt,reactedAt);
});
test('private read date is static and never becomes a people-list row',()=>{
 const a=normalizeMessageActivity({mine:true,personal:true,readers:readers.slice(0,1),reactions});
 assert.equal(a.personalReadAt,readAt);assert.equal(a.label,'2 реакции');assert.equal(a.people.length,2);
 assert.ok(a.people.every(p=>!p.readAt));
 const noReactions=normalizeMessageActivity({mine:true,personal:true,readers:readers.slice(0,1)});
 assert.equal(noReactions.label,'');assert.deepEqual(noReactions.people,[]);
});
test('invalid reads, author reads, duplicate reads and changed reactions do not inflate counts',()=>{
 const a=normalizeMessageActivity({mine:true,readers:[...readers,{...readers[0],readAt:reactedAt},{userId:'me',readAt},{userId:'invalid',readAt:'invalid'}],
 reactions:[{userId:'a',emoji:'👍',reactedAt},{userId:'a',emoji:'❤️',reactedAt:readAt}]});
 assert.equal(a.readCount,2);assert.equal(a.reactionCount,1);assert.equal(a.people.find(p=>p.userId==='a').emoji,'👍');
 assert.equal(a.people.find(p=>p.userId==='a').readAt,reactedAt);
});
test('compact dates use the target timezone and calendar year',()=>{
 const now='2026-01-01T01:00:00+05:00',tz='Asia/Almaty';
 assert.equal(compactActivityTime('2025-12-31T20:05:00Z',now,tz),'01:05');
 assert.equal(compactActivityTime('2025-12-31T18:59:00Z',now,tz),'Вчера, 23:59');
 assert.match(compactActivityTime('2025-12-25T12:00:00Z',now,tz),/2025/);
 assert.equal(compactActivityTime('invalid',now,tz),'');
});

test('reactors stay above readers even when a read event is newer',()=>{
 const a=normalizeMessageActivity({mine:true,readers:[{userId:'r',name:'Reader',readAt:'2026-10-14T06:00:00Z'}],reactions:[{userId:'a',name:'Reactor',emoji:'x',reactedAt:readAt}]});
 assert.deepEqual(a.people.map(p=>p.userId),['a','r']);
});
