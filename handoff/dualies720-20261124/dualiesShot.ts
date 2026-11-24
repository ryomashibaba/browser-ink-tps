/** Pure F4 candidate. The live weapon/KCC owns phase, aim, ink and collision. */
export type Side = 'LEFT' | 'RIGHT';
export type Phase = 'NORMAL' | 'ROLL_LOCK' | 'FOCUSED';
export type Shot = Readonly<{side:Side; focused:boolean; cadenceF:5|4; inkPercent:0.72; spreadDeg:number; nearestSplash:boolean; nextSide:Side; nextAcceptedOrdinal:number}>;
/** ordinal = number of already accepted shots in this actor's current weapon session.
 * First-shot nearest splash phase is provisional; the seven-shot period is the reference.
 * A plan is NOT a shot; update nextSide/ordinal only after one real projectile is allocated and paid.
 */
export function planDualiesShot(phase:Phase, grounded:boolean, nextSide:Side, ordinal:number, nearestPhase=1):Shot|null {
  if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>=Number.MAX_SAFE_INTEGER||!Number.isInteger(nearestPhase)||nearestPhase<1||nearestPhase>7)throw new RangeError('invalid shot phase');
  if(phase==='ROLL_LOCK')return null;
  if(phase!=='NORMAL'&&phase!=='FOCUSED')throw new RangeError('unknown phase');
  if(nextSide!=='LEFT'&&nextSide!=='RIGHT')throw new RangeError('unknown side');
  const focused=phase==='FOCUSED';
  return {side:nextSide,focused,cadenceF:focused?4:5,inkPercent:.72,spreadDeg:focused?0:grounded?2:7.5,nearestSplash:ordinal%7===nearestPhase-1,nextSide:nextSide==='LEFT'?'RIGHT':'LEFT',nextAcceptedOrdinal:ordinal+1};
}
/** 720 reference candidate: age of physical projectile, not distance or cadence. */
export function dualiesDamage(ageF:number,maxDamage=30,minDamage=15):number {
  if(![ageF,maxDamage,minDamage].every(Number.isFinite)||ageF<0||minDamage<0||maxDamage<minDamage)throw new RangeError('invalid damage input');
  const t=Math.max(0,Math.min(1,(ageF-7)/8));
  return maxDamage+(minDamage-maxDamage)*t;
}
