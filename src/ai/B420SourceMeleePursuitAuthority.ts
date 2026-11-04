/**
 * B420 real-source CPU movement authority.
 * On the frozen Undertow original SOURCE, actual Crowd/Recast goals
 * must pass UndertowF3SourceTraffic.chooseSourceGoal and its full
 * Rapier/Recast original-floor support checks. A nearby target alone is
 * NOT sufficient reason to requestMoveTarget(closestPoint(enemy)).
 *
 * Keep the untouched legacy T20 tactical melee ranges when the SOURCE
 * authority is absent. This method never moves/teleports an actor.
 */
export type B420MeleeClass='ROLLER'|'BRUSH'|'SPLATANA';
export function b420MayLegacyMeleeChase(
 weaponClass:B420MeleeClass,
 originalSourceGoalAuthorityPresent:boolean,
 actualHorizontalDistanceMeters:number
):boolean{
 if(originalSourceGoalAuthorityPresent||
  !Number.isFinite(actualHorizontalDistanceMeters)||
  actualHorizontalDistanceMeters<0)return false;
 if(weaponClass==='ROLLER')return actualHorizontalDistanceMeters<=6;
 if(weaponClass==='BRUSH')
  return actualHorizontalDistanceMeters>1.15&&
   actualHorizontalDistanceMeters<=6;
 if(weaponClass==='SPLATANA')
  return actualHorizontalDistanceMeters>1.05&&
   actualHorizontalDistanceMeters<=5.2;
 return false;
}
