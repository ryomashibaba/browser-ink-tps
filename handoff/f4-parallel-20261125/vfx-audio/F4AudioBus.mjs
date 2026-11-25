// F4 presentation only: one shared context and bounded wet audio voices per canvas.
export function priorityFor(cue){return ['SPLAT','RESPAWN','CPU_SPLAT','TIME_UP'].includes(cue)?3:['CPU_HIT','HURT','EXPLODE'].includes(cue)?2:0;}

export function weaponTexture(kind){
 if(['BLASTER','ROLLER','SLOSHER'].includes(kind))return {volume:.029,lowpassHz:950};
 if(['CHARGER','STRINGER'].includes(kind))return {volume:.006,lowpassHz:2900};
 return {volume:.015,lowpassHz:1700};
}

export function voiceAdmission(active,priority){return Number.isInteger(active)&&active>=0&&active<(priority>=2?12:8);}
export class F4AudioBus {
 constructor(makeContext){this.makeContext=makeContext;this.context=null;this.master=null;this.noise=null;this.active=0;this.muted=false;this.last=new Map();}
 unlock(){
  try{
   if(!this.context||this.context.state==='closed'){
    const ctx=this.makeContext();if(!ctx)return null;
    const master=ctx.createGain();master.gain.value=this.muted?0:.72;
    if(typeof ctx.createDynamicsCompressor==='function'){
     const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-15;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.14;master.connect(limiter);limiter.connect(ctx.destination);
    }else master.connect(ctx.destination);
    this.context=ctx;this.master=master;this.noise=null;this.last.clear();this.active=0;
   }
   if(this.context.state==='suspended')this.context.resume().catch(()=>{});
   return this.context;
  }catch{return null;}
 }
 setMuted(muted){
  this.muted=!!muted;
  try{if(this.context&&this.master){const t=this.context.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(this.muted?0:.72,t,.012);}}catch{}
 }
 reset(){this.last.clear();}
 sampleNoise(ctx){
  if(this.noise)return this.noise;
  const b=ctx.createBuffer(1,Math.min(32768,Math.ceil(ctx.sampleRate*.4)),ctx.sampleRate),data=b.getChannelData(0);
  let seed=0x6d2b79f5;
  for(let i=0;i<data.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;data[i]=(seed>>>0)/0x80000000-1;}
  return this.noise=b;
 }
 play(v){
  const ctx=this.context,master=this.master;
  if(this.muted||!ctx||!master||ctx.state!=='running'||!voiceAdmission(this.active,v.priority))return false;
  if(![v.frequency,v.end,v.duration,v.volume,v.pan??0,v.cooldown??0].every(Number.isFinite)||v.duration<=.015||v.duration>.8||v.frequency<20||v.end<20||v.volume<=0)return false;
  const now=ctx.currentTime;
  if(v.key&&now-(this.last.get(v.key)??-Infinity)<(v.cooldown??0))return false;
  const nodes=[],sources=[];let pending=0,admitted=false,failed=false;
  const release=()=>{if(--pending===0){for(const node of nodes)try{node.disconnect();}catch{}if(admitted&&this.context===ctx)this.active=Math.max(0,this.active-1);}};
  const connectSource=(node,output,duration)=>{sources.push(node);node.connect(output);node.onended=release;pending++;node.start(now);node.stop(now+duration+.012);};
  try{
   const out=ctx.createGain();nodes.push(out);out.gain.value=1;
   if(typeof ctx.createStereoPanner==='function'&&Math.abs(v.pan??0)>.001){const pan=ctx.createStereoPanner();nodes.push(pan);pan.pan.value=Math.max(-1,Math.min(1,v.pan??0));out.connect(pan);pan.connect(master);}else out.connect(master);
   const osc=ctx.createOscillator(),g=ctx.createGain();nodes.push(osc,g);
   osc.type=v.wave;osc.frequency.setValueAtTime(v.frequency,now);osc.frequency.exponentialRampToValueAtTime(v.end,now+v.duration);
   g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.min(.12,v.volume),now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+v.duration);g.connect(out);
   connectSource(osc,g,v.duration);
   if(v.texture&&Number.isFinite(v.texture.volume)&&v.texture.volume>0&&Number.isFinite(v.texture.lowpassHz)){
    const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),body=ctx.createGain();nodes.push(noise,filter,body);
    noise.buffer=this.sampleNoise(ctx);noise.loop=true;filter.type='lowpass';filter.frequency.value=Math.max(80,Math.min(8000,v.texture.lowpassHz));
    const dur=Math.min(v.duration,.32);body.gain.setValueAtTime(.0001,now);body.gain.linearRampToValueAtTime(Math.min(.1,v.texture.volume),now+.008);body.gain.exponentialRampToValueAtTime(.0001,now+dur);
    filter.connect(body);body.connect(out);connectSource(noise,filter,dur);
   }
   admitted=true;this.active++;if(v.key)this.last.set(v.key,now);return true;
  }catch{failed=true;for(const node of sources)try{node.onended=null;node.stop(now);}catch{}for(const node of nodes)try{node.disconnect();}catch{}return false;}
 }
}
const buses=new WeakMap();
export function f4AudioBus(canvas){let bus=buses.get(canvas);if(!bus){bus=new F4AudioBus(()=>{const C=window.AudioContext??window.webkitAudioContext;return C?new C({latencyHint:'interactive'}):null;});buses.set(canvas,bus);}return bus;}
