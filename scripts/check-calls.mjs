import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('/tmp/qollab-calls-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage();await page.setViewport({width:402,height:820,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async text=>{await page.evaluate(t=>{const root=document.querySelector('.call-sheet')||document;const b=[...root.querySelectorAll('button')].find(e=>e.textContent.trim()===t||e.getAttribute('aria-label')===t);if(!b)throw Error(`Missing button ${t}`);b.click();},text);};
 const scenario=async text=>{await click('Сценарии звонка');await pause(100);await click(text);await pause(100);};
 await page.goto('http://127.0.0.1:5173/calls?review=1');await page.waitForSelector('.chat-row',{timeout:12000});
 assert.equal(await page.$('.calls-home'),null);assert.equal(await page.$('.calls-chat-entry'),null);assert.ok(await page.$('.chat-row'));
 await click('Разговор');await pause(80);const opening=await page.$eval('.call-screen',e=>new DOMMatrix(getComputedStyle(e).transform).m42);assert.ok(opening>0);await pause(400);
 await click('Динамик');await pause(400);assert.equal(await page.$eval('.call-icon-tinted',e=>getComputedStyle(e).backgroundColor),'rgb(239, 127, 26)');await page.screenshot({path:'/tmp/qollab-calls-qa/sound-source-v2.png'});
 await page.keyboard.press('Escape');await pause(100);assert.ok(await page.$('.call-screen'));
 await click('Свернуть звонок');await pause(80);assert.ok(await page.$('.call-screen-exit'));assert.equal(await page.$('.call-puck'),null);await pause(600);assert.equal(await page.$('.call-screen'),null);
 let p=await page.$eval('.call-puck',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};});assert.equal(p.x,324);assert.equal(p.width,62);
 const shadow=await page.$eval('.call-puck-shape',e=>getComputedStyle(e).boxShadow);
 await page.mouse.move(p.x+31,p.y+31);await page.mouse.down();await pause(80);
 assert.equal(await page.$eval('.call-puck',e=>getComputedStyle(e).opacity),'0.65');assert.equal(await page.$eval('.call-puck-shape',e=>getComputedStyle(e).transform),'none');
 await page.mouse.move(80,300,{steps:8});await page.mouse.up();await pause(180);
 assert.equal(await page.$eval('.call-puck-shape',e=>getComputedStyle(e).boxShadow),shadow);
 await pause(1400);p=await page.$eval('.call-puck',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y};});assert.ok(p.x>=16&&p.x<=324&&p.y>=16&&p.y<=696);
 await page.focus('.call-puck');await page.keyboard.press('Enter');await pause(420);assert.ok(await page.$('.call-screen'));
 await click('Свернуть звонок');await pause(700);p=await page.$eval('.call-puck',e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y};});assert.equal(p.x,324);assert.equal(p.y,674);
 await page.focus('.call-puck');await page.keyboard.press('Enter');await pause(450);
 await click('Завершить');await pause(100);assert.equal(await page.$eval('.call-screen',e=>e.dataset.status),'ended');assert.equal(await page.$('.call-result button'),null);await pause(1500);assert.ok(await page.$('.call-screen'));await pause(850);assert.equal(await page.$('.call-screen'),null);
 await click('Исходящий');await pause(450);await scenario('Линия занята');await pause(1600);await page.screenshot({path:'/tmp/qollab-calls-qa/busy-v2.png'});await pause(1500);assert.equal(await page.$('.call-screen'),null);
 await click('Понятно');await click('Входящий аудио');await pause(500);assert.match(await page.$eval('.call-status',e=>e.textContent),/Входящий аудиозвонок/);await page.screenshot({path:'/tmp/qollab-calls-qa/incoming-v2.png'});
 await click('Принять');await pause(100);assert.equal(await page.$eval('.call-screen',e=>e.dataset.status),'active');await click('Завершить');await pause(2400);
 await click('Входящий видео');await pause(500);await page.screenshot({path:'/tmp/qollab-calls-qa/incoming-video-v2.png'});await click('Принять');await pause(150);await click('Закрыть');await pause(100);assert.equal(await page.$eval('.call-screen',e=>e.dataset.status),'active');assert.equal(await page.$('.call-camera-preview'),null);await click('Завершить');await pause(2400);
 // Auto-dismiss from an old call must not dismiss a new session.
 await click('Исходящий');await pause(400);await scenario('Второй входящий');await pause(150);await click('Завершить и ответить');await pause(3000);assert.equal(await page.$eval('.call-screen',e=>e.dataset.status),'active');assert.match(await page.$eval('.call-identity',e=>e.textContent),/Аяжан/);
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await click('Свернуть звонок');await pause(150);assert.ok(await page.$('.call-puck'));assert.equal(await page.$('.call-screen'),null);
 await page.setViewport({width:320,height:568});await pause(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log('PASS: source tint, slide-up/down lifecycle, terminal timeouts, no history page, incoming audio/video, second-call race, stable shadow, opacity press, inertia bounds, default puck placement, reduced motion.');
} finally {await browser.close();}
