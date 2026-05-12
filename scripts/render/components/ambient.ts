import { html } from 'htm/preact';
import type { VNode } from 'preact';

export function Ambient(): VNode {
  return html`
    <div class="ambient">
      <div class="ambient-blob b1"></div>
      <div class="ambient-blob b2"></div>
    </div>
  `;
}
