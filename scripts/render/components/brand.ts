import {html} from 'htm/preact';
import type {VNode} from 'preact';

export function GrooveMark(): VNode {
  return html`<span class="groove-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;
}
