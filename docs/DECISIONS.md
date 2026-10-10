# Decision log

Record decisions only when they change. Status values:

- **Confirmed**: decided by the owner or in the planning docs.
- **Accepted**: approved for implementation, subject to the stated condition.
- **Proposed**: awaiting review.
- **Open**: needs a decision.

| ID | Decision | Status | Source / owner |
| --- | --- | --- | --- |
| D-01 | Bilingual EN/ES static site on GitHub Pages at `/Isaac_Ishmael/`. No backend, accounts, comments, notebook, verdict, or rights ranking. | Confirmed | [Website requirements](WEBSITE_REQUIREMENTS.md), [Charter](PROJECT_CHARTER.md) |
| D-02 | Astro (static output) with TypeScript, Vitest, and Playwright with axe. Exact versions pinned at install. Search dependencies deferred until search is built. | Accepted for the scaffold, 10 Oct 2026; to be re-tested against P1 | [Codex review](tasks/002-codex-review.md) |
| D-03 | Language-neutral YAML records plus per-language Markdown texts. No silent language fallback. The validator checks references explicitly. Requirements vary by record type and editorial status. | Accepted for the scaffold, 10 Oct 2026; to be re-tested against P1 | [Codex review](tasks/002-codex-review.md), [Technical design §2–3](TECHNICAL_DESIGN.md#2-content-model) |
| D-04 | Immutable `<prefix>-<slug>` IDs. Localized section paths share the ID segment. `en` and `es` locales both prefixed. Bilingual root landing page with no auto-redirect. | Accepted for the scaffold, 10 Oct 2026; to be re-tested against P1 | [Codex review](tasks/002-codex-review.md) |
| D-05 | Deploy through GitHub Actions only after explicit owner authorization (P5). Until then, CI builds and tests without deploying. | Proposed | [Technical design §7](TECHNICAL_DESIGN.md#7-validation-testing-and-deployment) |
| D-06 | Push local history to `origin`. The remote is currently empty. | Open; not needed for local work | Owner. Pushing publishes the planning drafts in a public repo. |
| D-07 | Where unreviewed drafts live: the public repo (excluded from the site build but visible on GitHub), or private storage. | Open; does not block local work | Owner/Codex |
| D-08 | License for original project content and code. | Open (also listed in the [Roadmap](ROADMAP.md)) | Owner |
| D-09 | Map library and basemap tiles. | Deferred to P4, which needs licensed geographic sources | Claude Code will propose |
