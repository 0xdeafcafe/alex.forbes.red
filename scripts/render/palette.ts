// Deterministic gradient palette. Same seed → same colors, so a given
// album/artist always renders with the same gradient across builds.

const POOL = [
  { c1: '#ffb347', c2: '#5a1d04' }, { c1: '#ff7a1c', c2: '#0a0500' },
  { c1: '#5a3010', c2: '#0a0a0a' }, { c1: '#ff5a8a', c2: '#1a0a3a' },
  { c1: '#fde68a', c2: '#5d2a0a' }, { c1: '#5d6d7e', c2: '#0a0a14' },
  { c1: '#3d2410', c2: '#0a0a0a' }, { c1: '#1a1a1a', c2: '#000000' },
  { c1: '#04405d', c2: '#01081a' }, { c1: '#a06030', c2: '#1c0e07' },
  { c1: '#444444', c2: '#0a0a0a' }, { c1: '#1a1a3e', c2: '#0a0a14' },
  { c1: '#a06420', c2: '#1a0a04' }, { c1: '#3a0050', c2: '#0a0a0a' },
  { c1: '#5b8a3a', c2: '#0a1004' }, { c1: '#2a3d5d', c2: '#050a14' },
  { c1: '#ff6b3c', c2: '#1a0500' }, { c1: '#d22a8a', c2: '#1a0a14' },
];

export function paletteFor(seed: string): { c1: string; c2: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return POOL[h % POOL.length];
}
