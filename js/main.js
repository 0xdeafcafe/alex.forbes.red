// Entry point. Loaded as `<script type="module" src="./js/main.js">`.
// Each subsystem owns its own state; this file just orders the boot.

import { refreshIcons } from './lib/dom.js';
import { renderQuickplay } from './pages/quickplay.js';
import { renderMusic, initMusicPage } from './pages/music.js';
import { renderProjects } from './pages/projects.js';
import { renderWords } from './pages/words.js';
import { renderPhotos } from './pages/photography.js';
import { initNav } from './ui/nav.js';
import { initChrome } from './ui/chrome.js';
import { initLastSpun, maybeRefreshLastSpun } from './ui/last-spun.js';
import { buildTileBg, startTileFlipper, bindScrollDimmer } from './ui/tile-bg.js';
import { hydrateCovers } from './data/itunes.js';

function renderAllPages() {
  renderQuickplay();
  renderMusic();
  renderProjects();
  renderWords();
  renderPhotos();
}

function boot() {
  renderAllPages();
  initMusicPage();

  buildTileBg();
  startTileFlipper();
  bindScrollDimmer();

  initChrome();
  initNav();
  initLastSpun();

  refreshIcons();

  // Backfill missing album covers via iTunes for the (no-snapshot) fallback
  // path. When live data is present this is a no-op for everything that
  // already has a coverUrl, but still rebuilds the tile-bg afterwards in
  // case any covers landed late.
  hydrateCovers().then(() => {
    buildTileBg();
    maybeRefreshLastSpun();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
