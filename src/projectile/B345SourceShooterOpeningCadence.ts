/** B345: Bound idle negative weapon cooldown on the first real
 * SHOOTER/DUALIES press in opt-in frozen or canonical SOURCE play.
 * Preserve additive held-fire cadence and T20 without changing physics. */
export function b345BoundOpeningCooldown(cooldown:number,dt:number):number{
 if(!Number.isFinite(cooldown)||!Number.isFinite(dt)||dt<=0||dt>.1)
  throw Error('B345_INVALID_NATIVE_STEP');
 return Math.max(-dt,cooldown);
}
