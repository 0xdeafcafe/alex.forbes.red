import { $ } from '../lib/dom.js';
import { words } from '../data/store.js';
import { makeWordCard } from '../components/word-card.js';

export function renderWords() {
  const host = $('#words-grid');
  host.innerHTML = '';
  words.forEach(w => host.appendChild(makeWordCard(w)));
}
