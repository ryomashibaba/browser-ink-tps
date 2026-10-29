/**
 * W10-B17 readable, explicitly NON-SCORING gameplay HUD. All values are
 * read-only projections of the existing F3 native simulation snapshot.
 * No score mask, win/loss inference, opponent positions or CPU authority.
 */
import {B75SourceInkActivity,type B75NativeInkFrame}
 from './UndertowF3LiveSourceInkActivity';
import {B76HumanSourceCoach}
 from './UndertowF3HumanInkCoach';

export interface F3PlayableHudState extends B75NativeInkFrame {
 player:{hp:number;ink:number;mode?:string;inkRelation?:string};
 playerInkRecoveryState?:string;
 /** Actual 60Hz native human respawn countdown, never Actor placement. */
 humanRespawnTicksRemaining?:number|null;
 humanCpuDirectHits?:number;
 humanCpuDirectSplats?:number;
 inkDryFireAttempts?:number;
 matchState:string;
 timeRemainingSeconds:number;
 cpu:{physicalRejoins:readonly string[];freeCombatEnabled:boolean};
 shotsFired:number;
 cpuSourceTurfShots:number;
 cpuSplats:number;
 humanSplats:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 stopReason:string|null;
}
/** B135: genuine 60Hz KCC/projectile combat telemetry, without an ink score. */
export interface F3NativeCombatPulse{
 tick:number;hp:number;ink:number;inkRelation:string;
 respawnTicks:number|null;hitCount:number;splatCount:number;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;stopReason:string|null;
 originalSolids:number;originalPaint:number;originalLinks:number;
 scoreable:number;productionAuthorized:false;unrestricted4v4Certified:false;
}
/**
 * B136 — a source-certified real CPU damage marker can also be displayed
 * during the isolated genuine pointer-locked combat QA staging phase.
 * STAGING does not grant any new hit or player aim. Only real monotonic
 * direct damage counters, original source 25/17/26/0 and a native event
 * window can render a marker. TIME_UP/unsafe remain suppressed.
 * Paused source-QA executes real Rapier 60Hz steps by advanceQaTicks() to
 * confirm pointer-locked damage: paused is NOT proof of synthetic damage.
 * This matches historical B88 visibility while still requiring actual hits.
 */
export function genuineF3DirectHitVisible(x:{
 sourceTrusted:boolean;nativeTick:number;
 realHitCount:number|null;nativeMarkerUntil:number;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;stopReason:string|null;
}):boolean{
 return x.sourceTrusted&&Number.isSafeInteger(x.nativeTick)&&
  x.nativeTick>=0&&Number.isSafeInteger(x.realHitCount)&&
  x.realHitCount!==null&&x.realHitCount>=0&&
  Number.isSafeInteger(x.nativeMarkerUntil)&&
  x.nativeMarkerUntil>=x.nativeTick&&
  x.matchState!=='TIME_UP'&&!x.stopReason;
}
/**
 * B243: read-only sight-line feedback for the real source round. This is
 * camera-target/muzzle geometry only, not a projectile collision, enemy
 * hit, paint event, or authority to score original Turf.
 */
