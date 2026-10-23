/**
 * W10-B124: original-source footprint witness for actual native player
 * above the already registered raised right-low-team-a source slab.
 * Polygonal membership never proves Rapier collision or an onward route.
 */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as original}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
const RAISED='UndertowT21D:right-low-team-a';
export type B124RaisedSourceWitness={
 schema:'W10_B124_ACTUAL_REGISTERED_RAISED_SOURCE_BOUNDARY_V1';
 nativeTick:number;
 realRapierBody:readonly [number,number,number];
 realHumanFootYMeters:number;
 actualNamedOriginalSolidId:typeof RAISED;
 originalRaisedSlabTopYMeters:4.5;
 realFootXZInsideOriginalSlab:boolean;
 distanceToOriginalSourcePolygonBoundaryMeters:number;
 realHumanFootHeightResidualMeters:number;
 originalRaisedSourceVerticalBandWithin22cm:boolean;
 sourcePolygonIncludesHoles:true;
 actualOriginalKccGroundingMustBeVerifiedSeparately:true;
 generatedSourceFloor:false;
 realHumanOrSevenCpuMovedByProbe:false;
 sourceNavmeshModified:false;
 nextFloorOr4v4Certified:false;
 originalAuthority:readonly [25,17,26,0];
};
function edgeMeters(u:number,v:number,p:readonly (readonly [number,number])[]){
 if(p.length<3)throw Error('T21_B124_FROZEN_POLYGON_INVALID');
 let min=Infinity;
 for(let i=0;i<p.length;i++){
  const a=p[i]!,b=p[(i+1)%p.length]!;
  const dx=b[0]-a[0],dz=b[1]-a[1],len=dx*dx+dz*dz;
  const t=len<=0?0:Math.max(0,Math.min(1,
   ((u-a[0])*dx+(v-a[1])*dz)/len));
  min=Math.min(min,Math.hypot(u-a[0]-dx*t,v-a[1]-dz*t));
 }
 return min;
}
export function inspectB124ActualRaisedSourceBoundary(args:{
 nativeTick:number;
 actualRapierBody:readonly [number,number,number];
}):B124RaisedSourceWitness{
 const {nativeTick,actualRapierBody:body}=args;
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||
    body.length!==3||!body.every(Number.isFinite)||
    original.activationReady!==false||
    original.solids.length!==25||
    original.paintSurfaces.length!==17||
    original.navigationLinks.length!==26)
  throw Error('T21_B124_FROZEN_NATIVE_SOURCE_AUTHORITY_INVALID');
 const solid=original.solids.find(s=>s.id===RAISED);
 if(!solid?.footprint||solid.triangleMesh||solid.rotationEulerDegrees)
  throw Error('T21_B124_NAMED_ORIGINAL_RAISED_FLOOR_MISSING');
 const top=solid.center[1]+solid.size[1]/2;
 if(top!==4.5)throw Error('T21_B124_ORIGINAL_RAISED_FLOOR_HEIGHT_DRIFT');
 const u=body[0]-(solid.center[0]-solid.size[0]/2);
 const v=body[2]-(solid.center[2]-solid.size[2]/2);
 const f=solid.footprint;
 const inside=pointInStageFootprint(u,v,f);
 const distance=Math.min(edgeMeters(u,v,f.outer),
  ...(f.holes??[]).map(h=>edgeMeters(u,v,h)));
 const foot=body[1]-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 return {
  schema:'W10_B124_ACTUAL_REGISTERED_RAISED_SOURCE_BOUNDARY_V1',
  nativeTick,realRapierBody:[...body],
  realHumanFootYMeters:foot,
  actualNamedOriginalSolidId:RAISED,
  originalRaisedSlabTopYMeters:4.5,
  realFootXZInsideOriginalSlab:inside,
  distanceToOriginalSourcePolygonBoundaryMeters:distance,
  realHumanFootHeightResidualMeters:foot-top,
  originalRaisedSourceVerticalBandWithin22cm:
   Math.abs(foot-top)<=.22,
  sourcePolygonIncludesHoles:true,
  actualOriginalKccGroundingMustBeVerifiedSeparately:true,
  generatedSourceFloor:false,realHumanOrSevenCpuMovedByProbe:false,
  sourceNavmeshModified:false,nextFloorOr4v4Certified:false,
  originalAuthority:[25,17,26,0]
 };
}
