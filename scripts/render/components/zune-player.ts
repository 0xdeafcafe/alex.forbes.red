import {html} from 'htm/preact';
import {useEffect, useRef, useState} from 'preact/hooks';
import type {VNode} from 'preact';
import type {SiteData} from '../../lib/types.js';

/** Listening-history viewer. These records have outbound URLs, not audio sources. */
export function ZunePlayer({data}: {data:SiteData}): VNode {
  const footer=useRef<HTMLElement>(null);
  const [animate,setAnimate]=useState(false);
  useEffect(()=>{const el=footer.current;if(!el)return;let intersecting=false;const update=()=>setAnimate(intersecting&&!document.hidden);const observer=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;update();});observer.observe(el);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};},[]);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const tracks = data.recentlyPlayed.slice(0, 30);
  const track = tracks[index];
  const artwork = data.albums.filter(a => a.coverUrl).slice(0, 48);
  const covers = artwork.length ? Array.from({length:Math.max(48,artwork.length)},(_,i)=>artwork[i%artwork.length]) : [];
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  const open = () => dialog.current?.showModal();
  return html`<footer ref=${footer} class="zune-player" data-animate=${animate}><span class="alex-ambient-glow" aria-hidden="true"/>
    <img class="zune-player-mark" src="/assets/alex/alex-icon.svg" alt="Alex" width="28" height="32" />
    <div class="zune-player-track">
      ${track?.coverUrl ? html`<img src=${track.coverUrl} alt="" width="38" height="38"/>` : null}
      <div><small>${track ? (index === 0 ? 'last played' : 'from listening history') : 'music collection'}</small><strong>${track?.name || 'Explore the collection'}</strong><span>${track?.artist || `${data.albums.length} albums`}</span></div>
    </div>
    <div class="zune-player-actions">
      ${track?.url ? html`<a class="zune-round" href=${track.url} target="_blank" rel="noopener noreferrer" aria-label=${`Open ${track.name} on music service`} title="Open on music service">↗</a>` : null}
      <button ref=${trigger} class="zune-round" onClick=${open} aria-label="Open full-screen listening history" title="Full-screen listening history">⛶</button>
    </div>
    <dialog ref=${dialog} class="zune-now-playing" aria-label="Full-screen listening history" onCancel=${(e:Event)=>{e.preventDefault();close();}}>
      <div class="zune-collage" aria-hidden="true">${covers.map((a,i)=>html`<img key=${`${a.artist}-${a.name}-${i}`} src=${a.coverUrl} alt=""/>`)}</div>
      <div class="zune-collage-shade"></div>
      <button class="zune-now-close zune-round" onClick=${close} aria-label="Back to Alex" autofocus>←</button>
      <div class="zune-now-detail">
        ${track?.coverUrl ? html`<img class="zune-now-cover" src=${track.coverUrl} alt=${track.album || track.name}/>` : null}
        <div><p class="zune-history-label">listening history · not playing</p><h2>${track?.artist || 'your collection'}</h2><p>${track?.album}</p><h3>${track?.name || 'No recent tracks'}</h3>
        ${track?.url ? html`<a class="zune-service-link" href=${track.url} target="_blank" rel="noopener noreferrer">open on music service ↗</a>` : null}</div>
      </div>
      <nav class="zune-now-history" aria-label="Recent tracks"><h2>history</h2>${tracks.map((t,i)=>html`<button key=${`${t.endTime}-${i}`} class=${i===index?'is-selected':''} aria-pressed=${i===index} onClick=${()=>setIndex(i)}><strong>${t.name}</strong><span>${t.artist}</span></button>`)}</nav>
      <p class="zune-now-note">Album artwork from Alex’s collection. Select a track to explore.</p>
    </dialog>
  </footer>`;
}
