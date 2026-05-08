// Patch the live snapshot into <script id="music-snapshot"> in index.html so
// the page renders with real data on first paint (no async fetch needed).

import { readFile, writeFile } from 'node:fs/promises';
import type { MusicSnapshot } from './types.js';

export async function embedInHtml(htmlPath: string, snapshot: MusicSnapshot): Promise<void> {
  let html: string;
  try {
    html = await readFile(htmlPath, 'utf8');
  } catch (e) {
    console.warn(`[embed] cannot read ${htmlPath}, skipping:`, (e as Error).message);
    return;
  }

  // Strip generatedAt from the embedded copy so identical upstream data
  // produces zero HTML diff (cron commits stay quiet).
  const { generatedAt: _ignored, ...embedded } = snapshot;
  const payload = JSON.stringify(embedded);

  const re = /(<script id="music-snapshot" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) {
    console.warn(`[embed] no <script id="music-snapshot"> tag in ${htmlPath}; add it to embed at build time.`);
    return;
  }

  const next = html.replace(re, `$1${payload}$2`);
  if (next === html) {
    console.log(`[embed] embedded snapshot unchanged in ${htmlPath}`);
    return;
  }
  await writeFile(htmlPath, next, 'utf8');
  console.log(`[embed] embedded snapshot into ${htmlPath} (${payload.length} chars)`);
}
