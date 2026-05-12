// Client entry. The JSON module import is left external by esbuild so the
// browser fetches /data.json as part of the module graph (cacheable, sees
// HTTP ETags, no manual parsing). Top-level await holds execution until it
// resolves; meanwhile the SSR'd HTML is fully visible.

import { hydrate } from 'preact';
import { html } from 'htm/preact';
import data from '/data.json' with { type: 'json' };
import { App } from '../app.js';
import type { SiteData } from '../lib/types.js';

const root = document.getElementById('root');
if (!root) throw new Error('[client] missing #root');

hydrate(html`<${App} data=${data as SiteData} />`, root);
