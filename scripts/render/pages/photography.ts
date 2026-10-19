import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { PhotoMosaicTile } from '../components/photo-tile.js';
import type { SiteData } from '../../lib/types.js';

export function PhotographyPage({ data }: { data: SiteData }): VNode {
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">photography</div>
      <div class="music-header">
        <h2 class="section-label-big">selected frames</h2>
        <div class="snapshot-meta">${data.photos.length} frames · from my own collection</div>
      </div>
      <div class="photo-mosaic">
        ${data.photos.map((p, i) => html`<${PhotoMosaicTile} photo=${p} index=${i} />`)}
      </div>
    </${Fragment}>
  `;
}
