import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:1320,height:1100});
 await page.goto(`${process.env.CALLS_BASE_URL||'http://127.0.0.1:5173'}/all?group=chats`);await page.waitForSelector('[data-case="room"]');await page.$eval('[data-case="room"]',e=>e.scrollIntoView());
 await page.waitForSelector('[data-case="room"] .msg--their:not(.msg--first) .msg-bubble:not(.msg-bubble--typing)',{timeout:20000});
 const result=await page.$$eval('[data-case="room"] .msg',messages=>messages.flatMap(msg=>{
  const bubble=msg.querySelector('.msg-bubble:not(.msg-bubble--typing),.msg-document');if(!bubble)return [];
  const style=getComputedStyle(bubble);return [{first:msg.classList.contains('msg--first'),mine:msg.classList.contains('msg--mine'),last:msg.classList.contains('msg--last'),topLeft:style.borderTopLeftRadius,topRight:style.borderTopRightRadius,left:style.borderBottomLeftRadius,right:style.borderBottomRightRadius}];
 }));
 assert.ok(result.some(e=>!e.first));assert.ok(result.some(e=>e.first));
 for(const row of result){assert.equal(row.left,row.last&&!row.mine?'2px':'12px');assert.equal(row.right,row.last&&row.mine?'2px':'12px');assert.equal(row.topLeft,'12px');assert.equal(row.topRight,'12px');}
 await page.goto(`${process.env.CALLS_BASE_URL||'http://127.0.0.1:5173'}/all?group=calls`);
 for(const id of ['call-bubbles','call-bubble-single']){
  const root=`[data-case="${id}"]`;
  await page.waitForSelector(root);await page.$eval(root,e=>e.scrollIntoView());await page.waitForSelector(`${root} .call-bubble`);
  const corners=await page.$$eval(`${root} .call-event`,els=>els.map((e,i)=>{
   const s=getComputedStyle(e.querySelector('.call-bubble')),incoming=e.classList.contains('incoming');
   const last=!els[i+1]||els[i+1].classList.contains('incoming')!==incoming;
   return {incoming,last,r:[s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomRightRadius,s.borderBottomLeftRadius]};
  }));
  for(const row of corners)assert.deepEqual(row.r,['12px','12px',row.last&&!row.incoming?'2px':'12px',row.last&&row.incoming?'2px':'12px']);
  if(id==='call-bubbles'){
   assert.equal(corners.length,6);
   await (await page.$(`${root} .gal-device`)).screenshot({path:'/tmp/qollab-bubble-corners.png'});
  }
 }
 console.log('PASS: group chat and call history (including singleton) use a sharp corner at the bottom of the last message; preceding text/media bubbles are round.');
}finally{await browser.close();}
