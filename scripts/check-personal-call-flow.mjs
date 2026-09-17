import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const base=process.env.CALLS_BASE_URL||'http://127.0.0.1:5173';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:402,height:820});
 await page.evaluateOnNewDocument(()=>{window.mediaRequests=0;if(navigator.mediaDevices){navigator.mediaDevices.getUserMedia=async()=>{window.mediaRequests++;throw new Error('No media hardware')};navigator.mediaDevices.getDisplayMedia=async()=>{window.mediaRequests++;throw new Error('No screen picker')};}});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async label=>{await page.evaluate(label=>{const root=document.querySelector('.call-sheet')||document;const button=[...root.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===label||b.textContent.trim()===label);if(!button)throw Error('Missing '+label);button.click();},label);await pause(100);};
 await page.goto(base+'/calls/one-to-one');await page.waitForSelector('.cr-headline');await pause(1000);
 const colleagueName=await page.$eval('.cr-title',e=>e.textContent);
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('qollab-authed')),null);
 await click('Профиль собеседника');await page.waitForSelector('.person');await click('Звонок');await page.waitForSelector('.call-sheet');await click('Разрешить доступ');
 await page.waitForSelector('.call-screen[data-status="connecting"]');await page.waitForSelector('.call-screen[data-status="ringing"]');await page.waitForSelector('.call-screen[data-status="active"]');
 assert.equal(await page.$eval('.call-identity h1',e=>e.textContent),colleagueName);
 await click('Микрофон');assert.equal(await page.$eval('[aria-label="Микрофон"]',e=>e.getAttribute('aria-pressed')),'true');await click('Микрофон');
 await click('Динамик');await click('Телефон');assert.ok(await page.$('.call-control[aria-label="Телефон"]'));
 await click('Видео');await click('Включить камеру');assert.equal(await page.$eval('[aria-label="Видео"]',e=>e.getAttribute('aria-pressed')),'true');assert.ok(await page.$('.call-self-tile.camera-on'));await click('Видео');assert.ok(await page.$('.call-self-tile.camera-off'));
 await click('Еще');await click('Показать экран');await click('Продолжить');assert.ok(await page.$('.call-share-notice'));await click('Остановить');assert.equal(await page.$('.call-share-notice'),null);
 await click('Свернуть звонок');await page.waitForSelector('.call-puck');await pause(400);await page.focus('.call-puck');await page.keyboard.press('Enter');await page.waitForSelector('.call-screen[data-status="active"]');await pause(450);
 await click('Завершить');await page.waitForSelector('.call-screen[data-status="ended"]');await page.waitForFunction(()=>!document.querySelector('.call-screen'));
 await click('Написать');await page.waitForSelector('.call-bubble');assert.match(await page.$eval('.call-bubble',e=>e.textContent),/Исходящий звонок/);
 await click('Позвонить');await page.waitForSelector('.call-screen[data-status="active"]');await page.reload();await page.waitForSelector('.call-screen');await page.waitForSelector('.call-screen[data-status="active"]');await click('Завершить');await page.waitForFunction(()=>!document.querySelector('.call-screen'));
 assert.equal(await page.evaluate(()=>window.mediaRequests),0);assert.equal(await page.evaluate(()=>sessionStorage.getItem('qollab-live-call')),null);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('qollab-flow-call-history')).length),2);
 assert.deepEqual(errors,[]);console.log(`PASS ${base}: fresh session → colleague chat → profile → permissions → connecting/ringing/active → mute/audio/video/share → minimize/restore → end/history → call from chat → reload/reconnect; no hardware requirement.`);
}finally{await browser.close();}
