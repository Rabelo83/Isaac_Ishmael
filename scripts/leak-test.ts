// End-to-end proof that drafts and fixtures cannot reach production output:
// 1. The fixture corpus really contains published fixtures, non-fixture drafts, and draft translations.
//    (A *published* record with a draft translation is rejected by the validator before any build;
//    see tests/validator.test.ts.)
// 2. A production build over that corpus emits none of them (full dist scan).
// 3. Negative control: the same scan fails on a fixtures-mode build, so it is not vacuous.
import { execFileSync } from 'node:child_process';
import { LOCALES, RELEASABLE_TRANSLATION_STATUSES } from '../src/lib/content/constants.ts';
import { loadCorpus } from '../src/lib/content/load.ts';
import { textKey, validateCorpus } from '../src/lib/content/validate.ts';
import { scanDist } from './dist-scan.ts';

const ROOT = 'fixtures/valid';
const { corpus } = validateCorpus(loadCorpus(ROOT), 'fixtures');
const recs = [...corpus.records.values()].map((e) => e.record);
const withTexts = (id: string) => LOCALES.map((l) => corpus.texts.get(textKey(l, id)));
const present = {
  publishedFixtures: recs.filter((r) => r.fixture && r.review_status === 'published').length,
  nonFixtureDrafts: recs.filter((r) => !r.fixture && r.review_status !== 'published').length,
  nonFixtureWithDraftTranslation: recs.filter(
    (r) => !r.fixture && withTexts(r.id).some((t) => t && !RELEASABLE_TRANSLATION_STATUSES.includes(t.fm.translation_status)),
  ).length,
};
console.log('Leak-test input:', present);
for (const [k, n] of Object.entries(present)) {
  if (n === 0) throw new Error(`leak test input lacks ${k}; the test would prove nothing`);
}

const build = (mode: string) =>
  execFileSync(process.execPath, ['scripts/build.ts', '--mode', mode, '--root', ROOT], { stdio: 'inherit' });

build('production');
const prod = scanDist('dist', ROOT);
if (prod.problems.length) {
  console.error('✗ production build leaked withheld content:');
  for (const p of prod.problems) console.error(`  ${p}`);
  process.exit(1);
}
if (prod.recordPages.size !== 0) throw new Error('expected no record pages from a fixtures-only corpus');
console.log(`✓ production build over ${ROOT}: ${prod.filesScanned} files scanned, ${prod.withheld} withheld records absent`);

build('fixtures');
const control = scanDist('dist', ROOT);
if (control.problems.length === 0 || control.recordPages.size === 0) {
  throw new Error('negative control failed: scanner did not detect fixture output');
}
console.log(`✓ negative control: scanner flagged ${control.problems.length} problems in a fixtures build`);
