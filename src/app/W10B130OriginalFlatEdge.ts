/** B130: readonly exact registered original flat-source footprint. */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as original}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {pointInStageFootprint,type StageFootprintPoint}
 from '../stage/StageFootprint';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
function dist(u:number,v:number,ring:readonly StageFootprintPoint[]){
 if(ring.length<3)return Infinity;
 let result=Infinity;
 for(let i=0;i<ring.length;i++){
  const a=ring[i]!,b=ring[(i+1)%ring.length]!;
  const dx=b[0]-a[0],dz=b[1]-a[1],len=dx*dx+dz*dz;
  const t=len===0?0:Math.max(0,Math.min(1,
   ((u-a[0])*dx+(v-a[1])*dz)/len));
  result=Math.min(result,Math.hypot(u-a[0]-dx*t,v-a[1]-dz*t));
 }
 return result;
}
export function inspectB130OriginalFlatSource(args:{
 nativeTick:number;actualRapierBody:readonly [number,number,number];
 actualRapierSupportId:string|null;
}){
 const {nativeTick,actualRapierBody:body,actualRapierSupportId:id}=args;
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||body.length!==3||
    !body.every(Number.isFinite)||original.activationReady!==false||
    original.solids.length!==25||original.paintSurfaces.length!==17||
    original.navigationLinks.length!==26)
  throw Error('B130_FROZEN_NATIVE_SOURCE_AUTHORITY');
 if(!id)return null;
 const s=original.solids.find(v=>v.id===id);
 if(!s?.footprint||s.triangleMesh||s.rotationEulerDegrees||
    s.collisionEnabled===false||s.collisionBehavior==='GRATE')return null;
 const top=s.center[1]+s.size[1]/2;
 const foot=body[1]-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 const u=body[0]-(s.center[0]-s.size[0]/2);
 const v=body[2]-(s.center[2]-s.size[2]/2);
 return {
  schema:'W10_B130_ORIGINAL_SOURCE_FLAT_EDGE_V1' as const,
  nativeTick,actualNamedOriginalSolidId:s.id,
  insideRegisteredOriginalXZFootprint:pointInStageFootprint(u,v,s.footprint),
  originalFlatVerticalBandWithin22cm:Math.abs(foot-top)<=.22,
  distanceToOriginalPolygonBoundaryMeters:Math.min(
   dist(u,v,s.footprint.outer),
   ...(s.footprint.holes??[]).map(h=>dist(u,v,h))),
  originalAuthority:[25,17,26,0] as const,
  sourcePolygonIncludesHoles:true as const,
  polygonAloneDoesNotCertifyKcc:true as const,
  physicsModified:false as const,originalGeometryModified:false as const,
  naturalSourceConnectionCertified:false as const,
  originalScoreableSurfaces:0 as const,unrestricted4v4Certified:false as const
 };
}
export type B130FlatWitness=NonNullable<ReturnType<typeof inspectB130OriginalFlatSource>>;
