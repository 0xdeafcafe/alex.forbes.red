import { html } from 'htm/preact';
import type { VNode } from 'preact';

// Small inline symbols render on the server; no CDN or post-hydration DOM swap.
const paths: Record<string, string> = {
  'arrow-left': 'M19 12H5m7-7-7 7 7 7',
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
  'arrow-up-right': 'M7 17 17 7M7 7h10v10',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  music: 'M9 18V5l12-2v13M9 5v5l12-2M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  camera: 'M3 6h4l2-3h6l2 3h4v15H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9L7.5 14 3 9.6l6.2-.9Z',
  'git-fork': 'M6 6v5a3 3 0 0 0 3 3h3m6-8v5a3 3 0 0 1-3 3h-3v4M8 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M14 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
};
export function Icon({ name, className = '' }: { name: string; className?: string }): VNode {
  return html`<svg class=${className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name] ?? 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16'} /></svg>`;
}
