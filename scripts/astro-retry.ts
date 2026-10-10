// Runs the Astro CLI, retrying only transient filesystem locks (EPERM/EBUSY) that
// sync clients such as OneDrive can cause inside .astro/. Usage: node scripts/astro-retry.ts check
import { spawnSync } from 'node:child_process';

process.env.ASTRO_TELEMETRY_DISABLED ??= '1';
const cli = 'node_modules/astro/bin/astro.mjs';
for (let attempt = 1; ; attempt++) {
  const r = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], { encoding: 'utf8' });
  const output = `${r.stdout}${r.stderr}`;
  const transient = r.status !== 0 && /\b(EPERM|EBUSY)\b|UnknownFilesystemError/.test(output);
  if (!transient || attempt >= 3) {
    process.stdout.write(output);
    process.exit(r.status ?? 1);
  }
  console.warn(`Transient filesystem lock (attempt ${attempt}); retrying astro ${process.argv[2]}.`);
}
