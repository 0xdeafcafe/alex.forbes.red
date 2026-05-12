import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { PhotoMosaicTile } from '../components/photo-tile.js';
import type { SiteData } from '../../lib/types.js';

function InstagramMeta({ data }: { data: SiteData }): VNode | null {
  if (!data.instagramUser || !data.photos.length) return null;
  const u = data.instagramUser;
  return html`${data.photos.length} frames · live from <a href=${`https://www.instagram.com/${u}`} target="_blank" rel="noopener noreferrer">@${u}</a>`;
}

export function PhotographyPage({ data }: { data: SiteData }): VNode {
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">photography</div>
      <div class="music-header">
        <h2 class="section-label-big">selected frames</h2>
        <div class="snapshot-meta"><${InstagramMeta} data=${data} /></div>
      </div>
      <div class="photo-mosaic">
        ${data.photos.map((p, i) => html`<${PhotoMosaicTile} photo=${p} index=${i} />`)}
      </div>
    </${Fragment}>
  `;
}
