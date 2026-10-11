# Task 011: Atlas publication

Claude Code, 11 October 2026. The owner approved publishing the geographic base after the corrections below. Codex accepted D-09's no-library approach for this first regional view.

The work is on branch `tech/011-atlas-publication`, which builds on `tech/010-atlas-preview`. Both branch from public `main` (`3c17b89`). The research branches are not in this history.

## Corrections made

1. **No "today".** The wording is now tied to the cited data versions. The page says the features are drawn "as represented in the cited Natural Earth data versions, not as they were in any historical period", in both languages. Three kinds of date are kept apart:
   - **Data versions:** land 5.1.1, lakes 5.0.0, rivers 5.0.0, marine areas 5.1.0.
   - **Data file dates:** 8 December 2021 and 13 May 2022. These are the `Last-Modified` dates on Natural Earth's download server, labelled as "not survey dates of the features". They are now pinned beside each hash in `scripts/geo/build-atlas-base.ts` and recorded in the data file.
   - **Download date:** 11 October 2026, labelled "Downloaded for this project".
2. **Scale.** The source scale is shown as **1:10,000,000** (Spanish: 1:10 000 000), with the note "Regional detail: suitable for an overview of the region, not for local, parcel-level or legal precision." The live scale bar is labelled separately.
3. **Clipped coordinates on mobile.** The longitude labels along the top edge now use a hanging baseline plus an `em` offset, so they stay inside the frame at any width. A test checks every top label against the map's edge.
4. **Technical details behind a disclosure.** Hashes, server file dates, file links, simplification tolerances, coordinate precision and the processing script are now in a collapsed **Technical details** section. The tolerances are shown exactly (0.0015°, not rounded to 0.002°). Raw Natural Earth feature IDs left the table and sit in a collapsed section inside each feature's details. Attribution, scale, data versions, dates and the "not a historical reconstruction" notice stay visible.
5. **Published.**
   - The atlas is generated in production at `/en/atlas/` and `/es/atlas/`. Links come from the navigation (placed before the separately labelled interface demo), both homepages, and the root landing page.
   - The "local only" label is replaced by a geographic-base notice: "Geographic base map. It shows physical geography only. It is not historical evidence and draws no borders, territorial claims or settlements."
   - The fictional interface demo keeps its own "Demonstration … invented" labelling.
6. **Exclusions unchanged.**
   - The fixture token, draft and fixture leak scans, and the preview-only marker check all still apply.
   - The atlas stylesheet is inlined, so it ships only with the atlas pages.
   - The `preview-only` marker was removed from it now that it is public. The scanner rule stays in place for future preview-only assets.

## Checks

**Local `npm run ci`: all passing.**

| Check | Result |
| --- | --- |
| Unit tests | 98 |
| Fixture end-to-end tests | 55 |
| Leak test, with its negative control | Passes |
| Production scans | Pass |
| Production end-to-end tests | 78, on desktop and mobile |

The production end-to-end tests now include 24 atlas tests, which also run against the live site through `npm run verify:live`. They cover:

- links from the homepage, the landing page and the navigation;
- the notices, source, scale and dates in both languages;
- technical details collapsed by default;
- physical-only labels, and the Gulf of Aqaba label omitted;
- top coordinate labels not clipped;
- zoom by button and mouse wheel, and pan and zoom by keyboard;
- feature selection, with IDs inside the collapsed section;
- "Show on map" in the table;
- the language switch;
- axe accessibility checks and no horizontal overflow.

The link crawl now expects 9 pages.

**Production output:** 12 files, which are the 10 previously published files plus the two atlas pages.

**Unpublished-research scan of the generated site:** run with the scanner from the development branch. All 20 research drafts and all 15 fixture records are absent.

**History scan:** see "Release checks" in [STATUS](../STATUS.md). After committing:

- no research branch is an ancestor;
- there are no research paths in the tree;
- every reachable blob was searched for research-specific strings.

## Screenshots

Saved in `C:\Users\evanr\IsaacIshmael-atlas-011-screenshots\`:

- the atlas in English and Spanish, desktop and mobile, with close-ups of the mobile map;
- the English technical details expanded;
- the English homepage on desktop and the Spanish one on mobile;
- the landing page.

## Publication steps

1. Push `tech/011-atlas-publication`.
2. Require GitHub CI to pass.
3. Fast-forward `main` without force.
4. Let the Pages workflow deploy.
5. Verify with `npm run verify:live`.
