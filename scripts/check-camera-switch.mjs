import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:402,height:820});
 await page.evaluateOnNewDocument(()=>{
  window.cameraTracks=[];window.cameraRequests=[];window.rejectRear=false;window.delayCamera=false;
  navigator.mediaDevices.getUserMedia=async constraints=>{
   window.cameraRequests.push(constraints);const facing=constraints.video?.facingMode;
   if(facing?.exact==='environment'&&window.rejectRear)throw new DOMException('No rear camera','OverconstrainedError');
   const canvas=document.createElement('canvas');canvas.width=160;canvas.height=240;const ctx=canvas.getContext('2d');ctx.fillStyle=facing?.exact==='environment'?'green':'blue';ctx.fillRect(0,0,160,240);const stream=canvas.captureStream(1);window.cameraTracks.push(...stream.getTracks());
   if(window.delayCamera)await new Promise(r=>window.resolveCamera=r);
   return stream;
  };
 });
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async label=>{await page.evaluate(label=>{const root=document.querySelector('.call-sheet')||document;const el=[...root.querySelectorAll('button')].find(e=>e.getAttribute('aria-label')===label||e.textContent.trim()===label);if(!el)throw Error('Missing '+label);el.click();},label);await wait(80);};
 await page.goto('http://127.0.0.1:5173/calls?review=1');await page.waitForSelector('.call-preview-tools');await click('Входящий видео');await click('Принять');await click('Включить камеру');await page.waitForSelector('.call-self-tile video');
 assert.equal(await page.$eval('.call-self-tile video',e=>e.classList.contains('is-mirrored')),true);
 await click('Сменить камеру');await page.waitForFunction(()=>document.querySelector('.call-self-label')?.textContent==='Задняя камера');
 assert.equal(await page.$eval('.call-self-tile video',e=>e.classList.contains('is-mirrored')),false);assert.equal(await page.evaluate(()=>window.cameraTracks[0].readyState),'ended');
 await click('Сменить камеру');await page.waitForFunction(()=>document.querySelector('.call-self-label')?.textContent==='Вы');
 await page.evaluate(()=>window.rejectRear=true);await click('Сменить камеру');await page.waitForSelector('.call-notice');assert.match(await page.$eval('.call-notice',e=>e.textContent),/Продолжаем с прежней/);assert.equal(await page.$eval('.call-self-tile video',e=>e.classList.contains('is-mirrored')),true);
 await page.evaluate(()=>{window.rejectRear=false;window.delayCamera=true;});await click('Сменить камеру');await page.waitForSelector('.call-camera-switching');await click('Завершить');await page.evaluate(()=>window.resolveCamera());await wait(200);
 assert.ok(await page.evaluate(()=>window.cameraTracks.every(t=>t.readyState==='ended')));assert.equal(await page.$('.call-self-tile'),null);
 console.log('PASS: device camera switch, front-only mirroring, previous track cleanup, absent rear camera recovery and late-stream cancellation after hangup.');
}finally{await browser.close();}
