// Structural schemas. Cross-record rules (references, status requirements,
// translation parity) live in validate.ts because they need the whole corpus.
import { z } from 'astro/zod';
import {
  ACCESS_STATUSES,
  ACTOR_KINDS,
  CITATION_RELATIONSHIPS,
  DATE_PRECISIONS,
  DISPUTE_CONCERNS,
  EVIDENCE_CATEGORIES,
  INSPECTION_LEVELS,
  INSTRUMENT_TYPES,
  LINK_KINDS,
  LINK_TRANSLATION_STATUSES,
  LOCALES,
  LOCATOR_TYPES,
  PROPOSAL_MILESTONES,
  PROPOSAL_TOPICS,
  RESPONSE_TIMINGS,
  REVIEW_STATUSES,
  TRANSLATION_STATUSES,
} from './constants.ts';

const slug = '[a-z0-9]+(?:-[a-z0-9]+)*';
export const recordIdPattern = new RegExp(`^[a-z]{3}-${slug}$`);
export const citationIdPattern = new RegExp(`^cit-${slug}$`);

const recordId = z.string().regex(recordIdPattern, 'expected "<prefix>-<lowercase-slug>"');
const citationId = z.string().regex(citationIdPattern, 'expected "cit-<lowercase-slug>"');
const isoDate = z.iso.date();
const reason = z.string().trim().min(1);
/** BCP 47 tag, loosely checked (e.g. "en", "he", "ar", "es-419"). */
const languageTag = z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/);
/** Displayed explanatory text: one string, or one string per site language. */
export const localizedText = z.union([
  z.string().trim().min(1),
  z.strictObject(Object.fromEntries(LOCALES.map((l) => [l, z.string().trim().min(1)])) as Record<(typeof LOCALES)[number], z.ZodString>),
]);
export type LocalizedText = z.infer<typeof localizedText>;

/** A field that may be inapplicable to some record subtypes, with a stated reason. */
const applicable = <T extends z.ZodType>(inner: T) =>
  z.union([inner, z.strictObject({ not_applicable: reason })]);

// ---- dates -------------------------------------------------------------

export const dateEndpoint = z.strictObject({
  year: z.number().int().positive(),
  era: z.enum(['BCE', 'CE']),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
});
export type DateEndpoint = z.infer<typeof dateEndpoint>;

const precision = z.enum(DATE_PRECISIONS);

export const dateValue = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('exact'), date: dateEndpoint, precision }),
  z.strictObject({ kind: z.literal('approximate'), date: dateEndpoint, precision }),
  z.strictObject({ kind: z.literal('range'), start: dateEndpoint, end: dateEndpoint, precision }),
  // Unknown dates carry no fabricated precision.
  z.strictObject({ kind: z.literal('unknown') }),
]);
export type DateValue = z.infer<typeof dateValue>;

// ---- shared parts ------------------------------------------------------

export const locator = z.union([
  z.strictObject({ type: z.enum(LOCATOR_TYPES), value: z.string().trim().min(1) }),
  // For sources without pagination or stable sections. Never invent a locator.
  z.strictObject({ unavailable: localizedText }),
]);

export const citation = z.strictObject({
  id: citationId,
  source: recordId,
  locator,
  relationship: z.enum(CITATION_RELATIONSHIPS),
  inspected_on: isoDate.optional(),
});
export type Citation = z.infer<typeof citation>;

export const link = z.strictObject({
  url: z.url({ protocol: /^https?$/ }),
  kind: z.enum(LINK_KINDS),
  language: languageTag,
  translation_status: z.enum(LINK_TRANSLATION_STATUSES).optional(),
});

const common = {
  id: recordId,
  review_status: z.enum(REVIEW_STATUSES),
  fixture: z.boolean(),
  last_substantive_review: isoDate.optional(),
  last_link_check: isoDate.optional(),
  related: z.array(z.strictObject({ id: recordId, relation: z.string().min(1) })).default([]),
  corrections: z.array(z.strictObject({ id: z.string().min(1), date: isoDate })).default([]),
  citations: z.array(citation).default([]),
};

const evidential = {
  evidence_category: z.enum(EVIDENCE_CATEGORIES),
  disputes: z
    .array(
      z.strictObject({
        concerns: z.array(z.enum(DISPUTE_CONCERNS)).min(1),
        citations: z.array(citationId).min(1),
      }),
    )
    .default([]),
};

// ---- record types ------------------------------------------------------

