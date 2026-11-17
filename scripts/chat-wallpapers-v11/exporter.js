import {drawPrism} from './prism.js';
const manifest = await (await fetch('./manifest.json')).json();
const shaders = await (await fetch('./shaders.json')).json();
const {width:W,height:H,fps:FPS,frames:N}=manifest;
const status=document.querySelector('#status'),grid=document.querySelector('#grid'),progress=document.querySelector('progress');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const baseTime={sky:8,mesh:10,aurora:20.75,prism:28};
const timeSpan={sky:3,mesh:2.2,aurora:2.8,prism:4.5};
function timeAt(family,k){return baseTime[family]+timeSpan[family]*Math.sin(2*Math.PI*(k%N)/N)}
function compile(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function createRenderer(job){
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 if(job.family==='prism'){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  return {canvas,draw(k){drawPrism(ctx,W,H,job.colors,job.colors.slice(1).map((_,i)=>(i+1)/job.colors.length),{count:11,fusion:{shape:'crest',direction:0,size:100,height:60,focus:50,position:50,blend:65,facets:25,motion:'expand',reverse:false}},timeAt('prism',k))},pixels:()=>ctx.getImageData(0,0,W,H).data,dispose(){}};
 }
 const sh=shaders[job.family];const gl=canvas.getContext(sh.webgl===2?'webgl2':'webgl',{alpha:false,antialias:false,depth:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WebGL unavailable');
 const program=gl.createProgram();for(const [t,s]of [[gl.VERTEX_SHADER,sh.vertex],[gl.FRAGMENT_SHADER,sh.fragment]])gl.attachShader(program,compile(gl,t,s));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,sh.attribute);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const loc={};const u=n=>(n in loc?loc[n]:(loc[n]=gl.getUniformLocation(program,n)));
 const one=(n,v)=>gl.uniform1f(u(n),v),two=(n,x,y)=>gl.uniform2f(u(n),x,y),color=(n,h)=>gl.uniform3fv(u(n),rgb(h));
 if(job.family==='sky'){
  const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tx);const noise=new Uint8Array(256*256*4);let seed=73451;
  for(let i=0;i<noise.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;noise[i]=noise[i+1]=noise[i+2]=seed>>>24;noise[i+3]=255}
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,256,0,gl.RGBA,gl.UNSIGNED_BYTE,noise);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.REPEAT);
  for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
  gl.uniform1i(u('uTextureNoise'),0);
  for(const [k,v] of Object.entries({windSpeed:.144,warpPower:.2355,fbmStrength:.912,blurRadius:1.2673,zoom:.3971,grainStrength:0,grainScale:2.5,noiseScale:.8673}))one('u_'+k,v);
  ['Main','Low','Mid','High'].forEach((n,i)=>color('u_bloopColor'+n,job.colors[i]));two('u_viewport',W,H);
 } else if(job.family==='mesh'){
  gl.uniform4fv(u('u_colors[0]'),new Float32Array(job.colors.flatMap(h=>[...rgb(h),1])));one('u_colorsCount',job.colors.length);
  for(const [k,v]of Object.entries({distortion:.65,swirl:.12,grainMixer:0,grainOverlay:0,pixelRatio:1,imageAspectRatio:1,originX:.5,originY:.5,worldWidth:0,worldHeight:0,fit:1,scale:1,rotation:0,offsetX:0,offsetY:0}))one('u_'+k,v);two('u_resolution',W,H);
 } else {
  const [rim,glow,horizon,deep]=job.colors;color('u_rim',rim);color('u_glow',glow);color('u_horizon',horizon);color('u_deep',deep);two('u_res',W,H);two('u_dirv',1,0);
  const cfg=job.id.endsWith('ice')?{scale:65,distortion:30,swirl:14}:job.id.endsWith('violet')?{scale:43,distortion:55,swirl:30}:{scale:47,distortion:52,swirl:32};
  one('u_freq',1+(1-cfg.scale/100)*2.8);one('u_fold',cfg.distortion/100);one('u_drift',.15+cfg.swirl/100*1.1);
 }
 gl.viewport(0,0,W,H);
 return{canvas,draw(k){one(job.family==='aurora'?'u_t':'u_time',timeAt(job.family,k));gl.drawArrays(gl.TRIANGLES,0,3);gl.finish()},pixels(){const p=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,p);return p},dispose(){gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}
