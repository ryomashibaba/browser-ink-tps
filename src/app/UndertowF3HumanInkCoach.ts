/**
 * W10-B76 — practical HUMAN source-ink/low-ink feedback, not score.
 *
 * Source authority: native original 25/17/26/0, 7 original CPU feet not
 * prerequisite for a human KCC shot. Player accepted shots, Human Impact
 * paint ownership changes, and actual dry-fire are deliberately separate.
 * A projectile can paint later than its launch; NO per-shot hit-rate
 * inference is permitted.
 */
export interface B76HumanSourceFrame{
 tick?:number;
 matchState:string;
 paused:boolean;
 stopReason:string|null;
 player:{mode:string;ink:number};
 shotsFired:number;
 b23HumanInkFeedback?:{humanChangedCells:number};
 playerInkRecoveryState?:string;
 inkDryFireAttempts?:number;
 originalSourceSolids?:number;
 originalPaintSurfaces?:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;
 unrestricted4v4Certified?:boolean;
}
type B76Row={tick:number;acceptedShots:number;changedCells:number;dryAttempts:number};
export interface B76HumanSourceView{
 state:'REAL_SOURCE_PAINT'|'SHOT_WITHOUT_NEW_PAINT'|'LOW_INK'|
  'DRY_FIRE'|'REFILLING_ON_OWN_INK'|'NO_RECENT_INPUT'|
  'READY'|'SUSPENDED'|'HOLD';
 windowNativeTicks:180;
 actualObservedTick:number;
 humanAcceptedShots3s:number;
 actualHumanChangedCells3s:number;
 dryFireAttempts3s:number;
 actualHumanInkTotal:number;
 playerInkPercent:number;
 recoveryState:string;
 originalScoreableSurfaces:0;
 officialWinner:'NONE';
 inferredProjectileHitRate:false;
 original4v4Certified:false;
}
const count=(n:number)=>Number.isSafeInteger(n)&&n>=0;
export class B76HumanSourceCoach{
 private lastTick=-1;
 private lastShots=0;
 private lastCells=0;
 private lastDry=0;
 private rows:B76Row[]=[];
 observe(f:B76HumanSourceFrame):B76HumanSourceView|null{
  if(f.tick===undefined||f.b23HumanInkFeedback===undefined||
    f.playerInkRecoveryState===undefined||f.inkDryFireAttempts===undefined||
    f.originalSourceSolids===undefined||
    f.originalPaintSurfaces===undefined||
    f.originalSourceNavigationLinks===undefined||
    f.unrestricted4v4Certified===undefined)return null;
  const totalCells=f.b23HumanInkFeedback.humanChangedCells;
  if(f.originalSourceSolids!==25||f.originalPaintSurfaces!==17||
    f.originalSourceNavigationLinks!==26||
    f.sourceScoreablePromotions!==0||
    f.productionAuthorized!==false||
    f.unrestricted4v4Certified!==false||
    ![f.tick,f.shotsFired,totalCells,f.inkDryFireAttempts].every(count)||
    !Number.isFinite(f.player.ink)||f.player.ink<0||
    f.player.ink>100.001||
    !['HUMAN','SQUID'].includes(f.player.mode)||
    !['READY','LOCKED','NONE','HUMAN','SQUID_OWN'].includes(
     f.playerInkRecoveryState)||
    (this.lastTick>=0&&(f.tick<this.lastTick||
      f.shotsFired<this.lastShots||totalCells<this.lastCells||
      f.inkDryFireAttempts<this.lastDry))){
   this.lastTick=-1;this.rows=[];return {
    state:'HOLD',windowNativeTicks:180,actualObservedTick:count(f.tick)?f.tick:0,
    humanAcceptedShots3s:0,actualHumanChangedCells3s:0,
    dryFireAttempts3s:0,actualHumanInkTotal:0,
    playerInkPercent:0,recoveryState:'UNVERIFIED',
    originalScoreableSurfaces:0,officialWinner:'NONE',
    inferredProjectileHitRate:false,original4v4Certified:false};
  }
  if(this.lastTick===-1){
   this.lastTick=f.tick;this.lastShots=f.shotsFired;
   this.lastCells=totalCells;this.lastDry=f.inkDryFireAttempts;
  }else{
   const shotDelta=f.shotsFired-this.lastShots;
   const cellDelta=totalCells-this.lastCells;
   const dryDelta=f.inkDryFireAttempts-this.lastDry;
   if(shotDelta||cellDelta||dryDelta){
    const last=this.rows.at(-1);
    if(last?.tick===f.tick){
     last.acceptedShots+=shotDelta;
     last.changedCells+=cellDelta;
     last.dryAttempts+=dryDelta;
    }else this.rows.push({tick:f.tick,acceptedShots:shotDelta,
     changedCells:cellDelta,dryAttempts:dryDelta});
   }
   this.lastTick=f.tick;this.lastShots=f.shotsFired;
   this.lastCells=totalCells;this.lastDry=f.inkDryFireAttempts;
  }
  while(this.rows.length&&this.rows[0]!.tick<=f.tick-180)
   this.rows.shift();
  let shots=0,cells=0,dry=0;
  for(const x of this.rows){
   shots+=x.acceptedShots;cells+=x.changedCells;dry+=x.dryAttempts;
  }
  const pct=Math.round(f.player.ink);
  let state:B76HumanSourceView['state'];
  if(f.stopReason||f.matchState==='TIME_UP'||f.paused)state='SUSPENDED';
  else if(f.matchState==='STAGING')state='READY';
  else if(dry>0&&pct<35)state='DRY_FIRE';
  else if(pct<28&&f.playerInkRecoveryState==='SQUID_OWN')
   state='REFILLING_ON_OWN_INK';
  else if(pct<28)state='LOW_INK';
  else if(cells>0)state='REAL_SOURCE_PAINT';
  else if(shots>0)state='SHOT_WITHOUT_NEW_PAINT';
  else state='NO_RECENT_INPUT';
  return {
   state,windowNativeTicks:180,actualObservedTick:f.tick,
   humanAcceptedShots3s:shots,actualHumanChangedCells3s:cells,
   dryFireAttempts3s:dry,actualHumanInkTotal:totalCells,
   playerInkPercent:pct,recoveryState:f.playerInkRecoveryState,
   originalScoreableSurfaces:0,officialWinner:'NONE',
   inferredProjectileHitRate:false,original4v4Certified:false
  };
 }
}
