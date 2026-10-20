import {html} from 'htm/preact';
import type {VNode} from 'preact';
import {useEffect,useRef,useState} from 'preact/hooks';
import type {SiteData} from '../../lib/types.js';

import {KeygenPlasma} from './keygen-plasma.js';

const MUSIC_PREFERENCE = 'digital-creativity-music';
const KEYGEN_TRACK = '/assets/audio/unreeeal-superhero-3.mp3';

export function Discovery({ data, closed, onClose, metro=false }: { data: SiteData; closed: boolean; onClose: () => void; metro?: boolean }): VNode {
  const projects = data.projects;
  const [index, setIndex] = useState(0);
  const [music, setMusic] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const graph = useRef<{ context: AudioContext; analyser: AnalyserNode } | null>(null);
  const attempted = useRef(false);
  const project = projects[index];
  const play = () => {
    const player = audio.current; if (!player) return;
    setAudioError(false);
    try {
      if (!graph.current && typeof AudioContext !== 'undefined') {
        const context = new AudioContext();
        const analyser = context.createAnalyser(); analyser.fftSize = 256;
        context.createMediaElementSource(player).connect(analyser);
        analyser.connect(context.destination); graph.current = { context, analyser };
      }
      void graph.current?.context.resume().catch(() => {});
    } catch { /* Audio playback remains available without the visualiser. */ }
    player.volume = 0.4;
    void player.play().then(() => {
      if (!player.paused) { try { localStorage.setItem(MUSIC_PREFERENCE, 'playing'); } catch { /* Storage is optional. */ } }
    }).catch(() => setAudioError(true));
  };
  useEffect(() => {
    const interact = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || e.target.closest('[data-music-control], .xp-window-controls, [data-creativity-exit]')) return;
      if (!e.target.closest('.window-keygen, .creativity-content, [data-creativity-launch]') || attempted.current) return;
      attempted.current = true;
      try { if (localStorage.getItem(MUSIC_PREFERENCE) === 'paused') return; } catch { /* Storage can be unavailable. */ }
      play();
    };
    document.addEventListener('click', interact, true);
    return () => document.removeEventListener('click', interact, true);
  }, []);
  useEffect(() => {
    const surface = canvas.current; const ctx = surface?.getContext('2d');
    if (!surface || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const bins = new Uint8Array(128); let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 640, 200);
      if (music && !reduced.matches) graph.current?.analyser.getByteFrequencyData(bins);
      else bins.fill(0);
      const gradient = ctx.createLinearGradient(0, 30, 0, 200);
      gradient.addColorStop(0, '#f6ffb0'); gradient.addColorStop(.5, '#b7ff61'); gradient.addColorStop(1, '#5ce4df');
      ctx.fillStyle = gradient;
      for (let i = 0; i < 64; i++) {
        const height = Math.max(2, bins[i] / 255 * 170);
        for (let y = 0; y < height; y += 5) ctx.fillRect(i * 10 + 1, 197 - y, 7, 3);
      }
      if (music && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); draw(); };
    draw(); reduced.addEventListener('change', restart);
    return () => { cancelAnimationFrame(frame); reduced.removeEventListener('change', restart); };
  }, [music]);
  useEffect(() => () => { void graph.current?.context.close(); }, []);
  useEffect(() => {
    if (closed && audio.current) {
      attempted.current = false;
      audio.current.pause();
      audio.current.currentTime = 0;
      setAudioError(false);
    }
  }, [closed]);
  const toggleMusic = () => {
    const player = audio.current;
    if (!player) return;
    attempted.current = true;
    const shouldPlay = player.paused;
    try { localStorage.setItem(MUSIC_PREFERENCE, shouldPlay ? 'playing' : 'paused'); } catch { /* Keep working without storage. */ }
    if (shouldPlay) play(); else player.pause();
  };
  if(metro)return html`<div class="metro-page metro-projects creativity-content">
    <div class="keygen-art" aria-label="Digital Creativity"><div class="keygen-plasma" aria-hidden="true"/><${KeygenPlasma} active=${!closed}/><strong>Digital Creativity</strong></div>
    <p class="metro-kicker">digital creativity</p><label class="metro-project-picker">choose a project<select value=${index} onChange=${(e:Event)=>setIndex(Number((e.target as HTMLSelectElement).value))}>${projects.map((p,i)=>html`<option value=${i}>${p.name}</option>`)}</select></label>
    <article class="metro-project-detail" aria-live="polite"><h2>${project?.name??'No projects yet'}</h2><p class="metro-project-tag">${project?.tag}</p><p class="metro-lead">${project?.desc}</p>${project&&html`<a class="metro-text-link" href=${project.url} target="_blank" rel="noopener noreferrer">visit project ↗</a>`}</article>
    <div class="metro-project-audio"><canvas ref=${canvas} width="640" height="200" aria-hidden="true"/><p>Kenet & Rez<br/><strong>Unreeeal Superhero 3</strong></p><button class="metro-play" data-music-control aria-pressed=${music} aria-controls="keygen-music" aria-label=${music?'Pause music':'Play music'} onClick=${toggleMusic}>${music?'Ⅱ':'▶'}</button><a class="metro-text-link" href="https://modarchive.org/index.php?request=view_by_moduleid&query=149252" target="_blank" rel="noopener noreferrer">track credits ↗</a></div>
    <button class="metro-outline-button" disabled=${projects.length<2} onClick=${()=>setIndex(prev=>(prev+1+Math.floor(Math.random()*(projects.length-1)))%projects.length)}>surprise me</button>
    <audio id="keygen-music" ref=${audio} src=${KEYGEN_TRACK} preload="none" loop onPlay=${()=>setMusic(true)} onPause=${()=>setMusic(false)} onError=${()=>{setMusic(false);setAudioError(true);}}/>
    ${audioError&&html`<p role="status">Couldn't play the music. <a href=${KEYGEN_TRACK}>Open the audio file</a>.</p>`}
  </div>`;
  return html`<div class="creativity-content">
    <div class="keygen-art" aria-label="Digital Creativity">
      <div class="keygen-plasma" aria-hidden="true"></div><${KeygenPlasma} active=${!closed}/>
      <canvas ref=${canvas} class="keygen-visualiser" width="640" height="200" aria-hidden="true" /><strong>Digital Creativity</strong>
    </div>
    <div class="keygen-form">
      <label for="keygen-product">Product Name:</label>
      <select id="keygen-product" value=${index} onChange=${(e: Event) => setIndex(Number((e.target as HTMLSelectElement).value))}>
        ${projects.map((p, i) => html`<option value=${i}>${p.name}</option>`)}
      </select>
      <label for="keygen-category">Product Type:</label>
      <input id="keygen-category" readOnly value=${project?.tag ?? ''} />
      <div class="keygen-label" id="keygen-description-label">Description:</div>
      <div id="keygen-result" class="keygen-result" aria-labelledby="keygen-description-label" role="status" aria-live="polite">${project?.desc ?? 'No projects yet.'}</div>
      <label for="keygen-url">Product Homepage:</label>
      <input id="keygen-url" readOnly value=${project?.url ?? ''} />
      <div class="keygen-buttons">
        ${project ? html`<a href=${project.url} target="_blank" rel="noopener noreferrer" aria-label=${`Open ${project.name}`}><img class="project-link-icon" src="/assets/xp/internet-explorer.png" alt="" />Open</a>` : null}
        <button disabled=${projects.length < 2} onClick=${() => setIndex(prev => (prev + 1 + Math.floor(Math.random() * (projects.length - 1))) % projects.length)}>Random</button>
        <button data-music-control aria-pressed=${music} aria-controls="keygen-music" onClick=${toggleMusic}>${music ? 'Pause music' : 'Play music'}</button>
        <button data-creativity-exit onClick=${onClose}>Exit</button>
      </div>
      <audio id="keygen-music" ref=${audio} src=${KEYGEN_TRACK} preload="none" loop
        onPlay=${() => setMusic(true)} onPause=${() => setMusic(false)} onError=${() => { setMusic(false); setAudioError(true); }} />
      <div class="keygen-credit"><a href="https://modarchive.org/index.php?request=view_by_moduleid&query=149252" target="_blank" rel="noopener noreferrer">♪ Kenet & Rez — Unreeeal Superhero 3</a></div>
      ${audioError ? html`<p class="keygen-audio-error" role="status">Couldn't play the music. <a href=${KEYGEN_TRACK}>Open the audio file</a>.</p>` : null}
    </div></div>`;
}

