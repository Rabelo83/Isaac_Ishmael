// Corpus-level validation. Checks are mechanical: they prove that markers,
// references, statuses, and translations are structurally consistent. They do
// not prove that an assertion is true or adequately supported, nor that two
// translations are equivalent in meaning; those remain editorial review steps.
import {
  CITING_TYPES,
  FIXTURE_TOKEN,
  ID_PREFIX,
  JUDICIAL_INSTRUMENT_TYPES,
  LOCALES,
  RELEASABLE_TRANSLATION_STATUSES,
  RESERVED_TYPES,
  type Locale,
  type RecordType,
} from './constants.ts';
import { checkDate } from './dates.ts';
import type { RawCorpus } from './load.ts';
import { recordSchema, textFrontmatter, type ContentRecord, type DateValue, type TextFrontmatter } from './schemas.ts';
import { isReleasable } from './select.ts';

export type RootKind = 'content' | 'fixtures';

export interface Issue {
  code: string;
  file: string;
  message: string;
}

export interface TextEntry {
  file: string;
  fm: TextFrontmatter;
  body: string;
}

export interface Corpus {
  records: Map<string, { file: string; record: ContentRecord }>;
  /** Keyed by `${lang}:${id}`. */
  texts: Map<string, TextEntry>;
}

export const textKey = (lang: Locale, id: string) => `${lang}:${id}`;

const CITE_MARKER = /:cite\[([^\]]*)\]/g;
export function citeMarkers(body: string): string[] {
  return [...body.matchAll(CITE_MARKER)].map((m) => m[1].trim());
}

/** Every record ID a record points to, with the field it came from and the required target type. */
export function referencesOf(r: ContentRecord): { field: string; id: string; type?: RecordType }[] {
  const refs: { field: string; id: string; type?: RecordType }[] = [];
  for (const c of r.citations) refs.push({ field: `citations[${c.id}].source`, id: c.source, type: 'source' });
  for (const rel of r.related) refs.push({ field: 'related', id: rel.id });
  const value = <T>(f: T | { not_applicable: string }): T | undefined =>
    f && typeof f === 'object' && 'not_applicable' in f ? undefined : (f as T);
  switch (r.type) {
    case 'claim':
    case 'event':
      for (const a of r.actors) refs.push({ field: 'actors', id: a, type: 'actor' });
      break;
    case 'legal_authority': {
      refs.push({ field: 'issuing_body', id: r.issuing_body, type: 'actor' });
      const forum = value(r.forum);
      if (forum) refs.push({ field: 'forum', id: forum, type: 'actor' });
      for (const p of value(r.parties) ?? []) refs.push({ field: 'parties', id: p, type: 'actor' });
      break;
    }
    case 'proposal':
      for (const [field, ids] of [
        ['proposers', r.proposers],
        ['participants', r.participants],
        ['mediators', r.mediators],
      ] as const) {
        for (const a of ids) refs.push({ field, id: a, type: 'actor' });
      }
      break;
    case 'response':
      refs.push({ field: 'actor', id: r.actor, type: 'actor' });
      refs.push({ field: 'proposal', id: r.proposal, type: 'proposal' });
      break;
  }
  return refs;
}

/** Citation IDs used inside structured fields (disputes, topics, milestones, opinions). */
function internalCitationUses(r: ContentRecord): { field: string; id: string }[] {
  const uses: { field: string; id: string }[] = [];
  if ('disputes' in r) r.disputes.forEach((d, i) => d.citations.forEach((id) => uses.push({ field: `disputes[${i}]`, id })));
  if (r.type === 'proposal') {
    for (const [topic, s] of Object.entries(r.topics)) {
      if ('citations' in s) s.citations.forEach((id) => uses.push({ field: `topics.${topic}`, id }));
    }
    r.milestones.forEach((m, i) => m.citations.forEach((id) => uses.push({ field: `milestones[${i}]`, id })));
  }
  if (r.type === 'legal_authority') {
    if (Array.isArray(r.separate_opinions)) {
      r.separate_opinions.forEach((o, i) => uses.push({ field: `separate_opinions[${i}]`, id: o.citation }));
    }
    r.subsequent_treatment.forEach((t, i) => uses.push({ field: `subsequent_treatment[${i}]`, id: t.citation }));
  }
  return uses;
}

