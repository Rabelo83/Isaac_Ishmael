# Development

## Toolchain

Use Node.js 24 LTS. The project pins 24.21.0 in `.node-version`.

If Node is not installed system-wide, use the official portable build in `.tools/`. That folder is gitignored, so set it up once per machine:

```sh
mkdir -p .tools && cd .tools
curl -O https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip
curl -O https://nodejs.org/dist/v24.21.0/SHASUMS256.txt
grep " node-v24.21.0-win-x64.zip$" SHASUMS256.txt | sha256sum -c -   # must print OK
unzip node-v24.21.0-win-x64.zip && cd ..
export PATH="$PWD/.tools/node-v24.21.0-win-x64:$PATH"            # per shell session
npm ci
npx playwright install chromium
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run validate` | Validates `content/` and `fixtures/valid/`. |
| `npm test` | Runs unit tests, including every negative case in `fixtures/invalid/`. |
| `npm run build:fixtures`, then `npm run test:e2e` | Renders the synthetic corpus and runs the browser tests. |
| `node scripts/leak-test.ts` | Proves that drafts and fixtures are excluded from production output. |
| `npm run build`, then `npm run check:dist -- --corpus content` | Builds the real production site and scans it. |
| `npm run build:preview` | Local-only build that includes drafts, each marked with a banner. |
| `npm run serve` | Serves `dist/` at `http://localhost:4321/Isaac_Ishmael/`. |
| `npm run ci` | Runs every check, in the same order as CI. |

`dist/` holds whichever mode was built last. Rebuild in production mode before relying on it.

## Known environment issue

This workspace sits inside OneDrive, which can briefly lock files under `.astro/` during builds. The build scripts retry these locks. If they keep failing, pause OneDrive sync or move the clone outside OneDrive.
