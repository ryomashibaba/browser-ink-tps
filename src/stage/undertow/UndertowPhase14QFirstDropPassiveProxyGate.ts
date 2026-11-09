/** W10-B119: exclude ONLY the nonphysical 8th Recast human steering proxy
 * on the two exact source-registered first-drop landing slab polygons.
 * This is not Rapier/KCC or CPU physical contact certification. */
import type {StageSolidDefinition} from '../StageDefinition';
import {pointInStageFootprint} from '../StageFootprint';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
export type B119OriginalFoot=Readonly<{x:number;y:number;z:number}>;
export type B119OriginalLandingDecision={
 status:'WITHHOLD_PASSIVE_HUMAN_ON_ORIGINAL_FIRST_DROP'|'OUTSIDE_ORIGINAL_FIRST_DROP';
 withheld:boolean;
 originalSourceSolidId:string|null;
 sourceTopYMeters:number|null;
 originalAuthority:readonly [25,17,26,0];
 passiveEighthCrowdProxyOnly:true;
 physicalHumanPositionModified:false;
 sevenCpuPositionsModified:false;
 sourceNavmeshModified:false;
 humanCpuCollisionCertified:false;
 unrestricted4v4Certified:false;
};
const ORIGINAL_FIRST_DROP_SOLIDS=[
 'UndertowT21D:first-drop-landing-positive-z',
 'UndertowT21D:first-drop-landing-negative-z'
] as const;
/** Existing F3 conservative original source NavMesh snap distance. */
const ORIGINAL_SOURCE_HEIGHT_TOLERANCE_METERS=.22;
export function auditB119OriginalFirstDropLanding(
 foot:B119OriginalFoot,solids:readonly StageSolidDefinition[]
):B119OriginalLandingDecision{
 if(![foot.x,foot.y,foot.z].every(Number.isFinite))
  throw Error('T21_B119_NONFINITE_ORIGINAL_HUMAN_FOOT');
 if(solids!==frozen.solids||frozen.activationReady!==false||
    frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
    frozen.navigationLinks.length!==26)
  throw Error('T21_B119_ORIGINAL_STAGE_FROZEN_SOURCE_REQUIRED');
 const make=(solidId:string|null,top:number|null):B119OriginalLandingDecision=>({
  status:solidId?'WITHHOLD_PASSIVE_HUMAN_ON_ORIGINAL_FIRST_DROP':
   'OUTSIDE_ORIGINAL_FIRST_DROP',
  withheld:solidId!==null,originalSourceSolidId:solidId,
  sourceTopYMeters:top,originalAuthority:[25,17,26,0],
  passiveEighthCrowdProxyOnly:true,physicalHumanPositionModified:false,
  sevenCpuPositionsModified:false,sourceNavmeshModified:false,
  humanCpuCollisionCertified:false,unrestricted4v4Certified:false
 });
 for(const id of ORIGINAL_FIRST_DROP_SOLIDS){
  const solid=solids.find(s=>s.id===id);
  if(!solid?.footprint||solid.triangleMesh||solid.rotationEulerDegrees)
   throw Error('T21_B119_ORIGINAL_FIRST_DROP_SOLID_MISSING');
  const top=solid.center[1]+solid.size[1]/2;
  if(Math.abs(foot.y-top)>ORIGINAL_SOURCE_HEIGHT_TOLERANCE_METERS)continue;
  const u=foot.x-(solid.center[0]-solid.size[0]/2);
  const v=foot.z-(solid.center[2]-solid.size[2]/2);
  if(pointInStageFootprint(u,v,solid.footprint))return make(id,top);
 }
 return make(null,null);
}

