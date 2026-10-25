/**
 * B181: genuine source-stage sight preference, not enemy hit certification.
 * Only actual native actor positions from the caller may become candidates.
 */
export interface B181SightPoint {readonly x:number;readonly y:number;readonly z:number}
export interface B181SightOpponent {readonly id:string;readonly body:B181SightPoint}
export function chooseB181OriginalSourceSight(
  origin:B181SightPoint,
  opponents:readonly B181SightOpponent[],
  originalStageRayBlocked:(from:B181SightPoint,to:B181SightPoint)=>boolean,
  preferActorId:string|null=null
):{actorId:string|null;target:B181SightPoint|null;rays:number;coverRejects:number}{
  const valid=(p:B181SightPoint)=>[p.x,p.y,p.z].every(Number.isFinite);
  if(!valid(origin))return {actorId:null,target:null,rays:0,coverRejects:0};
  let best:B181SightOpponent|null=null,bestSq=Infinity,rays=0,coverRejects=0;
  let preferred:B181SightOpponent|null=null;
  for(const enemy of opponents){
    if(!enemy.id||!valid(enemy.body))continue;
    const dx=enemy.body.x-origin.x,dz=enemy.body.z-origin.z;
    const ds=dx*dx+dz*dz;
    if(!Number.isFinite(ds)||ds<.04||ds>32*32)continue;
    if(Math.abs(enemy.body.y-origin.y)>2.4)continue;
    rays++;
    if(originalStageRayBlocked(origin,enemy.body)){coverRejects++;continue;}
    if(ds<bestSq){best=enemy;bestSq=ds;}
    if(enemy.id===preferActorId&&ds<=12*12)preferred=enemy;
  }
  const chosen=preferred??best;
  return {actorId:chosen?.id??null,target:chosen?.body??null,rays,coverRejects};
}
