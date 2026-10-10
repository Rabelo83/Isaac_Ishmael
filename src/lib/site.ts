// Build-time data access for pages.
import { getCollection, render, type CollectionEntry } from 'astro:content';
import { buildModeFromEnv } from './content/corpus.ts';
import { RECORD_TYPES, type Locale, type RecordType } from './content/constants.ts';
import type { ContentRecord, TextFrontmatter } from './content/schemas.ts';

export const MODE = buildModeFromEnv(process.env.SITE_MODE);

let recordList: Promise<ContentRecord[]> | undefined;
export function allRecords(): Promise<ContentRecord[]> {
  recordList ??= getCollection('records').then((entries) =>
    entries.map((e) => e.data as unknown as ContentRecord).sort((a, b) => a.id.localeCompare(b.id)),
  );
  return recordList;
}

export async function recordsOfType(type: RecordType): Promise<ContentRecord[]> {
  return (await allRecords()).filter((r) => r.type === type);
}

let textIndex: Promise<Map<string, CollectionEntry<'texts'>>> | undefined;
// A missing translation is an expected state outside production, so look texts up
// from the collection rather than via getEntry (which warns on misses).
const texts = () =>
  (textIndex ??= getCollection('texts').then((all) => new Map(all.map((e) => [e.id, e]))));

export async function textFor(locale: Locale, id: string) {
  const entry = (await texts()).get(`${locale}/${id}`);
  if (!entry) return undefined;
  const { Content } = await render(entry);
  return { fm: entry.data as unknown as TextFrontmatter, Content };
}

/** Title for links: this locale's text, otherwise the bare ID (never the other language). */
export async function titleFor(locale: Locale, id: string): Promise<string> {
  const entry = (await texts()).get(`${locale}/${id}`);
  return entry ? (entry.data as unknown as TextFrontmatter).title : id;
}

/**
 * Sections that get pages and navigation links. Production omits empty sections so
 * the public site never links to a page with nothing on it.
 */
export async function visibleTypes(): Promise<RecordType[]> {
  if (MODE !== 'production') return [...RECORD_TYPES];
  const present = new Set((await allRecords()).map((r) => r.type));
  return RECORD_TYPES.filter((t) => present.has(t));
}
