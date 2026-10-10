# Status

Last updated: 10 October 2026 (Claude Code)

## Current

- **Live preview:** https://rabelo83.github.io/Isaac_Ishmael/ shows a bilingual landing page, home pages, and methodology pages. It contains no research content. Verified with `npm run verify:live`.
- **Stage:** P2 was approved with corrections. Tasks 002 and 003 are done. P1, the reviewed research sample, is still absent.
- **Git:** `main` on GitHub is the deployed branch. Task work happens on `tech/<nnn>-…` branches. Pushes are never forced. `main` is fast-forwarded only after CI on the task branch passes.
- **Deployment:** every push to `main` re-runs all checks and then deploys ([workflow](../.github/workflows/ci.yml)).

## Blockers and limitations

1. **The P1 research sample is still needed** before any historical content can be published.
2. **The title and wording are provisional.** The public title is still undecided ([Roadmap](ROADMAP.md)). The Spanish text was written by Claude and has not been independently reviewed.
3. **No license yet (D-08).** The repository is public but carries no license.
4. **Drafts would be public (D-07).** Unreviewed drafts committed to this public repository would be readable on GitHub.

## Tasks

| Task | Status |
| --- | --- |
| [001 Technical foundation](tasks/001-technical-foundation.md) | Reviewed |
| [002 Scaffold, schemas, validator](tasks/002-scaffold-and-validation.md) | Done |
| [003 Pages preview](tasks/003-pages-preview.md) | Done; deployed and verified |
