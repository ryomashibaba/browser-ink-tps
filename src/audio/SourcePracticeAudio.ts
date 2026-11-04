/** Real, source-only 60Hz combat audio. No network, original audio asset or game writes. */
export type SourceCue='SHOT'|'DRY'|'THROW'|'EXPLODE'|'CPU_HIT'|'CPU_SPLAT'|'HURT'|'SPLAT'|'RESPAWN'|'TIME_UP';
export interface SourceAudioFrame {
 tick:number;phase:'STAGING'|'PLAYING'|'TIME_UP';locked:boolean;stopped:boolean;
 shots:number;dry:number;throws:number;explosions:number;hits:number;
 cpuSplats:number;damage:number;humanSplats:number;respawns:number;
}
const counters=['shots','dry','throws','explosions','hits','cpuSplats','damage','humanSplats','respawns'] as const;
export function sourceAudioCues(a:SourceAudioFrame|null,b:SourceAudioFrame):SourceCue[]{
 if(!a||!Number.isSafeInteger(b.tick)||b.tick!==a.tick+1||
  !a.locked||!b.locked||a.stopped||b.stopped||a.phase!=='PLAYING'||
  (b.phase!=='PLAYING'&&b.phase!=='TIME_UP'))return [];
 for(const k of counters)
  if(!Number.isSafeInteger(a[k])||!Number.isSafeInteger(b[k])||
   a[k]<0||b[k]<a[k])return [];
 if(b.cpuSplats>b.hits)return [];
 const newEvent=(k:typeof counters[number])=>b[k]>a[k];
 const sound:SourceCue[]=[];
 if(newEvent('humanSplats'))sound.push('SPLAT');
 else if(newEvent('damage'))sound.push('HURT');
 if(newEvent('cpuSplats'))sound.push('CPU_SPLAT');
 else if(newEvent('hits'))sound.push('CPU_HIT');
 if(newEvent('respawns'))sound.push('RESPAWN');
 if(newEvent('explosions'))sound.push('EXPLODE');
 else if(newEvent('throws'))sound.push('THROW');
 if(newEvent('shots'))sound.push('SHOT');
 else if(newEvent('dry'))sound.push('DRY');
 if(b.phase==='TIME_UP')sound.push('TIME_UP');
 return sound;
}
const voice:Record<SourceCue,[number,number,number,number,OscillatorType,number]>={
 SHOT:[245,130,.065,.025,'triangle',.075],
 DRY:[115,80,.09,.02,'square',.3],
 THROW:[360,230,.12,.03,'triangle',.15],
 EXPLODE:[110,52,.2,.04,'sawtooth',.18],
 CPU_HIT:[570,800,.11,.04,'sine',.1],
 CPU_SPLAT:[750,285,.22,.048,'triangle',.2],
 HURT:[190,85,.14,.045,'sawtooth',.17],
 SPLAT:[260,70,.34,.045,'triangle',.35],
 RESPAWN:[290,520,.25,.032,'sine',.25],
 TIME_UP:[420,210,.4,.034,'triangle',.4]
};
/** Real pointer-lock only. M = mute. External SOUND/MUSIC files are not required. */
export class SourcePracticeAudio {
 private ctx:AudioContext|null=null;
 private muted=false;
 private previous:SourceAudioFrame|null=null;
 private readonly last=new Map<SourceCue,number>();
 private readonly notice:HTMLDivElement;
 private noticeUntil=0;
 constructor(private readonly canvas:HTMLCanvasElement){
  const n=document.createElement('div');
  n.id='t21-f3-native-audio';
  n.dataset.sourceOnly='true';
  n.dataset.scoreable='0';
  n.dataset.gameplayWrites='0';
  n.setAttribute('role','status');n.setAttribute('aria-live','polite');
  n.hidden=true;
  n.style.cssText='position:fixed;bottom:16px;right:16px;z-index:42;'+
   'pointer-events:none;padding:8px 12px;border:1px solid #6dd9dc;'+
   'border-radius:8px;color:#eaffff;background:#041d2bef;font:700 11px system-ui';
  document.body.appendChild(n);this.notice=n;
  canvas.dataset.t21SourceAudio='WAITING_USER_GESTURE';
  canvas.addEventListener('pointerdown',()=>{
   if(!this.muted)this.unlock();
  });
  window.addEventListener('keydown',event=>{
   if(event.code!=='KeyM'||event.repeat||event.altKey||
    event.ctrlKey||event.metaKey||
    document.pointerLockElement!==this.canvas)return;
   this.muted=!this.muted;
   if(!this.muted)this.unlock();
   this.canvas.dataset.t21SourceAudio=this.muted?'MUTED':
    this.ctx?'ENABLED':'UNAVAILABLE';
   n.textContent=this.muted?'SOURCE SOUND OFF · M':
    this.ctx?'SOURCE SOUND ON · M':'SOURCE SOUND UNAVAILABLE';
   n.hidden=false;this.noticeUntil=performance.now()+1800;
   event.preventDefault();
  });
  document.addEventListener('pointerlockchange',()=>{
   if(document.pointerLockElement!==this.canvas)n.hidden=true;
  });
 }
 private unlock():void{
  if(this.ctx){
   if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});
   return;
  }
  try{
   if(typeof window.AudioContext!=='function'){
    this.canvas.dataset.t21SourceAudio='UNAVAILABLE';return;
   }
   this.ctx=new window.AudioContext({latencyHint:'interactive'});
   if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});
   this.canvas.dataset.t21SourceAudio='ENABLED';
  }catch{this.canvas.dataset.t21SourceAudio='UNAVAILABLE';}
 }
 public observe(frame:SourceAudioFrame):void{
  if(!this.notice.hidden&&performance.now()>this.noticeUntil)
   this.notice.hidden=true;
  const cues=sourceAudioCues(this.previous,frame);
  this.previous={...frame};
  if(this.muted||!this.ctx||this.ctx.state!=='running')return;
  for(const cue of cues)this.play(cue);
 }
 private play(cue:SourceCue):void{
  const ctx=this.ctx;
  if(!ctx)return;
  const [freq,end,duration,volume,wave,cooldown]=voice[cue];
  const now=ctx.currentTime;
  if(now-(this.last.get(cue)??-Infinity)<cooldown)return;
  this.last.set(cue,now);
  try{
   const oscillator=ctx.createOscillator();
   const gain=ctx.createGain();
   oscillator.type=wave;
   oscillator.frequency.setValueAtTime(freq,now);
   oscillator.frequency.exponentialRampToValueAtTime(Math.max(end,20),now+duration);
   gain.gain.setValueAtTime(.0001,now);
   gain.gain.exponentialRampToValueAtTime(volume,now+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   oscillator.connect(gain);gain.connect(ctx.destination);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
   oscillator.start(now);oscillator.stop(now+duration+.012);
  }catch{this.canvas.dataset.t21SourceAudio='UNAVAILABLE';}
 }
}
