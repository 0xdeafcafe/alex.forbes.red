// Music page: mosaic + stats rail (pattern + genres), tabbed top-artists
// strip, tabbed feed (recent / top tracks), SoundCloud likes.

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

function Mosaic({ data }: { data: SiteData }): VNode {
  return html`${data.albums.map((a, i) => html`<${AlbumMosaicTile} album=${a} index=${i} />`)}`;
}

// Sparkline shaping. The raw streams-per-hour distribution is extremely
// peaked — one or two evening hours can hit 90, and quiet morning hours sit
// at 1–5. Plotted linearly the morning bars disappear. Take a power curve
// (0.55) to compress the dynamic range so low values are still visible as
// bars rather than dots.
function shapeBar(c: number, max: number): number {
  if (max <= 0) return 0;
  return Math.pow(c / max, 0.55);
}

function PatternHours({ data }: { data: SiteData }): VNode {
  const buckets = data.statsfmDateStats?.hours ?? {};
  const counts = Array.from({ length: 24 }, (_, h) => buckets[String(h)]?.count ?? 0);
  const max = Math.max(1, ...counts);
  return html`${counts.map((c, h) => html`
    <span class="bar" style=${`--v: ${shapeBar(c, max).toFixed(3)}`} title=${`${h}:00 · ${c} streams`} />
  `)}`;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function PatternWeekdays({ data }: { data: SiteData }): VNode {
  const buckets = data.statsfmDateStats?.weekDays ?? {};
  const counts = Array.from({ length: 7 }, (_, i) => buckets[String(i + 1)]?.count ?? 0);
  const max = Math.max(1, ...counts);
  return html`${counts.map((c, i) => html`
    <span class="bar" style=${`--v: ${shapeBar(c, max).toFixed(3)}`} title=${`${WEEKDAY_LABELS[i]} · ${c} streams`} />
  `)}`;
}

function Genres({ data }: { data: SiteData }): VNode {
  const top = (data.topGenres ?? []).slice(0, 6);
  if (!top.length) return html``;
  // Stats.fm doesn't return a play count per genre — derive a relative
  // weight from position so the leader gets ~100% and the bottom row a thin
  // sliver. Better than nothing, matches the Zune "topN with bar" feel.
  const weights = top.map((_, i) => 1 - i * 0.13);
  const sum = weights.reduce((a, b) => a + b, 0);
  return html`${top.map((g, i) => {
    const pct = Math.round((weights[i] / sum) * 100);
    return html`
      <div class="genre-row">
        <span class="genre-tag">${g.tag}</span>
        <span class="genre-pct">${pct}%</span>
        <span class="genre-bar"><span class="genre-bar-fill" style=${`--w: ${pct}%`} /></span>
      </div>
    `;
  })}`;
}

function ArtistsTabs({ data }: { data: SiteData }): VNode {
  const [tab, setTab] = useState<'lifetime' | 'lastyear'>('lastyear');
  const list = tab === 'lifetime' ? data.topArtistsLifetime : data.topArtistsLastYear;
  return html`
    <div id="music-artists-section" class="music-section">
      <h2 class="section-label-big">top artists</h2>
      <div class="pivot-tabs" role="tablist" aria-label="top artists range">
        <button class=${`pivot-tab${tab === 'lifetime' ? ' is-active' : ''}`} type="button" role="tab"
          aria-selected=${tab === 'lifetime' ? 'true' : 'false'}
          onClick=${() => setTab('lifetime')}>lifetime</button>
        <button class=${`pivot-tab${tab === 'lastyear' ? ' is-active' : ''}`} type="button" role="tab"
          aria-selected=${tab === 'lastyear' ? 'true' : 'false'}
          onClick=${() => setTab('lastyear')}>last year</button>
      </div>
      <div class="artists-strip">
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
      <div class="pivot-tabs" role="tablist" aria-label="feed range">
        <button class=${`pivot-tab${tab === 'recent' ? ' is-active' : ''}`} type="button" role="tab"
          aria-selected=${tab === 'recent' ? 'true' : 'false'}
          onClick=${() => setTab('recent')}>recent</button>
        <button class=${`pivot-tab${tab === 'tracks' ? ' is-active' : ''}`} type="button" role="tab"
          aria-selected=${tab === 'tracks' ? 'true' : 'false'}
          onClick=${() => setTab('tracks')}>top · past 4 weeks</button>
      </div>
      <div class="feed-table-head">
        <span></span><span>song</span><span>artist</span><span>album</span>
        <span class="feed-right">when</span>
      </div>
      <div class="feed-table">${rows}</div>
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
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">music</div>
      <h2 class="section-label-big">in rotation</h2>

      <div class="music-stats-row">
        <div class="music-mosaic"><${Mosaic} data=${data} /></div>
        <aside class="stats-rail" aria-label="listening pattern">
          <section class="stat-block">
            <h3 class="stat-label">pattern</h3>
            <div class="stat-sub">hourly</div>
            <div class="pattern-bars pattern-bars-24"><${PatternHours} data=${data} /></div>
            <div class="pattern-axis pattern-axis-24"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
            <div class="stat-sub">weekday</div>
            <div class="pattern-bars pattern-bars-7"><${PatternWeekdays} data=${data} /></div>
            <div class="pattern-axis pattern-axis-7"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
          </section>
          <section class="stat-block">
            <h3 class="stat-label">top genres</h3>
            <div class="genre-list"><${Genres} data=${data} /></div>
          </section>
        </aside>
      </div>

      <${ArtistsTabs} data=${data} />
      <${FeedTabs} data=${data} />
      <${SoundcloudSection} data=${data} />
    </${Fragment}>
  `;
}
