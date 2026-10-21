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
 player:{hp:number;ink:number;mode?:string};
 playerInkRecoveryState?:string;
 /** Actual 60Hz native human respawn countdown, never Actor placement. */
 humanRespawnTicksRemaining?:number|null;
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
 const respawnSeconds=lifeState==='SPLATTED'&&Number.isSafeInteger(ticks)&&
  ticks!==null&&ticks!==undefined&&ticks>=0&&ticks<=150?
  Math.ceil(ticks/6)/10:null;
 return {
  clock:`${minutes}:${rest}`,
  hp:clampPercent(s.player.hp),
  lifeState,respawnSeconds,
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
 ui.appendChild(damageVignette);
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
 ui.appendChild(splatNotice);
 const countdown=splatNotice.querySelector<HTMLElement>(
  '#t21-f3-b82-respawn-countdown')!;
 let previousHp:number|null=null;
 let previousTick:number|null=null;
 let damageFlashThrough=-1;
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
 const activity=new B75SourceInkActivity();
 const activityBox=select('t21-f3-b75-source-ink-live');
 const activityHead=select('t21-f3-b75-source-ink-head');
 const activityCounts=select('t21-f3-b75-source-ink-counts');
 const humanCoach=new B76HumanSourceCoach();
 const humanBox=select('t21-f3-b76-human-ink-coach');
 const humanHead=select('t21-f3-b76-head');
 const humanCounts=select('t21-f3-b76-counts');
 const humanHint=select('t21-f3-b76-hint');
 function render(value:F3PlayableHudState){
  const v=formatF3PlayableHud(value);
  clock.textContent=v.clock;
  state.textContent=v.sessionState;
  state.style.color=value.stopReason?'#ff8790':'#90e8f2';
  hpBar.style.width=v.hp+'%';
  hpBar.style.background=v.hp<=30?'#ff8888':'#53e4ea';
  inkBar.style.width=v.ink+'%';
  vitals.textContent='HP '+v.hp+' · INK '+v.ink;
  cpu.textContent='CPU '+v.cpuRecovered+'/7 · '+v.sourceState;
  practice.textContent=v.scoring;
  const splatted=v.lifeState==='SPLATTED';
  splatNotice.hidden=!splatted||value.matchState==='TIME_UP'||!!value.stopReason;
  countdown.textContent=v.respawnSeconds===null?'RESPAWNING…':
   'RESPAWN IN '+v.respawnSeconds.toFixed(1)+'s';
  splatNotice.dataset.nativeRespawnSeconds=
   v.respawnSeconds===null?'UNAVAILABLE':v.respawnSeconds.toFixed(1);
  const tick=value.tick,hp=value.player.hp;
  const validTick=Number.isSafeInteger(tick)&&tick!==undefined&&tick>=0;
  if(validTick&&Number.isFinite(hp)){
   if(previousTick!==null&&tick<previousTick){
    previousHp=null;damageFlashThrough=-1;
   }
   if(previousTick!==null&&tick>previousTick&&
      previousHp!==null&&hp<previousHp-.01)
    damageFlashThrough=tick+20; // Real 60Hz: 0.33s, not wall-clock guessed.
   previousHp=hp;previousTick=tick;
  }
  const hurt=validTick&&!splatted&&!value.paused&&!value.stopReason&&
   tick<=damageFlashThrough;
  damageVignette.style.opacity=hurt?'1':'0';
  damageVignette.dataset.actualHpDrop=hurt?'VISIBLE':'OFF';
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
  root.dataset.humanInk=String(v.ink);
  root.dataset.clock=v.clock;
  root.dataset.cpuSourceOnly='true';
  root.dataset.crossTeamContactCertified='false';
 }
 return {root,render};
}
