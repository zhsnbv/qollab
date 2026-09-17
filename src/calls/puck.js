export const clamp = (v, min, max) => Math.min(Math.max(min, max), Math.max(min, v));
// Velocity is px/ms. Integrate friction analytically, and reflect the overshoot
// at collision rather than pinning to the wall for a frame. No edge magnet.
export function stepPuck(p, bounds, dt, reduced = false) {
  if (reduced) return {...p,x:clamp(p.x,bounds.left,bounds.right),y:clamp(p.y,bounds.top,bounds.bottom),vx:0,vy:0};
  const drag = .0055, decay = Math.exp(-drag * dt);
  const next = {...p,x:p.x+p.vx*(1-decay)/drag,y:p.y+p.vy*(1-decay)/drag,vx:p.vx*decay,vy:p.vy*decay};
  for (const [axis,velocity,min,max] of [['x','vx',bounds.left,bounds.right],['y','vy',bounds.top,bounds.bottom]]) {
    if(next[axis]<min){next[axis]=min+(min-next[axis])*.62;next[velocity]=Math.abs(next[velocity])*.62;}
    if(next[axis]>max){next[axis]=max-(next[axis]-max)*.62;next[velocity]=-Math.abs(next[velocity])*.62;}
    next[axis]=clamp(next[axis],min,max);
    if(Math.abs(next[velocity])<.015)next[velocity]=0;
  }
  return next;
}
