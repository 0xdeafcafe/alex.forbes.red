// SSR <App /> once per pivot and write each to its own HTML file. Shared
// by the production build and the dev server so the per-route output stays
// in lockstep.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
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
  const shell = await readFile(shellPath, 'utf8');
  if (!SLOT_RE.test(shell)) {
    throw new Error(`[ssr] ${shellPath} missing <!--ssr:app--><!--/ssr--> marker`);
  }
  const results: WriteRoutesResult[] = [];
  for (const { pivot, out } of ROUTES) {
    const appHtml = renderToString(html`<${App} data=${data} initialPivot=${pivot} />`);
    const rendered = shell.replace(SLOT_RE, `$1${appHtml}$2`);
    const path = resolve(out);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, rendered, 'utf8');
    results.push({ pivot, out, bytes: rendered.length });
  }
  return results;
}
