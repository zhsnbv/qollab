import {useEffect,useRef,useState} from 'react';
import {paletteFor,WAVE_TERMINAL} from './config';
import './CallWave.css';
// status comes from the calling application's transport, not a timer in this view.
export default function CallWave({status='connecting',quality='auto',paused=false}){
 const ref=useRef(null),[visible,setVisible]=useState(true),[foreground,setForeground]=useState(()=>!document.hidden);
 const [automaticQuality]=useState(()=>navigator.connection?.saveData||navigator.deviceMemory<=4||navigator.hardwareConcurrency<=4?'lite':'full');
 useEffect(()=>{const change=()=>setForeground(!document.hidden);document.addEventListener('visibilitychange',change);const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(ref.current)observer.observe(ref.current);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',change);};},[]);
 const [a,b]=paletteFor(status),[darkA,darkB]=paletteFor(status,'dark'),mode=quality==='auto'?automaticQuality:quality;
 const stopped=paused||!visible||!foreground||WAVE_TERMINAL.includes(status)||mode==='static';
 return <div ref={ref} className="call-wave" data-state={status} data-quality={mode} data-paused={stopped} style={{'--wave-light-a':a,'--wave-light-b':b,'--wave-dark-a':darkA,'--wave-dark-b':darkB}} aria-hidden="true"><i/><i/></div>;
}
