import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:1320,height:1100});
 await page.goto('http://127.0.0.1:5173/all?group=chats');await page.waitForSelector('[data-case="room"]');await page.$eval('[data-case="room"]',e=>e.scrollIntoView());
 await page.waitForSelector('[data-case="room"] .msg--their:not(.msg--first) .msg-bubble:not(.msg-bubble--typing)',{timeout:20000});
 const result=await page.$$eval('[data-case="room"] .msg',messages=>messages.flatMap(msg=>{
  const bubble=msg.querySelector('.msg-bubble:not(.msg-bubble--typing),.msg-document');if(!bubble)return [];
  const style=getComputedStyle(bubble);return [{first:msg.classList.contains('msg--first'),mine:msg.classList.contains('msg--mine'),last:msg.classList.contains('msg--last'),topLeft:style.borderTopLeftRadius,topRight:style.borderTopRightRadius,left:style.borderBottomLeftRadius,right:style.borderBottomRightRadius}];
 }));
 assert.ok(result.some(e=>!e.first));assert.ok(result.some(e=>e.first));
 for(const row of result){assert.equal(row.left,row.first&&row.last&&!row.mine?'2px':'12px');assert.equal(row.right,row.first&&row.last&&row.mine?'2px':'12px');assert.equal(row.topLeft,row.first&&!row.last&&!row.mine?'2px':'12px');assert.equal(row.topRight,row.first&&!row.last&&row.mine?'2px':'12px');}
 console.log('PASS: real group chat uses a sharp corner only on the first message; following text/media bubbles are round.');
}finally{await browser.close();}
