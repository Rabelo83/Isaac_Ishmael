import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Runs against the production build and, via npm run verify:live, against the live site.
const EN = '/Isaac_Ishmael/en/atlas/';
const ES = '/Isaac_Ishmael/es/atlas/';
const viewBox = (page: Page) => page.locator('.atlas-viewport svg').getAttribute('viewBox');

test('homepages, landing page and navigation link to the atlas', async ({ page }) => {
  await page.goto('/Isaac_Ishmael/en/');
  await page.getByRole('main').getByRole('link', { name: 'Open the atlas' }).click();
  await expect(page).toHaveURL(new RegExp(`${EN}$`));
  await expect(page.getByRole('banner').getByRole('link', { name: 'Atlas', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.goto('/Isaac_Ishmael/es/');
  await expect(page.getByRole('main').getByRole('link', { name: 'Abrir el atlas' })).toHaveAttribute('href', ES);
  await page.goto('/Isaac_Ishmael/');
  await expect(page.getByRole('link', { name: 'Open the atlas' })).toHaveAttribute('href', EN);
  await expect(page.getByRole('link', { name: 'Abrir el atlas' })).toHaveAttribute('href', ES);
});

test('states what the base is, its source, scale and dates, in both languages', async ({ page }) => {
  await page.goto(EN);
  await expect(page.locator('.atlas-base-notice')).toContainText('Geographic base map');
  await expect(page.locator('.atlas-notice')).toContainText('Not a historical reconstruction');
  await expect(page.locator('main')).not.toContainText(/today|local preview/i);
  const source = page.locator('.atlas-panel');
  await expect(source.locator('.attribution')).toContainText('Made with Natural Earth (public domain)');
  await expect(source.locator('.scale-value')).toHaveText('1:10,000,000');
  await expect(source).toContainText('not for local, parcel-level or legal precision');
  await expect(source).toContainText('not survey dates of the features');
  await expect(source).toContainText('Downloaded for this project');
  await page.goto(ES);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.atlas-notice')).toContainText('No es una reconstrucción histórica');
  await expect(page.locator('.scale-value')).toHaveText('1:10 000 000');
  await expect(page.locator('.attribution')).toContainText('hecho con Natural Earth');
});

test('technical details are collapsed by default and hold hashes and tolerances', async ({ page }) => {
  await page.goto(EN);
  const tech = page.locator('.atlas-panel details.atlas-technical');
  await expect(tech).not.toHaveAttribute('open');
  await expect(tech.locator('.sha').first()).toBeHidden();
  await tech.locator('summary').click();
  await expect(tech.locator('.sha')).toHaveCount(4);
  await expect(tech).toContainText('Douglas–Peucker');
  await expect(tech).toContainText('lake 0.0015°'); // not rounded away
  await expect(page.locator('.atlas-table thead')).not.toContainText('feature ID');
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

test('coordinate labels at the top of the map are not clipped', async ({ page }) => {
  await page.goto(EN);
  const svgBox = (await page.locator('.atlas-viewport svg').boundingBox())!;
  const tops = await page.locator('.grat-labels text.top').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
  expect(tops.length).toBeGreaterThan(0);
  for (const top of tops) expect(top).toBeGreaterThanOrEqual(svgBox.y - 0.5);
});

test('zoom buttons, wheel and reset change the view', async ({ page }) => {
  await page.goto(EN);
  const initial = await viewBox(page);
  await page.getByRole('button', { name: 'Zoom in' }).click();
  expect(await viewBox(page)).not.toBe(initial);
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect(await viewBox(page)).toBe(initial);
  await page.locator('.atlas-viewport').hover();
  await page.mouse.wheel(0, -300);
  expect(await viewBox(page)).not.toBe(initial);
});

test('the map pans and zooms from the keyboard', async ({ page }) => {
  await page.goto(EN);
  await page.locator('.atlas-viewport').focus();
  const initial = await viewBox(page);
  await page.keyboard.press('+');
  const zoomed = await viewBox(page);
  expect(zoomed).not.toBe(initial);
  await page.keyboard.press('ArrowRight');
  expect(await viewBox(page)).not.toBe(zoomed);
  await page.keyboard.press('0');
  expect(await viewBox(page)).toBe(initial);
});

test('features are selectable by keyboard; IDs sit in expandable details', async ({ page }) => {
  await page.goto(EN);
  const deadSea = page.locator('.atlas-viewport .lake[aria-label="Dead Sea"]');
  await deadSea.focus();
  await page.keyboard.press('Enter');
  await expect(deadSea).toHaveAttribute('aria-pressed', 'true');
  const details = page.locator('#atlas-details');
  await expect(details).toContainText('Salt Sea');
  await expect(details).toContainText('ne_10m_lakes');
  await expect(details.locator('details code')).toBeHidden();
  await details.locator('summary').click();
  await expect(details.locator('details code')).toContainText('1159126747');
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
