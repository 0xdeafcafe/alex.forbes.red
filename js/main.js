// Entry point. Loaded as `<script type="module" src="./js/main.js">`.
// Pages are pre-rendered at build time (see scripts/build.ts) — this file
// only wires up interactivity (nav, theme cycle, background animations,
// last-spun rotator, relative-time tick).

import { refreshIcons, $$ } from './lib/dom.js';
import { initNav } from './ui/nav.js';
import { initChrome } from './ui/chrome.js';
import { initLastSpun } from './ui/last-spun.js';
import { buildTileBg, startTileFlipper, bindScrollDimmer } from './ui/tile-bg.js';
import { relativeTime } from './lib/format.js';

// Tick the data-end timestamps on recent rows + the last-spun footer once a
// minute. Cheaper than re-rendering the rows themselves.
function startRelativeTimeRefresh() {
  setInterval(() => {
    $$('[data-end]').forEach(el => {
      const end = el.dataset.end;
      if (end) el.textContent = relativeTime(end);
    });
  }, 60_000);
}

function boot() {
  buildTileBg();
  startTileFlipper();
  bindScrollDimmer();

  initChrome();
  initNav();
  initLastSpun();

  startRelativeTimeRefresh();
  refreshIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
