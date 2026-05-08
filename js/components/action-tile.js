// Quickplay "start" tiles — navigation shortcuts to each pivot.
// Each non-featured tile gets a category-specific flair behind its
// icon + label (mini cover grid, code excerpt, drop-cap paragraph, etc).

import { escapeHtml, monogram } from '../lib/format.js';
import { albums, photos, words } from '../data/store.js';
import { setPivot } from '../ui/nav.js';

function albumFlair() {
  const picks = albums.slice(0, 4);
  if (!picks.length) return '';
  const cells = picks.map(a => a.coverUrl
    ? `<div style="background-image: url('${escapeHtml(a.coverUrl)}');"></div>`
    : `<div style="background: linear-gradient(135deg, ${a.c1 || '#444'}, ${a.c2 || '#111'});"></div>`
  ).join('');
  return `<div class="action-tile-flair flair-covers">${cells}</div>`;
}

function photoFlair() {
  const picks = (photos || []).slice(0, 4).filter(p => p.url);
  if (!picks.length) return '';
  const cells = picks.map(p =>
    `<div style="background-image: url('${escapeHtml(p.url)}');"></div>`
  ).join('');
  return `<div class="action-tile-flair flair-covers">${cells}</div>`;
}

function projectsFlair() {
  // Hand-rolled syntax-coloring: tiny enough to keep static, not worth a parser.
  const code =
    `<span class="com">// open source</span>\n` +
    `<span class="kw">const</span> work = <span class="punc">[</span>\n` +
    `  <span class="str">'react-contextual-…'</span><span class="punc">,</span>\n` +
    `  <span class="str">'cypher-swift'</span><span class="punc">,</span>\n` +
    `  <span class="str">'pillar-box'</span><span class="punc">,</span>\n` +
    `  <span class="str">'go-xbdm'</span><span class="punc">,</span>\n` +
    `  ...rest\n` +
    `<span class="punc">]</span>`;
  return `<div class="action-tile-flair flair-code">${code}</div>`;
}

function wordsFlair() {
  const seed = words[0]?.title?.replace(/^./, c => c.toUpperCase()) || 'Notes';
  const text = `${seed}. Tracing why a build flaked. Reverse-engineering a protocol no one documented. Late-night essays on infra, otel, and the joy of breaking things in production…`;
  return `<div class="action-tile-flair flair-text">${escapeHtml(text)}</div>`;
}

function flairFor(action) {
  switch (action.pivot) {
    case 'music': return albumFlair();
    case 'photography': return photoFlair();
    case 'projects': return projectsFlair();
    case 'words': return wordsFlair();
    default: return '';
  }
}

export function makeActionTile(action, opts = {}) {
  const featured = !!opts.featured;
  const flair = featured ? '' : flairFor(action);
  const el = document.createElement('a');
  el.className = 'tile action-tile'
    + (featured ? ' featured tile-big' : '')
    + (flair ? ' with-flair' : '');

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
    ${flair}
    <div class="action-tile-icon"><i data-lucide="${action.icon}"></i></div>
    <div class="action-tile-body">
      <div class="action-tile-name">${escapeHtml(action.name)}</div>
      <div class="action-tile-tag">${escapeHtml(action.tag)}</div>
    </div>
  `;
  return el;
}
