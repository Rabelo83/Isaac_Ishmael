import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ContentValidationError, selectCorpus } from '../src/lib/content/corpus.ts';
import { loadCorpus, mergeCorpora } from '../src/lib/content/load.ts';
import { validateCorpus, type RootKind } from '../src/lib/content/validate.ts';

const INVALID = 'fixtures/invalid';
const cases = readdirSync(INVALID).sort();

function runCase(name: string) {
  const dir = join(INVALID, name);
  const expectation = JSON.parse(readFileSync(join(dir, 'expect.json'), 'utf8')) as {
    rootKind: RootKind;
    codes: string[];
  };
  // Fixture cases overlay one defect on the valid corpus; content cases stand alone.
  const raw =
    expectation.rootKind === 'fixtures'
      ? mergeCorpora([loadCorpus('fixtures/valid'), loadCorpus(dir)])
      : loadCorpus(dir);
  return { expectation, ...validateCorpus(raw, expectation.rootKind) };
}

describe('valid corpora pass', () => {
  it('content/', () => {
    expect(validateCorpus(loadCorpus('content'), 'content').issues).toEqual([]);
  });
  it('fixtures/valid', () => {
    expect(validateCorpus(loadCorpus('fixtures/valid'), 'fixtures').issues).toEqual([]);
  });
});

describe('each invalid input is rejected with exactly its expected issue codes', () => {
  it.each(cases)('%s', (name) => {
    const { expectation, issues } = runCase(name);
    expect(issues.length).toBeGreaterThan(0);
    expect([...new Set(issues.map((i) => i.code))].sort()).toEqual([...expectation.codes].sort());
  });
});

describe('rule coverage', () => {
  it('every issue code emitted by validate.ts has a negative case', () => {
    const source = readFileSync('src/lib/content/validate.ts', 'utf8');
    const codes = new Set([...source.matchAll(/add\('([A-Z_]+)'/g)].map((m) => m[1]));
    const covered = new Set(cases.flatMap((c) => runCase(c).issues.map((i) => i.code)));
    expect([...codes].filter((c) => !covered.has(c))).toEqual([]);
  });

  it('every reference field has its own dangling-reference case', () => {
    const fields = new Set(
      cases
        .filter((c) => c.startsWith('dangling-'))
        .flatMap((c) => runCase(c).issues.map((i) => i.message.split(' → ')[0].replace(/\[[^\]]*\]/, ''))),
    );
    for (const field of [
      'citations.source',
      'related',
      'actors',
      'issuing_body',
      'forum',
      'parties',
      'proposers',
      'participants',
      'mediators',
      'actor',
      'proposal',
    ]) {
      expect([...fields], field).toContain(field);
    }
  });
});

describe('build path', () => {
  it('a build over invalid content aborts rather than filtering silently', () => {
    expect(() => selectCorpus('production', join(INVALID, 'yaml-syntax-error'))).toThrow(ContentValidationError);
  });
  it('fixtures mode refuses non-fixture roots', () => {
    expect(() => selectCorpus('fixtures', 'content')).toThrow(/fixtures mode/);
  });
});
