import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const EN = '/Isaac_Ishmael/en/atlas/';
const ES = '/Isaac_Ishmael/es/atlas/';
const viewBox = (page: Page) => page.locator('.atlas-viewport svg').getAttribute('viewBox');

test.beforeAll(async ({ request }) => {
  const html = await (await request.get('/Isaac_Ishmael/')).text();
  expect(html, 'run npm run build:preview first').toContain('content="preview"');
});

test('labels the base as modern geography with attribution, in both languages', async ({ page }) => {
  await page.goto(EN);
  await expect(page.locator('.atlas-notice')).toContainText('not a historical reconstruction');
  await expect(page.locator('.atlas-local')).toContainText('Local preview only');
  await expect(page.locator('.attribution')).toContainText('Made with Natural Earth');
  await expect(page.locator('.attribution').getByRole('link')).toHaveAttribute('href', 'https://www.naturalearthdata.com/');
  await page.goto(ES);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.atlas-notice')).toContainText('no una reconstrucción histórica');
  await expect(page.locator('.attribution')).toContainText('hecho con Natural Earth');
});

test('shows physical features only, with the expected labels', async ({ page }) => {
  await page.goto(EN);
  const labels = page.locator('.atlas-viewport .label');
  for (const name of ['Mediterranean Sea', 'Dead Sea', 'Sea of Galilee', 'Jordan River', 'Gulf of Suez', 'Suez Canal']) {
    await expect(labels.filter({ hasText: name }), name).toHaveCount(1);
  }
  await expect(labels.filter({ hasText: /Aqaba|Eilat/ })).toHaveCount(0);
  await expect(page.locator('.atlas-viewport [class*="boundar"], .atlas-viewport [class*="border"]')).toHaveCount(0);
});

test('zoom buttons, wheel and reset change the view', async ({ page }) => {
  await page.goto(EN);
  const initial = await viewBox(page);
  await page.getByRole('button', { name: 'Zoom in' }).click();
  const zoomed = await viewBox(page);
  expect(zoomed).not.toBe(initial);
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect(await viewBox(page)).toBe(initial);
  await page.locator('.atlas-viewport').hover();
  await page.mouse.wheel(0, -300);
  expect(await viewBox(page)).not.toBe(initial);
});

test('the map pans and zooms from the keyboard', async ({ page }) => {
  await page.goto(EN);
  const viewport = page.locator('.atlas-viewport');
  await viewport.focus();
  const initial = await viewBox(page);
  await page.keyboard.press('+');
  const zoomed = await viewBox(page);
  expect(zoomed).not.toBe(initial);
  await page.keyboard.press('ArrowRight');
  expect(await viewBox(page)).not.toBe(zoomed);
  await page.keyboard.press('0');
  expect(await viewBox(page)).toBe(initial);
});

test('features are selectable by keyboard and show their source details', async ({ page }) => {
  await page.goto(EN);
  const deadSea = page.locator('.atlas-viewport .lake[aria-label="Dead Sea"]');
  await deadSea.focus();
  await page.keyboard.press('Enter');
  await expect(deadSea).toHaveAttribute('aria-pressed', 'true');
  const details = page.locator('#atlas-details');
  await expect(details).toContainText('Dead Sea');
  await expect(details).toContainText('Salt Sea');
  await expect(details).toContainText('ne_10m_lakes');
});

test('the table lists every named feature and zooms the map to it', async ({ page }) => {
  await page.goto(EN);
  const rows = page.locator('.atlas-table tbody tr');
  await expect(rows).toHaveCount(12);
  await expect(rows.filter({ hasText: 'Label omitted' })).toContainText('Gulf of Aqaba, Gulf of Eilat');
  const initial = await viewBox(page);
  await rows.filter({ hasText: 'Jordan River' }).getByRole('button', { name: 'Show on map' }).click();
  expect(await viewBox(page)).not.toBe(initial);
  await expect(page.locator('.atlas-viewport .river.is-selected')).toHaveCount(1);
  await expect(page.locator('#atlas-details')).toContainText('Jordan River');
});

test('language switch keeps the atlas', async ({ page }) => {
  await page.goto(EN);
  await page.getByRole('banner').getByRole('link', { name: 'Leer en español' }).click();
  await expect(page).toHaveURL(new RegExp(`${ES}$`));
  await expect(page.locator('.atlas-viewport .label').filter({ hasText: 'río Jordán' })).toHaveCount(1);
  await expect(page.locator('.atlas-viewport .label').filter({ hasText: 'mar Mediterráneo' })).toHaveCount(1);
});

for (const path of [EN, ES]) {
  test(`axe and layout: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
