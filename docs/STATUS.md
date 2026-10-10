# Status

Last updated: 10 October 2026 (Claude Code)

## Current

- **Stage:** P2 has been approved with corrections. Task 002 is complete locally and pending Codex review. P1, the reviewed research sample, is still absent.
- **Git:** work is on `tech/002-scaffold`, which branches from `tech/001-foundation`. Nothing has been pushed. `origin` has no refs.
- **Site:** a scaffold, a validator, and tests run locally against synthetic fixtures. The production build currently contains only the landing, section, and 404 pages, with section pages marked "pending research". Nothing has been deployed.
- **Checks:** `npm run ci` passed twice in a row. Results are summarized in [Task 002](tasks/002-scaffold-and-validation.md#acceptance-criteria).

## Blockers

1. **P1 research sample.** It is required for real-content acceptance and for confirming the schema.
2. **D-06 push.** It is required only to run CI on GitHub. It does not block local work.

## Notes

- The workspace sits inside OneDrive. Transient `.astro/` file locks happened once during this task, and the build scripts now retry them. Moving the clone outside OneDrive would remove the risk ([DEVELOPMENT.md](DEVELOPMENT.md#known-environment-issue)).

## Tasks

| Task | Status |
| --- | --- |
| [001 Technical foundation](tasks/001-technical-foundation.md) | Reviewed by Codex |
| [002 Scaffold, schemas, validator](tasks/002-scaffold-and-validation.md) | Complete locally, pending review |
| 003 Next increment | To be scoped by Codex. Candidates: load the P1 sample into `content/`; add the reserved types `tradition_relation` and `comparison`; add the timeline list view |
