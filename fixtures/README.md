# Synthetic development fixtures

Everything under `fixtures/` is **synthetic test input**. It is not historical content and must never be published. Names such as "Example Source A" are fictional. No real source, quotation, claim, or review status appears here.

- `valid/` is a corpus that passes `npm run validate`. It includes published fixtures, non-fixture drafts, and draft translations, so production-exclusion tests have real input to exclude.
- `invalid/<case>/` holds the negative test inputs. Each case is an overlay on `valid/` that adds one defect. `expect.json` names the issue code the validator must report. These cases are never part of normal validation and are tested one at a time by `tests/validator.test.ts`.

Every fixture title contains `SYNTHETIC-FIXTURE`, and the production leak scan fails if that token appears in `dist/`.

Content-root cases (`invalid/content-*`) check rules for the real `content/` root, where the token is itself forbidden, so their fictional records omit it. They are only ever loaded by the unit tests.
