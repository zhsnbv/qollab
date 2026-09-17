import {useEffect,useRef,useState} from 'react';
import {MonitorArrowUp,ArrowsOut,ArrowsIn} from '@phosphor-icons/react';

export default function CallSharedScreen({call,stream}) {
 const [expanded,setExpanded]=useState(false),video=useRef(null);
 useEffect(()=>{if(video.current)video.current.srcObject=stream||null;},[stream]);
 return <section className={`call-shared-view ${expanded?'is-expanded':''}`} aria-label="Экран собеседника">
  <header className="call-shared-heading"><span><MonitorArrowUp size={16}/>Экран собеседника</span><button aria-label={expanded?'Уменьшить демонстрацию':'Развернуть демонстрацию'} onClick={()=>setExpanded(v=>!v)}>{expanded?<ArrowsIn size={20}/>:<ArrowsOut size={20}/>}</button></header>
  <div className={`call-shared-content ${call.status==='reconnecting'?'is-reconnecting':''}`}>
   {stream?<video ref={video} autoPlay playsInline muted/>:call.remoteShareImage?<img src={call.remoteShareImage} alt="План релиза на экране собеседника"/>:<div className="call-shared-wait"><MonitorArrowUp size={32}/><span>Подключаем демонстрацию…</span></div>}
  </div>
  {call.status==='reconnecting'&&<p className="call-shared-caption"><span className="call-status-chip"><MonitorArrowUp size={16}/>Восстанавливаем демонстрацию</span></p>}
 </section>;
}
