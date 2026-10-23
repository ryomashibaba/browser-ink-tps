/**
 * W10-B120: classify only actual source-registered first-drop slab polygon
 * crossings. Read-only genuine Rapier KCC position; a point outside one
 * registered floor is NOT proof of a hole, safety or another valid route.
 */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as original}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {pointInStageFootprint} from '../stage/StageFootprint';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
export type B120OriginalBoundaryWitness={
 schema:'W10_B120_REAL_ORIGINAL_FIRST_DROP_POLYGON_WITNESS_V1';
 nativeTick:number;
 actualRapierBody:[number,number,number];
 actualPhysicalHumanFootY:number;
 originalSourceSolidId:string;
 originalSlabTopMeters:number;
 originalFootInsideXZ:boolean;
 actualHorizontalDistanceToOriginalPolygonEdgeMeters:number;
 originalFloorHorizontalStatus:
  'ACTUAL_FOOT_INSIDE_EXISTING_FIRST_DROP'|
  'ACTUAL_FOOT_OUTSIDE_EXISTING_FIRST_DROP';
 actualFootVerticalToSourceTopMeters:number;
 originalStageGeometryModified:false;
 corridorOrOtherFloorInferred:false;
 missingFloorProven:false;
 originalHumanKccMovedByObservation:false;
 formal4v4Certified:false;
 originalSourceAuthority:readonly [25,17,26,0];
};
function edgeDistance(u:number,v:number,ring:readonly (readonly [number,number])[]){
 let d=Infinity;
 for(let i=0;i<ring.length;i++){
  const a=ring[i]!,b=ring[(i+1)%ring.length]!;
  const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
  const t=len>0?Math.max(0,Math.min(1,
   ((u-a[0])*dx+(v-a[1])*dy)/len)):0;
  d=Math.min(d,Math.hypot(u-a[0]-dx*t,v-a[1]-dy*t));
 }
 return d;
}
export function inspectB120OriginalFirstDropBoundary(args:{
 nativeTick:number;
 actualRapierBody:readonly [number,number,number];
 side:'positive-z'|'negative-z';
}):B120OriginalBoundaryWitness{
 const {nativeTick,actualRapierBody:body,side}=args;
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||
    !body.every(Number.isFinite)||original.activationReady!==false||
    original.solids.length!==25||original.paintSurfaces.length!==17||
    original.navigationLinks.length!==26)
  throw Error('T21_B120_ORIGINAL_NATIVE_SOURCE_AUTHORITY_INVALID');
 const id='UndertowT21D:first-drop-landing-'+side;
 const solid=original.solids.find(s=>s.id===id);
 if(!solid?.footprint||solid.triangleMesh||solid.rotationEulerDegrees)
  throw Error('T21_B120_REGISTERED_ORIGINAL_FIRST_DROP_NOT_FOUND');
 const u=body[0]-(solid.center[0]-solid.size[0]/2);
 const v=body[2]-(solid.center[2]-solid.size[2]/2);
 const fp=solid.footprint;
 const inside=pointInStageFootprint(u,v,fp);
 const edge=Math.min(edgeDistance(u,v,fp.outer),
  ...(fp.holes??[]).map(h=>edgeDistance(u,v,h)));
 const top=solid.center[1]+solid.size[1]/2;
 const footY=body[1]-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
 return {
  schema:'W10_B120_REAL_ORIGINAL_FIRST_DROP_POLYGON_WITNESS_V1',
  nativeTick,actualRapierBody:[...body],
  actualPhysicalHumanFootY:footY,originalSourceSolidId:id,
  originalSlabTopMeters:top,originalFootInsideXZ:inside,
  actualHorizontalDistanceToOriginalPolygonEdgeMeters:edge,
  originalFloorHorizontalStatus:inside?
   'ACTUAL_FOOT_INSIDE_EXISTING_FIRST_DROP':
   'ACTUAL_FOOT_OUTSIDE_EXISTING_FIRST_DROP',
  actualFootVerticalToSourceTopMeters:Number((footY-top).toFixed(6)),
  originalStageGeometryModified:false,
  corridorOrOtherFloorInferred:false,missingFloorProven:false,
  originalHumanKccMovedByObservation:false,formal4v4Certified:false,
  originalSourceAuthority:[25,17,26,0]
 };
}
