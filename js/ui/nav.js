// Pivot navigation. Drives:
//  - the active pivot button + visible page
//  - the URL hash (history.pushState)
//  - the header back arrow (delegates to history.back())
//  - keyboard ←/→ to traverse pivots
//  - localStorage so reloads land on the same pivot

import { $, $$, refreshIcons } from '../lib/dom.js';

const STORAGE_KEY = 'afr-pivot';
const DEFAULT_PIVOT = 'quickplay';

let pivots = [];
let pages = [];
let validPivots = [];
let inAppDepth = 0; // count of in-app pushes; drives back-button enable

function activePivot() {
  return $('.pivot.active')?.dataset.pivot || DEFAULT_PIVOT;
}

function updateBackBtn() {
  const btn = $('#nav-back');
  if (btn) btn.disabled = inAppDepth === 0;
}

/**
 * Switch pivot. Public so other modules (avatar tile, action tile, etc.)
 * can navigate programmatically.
 *
 * @param {string} target  one of validPivots
 * @param {boolean} [instant]   skip the swap delay (used on initial load)
 * @param {boolean} [viaBack]   true when called from popstate or programmatic
 *                              back; suppresses the pushState + scroll-to-top.
 */
export function setPivot(target, instant = false, viaBack = false) {
  const current = activePivot();
  if (current === target) return;
  if (!validPivots.includes(target)) return;

  pivots.forEach(p => p.classList.toggle('active', p.dataset.pivot === target));
  pages.forEach(p => p.classList.remove('active'));

  setTimeout(() => {
    const newPage = $(`.pivot-page[data-page="${target}"]`);
    if (newPage) newPage.classList.add('active');
    refreshIcons();
    if (!viaBack) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);

  try { localStorage.setItem(STORAGE_KEY, target); } catch (e) { /* noop */ }

  if (!viaBack) {
    history.pushState({ pivot: target }, '', `#${target}`);
    inAppDepth++;
    updateBackBtn();
  }
}

function bindPivotClicks() {
  pivots.forEach(p => {
    p.addEventListener('click', () => setPivot(p.dataset.pivot));
  });
}

function bindBackButton() {
  const btn = $('#nav-back');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (inAppDepth > 0) history.back();
  });
}

function bindPopstate() {
  window.addEventListener('popstate', (e) => {
    const target = (e.state && e.state.pivot)
      || (location.hash || '').replace('#', '')
      || DEFAULT_PIVOT;
    if (!validPivots.includes(target)) return;
    if (activePivot() !== target) {
      inAppDepth = Math.max(0, inAppDepth - 1);
      setPivot(target, false, true);
    }
    updateBackBtn();
  });
}

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if (['INPUT', 'TEXTAREA'].includes((document.activeElement || {}).tagName)) return;
    // Don't hijack browser-level Alt+Arrow back/forward.
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const idx = pivots.findIndex(p => p.classList.contains('active'));
    const next = e.key === 'ArrowRight'
      ? (idx + 1) % pivots.length
      : (idx - 1 + pivots.length) % pivots.length;
    setPivot(pivots[next].dataset.pivot);
  });
}

// Anything that's just `<a href="#pivot">` should use the SPA setPivot
// instead of letting the browser snap to a hash. Bind a single delegated
// listener that catches every internal-pivot link.
function bindInternalPivotLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = a.getAttribute('href').slice(1);
    if (!validPivots.includes(target)) return;
    e.preventDefault();
    setPivot(target);
  });
}

function resolveInitialPivot() {
  const fromHash = (location.hash || '').replace('#', '');
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* noop */ }
  if (validPivots.includes(fromHash)) return fromHash;
  if (validPivots.includes(stored)) return stored;
  return null;
}

export function initNav() {
  pivots = $$('.pivot');
  pages = $$('.pivot-page');
  validPivots = pivots.map(p => p.dataset.pivot);

  bindPivotClicks();
  bindBackButton();
  bindPopstate();
  bindKeyboard();
  bindInternalPivotLinks();

  // Always install a state object on the current entry so popstate has
  // something to read on the first back press.
  const landing = resolveInitialPivot() || DEFAULT_PIVOT;
  history.replaceState({ pivot: landing }, '', `#${landing}`);
  if (landing !== DEFAULT_PIVOT) {
    // Swap UI to the deep-link target without pushing another entry.
    setPivot(landing, true, true);
  }
}
