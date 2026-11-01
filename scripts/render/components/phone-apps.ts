// Phone interiors for the AFR Pocket handheld. Only data and behaviour are
// shared with the desktop; the markup is its own. Everything is drawn in four
// greys and the screen's LCD filter maps them onto the chosen palette.
//
// Any element with `data-pk` is a cursor stop: the D-pad moves focus between
// them and A clicks the focused one. Apps can claim D-pad presses by listening
// for the cancelable `pocket-pad` window event (detail: up/down/left/right).
import {html} from 'htm/preact';
import {createContext, type ComponentChildren, type VNode} from 'preact';
import {useContext,useEffect,useLayoutEffect,useRef,useState} from 'preact/hooks';
import {ArticleBody} from './article.js';
import {profile} from '../../lib/profile.js';
import type {SiteData} from '../../lib/types.js';
import {usePivot} from '../../state.js';

export const PhoneDataContext=createContext<SiteData|null>(null);
export const PhoneBackContext=createContext<(handler:(()=>void)|null)=>void>(()=>{});
export type PadDirection='up'|'down'|'left'|'right';

// Back closes an app's detail view before leaving the app.
function useDetailBack(active:boolean,detail:boolean,back:()=>void):void {
  const register=useContext(PhoneBackContext),latest=useRef(back);
  latest.current=back;
  useEffect(()=>{
    if(!active||!detail)return;
    register(()=>latest.current());
    return()=>register(null);
  },[active,detail,register]);
}
function usePad(active:boolean,handler:(direction:PadDirection)=>boolean):void {
  const latest=useRef(handler);latest.current=handler;
  // Layout effect: a press straight after a view opens must already be claimed.
  useLayoutEffect(()=>{
    if(!active)return;
    const listen=(e:Event)=>{if(latest.current((e as CustomEvent<PadDirection>).detail))e.preventDefault();};
    window.addEventListener('pocket-pad',listen);
    return()=>window.removeEventListener('pocket-pad',listen);
  },[active]);
}
const focusFirst=(root:HTMLElement|null)=>requestAnimationFrame(()=>root?.querySelector<HTMLElement>('[data-pk]')?.focus({preventScroll:true}));

