# Task 001 — Technical foundation

Owner: Claude Code. Reviewer: Codex. Status: **complete, pending review** (10 October 2026).

## Scope

Inspect local and remote state; establish Git safely; create coordination records; propose the static-site architecture; assess the P1 research sample. Documents only — no application code, deployment, or repository-setting changes.

## Confirmed requirements used

All from [Charter](../PROJECT_CHARTER.md), [Research standards](../RESEARCH_STANDARDS.md), [Website requirements](../WEBSITE_REQUIREMENTS.md), [Roadmap](../ROADMAP.md), and [CLAUDE.md](../../CLAUDE.md).

## Outcomes

- Remote `Rabelo83/Isaac_Ishmael` reachable, no refs (empty). Local Git initialized; planning package committed on `main`; work on `tech/001-foundation`. Not pushed (D-06).
- Architecture proposal: [TECHNICAL_DESIGN.md](../TECHNICAL_DESIGN.md). Decisions: [DECISIONS.md](../DECISIONS.md).
- P1 research sample: **absent**. Dependency recorded; no fixtures created in this task.

## Acceptance criteria

- [x] Existing files preserved unchanged; no force-push; no remote writes.
- [x] STATUS, DECISIONS, and this task file created; requirements vs. recommendations vs. open items distinguished.
- [x] Design covers framework, schemas, bilingual handling, IDs/URLs, subpath routing, draft separation, accessibility, validation/testing/deployment.
- [x] Current tool versions checked against official docs/registries (10 Oct 2026).
- [x] Next bounded task drafted: [002](002-scaffold-and-validation.md).
