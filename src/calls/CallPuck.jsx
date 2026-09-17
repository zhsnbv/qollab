import { useEffect, useRef } from 'react';
import { clamp, stepPuck } from './puck';
import { duration, labels } from './model';
export default function CallPuck({ call, onOpen, icon, positionRef }) {
  const ref = useRef(null);
  const open = useRef(onOpen); open.current = onOpen;
  useEffect(() => {
    const el = ref.current, host = el.parentElement;
    let raf = 0, last = 0, drag = null, moved = false;
    let bounds, initialized = false, p = positionRef.current ? {...positionRef.current, vx:0, vy:0} : { x: 0, y: 0, vx: 0, vy: 0 };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const paint = () => {
      positionRef.current = {...p};
      el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
    };
    const resize = () => {
      bounds = { left:16, right:Math.max(16,host.clientWidth-78), top:16, bottom:Math.max(16,host.clientHeight-124) };
      if(!initialized && !positionRef.current) { p.x = bounds.right; p.y = Math.max(bounds.top, bounds.bottom-22); }
      initialized=true;p.x=clamp(p.x,bounds.left,bounds.right);p.y=clamp(p.y,bounds.top,bounds.bottom);paint();
    };
    const tick = t => {
      const dt = Math.min(32,t-(last||t-16));last=t;
      p=stepPuck(p,bounds,dt,reduced.matches);paint();
      if(p.vx || p.vy)raf=requestAnimationFrame(tick);
    };
    const down = e => {
      if(!e.isPrimary || e.button!==0)return;
      cancelAnimationFrame(raf);el.setPointerCapture(e.pointerId);moved=false;
      el.dataset.pressed='true';
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:p.x,py:p.y,t:e.timeStamp,samples:[{x:e.clientX,y:e.clientY,t:e.timeStamp}]};p.vx=p.vy=0;paint();
    };
    const move = e => {
      if(!drag||drag.id!==e.pointerId)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(Math.hypot(dx,dy)>5)moved=true;
      const samples=[...drag.samples,{x:e.clientX,y:e.clientY,t:e.timeStamp}].filter(s=>e.timeStamp-s.t<85);
      const first=samples[0],dt=Math.max(8,e.timeStamp-first.t);
      p.vx=clamp((e.clientX-first.x)/dt,-3,3);p.vy=clamp((e.clientY-first.y)/dt,-3,3);
      p.x=clamp(drag.px+dx,bounds.left,bounds.right);p.y=clamp(drag.py+dy,bounds.top,bounds.bottom);
      drag={...drag,t:e.timeStamp,samples};paint();
    };
    const up = e => {
      if(!drag||drag.id!==e.pointerId)return;
      const canceled=e.type!=='pointerup';
      delete el.dataset.pressed;
      if(canceled||e.timeStamp-drag.t>100)p.vx=p.vy=0;
      drag=null; if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
      paint(); if(!moved&&!canceled){open.current();return;}
      last=performance.now();raf=requestAnimationFrame(tick);
    };
    const key = e => {
      const d={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[e.key];
      if(d){e.preventDefault();cancelAnimationFrame(raf);p.x=clamp(p.x+d[0],bounds.left,bounds.right);p.y=clamp(p.y+d[1],bounds.top,bounds.bottom);paint();}
      if(e.key==='Enter'||e.key===' '){e.preventDefault();open.current();}
    };
    resize();const observer=new ResizeObserver(resize);observer.observe(host);
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);el.addEventListener('keydown',key);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('lostpointercapture',up);el.removeEventListener('keydown',key);};
  },[positionRef]);
  return <button ref={ref} className="call-puck" aria-label={`Вернуться в звонок: ${call.name}, ${call.status==='active'?duration(call.seconds):labels[call.status]}`} title="Нажмите, чтобы открыть. Потяните, чтобы переместить."><span className="call-puck-enter"><span className="call-puck-shape"><span className="call-puck-face">{call.person.avatar?<img src={call.person.avatar} alt="" draggable="false"/>:call.person.initials}</span></span><span className={`call-puck-badge ${call.status==='reconnecting'?'reconnecting':''}`}>{icon}</span></span></button>;
}
