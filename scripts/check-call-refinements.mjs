import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const dir='/tmp/qollab-call-refinements';await mkdir(dir,{recursive:true});
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async text=>page.evaluate(text=>{const root=document.querySelector('.gal')?document:document.querySelector('.call-sheet')||document.querySelector('.call-failure-dialog')||document;const el=[...root.querySelectorAll('button')].find(e=>e.textContent.trim()===text||e.getAttribute('aria-label')===text);assertButton(el,text);el.click();function assertButton(el,text){if(!el)throw Error('Missing '+text)}},text);
 await page.setViewport({width:1320,height:1100,deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:5173/all?group=calls');await page.waitForSelector('.call-screen');
 assert.equal(await page.$$eval('.gal-cell',e=>e.length),64);
 assert.equal(await page.$('.gal-top .gal-call-settings'),null);assert.ok(await page.$('.gal-group .gal-call-settings'));
 const reveal=async id=>{await page.$eval(`[data-case="${id}"]`,e=>e.scrollIntoView({block:'center'}));await page.waitForFunction(id=>document.querySelector(`[data-case="${id}"] .gal-device`).childElementCount>0,{},id);await pause(1100);};
 await click('Тёмная');await pause(1500);
 for(const id of ['call-active','call-quality-remote','call-remote-muted','call-busy','call-dialog-failed','call-route','call-mic-denied','call-bubbles','call-bubble-single']){
  await reveal(id);await (await page.$(`[data-case="${id}"] .gal-device`)).screenshot({path:`${dir}/${id}-dark.png`});
 }
 assert.equal(await page.$eval('[data-case="call-active"] .call-screen',e=>getComputedStyle(e).backgroundColor),'rgb(43, 42, 39)');
 assert.equal(await page.$eval('[data-case="call-active"] .call-wave',e=>getComputedStyle(e).getPropertyValue('--wave-a').trim()),'rgb(33, 76, 67)');
 assert.ok(await page.$eval('[data-case="call-quality-remote"] .call-status-chip',e=>getComputedStyle(e).borderTopWidth==='1px'));
 assert.ok(await page.$eval('[data-case="call-remote-muted"] .call-status-chip',e=>!!e.querySelector('svg')));
 assert.equal(await page.$eval('[data-case="call-active"] .call-signal',e=>e.getBoundingClientRect().height),11);
 assert.equal(await page.$eval('[data-case="call-busy"] .call-identity',e=>e.textContent),'Линия занята');
 assert.equal(await page.$$eval('[data-case="call-bubbles"] .call-event-group-start',els=>els.length),2);
 assert.equal(await page.$eval('[data-case="call-bubble-single"] .call-bubble',e=>getComputedStyle(e).borderBottomRightRadius),'2px');
 assert.equal(await page.$eval('[data-case="call-mic-denied"] .calls-primary',e=>getComputedStyle(e).borderRadius),'999px');
 assert.equal(await page.$eval('[data-case="call-dialog-failed"] .cdlg-btn',e=>getComputedStyle(e).borderRadius),'0px');
 // A screen's internal z-index cannot escape its isolated gallery cell.
 await page.evaluate(()=>window.scrollTo(0,500));await pause(200);
 assert.ok(await page.evaluate(()=>Boolean(document.elementFromPoint(200,60)?.closest('.gal-top'))));
 await page.screenshot({path:`${dir}/header-dark.png`});
 await click('Светлая');await pause(1500);await reveal('call-quality-remote');await (await page.$('[data-case="call-quality-remote"] .gal-device')).screenshot({path:`${dir}/quality-light.png`});
 assert.equal(await page.$eval('[data-case="call-quality-remote"] .call-screen',e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
 // All workspace accents use the same tokens and message delivery component.
 for(const theme of ['Светлая','Тёмная'])for(const company of ['ERG','Integra','BTS Digital']){
  await click(theme);await click(company);await reveal('call-bubbles');
  assert.ok(await page.$eval('[data-case="call-bubbles"]',el=>{
   const probe=document.createElement('span');el.append(probe);probe.style.color='var(--color-primary)';const primary=getComputedStyle(probe).color;probe.style.color='var(--color-weak)';const weak=getComputedStyle(probe).color;probe.remove();
   const icons=[...el.querySelectorAll('.call-bubble-phone .call-icon,.cr-walkie .call-icon')];
   const ticks=[...el.querySelectorAll('.call-bubble .msg-time-row svg')];
   return icons.length===8&&icons.every(i=>getComputedStyle(i).backgroundColor===primary)&&ticks.length===2&&getComputedStyle(ticks[0]).fill===primary&&getComputedStyle(ticks[1]).fill===weak;
  }));
  await (await page.$('[data-case="call-bubbles"] .gal-device')).screenshot({path:`${dir}/bubbles-${company}-${theme}.png`});
 }
 await reveal('call-route');assert.deepEqual(await page.$eval('[data-case="call-route"] .asheet-item',e=>{const s=getComputedStyle(e);return [s.borderRadius,s.borderTopWidth,s.backgroundColor]}),['0px','1px','rgba(0, 0, 0, 0)']);
 await reveal('call-dialog-failed');assert.equal(await page.$eval('[data-case="call-dialog-failed"] .cdlg',e=>getComputedStyle(e).maxWidth),'280px');
 for(const id of ['call-quality-remote','call-remote-muted']){await reveal(id);assert.equal(await page.$eval(`[data-case="${id}"] .call-status-chip`,e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');}
 for(const id of ['call-active','call-quality-remote']){await reveal(id);assert.ok(await page.$eval(`[data-case="${id}"] .call-quality`,e=>{const sample=document.createElement('i');sample.style.color=e.classList.contains('good')?'var(--color-success)':'var(--color-danger)';e.append(sample);const expected=getComputedStyle(sample).color;sample.remove();return getComputedStyle(e.querySelector('.call-signal')).color===expected;}));}
 for(const id of ['call-sharing','call-remote-sharing','call-remote-sharing-reconnect','call-dialog-failed','call-route','call-second','call-camera','call-camera-permission-denied','call-share']){await reveal(id);await (await page.$(`[data-case="${id}"] .gal-device`)).screenshot({path:`${dir}/${id}-final.png`});}
 assert.equal(await page.$$eval('[data-case="call-second"] .call-second-screen .call-answer',e=>e.length),2);
 assert.equal(await page.$('[data-case="call-second"] .call-sheet'),null);
 for(const id of ['call-camera','call-camera-permission-denied','call-share'])assert.ok(await page.$(`[data-case="${id}"] .call-permission-icon`));
 assert.equal(await page.$eval('[data-case="call-remote-sharing"] .call-shared-content img',e=>getComputedStyle(e).borderRadius),'12px');
 assert.ok(await page.$eval('[data-case="call-sharing"] .call-screen',e=>e.querySelector('.call-share-notice').getBoundingClientRect().bottom<e.querySelector('.call-dock').getBoundingClientRect().top));
 assert.equal(await page.$eval('[data-case="call-remote-sharing"] .call-shared-content img',e=>getComputedStyle(e).objectFit),'contain');
 assert.equal(await page.evaluate(()=>/браузер|прототип|\bдемо\b|адресной строки/i.test([...document.querySelectorAll('.gal-device')].map(e=>e.innerText).join(' '))),false);
 await page.setViewport({width:402,height:820});await page.goto('http://127.0.0.1:5173/calls?review=1');await page.waitForSelector('.call-preview-tools');
 await click('Исходящий');await pause(450);await click('Сценарии звонка');await pause(300);await click('Не удалось подключиться');
 await pause(200);assert.equal(await page.$('.call-failure-dialog'),null);
 await page.waitForSelector('.call-screen-exit');assert.equal(await page.$('.call-failure-dialog'),null);
 await page.waitForSelector('.call-failure-dialog');assert.equal(await page.$('.call-screen'),null);
 assert.match(await page.$eval('.cdlg',e=>e.textContent),/Не удалось позвонить/);
 await page.screenshot({path:`${dir}/failure-after-exit.png`});
 await click('Написать в чат');await page.waitForSelector('.call-bubble');assert.equal(await page.$('.call-failure-dialog'),null);
 await page.type('[contenteditable="true"]','Перезвоню позже');await click('Отправить');await pause(120);
 assert.ok(await page.evaluate(()=>Boolean(document.querySelector('.call-event').compareDocumentPosition(document.querySelector('.msg--mine'))&Node.DOCUMENT_POSITION_FOLLOWING)));
 assert.equal(await page.$eval('.call-bubble',e=>getComputedStyle(e).borderTopRightRadius),'12px');
 assert.equal(await page.$eval('.msg--mine .msg-bubble',e=>getComputedStyle(e).borderBottomRightRadius),'2px');
 await page.goto('http://127.0.0.1:5173/calls?review=1');await page.waitForSelector('.call-preview-tools');await click('Исходящий');await pause(450);await click('Завершить');await pause(2500);assert.equal(await page.$('.call-failure-dialog'),null);
 await click('Разговор');await pause(450);await click('Сценарии звонка');await pause(250);await click('Собеседник показывает экран');await page.waitForSelector('.call-shared-view');await click('Развернуть демонстрацию');assert.ok(await page.$('.call-shared-view.is-expanded'));await click('Уменьшить демонстрацию');assert.equal(await page.$('.call-shared-view.is-expanded'),null);await click('Завершить');await pause(2500);
 // Existing ordinary messages use the same singleton/group rule.
 await page.evaluate(()=>{const el=document.createElement('div');el.id='bubble-rule';el.innerHTML='<div class="msg msg--their msg--first msg--last"><div class="msg-bubble">one</div></div><div class="msg msg--mine msg--last"><div class="msg-bubble">last</div></div>';document.body.append(el)});
 assert.deepEqual(await page.$$eval('#bubble-rule .msg-bubble',els=>els.map(e=>[getComputedStyle(e).borderBottomLeftRadius,getComputedStyle(e).borderBottomRightRadius])),[['2px','12px'],['12px','2px']]);
 assert.deepEqual(errors,[]);console.log('PASS: dark/light calls, dark waves, gallery layer isolation, contextual settings, chips, compact signal, terminal copy, pill buttons, grouped/single bubbles, failure dialog after exit, cancellation without dialog.');
}finally{await browser.close();}
