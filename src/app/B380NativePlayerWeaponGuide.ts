import type {WeaponProfile} from '../weapons/WeaponCatalog';
/** The current REAL F3 human ProjectileSystem profile and Rapier dodge
 * counters, presented inside the existing clock/READY HUD. Does not
 * manipulate actual shots, target, special, physics or weapon authority.
 */
export function b380NativeWeaponGuidance(input:{
 readonly profile:Pick<WeaponProfile,'displayName'|'weaponClass'>;
 readonly hp:number;
 readonly actualDodgeCharges:number;
 readonly actualChargePercent:number;
 readonly currentMode:'HUMAN'|'SQUID';
 readonly canShoot:boolean;
 /** Actual native human ink; undefined only for older source monitors. */
 readonly actualInkRemaining?:number;
 /** Actual 60Hz Rapier-player/ownerGrid relation; no predicted floor. */
 readonly actualInkRelation?:'OWN'|'ENEMY'|'NEUTRAL'|'NONE';
 /** From PlayerResources.fixedUpdate, not a guessed ink award. */
 readonly actualInkRecoveryState?:string;
 readonly realSubEnabled:boolean;
 readonly realSubName?:string;
 /** Real SubWeaponProfile.inkCost; no inferred fixed or player-modified cost. */
 readonly realSubInkCost?:number;
 readonly sourceMatchState?:'STAGING'|'PLAYING'|'TIME_UP';
 /** Native 60Hz recovery counter, never a predicted or forced respawn. */
 readonly actualRespawnTicksRemaining?:number|null;
 readonly nativeStopped?:boolean;
}):string{
 const p=input.profile;
 // The displayed controls must never invite player action when the
 // actual native SOURCE match, HP or form makes weapon input unavailable.
 // This is purely read-only; no shot, clock, life or ink state is changed.
 const ticks=input.actualRespawnTicksRemaining;
 // Real tick countdown only: never fabricate HP loss or native respawn time.
 const nativeCountdown=typeof ticks==='number'&&Number.isInteger(ticks)&&
  ticks>=0&&ticks<=150?
   ' · '+ticks+' NATIVE TICKS ('+(ticks/60).toFixed(1)+'s)':'';
 // The existing native weapon line is the ONLY gameplay hint: no new HUD.
 // A squid gets the fast refill solely after genuine OWN ink membership AND
 // PlayerResources has reported SQUID_OWN at the current real native tick.
 const realInk=input.actualInkRemaining;
 const validInk=typeof realInk==='number'&&Number.isFinite(realInk)&&
  realInk>=0&&realInk<=100;
 const realSquid=input.currentMode==='SQUID'&&
  input.sourceMatchState==='PLAYING'&&validInk;
 const squidRefillHint=!realSquid?'':(
  input.actualInkRelation==='OWN'&&
  input.actualInkRecoveryState==='SQUID_OWN'?
   (realInk>=99.95?' · INK FULL':' · OWN PAINT · REFILLING'):
  input.actualInkRecoveryState==='LOCKED'?
   ' · RECOVERY LOCKED':
  input.actualInkRecoveryState==='NONE'&&
   ['ENEMY','NEUTRAL','NONE'].includes(input.actualInkRelation??'')?
    ' · NO OWN REFILL · FIND OWN PAINT':'');
 const blocked=input.nativeStopped?
  'SOURCE SAFE STOP · ACTIONS DISABLED':
  input.sourceMatchState==='TIME_UP'?
  'ROUND FINISHED · REPLAY A NEW SOURCE ROUND':
  !Number.isFinite(input.hp)?
  'HP UNAVAILABLE · NO FIRE CLAIM':
  input.hp<=0?
  'SPLATTED · WAIT FOR NATIVE RESPAWN'+nativeCountdown:
  input.currentMode==='SQUID'?
  'SQUID FORM · RELEASE SHIFT TO FIRE'+squidRefillHint:
  input.actualInkRemaining!==undefined&&
   (!Number.isFinite(input.actualInkRemaining)||input.actualInkRemaining<0)?
  'INK UNAVAILABLE · NO FIRE CLAIM':
  input.actualInkRemaining===0?
  'INK EMPTY · NATIVE INK RECOVERY REQUIRED':
  !input.canShoot?
  'NATIVE WEAPON RECOVERING · FIRE AND SUB DISABLED':null;
 if(blocked)return 'WEAPON '+p.displayName+' · '+blocked+' · PRACTICE';
 const finiteCharges=Number.isFinite(input.actualDodgeCharges)?
  Math.max(0,Math.min(2,Math.floor(input.actualDodgeCharges))):0;
 const finiteCharge=Number.isFinite(input.actualChargePercent)?
  Math.max(0,Math.min(100,Math.round(input.actualChargePercent))):0;
 let control='LMB FIRE';
 if(p.weaponClass==='DUALIES'){
  control='LMB FIRE · RMB DODGE '+finiteCharges+'/2';
 }else if(p.weaponClass==='BRELLA'){
  control='LMB FIRE · RMB GUARD';
 }else if(['CHARGER','SPLATLING','STRINGER','SPLATANA']
           .includes(p.weaponClass)){
  control='HOLD / RELEASE LMB · CHARGE '+finiteCharge+'%';
 }else if(p.weaponClass==='ROLLER'||p.weaponClass==='BRUSH'){
  control='LMB ROLL / SWIPE';
 }
 const subName=input.realSubName?' '+input.realSubName:'';
 const cost=input.realSubInkCost;
 const ink=input.actualInkRemaining;
 let subGuide='';
 if(input.realSubEnabled){
  if(cost!==undefined&&(!Number.isFinite(cost)||cost<=0)){
   subGuide=' · SUB COST UNVERIFIED';
  }else if(cost!==undefined&&ink===undefined){
   subGuide=' · SUB'+subName+' · INK UNKNOWN';
  }else if(cost!==undefined&&ink!==undefined&&ink+1e-6<cost){
   // Exact PlayerResources.tryConsumeSubInk epsilon; a positive amount
   // of ink is not evidence a real F throw can afford this weapon kit.
   subGuide=' · SUB'+subName+' · NEED '+cost+' INK';
  }else{
   subGuide=' · F SUB'+subName;
  }
 }
 return 'WEAPON '+p.displayName+' · '+control+subGuide+' · PRACTICE';
}
