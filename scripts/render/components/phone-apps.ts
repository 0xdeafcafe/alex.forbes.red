// Phone interiors have their own Metro markup; only data and behaviour are shared.
import {html} from 'htm/preact';
import {createContext, type ComponentChildren, type VNode} from 'preact';
import {useCallback,useContext,useEffect,useRef,useState} from 'preact/hooks';
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
    onScroll=${()=>{const el=rail.current;if(!el||!el.clientWidth)return;(el.closest('.wp-shell') as HTMLElement|null)?.style.setProperty('--pano-x',`${(-el.scrollLeft*.38).toFixed(1)}px`);const children=Array.from(el.children) as HTMLElement[];position.current=children.reduce((best,child,i)=>Math.abs(child.offsetLeft-el.scrollLeft)<Math.abs(children[best].offsetLeft-el.scrollLeft)?i:best,0);}}
    onKeyDown=${(e:KeyboardEvent)=>{if(e.target!==rail.current&&!(e.target as HTMLElement).classList.contains('metro-pane-heading'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(Math.max(0,Math.min(panes.length-1,position.current+(e.key==='ArrowRight'?1:-1))),true);}}}>
    ${panes.map((pane,i)=>html`<section class="metro-pane" aria-label=${pane.title}><h2><button class="metro-pane-heading" onClick=${()=>move(i,true)}>${pane.title}</button></h2>${pane.body}</section>`)}
  </div>`;
}
export const PhoneBackContext=createContext<(handler:(()=>void)|null)=>void>(()=>{});
// Detail views (a photo, an article, a project) are browser-history entries, so
// the phone's Back, the browser's Back and a swipe-back all close them alike.
function useDetailBack(active:boolean,detail:boolean,close:()=>void):()=>void {
  const register=useContext(PhoneBackContext),latest=useRef(close),token=useRef<string|null>(null);
  latest.current=close;
  const dismiss=useCallback(()=>{if(token.current&&history.state?.afrDetail===token.current)history.back();else{token.current=null;latest.current();}},[]);
  useEffect(()=>{
    if(!active||!detail)return;
    if(!token.current){
      token.current=Math.random().toString(36).slice(2);
      const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
      history.pushState({...history.state,afrIndex:index,afrDetail:token.current},'');
    }
    const pop=()=>{if(token.current&&history.state?.afrDetail!==token.current){token.current=null;latest.current();}};
    window.addEventListener('popstate',pop);
    register(dismiss);
    return()=>{window.removeEventListener('popstate',pop);register(null);};
  },[active,detail,register]);
  useEffect(()=>{if(!detail)token.current=null;},[detail]);
  return dismiss;
}
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
// Feathered turnstile: visible rows swing in one after another around the screen's left edge.
export function feather(root:Element|null,delay=90):void {
  if(!root||reducedMotion())return;
  const rows=Array.from(root.querySelectorAll('.metro-pane-heading,.metro-pivots,.metro-list>*,.metro-albums>*,.metro-history-tiles>*,.metro-photo-grid>*,.metro-photo-moments>*,.metro-identity,.metro-lead,.metro-details,.metro-kicker,.metro-project-detail>*,.metro-reading>*:not(.article-body),.article-body>*'))
    .filter(el=>{const r=el.getBoundingClientRect();return r.height>0&&r.bottom>0&&r.top<innerHeight&&r.left<innerWidth&&r.right>0;}).slice(0,16);
  rows.forEach((el,i)=>{const r=el.getBoundingClientRect();el.animate([{transform:'perspective(1000px) rotateY(-60deg)',opacity:0,transformOrigin:`${-r.left}px 50%`},{transform:'perspective(1000px) rotateY(0deg)',opacity:1,transformOrigin:`${-r.left}px 50%`}],{duration:420,delay:delay+i*24,easing:'cubic-bezier(.1,.9,.2,1)',fill:'backwards'});});
}
export function MetroPivots<T extends string>({items,value,onChange,label}:{items:readonly T[];value:T;onChange:(value:T)=>void;label:string}):VNode {
  const nav=useRef<HTMLElement>(null);
  const change=(item:T)=>{if(item===value)return;onChange(item);requestAnimationFrame(()=>{nav.current?.querySelector('[aria-pressed=true]')?.scrollIntoView({inline:'start',block:'nearest',behavior:reducedMotion()?'auto':'smooth'});feather(nav.current?.parentElement??null,0);});};
  return html`<nav class="metro-pivots" ref=${nav} aria-label=${label}>${items.map(item=>html`<button aria-pressed=${value===item} onClick=${()=>change(item)}>${item}</button>`)}</nav>`;
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
  const dismiss=useDetailBack(active,index!==null,close);
  useEffect(()=>{if(active&&index!==null){lastIndex.current=index;viewer.current?.focus();}},[active,index]);
  const photo=index===null?undefined:data.photos[index];
  const step=(delta:number)=>setIndex(i=>i===null?null:(i+delta+data.photos.length)%data.photos.length);
  const gallery=html`<p class="metro-kicker">camera roll · ${data.photos.length}</p><div class="metro-photo-grid" ref=${grid}>${data.photos.map((p,i)=>html`<button aria-label=${`View ${p.title||p.alt}`} onClick=${(e:MouseEvent)=>{opener.current=e.currentTarget as HTMLButtonElement;setIndex(i);}}><img src=${p.url} alt=${p.alt} loading="lazy"/></button>`)}</div>${!data.photos.length&&html`<p>No photographs yet.</p>`}`;
  return html`<div class=${`metro-photos${embedded?' metro-photos-embedded':' metro-hub'}`}>${embedded?gallery:html`<${Panorama} label="Photos panorama" panes=${[
    {title:'gallery',body:gallery},
    {title:'moments',body:html`<div class="metro-photo-moments">${data.photos.map((p,i)=>html`<button onClick=${(e:MouseEvent)=>{opener.current=e.currentTarget as HTMLButtonElement;setIndex(i);}}><img src=${p.url} alt=${p.alt} loading="lazy"/><strong>${p.title}</strong><small>${p.loc}${p.takenAt&&` · ${p.takenAt.slice(0,10)}`}</small></button>`)}</div>`},
  ]}/>`}
    ${photo&&html`<div class="metro-photo-viewer" role="dialog" aria-modal="true" aria-label=${photo.title||'Photograph'} ref=${viewer} tabIndex="-1" onKeyDown=${(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();dismiss();}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);}
      if(e.key==='Tab'){const controls=Array.from(viewer.current?.querySelectorAll<HTMLElement>('button,a')??[]);const i=controls.indexOf(document.activeElement as HTMLElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}
    }}><button class="metro-photo-close" aria-label="Close photograph" onClick=${dismiss}>×</button><img src=${photo.url} alt=${photo.alt}/><div class="metro-photo-caption"><h2>${photo.title||'Untitled'}</h2><p>${photo.loc} ${photo.takenAt&&`· ${photo.takenAt.slice(0,10)}`}</p></div><div class="metro-appbar"><button aria-label="Previous photograph" onClick=${()=>step(-1)}>←</button><span>${(index??0)+1} / ${data.photos.length}</span><button aria-label="Next photograph" onClick=${()=>step(1)}>→</button><a href=${photo.url} target="_blank" rel="noopener noreferrer" aria-label="Open original photograph">↗</a></div></div>`}
  </div>`;
}
export function MetroOffice({data,active=true}:{data:SiteData;active?:boolean}):VNode {
  const [index,setIndex]=useState<number|null>(null),[large,setLarge]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null),list=useRef<HTMLDivElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>list.current?.querySelectorAll<HTMLButtonElement>('button')[lastIndex.current]?.focus());};
  const dismiss=useDetailBack(active,index!==null,close);
  useEffect(()=>{if(index!==null&&active){lastIndex.current=index;heading.current?.focus({preventScroll:true});heading.current?.closest('.metro-page')?.scrollTo(0,0);feather(heading.current?.closest('.metro-reading')??null,0);}},[active,index]);
  const word=index===null?undefined:data.words[index];
  return html`<div class=${`metro-office${word?' is-reading':''}`}>
    ${word?html`<article class=${`metro-reading${large?' large-type':''}`}><p class="metro-kicker">reading view</p><h2 ref=${heading} tabIndex="-1">${word.article?.publishedTitle??word.title}</h2><p class="metro-author">${word.article?.byline??word.source}${word.article?.publishedAt&&` · ${word.article.publishedAt}`}</p><p>${word.source}</p><${ArticleBody} word=${word}/></article><div class="metro-appbar"><button aria-label="Recent documents" onClick=${dismiss}>←</button><button aria-pressed=${large} aria-label="Larger reading text" onClick=${()=>setLarge(v=>!v)}>Aa</button></div>`:html`<${Panorama} label="Office panorama" panes=${[{title:'recent',body:html`<div class="metro-list metro-documents" ref=${list}>${data.words.map((w,i)=>html`<button onClick=${()=>setIndex(i)}><span class="metro-document-icon" aria-hidden="true">W</span><span><strong>${w.title}</strong><small>${w.source}</small></span></button>`)}</div>${!data.words.length&&html`<p>No documents yet.</p>`}`},{title:'places',body:html`<p class="metro-kicker">published writing</p><div class="metro-list">${data.words.map(w=>html`<a href=${w.url} target="_blank" rel="noopener noreferrer"><strong>${w.source}</strong><small>${w.title}</small></a>`)}</div>`}]}/>`}
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
// Projects: one list (all, or the most-starred), each opening a detail page.
export function MetroProjects({data,active}:{data:SiteData;active:boolean}):VNode {
  const [pivot,setPivot]=useState<'all'|'popular'>('all');
  const [index,setIndex]=useState<number|null>(null);
  const list=useRef<HTMLDivElement>(null),page=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),lastIndex=useRef(0);
  const close=()=>{setIndex(null);requestAnimationFrame(()=>{list.current?.querySelector<HTMLElement>(`[data-index="${lastIndex.current}"]`)?.focus({preventScroll:false});feather(list.current,0);});};
  const dismiss=useDetailBack(active,index!==null,close);
  useEffect(()=>{if(active&&index!==null){lastIndex.current=index;page.current?.scrollTo(0,0);heading.current?.focus({preventScroll:true});feather(page.current,0);}},[active,index]);
  const project=index===null?undefined:data.projects[index];
  const rows=data.projects.map((p,i)=>({p,i}));
  const shown=pivot==='all'?rows:rows.filter(r=>r.p.github).sort((a,b)=>(b.p.github?.stars??0)-(a.p.github?.stars??0));
  if(project){
    const gh=project.github;
    return html`<div class="metro-page metro-project-page" ref=${page}><article class="metro-project-detail">
      <p class="metro-kicker">${project.tag}</p><h2 ref=${heading} tabIndex="-1">${project.name}</h2><p class="metro-lead">${project.desc}</p>
      ${gh&&html`<dl class="metro-details"><dt>stars</dt><dd>${gh.stars}</dd>${gh.language&&html`<dt>language</dt><dd>${gh.language}</dd>`}${gh.pushedAt&&html`<dt>last updated</dt><dd>${gh.pushedAt.slice(0,10)}</dd>`}</dl>`}
      <div class="metro-list"><a href=${project.url} target="_blank" rel="noopener noreferrer"><strong>visit website</strong><small>${project.url.replace(/^https?:\/\//,'')}</small></a>${gh&&gh.url!==project.url&&html`<a href=${gh.url} target="_blank" rel="noopener noreferrer"><strong>source code</strong><small>${gh.owner}/${gh.repo}</small></a>`}</div>
    </article><div class="metro-appbar"><button aria-label="All projects" onClick=${dismiss}>←</button><a aria-label=${`Visit ${project.name}`} href=${project.url} target="_blank" rel="noopener noreferrer">↗</a></div></div>`;
  }
  return html`<div class="metro-page metro-projects-app"><${MetroPivots} items=${['all','popular'] as const} value=${pivot} onChange=${setPivot} label="Project lists"/>
    <div class="metro-list metro-project-list" ref=${list}>${shown.map(({p,i})=>html`<button data-index=${i} onClick=${()=>setIndex(i)}><strong>${p.name}</strong><small>${p.tag}${p.github?` · ★ ${p.github.stars}`:''}</small><p>${p.desc}</p></button>`)}</div>
  </div>`;
}
