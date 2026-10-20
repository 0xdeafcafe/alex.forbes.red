import {profile} from '../../lib/profile.js';
import { Icon } from './icon.js';
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
          <${Icon} name="arrow-left" />
        </button>
        <div class="brand">
          <img class="zune-wordmark" src="/assets/alex/alex-wordmark.svg" alt="Alex" width="98" height="32" />
        </div>
      </div>

      <div class="chrome-actions">
        <button aria-label="Cycle accent theme" onClick=${cycle}>
          <span class="theme-dot" aria-hidden="true"></span>THEME
        </button>
      </div>

      <div class="identity">
        <div class="identity-text">
          <span class="identity-name">ALEX F-R</span>
          <span class="identity-stat"><strong>@${profile.company.name.toUpperCase()}</strong> · ${profile.location}</span>
        </div>
        <a class="avatar-tile" href="#messenger" aria-label="About Alexander Forbes-Reed in Alex’s Main Stream Media" onClick=${(e:MouseEvent)=>{e.preventDefault();window.dispatchEvent(new CustomEvent('open-site-app',{detail:'messenger'}));}}>
          <span>${profile.initials}</span>
        </a>
      </div>
    </header>
  `;
}
