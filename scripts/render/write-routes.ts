// SSR <App /> once per pivot and write each to its own HTML file. Shared
// by the production build and the dev server so the per-route output stays
// in lockstep.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { render as renderToString } from 'preact-render-to-string';
import { html } from 'htm/preact';

import { App } from '../app.js';
import { PIVOTS, type Pivot } from '../state.js';
import type { SiteData } from '../lib/types.js';

const ROUTES: { pivot: Pivot; out: string }[] = PIVOTS.map(p => ({
  pivot: p,
  out: p === 'quickplay' ? 'index.html' : `${p}/index.html`,
}));

const SLOT_RE = /(<!--\s*ssr:app\s*-->)[\s\S]*?(<!--\s*\/ssr\s*-->)/;

export interface WriteRoutesResult { pivot: Pivot; out: string; bytes: number }

export async function writeRoutes(shellPath: string, data: SiteData): Promise<WriteRoutesResult[]> {
  let shell = await readFile(shellPath, 'utf8');
  // Content-addressed URLs stop cached JS/CSS from disagreeing with new HTML.
  for(const match of [...shell.matchAll(/(?:href|src)="(\/css\/[^"?]+\.css|\/client\.js)(?:\?v=[^"]*)?"/g)]) {
    const digest=createHash('sha256').update(await readFile(resolve('.'+match[1]))).digest('hex').slice(0,12);
    shell=shell.replace(match[0],match[0].replace(/="[^"]+"$/,`="${match[1]}?v=${digest}"`));
  }
  if (!SLOT_RE.test(shell)) {
    throw new Error(`[ssr] ${shellPath} missing <!--ssr:app--><!--/ssr--> marker`);
  }
  const results: WriteRoutesResult[] = [];
  for (const { pivot, out } of ROUTES) {
    const appHtml = renderToString(html`<${App} data=${data} initialPivot=${pivot} />`);
    const rendered = shell.replace(SLOT_RE, (_match, start: string, end: string) => `${start}${appHtml}${end}`);
    const path = resolve(out);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, rendered, 'utf8');
    results.push({ pivot, out, bytes: rendered.length });
  }
  return results;
}
