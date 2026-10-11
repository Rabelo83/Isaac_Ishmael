// node scripts/check-dist.ts --corpus <root> [--dist dist]
import { arg } from './args.ts';
import { scanDist } from './dist-scan.ts';

const corpus = arg('corpus', 'content')!;
// --foreign: the build was made from a different corpus (see scanDist).
const result = scanDist(arg('dist', 'dist')!, corpus, !process.argv.includes('--foreign'));
if (result.problems.length) {
  console.error(`✗ dist leak scan against ${corpus}: ${result.problems.length} problem(s)`);
  for (const p of result.problems.slice(0, 50)) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `✓ dist leak scan against ${corpus}: ${result.filesScanned} files, ${result.recordPages.size} record pages, ` +
    `${result.withheld} withheld records absent`,
);
