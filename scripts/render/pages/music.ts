// White Zune collection browser with artist filters and real listening records.

import { Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { AlbumMosaicTile } from '../components/album-tile.js';
import { ArtistTile } from '../components/artist-tile.js';
import { RecentRow } from '../components/recent-row.js';
import { TrackRow } from '../components/track-row.js';
import type { SiteData } from '../../lib/types.js';

const SC_CLAMP = 60;

function rangeKeys(e: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) || e.altKey || e.metaKey || e.ctrlKey) return;
  const tabs = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
  e.preventDefault(); tabs[next]?.click(); tabs[next]?.focus();
}

function ArtistsTabs({ data }: { data: SiteData }): VNode {
  const [tab, setTab] = useState<'lifetime' | 'lastyear'>('lastyear');
  const list = tab === 'lifetime' ? data.topArtistsLifetime : data.topArtistsLastYear;
  return html`
    <div id="music-artists-section" class="music-section">
      <h2 class="section-label-big">top artists</h2>
      <div class="pivot-tabs" role="tablist" aria-label="top artists range" onKeyDown=${rangeKeys}>
        <button class=${`pivot-tab${tab === 'lifetime' ? ' is-active' : ''}`} type="button" role="tab"
          id="range-lifetime" aria-controls="artists-results" tabIndex=${tab === 'lifetime' ? 0 : -1} aria-selected=${tab === 'lifetime'}
          onClick=${() => setTab('lifetime')}>lifetime</button>
        <button class=${`pivot-tab${tab === 'lastyear' ? ' is-active' : ''}`} type="button" role="tab"
          id="range-lastyear" aria-controls="artists-results" tabIndex=${tab === 'lastyear' ? 0 : -1} aria-selected=${tab === 'lastyear'}
          onClick=${() => setTab('lastyear')}>last year</button>
      </div>
      <div class="artists-strip" id="artists-results" role="tabpanel" aria-labelledby=${`range-${tab}`} tabIndex="0">
        ${list.slice(0, 12).map((ar, i) => html`<${ArtistTile} artist=${ar} index=${i} />`)}
      </div>
    </div>
  `;
}

// Most stats.fm "albums" for our data are actually single-track releases
// where album === song title — rendering both is pure visual noise. Drop
// the album when it adds nothing.
function distinctAlbum(song: string, album: string | undefined): string | undefined {
  if (!album) return undefined;
  if (album.toLowerCase() === song.toLowerCase()) return undefined;
  return album;
}

