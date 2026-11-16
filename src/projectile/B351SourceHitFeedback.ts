import {WEAPON_ORDER} from '../weapons/WeaponCatalog';
/** B351: real CPU HP loss only; a ray overlap is not a hit. */
export function b351RealCpuDamageCue(
 enabled:boolean,source:'HUMAN'|'CPU',weaponId:string,
 before:number,after:number,selectedCanonicalSource=false
):boolean {
 // The historical B351 cue is pulse-only. The already-authorized
 // canonical 25/17/26/0 SOURCE selected-kit session can use ALL twelve
 // real weapons. A genuine HP-loss counter increment is mandatory.
 return (enabled===true||selectedCanonicalSource===true)&&source==='HUMAN'&&
  (weaponId==='pulse-sprayer'||selectedCanonicalSource===true&&
   WEAPON_ORDER.some(id=>id===weaponId))&&Number.isSafeInteger(before)&&
  before>=0&&Number.isSafeInteger(after)&&after===before+1;
}
