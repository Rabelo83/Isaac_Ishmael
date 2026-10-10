# Website requirements

## Reader experience

The site should support the path: question → historical context → evidence → relevant law → proposals. Readers can also enter through a shared link to any individual record. Provide six connected areas: History, Maps, Peoples and ancestry, Claims and evidence, Legal authorities and comparisons, and Proposals and negotiations. Add a source library and a short methodology page.

Use a restrained reading-first design. Long-form explanations must remain usable without interacting with a visualization. Avoid courtroom imagery that implies a verdict, ethnic scoreboards, and maps whose colors imply ownership without a sourced legend.

## Core interactions

- Timeline filters by period, place, topic, and evidence category, with an accessible list view.
- Map layers selectable by period and type, with visible dates, legends, citations, and uncertainty.
- Genealogy relationships tied to named textual traditions; do not merge conflicting traditions into a single factual pedigree.
- Claim pages showing bounded wording, supporting and qualifying evidence, opposing evidence, source links, and review status.
- Legal case pages separating operative findings, reasoning, submissions, and applicability analysis.
- Proposal comparisons across consistent topics; show "not addressed" and "not established" distinctly.
- Search across titles, summaries, dates, actors, and sources in both languages.
- Stable shareable URLs; language switching retains the corresponding record and useful filter context.

## Source presentation

A citation opens a readable source detail panel or page with a direct external source link, author/issuer, date, exact locator, original language, and access status. Important limitations remain visible beside the claim. The complete source library supports title, author, date, and type filters. Link to available originals and translations; identify project translations.

## Content model for Claude to formalize

Use stable IDs and relations for sources, citations, claims, events, places, actors, textual relationships, legal authorities, comparative analyses, proposals, responses, and map layers. Keep evidence records separate from translations and presentation code.

Every public record needs English and Spanish content, citations, editorial status, last substantive review, and related IDs. Dates support exact dates, ranges, approximate dates, BCE/CE, and unknown dates without false precision. Citations join a specific assertion to a source and locator rather than merely attaching a bibliography to a page.

Legal records need procedural and authority metadata. Proposal responses are separate dated records linked to an actor and a proposal version. Maps need provenance, reuse rights, and layer semantics. Genealogy edges need a source and relationship type, including asserted descent versus historically corroborated relationship.

## Hosting and technical constraints

Use a static build compatible with GitHub Pages; official documentation describes Pages as serving HTML, CSS, and JavaScript from a repository: [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

Claude may propose the framework after inspecting repository conditions. No framework or package versions are approved in this draft. Prefer a small maintainable dependency set and structured local content. No backend, login, tracking service, or private API key is needed for the initial release.

Support the `/Isaac_Ishmael/` project path, direct navigation and refresh on nested links, local preview, and a reproducible build. Keep drafts out of the published bundle. Source text and downloaded assets require lawful reuse; linking does not authorize copying.

## Accessibility and bilingual review

Require keyboard operation, visible focus, meaningful headings, sufficient contrast, responsive layouts, reduced-motion support, and textual alternatives for charts and maps. Do not rely on color alone. Use appropriate document language metadata. Language parity means equivalent substance and qualifications, not just translated menus.

## Initial release boundary

Start with a small reviewed corpus demonstrating all six areas, then expand through the historical workstreams. Empty areas should be clearly described as pending research during development; do not fill them with plausible invented content. Production publication requires source-reviewed material and explicit coverage limits.
