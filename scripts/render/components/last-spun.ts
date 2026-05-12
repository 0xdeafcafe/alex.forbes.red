// Persistent footer rotating through the most recent thing in each category
// (music / photo / word / project). SSR renders the initial mode; the
// client hydrates and starts the rotation timer.

import { useEffect, useRef, useState } from 'preact/hooks';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { monogram, relativeTime } from '../format.js';
import { paletteFor } from '../palette.js';
import { usePivot, type Pivot } from '../../state.js';
import type { SiteData } from '../../lib/types.js';

const ROTATE_MS = 7000;
const RELATIVE_TICK_MS = 60_000;
const FADE_MS = 420;

interface Mode {
  label: string;
  title: string;
  sub: string;
  coverUrl?: string;
  paletteSeed: string;
  monoSeed: string;
  timestamp?: string;
  pivot: Pivot;
  anchor?: string;
}

function resolveModes(data: SiteData): Mode[] {
  const out: Mode[] = [];
  const t = data.recentlyPlayed[0];
  if (t) out.push({
    label: 'LAST SPUN',
    title: t.name,
    sub: t.artist,
    coverUrl: t.coverUrl,
    paletteSeed: `${t.artist}::${t.album || t.name}`,
    monoSeed: t.artist,
    timestamp: t.endTime,
    pivot: 'music',
    anchor: 'music-recent-section',
  });
  const p = data.photos[0];
  if (p?.url) out.push({
    label: 'LAST SNAPPED',
    title: p.title || 'untitled',
    sub: p.loc || 'instagram',
    coverUrl: p.url,
    paletteSeed: p.title || 'photo',
    monoSeed: p.title || 'AF',
    timestamp: p.takenAt,
    pivot: 'photography',
  });
  const w = data.words[0];
  if (w) out.push({
    label: 'LAST SCRAWLED',
    title: w.title, sub: w.source,
    paletteSeed: w.title, monoSeed: w.title,
    pivot: 'words',
  });
  const pr = data.projects[0];
  if (pr) out.push({
    label: 'LAST VIBED',
    title: pr.name, sub: pr.tag,
    paletteSeed: pr.name, monoSeed: pr.name,
    pivot: 'projects',
  });
  return out;
}

function ModeBody({ mode }: { mode: Mode }): VNode {
  const pal = paletteFor(mode.paletteSeed);
  const artStyle = mode.coverUrl ? '' : `background: linear-gradient(135deg, ${pal.c1}, ${pal.c2})`;
  return html`
    <div class=${`last-spun-art${mode.coverUrl ? ' has-art' : ''}`} style=${artStyle}>
      ${mode.coverUrl
        ? html`<img src=${mode.coverUrl} alt=${`${mode.title} — ${mode.sub}`} loading="lazy" />`
        : html`<div class="last-spun-mono">${monogram(mode.monoSeed)}</div>`}
    </div>
    <div class="last-spun-info">
      <div class="last-spun-meta">
        <span class="np-equalizer">
          <span class="np-bar"></span><span class="np-bar"></span><span class="np-bar"></span>
        </span>
        <span class="last-spun-label">${mode.label}</span>
        ${mode.timestamp ? html`<span class="last-spun-sep">·</span><span>${relativeTime(mode.timestamp)}</span>` : null}
      </div>
      <div class="last-spun-track">
        <span class="last-spun-name">${mode.title}</span>
        <span class="last-spun-sep">·</span>
        <span class="last-spun-artist">${mode.sub}</span>
      </div>
    </div>
    <i data-lucide="arrow-up-right" class="last-spun-arrow"></i>
  `;
}

export function LastSpun({ data }: { data: SiteData }): VNode | null {
  const modes = resolveModes(data);
  const { setPivot } = usePivot();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'swapping' | 'entering'>('idle');
  const [, setTick] = useState(0);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (modes.length < 2) return;
    const id = window.setInterval(() => {
      setPhase('swapping');
      fadeTimer.current = window.setTimeout(() => {
        setIdx(i => (i + 1) % modes.length);
        setPhase('entering');
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => setPhase('idle'));
        });
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(id);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, [modes.length]);

  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), RELATIVE_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!modes.length) return null;
  const mode = modes[idx];

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    setPivot(mode.pivot);
    if (mode.anchor) {
      const anchor = mode.anchor;
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  const cls = `last-spun${phase === 'swapping' ? ' is-swapping' : ''}${phase === 'entering' ? ' is-entering' : ''}`;
  return html`
    <footer class=${cls}>
      <a class="last-spun-link" href="#" onClick=${onClick}>
        <${ModeBody} mode=${mode} />
      </a>
    </footer>
  `;
}
