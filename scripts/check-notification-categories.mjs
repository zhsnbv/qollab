import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { notificationCategories, notificationGroups, resolveNotificationCategory } from '../src/data/notifications.js';
assert.equal(notificationCategories.length, 10);
assert.deepEqual(notificationGroups.filter(g => !g.items.length).map(g => g.id), ['information', 'transport', 'learning-development']);
assert.ok(notificationGroups.filter(g => g.items.length).every(g => g.items.length >= 5));
assert.equal(resolveNotificationCategory({ sender: 'Главная', service: 'ЕСЭД' }), 'employee-services');
assert.equal(resolveNotificationCategory({ sender: 'unknown' }), 'other');
assert.equal(resolveNotificationCategory({ sender: 'Корпоративные скидки', categoryId: 'staff' }), 'staff');
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const active = '.category-layer[data-active="true"]';
  await page.setViewport({ width: 402, height: 820, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:5174/handoff/categories?view=prototype');
  await page.waitForSelector('.nt-row'); await pause(350);
  assert.equal((await page.$$('.nt-row')).length, 11);
  assert.equal((await page.$$('.nt-last strong')).length, 8);
  await page.evaluate(() => { window.savedList = document.querySelector('.nt-scroll'); window.savedList.scrollTop = 120; });
  for (let i = 0; i < notificationGroups.length; i++) {
    const group = notificationGroups[i];
    await page.$$eval('.nt-row', (rows, index) => rows[index].click(), i);
    await page.waitForSelector(`${active} .ngroup`); await pause(320);
    assert.equal(await page.$eval(`${active} .ng-titles .ng-name`, e => e.textContent), group.name);
    assert.equal((await page.$$(`${active} .ng-msg`)).length, group.items.length);
    assert.equal(Boolean(await page.$(`${active} .ng-empty`)), !group.items.length);
    await page.waitForFunction(() => [...document.querySelectorAll('.ng-miniapp-icon')].every(e => e.complete && e.naturalWidth > 0));
    // Double Back must pop exactly one screen, preserving the original list DOM.
    await page.$eval(`${active} .ng-back`, e => { e.click(); e.click(); });
    await page.waitForSelector(`${active} .nt-scroll`);
    assert.ok(await page.evaluate(() => window.savedList === document.querySelector('.nt-scroll') && window.savedList.scrollTop === 120));
    assert.equal(await page.$eval('.notifs', e => e.getAnimations().filter(a => a.playState === 'running').length), 0);
  }
  await page.$$eval('.nt-row', rows => rows.find(r => r.textContent.includes('Сотруднику')).click());
  await page.waitForSelector(`${active} .ng-action`); await pause(320);
  // Sticky Yesterday and Today: both stay near the top while their section scrolls.
  for (const label of ['Вчера', 'Сегодня']) {
    const delta = await page.$eval(`${active} .ng-scroll`, (scroll, text) => {
      const day = [...scroll.querySelectorAll('.ng-day')].find(e => e.textContent === text);
      scroll.scrollTop += day.getBoundingClientRect().top - scroll.getBoundingClientRect().top + 100;
      const first = day.getBoundingClientRect().top;
      scroll.scrollTop += 30;
      return { offset: day.getBoundingClientRect().top - scroll.getBoundingClientRect().top, movement: day.getBoundingClientRect().top - first };
    }, label);
    assert.ok(delta.offset >= 23 && delta.offset <= 25 && Math.abs(delta.movement) < 1, `${label}: sticky ${JSON.stringify(delta)}`);
  }
  await page.$eval(`${active} .ng-scroll`, e => { window.savedFeed = e; e.scrollTop = 180; window.feedScroll = e.scrollTop; });
  await page.$eval(`${active} .ng-action`, e => e.click());
  await page.waitForSelector(`${active} .ng-detail`); await pause(320);
  assert.match(await page.$eval(`${active} .ng-detail`, e => e.textContent), /1340-BTS/);
  await page.click(`${active} .ng-back`); await page.waitForSelector(`${active} .ng-titles`);
  assert.ok(await page.evaluate(() => window.savedFeed === document.querySelector('.ng-scroll') && window.savedFeed.scrollTop === window.feedScroll));
  assert.equal(await page.$eval(`${active} .ngroup`, e => e.getAnimations().filter(a => a.playState === 'running').length), 0);
  // Repeat with reduced motion and complete the mini-app action flow.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.$eval(`${active} .ng-action`, e => e.click());
  await page.waitForSelector(`${active} .ng-detail`);
  await page.click(`${active} .ng-detail .ng-action`); await page.waitForSelector(`${active} .ma-top`);
  // The main prototype also keeps the list across browser Back.
  await page.evaluate(() => sessionStorage.setItem('qollab-authed', '1'));
  await page.goto('http://127.0.0.1:5174/notifications'); await page.waitForSelector('.nt-scroll');
  await page.evaluate(() => { window.mainList = document.querySelector('.nt-scroll'); window.mainList.scrollTop = 90; document.querySelector('.nt-row').click(); });
  await page.waitForSelector('.ng-titles'); await page.goBack(); await page.waitForSelector('.nt-scroll');
  assert.ok(await page.evaluate(() => window.mainList === document.querySelector('.nt-scroll') && window.mainList.scrollTop === 90));
  await page.goto('http://127.0.0.1:5174/handoff/categories'); await page.waitForSelector('.category-frame');
  assert.ok(await page.$$eval('.category-frame', els => els.every(e => e.clientWidth === 402 && e.clientHeight === 820)));
  assert.equal((await page.$$('.category-icons .notification-icon')).length, 12);
  await page.setViewport({ width: 2400, height: 1000, deviceScaleFactor: 1 });
  assert.ok(await page.$('[data-category-frame="empty"] .ng-empty'));
  for (const name of ['main', 'feed', 'empty']) await (await page.$(`[data-category-frame="${name}"]`)).screenshot({ path: `/tmp/qollab-notifications-${name}.png` });
  assert.deepEqual(errors, []);
  console.log('PASS: 3 empty folders, populated feeds, real assets, sticky dates, preserved DOM/scroll, no re-entry animation, double Back, reduced motion, browser Back, ESED flow, 402x820');
} finally { await browser.close(); }
