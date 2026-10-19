/** Small, gesture-unlocked synthesizer; no downloaded samples or autoplay. */
export type PinballSound='launch'|'flipper'|'bumper'|'target'|'drain'|'mode';
export function createPinballAudio(){
  let context:AudioContext|undefined,master:GainNode|undefined,muted=false,enabled=false,disposed=false;
  const voices=new Set<OscillatorNode>(),last=new Map<PinballSound,number>();
  const stop=()=>{for(const voice of voices){try{voice.stop();}catch{/* already ended */}}voices.clear();last.clear();};
  const silence=()=>{stop();if(master&&context)master.gain.setValueAtTime(0,context.currentTime);};
  return {
    unlock(){
      if(disposed||muted||!enabled)return;
      try{context??=new AudioContext();if(!master){master=context.createGain();master.connect(context.destination);}master.gain.setValueAtTime(.18,context.currentTime);void context.resume().catch(()=>{});}catch{/* Audio is optional. */}
    },
    setMuted(value:boolean){muted=value;if(value)silence();else if(master&&context&&enabled)master.gain.setValueAtTime(.18,context.currentTime);},
    setEnabled(value:boolean){enabled=value;if(!value)silence();else if(master&&context&&!muted)master.gain.setValueAtTime(.18,context.currentTime);},
    play(kind:PinballSound){
      if(disposed||muted||!enabled||!context||!master||context.state!=='running')return;
      const now=context.currentTime;if(now-(last.get(kind)??-1)<(kind==='flipper'?.035:.065))return;last.set(kind,now);
      const [frequency,end,duration]=({launch:[160,780,.22],flipper:[145,65,.055],bumper:[680,280,.13],target:[1040,620,.16],drain:[240,45,.48],mode:[440,1320,.35]} as const)[kind];
      const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=kind==='flipper'?'triangle':'sine';
      oscillator.frequency.setValueAtTime(frequency,now);oscillator.frequency.exponentialRampToValueAtTime(end,now+duration);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.65,now+.004);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
      oscillator.connect(gain);gain.connect(master);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(now);oscillator.stop(now+duration+.01);
    },
    dispose(){disposed=true;silence();void context?.close().catch(()=>{});},
  };
}
