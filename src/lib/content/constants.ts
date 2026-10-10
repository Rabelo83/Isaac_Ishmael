// Shared vocabularies. Schemas, filters, UI labels, and docs must use these
// exact values; see docs/TECHNICAL_DESIGN.md §2–3.

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/** Record types implemented in Task 002. Others are reserved (see RESERVED_TYPES). */
export const RECORD_TYPES = [
  'source',
  'actor',
  'claim',
  'event',
  'legal_authority',
  'proposal',
  'response',
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

/** Designed but not yet implemented; records of these types are rejected. */
export const RESERVED_TYPES = [
  'place',
  'tradition',
  'tradition_relation',
  'comparison',
  'map_layer',
  'glossary_term',
] as const;

export const ID_PREFIX: Record<RecordType, string> = {
  source: 'src',
  actor: 'act',
  claim: 'clm',
  event: 'evt',
  legal_authority: 'law',
  proposal: 'prp',
  response: 'rsp',
};

/** Types whose reviewed/published records must carry at least one citation. */
export const CITING_TYPES: readonly RecordType[] = [
  'claim',
  'event',
  'legal_authority',
  'proposal',
  'response',
];

export const REVIEW_STATUSES = [
  'lead',
  'source_inspected',
  'draft',
  'reviewed',
  'published',
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const EVIDENCE_CATEGORIES = [
  'textual_tradition',
  'contemporary_record',
  'historical_reconstruction',
  'party_position',
  'legal',
  'project_synthesis',
] as const;

export const TRANSLATION_STATUSES = [
  'original',
  'project_translation_draft',
  'project_translation_reviewed',
] as const;
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number];
export const RELEASABLE_TRANSLATION_STATUSES: readonly TranslationStatus[] = [
  'original',
  'project_translation_reviewed',
];

export const DISPUTE_CONCERNS = [
  'authenticity',
  'dating',
  'translation',
  'facts',
  'interpretation',
  'legal_applicability',
] as const;

export const CITATION_RELATIONSHIPS = [
  'supports',
  'qualifies',
  'contradicts',
  'contextualizes',
] as const;

export const LOCATOR_TYPES = [
  'page',
  'paragraph',
  'article',
  'verse',
  'section',
  'archival',
  'timestamp',
  'other',
] as const;

export const ACCESS_STATUSES = [
  'open',
  'paywalled',
  'catalog_only',
  'unavailable',
  'archived',
] as const;

export const INSPECTION_LEVELS = ['full_text', 'excerpt_only', 'metadata_only'] as const;

export const LINK_KINDS = [
  'official_landing',
  'direct_document',
  'catalog',
  'archive',
  'open_version',
  'translation',
] as const;

export const LINK_TRANSLATION_STATUSES = ['official', 'unofficial', 'project'] as const;

export const ACTOR_KINDS = [
  'government',
  'political_organization',
  'international_body',
  'court',
  'mediator',
  'civil_society',
  'community',
  'person',
  'other',
] as const;

export const INSTRUMENT_TYPES = [
  'judgment',
  'advisory_opinion',
  'provisional_measures_order',
  'other_judicial_decision',
  'treaty',
  'resolution',
  'statute',
  'other_instrument',
] as const;
export const JUDICIAL_INSTRUMENT_TYPES: readonly string[] = [
  'judgment',
  'advisory_opinion',
  'provisional_measures_order',
  'other_judicial_decision',
];

export const PROPOSAL_TOPICS = [
  'borders',
  'sovereignty',
  'recognition',
  'security',
  'jerusalem_holy_sites',
  'settlements',
  'refugees',
  'property_restitution_compensation',
  'citizenship_equality',
  'resources',
  'economic_arrangements',
  'implementation_guarantees',
] as const;

export const PROPOSAL_MILESTONES = [
  'signature',
  'ratification',
  'adoption',
  'implementation',
  'suspension',
  'abandonment',
] as const;

export const RESPONSE_TIMINGS = ['contemporary', 'retrospective'] as const;

export const DATE_PRECISIONS = ['day', 'month', 'year', 'decade', 'century'] as const;

/** Every synthetic fixture must carry this token; production output must never contain it. */
export const FIXTURE_TOKEN = 'SYNTHETIC-FIXTURE';

export const BUILD_MODES = ['production', 'preview', 'fixtures'] as const;
export type BuildMode = (typeof BUILD_MODES)[number];
