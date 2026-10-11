# Status

Last updated: 11 October 2026 (Claude Code, Task 016 Jerusalem publication)

## Current

- **Live site:** https://rabelo83.github.io/Isaac_Ishmael/ shows a bilingual landing page, home pages, methodology pages, the atlas, the interface demonstration, and the first published research explanation. Verified with `npm run verify:live`.
- **First published explanation (Tasks 014–016):** "Jerusalem in the 1947 partition proposal" (`clm-jerusalem-1947-proposal`) and its three source records, in English and Spanish. The owner authorized publication. The review is Codex's AI editorial review; no independent human review has been done. The Spanish text is a project translation, not an official translation. The pages link to sources only, with no scans and no boundaries. See the [Task 016 record](tasks/016-jerusalem-publication.md).
- **Stage:** Tasks 002–004 are done. Task 004 applied the corrections from the [Codex editorial review](tasks/003-codex-editorial-review.md) to the preview copy.
- **Atlas (Tasks 010–011):** a geographic base map of the eastern Mediterranean, built from Natural Earth 1:10m physical data (public domain). It is published at `/en/atlas/` and `/es/atlas/`, with the owner's approval and D-09 accepted. See the [Task 011 record](tasks/011-atlas-publication.md).
- **Interface demonstration (Task 009):** a public demonstration of the timeline and map, built from invented data only. The owner approved [D-11](DECISIONS.md) and publication on 11 October 2026. See the [Task 009 record](tasks/009-interface-demo.md). Research work continues on the unpublished development branches.
- **Git:** `main` on GitHub is the deployed branch. Task work happens on `tech/<nnn>-…` branches, and releases are prepared from `main`. Pushes are never forced. `main` is fast-forwarded only after CI on the release branch passes.
- **Deployment:** every push to `main` re-runs all checks and then deploys ([workflow](../.github/workflows/ci.yml)).

## Blockers and limitations

1. **Most research is unpublished.** Only the Jerusalem explanation has passed review and been published; other dossiers stay on unpublished branches.
2. **The title and wording are provisional.** The public title is still undecided ([Roadmap](ROADMAP.md)). The Spanish site copy was written by Claude and has not been independently reviewed.
3. **No license yet (D-08).** The repository is public but carries no license.
4. **Drafts would be public (D-07).** Unreviewed drafts committed to this public repository would be readable on GitHub, so drafts are kept off public branches.

## Tasks

| Task | Status |
| --- | --- |
| [001 Technical foundation](tasks/001-technical-foundation.md) | Reviewed |
| [002 Scaffold, schemas, validator](tasks/002-scaffold-and-validation.md) | Done |
| [003 Pages preview](tasks/003-pages-preview.md) | Done; deployed and verified |
| 004 Preview copy corrections | Done; deployed and verified |
| [016 Jerusalem explanation published](tasks/016-jerusalem-publication.md) (includes 014 draft integration and 015 corrections) | Released; live verification recorded in the task record |