export type F3SourceAimRayKind='SOURCE_PAINT'|'SOURCE_SOLID'|'NO_REGISTERED_HIT';
export function sourceF3RealAimLineCue(x:{
 stage:readonly number[];nativeTick:number;
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 paused:boolean;stopReason:string|null;pointerLocked:boolean;
 hitKind:F3SourceAimRayKind;rayDistanceMeters:number|null;
}){
 if(x.stage.join(',')!=='25,17,26,0'||x.matchState!=='PLAYING'||
    x.paused||x.stopReason||!x.pointerLocked||
    !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    (x.hitKind!=='NO_REGISTERED_HIT'&&
     (typeof x.rayDistanceMeters!=='number'||
      !Number.isFinite(x.rayDistanceMeters)||x.rayDistanceMeters<0)))
  return null;
 const distance=x.rayDistanceMeters===null?'':x.rayDistanceMeters.toFixed(1)+'m';
 const label=x.hitKind==='SOURCE_PAINT'?
   'SOURCE PAINT LINE · '+distance:
  x.hitKind==='SOURCE_SOLID'?
   'REGISTERED COVER LINE · '+distance:
   'NO REGISTERED SURFACE ON AIM LINE';
 return {
  kind:x.hitKind,label,
  tint:x.hitKind==='SOURCE_PAINT'?'#8af6ed':
   x.hitKind==='SOURCE_SOLID'?'#ffd48c':'#d8e5ed',
  physicalAimLineOnly:true as const,
  projectileHitCertified:false as const,
  enemyContactCertified:false as const,
  gameplayWrites:0 as const,sourceScoreablePromotions:0 as const
 };
}
const clampPercent=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):0;
export function formatF3PlayableHud(s:F3PlayableHudState){
 // Never turn this nonproduction lab into an inferred winner or a scored match.
 if(s.sourceScoreablePromotions!==0||s.productionAuthorized!==false)
  throw Error('T21_W10B17_HUD_MUST_NEVER_CERTIFY_TURF_SCORE');
 const seconds=Number.isFinite(s.timeRemainingSeconds)?
  Math.max(0,Math.ceil(s.timeRemainingSeconds)):0;
 const minutes=Math.floor(seconds/60);
 const rest=String(seconds%60).padStart(2,'0');
 const cpuCount=Math.max(0,Math.min(7,s.cpu.physicalRejoins.length));
 const lifeState=Number.isFinite(s.player.hp)&&s.player.hp===0?
  'SPLATTED' as const:'ACTIVE' as const;
 const ticks=s.humanRespawnTicksRemaining;
 const humanCpuDirectHits=Number.isSafeInteger(s.humanCpuDirectHits)&&
  s.humanCpuDirectHits!==undefined&&s.humanCpuDirectHits>=0?
  s.humanCpuDirectHits:null;
 const splats=Number.isSafeInteger(s.humanCpuDirectSplats)&&
  s.humanCpuDirectSplats!==undefined&&s.humanCpuDirectSplats>=0&&
  (humanCpuDirectHits===null||s.humanCpuDirectSplats<=humanCpuDirectHits)?
  s.humanCpuDirectSplats:null;
 // Never claim enemy ink from an unauthenticated stage or synthetic matchup.
 const genuineSource=s.originalSourceSolids===25&&
  s.originalPaintSurfaces===17&&s.originalSourceNavigationLinks===26&&
  s.unrestricted4v4Certified===false;
 const warningEnabled=genuineSource&&s.matchState==='PLAYING'&&
  !s.paused&&!s.stopReason&&Number.isFinite(s.player.hp)&&s.player.hp>0;
 // Native enemy ink + critical HP can coexist: do not hide either warning.
 const enemyInk=warningEnabled&&s.player.inkRelation==='ENEMY';
 const lowHp=warningEnabled&&s.player.hp<=35;
 const hazard=enemyInk&&lowHp?'CRITICAL_ENEMY_INK' as const:
  enemyInk?'ENEMY_INK' as const:lowHp?'LOW_HP' as const:'NONE' as const;
 const respawnSeconds=lifeState==='SPLATTED'&&Number.isSafeInteger(ticks)&&
  ticks!==null&&ticks!==undefined&&ticks>=0&&ticks<=150?
  Math.ceil(ticks/6)/10:null;
 return {
  clock:`${minutes}:${rest}`,
  hp:clampPercent(s.player.hp),
  lifeState,respawnSeconds,hazard,
  realHumanCpuDirectHits:genuineSource?humanCpuDirectHits:null,
  realHumanCpuDirectSplats:genuineSource?splats:null,
  ink:clampPercent(s.player.ink),
  cpuRecovered:cpuCount,
  sourceState:cpuCount===7&&s.cpu.freeCombatEnabled?
   'SOURCE-LOCAL PATROL':'SOURCE DROP / REJOIN',
  sessionState:s.stopReason?'SAFE STOP':s.matchState==='TIME_UP'?
   'TIME COMPLETE — NO WINNER':s.paused?'PAUSED':
   s.matchState==='STAGING'?'SOURCE STAGING':'SOURCE PRACTICE',
  humanShots:Math.max(0,Math.floor(s.shotsFired)),
  cpuTurfShots:Math.max(0,Math.floor(s.cpuSourceTurfShots)),
  cpuSplats:Math.max(0,Math.floor(s.cpuSplats)),
  humanSplats:Math.max(0,Math.floor(s.humanSplats)),
  scoring:'UNSCORED / NO OFFICIAL RESULT' as const,
  originalCrossTeamContactCertified:false as const,
  productionAuthorized:false as const
 };
}
/** B290: real native tick0 alone can label a frozen source STAGING READY. */
export function b290SourcePlayerHudPhase(x:{
 matchState:string;paused:boolean;tick:number|undefined;
 stopReason:string|null;playerView:boolean;formattedState:string;
}):string{
 if(x.stopReason||x.matchState==='TIME_UP'||!x.playerView)
  return x.formattedState;
 if(!x.paused||x.matchState!=='STAGING')return x.formattedState;
 if(x.tick===0)return 'READY · SOURCE ROUND';
 if(Number.isSafeInteger(x.tick)&&x.tick!==undefined&&x.tick>0)
  return 'PAUSED · SOURCE REJOIN';
 return x.formattedState;
}
/** B338: only native-authoritative read-only source round guidance. */
export function b338SourceRoundGuide(x:{
 playerView:boolean;matchState:string;
 paused:boolean;tick:number|undefined;stopReason:string|null;
}):{phase:'READY'|'STAGING'|'PLAYING'|'PAUSED'|'TIME_UP'|'STOP'|'QA';text:string}{
 if(!x.playerView)return {phase:'QA',text:''};
 if(x.stopReason)return {phase:'STOP',text:'SAFE STOP · NO OFFICIAL RESULT'};
 if(x.matchState==='TIME_UP')return {phase:'TIME_UP',
  text:'TIME UP · NO WINNER · USE REPLAY CONTROLS'};
 if(x.paused&&x.matchState==='STAGING'&&x.tick===0)
  return {phase:'READY',text:'READY · CLICK START · 180s SOURCE-ONLY'};
 if(x.paused)return {phase:'PAUSED',
  text:'PAUSED · CLICK RESUME TO CONTINUE THIS WORLD'};
 if(x.matchState==='STAGING')
  return {phase:'STAGING',text:'STAGING · 7 REAL CPU PREPARING'};
 if(x.matchState!=='PLAYING')
  return {phase:'STOP',text:'UNVERIFIED SOURCE PHASE · NO RESULT'};
 return {phase:'PLAYING',
  text:'WASD MOVE · MOUSE AIM · LEFT CLICK FIRE · ESC / P PAUSE'};
}
export function createF3PlayableHud(ui:HTMLElement){
 const root=document.createElement('section');
 root.id='t21-f3-practice-hud';
 root.setAttribute('aria-label','Undertow non-scoring practice status');
 root.dataset.sourceScoreable='0';
 root.dataset.productionAuthority='NONE';
 root.style.cssText=
  'position:fixed;top:14px;left:50%;transform:translateX(-50%);'+
  'z-index:37;pointer-events:none;box-sizing:border-box;'+
  'width:min(368px,calc(100vw - 28px));padding:11px 15px 10px;'+
  'color:#f1fcff;background:linear-gradient(130deg,rgba(4,21,35,.94),rgba(13,43,56,.91));'+
  'border:1px solid rgba(73,223,235,.43);border-radius:12px;'+
  'box-shadow:0 12px 42px #001624b5;'+
  'font:600 12px/1.3 system-ui,sans-serif;font-variant-numeric:tabular-nums';
 root.innerHTML=
  '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'+
   '<span id="t21-f3-hud-clock" style="font-size:24px;font-weight:850;letter-spacing:.5px">3:00</span>'+
   '<span id="t21-f3-hud-state" style="font-size:10px;text-align:right;letter-spacing:.7px;color:#90e8f2">SOURCE STAGING</span>'+
  '</div>'+
  '<div style="display:grid;grid-template-columns:24px 1fr 24px 1fr;align-items:center;gap:7px;margin-top:7px">'+
   '<span>HP</span><div style="height:7px;background:#ffffff22;border-radius:6px;overflow:hidden">'+
    '<div id="t21-f3-hud-hp-bar" style="width:100%;height:100%;background:#53e4ea;border-radius:6px"></div></div>'+
   '<span>INK</span><div style="height:7px;background:#ffffff22;border-radius:6px;overflow:hidden">'+
    '<div id="t21-f3-hud-ink-bar" style="width:100%;height:100%;background:#ed4a9c;border-radius:6px"></div></div>'+
  '</div>'+
  '<div style="display:flex;justify-content:space-between;gap:6px;margin-top:7px;color:#c7e6eb;font-size:10px">'+
   '<span id="t21-f3-hud-vitals">HP 100 · INK 100</span>'+
   '<span id="t21-f3-hud-cpu">CPU 0/7</span>'+
  '</div>'+
  '<div id="t21-f3-hud-practice" style="font-size:10px;margin-top:5px;color:#ffc59b">'+
   'UNSCORED / NO OFFICIAL RESULT</div>'+
  '<div id="t21-f3-b338-source-guide" hidden aria-live="off"'+
  ' style="margin-top:6px;padding-top:6px;border-top:1px solid #ffffff32;'+
  'color:#bdedf1;font:650 10px/1.4 system-ui"></div>'+
  // B84: display only a *real* original-surface enemy ink relation or
  // actual low player HP. This is practice guidance, never a Turf result.
  '<div id="t21-f3-b84-danger" hidden role="status" aria-live="off"'+
   ' style="margin-top:7px;padding:7px 9px;border-radius:7px;'+
   'background:rgba(88,30,33,.90);border:1px solid #ff9a85;'+
   'color:#ffe5da;font:800 11px/1.4 system-ui"></div>'+
  // B75: genuine last-180-physics-tick native source paint difference,
  // never a simulated turf point, enemy contact or official match score.
  '<div id="t21-f3-b75-source-ink-live" hidden role="status" aria-live="off"'+
   ' style="margin-top:7px;padding:6px 8px;border-radius:7px;'+
   'border:1px solid #477c8d;background:rgba(5,38,54,.88)">'+
   '<div id="t21-f3-b75-source-ink-head" style="font:800 10px system-ui;'+
    'color:#85f3ea">REAL SOURCE INK · LAST 3s</div>'+
   '<div id="t21-f3-b75-source-ink-counts" style="margin:3px 0;'+
    'font:800 12px system-ui;color:#ebfaff">0 new cells · 0 shots</div>'+
   '<div style="font:500 9px system-ui;color:#f2cfaa">'+
    'Native CPU impacts only · NOT TURF SCORE</div></div>'+
  '<div id="t21-f3-b76-human-ink-coach" hidden'+
   ' style="margin-top:6px;padding:6px 8px;border-radius:7px;'+
   'border:1px solid #557d88;background:rgba(3,31,44,.82)">'+
   '<div id="t21-f3-b76-head" style="font:800 10px system-ui;'+
    'color:#9bdde7">YOUR SOURCE PAINT · LAST 3s</div>'+
   '<div id="t21-f3-b76-counts" style="margin:3px 0;'+
    'font:700 11px system-ui;color:#edfbff">0 real cells · 0 accepted shots</div>'+
   '<div id="t21-f3-b76-hint" style="font:500 9px system-ui;'+
    'color:#f0d4a8">Non-scoring real Human Impact changes</div></div>';
 ui.appendChild(root);
 // B82: visible native human hit/splat cues; source physics & gameplay unchanged.
 // Independent viewport layers avoid translated status-panel clipping.
 const damageVignette=document.createElement('div');
 damageVignette.id='t21-f3-b82-damage-vignette';
 damageVignette.setAttribute('aria-hidden','true');
 damageVignette.style.cssText=
  'position:fixed;inset:0;pointer-events:none;z-index:36;'+
  'background:radial-gradient(ellipse at center,transparent 45%,rgba(255,35,64,.56) 100%);'+
  'opacity:0;transition:opacity .12s ease-out';
 // Lazily attach only when native HP actually drops; no idle compositing.
 const splatNotice=document.createElement('div');
 splatNotice.id='t21-f3-b82-splat-notice';
 splatNotice.setAttribute('role','status');
 splatNotice.hidden=true;
 splatNotice.style.cssText=
  'position:fixed;left:50%;top:44%;transform:translate(-50%,-50%);'+
  'width:min(340px,calc(100vw - 36px));box-sizing:border-box;'+
  'pointer-events:none;z-index:39;text-align:center;color:#fff;'+
  'background:rgba(20,15,31,.90);border:2px solid #ff7c94;'+
  'border-radius:16px;padding:18px 22px;box-shadow:0 12px 50px #220c25a6;'+
  'font:800 15px/1.6 system-ui,sans-serif';
 splatNotice.innerHTML=
  '<strong style="font-size:27px;letter-spacing:2px">SPLATTED</strong>'+
  '<div id="t21-f3-b82-respawn-countdown"></div>'+
  '<small style="display:block;font:600 11px/1.5 system-ui;color:#ffe1e6">'+
  'SOURCE PRACTICE · NO OFFICIAL RESULT</small>';
 // Native splat notice also stays fully detached until genuine HP=0.
 const countdown=splatNotice.querySelector<HTMLElement>(
  '#t21-f3-b82-respawn-countdown')!;
 let previousHp:number|null=null;
 let previousTick:number|null=null;
 let damageFlashThrough=-1;
 // B87: show only actual HUMAN-origin CPU HP damage, no aim/paint inference.
 const hitMarker=document.createElement('div');
 hitMarker.id='t21-f3-b87-hit-confirmation';
 hitMarker.setAttribute('aria-live','off');
 hitMarker.style.cssText=
  'position:fixed;left:50%;top:calc(50% - 43px);transform:translateX(-50%);'+
  'z-index:12;pointer-events:none;border-radius:14px;padding:4px 12px;'+
  'background:rgba(11,41,51,.88);border:1px solid #b1fff0;'+
  'font:900 12px/1.3 system-ui;color:#dcfff8;letter-spacing:1px';
 hitMarker.textContent='CPU HIT';
 hitMarker.dataset.t21B87Source='REAL_HUMAN_DIRECT_DAMAGE_ONLY';
 let lastHitCount:number|null=null;
 let lastSplatCount:number|null=null;
 let lastHitTick=-1;
 let hitMarkerUntil=-1;
 const select=(id:string):HTMLElement=>{
  const element=root.querySelector<HTMLElement>('#'+id);
  if(!element)throw Error('T21_W10B17_HUD_MARKUP_MISSING_'+id);
  return element;
 };
 const clock=select('t21-f3-hud-clock');
 const state=select('t21-f3-hud-state');
 const hpBar=select('t21-f3-hud-hp-bar');
 const inkBar=select('t21-f3-hud-ink-bar');
 const vitals=select('t21-f3-hud-vitals');
 const cpu=select('t21-f3-hud-cpu');
 const practice=select('t21-f3-hud-practice');
 const b338Guide=select('t21-f3-b338-source-guide');
 const danger=select('t21-f3-b84-danger');
 const activity=new B75SourceInkActivity();
 const activityBox=select('t21-f3-b75-source-ink-live');
 const activityHead=select('t21-f3-b75-source-ink-head');
 const activityCounts=select('t21-f3-b75-source-ink-counts');
 const humanCoach=new B76HumanSourceCoach();
 const humanBox=select('t21-f3-b76-human-ink-coach');
 const humanHead=select('t21-f3-b76-head');
 const humanCounts=select('t21-f3-b76-counts');
 const humanHint=select('t21-f3-b76-hint');
 function renderNativeCombat(p:F3NativeCombatPulse){
  // A native pulse is proof of the real source & native stats, NOT
  // authorization of scoreable Turf or unrestricted 4v4.
  const legitimate=p.originalSolids===25&&p.originalPaint===17&&
   p.originalLinks===26&&p.scoreable===0&&
   p.productionAuthorized===false&&p.unrestricted4v4Certified===false&&
   Number.isSafeInteger(p.tick)&&p.tick>=0&&
   Number.isFinite(p.hp)&&p.hp>=0&&p.hp<=100&&
   Number.isFinite(p.ink)&&p.ink>=0&&p.ink<=100.001&&
   Number.isSafeInteger(p.hitCount)&&p.hitCount>=0&&
   Number.isSafeInteger(p.splatCount)&&p.splatCount>=0&&
   p.splatCount<=p.hitCount;
  const tick=legitimate?p.tick:-1;
  const hp=legitimate?p.hp:0;
  const hitCount=legitimate?p.hitCount:null;
  const splatCount=legitimate?p.splatCount:null;
  const splatted=legitimate&&hp===0;
  if(!legitimate){
   // Always fail closed on source drift, even if previous HUD was visible.
   hitMarkerUntil=-1;lastHitCount=null;lastSplatCount=null;
   lastHitTick=-1;previousHp=null;previousTick=null;
   damageFlashThrough=-1;
  }else{
   const hpText='HP '+Math.round(hp)+' · INK '+Math.round(p.ink);
   if(vitals.textContent!==hpText)vitals.textContent=hpText;
   hpBar.style.width=Math.round(hp)+'%';
   hpBar.style.background=hp<=30?'#ff8888':'#53e4ea';
   inkBar.style.width=Math.round(p.ink)+'%';
  }
  const canWarn=legitimate&&p.matchState==='PLAYING'&&
   !p.paused&&!p.stopReason&&hp>0;
  const enemyInk=canWarn&&p.inkRelation==='ENEMY';
  const lowHp=canWarn&&hp<=35;
  const nativeHazard=enemyInk&&lowHp?'CRITICAL_ENEMY_INK':
   enemyInk?'ENEMY_INK':lowHp?'LOW_HP':'NONE';
  danger.hidden=nativeHazard==='NONE';
  const nativeDangerText=nativeHazard==='CRITICAL_ENEMY_INK'?
   'CRITICAL HP + ENEMY INK · ESCAPE & RECOVER':
   nativeHazard==='ENEMY_INK'?'ENEMY INK · LEAVE THE AREA':
   nativeHazard==='LOW_HP'?'LOW HP · RECOVER':'NONE';
  if(!danger.hidden&&danger.textContent!==nativeDangerText)
   danger.textContent=nativeDangerText;
  danger.style.borderColor=nativeHazard==='CRITICAL_ENEMY_INK'?
   '#ff5165':'#ff9a85';
  danger.dataset.t21B84RealHazard=nativeHazard;
  const validHitTick=legitimate;
  if(validHitTick&&hitCount!==null&&splatCount!==null){
   const monotonic=lastHitCount!==null&&lastSplatCount!==null&&
    tick>=lastHitTick&&hitCount>=lastHitCount&&splatCount>=lastSplatCount;
   if(!monotonic)hitMarkerUntil=-1;
   if(monotonic&&lastSplatCount!==null&&splatCount>lastSplatCount){
    hitMarkerUntil=tick+75;
    hitMarker.textContent='CPU SPLAT';
   }else if(monotonic&&lastHitCount!==null&&hitCount>lastHitCount){
    hitMarkerUntil=tick+48;
    hitMarker.textContent='CPU HIT';
   }
   lastHitCount=hitCount;lastSplatCount=splatCount;lastHitTick=tick;
  }else{
   hitMarkerUntil=-1;lastHitCount=null;lastSplatCount=null;lastHitTick=-1;
  }
  const showRealHit=genuineF3DirectHitVisible({
   sourceTrusted:legitimate&&validHitTick,
   nativeTick:tick,realHitCount:hitCount,
   nativeMarkerUntil:hitMarkerUntil,matchState:p.matchState,
   paused:p.paused,stopReason:p.stopReason
  });
  if(showRealHit&&!hitMarker.isConnected)ui.appendChild(hitMarker);
  else if(!showRealHit&&hitMarker.isConnected)hitMarker.remove();
  hitMarker.dataset.t21B87ActualHitCount=String(hitCount??'UNVERIFIED');
  hitMarker.dataset.t21B88HumanDirectSplats=String(splatCount??'UNVERIFIED');
  hitMarker.dataset.t21B135NativeTick=String(tick);
  splatNotice.hidden=!splatted||p.matchState==='TIME_UP'||!!p.stopReason;
  if(!splatNotice.hidden&&!splatNotice.isConnected)ui.appendChild(splatNotice);
  else if(splatNotice.hidden&&splatNotice.isConnected)splatNotice.remove();
  const t=p.respawnTicks;
  const seconds=splatted&&Number.isSafeInteger(t)&&t!==null&&
   t>=0&&t<=150?Math.ceil(t/6)/10:null;
  countdown.textContent=seconds===null?'RESPAWNING…':
   'RESPAWN IN '+seconds.toFixed(1)+'s';
  splatNotice.dataset.nativeRespawnSeconds=
   seconds===null?'UNAVAILABLE':seconds.toFixed(1);
  splatNotice.dataset.t21B135NativeTick=String(tick);
  if(legitimate){
   if(previousTick!==null&&tick<previousTick){
    previousHp=null;damageFlashThrough=-1;
   }
   if(previousTick!==null&&tick>previousTick&&
      previousHp!==null&&hp<previousHp-.01)
    damageFlashThrough=tick+20;
   previousHp=hp;previousTick=tick;
  }
  const hurt=legitimate&&!splatted&&!p.paused&&!p.stopReason&&
   p.matchState==='PLAYING'&&tick<=damageFlashThrough;
  if(hurt){
   if(!damageVignette.isConnected)ui.appendChild(damageVignette);
   damageVignette.style.opacity='1';
  }else if(damageVignette.isConnected){
   damageVignette.remove();
   damageVignette.style.opacity='0';
  }
  damageVignette.dataset.actualHpDrop=hurt?'VISIBLE':'OFF';
  damageVignette.dataset.t21B135NativeTick=String(tick);
 }
 function render(value:F3PlayableHudState){
  const v=formatF3PlayableHud(value);
  clock.textContent=v.clock;
  // B290: post-input native STAGING is not the real tick0 READY world.
  state.textContent=b290SourcePlayerHudPhase({
   matchState:value.matchState,paused:value.paused,tick:value.tick,
   stopReason:value.stopReason,
   playerView:ui.dataset.t21B245Presentation==='PLAYER',
   formattedState:v.sessionState
  });
  state.style.color=value.stopReason?'#ff8790':'#90e8f2';
  hpBar.style.width=v.hp+'%';
  hpBar.style.background=v.hp<=30?'#ff8888':'#53e4ea';
  inkBar.style.width=v.ink+'%';
  vitals.textContent='HP '+v.hp+' · INK '+v.ink;
  cpu.textContent='CPU '+v.cpuRecovered+'/7 · '+v.sourceState;
  practice.textContent=v.scoring;
  const b338=b338SourceRoundGuide({
   playerView:ui.dataset.t21B245Presentation==='PLAYER',
   matchState:value.matchState,paused:value.paused,tick:value.tick,
   stopReason:value.stopReason
  });
  ui.dataset.t21B338Phase=b338.phase;
  b338Guide.hidden=b338.phase==='QA';
  if(!b338Guide.hidden&&b338Guide.textContent!==b338.text)
   b338Guide.textContent=b338.text;
  b338Guide.dataset.t21B338GameplayWrites='0';
  danger.hidden=v.hazard==='NONE';
  const dangerText=v.hazard==='CRITICAL_ENEMY_INK'?
   'CRITICAL HP + ENEMY INK · ESCAPE & RECOVER':
   v.hazard==='ENEMY_INK'?'ENEMY INK · LEAVE THE AREA':
   v.hazard==='LOW_HP'?'LOW HP · RECOVER':'NONE';
  if(!danger.hidden&&danger.textContent!==dangerText)
   danger.textContent=dangerText;
  danger.style.borderColor=v.hazard==='CRITICAL_ENEMY_INK'?
   '#ff5165':'#ff9a85';
  danger.dataset.t21B84RealHazard=v.hazard;
  renderNativeCombat({
   tick:value.tick??-1,hp:value.player.hp,ink:value.player.ink,
   inkRelation:value.player.inkRelation??'UNVERIFIED',
   respawnTicks:value.humanRespawnTicksRemaining??null,
   hitCount:value.humanCpuDirectHits??-1,
   splatCount:value.humanCpuDirectSplats??-1,
   matchState:value.matchState as F3NativeCombatPulse['matchState'],
   paused:value.paused,stopReason:value.stopReason,
   originalSolids:value.originalSourceSolids??-1,
   originalPaint:value.originalPaintSurfaces??-1,
   originalLinks:value.originalSourceNavigationLinks??-1,
   scoreable:value.sourceScoreablePromotions,
   productionAuthorized:value.productionAuthorized as false,
   unrestricted4v4Certified:value.unrestricted4v4Certified as false
  });
  const source=activity.observe(value);
  const verified=!!source&&source.status!=='UNVERIFIED';
  activityBox.hidden=!verified;
  root.dataset.t21B75SourceAuthority=
   verified?'REAL_NATIVE_SOURCE_ONLY':'HOLD_OR_NOT_AVAILABLE';
  if(verified&&source){
   const label=source.status==='REAL_SOURCE_INK'?
    'ORIGINAL SOURCE · INK CHANGED':
    source.status==='SOURCE_SHOTS_NO_NEW_INK'?
    'CPU FIRED · NO NEW SOURCE INK':
    source.status==='SOURCE_PATROL_NO_SHOTS'?
    'SOURCE PATROL · NO RECENT SHOTS':
    source.status==='STAGING'?'SOURCE DROP · STARTING':
    'SOURCE ACTIVITY · PAUSED / COMPLETE';
   activityHead.textContent=label;
   activityCounts.textContent='+'+source.newSourceCells+
    ' real source cells · '+source.realCpuShots+' CPU shots / 3s';
   activityHead.style.color=source.status==='REAL_SOURCE_INK'?
    '#89f3f0':source.status==='SOURCE_SHOTS_NO_NEW_INK'?
    '#ffd58e':'#c9e1e9';
   activityBox.dataset.t21B75Status=source.status;
   activityBox.dataset.t21B75NativeTick=String(source.actualObservedTicks);
   activityBox.dataset.t21B75RecentCells=String(source.newSourceCells);
   activityBox.dataset.t21B75RecentCpuShots=String(source.realCpuShots);
   activityBox.dataset.t21B75OriginalScoring='0';
   activityBox.dataset.t21B75Original4v4Certified='false';
  }
  // B76 is truthful native player feedback, NEVER shot hit-rate or
  // source Turf score; no player health/ink or projectile is modified.
  const human=humanCoach.observe({...value,
   player:{mode:value.player.mode??'UNVERIFIED',ink:value.player.ink}});
  const authorized=!!human&&human.state!=='HOLD';
  humanBox.hidden=!authorized;
  root.dataset.t21B76PlayerSourceTruth=
   authorized?'REAL_HUMAN_ORIGINAL_INK_ONLY':'HOLD_OR_UNAVAILABLE';
  if(authorized&&human){
   const recovering=human.state==='REFILLING_ON_OWN_INK';
   const low=human.state==='LOW_INK'||human.state==='DRY_FIRE';
   humanHead.textContent=recovering?'REFILLING · OWN INK':
    low?'INK LOW · RELOAD WITH SHIFT ON OWN INK':
    human.state==='REAL_SOURCE_PAINT'?'YOUR SHOTS · SOURCE INK CHANGED':
    human.state==='SHOT_WITHOUT_NEW_PAINT'?
     'SHOTS ACCEPTED · NO NEW SOURCE INK':
    human.state==='READY'?'SOURCE PAINT · STAGING':
    human.state==='SUSPENDED'?'SOURCE PAINT · PAUSED / FINISHED':
    'YOUR SOURCE PAINT · LAST 3s';
   humanHead.style.color=low?'#ffd18b':
    recovering?'#9be6ff':'#99f1eb';
   humanCounts.textContent='+'+human.actualHumanChangedCells3s+
    ' real cells · '+human.humanAcceptedShots3s+
    ' shots · '+human.dryFireAttempts3s+' dry';
   humanHint.textContent=recovering?
    'Real SQUID + OWN ink recovery active · not Turf score':
    low?'Hold Shift to refill faster on your own ink':
    'Actual original Human Impact ownership changes · no winner';
   humanBox.dataset.t21B76Status=human.state;
   humanBox.dataset.t21B76NativeTick=String(human.actualObservedTick);
   humanBox.dataset.t21B76ChangedSourceCells=
    String(human.actualHumanChangedCells3s);
   humanBox.dataset.t21B76HumanShots=
    String(human.humanAcceptedShots3s);
   humanBox.dataset.t21B76DryFires=
    String(human.dryFireAttempts3s);
   humanBox.dataset.t21B76OriginalScoreable='0';
   humanBox.dataset.t21B76Original4v4='false';
  }
  root.dataset.matchState=value.matchState;
  root.dataset.cpuRecovered=String(v.cpuRecovered);
  root.dataset.humanShots=String(v.humanShots);
  root.dataset.cpuTurfShots=String(v.cpuTurfShots);
  root.dataset.humanSplats=String(v.humanSplats);
  root.dataset.cpuSplats=String(v.cpuSplats);
  root.dataset.humanHp=String(v.hp);
  root.dataset.b82RealHumanLife=v.lifeState;
  root.dataset.b84Hazard=v.hazard;
  root.dataset.humanInk=String(v.ink);
  root.dataset.clock=v.clock;
  root.dataset.cpuSourceOnly='true';
  root.dataset.crossTeamContactCertified='false';
 }
 return {root,render,renderNativeCombat};
}
