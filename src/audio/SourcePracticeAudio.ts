import {WEAPON_PROFILES,type WeaponId} from '../weapons/WeaponCatalog';
/** Real, source-only 60Hz combat audio. No network, original audio asset or game writes. */
export type SourceCue='SHOT'|'DRY'|'THROW'|'EXPLODE'|'CPU_HIT'|'CPU_SPLAT'|'HURT'|'SPLAT'|'RESPAWN'|'TIME_UP'|'PAINT'|'REFILL'|'LAND'|'SWIM';
export interface SourceAudioFrame {
 tick:number;phase:'STAGING'|'PLAYING'|'TIME_UP';locked:boolean;stopped:boolean;
 shots:number;dry:number;throws:number;explosions:number;hits:number;
 cpuSplats:number;damage:number;humanSplats:number;respawns:number;
 /** Post-PaintCoordinator changed original SOURCE cells; not a Turf score. */
 paintCells?:number;
 /** Actual PlayerResources ink and native KCC pose on this 60Hz tick. */
 ink?:number;inkRelation?:string;mode?:'HUMAN'|'SQUID';
 grounded?:boolean;body?:readonly [number,number,number];
 /** A genuine selected main weapon, never a generic shot simulation. */
 weaponId?:WeaponId;
}
const counters=['shots','dry','throws','explosions','hits','cpuSplats','humanSplats','respawns'] as const;
export function sourceAudioCues(a:SourceAudioFrame|null,b:SourceAudioFrame):SourceCue[]{
 if(!a||!Number.isSafeInteger(b.tick)||b.tick!==a.tick+1||
  !a.locked||!b.locked||a.stopped||b.stopped||a.phase!=='PLAYING'||
  (b.phase!=='PLAYING'&&b.phase!=='TIME_UP'))return [];
 for(const k of counters)
  if(!Number.isSafeInteger(a[k])||!Number.isSafeInteger(b[k])||
   a[k]<0||b[k]<a[k])return [];
 // Damage includes fractional enemy-ink ticks. Reject NaN/rollback, not
 // valid fractional native HP loss (otherwise every later cue goes silent).
 if(!Number.isFinite(a.damage)||!Number.isFinite(b.damage)||
  a.damage<0||b.damage<a.damage||b.cpuSplats>b.hits)return [];
 const hasPaint=a.paintCells!==undefined||b.paintCells!==undefined;
 if(hasPaint&&(!Number.isSafeInteger(a.paintCells)||
  !Number.isSafeInteger(b.paintCells)||(a.paintCells??-1)<0||
  (b.paintCells??-1)<(a.paintCells??-1)))return [];
 const hasInk=a.ink!==undefined||b.ink!==undefined;
 if(hasInk&&(!Number.isFinite(a.ink)||!Number.isFinite(b.ink)||
  (a.ink??-1)<0||(b.ink??-1)<0||
  (a.ink??101)>100.001||(b.ink??101)>100.001))return [];
 const validBody=(p:SourceAudioFrame['body'])=>
  Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
 const hasBody=a.body!==undefined||b.body!==undefined;
 if(hasBody&&(!validBody(a.body)||!validBody(b.body)))return [];
 const newEvent=(k:typeof counters[number]|'damage')=>b[k]>a[k];
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
 // These additions are source-observed outcomes, not inferred impact,
 // enemy location, KCC route, official paint score or input intent.
 if(b.phase==='PLAYING'){
  if(hasPaint&&(b.paintCells??0)>(a.paintCells??0))sound.push('PAINT');
  if(hasInk&&b.mode==='SQUID'&&b.inkRelation==='OWN'&&
   (b.ink??0)>(a.ink??0)+.025)sound.push('REFILL');
  if(a.grounded===false&&b.grounded===true)sound.push('LAND');
  if(hasBody&&a.mode==='SQUID'&&b.mode==='SQUID'&&
   b.inkRelation==='OWN'&&b.grounded===true&&
   Math.hypot(b.body![0]-a.body![0],b.body![2]-a.body![2])>.025)
   sound.push('SWIM');
 }
 if(b.phase==='TIME_UP')sound.push('TIME_UP');
 return sound;
}
const voice:Record<SourceCue,[number,number,number,number,OscillatorType,number]>={
 SHOT:[245,130,.065,.025,'triangle',.04],
 DRY:[115,80,.09,.02,'square',.3],
 THROW:[360,230,.12,.03,'triangle',.15],
 EXPLODE:[110,52,.2,.04,'sawtooth',.18],
 CPU_HIT:[570,800,.11,.04,'sine',.1],
 CPU_SPLAT:[750,285,.22,.048,'triangle',.2],
 HURT:[190,85,.14,.045,'sawtooth',.17],
 SPLAT:[260,70,.34,.045,'triangle',.35],
 RESPAWN:[290,520,.25,.032,'sine',.25],
 TIME_UP:[420,210,.4,.034,'triangle',.4],
 PAINT:[350,178,.055,.009,'sine',.10],
 REFILL:[180,360,.13,.011,'sine',.22],
 LAND:[95,58,.10,.019,'triangle',.18],
 SWIM:[155,210,.09,.012,'sine',.20]
};
/** Twelve real player weapons share one renderer, but not one gunshot tone. */
export function sourceShotTone(id:WeaponId='pulse-sprayer'){
 const p=WEAPON_PROFILES[id]??WEAPON_PROFILES['pulse-sprayer'];
 const wave:OscillatorType=p.weaponClass==='BLASTER'||
  p.weaponClass==='ROLLER'||p.weaponClass==='SLOSHER'?'sawtooth':
  p.weaponClass==='SPLATLING'||p.weaponClass==='DUALIES'?'square':
  p.weaponClass==='CHARGER'||p.weaponClass==='STRINGER'?'sine':'triangle';
 const length=p.weaponClass==='BLASTER'||p.weaponClass==='ROLLER'?1.9:
  p.weaponClass==='CHARGER'||p.weaponClass==='STRINGER'?1.45:
  p.weaponClass==='BRUSH'?0.7:1;
 return {pitch:p.audioPitch,wave,length,volume:Math.min(1.7,Math.max(.65,p.fxScale))};
}
/** Real pointer-lock only. N = audio mute; M is reserved for the existing radar. */
export function sourceAudioMuteHotkey(
 event:Pick<KeyboardEvent,'code'|'repeat'|'altKey'|'ctrlKey'|'metaKey'>,
 pointerLocked:boolean
):boolean{
 return pointerLocked&&event.code==='KeyN'&&!event.repeat&&
  !event.altKey&&!event.ctrlKey&&!event.metaKey;
}
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
   if(!sourceAudioMuteHotkey(event,document.pointerLockElement===this.canvas))return;
   this.muted=!this.muted;
   if(!this.muted)this.unlock();
   this.canvas.dataset.t21SourceAudio=this.muted?'MUTED':
    this.ctx?'ENABLED':'UNAVAILABLE';
   n.textContent=this.muted?'SOURCE SOUND OFF · N':
    this.ctx?'SOURCE SOUND ON · N':'SOURCE SOUND UNAVAILABLE';
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
  for(const cue of cues)this.play(cue,frame.weaponId);
 }
 private play(cue:SourceCue,weaponId?:WeaponId):void{
  const ctx=this.ctx;
  if(!ctx)return;
  const [baseFreq,baseEnd,baseDuration,baseVolume,baseWave,cooldown]=voice[cue];
  const tone=cue==='SHOT'?sourceShotTone(weaponId):null;
  const freq=baseFreq*(tone?.pitch??1),end=baseEnd*(tone?.pitch??1);
  const duration=baseDuration*(tone?.length??1);
  const volume=baseVolume*(tone?.volume??1);
  const wave=tone?.wave??baseWave;
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
