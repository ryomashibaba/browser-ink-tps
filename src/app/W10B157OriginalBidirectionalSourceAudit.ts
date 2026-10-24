/** W10-B157: physically inert opposite-direction Recast audit at the
 * source-registered right-low/underpass F4 gaps. Recast path equality or a
 * stage-ray hit is NEVER player KCC traversability or a new original floor.
 */
import {Vec3} from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {B155SourceConnectivityReview}
 from './W10B155OriginalSourceConnectivityReview';

export type B157GapDirectionDiagnosis=
 'BOTH_RECAST_DIRECTIONS_STOP_SHORT'|
 'REVERSE_ONLY_RECAST_REACHABLE_NOT_PHYSICAL'|
 'FORWARD_RECAST_REACHED_NOT_PHYSICAL'|
 'RECAST_DIRECTIONS_UNRESOLVED';

export interface B157SourceDirectionWitness {
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 forwardRecastEndpointReached:boolean;
 forwardNativeTerminal:readonly [number,number,number]|null;
 forwardTerminalRemainingGoalMeters:number|null;
 reverseRecastQuerySuccess:boolean;
 reverseRecastEndpointReached:boolean;
 reverseNativePathVertices:number;
 reverseNativeTerminal:readonly [number,number,number]|null;
 reverseEndpointErrorMeters:number|null;
 reverseTerminalRemainingStartMeters:number|null;
 forwardTerminalOriginalStageSolid:string|null;
 forwardTerminalOriginalStageRayVerticalDifferenceMeters:number|null;
 reverseTerminalOriginalStageSolid:string|null;
 reverseTerminalOriginalStageRayVerticalDifferenceMeters:number|null;
 routeDiagnosis:B157GapDirectionDiagnosis;
 physicalKccTraversalCertified:false;
 sourceObjGeometryRegisteredHereProven:false;
 sourceOffMeshNavLinkAuthorized:false;
}
export interface B157OriginalBidirectionalSourceAudit {
 source:'NATIVE_RECAST_BOTH_DIRECTIONS_AND_REGISTERED_STAGE_RAYS';
 originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE';
 originalCrossTeamRoutes:'0/12';
 sides:readonly B157SourceDirectionWitness[];
 actualRecastReverseQueries:2;
 productionAuthorized:false;
 addedStageSolids:0;
 addedNavigationLinks:0;
 sourceScoreablePromotions:0;
 originalFull4v4Certified:false;
 nextAction:'MATCH_RECAST_TERMINALS_TO_PRIVATE_ORIGINAL_FACES_AND_KCC';
}

type RecastPath=ReturnType<RecastStageNavigation['auditPath']>;
type PhysicalRay=ReturnType<RapierStagePhysics['castStageSegment']>;
const bounded=(v:number)=>Number.isFinite(v)&&v>=0?v:null;
const point=(p:{x:number;y:number;z:number} | undefined):
 readonly [number,number,number]|null=>
 p&&[p.x,p.y,p.z].every(Number.isFinite)?[p.x,p.y,p.z]:null;
const dist=(a:readonly number[]|null,b:readonly number[])=>a?
 Math.hypot(a[0]!-b[0]!,a[1]!-b[1]!,a[2]!-b[2]!):null;

