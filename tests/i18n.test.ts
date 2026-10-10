import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as C from '../src/lib/content/constants.ts';
import { renderCiteMarkers } from '../src/lib/cite.ts';
import { SECTION_SLUGS, UI, VALUE_LABELS, recordUrl, url } from '../src/lib/i18n.ts';

const keys = (o: object, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

describe('bilingual parity', () => {
  it('UI dictionaries have identical keys', () => {
    expect(keys(UI.es).sort()).toEqual(keys(UI.en).sort());
  });

  it('every displayed vocabulary value has a label in both languages', () => {
    const displayed = [
      ...C.EVIDENCE_CATEGORIES,
      ...C.REVIEW_STATUSES,
      ...C.TRANSLATION_STATUSES,
      ...C.CITATION_RELATIONSHIPS,
      ...C.ACCESS_STATUSES,
      ...C.INSPECTION_LEVELS,
      ...C.DISPUTE_CONCERNS,
      ...C.LOCATOR_TYPES,
    ];
    for (const locale of C.LOCALES) {
      expect(displayed.filter((v) => !(v in VALUE_LABELS[locale])), locale).toEqual([]);
    }
  });

  it('section slugs are unique per locale and URL-safe', () => {
    for (const locale of C.LOCALES) {
      const slugs = Object.values(SECTION_SLUGS).map((s) => s[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const s of slugs) expect(s).toMatch(/^[a-z-]+$/);
    }
  });

  it('the design doc names exactly the schema translation statuses', () => {
    const doc = readFileSync('docs/TECHNICAL_DESIGN.md', 'utf8');
    const mentioned = new Set(doc.match(/`(original|project_translation_[a-z_]+)`/g)?.map((m) => m.slice(1, -1)));
    expect([...mentioned].sort()).toEqual([...C.TRANSLATION_STATUSES].sort());
  });
});

describe('URLs', () => {
  it('stay under the repository base, end with a slash, and share the record ID', () => {
    expect(url()).toBe('/Isaac_Ishmael/');
    expect(recordUrl('en', 'claim', 'clm-x')).toBe('/Isaac_Ishmael/en/claims/clm-x/');
    expect(recordUrl('es', 'claim', 'clm-x')).toBe('/Isaac_Ishmael/es/afirmaciones/clm-x/');
  });
});

describe('citation markers', () => {
  it('number markers by citation order and reject unknown markers', () => {
    const cites = [{ id: 'cit-a' }, { id: 'cit-b' }] as never;
    expect(renderCiteMarkers('x :cite[cit-b]', cites, 'Cita')).toContain('href="#cit-b" aria-label="Cita 2">[2]');
    expect(() => renderCiteMarkers(':cite[cit-z]', cites, 'Cita')).toThrow();
  });
});
