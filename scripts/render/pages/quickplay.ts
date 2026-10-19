import {profile} from '../../lib/profile.js';
// Quickplay: art-led pins, recent additions, history and favourite artists.

import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { paletteFor } from '../palette.js';
import { AlbumTile } from '../components/tile.js';
import { SmartTile } from '../components/smart-tile.js';
import { SocialRow } from '../components/social-row.js';
import type { Album, Recent, SiteData } from '../../lib/types.js';

// Squash recently-played tracks into a deduped "recently visited albums" list,
// using the album image when present and a paletted gradient otherwise.
function recentTracksToAlbums(recent: Recent[], max: number): Album[] {
  const seen = new Set<string>();
  const out: Album[] = [];
  for (const t of recent) {
    const key = `${t.artist}::${t.album || t.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pal = paletteFor(key);
    out.push({
      artist: t.artist,
      name: t.album || t.name,
      coverUrl: t.coverUrl,
      url: t.url,
      c1: pal.c1,
      c2: pal.c2,
    });
    if (out.length >= max) break;
  }
  return out;
}

function History({ data }: { data: SiteData }): VNode {
  const items = recentTracksToAlbums(data.recentlyPlayed, 10).slice(5);
  if (!items.length) return html`<p class="muted">More listening history will appear here.</p>`;
  return html`${items.map((a, i) => html`<${AlbumTile} album=${a} big=${i === 0} />`)}`;
}

function SmartDj({ data }: { data: SiteData }): VNode {
  // Prefer real top artists with their photos; fall back to top albums when
  // stats.fm hasn't returned an artist list yet.
  const items = data.topArtists.length
    ? data.topArtists.slice(0, 8).map(ar => ({
        name: ar.name,
        image: ar.image,
        url: ar.url,
        followers: ar.followers,
      }))
    : data.albums.slice(0, 8).map(a => ({
        name: a.artist,
        image: a.coverUrl,
        url: a.url,
        c1: a.c1,
        c2: a.c2,
      }));
  return html`${items.map(item => html`<${SmartTile} item=${item} />`)}`;
}

export function QuickplayPage({ data }: { data: SiteData }): VNode {
  return html`
    <${Fragment}>

      <div class="quickplay">
        <div class="qp-rows">
          <div class="qp-col qp-pins">
            <h2 class="section-label-big">pins</h2>
            <div class="qp-grid">${data.albums.slice(0, 4).map(a => html`<${AlbumTile} album=${a} />`)}</div>
          </div>
          <div class="qp-col qp-new">
            <h2 class="section-label-big">new</h2>
            <div class="qp-grid">${recentTracksToAlbums(data.recentlyPlayed, 5).map((a,i) => html`<${AlbumTile} album=${a} big=${i===0} />`)}</div>
          </div>
          <div class="qp-col qp-history">
            <h2 class="section-label-big">history</h2>
            <div class="qp-grid"><${History} data=${data} /></div>
          </div>
        </div>

        <div class="qp-profile"><span>Alexander Forbes-Reed · ${profile.role} @ <a href=${profile.company.url} target="_blank" rel="noopener noreferrer">${profile.company.name}</a></span><${SocialRow}/></div>
        <div class="smart-dj">
          <h2 class="section-label-big">on repeat</h2>
          <div class="smart-strip"><${SmartDj} data=${data} /></div>
        </div>
      </div>
    </${Fragment}>
  `;
}
