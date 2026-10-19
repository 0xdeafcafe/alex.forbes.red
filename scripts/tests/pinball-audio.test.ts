import test from 'node:test';
import assert from 'node:assert/strict';
import {createPinballAudio} from '../render/components/pinball-audio.js';

test('audio is gesture-created, stops voices when muted/hidden/paused, and disposes',()=>{
 const previous=globalThis.AudioContext;
 let created=0,started=0,stopped=0,closed=0;
 const levels:number[]=[];
 class Context {
  currentTime=1;state='running';destination={};
  constructor(){created++;}
  resume(){return Promise.resolve();}close(){closed++;return Promise.resolve();}
  createGain(){return {gain:{setValueAtTime:(n:number)=>levels.push(n),linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){started++;},stop(when?:number){if(when===undefined)stopped++;}};}
 }
 globalThis.AudioContext=Context as unknown as typeof AudioContext;
 try{
  const sound=createPinballAudio();sound.setEnabled(true);sound.play('launch');assert.equal(created,0);
  sound.unlock();sound.play('launch');assert.equal(created,1);assert.equal(started,1);
  sound.play('launch');assert.equal(started,1,'Repeated contacts are rate limited');
  sound.setMuted(true);assert.equal(stopped,1);assert.equal(levels.at(-1),0);sound.play('target');assert.equal(started,1);
  sound.setMuted(false);sound.play('target');assert.equal(started,2);
  sound.setEnabled(false);assert.equal(stopped,2);assert.equal(levels.at(-1),0);sound.play('drain');sound.unlock();assert.equal(started,2);
  sound.setEnabled(true);sound.play('drain');assert.equal(started,3);
  sound.dispose();assert.equal(closed,1);assert.equal(stopped,3);sound.unlock();sound.play('bumper');assert.equal(started,3);
 }finally{globalThis.AudioContext=previous;}
});
test('muted startup and unavailable WebAudio leave the game usable',()=>{
 const previous=globalThis.AudioContext;let attempted=0;
 globalThis.AudioContext=class {constructor(){attempted++;throw new Error('unavailable');}} as unknown as typeof AudioContext;
 try{const sound=createPinballAudio();sound.setEnabled(true);sound.setMuted(true);sound.unlock();assert.equal(attempted,0);sound.setMuted(false);assert.doesNotThrow(()=>sound.unlock());assert.equal(attempted,1);assert.doesNotThrow(()=>sound.play('launch'));sound.dispose();}finally{globalThis.AudioContext=previous;}
});
