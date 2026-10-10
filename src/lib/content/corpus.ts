// Loads, validates, and filters the corpus for a build. Any validation issue
// aborts the build, so invalid content cannot silently enter any output.
import { BUILD_MODES, LOCALES, type BuildMode, type Locale } from './constants.ts';
import { loadCorpus } from './load.ts';
import type { ContentRecord } from './schemas.ts';
import { includeInMode } from './select.ts';
import { textKey, validateCorpus, type Issue, type RootKind, type TextEntry } from './validate.ts';

export const DEFAULT_ROOT: Record<BuildMode, string> = {
  production: 'content',
  preview: 'content',
  fixtures: 'fixtures/valid',
};

export const rootKindOf = (root: string): RootKind =>
  root.replace(/\\/g, '/').replace(/^\.\//, '').startsWith('fixtures/') ? 'fixtures' : 'content';

export interface SiteRecord {
  record: ContentRecord;
  texts: Partial<Record<Locale, TextEntry>>;
}

export interface SiteCorpus {
  mode: BuildMode;
  root: string;
  records: Map<string, SiteRecord>;
}

export class ContentValidationError extends Error {
  readonly issues: Issue[];
  constructor(issues: Issue[]) {
    super(`Content validation failed:\n${issues.map((i) => `  [${i.code}] ${i.file}: ${i.message}`).join('\n')}`);
    this.issues = issues;
  }
}

export function buildModeFromEnv(value: string | undefined): BuildMode {
  const mode = value ?? 'production';
  if (!(BUILD_MODES as readonly string[]).includes(mode)) throw new Error(`Unknown SITE_MODE "${mode}"`);
  return mode as BuildMode;
}

export function selectCorpus(mode: BuildMode, root: string = DEFAULT_ROOT[mode]): SiteCorpus {
  if (mode === 'fixtures' && rootKindOf(root) !== 'fixtures') {
    throw new Error('fixtures mode only reads roots under fixtures/');
  }
  const { corpus, issues } = validateCorpus(loadCorpus(root), rootKindOf(root));
  if (issues.length) throw new ContentValidationError(issues);

  const records = new Map<string, SiteRecord>();
  for (const { record } of corpus.records.values()) {
    const texts = LOCALES.map((l) => corpus.texts.get(textKey(l, record.id)));
    if (!includeInMode(mode, record, texts)) continue;
    const byLocale: SiteRecord['texts'] = {};
    LOCALES.forEach((l, i) => {
      if (texts[i]) byLocale[l] = texts[i];
    });
    records.set(record.id, { record, texts: byLocale });
  }
  return { mode, root, records };
}
