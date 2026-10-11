# Task 016: Publish the Jerusalem explanation

Claude Code, 11 October 2026. The owner authorized publication of the Jerusalem explanation and its three source records in English and Spanish. This record also covers the earlier local stages: Task 014, which integrated Codex's sample as draft pages, and Task 015, which applied Codex's corrections. Those stages' working branches stayed local.

## Release scope

Four records, in both languages, and nothing else:

| Record | English | Spanish |
| --- | --- | --- |
| `clm-jerusalem-1947-proposal` | `/en/claims/clm-jerusalem-1947-proposal/` | `/es/afirmaciones/clm-jerusalem-1947-proposal/` |
| `src-un-ga-res-181-1947-en` | `/en/sources/src-un-ga-res-181-1947-en/` | `/es/fuentes/src-un-ga-res-181-1947-en/` |
| `src-un-map-104b-catalog` | `/en/sources/src-un-map-104b-catalog/` | `/es/fuentes/src-un-map-104b-catalog/` |
| `src-un-map-104b-commons-copy` | `/en/sources/src-un-map-104b-commons-copy/` | `/es/fuentes/src-un-map-104b-commons-copy/` |

The section indexes `/en/claims/`, `/es/afirmaciones/`, `/en/sources/` and `/es/fuentes/` now list these records.

The release has no embedded scans, no boundary geometry and no atlas changes.

## What changed

### Content

- **Records.** The four records are `published`, with `last_substantive_review: 2026-10-11`, and their IDs are in `content/published-ids.json`.
- **Claim.** It uses the `legal` evidence category. "Proposed arrangement" leads the summary and the text, which states that the page describes neither an implemented boundary nor a court judgment.
- **Spanish texts.** All four are `project_translation_reviewed`, with `reviewed_by: "Codex (AI editorial review)"` and `reviewed_on: 2026-10-11`. Each page shows the reviewer next to the translation status. The texts keep the project-translation disclosure and state that there has been no independent human review and that the translation is not official.
- **Draft wording.** The "Editorial draft" lines were replaced by a statement of the AI editorial review.
- **Commons source.** Both language versions label the quoted map titles and footer as transcriptions, with capitalization and accents normalized.
- **Evidentiary limits.** All are retained: the excerpt-only inspection, the PDF-page locator convention, the source-copy distinction, unverified provenance against an official UN download, unsettled rights, and no validation for tracing.

### Site

- **Metadata.** Displayed metadata is localized: reuse, link kinds, link translation status, language names, edition, and the reason for an unavailable locator. This uses a `localizedText` schema type (from Task 015).
- **Catalog date.** The catalog record keeps its own date as unknown. November 1947 is attributed to the map.
- **Homepages.** Both now have a "Published research" section, which lists only published, non-source records, plus a link to the source records. The "Claims and evidence" area links to its section once that section has published records.
- **Banners.** The preview notice and the areas introduction no longer say that nothing has been published.
- **Draft banner.** It now sits inside `<main>` (from Task 014) and is shown only on drafts, so it does not appear on these pages.

### Gates

The gates are unchanged in strictness:

- **Selection.** `isReleasable` (published, not a fixture, with an original or reviewed translation in every language) decides inclusion.
- **Validation.** The validator still requires the published-ID registry, review dates, inspected citations and reviewed-translation metadata.
- **Dist scan.**
  - Against the content corpus it is exact: each page must be releasable, and each releasable record must have a page.
  - Against the fixtures corpus, run with the new `--foreign` flag, it still forbids every fixture ID, title, summary, the fixture token and any page for a fixture record. It no longer requires the content build's pages to appear in the fixtures corpus, which was impossible once real records existed.
  - A negative control (the fixtures build scanned with `--foreign`) reported 461 problems.
- **Production e2e.** The page-set test is still an exact equality: the fixed pages plus each releasable record's page and section index, derived from `content/`.
- **New test.** The new spec `jerusalem.spec.ts` covers the homepage links, the absence of draft banners, the disclosures, citation navigation, the language switch, axe and overflow.

## History hygiene

The working branches' history included notes about unrelated private research and local file paths. For that reason the release is one commit on top of public `main`, not a fast-forward of the working branches. The task records for Tasks 014 and 015 were left out; this record replaces them. The research files and the working branches were kept locally and not pushed.

## Checks before push

The final `npm run ci` passed in full after the last change:

| Check | Result |
| --- | --- |
| Validation | content: 4 records and 8 texts; fixtures: 15 records and 28 texts |
| Types | 0 errors |
| Unit tests | 100 |
| Fixture e2e | 55 |
| Leak test | Passed, with its negative control |
| Production build, scanned against content | 24 files, 4 record pages, 0 withheld |
| Production build, scanned against fixtures (foreign) | 15 withheld records absent |
| Production e2e | 88 (78 existing, 10 new) |

Desktop and mobile screenshots of the local production build were reviewed. They are kept outside the repository.

## Live verification

Recorded after deployment; see the next section.
