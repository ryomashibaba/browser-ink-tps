/** B155 — real immutable original-source navigation gap evidence.
 * No candidate becomes a floor, link, scoreable region, actor order or
 * production route. One bounded scan when the original F3 preview boots.
 */
import {Vec3} from 'playcanvas';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition} from '../stage/StageDefinition';
import {SurfaceFlags} from '../ink/types';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,
 type UndertowConnectivityProbe}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';

type NativePathAudit=ReturnType<RecastStageNavigation['auditPath']>;
type OriginalRay=ReturnType<RapierStagePhysics['castStageSegment']>;
export interface B155RouteWitness{
 id:UndertowConnectivityProbe['id'];
 type:'MUST_REACH'|'DIAGNOSTIC_GAP';
 start:readonly [number,number,number];
 end:readonly [number,number,number];
 recastQuerySucceeded:boolean;
 recastEndpointReached:boolean;
 recastStartSnapMeters:number|null;
 recastEndSnapMeters:number|null;
 recastEndpointErrorMeters:number|null;
 recastPathPoints:number;
 /** Physical stage RAY hits only; not player KCC or confirmed traversal. */
 originalStageRayWitnesses:readonly {
  fraction:number;originalSolidId:string|null;
  verticalDifferenceMeters:number|null;
  apparentOriginalSupport:boolean;
 }[];
 likelyMissingFloorRaySamples:number;
 status:'RECAST_ENDPOINT_REACHED_ONLY'|'RECAST_ENDPOINT_NOT_REACHED'|
  'UNVERIFIED_SOURCE_GAP';
 physicallyCertified:false;
}

export interface B155SourceConnectivityReview{
 source:'REAL_RECAST_PATH_AND_REGISTERED_ORIGINAL_RAPIER_STAGE_RAYS';
 stage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE';
 originalNaturalOpponentRoutes:'0/12';
 routes:readonly B155RouteWitness[];
 heldDiagnosticGaps:number;
 mustReachRecastPaths:number;
 diagnosticOriginalRayMisses:number;
 actualPlayerKccTraversalCertified:false;
 modifiedStageGeometry:false;
 modifiedNavLinks:false;
 modifiedActorPositions:false;
 scoreablePromotions:0;
 activationReady:false;
 productionAuthorized:false;
 unrestricted4v4Certified:false;
}

const finiteOrNull=(n:number)=>Number.isFinite(n)?n:null;
export function buildB155OriginalSourceConnectivityReview(
 stage:StageDefinition,
 nav:Pick<RecastStageNavigation,'auditPath'>,
 rapier:Pick<RapierStagePhysics,'castStageSegment'>,
 probes:readonly UndertowConnectivityProbe[]=UNDERTOW_T21D_CONNECTIVITY_PROBES
):B155SourceConnectivityReview{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(p=>(p.flags&SurfaceFlags.Scoreable)!==0))
  throw Error('B155_ORIGINAL_SOURCE_AUTHORITY_REQUIRED');
 if(probes.length!==8||
    probes.filter(x=>x.expectation==='DIAGNOSTIC_GAP').length!==2||
    probes.filter(x=>x.expectation==='MUST_REACH').length!==6||
    new Set(probes.map(x=>x.id)).size!==8)
  throw Error('B155_ORIGINAL_SIX_REACH_TWO_HELD_PROBES_REQUIRED');

 const routes:B155RouteWitness[]=probes.map(probe=>{
  const a=new Vec3(...probe.from),b=new Vec3(...probe.to);
  const path:NativePathAudit=nav.auditPath(a,b);
  const evidence=[0,.25,.5,.75,1].map(fraction=>{
   const x=a.x+(b.x-a.x)*fraction;
   const y=a.y+(b.y-a.y)*fraction;
   const z=a.z+(b.z-a.z)*fraction;
   // Genuine frozen static stage-ray; by itself not a capsule ground test.
   const hit:OriginalRay=rapier.castStageSegment(
    new Vec3(x,y+1.2,z),new Vec3(x,y-1.2,z),'ink-projectile');
   const dy=hit?Math.abs(hit.point.y-y):null;
   return {
    fraction,originalSolidId:hit?.solidId??null,
    verticalDifferenceMeters:dy,
    apparentOriginalSupport:hit!==null&&dy!==null&&dy<=.35
   };
  });
  return {
   id:probe.id,type:probe.expectation,
   start:probe.from,end:probe.to,
   recastQuerySucceeded:path.querySuccess,
   recastEndpointReached:path.reachedTarget,
   recastStartSnapMeters:finiteOrNull(path.startSnapDistanceMeters),
   recastEndSnapMeters:finiteOrNull(path.endSnapDistanceMeters),
   recastEndpointErrorMeters:finiteOrNull(path.endpointErrorMeters),
   recastPathPoints:path.pointCount,
   originalStageRayWitnesses:evidence,
   likelyMissingFloorRaySamples:evidence.filter(v=>!v.apparentOriginalSupport).length,
   status:probe.expectation==='DIAGNOSTIC_GAP'
    ?'UNVERIFIED_SOURCE_GAP' as const:path.reachedTarget
    ?'RECAST_ENDPOINT_REACHED_ONLY' as const
    :'RECAST_ENDPOINT_NOT_REACHED' as const,
   physicallyCertified:false as const
  };
 });
 return {
  source:'REAL_RECAST_PATH_AND_REGISTERED_ORIGINAL_RAPIER_STAGE_RAYS',
  stage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalNaturalOpponentRoutes:'0/12',
  routes,
  heldDiagnosticGaps:routes.filter(x=>x.type==='DIAGNOSTIC_GAP').length,
  mustReachRecastPaths:routes.filter(
   x=>x.type==='MUST_REACH'&&x.recastEndpointReached).length,
  diagnosticOriginalRayMisses:routes.filter(
   x=>x.type==='DIAGNOSTIC_GAP').reduce(
    (sum,x)=>sum+x.likelyMissingFloorRaySamples,0),
  actualPlayerKccTraversalCertified:false,
  modifiedStageGeometry:false,modifiedNavLinks:false,
  modifiedActorPositions:false,scoreablePromotions:0,
  activationReady:false,productionAuthorized:false,
  unrestricted4v4Certified:false
 };
}
