# Status

Last updated: 11 October 2026 (Claude Code, Task 009 release candidate)

## Current

- **Live preview:** https://rabelo83.github.io/Isaac_Ishmael/ shows a bilingual landing page, home pages, and methodology pages. It contains no research content. Verified with `npm run verify:live`.
- **Stage:** Tasks 002–004 are done. Task 004 applied the corrections from the [Codex editorial review](tasks/003-codex-editorial-review.md) to the preview copy.
- **Release candidate (Task 009):** a public interface demonstration of the timeline and map, built from invented data only, on `release/009-interface-demo`. The owner approved [D-11](DECISIONS.md) and publication on 11 October 2026. See the [Task 009 record](tasks/009-interface-demo.md). Research work continues on the unpublished development branches.
- **Next milestone:** integrate the reviewed P1 research sample that Codex is preparing (three bilingual dossiers). No further infrastructure work is planned before then.
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
| 004 Preview copy corrections | Done; deployed and verified |
