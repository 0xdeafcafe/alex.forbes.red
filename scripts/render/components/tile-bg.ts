// Decorative wall of album/photo tiles. Random tiles flip every couple
// seconds at low opacity so it reads as texture. Renders empty on the
// server and during initial hydration — tiles only mount once the client
// has booted (saves ~50kb of HTML and avoids hydration churn).

import { useEffect, useMemo, useState } from 'preact/hooks';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { monogram } from '../format.js';
import type { SiteData } from '../../lib/types.js';

const TOTAL_TILES = 220;
const FLIP_INTERVAL_MS = 1700;

type Face =
  | { kind: 'album'; coverUrl?: string; c1?: string; c2?: string; mono: string }
  | { kind: 'photo'; url: string };

interface Tile { front: Face; back: Face }

function faceStyle(f: Face): string {
  if (f.kind === 'album') {
    return f.coverUrl
      ? `background-image: url("${f.coverUrl}")`
      : `background: linear-gradient(135deg, ${f.c1}, ${f.c2})`;
  }
  return `background-image: url("${f.url}")`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTiles(data: SiteData): Tile[] {
  const faces: Face[] = [
    ...data.albums.map((a): Face => ({
      kind: 'album', coverUrl: a.coverUrl, c1: a.c1, c2: a.c2, mono: monogram(a.artist),
    })),
    ...data.photos.map((p): Face => ({ kind: 'photo', url: p.url })),
  ];
  if (!faces.length) return [];
  const ordered = shuffle(Array.from({ length: TOTAL_TILES }, (_, i) => faces[i % faces.length]));
  const altPool = shuffle(faces.slice());
  return ordered.map((front, i) => ({ front, back: altPool[i % altPool.length] }));
}

export function TileBg({ data }: { data: SiteData }): VNode {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tiles = useMemo(() => mounted ? buildTiles(data) : [], [mounted, data]);
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!tiles.length) return;
    const id = window.setInterval(() => {
      setFlipped(prev => {
        const next = new Set(prev);
        const batch = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < batch; i++) {
          const idx = Math.floor(Math.random() * tiles.length);
          if (next.has(idx)) next.delete(idx); else next.add(idx);
        }
        return next;
      });
    }, FLIP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [tiles.length]);

  useEffect(() => {
    let timer: number | null = null;
    const onScroll = () => {
      document.body.classList.add('scrolling-mode');
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => document.body.classList.remove('scrolling-mode'), 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return html`
    <div class="tile-bg" aria-hidden="true">
      ${tiles.map((t, i) => {
        const isFlipped = flipped.has(i);
        return html`
          <div class=${`bg-tile${isFlipped ? ' flipped' : ''}`}>
            <div class="bg-tile-face front" style=${faceStyle(t.front)}>
              ${t.front.kind === 'album' && !t.front.coverUrl ? t.front.mono : ''}
            </div>
            <div class="bg-tile-face back" style=${faceStyle(t.back)}>
              ${t.back.kind === 'album' && !t.back.coverUrl ? t.back.mono : ''}
            </div>
          </div>
        `;
      })}
    </div>
  `;
}
