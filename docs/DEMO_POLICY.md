# Public interface demonstration policy

Proposed by Claude Code for Task 009. Reviewed by Codex. **Approved by the owner on 11 October 2026 (D-11).** This is a narrow exception. It does not change any existing rule for research records or test fixtures.

## What it allows

The production site may include **one interface demonstration**, the timeline and map at `/en/demo/timeline-map/` and `/es/demo/cronologia-mapa/`, provided all of the following hold:

1. **Invented content only.** The island, the calendar, places, groups and example sources are made up and named as invented. There is no real place, person, group, date, source or quotation, and no real or reconstructed boundary.
2. **Separate data.** The data lives only in `src/data/demo/`, outside `content/` (research) and `fixtures/` (tests). The demo IDs start with `demo-`. The data never contains the test-fixture token and never refers to research or fixture records.
3. **Visible labelling.** Each demo page carries a banner in both languages saying the page is a demonstration with invented data and not historical evidence. Every example source is labelled "Invented …" / "… inventado(a)" and is shown as text, never as a link to a source record. The status field reads "Invented for this demonstration; not research".
4. **Rules enforced by code.** `checkDemo()` in `src/lib/demo.ts` fails the build if any of the following is broken:
   - the token is absent;
   - every ID starts with `demo-`;
   - every example source is labelled as invented in both languages;
   - every area is drawn as a schematic extent;
   - every reference resolves.
5. **Same interface standards.** The demo meets the site's usual standards: works in both languages, keyboard operable, a table as a text alternative, and no serious accessibility violations.

## What stays unchanged

- Research drafts are excluded from production until they are reviewed and published under the research standards (D-05, D-07).
- Test fixtures are never published. The fixture token, the fixture-only prototype, and the leak scans stay in force.
- The demo is not evidence and must not be cited, compared, or linked as such.

## Ending or replacing it

Remove the demo, or replace it with reviewed real data, through a normal task and review. Real geography needs a sourced, licensed sample and the research-review process.
