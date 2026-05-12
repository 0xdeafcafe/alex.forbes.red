// Dev server. Re-runs the SSR pass on scripts/ changes, watches client TS
// via esbuild, and serves the working tree on http://localhost:<PORT>.
// Skips live API fetches (uses cached data/snapshot.json) so iteration is
// fast — re-run `npm run build` to refresh from upstreams.

import { createReadStream, statSync, watch } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { context as esbuildContext } from 'esbuild';

import { buildSiteData } from './render/shape.js';
import { writeRoutes } from './render/write-routes.js';
import type { ContentFile, Snapshot, SiteData } from './lib/types.js';

const PORT = Number(process.env.PORT ?? 8765);
const ROOT = resolve('.');
const HTML = resolve('index.html');
const DATA_OUT = resolve('data.json');
const CLIENT_OUT = resolve('client.js');
const CLIENT_ENTRY = resolve('scripts/client/main.ts');
const SNAPSHOT = resolve('data/snapshot.json');
const CONTENT = resolve('data/content.json');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.map':  'application/json; charset=utf-8',
};

async function loadSiteData(): Promise<SiteData> {
  const [rawSnap, rawContent] = await Promise.all([
    readFile(SNAPSHOT, 'utf8'),
    readFile(CONTENT, 'utf8'),
  ]);
  const snapshot = JSON.parse(rawSnap) as Snapshot;
  const content = JSON.parse(rawContent) as ContentFile;
  return buildSiteData(snapshot, content);
}

async function ssrPass(): Promise<void> {
  const data = await loadSiteData();
  await writeRoutes(HTML, data);
  await writeFile(DATA_OUT, JSON.stringify(data), 'utf8');
}

async function main() {
  console.log('[dev] running initial SSR pass...');
  await ssrPass();

  console.log('[dev] starting client bundle watcher...');
  const ctx = await esbuildContext({
    entryPoints: [CLIENT_ENTRY],
    bundle: true,
    format: 'esm',
    target: 'esnext',
    outfile: CLIENT_OUT,
    sourcemap: 'linked',
    external: ['/data.json'],
    logLevel: 'info',
  });
  await ctx.watch();

  // Re-SSR when render/app/state files change. Bundle is handled separately
  // by esbuild's watcher.
  const watcher = watch(resolve('scripts'), { recursive: true }, (_evt, file) => {
    if (!file) return;
    if (file.startsWith('client/')) return; // esbuild handles
    if (!file.endsWith('.ts')) return;
    void ssrPass()
      .then(() => console.log(`[dev] ssr re-run (${file})`))
      .catch(err => console.error('[dev] ssr failed:', err));
  });

  const server = createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    const decoded = decodeURIComponent(url);
    // Path-style pivot routes (/music, /collection, ...) → <pivot>/index.html.
    // Trailing slashes and bare directories resolve to their index.html.
    const candidates = [
      join(ROOT, decoded),
      join(ROOT, decoded, 'index.html'),
      join(ROOT, decoded.replace(/\/+$/, ''), 'index.html'),
      join(ROOT, decoded === '/' ? 'index.html' : decoded),
    ];
    const file = candidates.find(p => {
      if (!p.startsWith(ROOT)) return false;
      try { return statSync(p).isFile(); } catch { return false; }
    });
    if (!file) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });

  server.listen(PORT, () => {
    console.log(`[dev] serving http://localhost:${PORT}/`);
  });

  process.on('SIGINT', async () => {
    console.log('\n[dev] shutting down...');
    watcher.close();
    await ctx.dispose();
    server.close();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('[dev] failed:', err);
  process.exit(1);
});
