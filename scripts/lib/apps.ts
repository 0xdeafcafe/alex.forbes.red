import type {Pivot} from '../state.js';
export const APP_IDS = ['zune','messenger','photos','word','explorer','encarta','keygen','pinball'] as const;
export type AppId = typeof APP_IDS[number];
export const APP_NAMES: Record<AppId,string> = {zune:'Alex',messenger:'Alex’s Main Stream Media',photos:'Picture & Fax Viewer',word:'Microsoft Office Word 2003',explorer:'My Computer',encarta:'Alexacarta — My Projects',keygen:'Digital Creativity Keygen',pinball:'Canal Cadet Pinball'};
export const routeApp = (pivot:Pivot):AppId => pivot==='projects'?'encarta':pivot==='words'?'word':pivot==='photography'?'photos':'zune';

/** Personal sites that live outside this desktop, linked like real internet places. */
export const SITE_LINKS = [
  {id:'live',label:'Live Dashboard',name:'live',href:'https://live.forbes.red',icon:'/assets/xp/live.png',blurb:'h2recomp online service'},
  {id:'uplink',label:'Halo 2 Uplink',name:'h2 uplink',href:'https://live.forbes.red/games/halo2',icon:'/assets/xp/halo2-uplink.png',blurb:'Halo 2 service records'},
] as const;
export type SiteLink = typeof SITE_LINKS[number];
