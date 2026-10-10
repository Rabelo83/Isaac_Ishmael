// Builds the site in a given mode: node scripts/build.ts --mode <production|preview|fixtures> [--root <dir>]
import { buildModeFromEnv, DEFAULT_ROOT } from '../src/lib/content/corpus.ts';
import { arg } from './args.ts';

process.env.ASTRO_TELEMETRY_DISABLED ??= '1';
const mode = buildModeFromEnv(arg('mode', 'production'));
process.env.SITE_MODE = mode;
process.env.CONTENT_ROOT = arg('root', DEFAULT_ROOT[mode]);
console.log(`Building mode=${mode} root=${process.env.CONTENT_ROOT}`);
const { build } = await import('astro');

// Sync clients and antivirus (e.g. OneDrive on Windows) can briefly lock files that
// Astro renames inside .astro/. Retry only those transient filesystem errors.
const transient = (e: unknown) => {
  const err = e as Error | undefined;
  return /\b(EPERM|EBUSY)\b|UnknownFilesystemError/.test(`${err?.name} ${String(e)} ${String(err?.cause)}`);
};
for (let attempt = 1; ; attempt++) {
  try {
    await build({ logLevel: 'warn' });
    break;
  } catch (e) {
    if (attempt >= 3 || !transient(e)) throw e;
    console.warn(`Transient filesystem lock (attempt ${attempt}); retrying build.`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}
