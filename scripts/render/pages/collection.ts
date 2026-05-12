import { Fragment } from 'preact';
import { html } from 'htm/preact';
import type { VNode } from 'preact';

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

        <div class="bio-socials">
          <a href="https://github.com/0xdeafcafe" target="_blank" rel="noopener noreferrer">github</a>
          <a href="https://linkedin.com/in/0xdeafcafe" target="_blank" rel="noopener noreferrer">linkedin</a>
          <a href="https://instagram.com/afr.png" target="_blank" rel="noopener noreferrer">instagram</a>
          <a href="https://twitter.com/0xdeafcafe" target="_blank" rel="noopener noreferrer">twitter / x</a>
        </div>
      </div>

      <div class="bio-sections">
        <div class="bio-section">
          <div class="meta-label">at work</div>
          <p class="bio-line">
            the <a href="https://langwatch.ai" target="_blank" rel="noopener noreferrer">langwatch platform</a> 🏰
            and its <a href="https://github.com/langwatch" target="_blank" rel="noopener noreferrer">open-source sdks</a>
            — typescript 💻, python 🐍, go ⚡.
          </p>
        </div>

        <div class="bio-section">
          <div class="meta-label">off-hours</div>
          <p class="bio-line">
            <a href="https://github.com/0xdeafcafe/bloefish" target="_blank" rel="noopener noreferrer">bloefish</a>
            — a 💅 local AI assistant. and
            <a href="https://github.com/getbeak/beak" target="_blank" rel="noopener noreferrer">beak</a>
            — a 🐦 API crafting tool.
          </p>
        </div>

        <div class="bio-section">
          <div class="meta-label">otherwise</div>
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
