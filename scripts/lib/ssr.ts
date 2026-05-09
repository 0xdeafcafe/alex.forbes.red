// Marker-based HTML injection. Each SSR'd container in index.html is wrapped
// in `<!--ssr:NAME-->...<!--/ssr-->`. This module finds those markers and
// replaces what's between them. Picked over a full DOM library because it
// preserves surrounding formatting exactly (zero noise diffs) and has no
// runtime dependency.

import { readFile, writeFile } from 'node:fs/promises';

export interface Slot {
  name: string;
  html: string;
}

function injectSlot(html: string, slot: Slot): { html: string; injected: boolean } {
  const re = new RegExp(
    `(<!--\\s*ssr:${slot.name}\\s*-->)[\\s\\S]*?(<!--\\s*\\/ssr\\s*-->)`,
  );
  if (!re.test(html)) {
    console.warn(`[ssr] no marker for "${slot.name}" — add <!--ssr:${slot.name}-->...<!--/ssr--> to index.html`);
    return { html, injected: false };
  }
  return { html: html.replace(re, `$1${slot.html}$2`), injected: true };
}

function injectSnapshot(html: string, payload: string): string {
  const re = /(<script id="snapshot" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) {
    console.warn('[ssr] no <script id="snapshot"> tag in index.html — client tile-bg / last-spun will not have data');
    return html;
  }
  return html.replace(re, `$1${payload}$2`);
}

export async function ssrIntoHtml(htmlPath: string, slots: Slot[], clientPayload: string): Promise<void> {
  let html: string;
  try {
    html = await readFile(htmlPath, 'utf8');
  } catch (e) {
    console.warn(`[ssr] cannot read ${htmlPath}, skipping:`, (e as Error).message);
    return;
  }

  const original = html;
  let injectedCount = 0;
  for (const slot of slots) {
    const r = injectSlot(html, slot);
    html = r.html;
    if (r.injected) injectedCount++;
  }
  html = injectSnapshot(html, clientPayload);

  if (html === original) {
    console.log(`[ssr] no changes to ${htmlPath}`);
    return;
  }
  await writeFile(htmlPath, html, 'utf8');
  console.log(`[ssr] wrote ${htmlPath} (${injectedCount} slots, ${clientPayload.length} chars of client data)`);
}
