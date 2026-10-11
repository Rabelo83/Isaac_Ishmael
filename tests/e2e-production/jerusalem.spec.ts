import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Task 016: the first published explanation and its three sources.
const BASE = '/Isaac_Ishmael/';
const CLAIM = { en: `${BASE}en/claims/clm-jerusalem-1947-proposal/`, es: `${BASE}es/afirmaciones/clm-jerusalem-1947-proposal/` };
const SOURCES = ['src-un-ga-res-181-1947-en', 'src-un-map-104b-catalog', 'src-un-map-104b-commons-copy'];

test('both homepages link to the published explanation', async ({ page }) => {
  await page.goto(`${BASE}en/`);
  await page.getByRole('link', { name: 'Jerusalem in the 1947 partition proposal' }).click();
  await expect(page).toHaveURL(CLAIM.en);
  await page.goto(`${BASE}es/`);
  await page.getByRole('link', { name: 'Jerusalén en la propuesta de partición de 1947' }).click();
  await expect(page).toHaveURL(CLAIM.es);
});

test('published pages carry no draft banner and keep their disclosures', async ({ page }) => {
  await page.goto(CLAIM.en);
  await expect(page.locator('.banner-draft')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('Category: proposed arrangement.');
  await expect(page.locator('main')).toContainText('not independently reviewed by a person');
  await page.goto(CLAIM.es);
  await expect(page.locator('.banner-draft')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('Traducción del proyecto (revisada); revisada por Codex (AI editorial review)');
  await expect(page.locator('main')).toContainText('Traducción del proyecto, no oficial');
  await expect(page.locator('main img, main iframe, main object, main embed')).toHaveCount(0);
});

test('citation markers lead to their entries, and entries to source pages', async ({ page }) => {
  await page.goto(CLAIM.en);
  const markers = page.locator('sup.cite a');
  await expect(markers).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const href = (await markers.nth(i).getAttribute('href'))!;
    await expect(page.locator(href)).toHaveCount(1);
  }
  for (const id of SOURCES) {
    await page.goto(CLAIM.en);
    await page.locator(`ol.citations a[href$="/en/sources/${id}/"]`).first().click();
    await expect(page).toHaveURL(`${BASE}en/sources/${id}/`);
  }
});

test('language switch moves between the matching records', async ({ page }) => {
  await page.goto(CLAIM.en);
  await page.getByRole('banner').getByRole('link', { name: 'Leer en español' }).click();
  await expect(page).toHaveURL(CLAIM.es);
  await page.getByRole('banner').getByRole('link', { name: 'Read in English' }).click();
  await expect(page).toHaveURL(CLAIM.en);
});

test('published pages pass axe and do not scroll sideways', async ({ page }) => {
  const paths = [...Object.values(CLAIM), ...SOURCES.flatMap((id) => [`${BASE}en/sources/${id}/`, `${BASE}es/fuentes/${id}/`])];
  for (const path of paths) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, path).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
  }
});
