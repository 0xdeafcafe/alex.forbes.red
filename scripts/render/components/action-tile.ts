// Quickplay "start" tiles — navigation shortcuts to each pivot. Click is
// handled by the delegated `<a href="#pivot">` listener in js/ui/nav.js.

import { escapeHtml } from '../format.js';

export interface Action {
  name: string;
  tag: string;
  icon: string;
  pivot: string;
  c1?: string;
  c2?: string;
}

export interface ActionTileOpts {
  featured?: boolean;
}

export function actionTile(action: Action, opts: ActionTileOpts = {}): string {
  const featured = !!opts.featured;
  const cls = 'tile action-tile' + (featured ? ' featured tile-big' : '');
  const styleParts: string[] = [];
  if (action.c1) styleParts.push(`--c1: ${action.c1}`);
  if (action.c2) styleParts.push(`--c2: ${action.c2}`);
  const styleAttr = styleParts.length ? ` style="${styleParts.join('; ')}"` : '';
  return (
    `<a class="${cls}" href="#${escapeHtml(action.pivot)}"${styleAttr}>`
    + `<div class="action-tile-icon"><i data-lucide="${escapeHtml(action.icon)}"></i></div>`
    + `<div class="action-tile-body">`
    +   `<div class="action-tile-name">${escapeHtml(action.name)}</div>`
    +   `<div class="action-tile-tag">${escapeHtml(action.tag)}</div>`
    + `</div>`
    + `</a>`
  );
}
