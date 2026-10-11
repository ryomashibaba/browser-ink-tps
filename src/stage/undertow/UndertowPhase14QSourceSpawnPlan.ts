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
const OBSERVATION_OFFSETS:readonly (readonly [number,number])[]=[
 [0,0],[.82,0],[-.82,0],[0,.82],[0,-.82],
 [.82,.82],[.82,-.82],[-.82,.82],[-.82,-.82],
 [1.64,0],[-1.64,0],[0,1.64],[0,-1.64],
 [1.64,.82],[1.64,-.82],[-1.64,.82],[-1.64,-.82],
 [.82,1.64],[-.82,1.64],[.82,-1.64],[-.82,-1.64],
 [1.64,1.64],[-1.64,1.64],[1.64,-1.64],[-1.64,-1.64]
];

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
  const native=navigation.closestPoint(new Vec3(...original));
  if(Math.hypot(native.x-original[0],native.z-original[2])>.5)
   throw Error('T21_QA_SOURCE_SPAWN_ORIGINAL_POINT_NOT_NAVIGABLE_'+side);
  const found:StageVector3[]=[];
  // Pure source-ground probes. Candidate offsets are only a deterministic
  // search order, not an authored piece of terrain or a new spawn rule.
  const supported=(x:number,y:number,z:number)=>{
   for(const [ox,oz] of [
    [0,0],[FOOT_RADIUS,0],[-FOOT_RADIUS,0],
    [0,FOOT_RADIUS],[0,-FOOT_RADIUS],
    [FOOT_RADIUS*.72,FOOT_RADIUS*.72],
    [-FOOT_RADIUS*.72,-FOOT_RADIUS*.72]
   ] as readonly (readonly [number,number])[]){
    const start=new Vec3(x+ox,y+.70,z+oz);
    const end=new Vec3(x+ox,y-.70,z+oz);
    const hit=physics.castStageSegment(start,end,'ink-projectile');
    if(hit?.solidId!==floorId)return false;
   }
   return true;
  };
  for(const [ox,oz] of OBSERVATION_OFFSETS){
   const x=native.x+ox,z=native.z+oz;
   const nav=navigation.closestPoint(new Vec3(x,native.y,z));
   const sourceProjection=Math.hypot(nav.x-x,nav.y-native.y,nav.z-z);
   if(sourceProjection>.16)continue;
   if(Math.abs(nav.y-native.y)>.11)continue;
   if(!supported(nav.x,nav.y,nav.z))continue;
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
