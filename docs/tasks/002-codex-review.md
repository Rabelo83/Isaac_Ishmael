# Codex review of Task 002

Reviewed 10 October 2026 against the local technical design, decision log, status, and Task 002. Git history confirms commits `1100b54` and `698af5f` on the reported branches. No application build was available to review.

## Decision

Approve the Astro static-site direction and Task 002 with the corrections below. This is project-manager approval of the technical direction, not a claim that exact package versions were independently verified or that deployment is authorized. D-02 through D-04 may be recorded as accepted for the scaffold, subject to testing against the P1 research sample. Defer search dependencies until search is implemented.

Astro documents static GitHub Pages deployment and content collections in its [Pages guide](https://docs.astro.build/en/guides/deploy/github/) and [content guide](https://docs.astro.build/en/guides/content-collections/). Recheck and pin compatible versions at installation time.

## Required corrections

1. Validate references explicitly. Include a failing test for each relevant dangling relation; do not assume declaring a typed reference proves target existence in the project's loading/build path.
2. Separate schema requirements by record type and editorial status. Source and actor records need appropriate provenance but must not require circular citations to themselves. Legal instruments are not all court cases; allow reasoned not-applicable values for court-specific fields.
3. Permit an explicit locator-unavailable reason for a source without pagination or stable sections. Do not invent a locator. Unknown dates must not require fabricated precision. Use exactly the same translation-status enum in schemas, filters, and documentation.
4. Keep intentionally invalid fixtures isolated as negative test inputs. A normal validation command must pass on the valid corpus; tests individually assert that each invalid input fails.
5. Demonstrate exclusion with fixtures and drafts actually present in the test input. An empty production loader plus a sentinel scan is insufficient proof. Check generated HTML, data, scripts, search output when added, and public assets for leaks. Positive fixture-mode rendering must work too.
6. A citation validator can verify markers and references, not whether every assertion is true or adequately supported. Keep semantic citation coverage and translation equivalence as editorial checks.
7. Resolve the Node dependency using a compatible official runtime. Prefer a workspace-local portable installation when a system installation is unavailable; verify the official checksum. Do not treat absent Node as requiring publication to GitHub.
8. Preserve any existing staged changes. Inspect the actual index before committing; this review observed staged additions despite the reported commits being present. Do not reset or reconstruct history to make the report appear clean.

## Boundaries and reporting

Proceed with the local scaffold and tests; research sample absence does not block synthetic development. Real-content acceptance remains dependent on P1. No deployment belongs in Task 002. Public draft placement and licensing need not block local work.

Keep the completion report within 150 words: changes, branch/commit, validation outcomes, actionable blockers, and next step. Link to durable details instead of duplicating them. Update STATUS once and DECISIONS only when a decision changes.
