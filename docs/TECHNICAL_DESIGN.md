# Technical design (P2)

Status: Astro direction approved by Codex on 10 October 2026, with corrections ([review](tasks/002-codex-review.md)). The approval still has to be tested against the P1 research sample. Task 002 implements §2–§7 for the collections listed below, using synthetic fixtures. Labels: **[Requirement]** traces to the planning documents; **[Recommendation]** is a technical choice open to review; **[Open]** needs a decision ([DECISIONS.md](DECISIONS.md)).

## 1. Framework and toolchain

**Astro, static output, exact versions pinned.** Installed 10 October 2026: `astro` 7.3.8 on Node.js 24.21.0 LTS. Pins live in `package.json`, `package-lock.json` (with `save-exact`), and `.node-version`. The official [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) documents `withastro/action@v6` with `actions/deploy-pages@v5` for the later deploy stage.

Reasons:

- Plain HTML with no client JavaScript by default ([Requirement] static, no backend).
- First-class `site`/`base` for `/Isaac_Ishmael/`.
- Build-time content collections.
- Official Pages action.

Reference integrity does **not** rely on Astro's `reference()`. The project validator checks every relation explicitly against the loaded corpus. Each relation has its own failing test (Codex correction 1).

Alternatives considered:

| Option | Why not chosen |
| --- | --- |
| Eleventy | Smaller, but no built-in schema validation. |
| Hugo | Weak data validation; Go templates. |
| Next.js export | Ships a React runtime this site does not need. |

Tradeoffs: Astro has moved quickly (6.0 to 7.x within 2026), so upgrades are deliberate.

Supporting tools:

| Tool | Use |
| --- | --- |
| TypeScript | Run directly by Node 24 type stripping. Type-checked by `astro check` with TypeScript 6.0.3, because `@astrojs/check` 0.9.10 does not yet support TypeScript 7. |
| `yaml` | Parses record files. |
| Vitest | Unit tests. |
| Playwright with `@axe-core/playwright` | End-to-end and accessibility checks. |

Search (Pagefind or similar) is deferred until search is implemented. The map library is deferred to P4. There is no UI framework.

**Local runtime.** No system Node was available, so the official portable `node-v24.21.0-win-x64.zip` lives in `.tools/`, which is gitignored. It was verified against `SHASUMS256.txt` (SHA-256 OK), and that file's signature was checked against the Node.js release keys ("Good signature", key `5BE8A3F6…B168D356`). Playwright's Chromium is installed in the default per-user cache, outside the synced workspace. Setup instructions: [DEVELOPMENT.md](DEVELOPMENT.md).

## 2. Content model

### Layout

[Requirement] Evidence records stay separate from translations and from presentation code.

```
content/                          # real corpus (empty until P1)
  published-ids.json              # registry of every ID ever published
  records/<type>/<id>.yaml        # language-neutral: IDs, dates, relations, citations, status
  text/<en|es>/<type>/<id>.md     # title, summary, citation notes, body with :cite[] markers
fixtures/valid/                   # synthetic corpus that passes validation
fixtures/invalid/<case>/          # one defect per case + expect.json (negative tests only)
src/lib/content/                  # schemas, loader, validator, build-mode gate
```

### Implemented types

Implemented: `source`, `actor`, `claim`, `event`, `legal_authority`, `proposal` (one file per version), `response`.

Designed but not yet implemented: `place`, `tradition`, `tradition_relation`, `comparison`, `map_layer`, `glossary_term`. The validator rejects these types with `TYPE_NOT_IMPLEMENTED` until they exist. The design notes for them below remain the plan.

### Requirements by type and editorial status (Codex correction 2)

All records have:

- `id`
- `type`
- `review_status`, one of `lead`, `source_inspected`, `draft`, `reviewed`, `published`
- `fixture`
- `related[]`, `corrections[]`, and `citations[]`
- optionally, `last_substantive_review` and `last_link_check`

There is no score or ranking field. Objects are strict, so an unknown field such as a `confidence_score` is rejected.

At `reviewed` or `published`, every record needs `last_substantive_review`, and every citation needs `inspected_on`. Beyond that, requirements differ by type:

| Type | Additional requirement at `reviewed`/`published` |
| --- | --- |
| `claim`, `event`, `legal_authority`, `proposal`, `response` | At least one citation. They also carry `evidence_category` and `disputes[]`. |
| `source` | At least one link or a DOI, plus `accessed_on`. A source never needs to cite itself. |
| `actor` | `authority_links` or citations to *other* sources. |

At `published`, a record additionally needs:

- English and Spanish texts, each at a releasable translation status (§3);
- references only to other `published` records.

Drafts and leads may be incomplete in every respect. Schema shape and reference existence are still checked at every status.

### Dates

`date` is one of:

- `{ kind: exact | approximate, date, precision }`
- `{ kind: range, start, end, precision }`
- `{ kind: unknown }`

An unknown date carries no precision, and adding one is a schema error. Precision is one of `day`, `month`, `year`, `decade`, `century`.

An endpoint is `{ year ≥ 1, era: BCE | CE, month?, day? }`. The validator rejects:

- precision finer than the fields supplied;
- fields finer than the stated precision;
- impossible days;
- ranges whose end precedes their start.

### Sources

Each source records:

- identity: `title`, `title_original?`, and `creators[]` with a role;
- `doc_type` and `date`;
- `original_language` as a BCP 47 tag;
- `links[]`, each with a kind, a language, and an optional translation status, where only http(s) links are accepted;
- `doi?` and `accessed_on`;
- `access_status`: open, paywalled, catalog_only, unavailable, or archived;
- `inspection`: `full_text`, `excerpt_only`, or `metadata_only`;
- `reuse`.

### Citations

Each citation has the shape `{ id, source, locator, relationship, inspected_on? }`.

- `locator` is either `{ type, value }` or `{ unavailable: "<reason>" }`. The second form is for sources without pagination or stable sections, so a locator is never invented (Codex correction 3).
- `relationship` is one of: supports, qualifies, contradicts, contextualizes.

Each language file gives a note per citation ID. In prose, an assertion carries the inline marker `:cite[cit-id]`, which renders as a numbered link to the citation entry. That entry shows the locator, the relationship, the note, access and inspection status, and the source's links.

**Limits (Codex correction 6).** The validator proves structure, not support. It checks that markers resolve, that notes exist in both languages, and that both languages use the same markers. It does not check that every assertion has a marker, that a source supports what it is cited for, or that the two translations say the same thing. Those remain editorial review steps.

### Type-specific fields

**`legal_authority`.** Fields:

- `instrument_type`: judgment, advisory_opinion, provisional_measures_order, other_judicial_decision, treaty, resolution, statute, or other_instrument
- `issuing_body`
- `date`
- `forum`, `procedural_stage`, `parties`, `binding_scope`, and `separate_opinions`, each of which may be `{ not_applicable: "<reason>" }`
- `subsequent_treatment[]`

For judicial instruments, `forum` and `procedural_stage` cannot be not-applicable. `parties` can be, as for an advisory opinion. Narrative fields (question, reasoning, operative result) belong in the language texts, under separate headings.

**`proposal`.** Fields:

- `proposal_id` and `version`
- `proposers`, `participants`, and `mediators`
- `date` and `document_status`
- `topics`, which lists all twelve topics, each as `addressed` (requires citations), `not_addressed`, or `not_established`
- `milestones[]`: signature, ratification, adoption, implementation, suspension, or abandonment, each dated and cited

**`response`.** Fields: `actor`, `proposal`, `date`, `timing` (contemporary or retrospective), and `position`. `position` has no "silence" value, because silence is not a response.

**Planned types (not yet implemented):**

- `comparison`: authorities, a narrow question, similarities and differences, limits, contrary authorities, and a retained or rejected decision with reasons.
- `tradition_relation`: an edge per tradition, marked `asserted_in_tradition` or `historically_corroborated`. Edges are never merged.
- `map_layer`: date interval, extent, semantics, legend, provenance, license, uncertainty, and a text alternative.

## 3. English and Spanish handling

- The translation-status vocabulary is exactly `original`, `project_translation_draft`, and `project_translation_reviewed` (Codex correction 3). The schema, the production gate, the UI labels, and this document all use the same constant, and a unit test checks this document against the schema.
- A text is releasable only at `original` or `project_translation_reviewed`. The latter requires `reviewed_by` and `reviewed_on`.
- There is no language fallback. A missing text renders an explicit "no text in this language" notice, which can only appear in preview or fixture builds. Links to records that lack a title in the current language show the bare ID, never the other language's title.
- Pages set `<html lang>` and `hreflang` alternates. Both UI dictionaries and all displayed vocabulary labels are checked for key parity.
- **Known gap.** Free-text reasons inside language-neutral records (`locator.unavailable`, `not_applicable`) are monolingual. Decide after P1 whether these move into the text files or become a controlled vocabulary.
- Original-language terms and quotations (`original_terms[]`) are still designed but not yet implemented.

