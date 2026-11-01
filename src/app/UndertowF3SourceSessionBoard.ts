/**
 * W10-B58: user-facing read-only summary of the genuine F3 180s source lab.
 * This is NOT an original Turf score, team ranking or a source-authorized
 * opposing-team 4v4 contact claim. Zero gameplay writes.
 */
import type {sourceCpuInkTempo} from './UndertowF3CpuInkTempo';

/** B387: native 60Hz source round achievement history, not game scoring. */
export class B387RoundMilestones{
 private tick=-1;
 private life=0;
 private alive=true;
 private deathNativeTick:number|null=null;
 private realDeathWitnesses=0;
 private real150TickReturns=0;
 private lastReturnNativeTick:number|null=null;
 private completed=new Set<number>();
 private clearTick:number|null=null;
 private weapon:string|null=null;
 private cells=0;
 private valid=true;
 observe(f:{tick:number;respawns:number;stage:readonly number[];
  playing:boolean;alive:boolean;weapon:string;drop:boolean;
  c:{status:string;sourceLocalPlayClear:boolean;
   actualOriginalRampTouched:boolean;
   actualOriginalRaisedFootColliderId:string|null;
   realPostDropHumanImpactChangedCells:number;genuineGroundedTravelMeters:number;
   naturalCrossTeamRouteProven:boolean;
   sourceScoreablePromotions:number;officialWinner:string}}){
  if(!this.valid)return this.snapshot();
  const c=f.c;
  if(!Number.isSafeInteger(f.tick)||f.tick<=this.tick||
     !Number.isSafeInteger(f.respawns)||f.respawns<this.life||
     f.respawns>this.life+1||f.stage.join(',')!=='25,17,26,0'||
     !f.weapon||c.sourceScoreablePromotions!==0||
     c.naturalCrossTeamRouteProven!==false||c.officialWinner!=='NONE'){
   this.valid=false;return this.snapshot();
  }
  // The actual HP-zero death frame starts the genuine 150-frame respawn.
  // No arbitrary increment to the respawn counter may establish a return.
  const returned=f.respawns===this.life+1;
  if(returned&&(!f.alive||this.alive||this.deathNativeTick===null||
     f.tick-this.deathNativeTick<149)||
     !returned&&this.tick>=0&&!this.alive&&f.alive){
   this.valid=false;return this.snapshot();
  }
  if(this.tick>=0&&this.alive&&!f.alive){
   this.realDeathWitnesses++;this.deathNativeTick=f.tick;
  }
  if(returned){
   this.real150TickReturns++;this.lastReturnNativeTick=f.tick;
   this.deathNativeTick=null;
  }
  this.tick=f.tick;this.life=f.respawns;this.alive=f.alive;
  if(f.playing&&f.alive&&f.drop&&
     c.status==='REAL_LOCAL_CIRCUIT_CLEAR'&&c.sourceLocalPlayClear&&
     c.actualOriginalRampTouched&&
     c.actualOriginalRaisedFootColliderId==='UndertowT21D:right-low-team-a'&&
     Number.isSafeInteger(c.realPostDropHumanImpactChangedCells)&&
     c.realPostDropHumanImpactChangedCells>=60&&
     Number.isFinite(c.genuineGroundedTravelMeters)&&
     c.genuineGroundedTravelMeters>=2&&!this.completed.has(this.life)){
   this.completed.add(this.life);this.clearTick=f.tick;this.weapon=f.weapon;
   this.cells=c.realPostDropHumanImpactChangedCells;
  }
  return this.snapshot();
 }
 snapshot(){
  return {enabled:true as const,valid:this.valid,
   realClearedLives:this.completed.size,
   currentLifeClear:this.alive&&this.completed.has(this.life),
   currentLifeIndex:this.life,lastObservedNativeTick:this.tick,
   nativeHumanAlive:this.alive,
   realNativeDeathWitnesses:this.realDeathWitnesses,
   real150TickReturns:this.real150TickReturns,
   lastNativeDeathTick:this.deathNativeTick,
   lastNativeReturnTick:this.lastReturnNativeTick,
   lastTrueClearTick:this.clearTick,lastTrueWeapon:this.weapon,
   lastTruePostDropCells:this.cells,sourceScoreable:0 as const,
   enemyRoutesCertified:0 as const,officialWinner:'NONE' as const,
   productionAuthorized:false as const};
 }
}