function datesOf(r: ContentRecord): { field: string; value: DateValue }[] {
  const out: { field: string; value: DateValue }[] = [];
  if ('date' in r && r.date) out.push({ field: 'date', value: r.date });
  if (r.type === 'proposal') r.milestones.forEach((m, i) => out.push({ field: `milestones[${i}].date`, value: m.date }));
  if (r.type === 'legal_authority') {
    r.subsequent_treatment.forEach((t, i) => out.push({ field: `subsequent_treatment[${i}].date`, value: t.date }));
  }
  return out;
}

const formatZod = (error: { issues: { path: PropertyKey[]; message: string }[] }) =>
  error.issues.map((i) => `${i.path.map(String).join('.') || '(root)'}: ${i.message}`).join('; ');

export function validateCorpus(raw: RawCorpus, rootKind: RootKind): { corpus: Corpus; issues: Issue[] } {
  const issues: Issue[] = [];
  const add = (code: string, file: string, message: string) => issues.push({ code, file, message });
  const corpus: Corpus = { records: new Map(), texts: new Map() };
  // IDs and text keys that failed to parse. Their own issue is already reported, so
  // follow-on issues (orphaned texts, missing translations, dangling refs) are suppressed.
  const unparsed = new Set<string>();
  const idOf = (data: unknown) => {
    const id = (data as { id?: unknown } | null)?.id;
    return typeof id === 'string' ? id : undefined;
  };

  for (const f of raw.stray) add('STRAY_FILE', f, 'file is not in records/<type>/<id>.yaml or text/<lang>/<type>/<id>.md');

  // ---- parse records ----
  for (const f of raw.records) {
    if (f.parseError) {
      add('PARSE_ERROR', f.file, f.parseError);
      continue;
    }
    const [dirType, fileName] = f.segments;
    const declaredType = (f.data as { type?: unknown } | null)?.type;
    if ((RESERVED_TYPES as readonly unknown[]).includes(declaredType)) {
      add('TYPE_NOT_IMPLEMENTED', f.file, `record type "${String(declaredType)}" is designed but not implemented yet`);
      unparsed.add(idOf(f.data) ?? '');
      continue;
    }
    const parsed = recordSchema.safeParse(f.data);
    if (!parsed.success) {
      add('SCHEMA', f.file, formatZod(parsed.error));
      unparsed.add(idOf(f.data) ?? '');
      continue;
    }
    const r = parsed.data;
    if (dirType !== r.type) add('TYPE_DIRECTORY', f.file, `type "${r.type}" must live in records/${r.type}/`);
    if (fileName !== `${r.id}.yaml`) add('FILENAME_MISMATCH', f.file, `file name must be ${r.id}.yaml`);
    if (!r.id.startsWith(`${ID_PREFIX[r.type]}-`)) {
      add('ID_PREFIX', f.file, `${r.type} IDs must start with "${ID_PREFIX[r.type]}-"`);
    }
    if (corpus.records.has(r.id)) {
      add('DUPLICATE_ID', f.file, `ID ${r.id} already defined in ${corpus.records.get(r.id)!.file}`);
      continue;
    }
    corpus.records.set(r.id, { file: f.file, record: r });
  }

  // ---- parse texts ----
  for (const f of raw.texts) {
    if (f.parseError) {
      add('PARSE_ERROR', f.file, f.parseError);
      continue;
    }
    const parsed = textFrontmatter.safeParse(f.frontmatter);
    if (!parsed.success) {
      add('SCHEMA', f.file, formatZod(parsed.error));
      const fmRaw = f.frontmatter as { id?: unknown; lang?: unknown } | null;
      if (typeof fmRaw?.id === 'string') unparsed.add(`${String(fmRaw.lang)}:${fmRaw.id}`);
      continue;
    }
    const fm = parsed.data;
    const [dirLang, dirType, fileName] = f.segments;
    if (dirLang !== fm.lang) add('TEXT_LANG', f.file, `lang "${fm.lang}" must live in text/${fm.lang}/`);
    if (fileName !== `${fm.id}.md`) add('FILENAME_MISMATCH', f.file, `file name must be ${fm.id}.md`);
    const owner = corpus.records.get(fm.id);
    if (!owner) {
      if (!unparsed.has(fm.id)) add('TEXT_ORPHAN', f.file, `no record with ID ${fm.id}`);
      continue;
    }
    if (dirType !== owner.record.type) add('TYPE_DIRECTORY', f.file, `text for a ${owner.record.type} must live in text/${fm.lang}/${owner.record.type}/`);
    const key = textKey(fm.lang, fm.id);
    if (corpus.texts.has(key)) {
      add('DUPLICATE_ID', f.file, `second ${fm.lang} text for ${fm.id}`);
      continue;
    }
    if (fm.translation_status === 'project_translation_reviewed' && (!fm.reviewed_by || !fm.reviewed_on)) {
      add('TRANSLATION_REVIEW_METADATA', f.file, 'project_translation_reviewed requires reviewed_by and reviewed_on');
    }
    corpus.texts.set(key, { file: f.file, fm, body: f.body });
  }

  // ---- per-record rules ----
  for (const { file, record: r } of corpus.records.values()) {
    const reviewed = r.review_status === 'reviewed' || r.review_status === 'published';
    const published = r.review_status === 'published';

    // References: checked explicitly against the loaded corpus.
    for (const ref of referencesOf(r)) {
      const target = corpus.records.get(ref.id);
      if (!target) {
        if (!unparsed.has(ref.id)) add('DANGLING_REF', file, `${ref.field} → ${ref.id} does not exist`);
        continue;
      }
      if (ref.type && target.record.type !== ref.type) {
        add('REF_WRONG_TYPE', file, `${ref.field} → ${ref.id} is a ${target.record.type}, expected ${ref.type}`);
      }
      if (published && target.record.review_status !== 'published') {
        add('PUBLISHED_REF_UNPUBLISHED', file, `published record references ${ref.id} (${target.record.review_status})`);
      }
      if (ref.id === r.id) add('SELF_REFERENCE', file, `${ref.field} points to the record itself`);
    }

    // Citations.
    const citationIds = new Set<string>();
    for (const c of r.citations) {
      if (citationIds.has(c.id)) add('DUPLICATE_CITATION_ID', file, `citation ${c.id} repeated`);
      citationIds.add(c.id);
      if (reviewed && !c.inspected_on) add('CITATION_NOT_INSPECTED', file, `${c.id} needs inspected_on at status ${r.review_status}`);
    }
    for (const use of internalCitationUses(r)) {
      if (!citationIds.has(use.id)) add('UNKNOWN_CITATION', file, `${use.field} uses ${use.id}, which is not in citations`);
    }
    if (reviewed && CITING_TYPES.includes(r.type) && r.citations.length === 0) {
      add('MISSING_CITATIONS', file, `${r.type} at status ${r.review_status} requires at least one citation`);
    }

    // Provenance for non-citing types (no circular self-citation required).
    if (reviewed && r.type === 'source' && r.links.length === 0 && !r.doi) {
      add('SOURCE_NO_ACCESS_POINT', file, 'reviewed sources need at least one link or a DOI');
    }
    if (reviewed && r.type === 'source' && !r.accessed_on) {
      add('SOURCE_NO_ACCESS_DATE', file, 'reviewed sources need accessed_on');
    }
    if (reviewed && r.type === 'actor' && r.authority_links.length === 0 && r.citations.length === 0) {
      add('ACTOR_NO_PROVENANCE', file, 'reviewed actors need authority_links or citations');
    }

    // Court-specific fields: required for judicial instruments; others may state not_applicable.
    if (r.type === 'legal_authority' && JUDICIAL_INSTRUMENT_TYPES.includes(r.instrument_type)) {
      for (const field of ['forum', 'procedural_stage'] as const) {
        if (typeof r[field] === 'object' && r[field] !== null && 'not_applicable' in r[field]) {
          add('JUDICIAL_FIELD_REQUIRED', file, `${field} cannot be not_applicable for ${r.instrument_type}`);
        }
      }
    }

    if (reviewed && !r.last_substantive_review) {
      add('REVIEW_DATE_MISSING', file, `status ${r.review_status} requires last_substantive_review`);
    }

    for (const d of datesOf(r)) {
      for (const p of checkDate(d.value)) add('DATE_INVALID', file, `${d.field}: ${p}`);
    }

    // Translations.
    const texts = LOCALES.map((l) => corpus.texts.get(textKey(l, r.id)));
    if (published) {
      LOCALES.forEach((l, i) => {
        if (!texts[i] && !unparsed.has(textKey(l, r.id))) add('TRANSLATION_MISSING', file, `published record has no ${l} text`);
      });
    }
    for (const t of texts) {
      if (!t) continue;
      const markers = citeMarkers(t.body);
      for (const m of markers) {
        if (!citationIds.has(m)) add('CITE_MARKER_UNKNOWN', t.file, `:cite[${m}] is not a citation of ${r.id}`);
      }
      for (const c of citationIds) {
        if (!(c in t.fm.citation_notes)) add('CITATION_NOTE_MISSING', t.file, `no note for ${c}`);
      }
      for (const c of Object.keys(t.fm.citation_notes)) {
        if (!citationIds.has(c)) add('CITATION_NOTE_UNKNOWN', t.file, `note for unknown citation ${c}`);
      }
      for (const corr of r.corrections) {
        if (!(corr.id in t.fm.correction_notes)) add('CORRECTION_NOTE_MISSING', t.file, `no note for correction ${corr.id}`);
      }
    }
    if (texts[0] && texts[1]) {
      const a = new Set(citeMarkers(texts[0].body));
      const b = new Set(citeMarkers(texts[1].body));
      const diff = [...a].filter((x) => !b.has(x)).concat([...b].filter((x) => !a.has(x)));
      if (diff.length) add('CITE_MARKER_PARITY', file, `citations used in only one language: ${diff.join(', ')}`);
    }
    if (published) {
      for (const t of texts) {
        if (t && !RELEASABLE_TRANSLATION_STATUSES.includes(t.fm.translation_status)) {
          add('TRANSLATION_NOT_RELEASABLE', t.file, `published record has ${t.fm.lang} text at ${t.fm.translation_status}`);
        }
      }
    }

    // Fixture isolation.
    if (rootKind === 'content') {
      if (r.fixture) add('FIXTURE_IN_CONTENT', file, 'fixture records belong under fixtures/, never content/');
    } else {
      if (isReleasable(r, texts)) {
        add('FIXTURE_ROOT_RELEASABLE', file, 'records under fixtures/ must never pass the production filter');
      }
      if (r.type === 'source' && !r.title.includes(FIXTURE_TOKEN)) {
        add('FIXTURE_TOKEN_MISSING', file, `source title must contain ${FIXTURE_TOKEN}`);
      }
      for (const t of texts) {
        if (t && !t.fm.title.includes(FIXTURE_TOKEN)) add('FIXTURE_TOKEN_MISSING', t.file, `title must contain ${FIXTURE_TOKEN}`);
      }
    }
  }

  if (rootKind === 'content') {
    for (const f of [...raw.records, ...raw.texts]) {
      if (f.raw.includes(FIXTURE_TOKEN)) add('FIXTURE_IN_CONTENT', f.file, `contains ${FIXTURE_TOKEN}`);
    }
  }

  // ---- published-ID registry ----
  if (raw.registry) {
    const { file, ids, parseError } = raw.registry;
    if (parseError || !Array.isArray(ids) || !ids.every((x) => typeof x === 'string')) {
      add('REGISTRY_INVALID', file, parseError ?? 'expected a JSON array of ID strings');
    } else {
      const registered = new Set(ids as string[]);
      for (const id of registered) {
        const entry = corpus.records.get(id);
        if (!entry) add('PUBLISHED_ID_REMOVED', file, `${id} was published and must not disappear`);
        else if (entry.record.review_status !== 'published') {
          add('PUBLISHED_ID_REMOVED', file, `${id} was published but is now ${entry.record.review_status}`);
        }
      }
      for (const { file: rf, record } of corpus.records.values()) {
        if (record.review_status === 'published' && !record.fixture && !registered.has(record.id)) {
          add('PUBLISHED_ID_UNREGISTERED', rf, `add ${record.id} to ${file}`);
        }
      }
    }
  } else if (rootKind === 'content') {
    add('REGISTRY_INVALID', `${raw.root}/published-ids.json`, 'content root needs a published-ids.json registry');
  }

  // Keep a stable order for readable output and deterministic tests.
  issues.sort((a, b) => a.file.localeCompare(b.file) || a.code.localeCompare(b.code));
  return { corpus, issues };
}
