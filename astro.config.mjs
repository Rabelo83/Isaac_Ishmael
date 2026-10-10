// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rabelo83.github.io',
  base: '/Isaac_Ishmael',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  // Locale routing is explicit in src/pages/[locale]; no automatic fallback
  // between languages (docs/TECHNICAL_DESIGN.md §3).
  devToolbar: { enabled: false },
});
