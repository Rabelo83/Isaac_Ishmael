# Task 002: Scaffold, schemas, and validator

Owner: Claude Code. Reviewer: Codex. Status: **proposed**. This task starts only after D-02 is approved.

## Preconditions

- D-02 (framework) approved.
- Node 24 LTS installed locally. Without it, D-06 must be settled so that CI can run instead.

## Scope

1. Scaffold Astro with static output, using `base` `/Isaac_Ishmael`, `trailingSlash: "always"`, and the `en` and `es` locales. Pin exact dependency versions and commit the lockfile.
2. Implement Zod schemas for these collections: `source`, `claim`, `event`, `legal_authority`, `proposal`, and `response`, plus the common fields, the date model, and the citation model ([TECHNICAL_DESIGN.md §2](../TECHNICAL_DESIGN.md#2-content-model)). Leave the remaining collections as stubs.
3. Write a `validate` script covering:
   - citation coverage
   - citation-ID parity between EN and ES
   - resolution of every `:cite[]` marker
   - the ID registry
   - date sanity
   - build-mode filtering
   - a dist scan for `SYNTHETIC-FIXTURE`
4. Add synthetic fixtures in `fixtures/`. Each one must be marked `fixture: true`, carry the token, and use fictional names only. Include deliberately broken fixtures so that every validator rule is exercised.
5. Build minimal unstyled templates: the bilingual root page, one record page per implemented collection in both languages, a source detail page, a 404 page, and a language switch that keeps the same record and query string.
6. Add a CI workflow for PRs and pushes that runs validate, build, Vitest, and the Playwright route, keyboard, and axe smoke tests. Do not add a deploy workflow.

## Out of scope

- Real historical content.
- Visual design.
- Timeline filters, search, and maps.
- Deployment and Pages settings.

## Acceptance criteria

- `npm run validate` fails, with a clear message, on each broken fixture:
  - a missing citation
  - a dangling reference
  - a missing or mismatched translation
  - an invalid date
  - a draft or fixture leaking into production
- `npm run validate` passes on the valid fixtures.
- In `production` mode, the build of the fixture set produces a site with no record pages. The production dist scan passes, so no fixture token appears.
- In `fixtures` mode, every route resolves under `/Isaac_Ishmael/` when served from `dist/`. Direct loads of nested URLs return 200. The language switch maps EN to ES and back with the query string preserved.
- Axe reports no serious or critical violations on the template routes. The core path can be completed by keyboard alone.
- Vitest unit tests cover each validator rule.
- STATUS.md is updated and the checks are recorded with their results.
