# Technical design (P2 proposal)

Status: proposal for Codex review and owner approval. Written 10 October 2026 by Claude Code. Nothing here is implemented. Labels: **[Requirement]** traces to the planning documents; **[Recommendation]** is a technical choice open to review; **[Open]** needs a decision (tracked in [DECISIONS.md](DECISIONS.md)).

## 1. Framework

**[Recommendation] Astro (static output), exact versions pinned at scaffold time.** On 10 October 2026, the npm registry reported `astro` 7.3.8 as the latest release and Node.js 24.21.0 as the latest LTS ("Krypton"). The official [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) uses `withastro/action@v6` (default Node 24) with `actions/deploy-pages@v5`. Re-check these versions when scaffolding.

Reasons:

- It outputs plain HTML with no client JavaScript by default, which suits GitHub Pages and long-form reading pages ([Requirement] static, no backend).
- Content collections validate records at build time against Zod schemas. Their typed `reference()` fields turn dangling IDs into build errors ([Requirement] dangling references cannot silently enter a release).
- `site` and `base` are first-class settings, so the `/Isaac_Ishmael/` subpath works.
- It has an official Pages deployment action.

Alternatives considered:

| Option | Why not chosen |
| --- | --- |
| Eleventy | Smaller, but it has no built-in schema or reference validation, so we would have to write all of that ourselves. |
| Hugo | Single binary and strong i18n, but weak data validation and Go templates make the integrity rules harder to maintain. |
| Next.js static export | Ships a React runtime and adds complexity this content site does not need. |

Tradeoffs: this requires a Node toolchain, which is **not installed locally** (see STATUS). Astro has moved quickly (6.0 to 7.x within 2026), so we pin exact versions, commit the lockfile, and upgrade deliberately.

Supporting tools: TypeScript; Pagefind for static bilingual search, since it indexes built HTML by `lang`; Vitest for validator unit tests; Playwright with `@axe-core/playwright` for route, keyboard, and accessibility checks. The first prototype uses no UI framework. Filters are vanilla TypeScript progressive enhancements over server-rendered lists. The map library is deferred until licensed geographic sources exist (P4).

## 2. Content model

### Layout

[Requirement] Evidence records stay separate from translations and from presentation code.

```
content/
  records/<collection>/<id>.yaml   # language-neutral facts: IDs, dates, relations, citations, status
  text/en/<collection>/<id>.md     # English title, summary, body, citation notes
  text/es/<collection>/<id>.md     # Spanish equivalent
fixtures/                          # SYNTHETIC ONLY; loaded only in fixture mode (see §5)
src/                               # presentation code
```

### Collections

`source`, `claim`, `event`, `place`, `actor`, `tradition` (a named textual tradition), `tradition_relation` (a genealogy edge), `legal_authority`, `comparison`, `proposal` (one file per proposal version), `response`, `map_layer`, `glossary_term`.

### Common record fields

| Field | Rule |
| --- | --- |
| `id` | Stable and immutable (see §4). |
| `evidence_category` | One of: `textual_tradition`, `contemporary_record`, `historical_reconstruction`, `party_position`, `legal`, `project_synthesis`. Rendered as a visible text label, never only as a color. |
| `review_status` | `lead`, `source_inspected`, `draft`, `reviewed`, or `published`. |
| `disputes[]` | Each entry gives `concerns` (authenticity, dating, translation, facts, interpretation, or legal_applicability) and citations. |
| `last_substantive_review`, `last_link_check` | Stored as separate ISO dates. |
| `related[]` | Typed references to other records. |
| `corrections[]` | Each entry has a date and a reference to a correction note in both languages. |
| `fixture` | Boolean. Must be `false` for anything that can be released. |

No field holds a numeric score or ranking ([Requirement]).

### Dates

`{ kind: exact | range | approximate | unknown, start?, end?, precision: day | month | year | decade | century, note_ref? }`.

