export type TiltState={heat:number;cooldown:number;tilted:boolean};
export const freshTilt=():TiltState=>({heat:0,cooldown:0,tilted:false});
export function tickTilt(state:TiltState,dt:number){state.heat=Math.max(0,state.heat-dt*.35);state.cooldown=Math.max(0,state.cooldown-dt);}
/** Three rapid nudges trip the pendulum. A tilt lasts until the ball drains. */
export function nudgeTable(state:TiltState):boolean {
  if(state.tilted||state.cooldown>0)return false;
  state.heat+=1;state.cooldown=.3;if(state.heat>2.4)state.tilted=true;
  return true;
}
