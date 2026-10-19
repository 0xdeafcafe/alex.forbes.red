/** Fictional arcade effects. All timers use active simulation time. */
export type SurfaceKind='keta'|'pep';
export type SpeedMode={kind:'normal'|'khole'|'pep';remaining:number;cooldown:number;pepLanes:boolean[];club:number;keta:number;contacts:Record<string,number>};
export type Controls={left:boolean;right:boolean};
export const freshMode=():SpeedMode=>({kind:'normal',remaining:0,cooldown:0,pepLanes:[false,false,false],club:0,keta:0,contacts:{}});
export const ballTimeScale=(mode:SpeedMode):number=>mode.kind==='pep'?1.12:1;
export const flipperSettings=(mode:SpeedMode)=>({speed:mode.kind==='khole'?3:mode.kind==='pep'?23:14,length:mode.kind==='pep'?72:60,radius:mode.kind==='pep'?10:7,delay:mode.kind==='khole'?24:0});
export function delayedControls(history:Controls[],input:Controls,mode:SpeedMode):Controls {
  history.push({...input});if(history.length>25)history.shift();
  return history[history.length-1-flipperSettings(mode).delay]??{left:false,right:false};
}
export function triggerMode(mode:SpeedMode,kind:'khole'|'pep'):boolean {
  if(mode.cooldown>0||mode.kind==='khole')return false;
  mode.kind=kind;mode.remaining=kind==='khole'?8:10;mode.cooldown=.75;return true;
}
export function enterClub(mode:SpeedMode):void{mode.club=15;mode.keta=0;mode.contacts={};}
export function hitSurface(mode:SpeedMode,id:string,kind:SurfaceKind,horse=false):number {
  if((!horse&&mode.club<=0)||(mode.contacts[id]??0)>0)return 0;
  mode.contacts[id]=.75;
  if(kind==='pep'){triggerMode(mode,'pep');return 250;}
  if(mode.kind!=='khole'){
    mode.keta++;
    if(mode.keta>=3){mode.keta=0;mode.cooldown=0;triggerMode(mode,'khole');}
  }
  return 1000;
}
export function tickMode(mode:SpeedMode,elapsed:number):void {
  const dt=Math.max(0,elapsed),wasClub=mode.club>0;
  mode.cooldown=Math.max(0,mode.cooldown-dt);mode.remaining=Math.max(0,mode.remaining-dt);mode.club=Math.max(0,mode.club-dt);
  for(const id of Object.keys(mode.contacts)){mode.contacts[id]-=dt;if(mode.contacts[id]<=0)delete mode.contacts[id];}
  if(mode.remaining===0)mode.kind='normal';
  if(wasClub&&mode.club===0)mode.keta=0;
}
export function hitPepLane(mode:SpeedMode,index:number):boolean {
  if(index<0||index>2||mode.cooldown>0)return false;
  mode.pepLanes[index]=true;
  if(mode.pepLanes.every(Boolean)){mode.pepLanes.fill(false);return triggerMode(mode,'pep');}return false;
}
export const surfaceKind=(index:number):SurfaceKind=>index%2===0?'pep':'keta';
export const HORSE_TARGET={x:379,y:401,radius:17};
export const PEP_Y=237;
export const PEP_LANES=[182,240,300];
