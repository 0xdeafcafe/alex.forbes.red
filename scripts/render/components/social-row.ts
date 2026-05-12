import { html } from 'htm/preact';
import type { VNode } from 'preact';

interface Social { href: string; icon: string; label: string }
const LINKS: Social[] = [
  { href: 'https://github.com/0xdeafcafe',     icon: 'si-github',    label: 'GitHub' },
  { href: 'https://instagram.com/afr.png',     icon: 'si-instagram', label: 'Instagram' },
  { href: 'https://linkedin.com/in/0xdeafcafe', icon: 'si-linkedin', label: 'LinkedIn' },
  { href: 'https://twitter.com/0xdeafcafe',    icon: 'si-x',         label: 'Twitter / X' },
];

export function SocialRow(): VNode {
  return html`
    <div class="welcome-actions">
      ${LINKS.map(l => html`
        <a class="welcome-btn" href=${l.href} target="_blank" rel="noopener noreferrer" aria-label=${l.label}>
          <span class="btn-circle"><i class=${`si ${l.icon}`}></i></span>
        </a>
      `)}
    </div>
  `;
}