export interface SourceSessionMetrics {
 matchState:'STAGING'|'PLAYING'|'TIME_UP';
 timeRemainingSeconds:number;
 tick:number;
 originalSourceSolids:number;
 originalPaintSurfaces:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified:boolean;
 cpu:{physicalRejoins:readonly string[]};
 b23HumanInkFeedback:{
  humanChangedCells:number;humanChangedImpactCount:number;
  /** Optional actual post-PaintCoordinator B41 source evidence. */
  source?:string;originalSourceOnly?:boolean;scoreablePromotionCount?:number;
  humanBombExplosionsObserved?:number;humanBombStampEvents?:number;
  humanBombChangedEvents?:number;humanBombChangedCells?:number;
  humanBombZeroChangedEvents?:number;
 };
 shotsFired:number;
 cpuSourceTurfShots:number;
 cpuImpactInkCellsChanged:number;
 cpuSplats:number;
 humanSplats:number;
 humanRespawns:number;
 /** Optional true physical shooter: no scripted enemy placement or Turf result. */
 b343OriginalSourceVolleyBudget?:{enabled:boolean};
 /** B384 actual native selectable source circuit flag. */
 b384OpenLoadoutCircuit?:boolean;
 humanCpuDirectHits?:number;
 humanCpuDirectSplats?:number;
 b387RealRoundMilestones?:ReturnType<B387RoundMilestones['snapshot']>|null;
 /** Existing B186 authentic CURRENT-LIFE source-only goal, resets on real death. */
 b186RealOriginalHumanCircuit?:{
  enabled:boolean;status:string;sourceLocalPlayClear:boolean;
  actualOriginalRampTouched:boolean;
  realPostDropHumanImpactChangedCells:number;
  genuineGroundedTravelMeters:number;
  naturalCrossTeamRouteProven:boolean;
  sourceScoreablePromotions:number;
  officialWinner:string;
 };
 stopReason:string|null;
}
export function sourceSessionSummary(s:SourceSessionMetrics){
 if(s.originalSourceSolids!==25||s.originalPaintSurfaces!==17||
    s.originalSourceNavigationLinks!==26||
    s.sourceScoreablePromotions!==0||s.productionAuthorized!==false||
    s.unrestricted4v4Certified!==false)
  throw Error('W10_B58_SOURCE_AUTHORITY_GATE');
 const counts=[s.tick,s.shotsFired,s.cpuSourceTurfShots,
   s.cpuImpactInkCellsChanged,s.b23HumanInkFeedback.humanChangedCells,
   s.b23HumanInkFeedback.humanChangedImpactCount,s.cpuSplats,
   s.humanSplats,s.humanRespawns];
 if(counts.some(n=>!Number.isSafeInteger(n)||n<0)||
    !Number.isFinite(s.timeRemainingSeconds)||s.timeRemainingSeconds<0||
    s.timeRemainingSeconds>180.01||
    s.cpu.physicalRejoins.length>7||
    new Set(s.cpu.physicalRejoins).size!==s.cpu.physicalRejoins.length)
  throw Error('W10_B58_INVALID_NATIVE_SESSION_VALUES');

 // B395: a native human bomb ledger is not an official score or CPU hit.
 // Missing historical data stays UNKNOWN rather than a fabricated zero.
 const humanInk=s.b23HumanInkFeedback;
 const bombFields=[humanInk.humanBombExplosionsObserved,
  humanInk.humanBombStampEvents,humanInk.humanBombChangedEvents,
  humanInk.humanBombChangedCells,humanInk.humanBombZeroChangedEvents];
 const hasBombLedger=bombFields.some(n=>n!==undefined);
 const bombRecap=!hasBombLedger?null:(()=>{
  if(humanInk.source!=='REAL_HUMAN_ORIGINAL_PAINT_EVENT'||
     humanInk.originalSourceOnly!==true||humanInk.scoreablePromotionCount!==0||
     bombFields.some(n=>typeof n!=='number'||!Number.isSafeInteger(n)||n<0)||
     (humanInk.humanBombChangedEvents??-1)+
      (humanInk.humanBombZeroChangedEvents??-1)!==
      (humanInk.humanBombStampEvents??-1)||
     (humanInk.humanBombChangedCells??-1)<
      (humanInk.humanBombChangedEvents??-1))
   throw Error('B395_UNTRUSTED_NATIVE_BOMB_LEDGER');
  return {actualHumanExplosions:humanInk.humanBombExplosionsObserved!,
   actualSourceBombStamps:humanInk.humanBombStampEvents!,
   actualChangedSourceCells:humanInk.humanBombChangedCells!,
   actualZeroChangedStamps:humanInk.humanBombZeroChangedEvents!,
   scoreable:0 as const,cpuHitCertified:false as const,
   gameplayWrites:0 as const};
 })();
 const selectedShooter=s.b343OriginalSourceVolleyBudget?.enabled===true;
 if(s.b384OpenLoadoutCircuit!==undefined&&typeof s.b384OpenLoadoutCircuit!=='boolean')
  throw Error('B384_INVALID_SOURCE_MODE');
 if(selectedShooter&&s.b384OpenLoadoutCircuit===true)
  throw Error('B384_BENCHMARK_CONFLICT');
 const selectedCircuit=selectedShooter||s.b384OpenLoadoutCircuit===true;
 const mission=s.b186RealOriginalHumanCircuit;
 const validPositive=(n:number)=>Number.isFinite(n)&&n>=0;
 if(selectedCircuit&&(
    !mission||mission.enabled!==true||
    !['WAIT_FIRST_DROP','MOVE_TO_ORIGINAL_RAISED','PAINT_ON_RAISED',
      'REAL_LOCAL_CIRCUIT_CLEAR','INVALID_SOURCE_WITNESS'].includes(mission.status)||
    mission.sourceLocalPlayClear!==(mission.status==='REAL_LOCAL_CIRCUIT_CLEAR')||
    mission.naturalCrossTeamRouteProven!==false||
    mission.sourceScoreablePromotions!==0||
    mission.officialWinner!=='NONE'||
    !validPositive(mission.realPostDropHumanImpactChangedCells)||
    !validPositive(mission.genuineGroundedTravelMeters)||
    (mission.sourceLocalPlayClear&&!mission.actualOriginalRampTouched)||
    !Number.isSafeInteger(s.humanCpuDirectHits)||
    !Number.isSafeInteger(s.humanCpuDirectSplats)||
    s.humanCpuDirectHits!<0||s.humanCpuDirectSplats!<0||
    s.humanCpuDirectSplats!>s.humanCpuDirectHits!))
   throw Error('B373_UNTRUSTED_SOURCE_PRACTICE_RECAP');
 const memory=s.b387RealRoundMilestones;
 if(memory&&(!s.b384OpenLoadoutCircuit||!memory.enabled||!memory.valid||
   !Number.isSafeInteger(memory.realClearedLives)||
   memory.realClearedLives<0||
   memory.realClearedLives>s.humanRespawns+1||
   memory.currentLifeIndex!==s.humanRespawns||
   !Number.isSafeInteger(memory.lastObservedNativeTick)||
   memory.lastObservedNativeTick>s.tick||
   memory.sourceScoreable!==0||memory.enemyRoutesCertified!==0||
   memory.officialWinner!=='NONE'||memory.productionAuthorized!==false||
   (memory.currentLifeClear&&!mission?.sourceLocalPlayClear)||
    (memory.currentLifeClear&&!memory.nativeHumanAlive)||
    !Number.isSafeInteger(memory.realNativeDeathWitnesses)||
    memory.realNativeDeathWitnesses<memory.real150TickReturns||
    !Number.isSafeInteger(memory.real150TickReturns)||
    memory.real150TickReturns!==s.humanRespawns||
    (memory.lastNativeDeathTick!==null&&
     (!Number.isSafeInteger(memory.lastNativeDeathTick)||
      memory.nativeHumanAlive||memory.lastNativeDeathTick>s.tick))||
    (memory.lastNativeReturnTick!==null&&
     (!Number.isSafeInteger(memory.lastNativeReturnTick)||
      memory.lastNativeReturnTick>s.tick))||
   (memory.realClearedLives===0&&
    (memory.lastTrueClearTick!==null||memory.lastTrueWeapon!==null))||
   (memory.realClearedLives>0&&
    (!Number.isSafeInteger(memory.lastTrueClearTick)||
     memory.lastTrueClearTick!>s.tick||
     !memory.lastTrueWeapon||memory.lastTruePostDropCells<60))))
  throw Error('B387_UNTRUSTED_ROUND_MILESTONE');
 // Historical field retained for B373: both modes use the same real-life B186 proof.
 const sourceShooter=selectedCircuit&&mission?{
  currentLifeStatus:memory?.nativeHumanAlive===false?
   'WAIT_NATIVE_RESPAWN':mission.status,
  currentLifeLocalClear:mission.sourceLocalPlayClear&&
   memory?.nativeHumanAlive!==false,
  originalRampContact:mission.actualOriginalRampTouched,
  physicalTravelMeters:mission.genuineGroundedTravelMeters,
  trueHumanImpactCells:mission.realPostDropHumanImpactChangedCells,
  actualHumanCpuDirectHits:s.humanCpuDirectHits!,
  actualHumanCpuDirectSplats:s.humanCpuDirectSplats!,
  certifiedNaturalOpponentRoute:false as const,
  officialWinner:'NONE' as const,
  scoringPromotions:0 as const
 }:null;
 const done=s.matchState==='TIME_UP'&&!s.stopReason;
 return {sourceShooter,roundMilestones:memory??null,bombRecap,
  state:s.stopReason?'SAFE_STOP' as const:
   done?'COMPLETE' as const:s.matchState,
  finished:done,
  headline:s.stopReason?'SOURCE SAFETY STOP':
   done?'SOURCE SESSION FINISHED':s.matchState==='PLAYING'?
    'LIVE SOURCE-LOCAL PLAY':'SOURCE-STAGED ENTRY',
  result:'NO OFFICIAL TURF RESULT' as const,
  timeRemainingSeconds:Number(s.timeRemainingSeconds.toFixed(2)),
  genuineHumanShots:s.shotsFired,
  realHumanImpactInkCells:s.b23HumanInkFeedback.humanChangedCells,
  actualHumanImpactEvents:s.b23HumanInkFeedback.humanChangedImpactCount,
  actualCpuSourceShots:s.cpuSourceTurfShots,
  actualCpuImpactInkCells:s.cpuImpactInkCellsChanged,
  actualCpuSplats:s.cpuSplats,
  actualHumanSplats:s.humanSplats,
  actualHumanRespawns:s.humanRespawns,
  cpuPhysicallyRejoined:s.cpu.physicalRejoins.length,
  sourcePaintableSurfaces:17 as const,
  officialScoreableSurfaces:0 as const,
  officialWinner:'NONE' as const,
  matchVictoryCertified:false as const,
  naturallyConnectedOpposingPathsCertified:0 as const,
  productionAuthorized:false as const,
  source:'NATIVE_RAPIER_GAMEPLAY_INK_AND_SEVEN_CPU' as const
 };
}

