/**
 * B181: genuine source-stage sight preference, not enemy hit certification.
 * Only actual native actor positions from the caller may become candidates.
 */
export interface B181SightPoint {readonly x:number;readonly y:number;readonly z:number}
export interface B181SightOpponent {
 readonly id:string;
 readonly body:B181SightPoint;
 /** Optional REAL native projectile-hit-sphere centers belonging to this
  * same living actor. The caller alone must derive them from actual bodies.
  * Never author a new opponent or a stage collider from these points. */
 readonly alternateHitPoints?:readonly B181SightPoint[];
}
export function chooseB181OriginalSourceSight(
  origin:B181SightPoint,
  opponents:readonly B181SightOpponent[],
  originalStageRayBlocked:(from:B181SightPoint,to:B181SightPoint)=>boolean,
  preferActorId:string|null=null,
  maxNativeWeaponRangeMeters=32
):{actorId:string|null;target:B181SightPoint|null;rays:number;coverRejects:number}{
  const valid=(p:B181SightPoint)=>[p.x,p.y,p.z].every(Number.isFinite);
  if(!valid(origin))return {actorId:null,target:null,rays:0,coverRejects:0};
  // B383: only an actual weapon-reachable opponent can occupy the target
  // slot. This is NOT an extra hit, projectile or original-source route.
  // Old B181 (4-arg) callers keep the original 32m optical envelope.
  const reachable=Number.isFinite(maxNativeWeaponRangeMeters)?
   Math.min(32,Math.max(0,maxNativeWeaponRangeMeters)):0;
  let best:B181SightOpponent|null=null,bestPoint:B181SightPoint|null=null;
  let bestSq=Infinity,rays=0,coverRejects=0;
  let preferred:B181SightOpponent|null=null,preferredPoint:B181SightPoint|null=null;
  for(const enemy of opponents){
    if(!enemy.id||!valid(enemy.body))continue;
    const dx=enemy.body.x-origin.x,dz=enemy.body.z-origin.z;
    const ds=dx*dx+dz*dz;
    if(!Number.isFinite(ds)||ds<.04||ds>reachable*reachable)continue;
    if(Math.abs(enemy.body.y-origin.y)>2.4)continue;
    // Try the original actor center first. Only when registered source
    // cover blocks that line, consider a REAL exposed hit-sphere center.
    // Every candidate is rechecked against the same original Rapier ray.
    let visible:B181SightPoint|null=null;
    const samples=[enemy.body,...(enemy.alternateHitPoints??[])];
    for(const [index,point] of samples.entries()){
      if(!valid(point))continue;
      if(index>0&&(
        point.x!==enemy.body.x||point.z!==enemy.body.z||
        Math.abs(point.y-enemy.body.y)>.4
      ))continue;
      if(Math.abs(point.y-origin.y)>2.4)continue;
      rays++;
      if(originalStageRayBlocked(origin,point)){
        coverRejects++;
        continue;
      }
      visible=point;
      break;
    }
    if(!visible)continue;
    if(ds<bestSq){best=enemy;bestSq=ds;bestPoint=visible;}
    if(enemy.id===preferActorId&&ds<=12*12){
      preferred=enemy;preferredPoint=visible;
    }
  }
  const chosen=preferred??best;
  return {actorId:chosen?.id??null,
    target:preferred?preferredPoint:bestPoint,rays,coverRejects};
}

// B182: only reuse a recent sight line while BOTH true native bodies
// remain close to where the registered original-stage ray was checked.
// Any corpse, stale actor, camera-less synthetic point or significant
// movement forces a fresh original Rapier stage query instead of an aim.
export function b182ReuseNativeSight(
  cached:Readonly<{
    frame:number;actorId:string|null;
    origin:B181SightPoint;target:B181SightPoint|null
  }>,
  currentFrame:number,
  currentOrigin:B181SightPoint,
  currentOpponents:readonly B181SightOpponent[],
  maxNativeWeaponRangeMeters=32
):B181SightPoint|null{
  const valid=(p:B181SightPoint)=>[p.x,p.y,p.z].every(Number.isFinite);
  if(!Number.isSafeInteger(currentFrame)||currentFrame<cached.frame||
     currentFrame-cached.frame>=8||!cached.actorId||!cached.target||
     !valid(currentOrigin)||!valid(cached.origin)||
     !valid(cached.target))return null;
  const actor=currentOpponents.find(x=>x.id===cached.actorId);
  if(!actor||!valid(actor.body))return null;
  const d=(a:B181SightPoint,b:B181SightPoint)=>
    Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  // Stricter cache invalidation is not a relaxed physics boundary.
  const actualRange=Number.isFinite(maxNativeWeaponRangeMeters)?
   Math.min(32,Math.max(0,maxNativeWeaponRangeMeters)):0;
  if(d(cached.origin,currentOrigin)>.20||
     Math.abs(actor.body.y-currentOrigin.y)>2.4||
     Math.hypot(actor.body.x-currentOrigin.x,actor.body.z-currentOrigin.z)>actualRange)
    return null;
  // An optical cache may have selected an ACTUAL exposed upper/lower
  // native hit sphere. Reuse the matching, CURRENT hit-sphere point,
  // never silently snap to a different (possibly covered) body center.
  // The calling CPU must STILL reray from its real projectile muzzle.
  const livePoints=[actor.body,...(actor.alternateHitPoints??[])];
  const match=livePoints.find((point,index)=>
    valid(point)&&
    (index===0||(
      point.x===actor.body.x&&point.z===actor.body.z&&
      Math.abs(point.y-actor.body.y)<=.4
    ))&&d(cached.target!,point)<=.20&&
    Math.abs(point.y-currentOrigin.y)<=2.4
  );
  return match??null;
}
