import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { FIXTURE_TOKEN } from '../../src/lib/content/constants.ts';
import { loadCorpus } from '../../src/lib/content/load.ts';
import { validateCorpus } from '../../src/lib/content/validate.ts';
import { REPOSITORY_URL } from '../../src/lib/copy.ts';

const BASE = '/Isaac_Ishmael/';
const PAGES = [BASE, `${BASE}en/`, `${BASE}es/`, `${BASE}en/methodology/`, `${BASE}es/metodologia/`];

// Strings that must never be served: the fixture token and every fixture ID.
const fixtureIds = [...validateCorpus(loadCorpus('fixtures/valid'), 'fixtures').corpus.records.keys()];

/** Every same-site page and asset reachable from the root, with its status and body. */
async function crawl(request: APIRequestContext) {
  const seen = new Map<string, { status: number; body: string; type: string }>();
  const queue = [BASE];
  while (queue.length) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    const res = await request.get(path);
    const body = await res.text();
    const type = res.headers()['content-type'] ?? '';
    seen.set(path, { status: res.status(), body, type });
    if (!type.includes('html')) continue;
    for (const m of body.matchAll(/(?:href|src)="([^"#?]+)/g)) {
      const target = m[1];
      if (target.startsWith(BASE) && !seen.has(target)) queue.push(target);
    }
  }
  return seen;
}

test('every internal link and asset resolves, and nothing withheld is served', async ({ request }) => {
  const site = await crawl(request);
  expect([...site.keys()].sort()).toEqual(expect.arrayContaining([...PAGES, `${BASE}favicon.svg`]));
  for (const [path, { status, body, type }] of site) {
    expect(status, path).toBe(200);
    expect(body, path).not.toContain(FIXTURE_TOKEN);
    for (const id of fixtureIds) expect(body, `${path} contains ${id}`).not.toContain(id);
    if (type.includes('html')) {
      expect(body, path).toContain('<meta name="build-mode" content="production"');
      expect(body, path).not.toContain('noindex');
      // No navigation to empty sections.
      expect(body, path).not.toMatch(/Pending research|Investigación pendiente/);
    }
  }
  // Only the preview pages exist: no record or section pages.
  expect([...site.keys()].filter((p) => p.endsWith('/')).sort()).toEqual([...PAGES].sort());
});

test('bilingual root offers both languages and the preview notice', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByRole('link', { name: 'Enter in English' })).toHaveAttribute('href', `${BASE}en/`);
  await expect(page.getByRole('link', { name: 'Entrar en español' })).toHaveAttribute('href', `${BASE}es/`);
  await expect(page.getByRole('note')).toContainText('Preview.');
  await expect(page.getByRole('note')).toContainText('Vista previa.');
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', REPOSITORY_URL);
});

for (const [locale, other, home, method, otherMethod, switchLabel] of [
  ['en', 'es', `${BASE}en/`, `${BASE}en/methodology/`, `${BASE}es/metodologia/`, 'Leer en español'],
  ['es', 'en', `${BASE}es/`, `${BASE}es/metodologia/`, `${BASE}en/methodology/`, 'Read in English'],
] as const) {
  test(`${locale}: home shows purpose, six planned sections, method, repository`, async ({ page }) => {
    await page.goto(home);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.area')).toHaveCount(6);
    await expect(page.getByRole('note')).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', REPOSITORY_URL);
    await expect(page.locator(`link[rel=alternate][hreflang=${other}]`)).toHaveAttribute(
      'href',
      `https://rabelo83.github.io${BASE}${other}/`,
    );
  });

  test(`${locale}: language switch maps home and methodology to the other language`, async ({ page }) => {
    await page.goto(home);
    await page.getByRole('banner').getByRole('link', { name: switchLabel }).click();
    await expect(page).toHaveURL(new RegExp(`${BASE}${other}/$`));
    await page.goto(method);
    await page.getByRole('banner').getByRole('link', { name: switchLabel }).click();
    await expect(page).toHaveURL(new RegExp(`${otherMethod}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', other);
  });
}

test('direct loads: missing trailing slash redirects; unknown paths return 404', async ({ page, request }) => {
  const res = await page.goto(`${BASE}es/metodologia`);
  expect(res?.status()).toBe(200);
  expect(page.url()).toMatch(/\/es\/metodologia\/$/);
  const missing = await request.get(`${BASE}en/claims/clm-example-one/`);
  expect(missing.status()).toBe(404);
});

for (const path of [...PAGES, `${BASE}404.html`]) {
  test(`axe and layout: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('keyboard: skip link, then title, then language switch', async ({ page }) => {
  await page.goto(`${BASE}en/`);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Leer en español' })).toBeFocused();
});
