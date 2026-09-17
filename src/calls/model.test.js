import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeCall,transition,terminal,restoreCall,callOutcome,chatKey,callFailure,groupCallHistory,mergeChatEvents} from './model.js';
import {stepPuck} from './puck.js';
test('call records and messages share chronological order; a new message follows its call',()=>{
 const messages=[{id:'old'},{id:'after',createdAt:300},{id:'before',createdAt:100}];
 const history=[{id:'other-chat',chatId:'b',finishedAt:250},{id:'phone',chatId:'a',direction:'outgoing',createdAt:150,finishedAt:200}];
 assert.deepEqual(mergeChatEvents(messages,history,'a').map(e=>e.id),['old','before','call-phone','after']);
});
test('failure dialogs explain unsuccessful outgoing calls, never intentional cancellation or rejected incoming',()=>{
 for(const status of ['busy','declined','unanswered','unavailable','failed'])assert.ok(callFailure(makeCall({status})).text);
 for(const status of ['ended','canceled','elsewhere'])assert.equal(callFailure(makeCall({status})),null);
 assert.equal(callFailure(makeCall({status:'declined',direction:'incoming'})),null);
 assert.notEqual(callFailure(makeCall({status:'failed'})).title,callFailure(makeCall({status:'failed',connectedAt:1})).title);
});
test('only the first bubble in a consecutive run has a corner, including a singleton',()=>{
 const event=(id,direction,chatId='a')=>({id,direction,chatId});
 const chronological=[event('a','incoming'),event('b','incoming'),event('c','incoming'),event('d','outgoing'),event('e','incoming'),event('f','outgoing'),event('g','outgoing')];
 assert.deepEqual(groupCallHistory([...chronological].reverse(),'a').filter(c=>c.groupStart).map(c=>c.id),['a','d','e','f']);
 assert.equal(groupCallHistory([event('single','outgoing')],'a')[0].groupStart,true);
 assert.equal(groupCallHistory([event('b','incoming'),event('a','incoming','b')])[1].groupStart,true);
});
test('all terminal states release media and ignore late answers',()=>{
 const active=makeCall({status:'active',video:true,sharing:true});
 for(const status of terminal){const ended=transition(active,status);assert.equal(ended.video,false);assert.equal(ended.sharing,false);assert.equal(transition(ended,'active'),ended);}
});
test('reconnect preserves identity, mute and the original conversation clock',()=>{
 const active={...transition(makeCall(),'active'),muted:true,seconds:57};
 const resumed=transition(transition(active,'reconnecting'),'active');assert.equal(resumed.id,active.id);assert.equal(resumed.connectedAt,active.connectedAt);assert.equal(resumed.seconds,57);assert.equal(resumed.muted,true);
});
test('answering a second incoming preserves its direction in history',()=>{
 const call=makeCall({status:'active',direction:'incoming',video:true});const ended=transition(call,'ended');assert.equal(ended.direction,'incoming');assert.equal(ended.media,'video');
});
test('puck reflects velocity at edges and settles inside bounds',()=>{
 const bounds={left:16,right:324,top:16,bottom:696};
 let p=stepPuck({x:322,y:50,vx:2,vy:-3},bounds,16);
 assert.ok(p.vx<0);assert.ok(p.x<=324);assert.ok(p.y>=16);
 for(let i=0;i<800;i++)p=stepPuck(p,bounds,16);
 assert.ok(p.x>=16&&p.x<=324);assert.equal(p.vx,0);assert.equal(p.vy,0);assert.ok(p.y>=16&&p.y<=696);
});
test('reduced motion stops without inertia, even after resize',()=>{
 const p=stepPuck({x:400,y:900,vx:2,vy:3},{left:16,right:242,top:16,bottom:400},16,true);assert.deepEqual(p,{x:242,y:400,vx:0,vy:0});
});

test('free motion is frame-rate independent and never gains kinetic energy',()=>{
 const bounds={left:0,right:10000,top:0,bottom:10000};
 const initial={x:200,y:200,vx:1,vy:.6};
 let a=initial,b=initial;
 for(let i=0;i<30;i++)a=stepPuck(a,bounds,16);
 for(let i=0;i<60;i++)b=stepPuck(b,bounds,8);
 assert.ok(Math.abs(a.x-b.x)<.001);assert.ok(Math.abs(a.y-b.y)<.001);
 const reflected=stepPuck({x:322,y:690,vx:3,vy:2},{left:16,right:324,top:16,bottom:696},16);
 assert.ok(reflected.vx<0&&reflected.vy<0);
 assert.ok(Math.hypot(reflected.vx,reflected.vy)<Math.hypot(3,2));
});

test('refresh restoration retains session identity and reconnect deadline',()=>{
 const active={...makeCall({status:'active'}),savedAt:1000,connectedAt:800};
 const resumed=restoreCall(active,5000);assert.equal(resumed.id,active.id);assert.equal(resumed.status,'reconnecting');assert.equal(resumed.reconnectDeadline,16000);
 assert.equal(restoreCall({...resumed,savedAt:6000},17000).status,'failed');
 const retry=transition(transition(active,'reconnecting'),'reconnecting');assert.equal(transition(retry,'reconnecting').reconnectDeadline,retry.reconnectDeadline);
});
test('busy is missed for callee, busy for caller, never a successful duration',()=>{
 assert.equal(callOutcome({direction:'incoming',status:'busy',seconds:0}),'Пропущен');
 assert.equal(callOutcome({direction:'outgoing',status:'busy',seconds:50}),'Линия занята');
 assert.equal(callOutcome({status:'ended',seconds:48,connectedAt:1}),'48 секунд');
 assert.equal(chatKey({profileId:'arman',title:'Арман Асхатов'}),'arman');
});