Each endpoint is `{ year: positive integer, era: BCE | CE, month?, day? }`. Storing the era explicitly avoids the off-by-one errors that signed astronomical years invite. The validator rejects precision finer than the fields supplied, and rejects ranges where the end precedes the start.

### Sources

| Field | Rule |
| --- | --- |
| Identity | `id`, `title`, `title_original?`, `creators[]` (author or issuing body), `doc_type`. |
| Publication | `date`, `edition_version?`, `original_language` (BCP 47). |
| `links[]` | Each link has `{ url, kind: official_landing \| direct_document \| catalog \| archive \| open_version \| translation, language, translation_status?: official \| unofficial \| project }`. |
| Access | `doi?`, `accessed_on`, `access_status` (open, paywalled, catalog_only, unavailable, or archived). |
| Reuse | `reuse` (`link_only`, a license identifier, or `permission_on_file`). |
| `inspection` | `full_text`, `excerpt_only`, or `metadata_only`. This prevents implying that a source was read when only its metadata was seen ([Requirement]). |

### Citations

A citation joins one assertion to one source passage ([Requirement]). Citations are declared on the record:

`{ id, source: ref(source), locator: { type: page | paragraph | article | verse | section | archival | timestamp | other, value }, relationship: supports | qualifies | contradicts | contextualizes, inspected_on }`

Each language file must give, for every citation ID, a note on what the source establishes and its limits. In prose, the assertion carries an inline marker `:cite[cit-id]` (a remark directive). Each marker renders as a link to the source detail, keeping the locator and limitation visible.

### Type-specific fields

| Record | Required fields |
| --- | --- |
| `legal_authority` | Forum, jurisdiction, parties, question presented, instrument type, procedural stage, relevant date, applicable law, operative result, reasoning reference, remedies, binding scope, separate opinions[], subsequent treatment[]. Text sections keep submissions, findings, and applicability analysis apart. |
| `comparison` | Authorities compared, narrow question, similarities, differences, temporal and jurisdictional limits, contrary authorities, and an inclusion decision (`retained` or `rejected` with reason). |
| `proposal` | `proposal_id` plus `version`, proposer, participants, mediator, date, document status, and a `topics` map. Each topic is `addressed` (with citations), `not_addressed`, or `not_established`, three distinct states ([Requirement]). Signature, ratification, adoption, implementation, suspension, and abandonment are recorded as separate dated events. |
| `response` | Actor, proposal version, date, `timing: contemporary \| retrospective`, conditions and reservations, citations. Silence is never stored as rejection. |
| `tradition_relation` | Two parties, tradition, relationship type, `assertion: asserted_in_tradition \| historically_corroborated`, citations. Conflicting traditions stay as separate edges and are never merged. |
| `map_layer` | Date interval, extent, `semantics` (administrative, claimed, armistice, military_control, settlement, ownership, or other), legend, provenance, reuse license, uncertainty note, and a required text-alternative reference. |

## 3. English and Spanish handling

- [Requirement] Every public record needs both languages. The build fails if either text file is missing for a releasable record, or if the two files reference different citation sets.
- Each text file carries `translation_status`, which is `original`, `project_translation_draft`, or `project_translation_reviewed`, along with `reviewed_by` and `reviewed_on`. A record is releasable only when both languages are `original` or `reviewed`. There is no silent fallback to the other language. Astro's i18n `fallback` stays disabled.
- Original-language terms and quotations are stored in record-level `original_terms[]`, so both languages show identical originals. Unofficial and project translations are labeled in the UI.
- Every page sets `<html lang>`, inline `lang` attributes on original-language quotations, and `hreflang` alternate links.
- UI strings live in one dictionary per locale. A unit test checks that both dictionaries have the same keys.

## 4. Stable IDs and URLs

