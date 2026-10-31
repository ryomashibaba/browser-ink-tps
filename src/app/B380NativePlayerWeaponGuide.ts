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
}):string{
 const p=input.profile;
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
