# Claude Code implementation handoff

You are the senior programmer for Isaac and Ishmael. Codex is the project manager and research-planning lead. The owner has chosen a bilingual English–Spanish website for historical research, legal authorities and comparisons, and settlement proposals. The intended hosting is GitHub Pages from `Rabelo83/Isaac_Ishmael`.

## Read first

Read [the charter](docs/PROJECT_CHARTER.md), [research standards](docs/RESEARCH_STANDARDS.md), [research plan](docs/RESEARCH_PLAN.md), [website requirements](docs/WEBSITE_REQUIREMENTS.md), and [roadmap](docs/ROADMAP.md). Inspect the working tree and any remote content before making changes. The planning files currently describe a draft, not a completed historical corpus.

## First implementation assignment

When execution begins, assess the reviewed research sample from stage P1. If it is absent, report the dependency and proceed only with technical design or explicitly synthetic development fixtures; do not invent historical entries. Propose a small static-site architecture, content schema, route strategy, and Pages deployment plan. Explain material tradeoffs, then implement the assigned milestone under the owner's instructions.

Implement content validation so missing citations, dangling references, missing translations for published records, and draft content cannot silently enter a release. Preserve source URLs and exact locators. A link checker alone cannot verify historical accuracy.

## Nonnegotiable behavior

- No notebook, accounts, public discussion system, automated verdict, or numerical ranking of peoples' rights.
- Keep religious tradition, documented history, party positions, legal findings, and project synthesis visibly distinct.
- Link every factual claim to evidence; source metadata and access limits must be readable.
- Treat map layers and genealogical relationships as sourced claims, not decorative facts.
- Preserve original document language and label unofficial translations.
- Do not treat any actor as the sole voice of an entire population.
- Keep draft or synthetic fixtures out of public build output.
- Honor the repository subpath and direct share links in both languages.
- Do not replace source review with generated prose or fabricate document metadata.

## Delivery report

For each milestone, report what changed, the files involved, checks performed and results, remaining gaps, and any dependency affecting the next stage. Run checks appropriate to the work: schema validation, production build, internal links and routes, bilingual record parity, keyboard access, responsive layouts, and map alternatives. Verify dependency versions against current official documentation at implementation time.

This handoff describes future execution. It does not claim that Claude has been invoked, that source review is complete, or that the site is deployed. Existing user authorization governs routine work; establish deployment authorization before making a public release if it has not already been given.
