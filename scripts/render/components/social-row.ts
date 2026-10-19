import { html } from 'htm/preact';
import type { VNode } from 'preact';

import {profile} from '../../lib/profile.js';

export function SocialRow(): VNode {
  return html`
    <div class="quickplay-social-links">
      ${profile.socials.map(l => html`
        <a class="quickplay-social-link" href=${l.href} target="_blank" rel="noopener noreferrer" aria-label=${l.label}>
          ${l.label}
        </a>
      `)}
    </div>
  `;
}
