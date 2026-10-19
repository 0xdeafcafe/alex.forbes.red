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
function ProjectPlate({name}:{name:string}):VNode {
  const preview=PROJECT_PREVIEWS[name];
  if(preview)return html`<img class="encarta-real-preview" src=${preview.src} alt=${preview.caption} loading="lazy"/>`;
  const labels=PROJECT_DIAGRAMS[name]??[name];
  return html`<svg class="encarta-project-diagram" viewBox="0 0 320 250" role="img" aria-label=${labels.join(' — ')} data-project=${name}>
    <path d="M16 16H304V234H16Z" fill="none" stroke="#c9ba99"/>
    <path d="M160 70V108M155 101 160 108 165 101M160 142V180M155 173 160 180 165 173" stroke="#7b6b4d" fill="none"/>
    ${labels.map((label,i)=>html`<g><rect x=${i===1?52:72} y=${30+i*74} width=${i===1?216:176} height="40" rx="1" fill=${i===1?'#e2d4b6':'#f6f0e1'} stroke="#8f805e"/><text x="160" y=${55+i*74} text-anchor="middle" fill="#534a36" font-size="13" font-family="Tahoma, sans-serif">${label}</text></g>`)}
  </svg>`;
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
  const [home,setHome]=useState(true);
  const search=useRef<HTMLInputElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  const categories=[...new Set(data.projects.map(p=>projectCategory(p.tag)))].sort();
  const results=data.projects.map((project,index)=>({project,index})).filter(({project})=>(!category||projectCategory(project.tag)===category)&&`${project.name} ${project.desc} ${project.tag}`.toLowerCase().includes(query.toLowerCase()));
  const project=selected===null?undefined:data.projects[selected];

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
          ['folder','Take a tour','Browse the complete collection',()=>browse()],
          ['internet-explorer','Explore projects','Open the featured Rush entry',()=>select(Math.max(0,data.projects.findIndex(p=>p.name==='rush')))],
          ['application','Play a game','Explore games and playful experiments',()=>browse('Games & Xbox')],
        ].map(([icon,title,description,action])=>html`<button onClick=${action}><img src=${`/assets/xp/${icon}.png`} alt=""/><span><strong>${title}</strong><small>${description}</small></span></button>`)}
      </nav><div class="encarta-home-footer"><button onClick=${()=>browse()}>${data.projects.length} ENTRIES · OPEN INDEX</button><span>Alexander Forbes-Reed · Personal edition</span></div>
    </main>`:html`
    <div class="encarta-layout"><aside class="encarta-index" aria-label="Project index"><label>Find an entry<input ref=${search} type="search" value=${query} placeholder="Search projects" onInput=${(e:Event)=>setQuery((e.target as HTMLInputElement).value)}/></label><label>Category<select value=${category} onChange=${(e:Event)=>setCategory((e.target as HTMLSelectElement).value)}><option value="">All categories</option>${categories.map(tag=>html`<option value=${tag}>${tag}</option>`)}</select></label><p class="encarta-result-count" role="status">${results.length} entries</p><nav aria-label="Encyclopedia entries">${results.map(({project:p,index})=>html`<button aria-current=${selected===index?'page':undefined} onClick=${()=>select(index)}>${p.name}<small>${p.tag}</small></button>`)}</nav>${!results.length&&html`<p>No matching entries. <button onClick=${()=>{setQuery('');setCategory('');}}>Clear filters</button></p>`}</aside>
    <main class="encarta-page">${project?html`
      <p class="encarta-kicker">${project.tag}</p><h1 ref=${heading} tabIndex="-1">${project.name}</h1>
      <figure class="encarta-preview encarta-illustrated-preview"><${ProjectPlate} name=${project.name}/><figcaption><span class="encarta-plate-number">PLATE ${String(data.projects.indexOf(project)+1).padStart(2,'0')}</span> ${PROJECT_PREVIEWS[project.name]?.caption??PROJECT_DIAGRAMS[project.name]?.join(' · ')??project.name}</figcaption></figure>
      <h2>Overview</h2><p class="encarta-description">${project.desc}</p>
      ${project.github?.description&&project.github.description!==project.desc&&html`<h2>From the repository</h2><p>${project.github.description}</p>`}
      <h2>Project details</h2><dl class="encarta-facts"><dt>Category</dt><dd>${project.tag}</dd>${project.github&&html`<dt>Repository</dt><dd>${project.github.owner}/${project.github.repo}</dd>${project.github.language&&html`<dt>Language</dt><dd>${project.github.language}</dd>`}<dt>Stars / forks</dt><dd>${project.github.stars} / ${project.github.forks}</dd><dt>Status</dt><dd>${project.github.archived?'Archived repository':'Not marked archived'}</dd>${project.github.topics.length>0&&html`<dt>Topics</dt><dd>${project.github.topics.join(', ')}</dd>`}`}</dl>
      ${project.github&&html`<p class="encarta-note">Repository information at the last site update.</p>`}
      <a class="encarta-external" href=${project.url} target="_blank" rel="noopener noreferrer"><img src="/assets/xp/internet-explorer.png" alt=""/>${project.name}.url — Visit project <span>(opens in a new tab)</span></a>
    `:html`<p class="encarta-kicker">Welcome to the collection</p><h1 ref=${heading} tabIndex="-1">Ideas, made into software.</h1><p class="encarta-description">Browse Alexander Forbes-Reed’s projects, from developer tools and music experiments to games and reverse engineering. Select an entry to read its description and explore the repository.</p><div class="encarta-library">${results.map(({project:p,index})=>html`<button onClick=${()=>select(index)}><${ProjectPlate} name=${p.name}/><strong>${p.name}</strong><small>${p.tag}</small><span>${p.desc}</span></button>`)}</div>`}</main></div>`}<footer class="encarta-status">${home?'Home screen':project?project.name:'Project index'} · Select an entry to explore</footer>`;
}
