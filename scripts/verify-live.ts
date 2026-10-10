// Runs the production e2e suite against the deployed site (default: GitHub Pages URL).
import { spawnSync } from 'node:child_process';
import { arg } from './args.ts';

const origin = arg('origin', 'https://rabelo83.github.io')!;
const r = spawnSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', '-c', 'playwright.production.config.ts'],
  { stdio: 'inherit', env: { ...process.env, E2E_BASE_URL: origin } },
);
process.exit(r.status ?? 1);
