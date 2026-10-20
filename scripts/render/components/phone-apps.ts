// Phone interiors have their own Metro markup; only data and behaviour are shared.
import {html} from 'htm/preact';
import {createContext, type ComponentChildren, type VNode} from 'preact';
import {useContext,useEffect,useRef,useState} from 'preact/hooks';
import {ArticleBody} from './article.js';
import {profile} from '../../lib/profile.js';
import type {SiteData} from '../../lib/types.js';
import {usePivot} from '../../state.js';

export const PhoneDataContext=createContext<SiteData|null>(null);

// Each pane is part of one horizontally scrolling surface, with a glimpse of
// its neighbour. Native scrolling handles touch; headings and arrows handle keys.
function Panorama({panes,page=0,label}:{panes:{title:string;body:ComponentChildren}[];page?:number;label:string}):VNode {
  const rail=useRef<HTMLDivElement>(null),position=useRef(page);
  const move=(index:number,animate=false)=>{
    const el=rail.current,child=el?.children[index] as HTMLElement|undefined;
    if(el&&child){position.current=index;el.scrollTo({left:child.offsetLeft,behavior:animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'auto'});}
  };
  useEffect(()=>{position.current=page;move(page);},[page]);
  useEffect(()=>{const el=rail.current;if(!el)return;const observer=new ResizeObserver(()=>move(position.current));observer.observe(el);return()=>observer.disconnect();},[]);
  return html`<div class="metro-panorama" ref=${rail} role="region" aria-label=${label} tabIndex="0"
    onScroll=${()=>{const el=rail.current;if(!el||!el.clientWidth)return;const children=Array.from(el.children) as HTMLElement[];position.current=children.reduce((best,child,i)=>Math.abs(child.offsetLeft-el.scrollLeft)<Math.abs(children[best].offsetLeft-el.scrollLeft)?i:best,0);}}
    onKeyDown=${(e:KeyboardEvent)=>{if(e.target!==rail.current&&!(e.target as HTMLElement).classList.contains('metro-pane-heading'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(Math.max(0,Math.min(panes.length-1,position.current+(e.key==='ArrowRight'?1:-1))),true);}}}>
    ${panes.map((pane,i)=>html`<section class="metro-pane" aria-label=${pane.title}><h2><button class="metro-pane-heading" onClick=${()=>move(i,true)}>${pane.title}</button></h2>${pane.body}</section>`)}
  </div>`;
}
export const PhoneBackContext=createContext<(handler:(()=>void)|null)=>void>(()=>{});
function useDetailBack(active:boolean,detail:boolean,back:()=>void):void {
  const register=useContext(PhoneBackContext),latest=useRef(back);
  latest.current=back;
  useEffect(()=>{
    if(!active||!detail)return;
    register(()=>latest.current());
    return()=>register(null);
  },[active,detail,register]);
}
export function MetroPivots<T extends string>({items,value,onChange,label}:{items:readonly T[];value:T;onChange:(value:T)=>void;label:string}):VNode {
  return html`<nav class="metro-pivots" aria-label=${label}>${items.map(item=>html`<button aria-pressed=${value===item} onClick=${()=>onChange(item)}>${item}</button>`)}</nav>`;
}
export function MetroPeople({embedded=false}:{embedded?:boolean}={}):VNode {
  const data=useContext(PhoneDataContext);
  const identity=html`<div class="metro-identity"><span aria-hidden="true">${profile.initials}</span><h2>${profile.name}</h2></div>`;
  const links=html`<div class="metro-list">${profile.socials.map(l=>html`<a href=${l.href} target="_blank" rel="noopener noreferrer"><strong>${l.label}</strong><small>${l.href.replace('https://','')}</small></a>`)}</div>`;
  const about=html`${identity}<p class="metro-lead">${profile.bio}</p><dl class="metro-details"><dt>work</dt><dd>${profile.role}<br/><a href=${profile.company.url} target="_blank" rel="noopener noreferrer">${profile.company.name}</a></dd><dt>home</dt><dd>${profile.location}</dd><dt>stack</dt><dd>${profile.stack}</dd></dl>${links}`;
  if(embedded)return html`<div class="metro-profile-embedded">${about}${profile.sections.map(s=>html`<section class="metro-profile-section"><h3>${s.title}</h3><p>${s.text}</p>${s.links.map(l=>html`<a class="metro-text-link" href=${l.href} target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)}</section>`)}</div>`;
  return html`<div class="metro-page metro-people metro-hub"><${Panorama} label="People panorama" panes=${[
    {title:'profile',body:about},
    {title:"what's new",body:html`${profile.sections.map(s=>html`<section class="metro-profile-section"><h3>${s.title}</h3><p>${s.text}</p>${s.links.map(l=>html`<a class="metro-text-link" href=${l.href} target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`)}</section>`)}${data?.words.length?html`<h3>writing</h3><div class="metro-list">${data.words.map(w=>html`<a href=${w.url} target="_blank" rel="noopener noreferrer"><strong>${w.title}</strong><small>${w.source}</small></a>`)}</div>`:null}`},
    {title:'recent',body:html`<p class="metro-kicker">recently played</p><${MetroTracks} tracks=${data?.recentlyPlayed.slice(0,8)??[]}/>`},
  ]}/></div>`;
}
export function MetroPhotos({data,active=true,embedded=false}:{data:SiteData;active?:boolean;embedded?:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null);
  const opener=useRef<HTMLButtonElement|null>(null);
  const grid=useRef<HTMLDivElement>(null),viewer=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>{const target=opener.current??grid.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current];target?.focus();});};
  useDetailBack(active,index!==null,close);
  useEffect(()=>{if(active&&index!==null){lastIndex.current=index;viewer.current?.focus();}},[active,index]);
  const photo=index===null?undefined:data.photos[index];
  const step=(delta:number)=>setIndex(i=>i===null?null:(i+delta+data.photos.length)%data.photos.length);
  const gallery=html`<p class="metro-kicker">camera roll · ${data.photos.length}</p><div class="metro-photo-grid" ref=${grid}>${data.photos.map((p,i)=>html`<button aria-label=${`View ${p.title||p.alt}`} onClick=${(e:MouseEvent)=>{opener.current=e.currentTarget as HTMLButtonElement;setIndex(i);}}><img src=${p.url} alt=${p.alt} loading="lazy"/></button>`)}</div>${!data.photos.length&&html`<p>No photographs yet.</p>`}`;
  return html`<div class=${`metro-photos${embedded?' metro-photos-embedded':' metro-hub'}`}>${embedded?gallery:html`<${Panorama} label="Photos panorama" panes=${[
    {title:'gallery',body:gallery},
    {title:'moments',body:html`<div class="metro-photo-moments">${data.photos.map((p,i)=>html`<button onClick=${(e:MouseEvent)=>{opener.current=e.currentTarget as HTMLButtonElement;setIndex(i);}}><img src=${p.url} alt=${p.alt} loading="lazy"/><strong>${p.title}</strong><small>${p.loc}${p.takenAt&&` · ${p.takenAt.slice(0,10)}`}</small></button>`)}</div>`},
  ]}/>`}
    ${photo&&html`<div class="metro-photo-viewer" role="dialog" aria-modal="true" aria-label=${photo.title||'Photograph'} ref=${viewer} tabIndex="-1" onKeyDown=${(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();close();}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}
      if(e.key==='Tab'){const controls=Array.from(viewer.current?.querySelectorAll<HTMLElement>('button,a')??[]);const i=controls.indexOf(document.activeElement as HTMLElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}
    }}><button class="metro-photo-close" aria-label="Close photograph" onClick=${close}>×</button><img src=${photo.url} alt=${photo.alt}/><div class="metro-photo-caption"><h2>${photo.title||'Untitled'}</h2><p>${photo.loc} ${photo.takenAt&&`· ${photo.takenAt.slice(0,10)}`}</p></div><div class="metro-appbar"><button aria-label="Previous photograph" onClick=${()=>step(-1)}>←</button><span>${(index??0)+1} / ${data.photos.length}</span><button aria-label="Next photograph" onClick=${()=>step(1)}>→</button><a href=${photo.url} target="_blank" rel="noopener noreferrer" aria-label="Open original photograph">↗</a></div></div>`}
  </div>`;
}
export function MetroOffice({data,active=true}:{data:SiteData;active?:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null),[large,setLarge]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null),list=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>list.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current]?.focus());};
  useDetailBack(active,index!==null,close);
  useEffect(()=>{if(index!==null&&active){lastIndex.current=index;heading.current?.focus();}},[active,index]);
  const word=index===null?undefined:data.words[index];
  return html`<div class=${`metro-office${word?' is-reading':''}`}>
    ${word?html`<article class=${`metro-reading${large?' large-type':''}`}><p class="metro-kicker">reading view</p><h2 ref=${heading} tabIndex="-1">${word.article?.publishedTitle??word.title}</h2><p class="metro-author">${word.article?.byline??word.source}${word.article?.publishedAt&&` · ${word.article.publishedAt}`}</p><p>${word.source}</p><${ArticleBody} word=${word}/></article><div class="metro-appbar"><button aria-label="Recent documents" onClick=${close}>←</button><button aria-pressed=${large} aria-label="Larger reading text" onClick=${()=>setLarge(v=>!v)}>Aa</button></div>`:html`<${Panorama} label="Office panorama" panes=${[{title:'recent',body:html`<div class="metro-list metro-documents" ref=${list}>${data.words.map((w,i)=>html`<button onClick=${()=>setIndex(i)}><span class="metro-document-icon" aria-hidden="true">W</span><span><strong>${w.title}</strong><small>${w.source}</small></span></button>`)}</div>${!data.words.length&&html`<p>No documents yet.</p>`}`},{title:'places',body:html`<p class="metro-kicker">published writing</p><div class="metro-list">${data.words.map(w=>html`<a href=${w.url} target="_blank" rel="noopener noreferrer"><strong>${w.source}</strong><small>${w.title}</small></a>`)}</div>`}]}/>`}
  </div>`;
}
function MetroAlbums({data}:{data:SiteData}):VNode {
  return html`<div class="metro-albums">${data.albums.map(a=>{
    const body=html`${a.coverUrl?html`<img src=${a.coverUrl} alt="" loading="lazy"/>`:html`<span class="metro-art-placeholder" aria-hidden="true">♫</span>`}<strong>${a.name}</strong><small>${a.artist}</small>`;
    return a.url?html`<a href=${a.url} target="_blank" rel="noopener noreferrer">${body}</a>`:html`<div>${body}</div>`;
  })}</div>`;
}
function MetroTracks({tracks}:{tracks:SiteData['topTracks']}):VNode {
  return html`<div class="metro-list metro-tracks">${tracks.map(t=>{
    const body=html`${t.coverUrl&&html`<img src=${t.coverUrl} alt="" loading="lazy"/>`}<span><strong>${t.name}</strong><small>${t.artist}</small></span>`;
    return t.url?html`<a href=${t.url} target="_blank" rel="noopener noreferrer">${body}</a>`:html`<div class="metro-list-row">${body}</div>`;
  })}${!tracks.length&&html`<p>No listening history yet.</p>`}</div>`;
}
export function MetroMusic({data,active}:{data:SiteData;active:boolean}):VNode {
  const {pivot}=usePivot();
  const tiles=(tracks:SiteData['topTracks'])=>html`<div class="metro-history-tiles">${tracks.map(t=>{
    const body=html`${t.coverUrl?html`<img src=${t.coverUrl} alt="" loading="lazy"/>`:html`<span class="metro-art-placeholder">♫</span>`}<span><strong>${t.name}</strong><small>${t.artist}</small></span>`;
    return t.url?html`<a href=${t.url} target="_blank" rel="noopener noreferrer">${body}</a>`:html`<div>${body}</div>`;
  })}</div>`;
  return html`<div class="metro-page metro-music metro-hub"><${Panorama} label="Music and collection" page=${pivot==='collection'?3:pivot==='music'?2:0} panes=${[
    {title:'history',body:html`${tiles(data.recentlyPlayed.slice(0,12))}${!data.recentlyPlayed.length&&html`<p>No listening history yet.</p>`}`},
    {title:'new',body:html`<p class="metro-kicker">soundcloud likes</p>${tiles((data.soundcloud?.likes??[]).map(t=>({name:t.title,artist:t.artist,coverUrl:t.artworkUrl,url:t.url})))}${!data.soundcloud?.likes.length&&html`<p>No SoundCloud likes yet.</p>`}`},
    {title:'music',body:html`<h3 class="metro-section-title">albums</h3><${MetroAlbums} data=${data}/><h3 class="metro-section-title">artists</h3><div class="metro-list">${data.topArtists.map(a=>a.url?html`<a href=${a.url} target="_blank" rel="noopener noreferrer"><strong>${a.name}</strong></a>`:html`<div class="metro-list-row"><strong>${a.name}</strong></div>`)}</div><h3 class="metro-section-title">songs</h3><${MetroTracks} tracks=${data.topTracks}/>`},
    {title:'collection',body:html`<details class="metro-media-section" open><summary>music</summary><${MetroAlbums} data=${data}/></details><details class="metro-media-section"><summary>pictures</summary><${MetroPhotos} data=${data} active=${active} embedded/></details><details class="metro-media-section"><summary>profile</summary><${MetroPeople} embedded/></details>`},
  ]}/></div>`;
}
export function MetroCollection({data,active}:{data:SiteData;active:boolean}):VNode {
  const [pivot,setPivot]=useState<'projects'|'writing'|'photos'|'music'>('projects');
  return html`<div class="metro-page metro-collection"><${MetroPivots} items=${['projects','writing','photos','music']} value=${pivot} onChange=${setPivot} label="Collection folders"/>
    ${pivot==='projects'?html`<div class="metro-list metro-project-list">${data.projects.map(p=>html`<a href=${p.url} target="_blank" rel="noopener noreferrer"><strong>${p.name}</strong><small>${p.tag}</small><p>${p.desc}</p></a>`)}</div>`:pivot==='writing'?html`<${MetroOffice} data=${data} active=${active}/>`:pivot==='photos'?html`<${MetroPhotos} data=${data} active=${active}/>`:html`<${MetroAlbums} data=${data}/>`}
  </div>`;
}
