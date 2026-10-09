import { chromium } from 'playwright';

const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
p.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200));
});
await p.goto('http://localhost:5175/city/pokhara/experience/annapurna-base-camp-trek', {
  waitUntil: 'domcontentloaded',
});
await p.locator('h1').first().waitFor({ timeout: 15000 });
await p.waitForTimeout(1500);

// tab labels
const tabs = await p.locator('.tg-switch__btn').allInnerTexts();
console.log('tabs:', JSON.stringify(tabs.map((t) => t.replace(/\s+/g, ' ').trim())));

await p.locator('#gallery').scrollIntoViewIfNeeded();
await p.waitForTimeout(800);

// what is at the hero button center?
const cover = await p.evaluate(() => {
  const hero = document.querySelector('[data-gwrap="our"] .tg-ph--hero');
  const r = hero.getBoundingClientRect();
  const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return {
    heroRect: { x: r.x, y: r.y, w: r.width, h: r.height },
    topEl: el ? el.tagName + '.' + el.className.toString().slice(0, 80) : 'none',
  };
});
console.log('cover check:', JSON.stringify(cover));

// real click (no force)
try {
  await p.locator('[data-gwrap="our"] .tg-ph--hero').click({ timeout: 5000 });
  console.log('real click: dispatched ok');
} catch (e) {
  console.log('real click FAILED:', e.message.split('\n')[0]);
}
await p.waitForTimeout(600);
console.log('tg-lb count after click:', await p.locator('.tg-lb').count());
const lbInfo = await p.evaluate(() => {
  const lb = document.querySelector('.tg-lb');
  if (!lb) return null;
  const cs = getComputedStyle(lb);
  const img = lb.querySelector('img');
  return {
    position: cs.position,
    zIndex: cs.zIndex,
    display: cs.display,
    bg: cs.backgroundColor,
    imgSrc: img ? img.src.slice(0, 90) : 'no-img',
    imgW: img ? img.naturalWidth : -1,
    hasX: !!lb.querySelector('.tg-lb__x'),
  };
});
console.log('lightbox:', JSON.stringify(lbInfo));
console.log('errors:', JSON.stringify(errors.slice(0, 5)));
await b.close();
