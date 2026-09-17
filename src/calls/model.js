export const people = [
  { id: 'arman', name: 'Арман Асхатов', avatar: '/img/calls/icons/imgImage.png', initials: 'АА' },
  { id: 'ayazhan', name: 'Аяжан С.', avatar: '/img/chats/ayazhan.png', initials: 'АС' },
];
export const labels = { connecting: 'Подключение', ringing: 'Вызов', incoming: 'Входящий звонок', active: 'Идёт звонок', reconnecting: 'Восстанавливаем соединение', busy: 'Линия занята', declined: 'Вызов отклонён', unanswered: 'Нет ответа', unavailable:'Абонент недоступен', failed: 'Не удалось подключиться', ended: 'Звонок завершён', canceled:'Вызов отменён', elsewhere:'Ответили на другом устройстве' };
export const terminal = ['busy','declined','unanswered','failed','ended','canceled','elsewhere','unavailable'];
export const duration = n => `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
export function makeCall({video=false,status='connecting',name,chatId,person:provided,remoteVideo=false,facingMode='user',...rest}={}) {
  const person=provided||people.find(p=>p.name===name)||(name?{name,initials:name.split(' ').slice(0,2).map(s=>s[0]).join('')}:people[0]);
  return {createdAt:Date.now(),...rest,person,id:crypto.randomUUID(),kind:'personal',name:name||person.name,chatId:chatId||person.id||name||'arman',status,video,remoteVideo,facingMode,muted:false,seconds:0,minimized:false,route:'Динамик',sharing:false,direction:rest.direction||(status==='incoming'?'incoming':'outgoing'),media:video?'video':'audio'};
}
export function transition(call,status) {
  if(!call||terminal.includes(call.status))return call;
  return {...call,status,...(status==='reconnecting'?{reconnectDeadline:call.reconnectDeadline||Date.now()+15000}:status==='active'?{reconnectDeadline:null}:{}),...(terminal.includes(status)?{sharing:false,remoteSharing:false,video:false,remoteVideo:false,minimized:false}:{}),...(status==='active'&&!call.connectedAt?{connectedAt:Date.now()}:{} )};
}

export const chatKey = chat => chat.profileId || chat.id || chat.title || chat.name;
export function callFailure(call) {
 if(!call||(call.direction==='incoming'&&!(call.status==='failed'&&call.connectedAt))||!['busy','declined','unanswered','unavailable','failed'].includes(call.status))return null;
 const text={busy:'Собеседник сейчас в другом разговоре. Попробуйте позвонить позже или напишите в чат.',declined:'Сейчас собеседник не может принять звонок. Попробуйте позже или напишите в чат.',unanswered:'Собеседник не ответил. Попробуйте позвонить позже или напишите в чат.',unavailable:call.unavailableReason||'Не удалось связаться с собеседником. Попробуйте позже или напишите в чат.',failed:call.connectedAt?'Соединение не удалось восстановить. Попробуйте позвонить ещё раз или напишите в чат.':'Не удалось установить соединение. Проверьте подключение и попробуйте ещё раз.'};
 return {title:call.status==='failed'?(call.connectedAt?'Связь прервалась':'Не удалось позвонить'):labels[call.status],text:text[call.status]};
}
export function groupCallHistory(history,chatId) {
 const events=[...history].filter(c=>!chatId||c.chatId===chatId).reverse();
 const same=(a,b)=>a&&b&&a.direction===b.direction&&a.chatId===b.chatId&&new Date(a.createdAt||0).toDateString()===new Date(b.createdAt||0).toDateString();
 return events.map((call,i)=>({...call,groupStart:!same(events[i-1],call),groupEnd:!same(call,events[i+1]),groupSingle:!same(events[i-1],call)&&!same(call,events[i+1])}));
}
export function mergeChatEvents(messages,history,chatId) {
 const calls=[...history].filter(c=>c.chatId===chatId).reverse().map((call,i)=>({id:`call-${call.id}`,call,mine:call.direction==='outgoing',createdAt:call.finishedAt||call.createdAt||i+1}));
 return [...messages,...calls].sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
}
export function restoreCall(saved, now=Date.now()) {
 if(!saved||terminal.includes(saved.status))return null;
 const deadline=saved.reconnectDeadline||saved.savedAt+15000;
 return {...saved,video:false,sharing:false,minimized:false,status:deadline>now?'reconnecting':'failed',reconnectDeadline:deadline,restored:true};
}
export function callOutcome(c){
 if(c.status==='ended'&&c.connectedAt){const n=c.seconds;if(n>=60)return `${Math.floor(n/60)} мин ${n%60} сек`;const word=n%10===1&&n%100!==11?'секунда':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'секунды':'секунд';return `${n} ${word}`;}
 if(c.direction==='incoming'&&['busy','unanswered','unavailable'].includes(c.status))return 'Пропущен';
 if(c.status==='canceled')return 'Отменён';
 if(c.status==='declined')return c.direction==='incoming'?'Отклонён':'Вызов отклонён';
 return labels[c.status]||'Завершён';
}
