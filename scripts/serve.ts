// Serves dist/ under /Isaac_Ishmael/ the way GitHub Pages does for a project site:
// directory → index.html, missing trailing slash → 301, unknown path → 404.html with status 404.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { arg } from './args.ts';

const BASE = '/Isaac_Ishmael/';
const DIST = 'dist';
const port = Number(arg('port', '4321'));
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function send(res: import('node:http').ServerResponse, status: number, file: string) {
  res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const notFound = () => send(res, 404, join(DIST, '404.html'));
  if (!path.startsWith(BASE)) {
    if (path === BASE.slice(0, -1)) {
      res.writeHead(301, { location: BASE }).end();
      return;
    }
    return notFound();
  }
  const rel = normalize(path.slice(BASE.length));
  if (rel.startsWith('..')) return notFound();
  const target = join(DIST, rel);
  if (existsSync(target) && statSync(target).isDirectory()) {
    if (!path.endsWith('/')) {
      res.writeHead(301, { location: `${path}/` }).end();
      return;
    }
    const index = join(target, 'index.html');
    return existsSync(index) ? send(res, 200, index) : notFound();
  }
  return existsSync(target) ? send(res, 200, target) : notFound();
}).listen(port, () => console.log(`Serving ${DIST}/ at http://localhost:${port}${BASE}`));
