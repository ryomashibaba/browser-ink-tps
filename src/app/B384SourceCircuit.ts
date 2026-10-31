/** B384: restart a fresh native source world with B183/B186 60Hz
 * physical original circuit and the existing 12-weapon READY selector.
 * No authored floor/actor/scoring/clock permissions added. */
export function b384SourceCircuitHref(href:string,enable:boolean):string|null{
 const url=new URL(href);
 if(url.searchParams.get('t21Play')!=='preview'||
    url.searchParams.get('t21QaDrive')!=='source')return null;
 const next=new URL(url.pathname,url.origin);
 next.searchParams.set('t21Play','preview');
 next.searchParams.set('t21QaDrive','source');
 if(enable){
  next.searchParams.set('t21W10B112','humanGround');
  next.searchParams.set('t21W10B183','firstDropPlay');
  next.searchParams.set('t21W10B192','humanCombat');
  next.searchParams.set('t21W10B203','fullRound');
  next.searchParams.set('t21W10B384','loadoutCircuit');
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
