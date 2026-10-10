// Validates the real content root and the valid fixture corpus. Both must pass.
// Intentionally invalid inputs live in fixtures/invalid/ and are exercised by tests.
import { loadCorpus } from '../src/lib/content/load.ts';
import { rootKindOf } from '../src/lib/content/corpus.ts';
import { validateCorpus } from '../src/lib/content/validate.ts';
import { arg } from './args.ts';

const roots = arg('root') ? [arg('root')!] : ['content', 'fixtures/valid'];
let failed = false;
for (const root of roots) {
  const raw = loadCorpus(root);
  const { corpus, issues } = validateCorpus(raw, rootKindOf(root));
  if (issues.length) {
    failed = true;
    console.error(`✗ ${root}: ${issues.length} issue(s)`);
    for (const i of issues) console.error(`  [${i.code}] ${i.file}: ${i.message}`);
  } else {
    console.log(`✓ ${root}: ${corpus.records.size} records, ${corpus.texts.size} texts`);
  }
}
console.log('Note: validation checks structure and references only; factual support and translation equivalence are editorial review steps.');
process.exit(failed ? 1 : 0);
