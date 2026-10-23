/**
 * W10-B123: spatially audit already registered and unchanged source
 * Temple01 lower landing → FloorConcrete03 uphill ramp → right-low slab.
 * Horizontal footprint coincidence is NOT a Rapier KCC locomotion proof.
 */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from '../stage/undertow/UndertowSpillwayRouteRampGeometry';
import {pointInStageFootprint} from '../stage/StageFootprint';
import type {StageSolidDefinition} from '../stage/StageDefinition';
const FIRST='UndertowT21D:first-drop-landing-positive-z';
const RAMP='UndertowT21D:right-low-route-ramp-positive-z';
const HIGH='UndertowT21D:right-low-team-a';
function insideSource(x:number,z:number,solid:StageSolidDefinition){
 if(!solid.footprint)throw Error('B123_ORIGINAL_STAGE_SOLID_NO_SOURCE_FOOTPRINT');
 return pointInStageFootprint(
  x-(solid.center[0]-solid.size[0]/2),
  z-(solid.center[2]-solid.size[2]/2),solid.footprint);
}
function nearSourceBoundary(x:number,z:number,solid:StageSolidDefinition){
 const fp=solid.footprint!;
 const u=x-(solid.center[0]-solid.size[0]/2);
 const v=z-(solid.center[2]-solid.size[2]/2);
 const edge=(ring:readonly (readonly [number,number])[])=>{
  let d=Infinity;
  for(let i=0;i<ring.length;i++){
   const a=ring[i]!,b=ring[(i+1)%ring.length]!;
   const dx=b[0]-a[0],dz=b[1]-a[1];
   const length=dx*dx+dz*dz;
   const t=length===0?0:Math.max(0,Math.min(1,
    ((u-a[0])*dx+(v-a[1])*dz)/length));
   d=Math.min(d,Math.hypot(u-a[0]-t*dx,v-a[1]-t*dz));
  }
  return d;
 };
 return Math.min(edge(fp.outer),...(fp.holes??[]).map(edge));
}
export function auditB123FrozenTemple01UphillSource(){
 const solids=frozen.solids;
 if(frozen.activationReady!==false||solids.length!==25||
    frozen.paintSurfaces.length!==17||
    frozen.navigationLinks.length!==26)
  throw Error('B123_FROZEN_ORIGINAL_SOURCE_AUTHORITY_INVALID');
 const first=solids.find(s=>s.id===FIRST);
 const next=solids.find(s=>s.id===HIGH);
 const ramp=solids.find(s=>s.id===RAMP);
 const record=UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(r=>
  r.id==='right-low-route-ramp-positive-z');
 if(!first?.footprint||!next?.footprint||
    !ramp?.triangleMesh||!record)
  throw Error('B123_REAL_REGISTERED_SOURCE_RAMP_MISSING');
 const v=record.mesh.vertices;
 const low=[v[2]!,v[3]!],high=[v[0]!,v[1]!];
 const lowerIn=low.map(p=>insideSource(p[0],p[2],first));
 const upperIn=high.map(p=>insideSource(p[0],p[2],next));
 const lowEdgeDistances=low.map(p=>nearSourceBoundary(p[0],p[2],first));
 const highEdgeDistances=high.map(p=>nearSourceBoundary(p[0],p[2],next));
 const originalLowerFloorY=first.center[1]+first.size[1]/2;
 const originalRaisedFloorY=next.center[1]+next.size[1]/2;
 const originalRampLowY=low.map(p=>p[1]);
 const originalRampHighY=high.map(p=>p[1]);
 const contactGeometryConsistent=
  lowerIn.every(Boolean)&&upperIn.every(Boolean)&&
  originalRampLowY.every(y=>y===originalLowerFloorY)&&
  originalRampHighY.every(y=>y===originalRaisedFloorY)&&
  lowEdgeDistances.every(d=>d>0&&d<.13)&&
  highEdgeDistances.every(d=>d>=0);
 return {
  schema:'W10_B123_REAL_REGISTERED_TEMPLE01_UPHILL_SOURCE_V1' as const,
  lowerFloorId:FIRST,rampId:RAMP,raisedFloorId:HIGH,
  sourceRampLowerEdge:low,sourceRampRaisedEdge:high,
  originalLowerFloorY,originalRaisedFloorY,
  originalVerticalRiseMeters:originalRaisedFloorY-originalLowerFloorY,
  rampLowEndpointsWithinLowerFloor:lowerIn,
  rampHighEndpointsWithinRaisedFloor:upperIn,
  rampLowerEndpointClearancesMeters:lowEdgeDistances,
  rampRaisedEndpointClearancesMeters:highEdgeDistances,
  contactGeometryConsistent,
  actualRapierHumanTraversalProven:false as const,
  cpuHumanInteractionCertified:false as const,
  sourceGeometryOrNavmeshModified:false as const,
  official4v4Certified:false as const,
  frozenOriginalAuthority:[25,17,26,0] as const
 };
}
