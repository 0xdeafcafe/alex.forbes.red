// Top-bar chrome: clock + accent-theme cycle.

import { $, pad } from '../lib/dom.js';

const ACCENTS = ['zune', 'magenta', 'orange', 'lime', 'cyan'];
const ACCENT_STORAGE_KEY = 'afr-accent';

function startClock() {
  const clock = $('#clock');
  if (!clock) return;
  const tick = () => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  tick();
  setInterval(tick, 30 * 1000);
}

function startAccentCycle() {
  let idx = 0;
  try {
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (saved && ACCENTS.includes(saved)) idx = ACCENTS.indexOf(saved);
  } catch (e) { /* noop */ }

  function apply() {
    document.documentElement.dataset.accent = ACCENTS[idx];
    try { localStorage.setItem(ACCENT_STORAGE_KEY, ACCENTS[idx]); } catch (e) { /* noop */ }
  }
  apply();

  const btn = $('#theme-cycle');
  if (btn) {
    btn.addEventListener('click', () => {
      idx = (idx + 1) % ACCENTS.length;
      apply();
    });
  }
}

export function initChrome() {
  startClock();
  startAccentCycle();
}
