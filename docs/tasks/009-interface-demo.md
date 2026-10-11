# Task 009: Public interface demonstration (release candidate)

Claude Code, 11 October 2026. **Approved for publication by the owner on 11 October 2026 (D-11), after Codex review.** Only this release branch is published; the research branches and test fixtures stay unpublished.

## Branch and isolation

- **Branch.** `release/009-interface-demo` starts from the deployed `main` (`71d6e6c`). It lives in a separate Git worktree at `C:\Users\evanr\IsaacIshmael-release-009`, outside OneDrive.
- **Only what the demo needs.** Its history is `main` plus this task's own commits. No commit from the development branches is merged or cherry-picked. The code the demo needs was rewritten here, adapted from the earlier fixtures-only prototype.
- **Development branches untouched.** They stay as they were, and all unreviewed research stays there.

## What is added

- **The demo page.** It is at `/en/demo/timeline-map/` and `/es/demo/cronologia-mapa/`. It shows an invented island and an invented calendar. It provides:
  - selection that stays in sync across the timeline, the map, the table and the evidence panel;
  - five distinct layers, each with a stated meaning;
  - named uncertainty levels;
  - keyboard operation;
  - a table as the text alternative;
  - a `?sel=` link that keeps the current selection when shared or when switching language.
- **Labelling.** A banner on each demo page states in both languages that the data is invented and is not historical evidence. Example sources are titled "Invented …" and shown as text, not links.
- **Links to the demo** from the English and Spanish homepages, the root landing page, and the navigation.
- **Data.** `src/data/demo/timeline-map.json` holds the demo data, kept apart from `fixtures/` and `content/`. `src/lib/demo.ts` enforces the policy rules; a policy break fails the build.
- **Policy.** [DEMO_POLICY.md](../DEMO_POLICY.md) sets out the narrow exception, recorded as D-11 (proposed). The exclusions for research drafts and test fixtures are unchanged.

## Preview locally

```sh
cd C:\Users\evanr\IsaacIshmael-release-009
npm run build
npm run serve
```

Then open http://localhost:4321/Isaac_Ishmael/en/demo/timeline-map/. The production build is exactly what Pages would publish.

## Checks

- **Local `npm run ci` in the worktree:** passes.
  - Validation: content is empty, as on `main`, and the fixtures pass.
  - Type check: 0 errors.
  - Unit tests: 88, including 4 for the demo policy.
  - Fixture end-to-end tests: 55.
  - Leak test, with its negative control.
  - Production scans against `content/` and `fixtures/valid`.
  - Production end-to-end tests: 50, on desktop and mobile. 11 are new demo tests: homepage and landing links, banners, timeline to panel, keyboard on the map, no source links, table, layers, language switch with `?sel=`, and axe accessibility plus layout. The link crawl now expects exactly the 7 pages: 5 existing plus 2 demo.
- **Production output:** 10 files: the 7 earlier pages and assets, 2 demo pages, and 1 stylesheet.
- **Unpublished-research scan of the generated site:** passes, run with the scanner from the development branch:
  - all 20 unpublished research drafts are absent;
  - all 15 fixture records are absent;
  - the earlier prototype's fixture IDs and text are absent.

  The first run flagged demo event IDs that contained prototype fixture IDs as substrings, for example `demo-event-claim`. They were renamed (`demo-ev-*`) instead of loosening the scan.
- **History scan of the release branch:** passes. The checks were:
  - `main..release` holds only the Task 009 commit, which touches 15 demo, documentation and test paths.
  - No development branch (Task 005, 006 or 008) is an ancestor of the release branch.
  - No research-record or `research/` paths exist in the tree.
  - All 262 reachable blobs were searched for research-specific strings. The one hit is the word "unispal" in a URL inside the P0 planning document `docs/RESEARCH_PLAN.md`, which has been public on `main` since Task 003. It is not unpublished research.
- **Synchronization:** no OneDrive conflict copies (`*-Ale*`) were found in the main repository or the release worktree during this task.

## Screenshots for review

Saved outside the repository in `C:\Users\evanr\IsaacIshmael-release-009-screenshots\`:

- the demo in English and Spanish, on desktop and mobile;
- the English demo on desktop in dark mode;
- the English home page on desktop and the Spanish one on mobile;
- the landing page.

## Remaining before publication

1. ~~Owner approval of D-11 and of publication.~~ Approved on 11 October 2026.
2. Merge `release/009-interface-demo` into `main` (fast-forward) and push. The existing workflow then deploys only after every check passes.
3. Verify the live site with `npm run verify:live`.
