// Single source of truth for runtime data. Reads the embedded build-time
// payload once and exposes the slim arrays the client modules need (tile-bg
// flipper + last-spun rotator). Page content is already rendered — these
// arrays exist purely to drive the post-render animations.

import { loadSnapshot } from './snapshot.js';

const data = loadSnapshot();

export const albums = data.albums;
export const photos = data.photos;
export const recentlyPlayed = data.recentlyPlayed;
export const words = data.words;
export const projects = data.projects;
