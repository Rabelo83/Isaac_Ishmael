import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FIXTURE_TOKEN } from '../src/lib/content/constants.ts';
import { DEMO_DATA, checkDemo, demoSchema, formatInventedDate, loadDemo } from '../src/lib/demo.ts';

const raw = readFileSync(DEMO_DATA, 'utf8');
const data = demoSchema.parse(JSON.parse(raw));

describe('public interface demonstration data', () => {
  it('passes the demo policy checks', () => {
    expect(checkDemo(data, raw)).toEqual([]);
    expect(() => loadDemo()).not.toThrow();
  });

  it('is not a test fixture and stays separate from fixtures and research', () => {
    expect(raw).not.toContain(FIXTURE_TOKEN);
    expect(DEMO_DATA.startsWith('fixtures/')).toBe(false);
    expect(DEMO_DATA.startsWith('content/')).toBe(false);
    expect(raw).not.toMatch(/"src-|"clm-|"law-|"prp-|"rsp-|"evt-|"act-/);
  });

  it('rejects the fixture token, unlabelled example sources, and non-schematic areas', () => {
    expect(checkDemo(data, `${raw} ${FIXTURE_TOKEN}`).join()).toMatch(/must not contain/);
    const bad = structuredClone(data);
    bad.features[0].example_source.title.en = 'Household list';
    bad.features.find((f) => f.geometry.type === 'area')!.uncertainty = 'located';
    const problems = checkDemo(bad, raw).join();
    expect(problems).toMatch(/must say "invented"/);
    expect(problems).toMatch(/areas must be schematic/);
  });

  it('uses every layer and labels the invented calendar in both languages', () => {
    expect(new Set(data.features.map((f) => f.layer))).toEqual(new Set(data.layers.map((l) => l.id)));
    expect(formatInventedDate({ from: 14, approximate: true }, 'en')).toBe('c. Year 14 (invented calendar)');
    expect(formatInventedDate({ from: 8, to: 19 }, 'es')).toBe('Año 8–19 (calendario inventado)');
  });
});
