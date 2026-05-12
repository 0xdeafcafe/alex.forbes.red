// Quickplay "start" tiles — navigation shortcuts to each pivot. The href
// is a real path so browser-native nav works as a fallback while JS loads;
// the SPA click listener intercepts once hydrated.

import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { pathForPivot, type Pivot } from '../../state.js';

export interface Action {
  name: string;
  tag: string;
  icon: string;
  pivot: Pivot;
  c1?: string;
  c2?: string;
}

export interface ActionTileProps {
  action: Action;
  featured?: boolean;
}

export function ActionTile({ action, featured = false }: ActionTileProps): VNode {
  const cls = 'tile action-tile' + (featured ? ' featured tile-big' : '');
  const styleParts: string[] = [];
  if (action.c1) styleParts.push(`--c1: ${action.c1}`);
  if (action.c2) styleParts.push(`--c2: ${action.c2}`);
  const style = styleParts.length ? styleParts.join('; ') : undefined;
  return html`
    <a class=${cls} href=${pathForPivot(action.pivot)} style=${style}>
      <div class="action-tile-icon"><i data-lucide=${action.icon} /></div>
      <div class="action-tile-body">
        <div class="action-tile-name">${action.name}</div>
        <div class="action-tile-tag">${action.tag}</div>
      </div>
    </a>
  `;
}
