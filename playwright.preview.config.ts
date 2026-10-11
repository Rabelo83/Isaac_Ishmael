import { defineConfig, devices } from '@playwright/test';

// Checks a local preview build (npm run build:preview). Preview builds are never deployed.
export default defineConfig({
  testDir: 'tests/e2e-preview',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4323' },
  webServer: {
    command: 'node scripts/serve.ts --port 4323',
    url: 'http://localhost:4323/Isaac_Ishmael/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