export function auditB157OriginalBidirectionalGaps(
 stage:StageDefinition,
 nav:Pick<RecastStageNavigation,'auditPath'>,
 physics:Pick<RapierStagePhysics,'castStageSegment'>,
 b155:B155SourceConnectivityReview
):B157OriginalBidirectionalSourceAudit{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(s=>(s.flags&SurfaceFlags.Scoreable)!==0)||
    b155.stage!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    b155.originalNaturalOpponentRoutes!=='0/12'||
    b155.activationReady!==false||b155.productionAuthorized!==false||
    b155.unrestricted4v4Certified!==false||
    b155.actualPlayerKccTraversalCertified!==false||
    b155.modifiedStageGeometry!==false||b155.modifiedNavLinks!==false||
    b155.modifiedActorPositions!==false||b155.scoreablePromotions!==0)
  throw Error('B157_ORIGINAL_FROZEN_SOURCE_AUTHORITY_REQUIRED');
 const gaps=b155.routes.filter(x=>x.type==='DIAGNOSTIC_GAP');
 if(b155.routes.length!==8||gaps.length!==2||
    b155.heldDiagnosticGaps!==2||
    !gaps.some(x=>x.id==='right-low-to-underpass-positive-z')||
    !gaps.some(x=>x.id==='right-low-to-underpass-negative-z')||
    gaps.some(x=>x.status!=='UNVERIFIED_SOURCE_GAP'||
     x.physicallyCertified!==false))
  throw Error('B157_TWO_GENUINE_UNVERIFIED_ORIGINAL_GAPS_REQUIRED');
 const registeredStageRay=(terminal:readonly [number,number,number]|null)=>{
  if(!terminal)return {id:null,difference:null};
  // Cast only at native Recast path terminal, not at a guessed bridge.
  const [x,y,z]=terminal;
  const hit:PhysicalRay=physics.castStageSegment(
   new Vec3(x,y+1.2,z),new Vec3(x,y-1.2,z),'ink-projectile');
  return {id:hit?.solidId??null,
   difference:hit?bounded(Math.abs(hit.point.y-y)):null};
 };
 const sides:B157SourceDirectionWitness[]=gaps.map(g=>{
  const reverse:RecastPath=nav.auditPath(new Vec3(...g.end),
   new Vec3(...g.start));
  const reverseTerminal=point(
   reverse.nativePathPoints[reverse.nativePathPoints.length-1]);
  const forwardTerminal=g.recastPathTerminal;
  const fRay=registeredStageRay(forwardTerminal);
  const rRay=registeredStageRay(reverseTerminal);
  const code:B157GapDirectionDiagnosis=
   g.recastEndpointReached?'FORWARD_RECAST_REACHED_NOT_PHYSICAL':
   reverse.reachedTarget?'REVERSE_ONLY_RECAST_REACHABLE_NOT_PHYSICAL':
   g.recastQuerySucceeded&&reverse.querySuccess?
    'BOTH_RECAST_DIRECTIONS_STOP_SHORT':'RECAST_DIRECTIONS_UNRESOLVED';
  return {
   side:g.id.endsWith('positive-z')?'POSITIVE_Z':'NEGATIVE_Z',
   forwardRecastEndpointReached:g.recastEndpointReached,
   forwardNativeTerminal:forwardTerminal,
   forwardTerminalRemainingGoalMeters:
    g.recastPathTerminalToRequestedGoalMeters,
   reverseRecastQuerySuccess:reverse.querySuccess,
   reverseRecastEndpointReached:reverse.reachedTarget,
   reverseNativePathVertices:reverse.pointCount,
   reverseNativeTerminal:reverseTerminal,
   reverseEndpointErrorMeters:bounded(reverse.endpointErrorMeters),
   reverseTerminalRemainingStartMeters:dist(reverseTerminal,g.start),
   forwardTerminalOriginalStageSolid:fRay.id,
   forwardTerminalOriginalStageRayVerticalDifferenceMeters:fRay.difference,
   reverseTerminalOriginalStageSolid:rRay.id,
   reverseTerminalOriginalStageRayVerticalDifferenceMeters:rRay.difference,
   routeDiagnosis:code,
   physicalKccTraversalCertified:false,
   sourceObjGeometryRegisteredHereProven:false,
   sourceOffMeshNavLinkAuthorized:false
  };
 });
 return {
  source:'NATIVE_RECAST_BOTH_DIRECTIONS_AND_REGISTERED_STAGE_RAYS',
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalCrossTeamRoutes:'0/12',
  sides,actualRecastReverseQueries:2,productionAuthorized:false,
  addedStageSolids:0,addedNavigationLinks:0,sourceScoreablePromotions:0,
  originalFull4v4Certified:false,
  nextAction:'MATCH_RECAST_TERMINALS_TO_PRIVATE_ORIGINAL_FACES_AND_KCC'
 };
}
