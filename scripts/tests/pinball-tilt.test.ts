import test from 'node:test';
import assert from 'node:assert/strict';
import {freshTilt,tickTilt,nudgeTable} from '../render/components/pinball-tilt.js';
test('three quick nudges tilt; held input cannot repeat within the cooldown',()=>{
 const t=freshTilt();assert.ok(nudgeTable(t));assert.equal(nudgeTable(t),false);
 tickTilt(t,.35);assert.ok(nudgeTable(t));assert.equal(t.tilted,false);
 tickTilt(t,.35);assert.ok(nudgeTable(t));assert.equal(t.tilted,true);
 tickTilt(t,30);assert.equal(t.tilted,true);assert.equal(nudgeTable(t),false);
 assert.equal(freshTilt().tilted,false);
});
test('spaced nudges cool down without tilting',()=>{
 const t=freshTilt();for(let i=0;i<10;i++){assert.ok(nudgeTable(t));tickTilt(t,4);assert.equal(t.tilted,false);}
});
