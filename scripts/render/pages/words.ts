import { wordCard } from '../components/word-card.js';
import type { SiteData } from '../../lib/types.js';

export function renderWordsGrid(data: SiteData): string {
  return data.words.map(wordCard).join('');
}
