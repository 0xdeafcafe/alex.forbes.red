// Quickplay "start" tiles — navigation shortcuts to each pivot.
// Clean and minimal: gradient bg, icon, name + tag. The featured tile gets
// the accent gradient; small tiles get a per-category dark tint.

import { escapeHtml } from '../lib/format.js';
import { setPivot } from '../ui/nav.js';

export function makeActionTile(action, opts = {}) {
  const featured = !!opts.featured;
  const el = document.createElement('a');
  el.className = 'tile action-tile' + (featured ? ' featured tile-big' : '');

  if (action.external) {
    el.href = action.href;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  } else {
    el.href = `#${action.pivot}`;
    el.addEventListener('click', e => {
      e.preventDefault();
      setPivot(action.pivot);
    });
  }
  if (action.c1) el.style.setProperty('--c1', action.c1);
  if (action.c2) el.style.setProperty('--c2', action.c2);

  el.innerHTML = `
    <div class="action-tile-icon"><i data-lucide="${action.icon}"></i></div>
    <div class="action-tile-body">
      <div class="action-tile-name">${escapeHtml(action.name)}</div>
      <div class="action-tile-tag">${escapeHtml(action.tag)}</div>
    </div>
  `;
  return el;
}
