import { GrooveMark } from './brand.js';
import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export function Welcome({ onEnter, onTurnOff }: { onEnter: () => void; onTurnOff: () => void }): VNode {
  const [entering, setEntering] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const enter = () => {
    if (entering) return;
    setEntering(true);
    const sound = new Audio('/assets/audio/xp-startup.wav');
    sound.volume = .55;
    void sound.play().catch(() => {});
    timer.current = setTimeout(onEnter, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100);
  };
  return html`<section class=${`xp-welcome${entering ? ' is-entering' : ''}`} aria-label="Windows XP welcome screen">
    <div class="xp-welcome-top"></div>
    <div class="xp-welcome-main">
      <div class="xp-welcome-brand"><div class="xp-wordmark"><${GrooveMark}/><small>Forbesoft</small><div>Windows<span>xp</span></div></div>
        <p>${entering ? 'welcome' : 'To begin, enter as a visitor.'}</p>
      </div>
      <div class="xp-welcome-divider"></div>
      <div class="xp-welcome-accounts"><button class="xp-account" onClick=${enter} disabled=${entering}>
        <span class="xp-account-picture"><img src="/assets/xp/computer.png" alt="" /></span>
        <span><strong>Visitor</strong><small>Explore Alexander Forbes-Reed’s desktop</small></span>
      </button><p class="xp-login-status" role="status">${entering ? 'welcome' : ''}</p></div>
    </div>
    <div class="xp-welcome-bottom"><button class="xp-turn-off" onClick=${onTurnOff}><span class="xp-power-icon" aria-hidden="true">⏻</span>Turn off computer</button><p>Alexander Forbes-Reed · Engineer<br />Music, photos, code and a little chaos.</p></div>
  </section>`;
}
