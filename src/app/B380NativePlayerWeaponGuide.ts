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
 readonly realSubEnabled:boolean;
 readonly realSubName?:string;
 readonly sourceMatchState?:'STAGING'|'PLAYING'|'TIME_UP';
}):string{
 const p=input.profile;
 // The displayed controls must never invite player action when the
 // actual native SOURCE match, HP or form makes weapon input unavailable.
 // This is purely read-only; no shot, clock, life or ink state is changed.
 const blocked=input.sourceMatchState==='TIME_UP'?
  'ROUND FINISHED · REPLAY A NEW SOURCE ROUND':
  !Number.isFinite(input.hp)?
  'HP UNAVAILABLE · NO FIRE CLAIM':
  input.hp<=0?
  'SPLATTED · WAIT FOR NATIVE RESPAWN':
  input.currentMode==='SQUID'?
  'SQUID FORM · RELEASE SHIFT TO FIRE':null;
 if(blocked)return 'WEAPON '+p.displayName+' · '+blocked+' · PRACTICE';
 const finiteCharges=Number.isFinite(input.actualDodgeCharges)?
  Math.max(0,Math.min(2,Math.floor(input.actualDodgeCharges))):0;
 const finiteCharge=Number.isFinite(input.actualChargePercent)?
  Math.max(0,Math.min(100,Math.round(input.actualChargePercent))):0;
 let control='LMB FIRE';
 if(p.weaponClass==='DUALIES'){
  control=input.hp<=0?'SPLATTED':
   input.currentMode!=='HUMAN'?'HUMAN FORM TO DODGE':
   !input.canShoot?'DODGE RECOVERING':
   'RMB DODGE '+finiteCharges+'/2';
 }else if(p.weaponClass==='BRELLA'){
  control='LMB FIRE · RMB GUARD';
 }else if(['CHARGER','SPLATLING','STRINGER','SPLATANA']
           .includes(p.weaponClass)){
  control='HOLD / RELEASE LMB · CHARGE '+finiteCharge+'%';
 }else if(p.weaponClass==='ROLLER'||p.weaponClass==='BRUSH'){
  control='LMB ROLL / SWIPE';
 }
 return 'WEAPON '+p.displayName+' · '+control+
  (input.realSubEnabled?' · F SUB'+
   (input.realSubName?' '+input.realSubName:''):'')+' · PRACTICE';
}
