import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { usePivot, useAccent } from '../../state.js';

export function ChromeBar(): VNode {
  const { back, canGoBack } = usePivot();
  const { cycle } = useAccent();
  return html`
    <header class="chrome-bar">
      <div class="chrome-left">
        <button class="nav-back" aria-label="Back" disabled=${!canGoBack} onClick=${back}>
          <i data-lucide="arrow-left"></i>
        </button>
        <div class="brand">
          <span>afr</span><span class="brand-dot">.</span>
        </div>
      </div>

      <div class="chrome-actions">
        <button aria-label="Cycle accent theme" onClick=${cycle}>
          <span class="theme-dot" aria-hidden="true"></span>THEME
        </button>
        <span class="sep">|</span>
        <a href="https://github.com/0xdeafcafe/alex.forbes.red" target="_blank" rel="noopener noreferrer">SOURCE</a>
      </div>

      <div class="identity">
        <div class="identity-text">
          <span class="identity-name">ALEX F-R</span>
          <span class="identity-stat"><strong>@LANGWATCH</strong> · AMS</span>
        </div>
        <a class="avatar-tile" href="/collection" aria-label="About">
          <span>AF</span>
        </a>
      </div>
    </header>
  `;
}
