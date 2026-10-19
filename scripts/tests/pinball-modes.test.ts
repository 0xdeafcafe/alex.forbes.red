import test from 'node:test';
import assert from 'node:assert/strict';
import {freshMode,ballTimeScale,tickMode,hitSurface,enterClub,flipperSettings,delayedControls,hitPepLane,type Controls} from '../render/components/pinball-modes.js';

test('club surfaces score only during club time and debounce contact',()=>{
 const mode=freshMode();assert.equal(hitSurface(mode,'rail','keta'),0);enterClub(mode);
 assert.equal(hitSurface(mode,'rail','keta'),1000);assert.equal(mode.keta,1);assert.equal(hitSurface(mode,'rail','keta'),0);
 tickMode(mode,.76);assert.equal(hitSurface(mode,'rail','keta'),1000);assert.equal(mode.keta,2);
 tickMode(mode,15);assert.equal(mode.club,0);assert.equal(mode.keta,0);assert.equal(hitSurface(mode,'rail','keta'),0);
});
test('third keta hit gives delayed slow flippers without slowing the ball',()=>{
 const mode=freshMode();enterClub(mode);for(let i=0;i<3;i++)hitSurface(mode,String(i),'keta');
 assert.equal(mode.kind,'khole');assert.equal(mode.remaining,8);assert.equal(ballTimeScale(mode),1);assert.equal(mode.keta,0);
 assert.equal(flipperSettings(mode).speed,3);assert.equal(flipperSettings(mode).delay,24);
 // Pep still scores in a K-hole, but cannot cancel the penalty.
 assert.equal(hitSurface(mode,'pep','pep'),250);assert.equal(mode.kind,'khole');tickMode(mode,8);assert.equal(mode.kind,'normal');
});
test('horse doses accumulate outside the club without repeated contact farming',()=>{
 const mode=freshMode();for(let i=0;i<3;i++){assert.equal(hitSurface(mode,'horse','keta',true),1000);assert.equal(hitSurface(mode,'horse','keta',true),0);if(i<2)tickMode(mode,1);}
 assert.equal(mode.kind,'khole');
});
test('pep expands and speeds up flippers, then restores their exact dimensions',()=>{
 const mode=freshMode();enterClub(mode);assert.equal(hitSurface(mode,'p','pep'),250);
 assert.deepEqual(flipperSettings(mode),{speed:23,length:72,radius:10,delay:0});assert.equal(ballTimeScale(mode),1.12);
 tickMode(mode,10);assert.deepEqual(flipperSettings(mode),{speed:14,length:60,radius:7,delay:0});assert.equal(ballTimeScale(mode),1);
});
test('K-hole delays both press and release for 24 fixed steps',()=>{
 const mode=freshMode();mode.kind='khole';mode.remaining=8;const history:Controls[]=[];
 for(let i=0;i<24;i++)assert.equal(delayedControls(history,{left:true,right:false},mode).left,false);
 assert.equal(delayedControls(history,{left:true,right:false},mode).left,true);
 for(let i=0;i<24;i++)assert.equal(delayedControls(history,{left:false,right:false},mode).left,true);
 assert.equal(delayedControls(history,{left:false,right:false},mode).left,false);
});
test('PEP lanes require three distinct lanes; fresh game clears all effect state',()=>{
 const mode=freshMode();assert.equal(hitPepLane(mode,0),false);assert.equal(hitPepLane(mode,0),false);assert.equal(hitPepLane(mode,1),false);assert.equal(hitPepLane(mode,2),true);assert.equal(mode.kind,'pep');
 assert.deepEqual(freshMode(),{kind:'normal',remaining:0,cooldown:0,pepLanes:[false,false,false],club:0,keta:0,contacts:{}});
});
