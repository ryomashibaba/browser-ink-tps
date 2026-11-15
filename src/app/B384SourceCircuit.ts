import {WEAPON_ORDER,DEFAULT_WEAPON_ID,type WeaponId}
 from '../weapons/WeaponCatalog';
/** B384: reboot the genuine B183/B186 native original SOURCE circuit.
 * Carry only an already selected, validated human kit when explicitly
 * ENTERING the circuit; never transfer game actors, paint, score or clock. */
export function b384SourceCircuitHref(
 href:string,enable:boolean,weaponId?:string
):string|null{
 const url=new URL(href);
 // Ordinary preview can launch the same genuine source-only world.
 if(!['http:','https:'].includes(url.protocol)||
    url.searchParams.get('t21Play')!=='preview'||
    (url.searchParams.has('t21QaDrive')&&
     url.searchParams.get('t21QaDrive')!=='source')||
    url.searchParams.get('t21QaInput')==='deterministic'||
  weaponId!==undefined&&!WEAPON_ORDER.includes(weaponId as WeaponId))return null;
 const next=new URL(url.pathname,url.origin);
 next.searchParams.set('t21Play','preview');
 next.searchParams.set('t21QaDrive','source');
 if(enable){
  next.searchParams.set('t21W10B112','humanGround');
  next.searchParams.set('t21W10B183','firstDropPlay');
  next.searchParams.set('t21W10B192','humanCombat');
  next.searchParams.set('t21W10B203','fullRound');
  next.searchParams.set('t21W10B384','loadoutCircuit');
  // Existing B389 strictly recognizes this canonical native circuit.
  if(weaponId&&weaponId!==DEFAULT_WEAPON_ID)
   next.searchParams.set('t21W10B389',weaponId);
 }
 return next.href;
}
export function b384SourceCircuitSelected(p:Pick<URLSearchParams,'get'>):boolean{
 return p.get('t21Play')==='preview'&&p.get('t21QaDrive')==='source'&&
  p.get('t21W10B112')==='humanGround'&&
  p.get('t21W10B183')==='firstDropPlay'&&
  p.get('t21W10B192')==='humanCombat'&&
  p.get('t21W10B203')==='fullRound'&&
  p.get('t21W10B384')==='loadoutCircuit'&&
  p.get('t21QaInput')!=='deterministic'&&p.get('t21W10B343')===null;
}