// 9×9 pixel icons, one string per row.
const ICONS={
  profile:['..#####..','.#.....#.','#..#.#..#','#.......#','#.#...#.#','#..###..#','.#.....#.','..#####..','.........'],
  music:['...######','...#....#','...######','...#....#','...#....#','.###..###','####.####','.##...##.','.........'],
  photos:['..###....','#########','#...###.#','#..#...##','#..#...##','#...###.#','#.......#','#########','.........'],
  writing:['.######..','.#....##.','.#.....#.','.#.###.#.','.#.....#.','.#.###.#.','.#.....#.','.#######.','.........'],
  projects:['.........','###......','#..#####.','#.......#','#.......#','#.......#','#.......#','#########','.........'],
  keygen:['.........','.###.....','#...#....','#...#####','#...#.#.#','.###..#..','.........','.........','.........'],
  pinball:['...###...','..#.###..','..#####..','...###...','.........','#.......#','.##...##.','..##.##..','.........'],
  link:['.........','....#####','.......##','......#.#','.....#..#','#...#....','#.......#','#.......#','#####....'],
} as const;
export type PixelIconName=keyof typeof ICONS;
export function PixelIcon({name}:{name:PixelIconName}):VNode {
  const rects=ICONS[name].flatMap((row,y)=>[...row].map((cell,x)=>cell==='#'?html`<rect x=${x} y=${y} width="1" height="1"/>`:null));
  return html`<svg class="pk-icon" viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

export function PocketTabs<T extends string>({items,value,onChange,label}:{items:readonly T[];value:T;onChange:(value:T)=>void;label:string}):VNode {
  return html`<nav class="pk-tabs" aria-label=${label} data-pk-tabs>${items.map(item=>html`<button aria-pressed=${value===item} onClick=${()=>onChange(item)}>${item}</button>`)}</nav>`;
}
// Left/right on a tabbed screen switches tab when there is nothing beside the cursor.
function useTabPad<T extends string>(active:boolean,items:readonly T[],value:T,onChange:(value:T)=>void,blocked=false):void {
  usePad(active&&!blocked,direction=>{
    if(direction!=='left'&&direction!=='right')return false;
    const focused=document.activeElement as HTMLElement|null;
    if(focused?.closest('.pk-grid'))return false;
    const next=items.indexOf(value)+(direction==='left'?-1:1);
    if(next<0||next>=items.length)return true;
    onChange(items[next]);
    return true;
  });
}

const external={target:'_blank',rel:'noopener noreferrer'};
function Row({href,onClick,image,title,meta,icon}:{href?:string;onClick?:()=>void;image?:string|null;title:string;meta?:ComponentChildren;icon?:PixelIconName}):VNode {
  const body=html`${image!==undefined?image?html`<img class="pk-thumb" src=${image} alt="" loading="lazy"/>`:html`<span class="pk-thumb pk-thumb-empty" aria-hidden="true"><${PixelIcon} name="music"/></span>`:icon?html`<${PixelIcon} name=${icon}/>`:null}<span class="pk-row-text"><strong>${title}</strong>${meta&&html`<small>${meta}</small>`}</span>${href&&html`<span class="pk-row-out" aria-hidden="true">↗</span>`}`;
  if(href)return html`<a class="pk-row" data-pk href=${href} ...${external}>${body}</a>`;
  if(onClick)return html`<button class="pk-row" data-pk onClick=${onClick}>${body}</button>`;
  return html`<div class="pk-row">${body}</div>`;
}

export function PocketProfile({active}:{active:boolean}):VNode {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(active)focusFirst(root.current);},[active]);
  return html`<div class="pk-page pk-profile" ref=${root}>
    <div class="pk-card"><span class="pk-avatar" aria-hidden="true">${profile.initials}</span><div><h2>${profile.name}</h2><p>${profile.role} @ ${profile.company.name}</p><p>${profile.location}</p></div></div>
    <p class="pk-lead">${profile.bio}</p>
    <h3 class="pk-heading">links</h3>
    <div class="pk-list">${profile.socials.map(l=>html`<${Row} href=${l.href} icon="link" title=${l.label} meta=${l.href.replace('https://','')}/>`)}<${Row} href=${profile.company.url} icon="link" title=${profile.company.name} meta="work"/></div>
    <h3 class="pk-heading">stack</h3><p>${profile.stack}</p>
    ${profile.sections.map(s=>html`<h3 class="pk-heading">${s.title}</h3><p>${s.text}</p><div class="pk-list">${s.links.map(l=>html`<${Row} href=${l.href} icon="link" title=${l.label}/>`)}</div>`)}
  </div>`;
}

const MUSIC_TABS=['recent','albums','artists','songs','likes'] as const;
type MusicTab=typeof MUSIC_TABS[number];
export function PocketMusic({data,active}:{data:SiteData;active:boolean}):VNode {
  const {pivot,navigationKey}=usePivot();
  const fromRoute=():MusicTab=>pivot==='music'||pivot==='collection'?'albums':'recent';
  const [tab,setTab]=useState<MusicTab>(fromRoute);
  useEffect(()=>setTab(fromRoute()),[pivot,navigationKey]);
  useTabPad(active,MUSIC_TABS,tab,setTab);
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(active)focusFirst(root.current?.querySelector('.pk-list')??null);},[active,tab]);
  const likes=(data.soundcloud?.likes??[]).map(t=>({name:t.title,artist:t.artist,coverUrl:t.artworkUrl,url:t.url}));
  const tracks=(list:{name:string;artist:string;coverUrl?:string|null;url?:string|null}[],empty:string)=>list.length?html`<div class="pk-list">${list.map(t=>html`<${Row} href=${t.url??undefined} image=${t.coverUrl??null} title=${t.name} meta=${t.artist}/>`)}</div>`:html`<p>${empty}</p>`;
  return html`<div class="pk-page pk-music" ref=${root}>
    <${PocketTabs} items=${MUSIC_TABS} value=${tab} onChange=${setTab} label="Music sections"/>
    ${tab==='recent'?tracks(data.recentlyPlayed.slice(0,20),'No listening history yet.')
    :tab==='albums'?tracks(data.albums.map(a=>({name:a.name,artist:a.artist,coverUrl:a.coverUrl,url:a.url})),'No albums yet.')
    :tab==='artists'?html`<div class="pk-list">${data.topArtists.map((a,i)=>html`<${Row} href=${a.url??undefined} title=${a.name} meta=${`#${i+1}`}/>`)}</div>`
    :tab==='songs'?tracks(data.topTracks,'No top songs yet.')
    :tracks(likes,'No SoundCloud likes yet.')}
  </div>`;
}

export function PocketPhotos({data,active}:{data:SiteData;active:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null);
  const grid=useRef<HTMLDivElement>(null),viewer=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>grid.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current]?.focus());};
  useDetailBack(active,index!==null,close);
  const step=(delta:number)=>setIndex(i=>i===null?null:(i+delta+data.photos.length)%data.photos.length);
  usePad(active&&index!==null,direction=>{if(direction==='left'||direction==='right')step(direction==='left'?-1:1);return true;});
  useEffect(()=>{if(active&&index!==null){lastIndex.current=index;viewer.current?.focus({preventScroll:true});}},[active,index]);
  useEffect(()=>{if(active&&index===null)focusFirst(grid.current);},[active]);
  const photo=index===null?undefined:data.photos[index];
  return html`<div class="pk-page pk-photos">
    <p class="pk-kicker">camera roll · ${data.photos.length}</p>
    <div class="pk-grid" ref=${grid}>${data.photos.map((p,i)=>html`<button data-pk aria-label=${`View ${p.title||p.alt}`} onClick=${()=>setIndex(i)}><img src=${p.url} alt=${p.alt} loading="lazy"/></button>`)}</div>
    ${!data.photos.length&&html`<p>No photographs yet.</p>`}
    ${photo&&html`<div class="pk-viewer" role="dialog" aria-modal="true" aria-label=${photo.title||'Photograph'} ref=${viewer} tabIndex="-1" onKeyDown=${(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
    }}>
      <img src=${photo.url} alt=${photo.alt}/>
      <div class="pk-viewer-caption"><strong>${photo.title||'Untitled'}</strong><small>${photo.loc}${photo.takenAt&&` · ${photo.takenAt.slice(0,10)}`}</small></div>
      <div class="pk-viewer-bar"><button aria-label="Previous photograph" onClick=${()=>step(-1)}>◀</button><span>${(index??0)+1}/${data.photos.length}</span><button aria-label="Next photograph" onClick=${()=>step(1)}>▶</button><button aria-label="Close photograph" onClick=${close}>✕</button></div>
    </div>`}
  </div>`;
}

export function PocketWriting({data,active}:{data:SiteData;active:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null);
  const heading=useRef<HTMLHeadingElement>(null),list=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>list.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current]?.focus());};
  useDetailBack(active,index!==null,close);
  // While reading, up/down scroll the page like a long text box.
  usePad(active&&index!==null,direction=>{
    if(direction!=='up'&&direction!=='down')return false;
    heading.current?.closest('.pk-view')?.scrollBy({top:direction==='up'?-90:90});
    return true;
  });
  useEffect(()=>{if(index!==null&&active){lastIndex.current=index;heading.current?.closest('.pk-view')?.scrollTo(0,0);heading.current?.focus({preventScroll:true});}},[active,index]);
  useEffect(()=>{if(active&&index===null)focusFirst(list.current);},[active]);
  const word=index===null?undefined:data.words[index];
  if(word)return html`<article class="pk-page pk-reading"><p class="pk-kicker">${word.source}</p><h2 ref=${heading} tabIndex="-1">${word.article?.publishedTitle??word.title}</h2><p class="pk-kicker">${word.article?.byline??word.source}${word.article?.publishedAt&&` · ${word.article.publishedAt}`}</p><${ArticleBody} word=${word}/><div class="pk-list"><${Row} href=${word.url} icon="link" title="read the original"/></div></article>`;
  return html`<div class="pk-page pk-writing" ref=${list}><p class="pk-kicker">${data.words.length} documents</p><div class="pk-list">${data.words.map((w,i)=>html`<${Row} icon="writing" title=${w.title} meta=${w.source} onClick=${()=>setIndex(i)}/>`)}</div></div>`;
}

export function PocketProjects({data,active}:{data:SiteData;active:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null);
  const list=useRef<HTMLDivElement>(null),detail=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>list.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current]?.focus());};
  useDetailBack(active,index!==null,close);
  useEffect(()=>{if(active&&index!==null){lastIndex.current=index;detail.current?.closest('.pk-view')?.scrollTo(0,0);focusFirst(detail.current);}},[active,index]);
  useEffect(()=>{if(active&&index===null)focusFirst(list.current);},[active]);
  const project=index===null?undefined:data.projects[index];
  if(project){
    const gh=project.github;
    return html`<div class="pk-page pk-project" ref=${detail}>
      <p class="pk-kicker">${project.tag}</p><h2>${project.name}</h2><p class="pk-lead">${project.desc}</p>
      ${gh&&html`<dl class="pk-stats"><div><dt>stars</dt><dd>${gh.stars}</dd></div><div><dt>forks</dt><dd>${gh.forks}</dd></div>${gh.language&&html`<div><dt>lang</dt><dd>${gh.language}</dd></div>`}</dl>`}
      <div class="pk-list"><${Row} href=${project.url} icon="link" title="visit project" meta=${project.url.replace(/^https?:\/\//,'')}/>${gh&&gh.url!==project.url&&html`<${Row} href=${gh.url} icon="link" title="source code" meta=${`${gh.owner}/${gh.repo}`}/>`}</div>
    </div>`;
  }
  return html`<div class="pk-page pk-projects" ref=${list}><p class="pk-kicker">${data.projects.length} projects</p><div class="pk-list">${data.projects.map((p,i)=>html`<${Row} icon="projects" title=${p.name} meta=${p.tag} onClick=${()=>setIndex(i)}/>`)}</div></div>`;
}
