import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Chats from '../screens/Chats';
import { VideoCamera, MicrophoneSlash, MonitorArrowUp, ChatCircle, Check } from '@phosphor-icons/react';
import Portal, {DeviceHost} from '../components/Portal';
import {useNavigate} from 'react-router-dom';
import CallWave from './waves/CallWave';
import SheetTop from '../components/SheetTop';
import ConfirmDialog from '../components/ConfirmDialog';
import useSheetSwipe from './useCallSheetSwipe';
import { pushScrim, popScrim } from '../utils/scrim';
import CallPuck from './CallPuck';
import Icon from './CallIcon';
import CallSharedScreen from './CallSharedScreen';
import {TimeRow} from '../components/Message';
import { people,labels,terminal,duration,makeCall,transition,restoreCall,callOutcome,callFailure,groupCallHistory } from './model';
import './Calls.css';
const Context=createContext(null);
export const useCalls=()=>useContext(Context);
const asset='/img/calls/icons/';
export function Avatar({person=people[0],className=''}){return <span className={`call-avatar ${className}`}>{person.avatar?<img src={person.avatar} alt=""/>:person.initials}</span>;}
function Sheet({title,onClose,children}) {
  const {showcase}=useCalls()||{};
  const swipe=useSheetSwipe(onClose),ref=useRef(null),close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    if(showcase)return;
    pushScrim();const previous=document.activeElement;
    ref.current?.querySelector('button')?.focus({preventScroll:true});
    const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();}if(e.key==='Tab'){const els=[...ref.current.querySelectorAll('button:not(:disabled),input,select,[tabindex="0"]')];const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',key);return()=>{popScrim();document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[showcase]);
  return <Portal><div className="call-sheet-wrap"><button className="asheet-scrim" aria-label="Закрыть лист" onClick={onClose}/><section ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`asheet call-sheet ${swipe.className}`} style={swipe.style}><SheetTop onClose={onClose} swipe={swipe}><h3 className="asheet-title">{title}</h3></SheetTop><div className="call-sheet-content">{children}</div></section></div></Portal>;
}
function Row({children,onClick,selected,icon,sub,danger=false}){return <button className={`asheet-item select ${danger?'danger':''}`} onClick={onClick}>{icon}<span className="asheet-label">{children}{sub&&<span className="asheet-sub">{sub}</span>}</span>{selected&&<Check size={20}/>}</button>;}
function PermissionSheet({title,icon,children,primaryLabel,onPrimary,onClose,busy=false}){
 return <Sheet title={title} onClose={onClose}><div className="call-sheet-body"><div className="call-permission-icon">{icon}</div>{children}<button className="calls-primary" disabled={busy} onClick={onPrimary}>{primaryLabel}</button><button className="calls-secondary" onClick={onClose}>Не сейчас</button></div></Sheet>;
}
function SecondIncoming({pending,current,onDecline,onAnswer,paused}){
 const person=pending.person||people.find(p=>p.name===pending.name)||{name:pending.name,initials:pending.name?.slice(0,2)};
 return <Portal><section className="call-screen call-screen-incoming call-second-screen" role="dialog" aria-modal="true" aria-label="Второй входящий звонок"><CallWave status="incoming" paused={paused}/><div className="call-hero"><Avatar person={person}/><div className="call-identity"><h1>{person.name}</h1><div className="call-status">Второй входящий {pending.video?'видеозвонок':'аудиозвонок'}</div><p className="call-waiting-copy">Текущий разговор: {current?.name}.<br/>Если ответить, текущий разговор завершится.</p></div></div><footer className="call-incoming"><div className="call-incoming-actions"><button className="call-answer call-answer-decline" onClick={onDecline}><span><Icon name="end" size={28}/></span><b>Отклонить</b></button><button className="call-answer call-answer-accept" onClick={onAnswer}><span><Icon name="phone" size={28}/></span><b>Завершить и ответить</b></button></div></footer></section></Portal>;
}
function Control({icon,label,onClick,pressed,disabled}){return <button className="call-control" onClick={onClick} aria-label={label} aria-pressed={pressed} disabled={disabled}><span className="call-control-circle">{icon}</span><span>{label}</span></button>;}
export function CallQuality({level='good',side='local'}){
 const label=level==='good'?'Хорошее соединение':side==='remote'?'Соединение собеседника нестабильно':'Ваше соединение нестабильно';
 return <div className={`call-quality ${level}`} role="status"><span className={level==='poor'?'call-status-chip':'call-quality-label'}><span className="call-signal" aria-hidden="true">{[0,1,2,3].map(i=><i key={i} className={level==='good'||i===0?'lit':''}/>)}</span><span>{label}</span></span></div>;
}
function CallFailureDialog({call,onClose,onMessage}) {
 const {showcase}=useCalls()||{},ref=useRef(null),closeRef=useRef(onClose),failure=callFailure(call);closeRef.current=onClose;
 useEffect(()=>{
  if(showcase)return;
  const previous=document.activeElement;pushScrim();
  const buttons=()=>[...ref.current.querySelectorAll('.cdlg-actions button')];buttons()[0]?.focus({preventScroll:true});
  const key=e=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'){const list=buttons(),index=list.indexOf(document.activeElement);e.preventDefault();list[(index+(e.shiftKey?-1:1)+list.length)%list.length]?.focus();}};
  document.addEventListener('keydown',key);return()=>{popScrim();document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[showcase]);
 if(!failure)return null;
 return <Portal><div className="call-failure-dialog" ref={ref}><ConfirmDialog {...failure} confirmLabel="Написать в чат" cancelLabel="Понятно" onConfirm={onMessage} onCancel={onClose}/></div></Portal>;
}
function StreamVideo({stream}){const ref=useRef(null);useEffect(()=>{if(ref.current)ref.current.srcObject=stream;},[stream]);return <video ref={ref} autoPlay muted playsInline/>;}
export function CallsProvider({children,showcase=false,fixture={},animateWaves=true,permissionAdapter,remoteScreen,mediaMode='device'}) {
  const liveKey=mediaMode==='scenario'?'qollab-flow-live-call':'qollab-live-call',historyKey=mediaMode==='scenario'?'qollab-flow-call-history':'qollab-personal-calls';
  const [scenarioMicReady,setScenarioMicReady]=useState(()=>mediaMode==='scenario'&&sessionStorage.getItem('qollab-flow-mic')==='1');
  const host=useContext(DeviceHost),navigate=useNavigate();
  const [call,setCall]=useState(()=>showcase?fixture.call||null:(()=>{try{return restoreCall(JSON.parse(sessionStorage.getItem(liveKey)||'null'));}catch{return null;}})()),[pending,setPending]=useState(fixture.pending||null),[history,setHistory]=useState(()=>{if(showcase)return fixture.history||[];try{return JSON.parse(sessionStorage.getItem(historyKey)||'[]');}catch{return [];}});
  const [sheet,setSheet]=useState(fixture.sheet||null),[issue,setIssue]=useState(fixture.issue||''),[camera,setCamera]=useState(null),[screen,setScreen]=useState(null),[busyMedia,setBusyMedia]=useState(false);
  const [micRequest,setMicRequest]=useState(fixture.micRequest||null);
  const [micDenied,setMicDenied]=useState(fixture.micDenied||false);
  const [settingsHelp,setSettingsHelp]=useState(fixture.settingsHelp||false),[cameraDenied,setCameraDenied]=useState(fixture.cameraDenied||false);
  const [failureCall,setFailureCall]=useState(fixture.failureCall||null);
  const current=useRef(call);current.current=call;
  const permissionRequest=useRef(0);
  const puckPosition=useRef(null);
  const [motion,setMotion]=useState('enter');
  const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const callId=call?.id,callStatus=call?.status,connectedAt=call?.connectedAt,hasCall=Boolean(call),minimized=call?.minimized;
  const media=useRef({camera:null,screen:null,microphone:null}),archived=useRef(new Set(history.map(c=>c.id)));
  const review=!showcase&&new URLSearchParams(window.location.search).has('review');
  const patch=change=>setCall(c=>c&&!terminal.includes(c.status)?{...c,...change}:c);
  const stop=type=>{media.current[type]?.getTracks().forEach(t=>t.stop());media.current[type]=null;if(type==='camera')setCamera(null);else if(type==='screen')setScreen(null);};
  const archive=c=>{if(!c||!terminal.includes(c.status)||archived.current.has(c.id))return;archived.current.add(c.id);setHistory(h=>[{...c,finishedAt:Date.now(),time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})},...h].slice(0,100));};
  const finish=(status)=>{archive(transition(current.current,status||(current.current?.connectedAt?'ended':current.current?.status==='incoming'?'declined':'canceled')));stop('camera');stop('screen');stop('microphone');setSheet(null);setIssue('');setCall(c=>transition(c,status||(c?.connectedAt?'ended':c?.status==='incoming'?'declined':'canceled')));};
  const begin=(options={})=>{if(options.kind==='group')return; if(current.current&&!terminal.includes(current.current.status)){if(current.current.chatId===options.chatId&&options.chatId){setMotion('enter');patch({minimized:false});return;}setPending(options);return;}setFailureCall(null);puckPosition.current=null;setMotion('enter');setIssue('');setSheet(options.video&&options.status!=='incoming'?'camera':null);setCall(makeCall(options));};
  const start=async(options={})=>{
    if(showcase)return;
    if(current.current&&!terminal.includes(current.current.status)){begin(options);return;}
    if(options.status==='incoming'||review){begin(options);return;}
    if(mediaMode==='scenario'){if(scenarioMicReady)begin(options);else{setMicDenied(false);setSettingsHelp(false);setMicRequest(options);setSheet('mic');}return;}
    let state='prompt';
    try{state=(await navigator.permissions.query({name:'microphone'})).state;}catch{/* Explain access before a platform prompt. */}
    if(state==='granted'){begin(options);return;}
    setSettingsHelp(false);setMicDenied(state==='denied');setMicRequest(options);setSheet('mic');
  };
  const allowMicrophone=async()=>{
    if(mediaMode==='scenario'){setScenarioMicReady(true);sessionStorage.setItem('qollab-flow-mic','1');setMicRequest(null);setSheet(null);begin(micRequest||{});return;}
    const request=++permissionRequest.current;setBusyMedia(true);
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(request!==permissionRequest.current){stream.getTracks().forEach(t=>t.stop());return;}
      media.current.microphone=stream;setMicDenied(false);setSettingsHelp(false);setMicRequest(null);setSheet(null);
      begin(micRequest||{});
    }catch{setMicDenied(true);setSheet('mic');}finally{setBusyMedia(false);}
  };
  const dismissMic=()=>{permissionRequest.current++;setSettingsHelp(false);setMicRequest(null);setSheet(null);};
  const openSettings=()=>{if(permissionAdapter?.openSettings)permissionAdapter.openSettings();else setSettingsHelp(true);};
  useEffect(()=>{if(sheet!=='camera'||showcase||mediaMode==='scenario')return;let alive=true;navigator.permissions?.query({name:'camera'}).then(p=>{if(alive)setCameraDenied(p.state==='denied');}).catch(()=>{});return()=>{alive=false;};},[sheet,showcase,mediaMode]);
  const writeToPerson=(target=current.current)=>{const person=target?.person||micRequest?.person||people[0];const chatId=target?.chatId||person.id;setFailureCall(null);setCall(null);setSheet(null);setMicRequest(null);navigate('/chats/dm',{state:{chat:{profileId:chatId,title:person.name,avatar:person.avatar,initials:person.initials,fresh:true}}});};
  const close=()=>{setSheet(null);setIssue('');setMotion('close');};
  const minimize=()=>{if(terminal.includes(current.current?.status))return;setSheet(null);setMotion('minimize');};
  const expand=()=>{setMotion('enter');patch({minimized:false});};
  useEffect(()=>{
    if(showcase||!['close','minimize'].includes(motion))return;
    const id=callId;
    const timer=setTimeout(()=>{
      if(current.current?.id!==id)return;
      if(motion==='minimize'&&!terminal.includes(current.current.status)){puckPosition.current=null;setCall(c=>({...c,minimized:true}));}
      else {const finished=current.current;setCall(null);if(callFailure(finished))setFailureCall(finished);}
      setMotion('idle');
    },reducedMotion()?0:340);
    return()=>clearTimeout(timer);
  },[motion,callId,showcase]);
  useEffect(()=>{
    if(showcase||!terminal.includes(callStatus))return;
    setMotion('idle');
    const timer=setTimeout(()=>setMotion('close'),callStatus==='ended'||callStatus==='canceled'?2000:2600);
    return()=>clearTimeout(timer);
  },[callId,callStatus,showcase]);
  useEffect(()=>{
    if(showcase||!call||!terminal.includes(call.status)||archived.current.has(call.id))return;
    archive(call);
  },[call,showcase,liveKey]);
  useEffect(()=>{if(showcase)return;try{sessionStorage.setItem(historyKey,JSON.stringify(history));}catch{/* Private storage may be unavailable. */}},[history,showcase,historyKey]);
  useEffect(()=>{
    if(showcase||!callId||terminal.includes(callStatus)||(review&&callStatus!=='reconnecting'))return;
    const id=callId,status=callStatus;
    const delay=status==='connecting'?1200:status==='ringing'?2400:status==='incoming'?30000:status==='reconnecting'?Math.max(0,(current.current.reconnectDeadline||Date.now()+15000)-Date.now()):null;
    if(delay===null)return;
    const next=status==='connecting'?'ringing':status==='ringing'?'active':status==='incoming'?'unanswered':'failed';
    const timer=setTimeout(()=>setCall(c=>c?.id===id&&c.status===status?transition(c,next):c),delay);
    return()=>clearTimeout(timer);
  },[callId,callStatus,review,showcase]);
  useEffect(()=>{
    if(showcase||!connectedAt||terminal.includes(callStatus))return;
    const tick=()=>setCall(c=>c&&!terminal.includes(c.status)?{...c,seconds:Math.floor((Date.now()-c.connectedAt)/1000)}:c);
    tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);
  },[callId,connectedAt,callStatus,showcase]);
  useEffect(()=>{
    if(showcase)return;
    const offline=()=>{setCall(c=>c&&!terminal.includes(c.status)?{...transition(c,'reconnecting'),beforeReconnect:c.status}:c);};
    const online=()=>setCall(c=>c?.status==='reconnecting'?transition(c,c.connectedAt?'active':c.beforeReconnect==='incoming'?'incoming':'connecting'):c);
    window.addEventListener('offline',offline);window.addEventListener('online',online);
    return()=>{window.removeEventListener('offline',offline);window.removeEventListener('online',online);};
  },[showcase]);
  useEffect(()=>{
    if(showcase)return;
    const key=e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!sheet&&!pending&&current.current){if(terminal.includes(current.current.status))close();else if(current.current.minimized)expand();else minimize();}};
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[sheet,pending,showcase]);
  useEffect(()=>()=>Object.values(media.current).forEach(s=>s?.getTracks().forEach(t=>t.stop())),[]);
  // Release native streams for terminal events coming from timers or review transport.
  useEffect(()=>{if(terminal.includes(callStatus)){stop('camera');stop('screen');stop('microphone');}},[callStatus]);
  useEffect(()=>{if(showcase)return;try{if(call&&!terminal.includes(call.status))sessionStorage.setItem(liveKey,JSON.stringify({...call,savedAt:Date.now()}));else sessionStorage.removeItem(liveKey);}catch{}},[call,showcase,liveKey]);
  useEffect(()=>{media.current.microphone?.getAudioTracks().forEach(track=>{track.enabled=!call?.muted;});},[call?.muted]);
  useEffect(()=>{
    if(showcase||!call?.restored||callStatus!=='reconnecting'||!navigator.onLine)return;
    const timer=setTimeout(()=>setCall(c=>c?.id===callId&&c.status==='reconnecting'?{...transition(c,'active'),restored:false}:c),1400);
    return()=>clearTimeout(timer);
  },[callId,callStatus,call?.restored,showcase]);
  const requestMedia=async type=>{
    if(mediaMode==='scenario'){patch(type==='camera'?{video:true,media:'video'}:{sharing:true});setSheet(null);setIssue('');return;}
    const id=current.current?.id;setBusyMedia(true);
    try {
      if(type==='screen'&&!navigator.mediaDevices?.getDisplayMedia)throw new Error('unsupported');
      const stream=type==='camera'?await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false}):await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
      if(current.current?.id!==id||terminal.includes(current.current.status)){stream.getTracks().forEach(t=>t.stop());return;}
      media.current[type]=stream;(type==='camera'?setCamera:setScreen)(stream);
      patch(type==='camera'?{video:true,media:'video'}:{sharing:true});setSheet(null);setIssue('');
      stream.getVideoTracks()[0].onended=()=>{if(current.current?.id!==id)return;stop(type);patch(type==='camera'?{video:false}:{sharing:false});};
    } catch(e){if(e.name!=='AbortError'){if(type==='camera'&&['NotAllowedError','SecurityError'].includes(e.name)){setCameraDenied(true);setSheet('camera');}else{setIssue(type==='camera'?'camera-denied':e.message==='unsupported'?'share-unsupported':'share-denied');setSheet(null);}}}
    finally{setBusyMedia(false);}
  };
  useEffect(()=>{if(showcase)return;const background=(host||document).querySelector('.app-reveal');if(background)background.inert=hasCall&&!minimized;return()=>{if(background)background.inert=false;};},[hasCall,minimized,showcase,host]);
  const scenario=id=>{
    setSheet(null);setIssue('');
    if(terminal.includes(id)){finish(id);return;}
    if(['connecting','ringing','active','incoming','reconnecting'].includes(id)){setCall(c=>transition(c,id));return;}
    if(id==='network'||id==='remote-network'){patch({quality:'poor',qualitySide:id==='network'?'local':'remote'});return;}
    if(id==='second'){setPending({status:'incoming',name:'Аяжан С.'});return;}
    if(id==='mic-denied'){patch({muted:true,micDenied:true});setIssue(id);return;}
    if(id==='camera-denied'){stop('camera');patch({video:false});setIssue(id);return;}
    if(id==='interruption'){stop('camera');stop('screen');patch({muted:true,video:false,sharing:false});}
    if(id==='remote-muted'){patch({remoteMuted:true});return;}
    if(id==='remote-share'){patch({remoteSharing:true,remoteShareImage:'/img/calls/shared-release-plan.svg'});return;}
    if(id==='bluetooth'){patch({route:'Телефон'});setIssue(id);return;}
    setIssue(id);
  };
  const context={call,history,start,finish,patch,showcase};
  const answerPending=()=>{const next=pending;finish();setPending(null);setMotion('enter');setCall({...makeCall({...next,status:next.status==='incoming'?'active':'connecting',...(next.status==='incoming'?{connectedAt:Date.now(),direction:'incoming'}:{})}),video:false});if(next.video)setSheet('camera');};
  const declinePending=()=>{if(pending.status==='incoming')archive(transition(makeCall(pending),'declined'));setPending(null);};
  const c=call,ended=c&&terminal.includes(c.status);
  const cameraActive=Boolean(camera)||(mediaMode==='scenario'&&c?.video);
  const notices={'mic-denied':'Нет доступа к микрофону. Вы можете слушать собеседника.','camera-denied':'Камера недоступна. Аудиозвонок продолжается. Разрешите доступ в настройках приложения.','share-denied':'Демонстрация не началась. Попробуйте снова и выберите экран.','share-unsupported':'На этом устройстве демонстрация экрана недоступна. Звонок продолжается.','network':'Слабое соединение. Выключите видео, чтобы улучшить звук.','interruption':'Звонок прерван системой. Микрофон и камера выключены. Включите их, когда будете готовы.','bluetooth':'Наушники отключены. Звук переключён на телефон.'};
  return <Context.Provider value={context}>{children}
    {c&&<Portal>{c.minimized&&!ended?<CallPuck positionRef={puckPosition} call={c} onOpen={expand} icon={<Icon name="badge" size={13.333}/>}/>:<section key={c.id} className={`call-screen ${motion==='close'||motion==='minimize'?'call-screen-exit':''} ${c.status==='incoming'?'call-screen-incoming':''} ${c.locked?'call-screen-locked':''} ${c.remoteSharing&&!ended?'call-screen-remote-share':''}`} role="dialog" aria-label={`Звонок: ${c.name}`} data-status={c.status} inert={pending?.status==='incoming'?true:undefined} aria-hidden={pending?.status==='incoming'?true:undefined}>
      {c.locked&&<div className="call-lock-label">qollab · входящий звонок</div>}
      <CallWave status={c.status} quality={fixture.waveQuality||'auto'} paused={showcase&&!animateWaves}/>
      <header className="call-header"><button aria-label={ended?'Закрыть звонок':'Свернуть звонок'} onClick={ended?close:minimize}><Icon name="down"/></button>{review&&<button className="call-review-open" aria-label="Сценарии звонка" onClick={()=>setSheet('scenarios')}><Icon name="more" size={20}/></button>}</header>
      <div className="call-hero"><Avatar person={c.person}/><div className="call-identity"><h1>{ended?labels[c.status]:c.name}</h1>{(!ended||c.connectedAt)&&<div className="call-status" role="status">{c.status==='active'&&!c.remoteMuted&&<span className="call-voice" aria-hidden="true"><i/><i/><i/><i/></span>}{['connecting','ringing','reconnecting'].includes(c.status)&&<span className="call-dots" aria-hidden="true"><i/><i/><i/></span>}<span>{ended?duration(c.seconds):c.status==='active'?duration(c.seconds):c.status==='incoming'?(c.media==='video'?'Входящий видеозвонок':'Входящий аудиозвонок'):labels[c.status]}</span></div>}{c.remoteMuted&&!ended&&<div className="call-caption"><span className="call-status-chip"><MicrophoneSlash size={16}/><span>Микрофон собеседника выключен</span></span></div>}{c.video&&c.status==='active'&&<div className="call-caption"><span className="call-status-chip"><Icon name="video" size={16}/><span>Камера собеседника выключена</span></span></div>}</div></div>
      {['active','reconnecting'].includes(c.status)&&<CallQuality level={c.status==='reconnecting'?'poor':c.quality||'good'} side={c.qualitySide||'local'}/>}
      {c.remoteSharing&&!ended&&<CallSharedScreen call={c} stream={remoteScreen}/> }
      {(showcase||mediaMode==='scenario')&&c.video&&c.status==='active'&&<div className="call-gallery-camera"><VideoCamera size={24}/><span>Вы</span></div>}
      {camera&&!ended&&<div className="call-camera-preview"><StreamVideo stream={camera}/><span>Вы</span></div>}
      {!ended&&(c.sharing||screen||issue)&&<div className="call-feedback-stack">{(c.sharing||screen)&&<div className="call-notice call-share-notice" role="status"><MonitorArrowUp size={20}/><p>Вы показываете экран</p><button onClick={()=>{stop('screen');patch({sharing:false});}}>Остановить</button></div>}{issue&&<div className="call-notice" role="status"><p>{notices[issue]}</p><button onClick={()=>setIssue('')}>Понятно</button></div>}</div>}
      {c.status==='incoming'?<footer className="call-incoming"><div className="call-incoming-actions"><button className="call-answer call-answer-decline" onClick={()=>finish('declined')}><span><Icon name="end" size={28}/></span><b>Отклонить</b></button><button className="call-answer call-answer-accept" onClick={()=>{patch({video:false});setCall(x=>transition(x,'active'));if(c.media==='video')setSheet('camera');}}><span>{c.media==='video'?<VideoCamera size={28} weight="fill"/>:<Icon name="phone" size={28}/>}</span><b>Принять</b></button></div></footer>:<footer className={`call-dock ${ended?'call-dock-disabled':''}`}><fieldset disabled={ended}><Control icon={<Icon name="speaker"/>} label={c.route} onClick={()=>setSheet('route')}/><Control icon={cameraActive?<VideoCamera size={24} weight="fill"/>:<Icon name="video"/>} label="Видео" pressed={cameraActive} onClick={()=>cameraActive?(stop('camera'),patch({video:false})):setSheet('camera')}/><Control icon={c.muted?<MicrophoneSlash size={24} weight="fill"/>:<Icon name="mic"/>} label="Микрофон" pressed={c.muted} onClick={()=>c.micDenied?setIssue('mic-denied'):patch({muted:!c.muted})}/><Control icon={<Icon name="more" size={20}/>} label="Еще" onClick={()=>setSheet('more')}/><Control icon={<Icon name="end"/>} label="Завершить" onClick={()=>finish()}/></fieldset></footer>}
    </section>}</Portal>}
    {micRequest&&sheet==='mic'&&<PermissionSheet title="Нужен доступ к микрофону" icon={<Icon name="mic" size={32} tinted/>} onClose={dismissMic} busy={busyMedia} onPrimary={micDenied&&!settingsHelp?openSettings:allowMicrophone} primaryLabel={busyMedia?'Подключаем микрофон…':settingsHelp?'Проверить доступ':micDenied?'Открыть настройки':'Разрешить доступ'}><p>{settingsHelp?'Откройте настройки Qollab на устройстве и разрешите доступ к микрофону. Затем вернитесь к звонку.':micDenied?'Доступ к микрофону выключен. Разрешите его в настройках, чтобы собеседник мог вас слышать.':'Микрофон нужен, чтобы собеседник слышал вас во время звонка.'}</p></PermissionSheet>}
    {c&&sheet==='route'&&<Sheet title="Источник звука" onClose={()=>setSheet(null)}>{['Телефон','Динамик'].map(r=><Row key={r} icon={r==='Динамик'?<Icon name="speaker" size={20} tinted/>:<Icon name="phone" size={20} tinted/>} selected={c.route===r} onClick={()=>{patch({route:r});setSheet(null);}}>{r}</Row>)}</Sheet>}
    {c&&sheet==='more'&&<Sheet title="Действия со звонком" onClose={()=>setSheet(null)}><Row icon={<MonitorArrowUp size={20}/>} sub={c.status!=='active'?'Доступно после соединения':undefined} onClick={()=>{if(c.sharing){stop('screen');patch({sharing:false});setSheet(null);}else if(c.status==='active')setSheet('share');}}>{c.sharing?'Остановить демонстрацию':'Показать экран'}</Row><Row icon={<ChatCircle size={20}/>} onClick={minimize}>Свернуть звонок</Row></Sheet>}
    {c&&sheet==='camera'&&<PermissionSheet title={cameraDenied?'Нужен доступ к камере':'Включить камеру?'} icon={<VideoCamera size={32}/>} onClose={()=>{setSheet(null);setSettingsHelp(false);}} busy={busyMedia} onPrimary={cameraDenied&&!settingsHelp?openSettings:()=>requestMedia('camera')} primaryLabel={busyMedia?'Подключаем камеру…':settingsHelp?'Проверить доступ':cameraDenied?'Открыть настройки':'Включить камеру'}><p>{cameraDenied?settingsHelp?'Откройте настройки Qollab на устройстве и разрешите доступ к камере. Затем вернитесь к звонку.':'Доступ к камере выключен. Разрешите его в настройках. Аудиозвонок продолжается.':'Разрешите доступ к камере, чтобы собеседник мог вас видеть.'}</p></PermissionSheet>}
    {c&&sheet==='share'&&<PermissionSheet title="Демонстрация экрана" icon={<MonitorArrowUp size={32}/>} onClose={()=>setSheet(null)} busy={busyMedia} onPrimary={()=>requestMedia('screen')} primaryLabel={busyMedia?'Подключаем экран…':'Продолжить'}><p>Собеседник увидит ваш экран. На следующем шаге подтвердите демонстрацию в системном окне. Уведомления тоже могут быть видны.</p></PermissionSheet>}
    {pending?.status==='incoming'&&<SecondIncoming pending={pending} current={c} onDecline={declinePending} onAnswer={answerPending} paused={showcase&&!animateWaves}/>}
    {pending&&pending.status!=='incoming'&&<Sheet title="Вы уже в звонке" onClose={()=>setPending(null)}><div className="call-sheet-body"><p>Чтобы позвонить {pending.name||people[0].name}, завершите текущий разговор.</p><button className="calls-primary" onClick={answerPending}>Завершить и позвонить</button><button className="calls-secondary" onClick={()=>setPending(null)}>Продолжить текущий</button></div></Sheet>}
    {c&&sheet==='scenarios'&&<Sheet title="Проверка состояний · 1 на 1" onClose={()=>setSheet(null)}><div className="call-scenarios">{Object.entries(labels).filter(([id])=>id!=='canceled').map(([id,label])=><button key={id} disabled={ended} onClick={()=>scenario(id)}>{label}</button>)}{[['second','Второй входящий'],['network','Слабая сеть у вас'],['remote-network','Слабая сеть у собеседника'],['mic-denied','Нет доступа к микрофону'],['camera-denied','Нет доступа к камере'],['interruption','Системное прерывание'],['remote-muted','Собеседник выключил микрофон'],['remote-share','Собеседник показывает экран'],['bluetooth','Наушники отключились']].map(([id,label])=><button key={id} disabled={ended} onClick={()=>scenario(id)}>{label}</button>)}</div></Sheet>}
    {failureCall&&<CallFailureDialog call={failureCall} onClose={()=>setFailureCall(null)} onMessage={()=>writeToPerson(failureCall)}/>}
  </Context.Provider>;
}
export function CallHistory({chatId,events}) {
  const {history=[],start}=useCalls()||{};
  return <>{(events||groupCallHistory(history,chatId)).map(c=>{
    const incoming=c.direction==='incoming';const success=c.status==='ended'&&Boolean(c.connectedAt);
    const outcome=callOutcome(c);
    const arrow=incoming?(success?'history-imgArrowDownLeftFilled.svg':'history-imgArrowDownLeftFilled1.svg'):(success?'history-imgArrowUpRightFilled.svg':'history-imgArrowUpRightFilled1.svg');
    return <div key={c.id} className={`call-event ${incoming?'incoming':'outgoing'} ${c.groupStart?'call-event-group-start':''} ${c.groupEnd?'call-event-group-end':''} ${c.groupSingle?'call-event-single':''}`}><button className="call-bubble" aria-label={`Перезвонить ${c.name}`} onClick={()=>start({name:c.name,person:c.person,chatId:c.chatId,video:c.media==='video'})}><span className="call-bubble-phone"><Icon name="phone" size={20}/></span><span className="call-bubble-text"><strong>{chatId?incoming?'Входящий звонок':'Исходящий звонок':c.name}</strong><small><img src={asset+arrow} width="12" height="12" alt=""/>{outcome}{c.media==='video'?' · Видео':''}</small></span><TimeRow time={c.time} mine={!incoming} status={c.deliveryStatus||'delivered'}/></button></div>;
  })}</>;
}
// Test controls live over the real chats screen; there is no calls history page.
export default function CallsPreview(){
  const {start,call}=useCalls();
  const review=new URLSearchParams(window.location.search).has('review');
  return <><Chats/>{review&&!call&&<Portal><div className="call-preview-tools"><span>Проверка звонков</span><button onClick={()=>start()}>Исходящий</button><button onClick={()=>start({status:'incoming'})}>Входящий аудио</button><button onClick={()=>start({status:'incoming',video:true})}>Входящий видео</button><button onClick={()=>start({status:'active',connectedAt:Date.now()})}>Разговор</button></div></Portal>}</>;
}
