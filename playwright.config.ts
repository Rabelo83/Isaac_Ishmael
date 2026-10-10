import { defineConfig, devices } from '@playwright/test';

// Runs against an existing dist/ built in fixtures mode (npm run build:fixtures),
// served under /Isaac_Ishmael/ with GitHub Pages-like behaviour.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'node scripts/serve.ts --port 4321',
    url: 'http://localhost:4321/Isaac_Ishmael/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
});
