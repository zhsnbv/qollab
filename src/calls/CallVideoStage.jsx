import {useEffect,useRef,useState} from 'react';
import Icon from './CallIcon';
import {MicrophoneSlash} from '@phosphor-icons/react';
import {duration} from './model';
import './CallVideoStage.css';

// One remote participant today; media and identity are kept separate for a future participant rail.
export function ParticipantMedia({stream,src,poster,paused=false,mirrored=false,onUnavailable}){
 const ref=useRef(null);
 useEffect(()=>{
  const video=ref.current;if(!video)return;
  video.srcObject=stream||null;
  let visible=false;
  const sync=()=>{if(visible&&!document.hidden&&!paused){video.play().catch(()=>{});}else video.pause();};
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});io.observe(video);
  document.addEventListener('visibilitychange',sync);
  video.addEventListener('loadeddata',sync);
  return()=>{io.disconnect();document.removeEventListener('visibilitychange',sync);video.removeEventListener('loadeddata',sync);video.pause();video.srcObject=null;};
 },[stream,src,paused]);
 return <video ref={ref} className={mirrored?'is-mirrored':''} src={stream?undefined:src} poster={poster} loop muted playsInline preload="metadata" onError={onUnavailable}/>;
}
const selfPoster='/img/calls/self-camera.png';
export default function CallVideoStage({call,localStream,remoteStream,localActive,onFlip,flipping,quality,hero,paused=false}){
 const [unavailable,setUnavailable]=useState(false);
 const remote=Boolean(call.remoteVideo)&&!unavailable;
 const reconnecting=call.status==='reconnecting';
 useEffect(()=>setUnavailable(false),[call.id,call.remoteVideo,remoteStream]);
 return <div className={`call-video-stage ${remote?'has-remote-video':''} ${reconnecting?'is-reconnecting':''}`} data-local-camera={localActive?'on':'off'} data-remote-camera={remote?'on':'off'}>
  {remote?<ParticipantMedia stream={remoteStream} src="/media/calls/colleague.mp4" poster="/media/calls/colleague-poster.jpg" paused={paused||reconnecting} onUnavailable={()=>setUnavailable(true)}/>:<div className="call-video-remote-off">{hero}<span className="call-status-chip"><Icon name="video" size={16}/>{unavailable?'Видео временно недоступно':'Камера собеседника выключена'}</span></div>}
  <div className="call-video-quality">{quality}</div>
  {reconnecting&&remote&&<div className="call-video-reconnect" role="status"><span className="call-status-chip">Восстанавливаем соединение</span></div>}
  {remote&&call.remoteMuted&&<div className="call-video-remote-muted"><span className="call-status-chip"><MicrophoneSlash size={16}/>Микрофон собеседника выключен</span></div>}
  <div className={`call-self-tile ${localActive?'camera-on':'camera-off'}`} aria-label={localActive?'Ваша камера включена':'Ваша камера выключена'}>
   {localActive?(localStream?<ParticipantMedia stream={localStream} paused={paused} mirrored={call.facingMode!=='environment'}/>:call.facingMode==='environment'?<div className="call-rear-preview"><Icon name="videoOn" size={28}/><span>Задняя камера</span></div>:<img className="call-self-image" src={selfPoster} alt="Вы"/>):<><img className="call-self-avatar" src={selfPoster} alt=""/><strong>Вы</strong><Icon name="video" size={18}/></>}
   {localActive&&<><span className="call-self-label">{call.facingMode==='environment'?'Задняя камера':'Вы'}</span><button className="call-camera-flip" aria-label="Сменить камеру" title="Сменить камеру" disabled={flipping||reconnecting} onClick={onFlip}><Icon name="rotate" size={24}/></button></>}
   {flipping&&<span className="call-camera-switching" role="status">Переключаем…</span>}
  </div>
 </div>;
}
export function VideoCallHeading({call}){
 return <div className="call-video-heading"><h1>{call.name}</h1><div><span className="call-voice" aria-hidden="true"><i/><i/><i/><i/></span><span>{duration(call.seconds)}</span></div></div>;
}