function FeedTabs({ data }: { data: SiteData }): VNode {
  const [tab, setTab] = useState<'recent' | 'tracks'>('recent');
  const rows = tab === 'recent'
    ? data.recentlyPlayed.slice(0, 14).map((t, i) => html`
        <${TrackRow}
          url=${t.url}
          song=${t.name}
          artist=${t.artist}
          album=${distinctAlbum(t.name, t.album)}
          coverUrl=${t.coverUrl}
          timestamp=${t.endTime}
          paletteSeed=${`${t.artist}::${t.album || t.name}`}
          index=${i}
        />
      `)
    : data.topTracks.slice(0, 14).map((t, i) => html`
        <${TrackRow}
          url=${t.url}
          song=${t.name}
          artist=${t.artist}
          album=${distinctAlbum(t.name, t.album)}
          coverUrl=${t.coverUrl}
          rightLabel=${`#${t.position}`}
          paletteSeed=${`${t.artist}::${t.album || t.name}`}
          index=${i}
        />
      `);
  return html`
    <div id="music-feed-section" class="music-section">
      <h2 class="section-label-big">the feed</h2>
      <div class="pivot-tabs" role="tablist" aria-label="feed range" onKeyDown=${rangeKeys}>
        <button class=${`pivot-tab${tab === 'recent' ? ' is-active' : ''}`} type="button" role="tab"
          id="range-recent" aria-controls="feed-results" tabIndex=${tab === 'recent' ? 0 : -1} aria-selected=${tab === 'recent'}
          onClick=${() => setTab('recent')}>recent</button>
        <button class=${`pivot-tab${tab === 'tracks' ? ' is-active' : ''}`} type="button" role="tab"
          id="range-tracks" aria-controls="feed-results" tabIndex=${tab === 'tracks' ? 0 : -1} aria-selected=${tab === 'tracks'}
          onClick=${() => setTab('tracks')}>top · past 4 weeks</button>
      </div>
      <div class="feed-table-head">
        <span></span><span>song</span><span>artist</span><span>album</span>
        <span class="feed-right">${tab === 'recent' ? 'when' : 'rank'}</span>
      </div>
      <div class="feed-table" id="feed-results" role="tabpanel" aria-labelledby=${`range-${tab}`} tabIndex="0">${rows}</div>
    </div>
  `;
}

function SoundcloudMeta({ data }: { data: SiteData }): VNode | null {
  const u = data.soundcloudUser;
  const likes = data.soundcloud?.likes ?? [];
  if (!likes.length || !u) return null;
  return html`live from <a href=${`https://soundcloud.com/${u}/likes`} target="_blank" rel="noopener noreferrer">soundcloud.com/${u}</a>`;
}

function SoundcloudSection({ data }: { data: SiteData }): VNode {
  const all = data.soundcloud?.likes ?? [];
  const total = all.length;
  const [expanded, setExpanded] = useState(false);
  // Only render the clamped slice so SSR ships ~60 likes instead of 200.
  // Hydration matches because the client starts with expanded=false;
  // expanding is a client-only state change.
  const visible = all.slice(0, expanded ? total : Math.min(total, SC_CLAMP));
  return html`
    <div id="music-soundcloud-section" class="music-section">
      <h2 class="section-label-big">soundcloud likes</h2>
      <div class="snapshot-meta snapshot-meta-row"><${SoundcloudMeta} data=${data} /></div>
      <div class="recent-feed">
        ${visible.map((l, i) => {
          const subParts = [l.artist];
          if (l.uploader) subParts.push(`@${l.uploader}`);
          if (l.genre) subParts.push(l.genre);
          return html`
            <${RecentRow}
              url=${l.url}
              title=${l.title}
              subtitle=${subParts.join(' · ')}
              coverUrl=${l.artworkUrl}
              timestamp=${l.likedAt}
              paletteSeed=${`${l.artist}::${l.title}`}
              index=${i}
            />
          `;
        })}
      </div>
      ${total > SC_CLAMP && !expanded ? html`
        <button type="button" class="recent-feed-more" onClick=${() => setExpanded(true)}>
          show all ${total}
        </button>
      ` : null}
    </div>
  `;
}

export function MusicPage({ data }: { data: SiteData }): VNode {
  const [artist, setArtist] = useState('');
  const [query, setQuery] = useState('');
  const artists = [...new Set(data.albums.map(a => a.artist))].sort((a,b)=>a.localeCompare(b));
  const albums = data.albums.filter(a => (!artist || a.artist === artist) && `${a.artist} ${a.name}`.toLowerCase().includes(query.toLowerCase()));
  return html`<${Fragment}>
    <div class="zune-library-heading"><h1>music</h1><label>search collection <input type="search" value=${query} onInput=${(e:Event)=>setQuery((e.currentTarget as HTMLInputElement).value)} placeholder="Search albums or artists" /></label></div>
    <div class="zune-library">
      <nav class="zune-artists" aria-label="Filter albums by artist"><h2>artists</h2><button aria-pressed=${!artist} onClick=${()=>setArtist('')}>all artists</button>${artists.map(a=>html`<button aria-pressed=${artist===a} onClick=${()=>setArtist(a)}>${a}</button>`)}</nav>
      <section class="zune-albums"><h2>${artist || 'all albums'} <small>${albums.length}</small></h2><div class="zune-album-grid">${albums.map((a,i)=>html`<div class="zune-album-entry"><${AlbumMosaicTile} album=${a} index=${i}/><strong>${a.name}</strong><span>${a.artist}</span></div>`)}</div>${!albums.length?html`<p>No albums match this search.</p>`:null}</section>
      <aside class="zune-songs"><h2>recent songs</h2>${data.recentlyPlayed.slice(0,18).map(t=>html`<div>${t.url?html`<a href=${t.url} target="_blank" rel="noopener noreferrer">${t.name}</a>`:html`<span>${t.name}</span>`}<small>${t.artist}</small></div>`)}</aside>
    </div>
    <${ArtistsTabs} data=${data}/><${FeedTabs} data=${data}/><${SoundcloudSection} data=${data}/>
  </${Fragment}>`;
}
