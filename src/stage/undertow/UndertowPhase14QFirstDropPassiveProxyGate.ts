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
