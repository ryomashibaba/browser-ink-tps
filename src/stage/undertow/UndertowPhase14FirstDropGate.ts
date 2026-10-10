/**
 * T21 Phase14A: FIRST real-gameplay acceptance slice.
 * This file is a validation contract only. It never creates stages, geometry,
 * collision, score authority, paint, nav links or release configuration.
 */
import {SurfaceFlags} from '../../ink/types';
import type {UndertowBlockoutGeometryPackage} from './UndertowSpillwayBlockoutGeometry';
import type {UndertowConnectivityProbe} from './UndertowSpillwayConnectivityQa';
export type UndertowPhase14Input=Omit<UndertowBlockoutGeometryPackage,'activationReady'> & {
  activationReady:boolean;
};
export interface Phase14CorridorSide{
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 probeId:string;
 sourceSpawnId:string;
 sourceLandingId:string;
 oneWayLinkId:string;
 sourcePaintBackingSolidIds:readonly string[];
 navExpectation:'MUST_REACH';
}
export interface Phase14FirstDropReadiness {
 phase:'14A';
 scope:'TWO_MIRRORED_FIRST_DROP_CORRIDORS_ONLY';
 readiness:'ISOLATED_RUNTIME_QA_CANDIDATE'|'BLOCKED';
 sourceGeometryModified:false;
 generatedSolids:0;
 generatedPaintSurfaces:0;
 generatedNavigationLinks:0;
 runtimeActivationAuthorized:false;
 humanCharacterMovementVerified:false;
 squidCharacterMovementVerified:false;
 collisionGroundingVerified:false;
 runtimePaintVerified:false;
 cpuTraversalVerified:false;
 turfScoreabilityVerified:false;
 fullStageConnectivityVerified:false;
 releaseAuthorized:false;
 blockers:readonly string[];
 existingGeometry:{solids:number;paintSurfaces:number;navigationLinks:number};
 existingPartialPathProbeCounts:{mustReach:number;diagnosticGap:number};
 sides:readonly Phase14CorridorSide[];
}
export const FIRST_DROP_SIDES=Object.freeze([
  {side:'POSITIVE_Z',slug:'positive-z'},
  {side:'NEGATIVE_Z',slug:'negative-z'}
] as const);
const REQUIRED_HELD_GAP_IDS=[
  'right-low-to-underpass-positive-z',
  'right-low-to-underpass-negative-z'
] as const;
const REQUIRED_RELEASE_BLOCKERS=[
  'FULL_STAGE_CONNECTIVITY_QA_PENDING',
  'UPPER_GLASS_COLLISION_AUTHORITY_PENDING',
  'UPPER_GLASS_CAMERA_QUERY_AUTHORITY_PENDING',
  'EXTERIOR_FALLOUT_KILL_THRESHOLD_PENDING',
  'TURF_SCOREABLE_MASK_PENDING'
] as const;
const vecEqual=(a:readonly number[],b:readonly number[]) =>
  a.length===3&&b.length===3&&a.every((x,i)=>Number.isFinite(x)&&x===b[i]);
