import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.CALLS_BASE_URL||'http://127.0.0.1:5173';
await mkdir('/tmp/qollab-video',{recursive:true});
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async label=>{await page.evaluate(label=>{const root=document.querySelector('.call-sheet')||document;const el=[...root.querySelectorAll('button')].find(e=>e.getAttribute('aria-label')===label||e.textContent.trim()===label);if(!el)throw Error('Missing '+label);el.click();},label);await wait(100);};
 await page.setViewport({width:402,height:820});await page.goto(base+'/calls/one-to-one');await page.waitForSelector('[aria-label="Видеозвонок"]');await wait(700);
 assert.equal(await page.$eval('.cr-title',e=>e.textContent),'Арман Асхатов');
 await click('Видеозвонок');await click('Разрешить доступ');await click('Включить камеру');await page.waitForSelector('.call-screen-video[data-status="active"]');
 await page.waitForFunction(()=>{const v=document.querySelector('.call-video-stage>video');return v?.readyState>=2&&v.currentTime>.2&&!v.paused;});
 assert.equal(await page.$eval('.call-video-stage',e=>e.dataset.localCamera),'on');
 await page.screenshot({path:'/tmp/qollab-video/flow-both.png'});
 const initial=await page.$eval('.call-video-stage>video',v=>v.currentTime);await wait(500);assert.ok(await page.$eval('.call-video-stage>video',(v,t)=>v.currentTime>t,initial));
 await click('Сменить камеру');assert.match(await page.$eval('.call-self-tile',e=>e.textContent),/Задняя камера/);await click('Сменить камеру');
 await click('Видео');assert.ok(await page.$('.call-self-tile.camera-off'));assert.ok(await page.$('.call-video-stage>video'));await page.screenshot({path:'/tmp/qollab-video/flow-remote.png'});
 await click('Видео');await click('Не сейчас');assert.ok(await page.$('.call-self-tile.camera-off'));
 await click('Свернуть звонок');await page.waitForSelector('.call-puck');assert.equal(await page.$('.call-video-stage video'),null);await wait(400);await page.focus('.call-puck');await page.keyboard.press('Enter');await page.waitForSelector('.call-self-tile.camera-off');
 await click('Завершить');await page.waitForFunction(()=>!document.querySelector('.call-screen'));assert.equal(await page.$('.call-video-stage video'),null);await page.waitForSelector('.call-bubble');assert.match(await page.$eval('.call-bubble',e=>e.textContent),/Видео/);
 // Exact gallery cases, sizing, themes and media fallback.
 await page.setViewport({width:1800,height:1050});await page.goto(base+'/all?group=calls');await page.waitForSelector('.gal-cell');
 for(const theme of ['Светлая','Тёмная']){
  await click(theme);
  for(const [id,local,remote] of [['call-video-both','on','on'],['call-video','on','off'],['call-video-remote','off','on'],['call-video-off','off','off'],['call-video-reconnecting','on','on'],['call-video-camera-error','off','on']]){
   const root=`[data-case="${id}"]`;await page.$eval(root,e=>e.scrollIntoView({block:'center',inline:'center'}));await page.waitForSelector(root+' .call-video-stage');await wait(500);
   const metrics=await page.$eval(root,e=>{const screen=e.querySelector('.gal-device'),stage=e.querySelector('.call-video-stage'),self=e.querySelector('.call-self-tile'),dock=e.querySelector('.call-dock');return {size:[screen.clientWidth,screen.clientHeight],local:stage.dataset.localCamera,remote:stage.dataset.remoteCamera,bottom:stage.getBoundingClientRect().bottom,dockTop:dock.getBoundingClientRect().top,selfBottom:self.getBoundingClientRect().bottom,bg:getComputedStyle(screen.querySelector('.call-screen')).backgroundColor};});
   assert.deepEqual(metrics.size,[402,820]);assert.equal(metrics.local,local);assert.equal(metrics.remote,remote);assert.ok(metrics.bottom<metrics.dockTop);assert.ok(metrics.selfBottom<metrics.bottom);
   assert.equal(metrics.bg==='rgb(255, 255, 255)',theme==='Светлая');
   await (await page.$(root+' .gal-device')).screenshot({path:`/tmp/qollab-video/${id}-${theme}.png`});
  }
  for(const variant of ['phone','desktop','self']){
   const root=`[data-case="call-share-sketch-${variant}"]`;await page.$eval(root,e=>e.scrollIntoView({block:'center',inline:'center'}));await page.waitForSelector(root+' .share-study-stage');await wait(400);assert.equal(await page.$$eval(root+' .share-study-person',e=>e.length),2);await (await page.$(root+' .gal-device')).screenshot({path:`/tmp/qollab-video/share-${variant}-${theme}.png`});
  }
 }
 await page.$eval('[data-case="call-video-both"]',e=>e.scrollIntoView({block:'center',inline:'center'}));await wait(700);assert.equal(await page.$eval('[data-case="call-video-reconnecting"] video',v=>v.paused),true);
 await page.$eval('[data-case="call-video-both"] video',v=>v.dispatchEvent(new Event('error')));await page.waitForSelector('[data-case="call-video-both"] .call-video-remote-off');assert.match(await page.$eval('[data-case="call-video-both"] .call-video-stage',e=>e.textContent),/Видео временно недоступно/);
 assert.deepEqual(errors,[]);console.log('PASS: video entry, playback, local on/off, camera flip, minimize/restore, video history, 4 camera combinations, reconnect and camera errors, light/dark frames 402×820, sharing sketches.');
}finally{await browser.close();}
