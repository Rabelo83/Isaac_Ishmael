import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { LOCALES, RECORD_TYPES } from '../../src/lib/content/constants.ts';
import { selectCorpus } from '../../src/lib/content/corpus.ts';
import { SECTION_SLUGS } from '../../src/lib/i18n.ts';

const BASE = '/Isaac_Ishmael/';
const records = [...selectCorpus('fixtures').records.values()].map((r) => r.record);
const recordPath = (locale: string, type: keyof typeof SECTION_SLUGS, id: string) =>
  `${BASE}${locale}/${SECTION_SLUGS[type][locale as 'en' | 'es']}/${id}/`;

test.beforeAll(async ({ request }) => {
  // Guard: these tests expect a fixtures-mode build.
  const html = await (await request.get(BASE)).text();
  expect(html, 'run npm run build:fixtures first').toContain('content="fixtures"');
});

test('root landing page links to both languages', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: 'Enter in English' })).toHaveAttribute('href', `${BASE}en/`);
  await expect(page.getByRole('link', { name: 'Entrar en español' })).toHaveAttribute('href', `${BASE}es/`);
});

test('every record page loads directly in both languages', async ({ request }) => {
  expect(records.length).toBeGreaterThan(0);
  for (const locale of LOCALES) {
    for (const r of records) {
      const res = await request.get(recordPath(locale, r.type, r.id));
      expect(res.status(), `${locale} ${r.id}`).toBe(200);
      const html = await res.text();
      expect(html).toContain(`<html lang="${locale}"`);
    }
  }
});

test('every section index loads directly in both languages', async ({ request }) => {
  for (const locale of LOCALES) {
    for (const type of RECORD_TYPES) {
      const res = await request.get(`${BASE}${locale}/${SECTION_SLUGS[type][locale]}/`);
      expect(res.status(), `${locale} ${type}`).toBe(200);
    }
  }
});

test('nested URL without trailing slash redirects, unknown paths return the 404 page', async ({ page, request }) => {
  const res = await page.goto(`${BASE}es/afirmaciones/clm-example-one`);
  expect(res?.status()).toBe(200);
  expect(page.url()).toMatch(/\/es\/afirmaciones\/clm-example-one\/$/);
  const missing = await request.get(`${BASE}en/claims/clm-does-not-exist/`);
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('Página no encontrada');
});

test('language switch keeps the record, query string, and back again', async ({ page }) => {
  await page.goto(`${BASE}en/claims/clm-example-one/?category=legal`);
  await page.getByRole('banner').getByRole('link', { name: 'Leer en español' }).click();
  await expect(page).toHaveURL(`${BASE}es/afirmaciones/clm-example-one/?category=legal`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('banner').getByRole('link', { name: 'Read in English' }).click();
  await expect(page).toHaveURL(`${BASE}en/claims/clm-example-one/?category=legal`);
});

test('pages declare alternates for the other language', async ({ page }) => {
  await page.goto(`${BASE}en/legal-authorities/law-example-treaty/`);
  await expect(page.locator('link[rel=alternate][hreflang=es]')).toHaveAttribute(
    'href',
    `https://rabelo83.github.io${BASE}es/autoridades-juridicas/law-example-treaty/`,
  );
});

test('citation markers link to their citation with locator and source link', async ({ page }) => {
  await page.goto(`${BASE}en/claims/clm-example-one/`);
  await page.getByRole('link', { name: 'Citation 2' }).click();
  await expect(page).toHaveURL(/#cit-b-unpaginated$/);
  const item = page.locator('#cit-b-unpaginated');
  await expect(item).toContainText('No precise locator available');
  await expect(item.getByRole('link', { name: /Example Source B/ })).toHaveAttribute(
    'href',
    `${BASE}en/sources/src-example-b/`,
  );
});

test('fixture and draft banners are shown in non-production builds', async ({ page }) => {
  await page.goto(`${BASE}es/eventos/evt-example-undated-draft/`);
  await expect(page.getByRole('note').first()).toContainText('Dato de prueba sintético');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  // Spanish text is missing for this draft: the page says so instead of falling back to English.
  await expect(page.getByText('Este registro todavía no tiene texto en este idioma.')).toBeVisible();
});

test('keyboard: skip link first, then reaches the language switch', async ({ page }) => {
  await page.goto(`${BASE}en/claims/clm-example-one/`);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await page.goto(`${BASE}en/claims/clm-example-one/`);
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Leer en español' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${BASE}es/afirmaciones/clm-example-one/`);
});

const auditPaths = [
  BASE,
  `${BASE}404.html`,
  ...LOCALES.flatMap((l) => [
    `${BASE}${l}/`,
    `${BASE}${l}/${SECTION_SLUGS.claim[l]}/`,
    ...RECORD_TYPES.map((type) => {
      const r = records.find((x) => x.type === type)!;
      return recordPath(l, type, r.id);
    }),
    recordPath(l, 'event', 'evt-example-undated-draft'),
  ]),
];

for (const path of auditPaths) {
  test(`axe: no serious or critical violations @mobile ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('no horizontal overflow on record pages @mobile', async ({ page }) => {
  for (const r of records) {
    await page.goto(recordPath('es', r.type, r.id));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, r.id).toBeLessThanOrEqual(0);
  }
});
