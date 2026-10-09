/* Temporary DOM verification for the ported Annapurna page (run: node abc_check.mjs). */
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

const URL = 'http://localhost:5175/city/pokhara/experience/annapurna-base-camp-trek';
const results = [];
const check = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('h1').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);

  check('h1 title', (await page.locator('h1').first().innerText()).includes('Annapurna Base Camp'));
  check('glance facts x5', (await page.locator('.th-glance__facts li').count()) === 5);
  check(
    'breadcrumb removed',
    (await page.locator('.rank-math-breadcrumb').count()) === 0 &&
      (await page.locator('.th-eyebrow').count()) === 0
  );
  check('gallery hero', (await page.locator('.tg-hero').count()) >= 1);
  check(
    'whatsapp UI removed',
    (await page.locator('.mbfse-scta__btn--wa').count()) === 0 &&
      (await page.locator('a[href*="wa.me"]').count()) === 0 &&
      (await page.locator('#i-8f8e4ce8').count()) === 0 &&
      (await page.locator('.th-share__menu').getByText('WhatsApp', { exact: false }).count()) === 0
  );
  check(
    'share menu links wired',
    await page.evaluate(() => {
      const btn = document.querySelector('.th-share .th-act');
      btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const menu = document.querySelector('.th-share__menu');
      if (!menu || menu.style.display === 'none') return false;
      const links = Array.from(menu.querySelectorAll('a'));
      const hrefs = links.map((a) => a.getAttribute('href') || '');
      const labels = links.map((a) => a.textContent.trim());
      const ok =
        links.length === 3 &&
        labels.join('|') === 'Facebook|X (Twitter)|Email' &&
        hrefs[0].startsWith('https://www.facebook.com/sharer/sharer.php?u=') &&
        hrefs[1].startsWith('https://twitter.com/intent/tweet?') &&
        hrefs[2].startsWith('mailto:');
      menu.style.display = 'none';
      return ok;
    })
  );
  check('gallery tabs x2', (await page.locator('[data-gtab]').count()) === 2);
  check(
    'trust strip',
    (await page.locator('.trip-trust-strip').innerText()).includes('Govt-registered')
  );
  check('trust line rating', (await page.locator('.th-trust').innerText()).includes('5.0'));

  check('overview id', (await page.locator('#overview').count()) === 1);
  check('itinerary id', (await page.locator('#itinerary').count()) === 1);
  check('includes id', (await page.locator('#includes').count()) === 1);
  check('excludes id', (await page.locator('#excludes').count()) === 1);
  check('tripdetails id', (await page.locator('#tripdetails').count()) === 1);
  check('map id', (await page.locator('#map').count()) === 1);
  check('booking aside', (await page.locator('#booking').count()) === 1);
  check('ask form', (await page.locator('#ask').count()) === 1);

  check('EXCLUDED packinglist', (await page.locator('#packinglist').count()) === 0);
  check(
    'EXCLUDED why-book',
    !(await page.locator('body').innerText()).includes('Why Book with Magical Nepal')
  );
  check('EXCLUDED pricing card', (await page.locator('.trip-pricing-card').count()) === 0);
  check(
    'EXCLUDED packing checklist',
    (await page.locator('.block-packing-checklist').count()) === 0
  );
  check(
    'guides section kept',
    (await page.locator('h2', { hasText: "Who you'll meet" }).count()) >= 1
  );
  check(
    'similar experiences kept',
    (await page.locator('h3', { hasText: 'Similar experiences' }).count()) >= 1
  );
  check(
    'ready to book kept',
    (await page.locator('h2', { hasText: 'Ready to book?' }).count()) >= 1
  );

  // sticky nav behaviour
  const navHidden = await page
    .locator('#tripStickyNavbar')
    .evaluate((el) => el.classList.contains('hidden'));
  check('sticky hidden at top', navHidden);
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(400);
  const navShown = await page
    .locator('#tripStickyNavbar')
    .evaluate((el) => !el.classList.contains('hidden'));
  check('sticky shows after scroll', navShown);
  const navLinks = await page.locator('.sticky-navbar-wrapper a').count();
  check('sticky tabs (no packing/faq)', navLinks === 6, 'count=' + navLinks);
  const navHrefs = await page
    .locator('.sticky-navbar-wrapper a')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check(
    'sticky tabs link to sections',
    JSON.stringify(navHrefs) ===
      JSON.stringify(['#overview', '#itinerary', '#includes', '#tripdetails', '#map', '#reviews']),
    'hrefs=' + navHrefs.join(',')
  );
  await page.evaluate(() => {
    const el = document.getElementById('includes');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(600);
  const activeHref = await page
    .locator('.sticky-navbar-wrapper a.active')
    .evaluate((a) => a.getAttribute('href'));
  const activeCount = await page.locator('.sticky-navbar-wrapper a.active').count();
  check(
    'sticky active tab follows section',
    activeCount === 1 && activeHref === '#includes',
    'active=' + activeHref
  );

  // itinerary accordion
  const firstDet = page.locator('.block-itinerary__item__details').first();
  const h0 = await firstDet.evaluate((el) => el.getBoundingClientRect().height);
  check('day collapsed by default', h0 < 5, 'h=' + h0);
  const dayHeader = page.locator('.block-itinerary__item__header').first();
  await dayHeader.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await dayHeader.click({ force: true });
  await page.waitForTimeout(500);
  const h1 = await firstDet.evaluate((el) => el.getBoundingClientRect().height);
  check('day expands on click', h1 > 40, 'h=' + h1);

  const toggle = page.locator('.itn-toggle[data-trigger="accordionShowAll"]');
  if ((await toggle.count()) > 0) {
    await toggle.click({ force: true });
    await page.waitForTimeout(700);
    const expanded = await page
      .locator('.block-itinerary__item__details')
      .evaluateAll(
        (els) => els.length > 0 && els.every((e) => e.getBoundingClientRect().height > 10)
      );
    check('show-all expands every day', expanded);
  } else {
    check('show-all button present', false);
  }

  // gallery tab + lightbox
  await page.locator('[data-gtab="photos"]').click({ force: true });
  await page.waitForTimeout(300);
  const photosVisible = await page
    .locator('[data-gwrap="photos"]')
    .evaluate((el) => el.style.display !== 'none');
  check('photos tab switches', photosVisible);
  await page.locator('[data-gwrap="photos"] [data-gopen]').first().click({ force: true });
  await page.waitForTimeout(400);
  check('lightbox opens', (await page.locator('.tg-lb').count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('lightbox closes on Esc', (await page.locator('.tg-lb').count()) === 0);

  // trip-details accordion.
  // NOTE: the "Excludes" section uses `block-collapse is-style-naked` — an always-visible,
  // borderless list (no header/details wrapper). Only genuine accordions carry __details,
  // so we scope every collapsible assertion to `.block-collapse:not(.is-style-naked)`.
  const nCol = await page.locator('.block-collapse').count();
  const nDet = await page.locator('.block-collapse__details').count();
  const nNaked = await page.locator('.block-collapse.is-style-naked').count();
  const nCollapsible = await page.locator('.block-collapse:not(.is-style-naked)').count();
  check(
    'trip-details blocks present',
    nDet === nCollapsible && nNaked >= 1,
    `cols=${nCol} collapsible=${nCollapsible} naked=${nNaked} dets=${nDet}`
  );
  const col = page.locator('.block-collapse:not(.is-style-naked)').first();
  const cdet = col.locator('.block-collapse__details');
  if ((await nCollapsible) > 0) {
    const c0 = await cdet.evaluate((el) => el.getBoundingClientRect().height);
    check('trip-details collapsed', c0 < 5, 'h=' + c0);
    await col
      .locator('.block-collapse__header')
      .evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    await col.locator('.block-collapse__header').click({ force: true });
    await page.waitForTimeout(500);
    const c1 = await cdet.evaluate((el) => el.getBoundingClientRect().height);
    check('trip-details expands', c1 > 30, 'h=' + c1);
    const active = await col
      .locator('.block-collapse__header')
      .evaluate((el) => el.classList.contains('active'));
    check('trip-details header active class', active);
  } else {
    check('trip-details collapsed', false, 'no collapsible details blocks');
    check('trip-details expands', false);
    check('trip-details header active class', false);
  }

  // the naked Excludes list must always be visible (never collapsed away)
  const excludesVisible = await page
    .locator('.block-collapse.is-style-naked')
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 20;
    });
  check('excludes naked list always visible', excludesVisible);

  // layout sanity
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check('no horizontal overflow', overflow <= 2, 'diff=' + overflow);
  const ph = await page.locator('img[src^="data:image"]').count();
  check('no placeholder images', ph === 0, 'count=' + ph);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/abc_check_top.png' });
  await page.screenshot({ path: '/tmp/abc_check_full.png', fullPage: true });
} catch (err) {
  check('script completed', false, String(err).slice(0, 300));
}

console.log(results.join('\n'));
console.log('CONSOLE/PAGE ERRORS:', errors.length ? errors.slice(0, 8).join(' | ') : 'none');
await browser.close();
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
