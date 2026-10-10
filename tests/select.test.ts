import { describe, expect, it } from 'vitest';
import { selectCorpus } from '../src/lib/content/corpus.ts';
import type { TranslationStatus } from '../src/lib/content/constants.ts';
import type { ContentRecord } from '../src/lib/content/schemas.ts';
import { includeInMode, isReleasable } from '../src/lib/content/select.ts';

// In-memory record used only to exercise the gate; never written to disk.
const base = {
  id: 'act-gate-test',
  type: 'actor',
  kind: 'other',
  authority_links: [],
  related: [],
  corrections: [],
  citations: [],
};
const rec = (over: Partial<ContentRecord>) =>
  ({ ...base, review_status: 'published', fixture: false, ...over }) as ContentRecord;
const t = (s: TranslationStatus) => ({ fm: { translation_status: s } });
const both = [t('original'), t('project_translation_reviewed')];

describe('production gate', () => {
  it('releases only non-fixture, published records with releasable texts in every locale', () => {
    expect(isReleasable(rec({}), both)).toBe(true);
    expect(isReleasable(rec({ fixture: true }), both)).toBe(false);
    for (const s of ['lead', 'source_inspected', 'draft', 'reviewed'] as const) {
      expect(isReleasable(rec({ review_status: s }), both)).toBe(false);
    }
    expect(isReleasable(rec({}), [t('original'), undefined])).toBe(false);
    expect(isReleasable(rec({}), [t('original'), t('project_translation_draft')])).toBe(false);
    expect(isReleasable(rec({}), [])).toBe(false);
  });

  it('preview shows non-fixture drafts but never fixtures', () => {
    expect(includeInMode('preview', rec({ review_status: 'draft' }), [])).toBe(true);
    expect(includeInMode('preview', rec({ fixture: true }), both)).toBe(false);
  });
});

describe('selection over the fixture corpus', () => {
  it('production selects nothing although published fixtures and drafts are present', () => {
    expect(selectCorpus('production', 'fixtures/valid').records.size).toBe(0);
  });
  it('fixtures mode renders the whole fixture corpus', () => {
    expect(selectCorpus('fixtures').records.size).toBe(15);
  });
  it('preview over fixtures selects only the non-fixture drafts', () => {
    const ids = [...selectCorpus('preview', 'fixtures/valid').records.keys()].sort();
    expect(ids).toEqual(['clm-example-reviewed', 'evt-example-undated-draft', 'src-example-draft']);
  });
});
