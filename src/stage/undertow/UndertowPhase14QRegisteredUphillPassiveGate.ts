/**
 * W10-B123: prevent original native Recast Crowd's EIGHTH passive HUMAN
 * steering proxy on exact audited uphill ramp mesh triangles only.
 * Real Rapier KCC, real seven CPU and original floor/NavMesh are UNCHANGED.
 * No corridor/physics contact or official 4v4 is certified.
 */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from './UndertowSpillwayRouteRampGeometry';
export type RampFoot=Readonly<{x:number;y:number;z:number}>;
export type B123NativePassiveRampGate={
 schema:'W10_B123_ORIGINAL_UPHILL_RAMP_PASSIVE_AGENT_GUARD_V1';
 sourceId:'UndertowT21D:right-low-route-ramp-positive-z'|
  'UndertowT21D:right-low-route-ramp-negative-z'|null;
 withheld:boolean;
 actualPhysicalFoot:RampFoot;
 exactOriginalRampInterpolatedYMeters:number|null;
 actualVerticalSourceResidualMeters:number|null;
 originalRampMeshTriangleIndex:0|1|null;
 originalOnly:true;
 physicalRapierHumanChanged:false;
 sevenCpuActorPositionsChanged:false;
 sourceNavmeshChanged:false;
 realHumanCpuAvoidanceCertified:false;
 official4v4Certified:false;
 frozenSourceAuthority:readonly [25,17,26,0];
};
const ABS_VERTICAL_SOURCE_PROXIMITY_METERS=.22;
/** Returns interpolated native original Mesh Y, or null OUTSIDE triangles. */
function nativeTriangleSurfaceAtFoot(p:RampFoot,
 a:Readonly<[number,number,number]>,
 b:Readonly<[number,number,number]>,
 c:Readonly<[number,number,number]>):number|null{
 const denom=(b[2]-c[2])*(a[0]-c[0])+
  (c[0]-b[0])*(a[2]-c[2]);
 if(!Number.isFinite(denom)||Math.abs(denom)<1e-9)
  throw Error('T21_B123_FROZEN_SOURCE_UPHILL_TRIANGLE_DEGENERATE');
 const u=((b[2]-c[2])*(p.x-c[0])+
  (c[0]-b[0])*(p.z-c[2]))/denom;
 const v=((c[2]-a[2])*(p.x-c[0])+
  (a[0]-c[0])*(p.z-c[2]))/denom;
 const w=1-u-v;
 if(u<0||v<0||w<0)return null;
 return u*a[1]+v*b[1]+w*c[1];
}
export function auditB123RegisteredOriginalUphillPassiveGuard(
 foot:RampFoot):B123NativePassiveRampGate{
 if(![foot.x,foot.y,foot.z].every(Number.isFinite))
  throw Error('T21_B123_NONFINITE_REAL_RAPIER_FOOT');
 if(frozen.activationReady!==false||frozen.solids.length!==25||
    frozen.paintSurfaces.length!==17||
    frozen.navigationLinks.length!==26)
  throw Error('T21_B123_ORIGINAL_SOURCE_STAGE_AUTHORITY_INVALID');
 const result=(sourceId:B123NativePassiveRampGate['sourceId'],
  height:number|null,triangle:0|1|null):B123NativePassiveRampGate=>({
  schema:'W10_B123_ORIGINAL_UPHILL_RAMP_PASSIVE_AGENT_GUARD_V1',
  sourceId,withheld:sourceId!==null,
  actualPhysicalFoot:{...foot},
  exactOriginalRampInterpolatedYMeters:height,
  actualVerticalSourceResidualMeters:
   height===null?null:Math.abs(foot.y-height),
  originalRampMeshTriangleIndex:triangle,originalOnly:true,
  physicalRapierHumanChanged:false,sevenCpuActorPositionsChanged:false,
  sourceNavmeshChanged:false,realHumanCpuAvoidanceCertified:false,
  official4v4Certified:false,frozenSourceAuthority:[25,17,26,0]
 });
 for(const ramp of UNDERTOW_RIGHT_LOW_ROUTE_RAMPS){
  const id=('UndertowT21D:'+ramp.id) as
   NonNullable<B123NativePassiveRampGate['sourceId']>;
  const originalSolid=frozen.solids.find(s=>s.id===id);
  if(originalSolid?.triangleMesh!==ramp.mesh)
   throw Error('T21_B123_MISSING_REGISTERED_ORIGINAL_UPHILL_SOURCE');
  for(let ti=0;ti<ramp.mesh.indices.length;ti+=3){
   const a=ramp.mesh.vertices[ramp.mesh.indices[ti]!]!;
   const b=ramp.mesh.vertices[ramp.mesh.indices[ti+1]!]!;
   const c=ramp.mesh.vertices[ramp.mesh.indices[ti+2]!]!;
   const y=nativeTriangleSurfaceAtFoot(foot,a,b,c);
   if(y!==null&&Math.abs(foot.y-y)<=ABS_VERTICAL_SOURCE_PROXIMITY_METERS)
    return result(id,y,ti===0?0:1);
  }
 }
 return result(null,null,null);
}
