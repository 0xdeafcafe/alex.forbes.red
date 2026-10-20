import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { SiteData } from '../../lib/types.js';
import { PROJECT_DIAGRAMS } from '../../lib/project-plates.js';

// Original images published in the featured projects' READMEs.
const PROJECT_PREVIEWS:Record<string,{src:string;caption:string;source:string}>={
  rush:{src:'/assets/projects/rush-session.webp',caption:'Rush · a coding session in the terminal',source:'https://github.com/0xdeafcafe/rush/blob/main/README.md'},
  langwatch:{src:'/assets/projects/langwatch-cover.jpg',caption:'LangWatch · agent observability and evaluations',source:'https://github.com/langwatch/langwatch/blob/main/README.md'},
};
const TRAILS=[
  {title:'The terminal is a place',note:'Coding agents, containers, then Slack. Three reasons to stay in the terminal.',names:['rush','dockos','loafer'],icon:'computer'},
  {title:'Sound, taken sideways',note:'Cross-channel audio, on-device transcription and a SoundCloud client.',names:['airpods pro lapse','yap','sounding'],icon:'music'},
  {title:'Inside the Xbox',note:'From Blam! engine research to Halo film and map editing.',names:['assembly','vintage','VisualForge'],icon:'application'},
];
function ProjectPlate({name,tag=''}:{name:string;tag?:string}):VNode {
  const preview=PROJECT_PREVIEWS[name];
  if(preview)return html`<img class="encarta-real-preview" src=${preview.src} alt=${preview.caption} loading="lazy"/>`;
  const labels=PROJECT_DIAGRAMS[name]??[name];
  const kind=name==='ceefax'?'teletext':projectCategory(tag)==='Music & Audio'?'record':projectCategory(tag)==='Games & Xbox'?'game':'type';
  return html`<div class=${`encarta-cover cover-${kind}`} style=${{'--cover-ink':['#294851','#53432b','#433951','#384c32'][Array.from(name).reduce((n,c)=>n+c.charCodeAt(0),0)%4]}} aria-label=${`${name}: catalogue illustration`}>
    <small>${tag||'Software collection'}</small>
    ${kind==='record'&&html`<i class="encarta-vinyl" aria-hidden="true"/>`}
    ${kind==='game'&&html`<i class="encarta-wireframe" aria-hidden="true">◇</i>`}
    <strong>${name}</strong><span>${labels.join(' / ')}</span>
    <b aria-hidden="true">${kind==='teletext'?'P100':kind==='record'?'STEREO':kind==='game'?'FIELD NOTES':'SOFTWARE / PERSONAL ARCHIVE'}</b>
  </div>`;
}
function projectCategory(tag:string):string {
 if (/audio|music/i.test(tag)) return 'Music & Audio';
 if (/game|xbox|halo|modding|reverse/i.test(tag)) return 'Games & Xbox';
 if (/library|libraries|framework/i.test(tag)) return 'Libraries';
 if (/communication/i.test(tag)) return 'Communication';
 if (/teletext|cipher|creative/i.test(tag)) return 'Creative Experiments';
 if (/utility|utilities|phone|app/i.test(tag)) return 'Apps & Utilities';
 return 'Developer Tools';
}
export function Encarta({data}:{data:SiteData}):VNode {
  const [spotlight,setSpotlight]=useState(0);
  const [home,setHome]=useState(true);
  const search=useRef<HTMLInputElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  const categories=[...new Set(data.projects.map(p=>projectCategory(p.tag)))].sort();
  const results=data.projects.map((project,index)=>({project,index})).filter(({project})=>(!category||projectCategory(project.tag)===category)&&`${project.name} ${project.desc} ${project.tag}`.toLowerCase().includes(query.toLowerCase()));
  const project=selected===null?undefined:data.projects[selected];
  const featured=['rush','ceefax','assembly'].map(name=>data.projects.findIndex(p=>p.name===name)).filter(i=>i>=0);
  const featuredIndex=featured[spotlight%featured.length];
  const feature=data.projects[featuredIndex];
  const trail=TRAILS.find(t=>t.names.includes(project?.name??''));
  const openName=(name:string)=>{const index=data.projects.findIndex(p=>p.name===name);if(index>=0)select(index);};


  const navigate=(next:{home:boolean;selected:number|null;category:string;query:string},record=true)=>{
    if(record && history.state?.afrDesktop){
      history.replaceState({...history.state,afrEncarta:{home,selected,category,query}},'');
      const index=(Number.isInteger(history.state?.afrIndex)?history.state.afrIndex:0)+1;
      history.pushState({...history.state,afrIndex:index,afrEncarta:next},'');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setHome(next.home);setSelected(next.selected);setCategory(next.category);setQuery(next.query);
  };
  const select=(index:number)=>{navigate({home:false,selected:index,category,query});requestAnimationFrame(()=>heading.current?.focus());};
  useEffect(()=>{
    const restore=()=>{const saved=history.state?.afrEncarta;if(saved&&typeof saved.home==='boolean'&&(saved.selected===null||Number.isInteger(saved.selected)&&saved.selected>=0&&saved.selected<data.projects.length)){setHome(saved.home);setSelected(saved.selected);setCategory(typeof saved.category==='string'?saved.category:'');setQuery(typeof saved.query==='string'?saved.query:'');}};
    restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);
  },[data.projects.length]);
  useEffect(()=>{const handle=(event:Event)=>{const index=(event as CustomEvent).detail?.index;if(Number.isInteger(index)&&index>=0&&index<data.projects.length)select(index);};window.addEventListener('open-project',handle);return()=>window.removeEventListener('open-project',handle);},[data.projects.length,home,selected,category,query]);
  const browse=(filter='')=>{navigate({home:false,selected:null,query:'',category:filter});requestAnimationFrame(()=>search.current?.focus());};
  return html`<div class="encarta-masthead">FORBESOFT ALEXACARTA · PROJECT ENCYCLOPEDIA</div>
    <nav class="encarta-toolbar" aria-label="Encyclopedia navigation"><button onClick=${()=>navigate({home:true,selected:null,category:'',query:''})}>Home</button><button onClick=${()=>browse()}>Find</button><button onClick=${()=>browse()}>Index</button><span class="encarta-toolbar-divider"></span><button disabled=${selected===null} onClick=${()=>browse()}>◀ Back</button><span class="encarta-toolbar-caption">${home?'Personal edition · 26':project?.name??'Project index'}</span></nav>
    ${home?html`<main class="encarta-home">
      <div class="encarta-home-brand"><p>HOME SCREEN</p><h1>ALEXACARTA</h1><span class="encarta-home-subtitle">Project Encyclopedia</span><span class="encarta-year" aria-hidden="true">26</span></div>
      <nav class="encarta-home-menu" aria-label="Explore the encyclopedia">
        ${[
          ['document','Find','Search the project encyclopedia',()=>browse()],
          ['music','Look and listen','Explore music and audio projects',()=>browse('Music & Audio')],
          ['computer','Experiment','Discover developer tools',()=>browse('Developer Tools')],
          ['folder','Take a tour','Three trails through the collection',()=>browse()],
          ['internet-explorer','Surprise me','Open a page you might have missed',()=>select(Math.floor(Math.random()*data.projects.length))],
          ['application','Play a game','Explore games and playful experiments',()=>browse('Games & Xbox')],
        ].map(([icon,title,description,action])=>html`<button onClick=${action}><img src=${`/assets/xp/${icon}.png`} alt=""/><span><strong>${title}</strong><small>${description}</small></span></button>`)}
      </nav>
      ${feature&&html`<section class="encarta-spotlight" aria-label="Featured entry"><div class="encarta-spotlight-heading"><span>ON THE DISC</span><div><button aria-label="Previous featured entry" onClick=${()=>setSpotlight(v=>(v+featured.length-1)%featured.length)}>◀</button><span>${spotlight%featured.length+1} / ${featured.length}</span><button aria-label="Next featured entry" onClick=${()=>setSpotlight(v=>v+1)}>▶</button></div></div><button class="encarta-feature-entry" onClick=${()=>select(featuredIndex)}><${ProjectPlate} name=${feature.name} tag=${feature.tag}/><span><strong>${feature.name}</strong><small>${feature.desc}</small><em>Open entry →</em></span></button></section>`}
      <div class="encarta-home-footer"><button onClick=${()=>browse()}>${data.projects.length} ENTRIES · OPEN INDEX</button><span>Alexander Forbes-Reed · Personal edition</span></div>
    </main>`:html`
    <div class="encarta-layout"><aside class="encarta-index" aria-label="Project index"><label>Find an entry<input ref=${search} type="search" value=${query} placeholder="Search projects" onInput=${(e:Event)=>setQuery((e.target as HTMLInputElement).value)}/></label><label>Category<select value=${category} onChange=${(e:Event)=>setCategory((e.target as HTMLSelectElement).value)}><option value="">All categories</option>${categories.map(tag=>html`<option value=${tag}>${tag}</option>`)}</select></label><p class="encarta-result-count" role="status">${results.length} entries</p><nav aria-label="Encyclopedia entries">${results.map(({project:p,index})=>html`<button aria-current=${selected===index?'page':undefined} onClick=${()=>select(index)}>${p.name}<small>${p.tag}</small></button>`)}</nav>${!results.length&&html`<p>No matching entries. <button onClick=${()=>{setQuery('');setCategory('');}}>Clear filters</button></p>`}</aside>
    <main class="encarta-page">${project?html`
      <p class="encarta-kicker">${project.tag}</p><h1 ref=${heading} tabIndex="-1">${project.name}</h1>
      <figure class="encarta-preview encarta-illustrated-preview"><${ProjectPlate} name=${project.name} tag=${project.tag}/><figcaption><span class="encarta-plate-number">PLATE ${String(data.projects.indexOf(project)+1).padStart(2,'0')}</span> ${PROJECT_PREVIEWS[project.name]?.caption??`Catalogue illustration · ${project.tag}`}</figcaption></figure>
      <p class="encarta-description">${project.desc}</p>
      ${project.github?.description&&project.github.description!==project.desc&&html`<h2>From the repository</h2><p>${project.github.description}</p>`}
      <details class="encarta-repository-details"><summary>Repository record</summary><dl class="encarta-facts"><dt>Category</dt><dd>${project.tag}</dd>${project.github&&html`<dt>Repository</dt><dd>${project.github.owner}/${project.github.repo}</dd>${project.github.language&&html`<dt>Language</dt><dd>${project.github.language}</dd>`}<dt>Stars / forks</dt><dd>${project.github.stars} / ${project.github.forks}</dd><dt>Status</dt><dd>${project.github.archived?'Archived repository':'Not marked archived'}</dd>${project.github.topics.length>0&&html`<dt>Topics</dt><dd>${project.github.topics.join(', ')}</dd>`}`}</dl></details>
      ${project.github&&html`<p class="encarta-note">Repository information at the last site update.</p>`}
      ${trail&&html`<section class="encarta-related"><h2>Follow the thread · ${trail.title}</h2><p>${trail.note}</p><ol>${trail.names.map(name=>html`<li><button disabled=${name===project.name} aria-current=${name===project.name?'page':undefined} onClick=${()=>openName(name)}>${name}<span>${name===project.name?'You are here':'Read entry →'}</span></button></li>`)}</ol></section>`}
      <a class="encarta-external" href=${project.url} target="_blank" rel="noopener noreferrer"><img src="/assets/xp/internet-explorer.png" alt=""/>${project.name}.url — Visit project <span>(opens in a new tab)</span></a>
    `:html`<p class="encarta-kicker">The personal software collection · ${results.length} entries</p><h1 ref=${heading} tabIndex="-1">${category||'Pick a thread. See where it goes.'}</h1>
      ${!category&&!query&&html`<div class="encarta-trails">${TRAILS.map((t,i)=>html`<button onClick=${()=>openName(t.names[0])}><span class="encarta-trail-number">0${i+1}</span><img src=${`/assets/xp/${t.icon}.png`} alt=""/><strong>${t.title}</strong><p>${t.note}</p><small>${t.names.length} stops · Begin tour →</small></button>`)}</div>`}
      <nav class="encarta-subjects" aria-label="Browse subjects"><button aria-pressed=${!category} onClick=${()=>browse()}>All subjects</button>${categories.map(c=>html`<button aria-pressed=${category===c} onClick=${()=>browse(c)}>${c}<b>${data.projects.filter(p=>projectCategory(p.tag)===c).length}</b></button>`)}</nav>
      <div class="encarta-library">${results.map(({project:p,index})=>html`<button onClick=${()=>select(index)}><${ProjectPlate} name=${p.name} tag=${p.tag}/><strong>${p.name}</strong><small>${p.tag} · ${String(index+1).padStart(2,'0')}</small><span>${p.desc}</span></button>`)}</div>`}</main></div>`}<footer class="encarta-status">${home?'Home screen':project?project.name:'Project index'} · Select an entry to explore</footer>`;
}