function compare(a,b){let sum=0,max=0,changed=0;for(let i=0;i<a.length;i++){if(i%4===3)continue;const d=Math.abs(a[i]-b[i]);sum+=d;max=Math.max(max,d);changed+=d>0}return{meanAbsoluteDifference:sum/(W*H*3),maxDifference:max,changedChannels:changed}}
function hash(p){let h=2166136261;for(let i=0;i<p.length;i++)h=Math.imul(h^p[i],16777619);return(h>>>0).toString(16).padStart(8,'0')}
const blobOf=(canvas,type='image/webp',quality=.9)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Canvas encoding failed')),type,quality));
async function post(name,data){const res=await fetch('/save/'+name,{method:'POST',body:data});if(!res.ok)throw Error(await res.text());return res.json()}
function makeCard(job){const div=document.createElement('article');const title=document.createElement('strong');title.textContent=job.name;div.append(title);const small=document.createElement('small');small.textContent=job.id;div.append(small);grid.append(div);return div}
let previewStop=()=>{};
async function previewAll(){previewStop();grid.replaceChildren();for(const j of manifest.jobs){status.textContent='Previewing '+j.id;const r=createRenderer(j);r.draw(0);const thumb=document.createElement('canvas');thumb.width=180;thumb.height=320;thumb.getContext('2d').drawImage(r.canvas,0,0,180,320);makeCard(j).prepend(thumb);r.dispose();await delay(30)}status.textContent='12 previews ready. Export uses 720 x 1280, 24 fps, 24 seconds.'}
let busy=false;
async function exportAll(){if(busy)return;previewStop();busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);grid.replaceChildren();
 try {
  if(!globalThis.VideoEncoder)throw Error('WebCodecs VideoEncoder unavailable: use Chrome on localhost');
  const wanted={codec:'avc1.42001f',width:W,height:H,framerate:FPS,bitrate:manifest.bitrate,avc:{format:'annexb'},latencyMode:'quality',hardwareAcceleration:'prefer-hardware'};
  const supported=await VideoEncoder.isConfigSupported(wanted);if(!supported.supported)throw Error('H264 configuration not supported');
  for(let ji=0;ji<manifest.jobs.length;ji++){
   const job=manifest.jobs[ji],r=createRenderer(job),card=makeCard(job);card.prepend(r.canvas);let error=null;const chunks=[];
   r.draw(0);const first=r.pixels();r.draw(N);const endpoint=r.pixels();r.draw(Math.round(N/4));const quarter=r.pixels();r.draw(N-1);const last=r.pixels();r.draw(1);const second=r.pixels();
   const qa={id:job.id,width:W,height:H,frames:N,fps:FPS,seconds:N/FPS,sourceTime:{base:baseTime[job.family],span:timeSpan[job.family],formula:'base + span*sin(2*pi*frame/N)'},endpoint:compare(first,endpoint),boundaryStep:compare(last,first),firstStep:compare(first,second),motionQuarter:compare(first,quarter),firstFrameHash:hash(first),endpointHash:hash(endpoint),codec:wanted,startedAt:new Date().toISOString()};
   if(qa.endpoint.maxDifference!==0)throw Error(job.id+' endpoint mismatch');
   r.draw(0);await post(job.id+'.webp',await blobOf(r.canvas));
   const encoder=new VideoEncoder({output(chunk){const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);chunks.push(data)},error(e){error=e}});encoder.configure(wanted);
   for(let k=0;k<N;k++){
    if(error)throw error;r.draw(k);const frame=new VideoFrame(r.canvas,{timestamp:Math.round(k*1e6/FPS),duration:Math.round(1e6/FPS)});encoder.encode(frame,{keyFrame:k%(FPS*2)===0});frame.close();
    while(encoder.encodeQueueSize>8){await delay(6);if(error)throw error}
    if(k%12===0){progress.value=(ji+k/N)/manifest.jobs.length;status.textContent=`${ji+1}/12 ${job.id}: ${k}/${N}`;await delay(0)}
   }
   await encoder.flush();encoder.close();if(error)throw error;
   qa.encodedBytes=chunks.reduce((a,b)=>a+b.byteLength,0);qa.finishedAt=new Date().toISOString();
   status.textContent='Saving/remuxing '+job.id;const saved=await post(job.id+'.h264',new Blob(chunks,{type:'video/h264'}));qa.saved=saved;await post(job.id+'.json',JSON.stringify(qa,null,2));
   const done=document.createElement('p');done.textContent='Saved. Exact endpoint: '+qa.endpoint.maxDifference+'; motion MAD: '+qa.motionQuarter.meanAbsoluteDifference.toFixed(2);card.append(done);r.dispose();
  }
  progress.value=1;status.textContent='DONE: all 12 MP4 videos and WebP posters saved on disk.';await post('batch-complete.json',JSON.stringify({complete:true,jobs:manifest.jobs.map(j=>j.id),finishedAt:new Date().toISOString()}));
 }catch(e){status.textContent='ERROR: '+e.stack;console.error(e)}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false)}
}
function playPreviews(){
 previewStop();grid.replaceChildren();const renderers=['sky','mesh','aurora','prism'].map(f=>{const j=manifest.jobs.find(j=>j.family===f);const r=createRenderer(j);makeCard(j).prepend(r.canvas);return r});
 let stopped=false,raf=0,last=-1;const start=performance.now();
 function tick(now){if(stopped)return;const k=Math.floor((now-start)*FPS/1000)%N;if(k!==last){renderers.forEach(r=>r.draw(k));last=k}raf=requestAnimationFrame(tick)}
 previewStop=()=>{stopped=true;cancelAnimationFrame(raf);renderers.forEach(r=>r.dispose());previewStop=()=>{}};raf=requestAnimationFrame(tick);status.textContent='Playing all four families, full 24-second seamless cycle. Start export stops previews.';
}
document.querySelector('#play').addEventListener('click',playPreviews);
document.querySelector('#preview').addEventListener('click',previewAll);document.querySelector('#start').addEventListener('click',exportAll);status.textContent='Ready: Preview first frames, then Start all exports.';