## 4. Stable IDs and URLs

- The ID format is `<prefix>-<slug>`, with prefixes `src`, `act`, `clm`, `evt`, `law`, `prp`, and `rsp`. The ID must match the file name and directory.
- `content/published-ids.json` records every published ID. The validator fails if a registered ID disappears or is demoted, or if a published ID is not registered.
- Tombstone pages and alias redirects are designed but not yet implemented.
- URLs use localized section slugs with a shared ID, for example `/Isaac_Ishmael/en/claims/<id>/` and `/Isaac_Ishmael/es/afirmaciones/<id>/`. The language switch preserves the query string and hash.

## 5. Routing, drafts, and build modes

- `base: "/Isaac_Ishmael"`, `trailingSlash: "always"`, and `build.format: "directory"`. Every route is prerendered.
- The root is a bilingual landing page with no `Accept-Language` redirect. There is a bilingual `404.html`.

Build modes are run as `node scripts/build.ts --mode <mode> [--root <dir>]`:

| Mode | Default root | Renders | Marking |
| --- | --- | --- | --- |
| `production` | `content` | non-fixture, `published`, both texts releasable | — |
| `preview` | `content` | all non-fixture records | draft banner, `noindex` |
| `fixtures` | `fixtures/valid` (fixtures roots only) | everything in the root | fixture banner, `noindex` |

Every build validates its root first and aborts on any issue, so invalid content never reaches any output. Records under `fixtures/` may never satisfy the production gate (`FIXTURE_ROOT_RELEASABLE`). Records under `content/` may never be fixtures or contain the token (`FIXTURE_IN_CONTENT`).

**[Open]** Production excludes drafts, but committed drafts are readable in the public repository (D-07).

## 6. Accessibility

The target is WCAG 2.2 AA. The site uses semantic landmarks, a skip link, visible focus, text labels for categories and statuses, reduced-motion support, and responsive metadata lists. Playwright runs axe on every template in both languages at desktop and mobile sizes, a scripted keyboard walk, and a check for horizontal overflow. A manual screen-reader check remains a pre-release step.

## 7. Validation, testing, and deployment

`npm run ci` runs the steps below in order. The [CI workflow](../.github/workflows/ci.yml) runs the same command; it has not yet run on GitHub.

| Step | What it proves |
| --- | --- |
| `validate` | `content/` and `fixtures/valid/` pass. Invalid inputs are not part of this step. |
| `check:types` | `astro check` passes over Astro files and TypeScript. |
| `test` (Vitest) | Each of the 64 `fixtures/invalid` cases fails with exactly its expected codes. Every validator code has a case, and every reference field has its own dangling case. The production gate, dates, i18n parity, and URLs are also tested. |
| `build:fixtures` + `test:e2e` | Positive rendering of all fixture records in both languages, served under `/Isaac_Ishmael/` with Pages-like behavior (301 to the trailing slash, 404 status). Also covers the language switch, citation anchors, banners, keyboard use, axe, and mobile layout. |
| `leak-test` | A production build over `fixtures/valid` emits no record page, and a full scan of `dist/` finds no withheld ID, title, summary, or fixture token, and no source files. That corpus contains published fixtures, non-fixture drafts, and draft translations. As a negative control, the same scan must fail on a fixtures build. |
| `build` + `check:dist` | The real production build, scanned against `content/`. |

Builds retry up to twice on transient `EPERM`/`EBUSY` file locks. Locks of this kind were observed with OneDrive sync running.

**Deployment.** Nothing has been deployed, and the repository has no deploy workflow. The deploy plan is in D-05.

## 8. Dependency on the research sample

**P1 dossiers and the source register are absent as of 10 October 2026.** Real-content acceptance, and confirmation of the schema choices above, depend on P1. Development uses only synthetic fixtures with fictional names (see [fixtures/README.md](../fixtures/README.md)).
