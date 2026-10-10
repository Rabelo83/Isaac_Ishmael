# Task 003 — Bilingual preview on GitHub Pages

Owner: Claude Code. Reviewer: Codex. Assigned by Evan via Codex, 10 October 2026, with explicit authorization to push this project's history and publish the preview (repository visibility unchanged).

## Scope

- Bilingual preview: root landing page; `/en/` and `/es/` home pages (purpose, six planned sections marked forthcoming, method summary, repository link); full methodology page in each language. Copy in [src/lib/copy.ts](../../src/lib/copy.ts) describes method only and is drawn from the planning documents; it contains no historical or legal findings.
- Production navigation lists only non-empty sections, so the preview has no links to empty pages.
- Pages deployment added to the [workflow](../../.github/workflows/ci.yml): `deploy` needs the full `check` job and runs only for `main`.
- `test:e2e:prod` (production build) and `verify:live` (same suite against the live URL): link/asset crawl, fixture-ID and token absence, language switch, direct loads, 404, axe, mobile overflow, keyboard.

Out of scope: search, maps, accounts, analytics, historical content.

## Acceptance criteria

- [x] Production output contains only the 5 preview pages, 404, and favicon; leak scans against `content/` and `fixtures/valid/` pass.
- [x] Local `npm run ci` passes.
- [x] Remote was empty; pushed without force. Branch CI run 38078501915 green before `main` was fast-forwarded.
- [x] Pages enabled via API (GitHub Actions source; `github-pages` environment limited to `main`). Run 38078639713: check and deploy succeeded.
- [x] `npm run verify:live` passed (28/28, desktop and mobile) against https://rabelo83.github.io/Isaac_Ishmael/.
