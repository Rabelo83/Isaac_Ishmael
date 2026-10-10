# Decision log

Record decisions only when they change. Status values: **Confirmed** (owner or planning docs), **Proposed** (awaiting review), **Open** (needs decision).

| ID | Decision | Status | Source / owner |
| --- | --- | --- | --- |
| D-01 | Bilingual EN/ES static site on GitHub Pages at `/Isaac_Ishmael/`; no backend, accounts, comments, notebook, verdict, or rights ranking | Confirmed | [Website requirements](WEBSITE_REQUIREMENTS.md), [Charter](PROJECT_CHARTER.md) |
| D-02 | Astro (static output) with Zod content collections, TypeScript, Pagefind, Vitest, Playwright + axe; exact versions pinned | Proposed | [Technical design §1](TECHNICAL_DESIGN.md#1-framework) — Codex review, owner approval |
| D-03 | Language-neutral YAML records + per-language Markdown text files; no silent language fallback | Proposed | [Technical design §2–3](TECHNICAL_DESIGN.md#2-content-model) |
| D-04 | Immutable `<prefix>-<slug>` IDs; localized section paths, shared ID segment; prefixed `en`/`es` locales; bilingual root landing page without auto-redirect | Proposed | [Technical design §4–5](TECHNICAL_DESIGN.md#4-stable-ids-and-urls) |
| D-05 | Deploy via GitHub Actions only after explicit owner authorization (P5); CI build/test before then | Proposed | [Technical design §7](TECHNICAL_DESIGN.md#7-validation-testing-and-deployment) |
| D-06 | Push local history to `origin` (remote currently empty): baseline `main` with planning docs, plus branch `tech/001-foundation` | Open | Owner — pushing publishes planning drafts in a public repo |
| D-07 | Where unreviewed drafts live: public repo (excluded from site build but visible on GitHub) vs. private repo/storage | Open | Owner/Codex |
| D-08 | License for original project content and code | Open (already listed in [Roadmap](ROADMAP.md)) | Owner |
| D-09 | Map library and basemap/tiles | Deferred to P4 (needs licensed geographic sources) | Claude Code proposes then |
