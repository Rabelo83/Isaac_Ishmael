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
| D-05 | Deploy through GitHub Actions from `main` only, after the full check job passes. The owner authorized publishing a method-only bilingual preview (Task 003). Publishing research content still requires reviewed P1 material. | Confirmed for the preview, 10 Oct 2026 | [Task 003](tasks/003-pages-preview.md) |
| D-06 | Push local planning and implementation history to `origin` (no force-push). | Confirmed, 10 Oct 2026 | Owner, via [Task 003](tasks/003-pages-preview.md) |
| D-07 | Where unreviewed drafts live: the public repo (excluded from the site build but visible on GitHub), or private storage. | Open; does not block local work | Owner/Codex |
| D-08 | License for original project content and code. | Open (also listed in the [Roadmap](ROADMAP.md)) | Owner |
| D-09 | Map library and basemap tiles. Geographic base: Natural Earth 1:10m physical vectors (public domain), self-hosted after clipping. No external tiles, keys or paid services. No library for now: the base is projected at build time to inline SVG, with a short vanilla pan/zoom script. Revisit (for example MapLibre or Leaflet) when tiled data, many layers or runtime reprojection are needed. | Proposed (Task 010 local preview); the base data and the no-library approach await review | Claude Code; [Task 010](tasks/010-atlas-preview.md) |
| D-11 | Allow one public interface demonstration (timeline, map and evidence panel) with invented data only, clearly labelled, and kept apart from research and test fixtures. Its rules are in [DEMO_POLICY.md](DEMO_POLICY.md). Research drafts and fixtures remain excluded. | Confirmed: owner approved publication on 11 Oct 2026, after Codex review | Owner; [Task 009](tasks/009-interface-demo.md) |
