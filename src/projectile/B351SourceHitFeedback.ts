/** B351: real CPU HP loss only; a ray overlap is not a hit. */
export function b351RealCpuDamageCue(
 enabled:boolean,source:'HUMAN'|'CPU',weaponId:string,
 before:number,after:number
):boolean {
 return enabled===true&&source==='HUMAN'&&
  weaponId==='pulse-sprayer'&&Number.isSafeInteger(before)&&
  before>=0&&Number.isSafeInteger(after)&&after===before+1;
}
