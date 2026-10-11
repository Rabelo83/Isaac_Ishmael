import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Runs against the production build (and, via npm run verify:live, against the live site).
const EN = '/Isaac_Ishmael/en/demo/timeline-map/';
const ES = '/Isaac_Ishmael/es/demo/cronologia-mapa/';
const panel = '#tm-evidence';

test('the homepage and root landing link to the demonstration', async ({ page }) => {
  await page.goto('/Isaac_Ishmael/en/');
  await page.getByRole('main').getByRole('link', { name: 'Open the timeline and map demonstration' }).click();
  await expect(page).toHaveURL(new RegExp(`${EN}$`));
  await page.goto('/Isaac_Ishmael/');
  await expect(page.getByRole('link', { name: 'Abrir la demostración de cronología y mapa' })).toHaveAttribute('href', ES);
});

test('every demo page is labelled as an invented demonstration', async ({ page }) => {
  for (const [path, text] of [
    [EN, 'It is not historical evidence.'],
    [ES, 'No es prueba histórica.'],
  ]) {
    await page.goto(path);
    await expect(page.locator('.banner-demo')).toContainText(text);
    await expect(page.locator('.tm-notice')).toBeVisible();
  }
});

test('timeline selection updates the panel and highlights the map', async ({ page }) => {
  await page.goto(EN);
  await page.locator('.tm-events').getByRole('button', { name: /Western office area administered/ }).click();
  const p = page.locator(panel);
  await expect(p).toContainText('Western office area');
  await expect(p).toContainText('Schematic extent, not a boundary');
  await expect(p).toContainText('Invented tax roll');
  await expect(p).toContainText('Invented for this demonstration; not research');
  await expect(page.locator('.feat[data-id="demo-office-west"]')).toHaveClass(/is-related/);
  await expect(page).toHaveURL(/\?sel=demo-ev-office$/);
});

test('map shapes work from the keyboard and link back to the timeline', async ({ page }) => {
  await page.goto(EN);
  const shape = page.locator('.feat[data-id="demo-hamlet-beta"]');
  await shape.focus();
  await page.keyboard.press('Enter');
  await expect(shape).toHaveAttribute('aria-pressed', 'true');
  const p = page.locator(panel);
  await expect(p).toContainText('Approximate');
  await expect(p).toContainText('Invented travel diary');
  await expect(p.getByRole('link')).toHaveCount(0); // invented sources are never presented as linkable evidence
  await p.getByRole('button', { name: /Hamlet Beta mentioned/ }).click();
  await expect(p.locator('h3')).toHaveText('Hamlet Beta mentioned');
  await expect(p.locator('h3')).toBeFocused();
});

test('the table lists every feature and drives the same panel', async ({ page }) => {
  await page.goto(EN);
  const rows = page.locator('.tm-table tbody tr');
  await expect(rows).toHaveCount(6);
  await rows.filter({ hasText: 'Parcel Delta' }).getByRole('button', { name: 'Show evidence' }).click();
  await expect(page.locator(panel)).toContainText('Parcel Delta');
  await expect(page.locator('.feat[data-id="demo-parcel-delta"]')).toHaveClass(/is-selected/);
});

test('layer controls hide map shapes and timeline events, not table rows', async ({ page }) => {
  await page.goto(`${EN}?sel=demo-claim-gamma`);
  await page.getByRole('checkbox', { name: /Claimed area/ }).uncheck();
  await expect(page.locator('.feat[data-id="demo-claim-gamma"]')).toBeHidden();
  await expect(page.locator('.tm-events').getByRole('button', { name: /Group Gamma claims/ })).toBeHidden();
  await expect(page.locator('.tm-table tbody tr[data-id="demo-claim-gamma"]')).toBeVisible();
  await expect(page.locator(panel)).toContainText('This layer is hidden');
  await page.getByRole('checkbox', { name: /Claimed area/ }).check();
  await expect(page.locator('.feat[data-id="demo-claim-gamma"]')).toBeVisible();
});

test('a shared link keeps its selection when switching language', async ({ page }) => {
  await page.goto(`${EN}?sel=demo-ev-sketch`);
  await page.getByRole('banner').getByRole('link', { name: 'Leer en español' }).click();
  await expect(page).toHaveURL(new RegExp(`${ES}\\?sel=demo-ev-sketch$`));
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator(panel)).toContainText('Propuesta del esbozo del mediador');
  await expect(page.locator(panel)).toContainText('Año 33 (calendario inventado)');
});

for (const path of [EN, ES]) {
  test(`axe and layout: ${path}`, async ({ page }) => {
    await page.goto(`${path}?sel=demo-ev-office`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
