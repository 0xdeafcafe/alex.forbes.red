import { html } from 'htm/preact';
import type { VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { AppId } from '../../lib/apps.js';
import type { SiteData } from '../../lib/types.js';
import { usePivot } from '../../state.js';

export type FolderId = 'home' | 'pictures' | 'music' | 'documents' | 'projects';
export const FOLDER_IDS: FolderId[] = ['home','pictures','music','documents','projects'];
const directories = [
  {id:'pictures',name:'My Pictures',icon:'pictures'},
  {id:'music',name:'My Music',icon:'music'},
  {id:'documents',name:'My Documents',icon:'document'},
  {id:'projects',name:'My Projects',icon:'folder'},
] as const;
const folderName = (id:FolderId) => directories.find(folder=>folder.id===id)?.name ?? 'My Computer';

export function Explorer({data,onClose,onOpen,folder='home',request=0}: {data:SiteData;onClose:()=>void;onOpen:(app:AppId)=>void;folder?:FolderId;request?:number}):VNode {
  const {setPivot}=usePivot();
  const [history,setHistory]=useState<FolderId[]>([folder]);
  const [position,setPosition]=useState(0);
  const [query,setQuery]=useState('');
  const [details,setDetails]=useState(false);
  const section=history[position];
  const browse=(next:FolderId)=>{if(next!==section){setHistory(h=>[...h.slice(0,position+1),next]);setPosition(position+1);}setQuery('');};
  useEffect(()=>{browse(folder);},[folder,request]);
  const select=(app:'photos'|'word',index:number)=>window.dispatchEvent(new CustomEvent('open-site-item',{detail:{app,index}}));
  type Item={name:string;type:string;description:string;image:string;open:()=>void;thumbnail?:boolean};
  const items:Item[]=section==='home'?directories.map(d=>({name:d.name,type:'File folder',description:d.id==='projects'?'Browse the project encyclopedia':`Browse ${d.name.slice(3).toLowerCase()}`,image:`/assets/xp/${d.icon}.png`,open:()=>browse(d.id)})):
    section==='pictures'?data.photos.map((p,index)=>({name:`${p.title}.jpg`,type:'JPEG image',description:p.loc,image:p.url,thumbnail:true,open:()=>select('photos',index)})):
    section==='documents'?data.words.map((w,index)=>({name:`${w.title}.doc`,type:'Word document',description:w.source,image:'/assets/xp/document.png',open:()=>select('word',index)})):
    section==='music'?data.albums.map(a=>({name:a.name,type:'Album folder',description:a.artist,image:a.coverUrl||'/assets/xp/music.png',thumbnail:true,open:()=>{setPivot('music');onOpen('zune');}})):
    [{name:'Project Encyclopedia',type:'Alexacarta library',description:`Browse ${data.projects.length} projects, descriptions and repository details`,image:'/assets/xp/folder.png',open:()=>onOpen('encarta')},...data.projects.map((p,index)=>({name:`${p.name}.url`,type:p.tag,description:p.desc,image:'/assets/xp/internet-explorer.png',open:()=>{onOpen('encarta');window.dispatchEvent(new CustomEvent('open-project',{detail:{index}}));}}))];
  const visible=items.filter(item=>`${item.name} ${item.type} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  return html`
    <div class="explorer-menubar"><button onClick=${onClose}>Close</button><button onClick=${()=>setDetails(v=>!v)}>${details?'Thumbnail view':'Details view'}</button></div>
    <div class="explorer-toolbar">
      <button disabled=${position===0} onClick=${()=>{setPosition(p=>p-1);setQuery('');}}><span class="explorer-back" aria-hidden="true">←</span>Back</button>
      <button disabled=${position===history.length-1} aria-label="Forward" onClick=${()=>{setPosition(p=>p+1);setQuery('');}}>→</button>
      <button disabled=${section==='home'} onClick=${()=>browse('home')}><span class="explorer-up" aria-hidden="true">↑</span>Up to My Computer</button>
    </div>
    <div class="explorer-address"><span>Address</span><div><img src="/assets/xp/folder.png" alt=""/>${section==='home'?'My Computer':`My Computer / ${folderName(section)}`}</div><label><span class="sr-only">Search ${folderName(section)}</span><input type="search" value=${query} placeholder="Search this folder" onInput=${(e:Event)=>setQuery((e.target as HTMLInputElement).value)}/></label></div>
    <div class="explorer-body"><aside class="explorer-sidebar"><section><h2>Other Places</h2><div><button onClick=${()=>browse('home')} aria-current=${section==='home'?'page':undefined}><img src="/assets/xp/computer.png" alt=""/>My Computer</button>${directories.map(d=>html`<button aria-current=${section===d.id?'page':undefined} onClick=${()=>browse(d.id)}><img src=${`/assets/xp/${d.icon}.png`} alt=""/>${d.name}</button>`)}</div></section><section><h2>Details</h2><div><strong>${folderName(section)}</strong><p>${section==='projects'?'Select a project to read about it in Alexacarta. External website links are in each entry.':'Select an item to open it.'}</p><p>${items.length} items</p></div></section></aside>
    <main class=${`explorer-files${details?' details-view':''}${section==='pictures'||section==='music'?' gallery-view':''}`} aria-label=${folderName(section)}>
      ${details&&html`<div class="explorer-columns" aria-hidden="true"><span>Name</span><span>Type</span></div>`}
      ${visible.map(item=>html`<button class=${`explorer-file explorer-folder${item.thumbnail?' explorer-thumbnail':''}`} onClick=${item.open}><img src=${item.image} alt="" loading="lazy"/><span class="explorer-file-name">${item.name}</span><span class="explorer-file-type">${item.type}</span><span class="explorer-file-description">${item.description}</span></button>`)}
      ${!visible.length&&html`<p class="explorer-empty">${query?`No items match “${query}”.`:'This folder is empty.'}${query&&html` <button onClick=${()=>setQuery('')}>Clear search</button>`}</p>`}
    </main></div><div class="explorer-status" role="status"><span>${visible.length} objects</span><span><img src="/assets/xp/computer.png" alt=""/>My Computer</span></div>`;
}
