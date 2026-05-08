// Hardcoded content used when the live snapshot is empty (local dev before
// the first stats.fm fetch, or a fetch failure with no prior data).
// `projects` and `words` always come from here — they don't have an upstream.

export const fallbackAlbums = [
  { artist: 'Daft Punk', name: 'Discovery', year: 2001, c1: '#ffb347', c2: '#5a1d04', large: true, url: 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc' },
  { artist: 'Radiohead', name: 'In Rainbows', year: 2007, c1: '#ff7a1c', c2: '#0a0500' },
  { artist: 'Kendrick Lamar', name: 'To Pimp a Butterfly', year: 2015, c1: '#5a3010', c2: '#0a0a0a' },
  { artist: 'Tame Impala', name: 'Currents', year: 2015, c1: '#ff5a8a', c2: '#1a0a3a' },
  { artist: 'Frank Ocean', name: 'Blonde', year: 2016, c1: '#fde68a', c2: '#5d2a0a' },
  { artist: 'Bon Iver', name: '22, A Million', year: 2016, c1: '#5d6d7e', c2: '#0a0a14', large: true },
  { artist: 'The Strokes', name: 'Is This It', year: 2001, c1: '#3d2410', c2: '#0a0a0a' },
  { artist: 'Arctic Monkeys', name: 'AM', year: 2013, c1: '#1a1a1a', c2: '#000000' },
  { artist: 'Aphex Twin', name: 'Selected Ambient Works 85-92', year: 1992, c1: '#444444', c2: '#0a0a0a' },
  { artist: 'Burial', name: 'Untrue', year: 2007, c1: '#1a1a3e', c2: '#0a0a14' },
  { artist: 'Fleetwood Mac', name: 'Rumours', year: 1977, c1: '#a06420', c2: '#1a0a04' },
  { artist: 'Pink Floyd', name: 'The Dark Side of the Moon', year: 1973, c1: '#0a0a0a', c2: '#3a0050', large: true },
  { artist: 'Beach House', name: 'Bloom', year: 2012, c1: '#04405d', c2: '#01081a' },
  { artist: 'Boards of Canada', name: 'Music Has the Right to Children', year: 1998, c1: '#a06030', c2: '#1c0e07' },
  { artist: 'Massive Attack', name: 'Mezzanine', year: 1998, c1: '#444444', c2: '#0a0a0a' },
  { artist: "D'Angelo", name: 'Voodoo', year: 2000, c1: '#5d2a10', c2: '#0a0500' },
  { artist: 'Caribou', name: 'Our Love', year: 2014, c1: '#d22a8a', c2: '#1a0a14' },
  { artist: 'Four Tet', name: 'There Is Love in You', year: 2010, c1: '#5b8a3a', c2: '#0a1004' },
  { artist: 'James Blake', name: 'James Blake', year: 2011, c1: '#2a3d5d', c2: '#050a14' },
  { artist: 'Jamie xx', name: 'In Colour', year: 2015, c1: '#ff6b3c', c2: '#1a0500' },
];

export const fallbackPhotos = [
  { seed: 'afr-canal-1', title: 'Keizersgracht', loc: 'Amsterdam', large: true },
  { seed: 'afr-tram', title: 'Tram lines, late', loc: 'Amsterdam' },
  { seed: 'afr-cafe', title: 'Sunday cafe', loc: 'De Pijp' },
  { seed: 'afr-bike', title: 'Stack of bikes', loc: 'Amstel', tall: true },
  { seed: 'afr-window', title: 'Window light', loc: 'Jordaan' },
  { seed: 'afr-skyline', title: 'Old Centrum', loc: 'Dam Square', wide: true },
  { seed: 'afr-bridge', title: 'Bridge over IJ', loc: 'Amsterdam' },
  { seed: 'afr-rain', title: 'After rain', loc: 'Vondelpark' },
  { seed: 'afr-coffee', title: 'Espresso', loc: 'Anne&Max' },
  { seed: 'afr-park', title: 'Vondel walk', loc: 'Vondelpark', large: true },
  { seed: 'afr-glass', title: 'Through the glass', loc: 'NDSM' },
  { seed: 'afr-canal-2', title: 'Reflections', loc: 'Prinsengracht' },
  { seed: 'afr-night', title: 'Late tram', loc: 'Centrum' },
  { seed: 'afr-store', title: 'Storefront', loc: 'Negen Straatjes' },
];
fallbackPhotos.forEach(p => {
  if (!p.url) p.url = `https://picsum.photos/seed/${encodeURIComponent(p.seed)}/800/800`;
});

export const projects = [
  { name: 'react contextual analytics', tag: 'React Library', icon: 'bar-chart-2', desc: 'A React framework for cleanly handling analytics, keeping your components clean.', url: 'https://github.com/0xdeafcafe/react-contextual-analytics' },
  { name: 'cypher swift', tag: 'Cryptography', icon: 'music', desc: 'A cipher algorithm to encode data into Taylor Swift lyrics.', url: 'https://github.com/0xdeafcafe/cypher-swift' },
  { name: 'fucking focus', tag: 'Productivity', icon: 'focus', desc: 'A pretty simple fucking way to keep your fucking focus.', url: 'https://github.com/0xdeafcafe/focus' },
  { name: 'ezy qr', tag: 'Utility', icon: 'qr-code', desc: 'A quick, easy, and dirty way to generate QR codes.', url: 'https://github.com/0xdeafcafe/ezy-qr' },
  { name: 'pillar box', tag: 'Browser Extension', icon: 'mail', desc: 'Bring the macOS "autofill SMS" feature to Chromium based browsers.', url: 'https://github.com/0xdeafcafe/pillar-box' },
  { name: 'assembly', tag: 'Reverse Engineering', icon: 'gamepad-2', desc: 'Research and modding tool for all games built on Bungie\'s blam! game engine.', url: 'https://github.com/XboxChaos/Assembly' },
  { name: 'go xbdm', tag: 'Reverse Engineering', icon: 'radio', desc: 'Go library for interacting with Xbox 360 development consoles via the XBDM protocol.', url: 'https://github.com/0xdeafcafe/go-xbdm' },
  { name: 'branch', tag: 'Platform', icon: 'git-branch', desc: 'Platform for tracking and viewing stats of various Halo games.', url: 'https://github.com/0xdeafcafe/branch' },
];

export const words = [
  { source: 'LangWatch · Engineering', title: 'why we threw the baby out with the bathwater: becoming opentelemetry native', url: 'https://archive.is/gISpO' },
  { source: 'Personal · Research', title: "is snapchat's unofficial api just too easy to hack?", url: 'https://archive.is/rpSEh' },
];

// Cycle of card-tone CSS classes used on the projects page.
export const projectTones = ['purple', 'orange', 'green', 'red', 'blue', 'brown', 'teal', 'pink'];
