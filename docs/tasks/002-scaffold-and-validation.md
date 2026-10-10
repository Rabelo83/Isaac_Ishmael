# Task 002 — Scaffold, schemas, validator

Owner: Claude Code. Reviewer: Codex. Status: **complete locally, pending review** (10 October 2026). Approved with corrections in [002-codex-review.md](002-codex-review.md), incorporated below.

## Scope

1. Astro static scaffold (`base` `/Isaac_Ishmael`, trailing slashes, `en`/`es`), exact pins, lockfile.
2. Schemas for `source`, `actor`, `claim`, `event`, `legal_authority`, `proposal`, `response`; remaining types reserved and rejected.
3. Validator: explicit reference checks, type- and status-dependent requirements, citation markers/notes/parity, translation status, dates, ID registry, fixture isolation.
4. Synthetic `fixtures/valid/` (passes) and isolated `fixtures/invalid/<case>/` negative inputs.
5. Unstyled templates: bilingual root, locale home, section indexes, record and source pages, 404, language switch preserving query.
6. CI workflow (validate, types, unit, build, e2e, leak test). No deploy.

Out of scope: real content, visual design, timeline/search/maps, deployment, Pages settings.

## Codex corrections → where satisfied

| # | Requirement | Evidence |
| --- | --- | --- |
| 1 | Explicit reference validation, failing test per relation | `referencesOf()` in [validate.ts](../../src/lib/content/validate.ts); 11 `dangling-*` cases + coverage test |
| 2 | Requirements by type and status; no circular source/actor citations; legal n/a with reasons | [Design §2](../TECHNICAL_DESIGN.md#requirements-by-type-and-editorial-status-codex-correction-2); cases `source-no-access-*`, `actor-no-provenance`, `judicial-forum-not-applicable`, `not-applicable-without-reason` |
| 3 | Locator-unavailable reason; unknown dates without precision; one translation-status enum | `locator.unavailable`; `date-unknown-with-precision`; enum test against the design doc |
| 4 | Invalid inputs isolated; normal validation passes | `npm run validate` covers only `content/` and `fixtures/valid/`; each invalid case asserted individually |
| 5 | Exclusion proven with fixtures and drafts present; full output scan; positive fixture rendering | [leak-test.ts](../../scripts/leak-test.ts) + negative control; e2e over fixtures build |
| 6 | Validator limits stated; semantic coverage stays editorial | [Design §2 Citations](../TECHNICAL_DESIGN.md#citations); printed by `npm run validate` |
| 7 | Official Node runtime, checksum verified | Portable Node 24.21.0, SHA-256 + signature verified ([Design §1](../TECHNICAL_DESIGN.md#1-framework-and-toolchain)) |
| 8 | Preserve staged changes | Index was clean at start; nothing reset or rewritten |

## Acceptance criteria

- [x] `npm run validate` passes on valid corpora; every invalid case fails with exactly its expected codes (64 cases).
- [x] Production build over a corpus containing published fixtures, drafts, and draft translations emits none of them; scan covers all `dist/` files; negative control fails as expected.
- [x] Fixtures-mode build renders every record in both languages under `/Isaac_Ishmael/`; direct loads return 200; missing trailing slash → 301; unknown → 404.
- [x] Language switch maps EN↔ES with query string preserved.
- [x] Axe: no serious/critical violations on all templates (both languages, desktop + mobile); keyboard path passes; no mobile overflow.
- [x] Unit tests cover each validator rule (coverage test enforces it).
- [x] STATUS updated.
- [ ] CI workflow executed on GitHub — requires push (D-06).
- [ ] Real-content acceptance — requires P1.