// Original HIGH spawn source floor: an actual Windows first SAFE STOP at
// Rapier foot (4.777252,7.525098,+57.748447) recorded a 111.76m native
// intra-tick jump of ONLY the passive eighth HUMAN Crowd steering agent.
// Existing first-drop and registered uphill-ramp guards do not cover this
// frozen Y=7.5 region. Withhold ONLY that nonphysical proxy on the two
// original high-spawn polygon NEAR AN ORIGINAL BOUNDARY: never move HUMAN,
// CPU7, source NavMesh or weaken the strict 2m post-Crowd failure fence.
// Whole-spawn suppression changed the seven-CPU first-drop outcome in the
// existing 180-input regression. Source rim proximity, not a broad stage
// suppression, is the only bounded candidate justified by the real foot.
export type OriginalHighSpawnPassiveDecision=Readonly<{
 withheld:boolean;
 originalSourceSolidId:string|null;
 sourceTopYMeters:number|null;
 originalSourceEdgeDistanceMeters:number|null;
 sourceEdgeWithholdDistanceMeters:1.25;
 originalAuthority:readonly [25,17,26,0];
 passiveEighthCrowdProxyOnly:true;
 rapierHumanMoved:false;
 sevenCpuActorsModified:false;
 sourceNavmeshModified:false;
 productionAuthorized:false;
}>;
export function auditOriginalHighSpawnPassiveGuard(
 foot:B119OriginalFoot,solids:readonly StageSolidDefinition[]
):OriginalHighSpawnPassiveDecision{
 if(![foot.x,foot.y,foot.z].every(Number.isFinite))
  throw Error('T21_HIGH_SPAWN_NONFINITE_REAL_HUMAN_FOOT');
 if(solids!==frozen.solids||frozen.activationReady!==false||
    frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
    frozen.navigationLinks.length!==26)
  throw Error('T21_HIGH_SPAWN_FROZEN_SOURCE_REQUIRED');
 let id:string|null=null,top:number|null=null;
 let originalEdgeDistanceMeters:number|null=null;
 for(const sourceId of [
  'UndertowT21D:spawn-high-positive-z',
  'UndertowT21D:spawn-high-negative-z'
 ]){
  const solid=solids.find(s=>s.id===sourceId);
  if(!solid?.footprint||solid.triangleMesh||solid.rotationEulerDegrees)
   throw Error('T21_HIGH_SPAWN_ORIGINAL_FLAT_SOLID_MISSING');
  const y=solid.center[1]+solid.size[1]/2;
  if(Math.abs(foot.y-y)>.22)continue;
  const u=foot.x-(solid.center[0]-solid.size[0]/2);
  const v=foot.z-(solid.center[2]-solid.size[2]/2);
  if(pointInStageFootprint(u,v,solid.footprint)){
   // Only the audited source polygon boundaries are used: no invented
   // collision, new NavMesh, teleport, or unsafe 2m post-tick bypass.
   let distance=Number.POSITIVE_INFINITY;
   for(const ring of [solid.footprint.outer,...(solid.footprint.holes??[])]){
    for(let i=0;i<ring.length;i++){
     const [ax,az]=ring[i]!,[bx,bz]=ring[(i+1)%ring.length]!;
     const dx=bx-ax,dz=bz-az,lengthSquared=dx*dx+dz*dz;
     if(lengthSquared<=0)continue;
     const t=Math.max(0,Math.min(1,
      ((u-ax)*dx+(v-az)*dz)/lengthSquared));
     distance=Math.min(distance,Math.hypot(
      u-(ax+t*dx),v-(az+t*dz)));
    }
   }
   if(!Number.isFinite(distance))
    throw Error('T21_HIGH_SPAWN_ORIGINAL_BOUNDARY_NOT_MEASURABLE');
   originalEdgeDistanceMeters=distance;
   // At the actual 111.76m incident foot, original source nearest-edge
   // clearance is ~1.0m. The 1.25m observation band is a conservative
   // withhold-only rim, not a source-authority or collision promotion.
   if(distance<=1.25){id=sourceId;top=y;}
   break;
  }
 }
 return {
  withheld:id!==null,originalSourceSolidId:id,sourceTopYMeters:top,
  originalSourceEdgeDistanceMeters:originalEdgeDistanceMeters,
  sourceEdgeWithholdDistanceMeters:1.25,
  originalAuthority:[25,17,26,0],
  passiveEighthCrowdProxyOnly:true,rapierHumanMoved:false,
  sevenCpuActorsModified:false,sourceNavmeshModified:false,
  productionAuthorized:false
 };
}
