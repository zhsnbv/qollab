import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.REACTIONS_BASE_URL || 'http://127.0.0.1:5180';
const output = process.env.REACTIONS_OUTPUT || 'artifacts/qm-2591/mobile-integration';
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 402, height: 820 });
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('qollab-authed', '1'));

  const openMessage = async text => {
    const col = await page.evaluateHandle(text => [...document.querySelectorAll('.cr-messages .msg-col')].find(el => el.textContent.includes(text)), text);
    await col.asElement().evaluate(el => el.scrollIntoView({ block: 'center' }));
    await pause(150);
    const box = await col.asElement().boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await pause(500);
    await page.mouse.up();
    await page.waitForSelector('.mobile-reaction-menu .rp-context-menu[data-ready="yes"]', { timeout: 6000 });
    await pause(550);
  };
  const expand = async () => {
    await page.click('[aria-label="Все реакции"]');
    await page.waitForSelector('.mobile-reaction-menu .rp-picker');
    await pause(320);
  };

  for (const type of ['group', 'dm']) {
    if (type === 'group') await page.goto(`${base}/chats/prodev`);
    else {
      await page.goto(`${base}/chats`);
      await page.waitForSelector('.chat-row');
      await page.evaluate(() => [...document.querySelectorAll('.chat-row')].find(el => el.textContent.includes('Аяжан')).click());
    }
    await page.waitForSelector('.cr-input [contenteditable="true"]');
    await pause(1600);
    const text = `QM2591 ${type}: reaction test`;
    await page.click('.cr-input [contenteditable="true"]');
    await page.keyboard.type(text);
    await page.click('[aria-label="Отправить"]');
    await pause(350);
    await openMessage(text);
    const geometry = await page.evaluate(() => {
      const r = selector => document.querySelector(selector).getBoundingClientRect();
      const bubble = r('.mobile-reaction-menu .msgmenu-source .msg-bubble');
      const reactions = r('.mobile-reaction-menu .msgmenu-reactions');
      const menu = r('.mobile-reaction-menu .msgmenu-list');
      const stage = r('.mobile-reaction-menu');
      return { above: bubble.top - reactions.bottom, below: menu.top - bubble.bottom, bottom: stage.bottom - menu.bottom };
    });
    assert.ok(Math.abs(geometry.above - 10) < 1, JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.below - 10) < 1, JSON.stringify(geometry));
    assert.ok(geometry.bottom >= 11, JSON.stringify(geometry));
    await page.screenshot({ path: `${output}/${type}-quick.png` });
    await expand();
    await page.type('[aria-label="Поиск эмодзи"]', 'ракета');
    await page.waitForSelector('.rp-emoji');
    await page.click('.rp-emoji');
    await page.waitForFunction(() => !document.querySelector('.mobile-reaction-menu'));
    assert.ok(await page.$('[aria-label="Реакция 🚀, 1"]'));
    assert.equal(await page.$eval('.cr-body', el => el.inert), false);

    await openMessage(text);
    await expand();
    await page.type('[aria-label="Поиск эмодзи"]', 'ракета');
    const style = await page.$eval('.rp-emoji.is-selected', el => ({ radius: getComputedStyle(el).borderRadius, opacity: getComputedStyle(el.firstElementChild).opacity }));
    assert.equal(style.radius, '50%');
    assert.equal(style.opacity, '0.75');
    await page.screenshot({ path: `${output}/${type}-selected.png` });

    // A downward swipe closes with animation and keeps the current reaction.
    const top = await page.$('.rp-picker-top');
    const box = await top.boundingBox();
    await page.mouse.move(box.x + 40, box.y + 24);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y + 170, { steps: 8 });
    await page.mouse.up();
    await page.waitForSelector('.rp-picker.is-closing');
    await page.waitForFunction(() => !document.querySelector('.mobile-reaction-menu'));
    assert.ok(await page.$('[aria-label="Реакция 🚀, 1"]'));

    // Selecting the same emoji removes it; message actions still work.
    await openMessage(text);
    await expand();
    await page.type('[aria-label="Поиск эмодзи"]', 'ракета');
    await page.click('.rp-emoji.is-selected');
    await page.waitForFunction(() => !document.querySelector('.mobile-reaction-menu'));
    assert.equal(await page.$('[aria-label="Реакция 🚀, 1"]'), null);
    await openMessage(text);
    await page.evaluate(() => [...document.querySelectorAll('.mobile-reaction-menu .msgmenu-item')].find(el => el.textContent.includes('Ответить')).click());
    assert.equal(await page.$eval('.cr-compose-text', el => el.textContent), text);
    console.log(`PASS ${type}: long press, 10px gaps, search, selected style, animated swipe, add/remove reaction, reply`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
