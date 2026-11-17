import {Vec3} from 'playcanvas';
import type {StageDefinition,StageVector3} from '../StageDefinition';
import type {RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';

export interface SourceSpawnPlan{
 readonly originalHighSolids:readonly [string,string];
 readonly teamASlots:readonly StageVector3[];
 readonly teamBSlots:readonly StageVector3[];
 readonly minimumClearanceMeters:number;
 readonly originalSolidsPreserved:true;
 readonly originalNavLinksPreserved:true;
 readonly qaOnly:true;
 readonly releaseAuthorized:false;
}
const MIN_ACTOR_SEPARATION=.70;
const FOOT_RADIUS=.285;
const SOURCE_NATIVE_SNAP_LIMIT_METERS=.16;
const SOURCE_HIGH_LEVEL_TOLERANCE_METERS=.11;
const HUMAN_SUPPORT_Y_TOLERANCE_METERS=.08;
// HUMAN capsule-radius perimeter on the actual frozen SOURCE footprint.
const HUMAN_FOOT_RING_OFFSETS: readonly (readonly [number,number])[] = [
 [0,0],
 ...Array.from({length:16},(_,i) => {
  const a=2*Math.PI*i/16;
  return [Math.cos(a)*FOOT_RADIUS,Math.sin(a)*FOOT_RADIUS] as const;
 })
];
const OBSERVATION_OFFSETS:readonly (readonly [number,number])[]=[
 [0,0],[.82,0],[-.82,0],[0,.82],[0,-.82],
 [.82,.82],[.82,-.82],[-.82,.82],[-.82,-.82],
 [1.64,0],[-1.64,0],[0,1.64],[0,-1.64],
 [1.64,.82],[1.64,-.82],[-1.64,.82],[-1.64,-.82],
 [.82,1.64],[-.82,1.64],[.82,-1.64],[-.82,-1.64],
 [1.64,1.64],[-1.64,1.64],[1.64,-1.64],[-1.64,-1.64]
];

/**
 * A native nearest-point snap is NOT a route. QA spawn candidates must
 * belong to the same actual Recast high-source island both ways, without
 * an off-mesh descent to a lower floor. This authorizes no extra navigation.
 */
export function originalHighSpawnNativeConnection(
 nav:RecastStageNavigation,from:StageVector3,to:StageVector3
):boolean{
 if(![...from,...to].every(Number.isFinite)||
    Math.abs(from[1]-to[1])>SOURCE_HIGH_LEVEL_TOLERANCE_METERS)
   return false;
 for(const [start,end] of [[from,to],[to,from]] as const){
  const path=nav.auditPath(new Vec3(...start),new Vec3(...end),
   SOURCE_NATIVE_SNAP_LIMIT_METERS);
  const terminal=path.nativePathPoints[path.nativePathPoints.length-1];
  if(!path.querySuccess||!path.reachedTarget||!terminal||
     path.pointCount!==path.nativePathPoints.length||
     path.startSnapDistanceMeters>SOURCE_NATIVE_SNAP_LIMIT_METERS||
     path.endSnapDistanceMeters>SOURCE_NATIVE_SNAP_LIMIT_METERS||
     path.endpointErrorMeters>SOURCE_NATIVE_SNAP_LIMIT_METERS||
     Math.hypot(terminal.x-end[0],terminal.y-end[1],terminal.z-end[2])>
      SOURCE_NATIVE_SNAP_LIMIT_METERS||
     path.nativePathPoints.some(p=>!Number.isFinite(p.x)||
      !Number.isFinite(p.y)||!Number.isFinite(p.z)||
      Math.abs(p.y-from[1])>SOURCE_HIGH_LEVEL_TOLERANCE_METERS))
   return false;
 }
 return true;
}

/**
 * T21 original-source-only QA spawn slot proposal. Never edits the immutable
 * Undertow solid/paint/nav arrays. These are *candidate staging locations*
 * backed by actual original high spawn Rapier colliders and original Recast
 * navigable upper surface, not newly sourced retail/4v4 spawn evidence.
 * The single original-source spawn-center remains the only provenance datum.
 */
export function planSourceSupportedT21QaSpawnSlots(
 stage:StageDefinition,navigation:RecastStageNavigation,
 physics:RapierStagePhysics
):SourceSpawnPlan{
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
   frozen.activationReady!==false||
   stage.solids!==frozen.solids||
   stage.paintSurfaces!==frozen.paintSurfaces||
   stage.navigationLinks!==frozen.navigationLinks)
   throw Error('T21_QA_SOURCE_SPAWN_STAGE_AUTHORITY_INVALID');

 const slots=(side:'positive-z'|'negative-z',original:StageVector3)=>{
  const floorId='UndertowT21D:spawn-high-'+side;
  if(!stage.solids.some(s=>s.id===floorId))
   throw Error('T21_QA_SOURCE_SPAWN_ORIGINAL_SOLID_MISSING_'+side);
  const originProjection=navigation.auditNavMeshProjection(new Vec3(...original));
  const native=originProjection.nearestPoint;
  if(!originProjection.success||!native||
     originProjection.distanceMeters===null||
     Math.hypot(native.x-original[0],native.z-original[2])>.5||
     Math.abs(native.y-original[1])>SOURCE_HIGH_LEVEL_TOLERANCE_METERS)
   throw Error('T21_QA_SOURCE_SPAWN_ORIGINAL_POINT_NOT_NAVIGABLE_'+side);
  const found:StageVector3[]=[];
  // Pure source-ground probes. Candidate offsets are only a deterministic
  // search order, not an authored piece of terrain or a new spawn rule.
  const supported=(x:number,y:number,z:number)=>{
   for(const [ox,oz] of HUMAN_FOOT_RING_OFFSETS){
    // Query original HUMAN character-support collision, not a projectile
    // ray which can disagree with the character collider mode.
    const hit=physics.castCharacterFootSupport(
     new Vec3(x+ox,y,z+oz),0,'HUMAN');
    if(hit?.solidId!==floorId||
       Math.abs(hit.point.y-y)>HUMAN_SUPPORT_Y_TOLERANCE_METERS)
      return false;
   }
   return true;
  };
  for(const [ox,oz] of OBSERVATION_OFFSETS){
   const x=native.x+ox,z=native.z+oz;
   const projected=navigation.auditNavMeshProjection(new Vec3(x,native.y,z));
   const nav=projected.nearestPoint;
   // closestPoint() echoes its input on a failed Recast query; never turn
   // that echo into a certified spawn location.
   if(!projected.success||!nav||projected.distanceMeters===null||
      projected.distanceMeters>SOURCE_NATIVE_SNAP_LIMIT_METERS)continue;
   if(Math.abs(nav.y-native.y)>SOURCE_HIGH_LEVEL_TOLERANCE_METERS)continue;
   if(!supported(nav.x,nav.y,nav.z))continue;
   if(!originalHighSpawnNativeConnection(navigation,
       [native.x,native.y,native.z],[nav.x,nav.y,nav.z]))continue;
   if(found.some(p=>Math.hypot(p[0]-nav.x,p[2]-nav.z)<
      MIN_ACTOR_SEPARATION))continue;
   found.push([nav.x,nav.y,nav.z]);
   if(found.length===4)break;
  }
  if(found.length!==4)
   throw Error('T21_QA_SOURCE_SPAWN_INSUFFICIENT_ORIGINAL_SUPPORT_'+side+
     '_'+found.length);
  return found;
 };
 const teamASlots=slots('positive-z',stage.metadata.teamASpawn);
 const teamBSlots=slots('negative-z',stage.metadata.teamBSpawn);
 let minimumClearanceMeters=Number.POSITIVE_INFINITY;
 for(const group of [teamASlots,teamBSlots])
  for(let i=0;i<group.length;i++)
   for(let j=i+1;j<group.length;j++)
    minimumClearanceMeters=Math.min(minimumClearanceMeters,
     Math.hypot(group[i]![0]-group[j]![0],
       group[i]![2]-group[j]![2]));
 if(minimumClearanceMeters<MIN_ACTOR_SEPARATION)
  throw Error('T21_QA_SOURCE_SPAWN_REAL_COLLIDER_OVERLAP');
 return {
  originalHighSolids:[
   'UndertowT21D:spawn-high-positive-z',
   'UndertowT21D:spawn-high-negative-z'
  ],
  teamASlots,teamBSlots,minimumClearanceMeters,
  originalSolidsPreserved:true,originalNavLinksPreserved:true,
  qaOnly:true,releaseAuthorized:false
 };
}

/** Only QA metadata is copied. The actual original source geometry remains
 * exactly shared and T21 activation remains forbidden. */
export function withProvisionalT21QaSpawnMetadata(
 stage:StageDefinition,plan:SourceSpawnPlan
):StageDefinition{
 if(stage.solids!==frozen.solids||
   stage.paintSurfaces!==frozen.paintSurfaces||
   stage.navigationLinks!==frozen.navigationLinks||
   !plan.qaOnly||plan.releaseAuthorized)
  throw Error('T21_QA_SPAWN_METADATA_MUST_NOT_PROMOTE');
 return {
  ...stage,
  metadata:{
   ...stage.metadata,
   teamASpawnSlots:plan.teamASlots,
   teamBSpawnSlots:plan.teamBSlots
  }
 };
}
