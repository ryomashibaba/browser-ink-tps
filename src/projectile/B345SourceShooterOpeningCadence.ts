/** B345: Prevent idle -0.5s negative shooter cooldown from
 * producing a first-press burst in explicit frozen-source QA only. */
export function b345BoundOpeningCooldown(cooldown:number,dt:number):number{
 if(!Number.isFinite(cooldown)||!Number.isFinite(dt)||dt<=0||dt>.1)
  throw Error('B345_INVALID_NATIVE_STEP');
 return Math.max(-dt,cooldown);
}