export function auditPhase14FirstDrop(
 stage:UndertowPhase14Input,
 probes:readonly UndertowConnectivityProbe[]
):Phase14FirstDropReadiness{
 const blockers:string[]=[];
 const solidsById=new Map(stage.solids.map(s=>[s.id,s]));
 const surfacesByBacking=new Map<string,number>();
 for(const surface of stage.paintSurfaces)
  surfacesByBacking.set(surface.backingSolidId,(surfacesByBacking.get(surface.backingSolidId)||0)+1);
 const probesById=new Map(probes.map(p=>[p.id,p]));
 const linksById=new Map(stage.navigationLinks.map(l=>[l.id,l]));
 if(stage.activationReady)blockers.push('PHASE14_PREMATURE_STAGE_ACTIVATION');
 if(stage.solids.length!==25||stage.paintSurfaces.length!==17||stage.navigationLinks.length!==26)
  blockers.push('PHASE14_FROZEN_PARTIAL_PACKAGE_COUNT_DRIFT');
 if(solidsById.size!==stage.solids.length||linksById.size!==stage.navigationLinks.length||
    probesById.size!==probes.length)blockers.push('PHASE14_DUPLICATE_COMPONENT_OR_PROBE_ID');
 for(const flag of REQUIRED_RELEASE_BLOCKERS)
  if(!stage.activationBlockers.includes(flag))
    blockers.push('PHASE14_RELEASE_BLOCKER_REMOVED:'+flag);
 if(probes.length!==8||
    probes.filter(p=>p.expectation==='MUST_REACH').length!==6||
    probes.filter(p=>p.expectation==='DIAGNOSTIC_GAP').length!==2)
   blockers.push('PHASE14_PARTIAL_CONNECTIVITY_EXPECTATIONS_DRIFT');
 for(const id of REQUIRED_HELD_GAP_IDS)
   if(probesById.get(id)?.expectation!=='DIAGNOSTIC_GAP')
     blockers.push('PHASE14_UNRESOLVED_UNDERPASS_PROMOTION:'+id);
 const sides:Phase14CorridorSide[]=[];
 for(const {side,slug} of FIRST_DROP_SIDES){
   const sourceSpawnId='UndertowT21D:spawn-high-'+slug;
   const sourceLandingId='UndertowT21D:first-drop-landing-'+slug;
   const oneWayLinkId='first-drop-'+slug+'-3';
   const probeId='first-drop-'+slug;
   const probe=probesById.get(probeId),link=linksById.get(oneWayLinkId);
   for(const id of [sourceSpawnId,sourceLandingId]){
     const solid=solidsById.get(id);
     if(!solid||!solid.footprint||solid.triangleMesh||
        solid.collisionEnabled===false||solid.navigationEnabled===false)
       blockers.push('PHASE14_MISSING_AUDITED_GROUND_COMPONENT:'+id);
     const surfaces=stage.paintSurfaces.filter(s=>s.backingSolidId===id);
     if(surfaces.length!==1||
        (surfaces[0]!.flags & SurfaceFlags.Paintable)===0||
        (surfaces[0]!.flags & SurfaceFlags.Floor)===0||
        (surfaces[0]!.flags & SurfaceFlags.Scoreable)!==0)
       blockers.push('PHASE14_AUDITED_PAINT_BACKING_CHANGED:'+id);
   }
   if(!probe||probe.expectation!=='MUST_REACH'||!link||
      link.bidirectional!==false||!vecEqual(probe.from,link.start)||
      !vecEqual(probe.to,link.end)||
      link.start[1]!==7.5||link.end[1]!==3)
      blockers.push('PHASE14_FIRST_DROP_ONE_WAY_NAV_CHANGED:'+slug);
   sides.push({side,probeId,sourceSpawnId,sourceLandingId,oneWayLinkId,
    sourcePaintBackingSolidIds:[sourceSpawnId,sourceLandingId],
    navExpectation:'MUST_REACH'});
 }
 for(const surface of stage.paintSurfaces){
   if(!solidsById.has(surface.backingSolidId))
    blockers.push('PHASE14_ORPHANED_PAINT_SURFACE:'+surface.id);
   if((surface.flags & SurfaceFlags.Scoreable)!==0)
    blockers.push('PHASE14_UNAUTHORIZED_TURF_SCOREABILITY:'+surface.id);
 }
 return {
   phase:'14A',
   scope:'TWO_MIRRORED_FIRST_DROP_CORRIDORS_ONLY',
   readiness:blockers.length?'BLOCKED':'ISOLATED_RUNTIME_QA_CANDIDATE',
   sourceGeometryModified:false,
   generatedSolids:0,generatedPaintSurfaces:0,generatedNavigationLinks:0,
   runtimeActivationAuthorized:false,
   humanCharacterMovementVerified:false,
   squidCharacterMovementVerified:false,
   collisionGroundingVerified:false,
   runtimePaintVerified:false,
   cpuTraversalVerified:false,
   turfScoreabilityVerified:false,
   fullStageConnectivityVerified:false,
   releaseAuthorized:false,
   blockers,
   existingGeometry:{solids:stage.solids.length,paintSurfaces:stage.paintSurfaces.length,
      navigationLinks:stage.navigationLinks.length},
   existingPartialPathProbeCounts:{
      mustReach:probes.filter(p=>p.expectation==='MUST_REACH').length,
      diagnosticGap:probes.filter(p=>p.expectation==='DIAGNOSTIC_GAP').length
   },
   sides
 };
}
