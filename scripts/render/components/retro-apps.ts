import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { SiteData } from '../../lib/types.js';
import {profile} from '../../lib/profile.js';
import { ArticleBody } from './article.js';
import { CollectionPage } from '../pages/collection.js';

export function Messenger(): VNode {
  return html`<div class="messenger-app">
    <div class="messenger-banner"><img class="messenger-logo" src="/assets/xp/alex-messenger.svg" alt=""/><div><strong>Alex Messenger</strong><small>About Alexander Forbes-Reed</small></div></div>
    <div class="messenger-identity"><span class="messenger-avatar">${profile.initials}</span><div><h2>${profile.name}</h2><p>${profile.location} · ${profile.role}</p><small>You’re here as a visitor. Have a look around.</small></div></div>
    <div class="messenger-links">${profile.socials.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer">${l.label}</a>`)}</div>
    <div class="messenger-bio"><${CollectionPage} /></div>
    <div class="retro-status">Personal profile · no chat account needed</div>
  </div>`;
}

export function Word({data}: {data:SiteData}): VNode {
  const [index,setIndex]=useState(0),[size,setSize]=useState(16),[navigation,setNavigation]=useState(true);
  useEffect(()=>{
    const open=(event:Event)=>{
      const item=(event as CustomEvent<{app?:string;index?:unknown}>).detail;
      if(item?.app==='word' && typeof item.index==='number' && Number.isInteger(item.index) && item.index>=0 && item.index<data.words.length) setIndex(item.index);
    };
    window.addEventListener('open-site-item',open);
    return()=>window.removeEventListener('open-site-item',open);
  },[data.words.length]);
  const word=data.words[index];
  return html`<div class="word-app">
    <div class="word-menubar"><details><summary>File</summary><div>${word&&html`<a href=${word.url} target="_blank" rel="noopener noreferrer">Open original article ↗</a>`}<button onClick=${()=>window.print()}>Print…</button></div></details><button disabled>Edit</button><details><summary>View</summary><div><button aria-pressed=${navigation} onClick=${()=>setNavigation(v=>!v)}>Document Map</button></div></details>${['Insert','Format','Tools','Table','Window'].map(label=>html`<button disabled>${label}</button>`)}<details><summary>Help</summary><div>Read-only articles. Choose a document to read the locally saved text.</div></details><span class="word-brand">Microsoft Office Word 2003</span></div>
    <div class="word-standard-toolbar"><span class="word-tool-icon" aria-hidden="true">W</span><label>Document <select value=${index} onChange=${(e:Event)=>setIndex(Number((e.target as HTMLSelectElement).value))}>${data.words.map((w,i)=>html`<option value=${i}>${w.title}</option>`)}</select></label>${word&&html`<a href=${word.url} target="_blank" rel="noopener noreferrer">Open original ↗</a>`}</div>
    <div class="retro-toolbar word-format-toolbar"><span>Normal</span><span>Georgia</span><label>Reading size <select value=${size} onChange=${(e:Event)=>setSize(Number((e.target as HTMLSelectElement).value))}>${[14,16,20,24].map(n=>html`<option value=${n}>${n}</option>`)}</select></label><span class="word-format-icons" aria-label="Formatting unavailable in read-only documents"><button disabled aria-label="Bold"><b>B</b></button><button disabled aria-label="Italic"><i>I</i></button><button disabled aria-label="Underline"><u>U</u></button><button disabled aria-label="Align left">☰</button></span><span class="word-readonly">Read Only</span></div>
    <div class="word-ruler" aria-hidden="true">1 · · · · 2 · · · · 3 · · · · 4 · · · · 5 · · · · 6 · · · · 7</div>
    <div class="word-layout">${navigation&&html`<aside class="word-document-map" aria-label="Document map"><h2>Document Map</h2>${data.words.map((w,i)=>html`<button aria-pressed=${index===i} onClick=${()=>setIndex(i)}>${w.title}</button>`)}</aside>`}
    <div class="word-workspace"><article class="word-paper" style=${{fontSize:size}}><p class="word-byline">${word?.article?.byline??word?.source??''}${word?.article?.publishedAt&&` · ${word.article.publishedAt}`}</p><h1>${word?.article?.publishedTitle??word?.title??'No documents yet'}</h1><p>${word?.source??''}</p><hr/>${word&&html`<${ArticleBody} word=${word}/>`}</article></div></div>
    <div class="retro-status">${word?`Document ${index+1} of ${data.words.length}`:'No documents'} · Read Only · ${size} pt</div>
  </div>`;
}

export function PictureViewer({data,active=true}: {data:SiteData;active?:boolean}): VNode {
  const [index,setIndex]=useState(0), [zoom,setZoom]=useState(false), [angle,setAngle]=useState(0), [slideshow,setSlideshow]=useState(false);
  const count=data.photos.length, photo=data.photos[index];
  useEffect(()=>{
    const open=(event:Event)=>{
      const item=(event as CustomEvent<{app?:string;index?:unknown}>).detail;
      if(item?.app==='photos' && typeof item.index==='number' && Number.isInteger(item.index) && item.index>=0 && item.index<count){setIndex(item.index);setZoom(false);setAngle(0);}
    };
    window.addEventListener('open-site-item',open);
    return()=>window.removeEventListener('open-site-item',open);
  },[count]);
  const step=(n:number)=>{setIndex(i=>(i+n+count)%count);setZoom(false);setAngle(0);};
  useEffect(()=>{if(!active||!slideshow||count<2)return;const id=window.setInterval(()=>{setIndex(i=>(i+1)%count);setAngle(0);setZoom(false);},4000);return()=>clearInterval(id);},[slideshow,active,count]);
  if(!photo)return html`<p class="retro-empty">No photographs yet.</p>`;
  return html`<div class="picture-viewer" onKeyDown=${(e:KeyboardEvent)=>{if((e.target as HTMLElement).matches('input,select'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}}}>
    <div class=${`picture-stage${zoom?' is-zoomed':''}`} tabIndex="0" aria-label="Photograph. Use left and right arrow keys to browse."><img src=${photo.url} alt=${photo.alt} style=${{transform:`rotate(${angle}deg)`}} /></div>
    <div class="picture-caption"><strong>${photo.title||'Untitled'}</strong><span>${photo.loc}</span></div>
    <div class="picture-toolbar"><button aria-label="Previous photo" onClick=${()=>step(-1)}>◀</button><button aria-label="Next photo" onClick=${()=>step(1)}>▶</button><span></span><button aria-pressed=${zoom} onClick=${()=>setZoom(v=>!v)}>${zoom?'Fit to window':'Zoom in'}</button><button onClick=${()=>setAngle(a=>(a+90)%360)}>Rotate ↻</button><button aria-pressed=${slideshow} onClick=${()=>setSlideshow(v=>!v)}>${slideshow?'Pause slideshow':'Slideshow'}</button><a href=${photo.url} target="_blank" rel="noopener noreferrer">Open original ↗</a></div>
    <div class="picture-filmstrip" aria-label="Photographs">${data.photos.map((p,i)=>html`<button aria-label=${`Photo ${i+1}: ${p.title||p.alt}`} aria-pressed=${i===index} onClick=${()=>{setIndex(i);setZoom(false);setAngle(0);}}><img src=${p.url} alt="" loading="lazy" /></button>`)}</div>
    <div class="retro-status">${index+1} / ${count} · ${photo.takenAt?photo.takenAt.slice(0,10):'From my collection'}</div>
  </div>`;
}