export const sourceRecord = z.strictObject({
  ...common,
  type: z.literal('source'),
  title: z.string().trim().min(1),
  title_original: z.string().trim().min(1).optional(),
  creators: z
    .array(
      z.strictObject({
        name: z.string().trim().min(1),
        role: z.enum(['author', 'issuer', 'editor', 'translator']),
      }),
    )
    .min(1),
  doc_type: z.string().trim().min(1),
  date: dateValue,
  edition_version: localizedText.optional(),
  original_language: languageTag,
  links: z.array(link).default([]),
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
  accessed_on: isoDate.optional(),
  access_status: z.enum(ACCESS_STATUSES),
  inspection: z.enum(INSPECTION_LEVELS),
  reuse: z.string().trim().min(1),
});

export const actorRecord = z.strictObject({
  ...common,
  type: z.literal('actor'),
  name_original: z.string().trim().min(1).optional(),
  kind: z.enum(ACTOR_KINDS),
  // Provenance: official/authority pages and/or citations to other sources.
  authority_links: z.array(link).default([]),
});

export const claimRecord = z.strictObject({
  ...common,
  ...evidential,
  type: z.literal('claim'),
  date: dateValue.optional(),
  actors: z.array(recordId).default([]),
});

export const eventRecord = z.strictObject({
  ...common,
  ...evidential,
  type: z.literal('event'),
  date: dateValue,
  actors: z.array(recordId).default([]),
});

export const legalAuthorityRecord = z.strictObject({
  ...common,
  ...evidential,
  type: z.literal('legal_authority'),
  instrument_type: z.enum(INSTRUMENT_TYPES),
  issuing_body: recordId,
  date: dateValue,
  forum: applicable(recordId),
  procedural_stage: applicable(
    z.enum([
      'provisional_measures',
      'preliminary_objections',
      'merits',
      'advisory',
      'interpretation',
      'revision',
      'other',
    ]),
  ),
  parties: applicable(z.array(recordId).min(1)),
  binding_scope: applicable(
    z.enum([
      'parties_and_case',
      'non_binding_advisory',
      'binding_on_states_parties',
      'recommendatory',
      'other',
    ]),
  ),
  separate_opinions: applicable(
    z.array(
      z.strictObject({
        author: z.string().trim().min(1),
        kind: z.enum(['separate', 'dissenting', 'declaration']),
        citation: citationId,
      }),
    ),
  ),
  subsequent_treatment: z
    .array(z.strictObject({ id: z.string().min(1), date: dateValue, citation: citationId }))
    .default([]),
});

const topicStatus = z.discriminatedUnion('state', [
  z.strictObject({ state: z.literal('addressed'), citations: z.array(citationId).min(1) }),
  z.strictObject({ state: z.literal('not_addressed'), citations: z.array(citationId).default([]) }),
  z.strictObject({ state: z.literal('not_established') }),
]);

export const proposalRecord = z.strictObject({
  ...common,
  ...evidential,
  type: z.literal('proposal'),
  proposal_id: z.string().regex(new RegExp(`^${slug}$`)),
  version: z.string().trim().min(1),
  proposers: z.array(recordId).min(1),
  participants: z.array(recordId).default([]),
  mediators: z.array(recordId).default([]),
  date: dateValue,
  document_status: z.enum(['draft_text', 'published_text', 'signed_text', 'other']),
  topics: z.strictObject(
    Object.fromEntries(PROPOSAL_TOPICS.map((t) => [t, topicStatus])) as Record<
      (typeof PROPOSAL_TOPICS)[number],
      typeof topicStatus
    >,
  ),
  milestones: z
    .array(
      z.strictObject({
        kind: z.enum(PROPOSAL_MILESTONES),
        date: dateValue,
        citations: z.array(citationId).min(1),
      }),
    )
    .default([]),
});

export const responseRecord = z.strictObject({
  ...common,
  ...evidential,
  type: z.literal('response'),
  actor: recordId,
  proposal: recordId,
  date: dateValue,
  timing: z.enum(RESPONSE_TIMINGS),
  // No "silence" value: absence of a documented response is not a response.
  position: z.enum(['accepted', 'accepted_with_reservations', 'conditional', 'rejected', 'other']),
});

export const recordSchema = z.discriminatedUnion('type', [
  sourceRecord,
  actorRecord,
  claimRecord,
  eventRecord,
  legalAuthorityRecord,
  proposalRecord,
  responseRecord,
]);
export type ContentRecord = z.infer<typeof recordSchema>;

// ---- per-language text ---------------------------------------------------

export const textFrontmatter = z.strictObject({
  id: recordId,
  lang: z.enum(LOCALES),
  translation_status: z.enum(TRANSLATION_STATUSES),
  reviewed_by: z.string().optional(),
  reviewed_on: isoDate.optional(),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  /** What each citation establishes and its limits, keyed by citation ID. */
  citation_notes: z.record(citationId, z.string().trim().min(1)).default({}),
  correction_notes: z.record(z.string(), z.string().trim().min(1)).default({}),
});
export type TextFrontmatter = z.infer<typeof textFrontmatter>;