- ID format: `<prefix>-<ascii-slug>`, for example `src-…`, `clm-…`, or `law-…`, with lowercase `[a-z0-9-]`. The ID is assigned once and never changes or gets reused. A `published-ids.json` registry is committed. The validator fails if a published ID disappears without a `withdrawn` tombstone or an alias.
- URLs use localized section names with the same ID in both languages:
  - `/Isaac_Ishmael/en/claims/<id>/`
  - `/Isaac_Ishmael/es/afirmaciones/<id>/`

  A single route table maps each section between languages, so the language switch always lands on the corresponding record.
- Filter state lives in the query string using language-neutral codes, such as `?period=…&category=legal`. The language switch carries the query string across.
- Renamed IDs (pre-publication only) and section aliases generate static redirect pages. Withdrawn records keep a tombstone page that explains the withdrawal.

## 5. Routing, drafts, and build modes

- `site: "https://rabelo83.github.io"`, `base: "/Isaac_Ishmael"`, `trailingSlash: "always"`, and `build.format: "directory"`. Every route is prerendered to `…/index.html`, so direct navigation and refresh work on Pages without SPA tricks ([Requirement]). All internal links go through one `url()` helper that applies `base`.
- Locales are `en` and `es`, both prefixed. The root `/Isaac_Ishmael/` is a static bilingual landing page with links to both languages. It does not redirect on `Accept-Language`, so it works without JavaScript and does not surprise readers. A bilingual `404.html` is included.
- `SITE_MODE` selects the build mode:

  | Mode | Includes |
  | --- | --- |
  | `production` | `review_status: published`, `fixture: false`, both translations releasable |
  | `preview` | Adds drafts, each with a visible "Draft – not reviewed" banner and `noindex` |
  | `fixtures` | Loads only `fixtures/` |

  CI fails a production build if `dist/` contains the token `SYNTHETIC-FIXTURE` or any ID not in `published` status.
- **[Open]** Production builds exclude drafts, but the repository is public, so committed drafts are readable on GitHub. See D-07.

## 6. Accessibility

Target: WCAG 2.2 AA.

- Use semantic landmarks, a skip link, a logical heading order, visible focus, and full keyboard operation.
- Respect `prefers-reduced-motion`. Contrast is checked in both themes, and evidence categories and statuses use text labels, not color alone.
- The timeline's canonical form is an ordered list, and filters enhance it. Each map layer requires a text alternative and a data table before it can be released.
- Checks: axe on every route template in Playwright, a scripted keyboard walk through the core path, and a manual screen-reader spot check before release.

## 7. Validation, testing, and deployment

| Check | Tool | When it runs | Blocking? |
| --- | --- | --- | --- |
| Schemas and references | Zod, run during the Astro build | PR and main | yes |
| Integrity rules: citations on published records, citation-ID parity across languages, every `:cite[]` resolves, ID registry, date sanity, fixture and draft exclusion | Custom `validate` script, with Vitest unit tests | PR and main | yes |
| Production build and dist scan | `astro build` plus a script | PR and main | yes |
| Routes under base, direct refresh, language switch, keyboard, axe, mobile viewport | Playwright against `dist/` served at `/Isaac_Ishmael/` | PR and main | yes |
| External link health | Scheduled link checker | Weekly | Report only. A working link does not verify a claim ([Requirement]). |

**Deployment.** Pages source is set to "GitHub Actions". A deploy workflow runs on `main` and on manual dispatch, and uses the `github-pages` environment with a protection rule restricted to the default branch. The deploy workflow is added only once the owner authorizes publication (P5). Before that, CI builds and tests but does not deploy.

## 8. Dependency on the research sample

[Requirement] P1 provides three reviewed bilingual dossiers and a source register. **As of 10 October 2026, these are absent.** The schemas above come from the standards documents and must be re-tested against the real sample before the prototype's acceptance (P3). Until then, development uses only `fixtures/`, with synthetic records marked `fixture: true`, the `SYNTHETIC-FIXTURE` token, and obviously fictional names such as "Example Source A". No real historical claims, sources, or quotations go in fixtures.
