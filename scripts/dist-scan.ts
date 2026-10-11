// Scans a production build for anything that must not be published.
// Every file in dist/ is checked (HTML, scripts, styles, data, assets), not only pages.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { FIXTURE_TOKEN, LOCALES } from '../src/lib/content/constants.ts';
import { loadCorpus } from '../src/lib/content/load.ts';
import { rootKindOf } from '../src/lib/content/corpus.ts';
import { isReleasable } from '../src/lib/content/select.ts';
import { textKey, validateCorpus } from '../src/lib/content/validate.ts';
import { SECTION_SLUGS } from '../src/lib/i18n.ts';

export interface ScanResult {
  problems: string[];
  /** Record IDs that have pages in dist. */
  recordPages: Set<string>;
  /** Releasable record IDs in the input corpus. */
  expected: Set<string>;
  /** Non-releasable records in the input corpus (the leak candidates). */
  withheld: number;
  filesScanned: number;
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

export function scanDist(dist: string, corpusRoot: string): ScanResult {
  const { corpus, issues } = validateCorpus(loadCorpus(corpusRoot), rootKindOf(corpusRoot));
  if (issues.length) throw new Error(`input corpus ${corpusRoot} is invalid; run npm run validate`);

  // Strings that would only appear if a withheld record leaked.
  const forbidden = new Map<string, string>([[FIXTURE_TOKEN, 'fixture token']]);
  // Preview-only assets (for example the Task 010 atlas stylesheet) carry this marker.
  forbidden.set('preview-only', 'preview-only asset');
  const expected = new Set<string>();
  let withheld = 0;
  for (const { record } of corpus.records.values()) {
    const texts = LOCALES.map((l) => corpus.texts.get(textKey(l, record.id)));
    if (isReleasable(record, texts)) {
      expected.add(record.id);
      continue;
    }
    withheld++;
    forbidden.set(record.id, `withheld record ID`);
    if (record.type === 'source') forbidden.set(record.title, `title of withheld ${record.id}`);
    for (const t of texts) {
      if (!t) continue;
      forbidden.set(t.fm.title, `title of withheld ${record.id}`);
      forbidden.set(t.fm.summary, `summary of withheld ${record.id}`);
    }
  }

  const problems: string[] = [];
  const recordPages = new Set<string>();
  const sectionDirs = new Map(
    Object.entries(SECTION_SLUGS).flatMap(([, bySlug]) => LOCALES.map((l) => [`${l}/${bySlug[l]}`, l])),
  );
  const all = files(dist);
  for (const f of all) {
    const rel = relative(dist, f).split(sep).join('/');
    if (/\.(ya?ml|md|mdx)$/i.test(rel)) problems.push(`${rel}: source content file copied into output`);
    const m = /^([a-z]{2}\/[^/]+)\/([^/]+)\/index\.html$/.exec(rel);
    if (m && sectionDirs.has(m[1])) recordPages.add(m[2]);
    // latin1 keeps byte offsets for binary files while still matching ASCII/UTF-8 text.
    const body = readFileSync(f).toString(/\.(html|js|css|json|xml|txt|svg|map)$/.test(rel) ? 'utf8' : 'latin1');
    if (rel.endsWith('.html')) {
      const mode = /<meta name="build-mode" content="([^"]+)"/.exec(body)?.[1];
      if (rel !== '404.html' && mode !== 'production') problems.push(`${rel}: build-mode is ${mode ?? 'missing'}, expected production`);
      if (/noindex/.test(body) && rel !== '404.html') problems.push(`${rel}: noindex marker indicates a non-production build`);
    }
    for (const [needle, why] of forbidden) {
      if (body.includes(needle)) problems.push(`${rel}: contains ${why} (${needle.slice(0, 60)})`);
    }
  }
  for (const id of recordPages) if (!expected.has(id)) problems.push(`page for non-releasable record ${id}`);
  for (const id of expected) if (!recordPages.has(id)) problems.push(`releasable record ${id} has no page`);
  return { problems, recordPages, expected, withheld, filesScanned: all.length };
}
