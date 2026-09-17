import {useRef,useState} from 'react';
// Same 96px / .5px-ms thresholds as the app; pointer events also support mouse.
export default function useCallSheetSwipe(onClose){
 const [dy,setDy]=useState(0),[snap,setSnap]=useState(false),drag=useRef(null);
 const reset=()=>{drag.current=null;setSnap(true);setDy(0);};
 return {style:dy?{transform:`translateY(${Math.max(0,dy)}px)`}:undefined,className:snap?'sheet-snap':'',handlers:{
  style:{touchAction:'none'},
  onPointerDown:e=>{if(!e.isPrimary||e.button!==0||e.target.closest('button'))return;drag.current={id:e.pointerId,y:e.clientY,t:e.timeStamp,dy:0};e.currentTarget.setPointerCapture(e.pointerId);setSnap(false);},
  onPointerMove:e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;d.dy=e.clientY-d.y;setDy(d.dy>0?d.dy:d.dy/6);},
  onPointerUp:e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const close=d.dy>96||d.dy/Math.max(1,e.timeStamp-d.t)>.5;reset();if(close)onClose();},
  onPointerCancel:reset,
  onLostPointerCapture:reset,
 }};
}
