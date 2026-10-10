import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Match astro.config.mjs so import.meta.env.BASE_URL resolves the same way.
  base: '/Isaac_Ishmael/',
  test: {
    env: { BASE_URL: '/Isaac_Ishmael/' }, include: ['tests/**/*.test.ts'], exclude: ['tests/e2e/**'] },
});
