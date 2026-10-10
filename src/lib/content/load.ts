// Reads a content root from disk without validating cross-record rules.
// Layout: <root>/records/<type>/<id>.yaml and <root>/text/<lang>/<type>/<id>.md
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';

export interface RawFile {
  /** Path relative to the repository working directory, forward slashes. */
  file: string;
  /** Path segments under records/ or text/ (e.g. ["claim", "clm-x.yaml"]). */
  segments: string[];
  raw: string;
}

export interface RawRecordFile extends RawFile {
  data?: unknown;
  parseError?: string;
}

export interface RawTextFile extends RawFile {
  frontmatter?: unknown;
  body: string;
  parseError?: string;
}

export interface RawCorpus {
  root: string;
  records: RawRecordFile[];
  texts: RawTextFile[];
  registry?: { file: string; ids?: unknown; parseError?: string };
  /** Files in unexpected places (wrong extension or depth). */
  stray: string[];
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const rel = (p: string) => relative(process.cwd(), p).split(sep).join('/');

export function splitFrontmatter(raw: string): { fm: string; body: string } | undefined {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  return m ? { fm: m[1], body: m[2] } : undefined;
}

export function loadCorpus(root: string): RawCorpus {
  const corpus: RawCorpus = { root, records: [], texts: [], stray: [] };
  const recordsDir = join(root, 'records');
  const textDir = join(root, 'text');

  for (const full of walk(recordsDir)) {
    const segments = relative(recordsDir, full).split(sep);
    const raw = readFileSync(full, 'utf8');
    if (!full.endsWith('.yaml') || segments.length !== 2) {
      if (!full.endsWith('.gitkeep')) corpus.stray.push(rel(full));
      continue;
    }
    const entry: RawRecordFile = { file: rel(full), segments, raw };
    try {
      entry.data = parseYaml(raw);
    } catch (e) {
      entry.parseError = (e as Error).message;
    }
    corpus.records.push(entry);
  }

  for (const full of walk(textDir)) {
    const segments = relative(textDir, full).split(sep);
    const raw = readFileSync(full, 'utf8');
    if (!full.endsWith('.md') || segments.length !== 3) {
      if (!full.endsWith('.gitkeep')) corpus.stray.push(rel(full));
      continue;
    }
    const entry: RawTextFile = { file: rel(full), segments, raw, body: '' };
    const parts = splitFrontmatter(raw);
    if (!parts) {
      entry.parseError = 'missing YAML frontmatter delimited by ---';
    } else {
      entry.body = parts.body;
      try {
        entry.frontmatter = parseYaml(parts.fm);
      } catch (e) {
        entry.parseError = (e as Error).message;
      }
    }
    corpus.texts.push(entry);
  }

  const registryPath = join(root, 'published-ids.json');
  if (existsSync(registryPath)) {
    const registry: RawCorpus['registry'] = { file: rel(registryPath) };
    try {
      registry.ids = JSON.parse(readFileSync(registryPath, 'utf8'));
    } catch (e) {
      registry.parseError = (e as Error).message;
    }
    corpus.registry = registry;
  }
  return corpus;
}

/** Load several roots as one corpus (used to overlay negative-test cases on a base). */
export function mergeCorpora(parts: RawCorpus[]): RawCorpus {
  return {
    root: parts.map((p) => p.root).join('+'),
    records: parts.flatMap((p) => p.records),
    texts: parts.flatMap((p) => p.texts),
    // Later roots (overlays) take precedence.
    registry: [...parts].reverse().find((p) => p.registry)?.registry,
    stray: parts.flatMap((p) => p.stray),
  };
}
