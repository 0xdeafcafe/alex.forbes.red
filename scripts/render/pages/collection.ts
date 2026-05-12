import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { SocialRow } from '../components/social-row.js';

export function CollectionPage(): VNode {
  return html`
    <${Fragment}>
      <div class="page-watermark" aria-hidden="true">collection</div>
      <div class="bio-block">
        <h2 class="bio-headline">
          i love working with and on <em>apis</em>, <em>reverse engineering</em>,
          <em>observability</em>, <em>event-driven systems</em>, and also <em>ai</em> is okay too i guess.
        </h2>

        <div class="bio-meta">
          <div class="meta-block">
            <div class="meta-label">currently</div>
            <div class="meta-value">
              Founding Engineer<br />
              <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">@langwatch</a>
            </div>
          </div>
          <div class="meta-block">
            <div class="meta-label">based</div>
            <div class="meta-value">Amsterdam, NL</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">stack</div>
            <div class="meta-value">TypeScript · React · Go · Claude (lol) · Postgres · MongoDB · ClickHouse</div>
          </div>
        </div>

        <div class="bio-find-me">
          <div class="bio-section-label">find me online</div>
          <${SocialRow} />
        </div>
      </div>

      <div class="bio-sections">
        <div class="bio-section">
          <div class="bio-section-label">eng stuff @ work:</div>
          <ul class="bio-list">
            <li>working on the
              <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">@langwatch/platform</a>
              🏰</li>
            <li>working on the
              <a href="https://github.com/langwatch" target="_blank" rel="noopener noreferrer">@langwatch open source sdk's</a>
              (typescript 💻, python 🐍, go ⚡)</li>
          </ul>
        </div>

        <div class="bio-section">
          <div class="bio-section-label">eng stuff not @ work i'm not bored of:</div>
          <ul class="bio-list">
            <li>a 💅 stylish 💅 local and mutli-model AI assistant over at
              <a href="https://github.com/0xdeafcafe/bloefish" target="_blank" rel="noopener noreferrer">0xdeafcafe/bloefish</a>
            </li>
            <li>a chirpy 🐦 and feathery 🪶 API crafting tool over at
              <a href="https://github.com/getbeak/beak" target="_blank" rel="noopener noreferrer">getbeak/beak</a>
            </li>
          </ul>
        </div>

        <div class="bio-section">
          <div class="bio-section-label">when not @ work:</div>
          <p class="bio-emoji">
            🥳 ·
            <a href="/projects" class="bio-emoji-link" aria-label="Projects">🧑‍💻</a> ·
            🧑‍🍳 ·
            <a href="/photography" class="bio-emoji-link" aria-label="Photography">📷</a> ·
            <a href="/music" class="bio-emoji-link" aria-label="Music">🎶</a> ·
            <a href="/words" class="bio-emoji-link" aria-label="Words">✏️</a>
          </p>
        </div>
      </div>
    </${Fragment}>
  `;
}
