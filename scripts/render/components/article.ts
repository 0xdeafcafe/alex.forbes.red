import { html } from 'htm/preact';
import { createElement, type ComponentChildren, type VNode } from 'preact';
import type { ArticleNode, ArticleTag, WordContent } from '../../lib/types.js';

const tags = new Set<ArticleTag>([
  'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote',
  'a', 'strong', 'em', 'b', 'i', 's', 'del', 'u', 'br', 'hr', 'img', 'figure',
  'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'dl', 'dt', 'dd', 'sup', 'sub', 'div',
]);

function safeLink(value: string | undefined): string | undefined {
  return value && /^(https?:\/\/|mailto:)/i.test(value.trim()) ? value : undefined;
}

function renderNode(node: ArticleNode): ComponentChildren {
  if (typeof node === 'string') return node;
  if (!tags.has(node.tag)) return null;
  const children = node.children.map(renderNode);
  if (node.tag === 'img') {
    // Embedded raster images are inert and never contact the original publisher.
    if (!node.src || !/^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(node.src)) return null;
    return html`<img src=${node.src} alt=${node.alt ?? ''} loading="lazy" decoding="async"/>`;
  }
  if (node.tag === 'a') {
    const href = safeLink(node.href);
    return href ? html`<a href=${href} target="_blank" rel="noopener noreferrer">${children}</a>` : children;
  }
  const props: Record<string, number> = {};
  if (node.tag === 'ol' && Number.isInteger(node.start)) props.start = node.start!;
  if (node.tag === 'td' || node.tag === 'th') {
    if (Number.isInteger(node.colspan) && node.colspan! > 0) props.colSpan = node.colspan!;
    if (Number.isInteger(node.rowspan) && node.rowspan! > 0) props.rowSpan = node.rowspan!;
  }
  return createElement(node.tag, props, children);
}

export function ArticleBody({word}: {word: WordContent}): VNode {
  const article = word.article;
  return html`<div class="article-body">
    ${article?.note && html`<p class="article-note">${article.note}</p>`}
    ${article?.blocks.length ? article.blocks.map(renderNode) : html`<p>The full text could not be recovered. You can try the original publication or its archived copy below.</p>`}
    ${!!article?.missingImages?.length && html`<p class="article-note">${article.missingImages.length} original image(s) could not be recovered. The article text is available above.</p>`}
    <footer class="article-source"><a href=${safeLink(article?.originalUrl ?? word.url)} target="_blank" rel="noopener noreferrer">Open original publication ↗</a>
      ${article && article.retrievedFrom !== article.originalUrl && html`<a href=${safeLink(article.retrievedFrom)} target="_blank" rel="noopener noreferrer">Read archived source ↗</a>`}
      ${word.archiveUrl && html`<a href=${safeLink(word.archiveUrl)} target="_blank" rel="noopener noreferrer">Archive link ↗</a>`}
    </footer>
  </div>`;
}
