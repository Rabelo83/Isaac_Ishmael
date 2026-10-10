import { defineConfig, devices } from '@playwright/test';

// Checks a production build. By default it serves the local dist/ (npm run build);
// set E2E_BASE_URL=https://rabelo83.github.io to run the same checks against the live site.
const live = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e-production',
  fullyParallel: true,
  reporter: [['list']],
  retries: live ? 2 : 0,
  use: { baseURL: live ?? 'http://localhost:4322' },
  webServer: live
    ? undefined
    : {
        command: 'node scripts/serve.ts --port 4322',
        url: 'http://localhost:4322/Isaac_Ishmael/',
        reuseExistingServer: false,
      },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