export function createF3SourceSessionBoard(
 ui:HTMLElement,onRestart:()=>void,onSaveEvidence?:()=>void
){
 const root=document.createElement('section');
 root.id='t21-f3-b58-source-session';
 root.setAttribute('aria-label','Read-only original-source session activities, no Turf score');
 root.dataset.scoreable='0';
 root.dataset.productionAuthority='NONE';
 root.style.cssText='position:fixed;bottom:72px;left:16px;z-index:38;'+
  'width:min(260px,calc(100vw - 32px));box-sizing:border-box;'+
  'padding:11px 13px;border:1px solid #478d9e;border-radius:12px;'+
  'background:linear-gradient(140deg,rgba(3,24,36,.91),rgba(13,37,48,.93));'+
  'box-shadow:0 8px 28px #0009;color:#e7faff;'+
  'font:600 11px/1.5 system-ui,sans-serif;'+
  'font-variant-numeric:tabular-nums;pointer-events:none';
 root.innerHTML=
  '<div id="t21-f3-b58-title" style="color:#94eff2;letter-spacing:.6px;'+
   'font-weight:850">SOURCE SESSION · STAGING</div>'+
  '<div style="font-size:10px;color:#ffcb94;margin:4px 0">'+
   'NON-SCORING · SINCE PAGE LOAD · NOT A 4V4 RESULT</div>'+
  '<div id="t21-f3-b58-counts" style="white-space:pre-line;margin-top:6px"></div>'+
  '<button id="t21-f3-b58-restart" hidden type="button" style="'+
   'background:#51d9e0;color:#08202c;border:0;border-radius:7px;'+
   'width:100%;margin-top:8px;padding:8px;font:800 11px system-ui;'+
   'cursor:pointer;pointer-events:auto">RESTART SOURCE SESSION (R)</button>';
 // B59: a real terminal, centered end-of-session view; not a faux
 // Turf podium and not an alternate match timeline.
 const finish=document.createElement('section');
 finish.id='t21-f3-b59-session-finished';
 finish.hidden=true;
 finish.setAttribute('role','region');
 finish.setAttribute('aria-label','Source session complete, no official Turf result');
 finish.dataset.originalScoreable='0';
 finish.dataset.productionAuthority='NONE';
 finish.style.cssText='position:fixed;inset:0;z-index:80;'+
  'display:flex;align-items:center;justify-content:center;'+
  'background:rgba(1,12,22,.77);padding:20px;box-sizing:border-box;';
 // Explicitly override CSS display because author inline display has
 // precedence over the hidden UA stylesheet.
 finish.style.display='none';
 const panel=document.createElement('div');
 panel.style.cssText='width:min(570px,100%);padding:28px;'+
  'background:linear-gradient(145deg,#092a38,#081722);'+
  'color:#ecfcff;border:1px solid #5ed6e5;border-radius:20px;'+
  'box-shadow:0 25px 90px #000b;font:600 13px/1.7 system-ui;'+
  'max-height:calc(100vh - 40px);overflow-y:auto;'+
  'font-variant-numeric:tabular-nums;text-align:left';
 panel.innerHTML=
  '<div style="font-size:11px;font-weight:850;letter-spacing:2px;color:#95e6ee">'+
    'ORIGINAL-SOURCE PRACTICE · UNSCORED</div>'+
  '<div style="font-size:28px;font-weight:900;letter-spacing:.4px;margin:5px 0 2px">'+
    'SESSION COMPLETE</div>'+
  '<div style="color:#ffd19a;font-size:12px;margin-bottom:16px">'+
    'NO TURF WINNER · CROSS-TEAM ROUTES NOT CERTIFIED</div>'+
  '<div id="t21-f3-b59-final-stats" style="border-top:1px solid #ffffff2d;'+
    'border-bottom:1px solid #ffffff2d;padding:13px 0;white-space:pre-line"></div>'+
  '<div id="t21-f3-b63-source-paint-tempo" style="margin-top:12px;'+
   'padding:9px;border:1px solid #4a8d9b;border-radius:9px;'+
   'font:600 10px/1.5 system-ui;color:#c5eff4" hidden></div>'+
  '<p style="font-size:11px;color:#aacfd7">'+
   'Real source-floor input, ink and CPU activity only. This is not an original 4v4 battle result.</p>'+
  '<button id="t21-f3-b59-restart" type="button" style="'+
   'width:100%;padding:12px;margin-top:6px;background:#56d9de;'+
   'color:#05202a;border:0;border-radius:9px;cursor:pointer;'+
   'font:850 14px system-ui">RESTART ORIGINAL-SOURCE SESSION</button>';
 if(onSaveEvidence){
  const save=document.createElement('button');
  save.id='t21-f3-b62-save-evidence';
  save.type='button';
  save.textContent='SAVE REAL 180s SESSION DATA (LOCAL JSON)';
  save.style.cssText='width:100%;padding:10px;margin-top:8px;'+
   'background:#174459;border:1px solid #59c7d5;color:#e8fcff;'+
   'border-radius:9px;cursor:pointer;font:800 12px system-ui';
  save.addEventListener('click',()=>{
   // User click only, no automatic telemetry or content uploads.
   if(!finish.hidden&&finish.dataset.t21B59State==='FINISHED')
    onSaveEvidence();
  });
  panel.appendChild(save);
 }
 finish.appendChild(panel);
 ui.appendChild(finish);
 const finalStats=finish.querySelector<HTMLElement>('#t21-f3-b59-final-stats')!;
 const tempo=finish.querySelector<HTMLElement>('#t21-f3-b63-source-paint-tempo')!;
 let lastTempoWritten=false;
 const setPaintTempo=(result:ReturnType<typeof sourceCpuInkTempo>|null)=>{
  if(lastTempoWritten||!result||result.status!=='REAL_SOURCE_ACTIVITY_ONLY'||
     !result.windows.length||finish.dataset.t21B59State!=='FINISHED')return;
  if(result.officialTurfResult!=='NONE'||result.sourceScoreableCells!==0)
   throw Error('B63_OFFICIAL_TURF_PROMOTION_FORBIDDEN');
  const max=Math.max(1,...result.windows.map(w=>w.newlyChangedCpuCells));
  const header=document.createElement('div');
  header.style.cssText='font-weight:850;color:#99edf2;margin-bottom:5px';
  header.textContent='REAL CPU PAINT ACTIVITY · CHANGED CELLS, NOT SCORE';
  tempo.replaceChildren(header);
  for(const w of result.windows){
   const r=document.createElement('div');
   r.style.cssText='display:grid;grid-template-columns:74px 1fr 124px;'+
    'align-items:center;gap:7px;margin:4px 0';
   const range=document.createElement('span');
   range.textContent=Math.floor(w.fromNativeSecond)+'–'+
    Math.floor(w.throughNativeSecond)+'s';
   const track=document.createElement('div');
   track.style.cssText='height:7px;background:#ffffff20;'+
    'border-radius:5px;overflow:hidden';
   const fill=document.createElement('div');
   fill.style.cssText='height:100%;background:#53d4e7;width:'+
    (100*w.newlyChangedCpuCells/max).toFixed(1)+'%';
   track.appendChild(fill);
   const values=document.createElement('span');
   values.style.textAlign='right';
   values.textContent=w.newlyChangedCpuCells+' cells / '+
    w.cpuShots+' shots';
   r.append(range,track,values);
   tempo.appendChild(r);
  }
  const note=document.createElement('div');
  note.style.cssText='color:#ffcf98;margin-top:8px';
  note.textContent=result.cpuShotWithoutNewInkWindows>0?
   'CPU fired during '+result.cpuShotWithoutNewInkWindows+
   ' periods with 0 new ink cells. Cause UNDETERMINED; no winner inferred.':
   'All recorded periods with CPU shots also changed source ink.';
  tempo.appendChild(note);
  tempo.hidden=false;
  finish.dataset.t21B63TempoState='REAL_NATIVE_SOURCE_30S_WINDOWS';
  finish.dataset.t21B63Windows=String(result.windows.length);
  finish.dataset.t21B63ZeroInkPeriods=
   String(result.cpuShotWithoutNewInkWindows);
  lastTempoWritten=true;
 };
 finish.querySelector<HTMLButtonElement>('#t21-f3-b59-restart')!
  .addEventListener('click',onRestart);
 const title=root.querySelector<HTMLElement>('#t21-f3-b58-title')!;
 const counts=root.querySelector<HTMLElement>('#t21-f3-b58-counts')!;
 const restart=root.querySelector<HTMLButtonElement>('#t21-f3-b58-restart')!;
 restart.addEventListener('click',onRestart);
 ui.appendChild(root);
 const render=(s:SourceSessionMetrics)=>{
  const v=sourceSessionSummary(s);
  title.textContent=v.headline;
  counts.textContent='HUMAN · '+v.genuineHumanShots+' real shots / '+
   v.realHumanImpactInkCells+' changed impact cells\n'+
   'CPU · '+v.cpuPhysicallyRejoined+'/7 source rejoined / '+
   v.actualCpuSourceShots+' source shots / '+
   v.actualCpuImpactInkCells+' changed impact cells\n'+
   'SPLATS · human '+v.actualHumanSplats+' / CPU '+v.actualCpuSplats+
   ' · human returns '+v.actualHumanRespawns+
   (v.bombRecap?'\nHUMAN SUB · '+v.bombRecap.actualHumanExplosions+
    ' native bursts / '+v.bombRecap.actualSourceBombStamps+
    ' source stamps / '+v.bombRecap.actualChangedSourceCells+
    ' changed cells · NOT TURF SCORE':'')+
   (v.sourceShooter?'\nCURRENT LIFE SOURCE CIRCUIT · '+
    (v.sourceShooter.currentLifeLocalClear?'REAL LOCAL CLEAR':
     v.sourceShooter.currentLifeStatus)+
    ' · REAL HUMAN→CPU HITS '+v.sourceShooter.actualHumanCpuDirectHits:'')+
   (v.roundMilestones?'\nROUND VERIFIED CLEARS · '+
    v.roundMilestones.realClearedLives+
    ' · LAST '+(v.roundMilestones.lastTrueWeapon??'NONE')+
    ' · NO SCORE'+
    (v.roundMilestones.nativeHumanAlive?'':' · HUMAN SPLATTED')+
    ' · REAL RETURNS '+v.roundMilestones.real150TickReturns:'');
  root.dataset.b387VerifiedClears=String(v.roundMilestones?.realClearedLives??0);
  root.dataset.b387CurrentLife=String(v.roundMilestones?.currentLifeClear??false);
  restart.hidden=!v.finished;
  finish.hidden=!v.finished;
  finish.style.display=v.finished?'flex':'none';
  if(v.finished)finalStats.textContent=
   'HUMAN   '+v.genuineHumanShots+' shots · '+
   v.realHumanImpactInkCells+' changed source cells\n'+
   'CPU 7   '+v.cpuPhysicallyRejoined+'/7 physically rejoined · '+
   v.actualCpuSourceShots+' source shots · '+
   v.actualCpuImpactInkCells+' changed source cells\n'+
   'SPLATS   HUMAN '+v.actualHumanSplats+' / CPU '+v.actualCpuSplats+
   ' · HUMAN RESPAWNS '+v.actualHumanRespawns+
   (v.bombRecap?'\nHUMAN SUB · '+v.bombRecap.actualHumanExplosions+
    ' native bursts · '+v.bombRecap.actualSourceBombStamps+
    ' source stamps · '+v.bombRecap.actualChangedSourceCells+
    ' changed original cells · '+v.bombRecap.actualZeroChangedStamps+
    ' unchanged stamps · NOT TURF SCORE · NOT CPU HITS':'')+
   (v.sourceShooter?'\n\nCURRENT LIFE ORIGINAL CIRCUIT: '+
    (v.sourceShooter.currentLifeLocalClear?
      'REAL DROP + RAMP + IMPACT-INK CLEAR':'NOT VERIFIED CLEAR')+
    '\nACTUAL REGISTERED RAMP: '+
    (v.sourceShooter.originalRampContact?'CONTACT OBSERVED':'NOT PROVEN')+
    ' · TRUE GROUNDED TRAVEL '+
    v.sourceShooter.physicalTravelMeters.toFixed(2)+'m'+
    '\nFRESH SOURCE HUMAN IMPACT INK '+
    v.sourceShooter.trueHumanImpactCells+' cells'+
    '\nGENUINE HUMAN→CPU HP HITS '+v.sourceShooter.actualHumanCpuDirectHits+
    ' · DIRECT SPLATS '+v.sourceShooter.actualHumanCpuDirectSplats+
    '\nCIRCUIT RESETS ON ACTUAL DEATH · NO OPPOSING ROUTE OR TURF SCORE':'')+
   (v.roundMilestones?'\n\nROUND VERIFIED CLEARS '+v.roundMilestones.realClearedLives+
    ' · LAST '+(v.roundMilestones.lastTrueWeapon??'NONE')+
    ' · '+v.roundMilestones.lastTruePostDropCells+' ACTUAL FRESH CELLS'+
    ' · REAL NATIVE SPLATS '+v.roundMilestones.realNativeDeathWitnesses+
    ' / VERIFIED RETURNS '+v.roundMilestones.real150TickReturns+
    ' · NO OFFICIAL WINNER':'');
  finish.dataset.t21B395BombExplosions=String(
   v.bombRecap?.actualHumanExplosions??'NOT_MEASURED');
  finish.dataset.t21B395BombStamps=String(
   v.bombRecap?.actualSourceBombStamps??'NOT_MEASURED');
  finish.dataset.t21B395BombCells=String(
   v.bombRecap?.actualChangedSourceCells??'NOT_MEASURED');
  finish.dataset.t21B395GameplayWrites='0';
  finish.dataset.t21B395Scoreable='0';
  finish.dataset.t21B395CpuHitCertified='false';
  finish.dataset.b387VerifiedClears=String(v.roundMilestones?.realClearedLives??0);
  finish.dataset.t21B59State=v.finished?'FINISHED':'HIDDEN';
  finish.dataset.t21B59OriginalWinner='NONE';
  finish.dataset.t21B59HumanInk=String(v.realHumanImpactInkCells);
  finish.dataset.b373RealSourceCircuit=
   v.sourceShooter?.currentLifeStatus??'UNSELECTED';
  finish.dataset.b373RealHumanCpuHits=
   String(v.sourceShooter?.actualHumanCpuDirectHits??-1);
  finish.dataset.b373NoScoring='true';
  finish.dataset.t21B59CpuRejoined=String(v.cpuPhysicallyRejoined);
  root.style.pointerEvents=v.finished?'auto':'none';
  root.dataset.t21B58State=v.state;
  root.dataset.t21B58HumanShotCount=String(v.genuineHumanShots);
  root.dataset.t21B58HumanChangedInk=String(v.realHumanImpactInkCells);
  root.dataset.t21B58CpuChangedInk=String(v.actualCpuImpactInkCells);
  root.dataset.t21B58CpuRejoined=String(v.cpuPhysicallyRejoined);
  root.dataset.t21B58OfficialWinner=v.officialWinner;
  root.dataset.t21B58OriginalScoreable='0';
  return v;
 };
 return {root,finish,render,setPaintTempo};
}
