import type {Pivot} from '../state.js';
export const APP_IDS = ['zune','messenger','photos','word','explorer','encarta','keygen','pinball'] as const;
export type AppId = typeof APP_IDS[number];
export const APP_NAMES: Record<AppId,string> = {zune:'Alex',messenger:'Alex Messenger',photos:'Picture & Fax Viewer',word:'Microsoft Office Word 2003',explorer:'My Computer',encarta:'Alexacarta — My Projects',keygen:'Digital Creativity Keygen',pinball:'Canal Cadet Pinball'};
export const routeApp = (pivot:Pivot):AppId => pivot==='projects'?'encarta':pivot==='words'?'word':pivot==='photography'?'photos':'zune';
