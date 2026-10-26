/**
 * B239 authentic KiTrix pinned FloorLine00: RAPiER + production KCC +
 * native Recast, isolated from F3. The B239 JSON is generated ONLY after
 * the full original Temple01 LFS object's SHA256/size and face IDs pass.
 *
 * A successful raycast or native path does NOT certify actor traversal.
 */
import RAPIER,{type Collider,type RigidBody} from '@dimforge/rapier3d-compat';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {initializeRapier,RapierStagePhysics}
 from '../src/physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../src/navigation/RecastStageNavigation';
import {PLAYER_CHARACTER_PHYSICS as P,createConfiguredPlayerCharacterController}
 from '../src/player/PlayerCharacterPhysics';
import {b235ExactSourceSideQaStage,type B235Side}
 from '../src/stage/undertow/B235ExactOriginalSourceEntryQa';
import {b236InspectOriginalSlopeEntrance}
 from '../src/stage/undertow/B236OriginalSlope01IngressAudit';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../src/stage/StageDefinition';

type P3=readonly[number,number,number];
type OriginalTriangle={
 originalFaceIndex:number;originalOBJVertexIDs:number[];
 sourceMaterial:string;vertices:[P3,P3,P3];
 signedUnitNormalY:number;sourceAreaSquareMeters:number
};
type Candidate={sourceObject:string;sourceAreaSquareMeters:number;
 sourceMaterial:string;triangles:OriginalTriangle[];
 rightLowWitness:{registeredBoundaryWitness:P3;originalTriangleNearestWitness:P3;
  distanceMeters:number};
 slopeTopWitness:{originalTriangleNearestWitness:P3;distanceMeters:number}};
type Seed={version:string;sourceSHA256:string;originalStage:string;
 opponentRoutesCertified:string;productionAuthorized:boolean;
 sourceOnly:boolean;sides:Record<B235Side,Candidate>};
const SIDES=['POSITIVE_Z','NEGATIVE_Z'] as const;
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const SOURCE='Fld_Temple01_group21600_1__FloorLine00';
const DT=1/60;
const ORIGINAL_ID=(side:B235Side)=>side==='POSITIVE_Z'?
 'UndertowT21D:right-low-team-a':'UndertowT21D:right-low-team-b';
const TERMINAL:Record<B235Side,P3>={
 POSITIVE_Z:[5.604740142822266,4.599999904632568,35.83282470703125],
 NEGATIVE_Z:[-5.375261306762695,4.599999904632568,-35.627174377441406]
};
const vec=(p:P3)=>new Vec3(...p);
const horizontal=(a:P3,b:P3)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const centroid=(tri:OriginalTriangle):P3=>[
 (tri.vertices[0][0]+tri.vertices[1][0]+tri.vertices[2][0])/3,
 (tri.vertices[0][1]+tri.vertices[1][1]+tri.vertices[2][1])/3,
 (tri.vertices[0][2]+tri.vertices[1][2]+tri.vertices[2][2])/3
];

function readSource():Seed{
 const file=process.env.T21_B239_FACES_OUTPUT;
 if(!file)throw Error('B239_REQUIRE_PINNED_SOURCE_RESULT_FROM_CURRENT_CI');
 const s=JSON.parse(readFileSync(file,'utf8')) as Seed;
 if(s.version!=='B239_EXACT_FLOORLINE_ONLY_SOURCE_FACES_V1'||
   s.sourceSHA256!==PIN||s.originalStage!=='25/17/26/0'||
   s.opponentRoutesCertified!=='0/12'||s.productionAuthorized!==false||
   s.sourceOnly!==true)throw Error('B239_UNPINNED_SOURCE_OR_PROMOTED_AUTHORITY');
 for(const side of SIDES){
  const c=s.sides[side];
  const ids=side==='POSITIVE_Z'?[37118,37119]:[37112,37113];
  if(c.sourceObject!==SOURCE||c.triangles.length!==2||
    Math.abs(c.sourceAreaSquareMeters-1.52523399523421)>1e-5||
    c.triangles.some((t,i)=>t.originalFaceIndex!==ids[i]||
     t.sourceMaterial!==c.sourceMaterial||Math.abs(t.signedUnitNormalY)<.5))
   throw Error('B239_EXACT_FLOORLINE_SOURCE_ID_OR_MATERIAL_DRIFT');
 }
 return s;
}
function stageFor(side:B235Side,c:Candidate):StageDefinition{
 const base=b235ExactSourceSideQaStage(side);
 const tris=c.triangles;
 // Each original triangle has three unmodified source vertices, in the
 // exact original winding. NO extra seam-filling triangle is generated.
 const vertices=tris.flatMap(t=>t.vertices);
 const ranges=([0,1,2] as const).map(axis=>
  Math.max(...vertices.map(p=>p[axis]))-Math.min(...vertices.map(p=>p[axis])));
 const addition:StageSolidDefinition={
  id:'B239_PINNED_ORIGINAL_FLOORLINE:'+side,
  center:[0,0,0],size:ranges as StageVector3,material:'medium',
  render:false,projectileBlocker:false,cameraBlocker:false,
  collisionEnabled:true,navigationEnabled:true,
  triangleMesh:{vertices,indices:[0,1,2,3,4,5]}
 };
 const stage:StageDefinition={
  ...base,metadata:{...base.metadata,id:'b239-isolated-pinned-original-floorline-'+side},
  solids:[...base.solids,addition]
 };
 if(FROZEN.activationReady!==false||FROZEN.solids.length!==25||
  FROZEN.paintSurfaces.length!==17||FROZEN.navigationLinks.length!==26||
  base.solids.length!==30||stage.solids.length!==31||
  base.navigationLinks!==FROZEN.navigationLinks||
  stage.navigationLinks!==FROZEN.navigationLinks||
  stage.paintSurfaces!==FROZEN.paintSurfaces||
  stage.solids.slice(0,25).some((v,i)=>v!==FROZEN.solids[i])||
  stage.solids[30]!==addition||
  stage.solids[30]?.triangleMesh?.indices.length!==6)
  throw Error('B239_STAGE_ISOLATION_OR_SOURCE_TRIANGLE_INVARIANT_FAILED');
 return stage;
}
function support(world:RapierStagePhysics,foot:P3){
 const p=vec(foot);
 const hit=world.castCharacterFootSupport(
  new Vec3(p.x,p.y+P.humanFootOffsetMeters+.06,p.z),
  P.humanFootOffsetMeters,'HUMAN');
 return {id:hit?.solidId??null,
  sourceSurfaceY:hit?.point.y??null,
  verticalError:hit?Math.abs(hit.point.y-p.y):null};
}
function navWitness(nav:RecastStageNavigation,from:P3,to:P3){
 const a=nav.auditNavMeshProjection(vec(to));
 const p=nav.auditPath(vec(from),vec(to),.30);
 return {projection:a,querySuccess:p.querySuccess,
  nativeReachedTarget:p.reachedTarget,startSnap:p.startSnapDistanceMeters,
  endSnap:p.endSnapDistanceMeters,endpointError:p.endpointErrorMeters,
  nativePointCount:p.pointCount,
  strictConnected:p.reachedTarget&&p.startSnapDistanceMeters<=.30&&
   p.endSnapDistanceMeters<=.30&&p.endpointErrorMeters<=.30};
}
type Mode='WALK'|'ONE_JUMP';
function traverse(stage:StageDefinition,side:B235Side,c:Candidate,mode:Mode){
 const world=new RapierStagePhysics(DT,stage);world.step();
 const starting=TERMINAL[side];
 const slope=b236InspectOriginalSlopeEntrance(side);
 const target:P3=[...slope.topFoot];
 const originalSourceId='B239_PINNED_ORIGINAL_FLOORLINE:'+side;
 const slopeId='B235_EXACT_CI688_QA:underpass-route-slope01-'+
  (side==='POSITIVE_Z'?'positive-z':'negative-z');
 const originalSurfaceWitness=c.rightLowWitness.originalTriangleNearestWitness;
 const approach=c.rightLowWitness.registeredBoundaryWitness;
 const inner=centroid(c.triangles[0]);
 const far=c.slopeTopWitness.originalTriangleNearestWitness;
 const targets:P3[]=[approach,originalSurfaceWitness,inner,far,target];
 const body:RigidBody=world.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   starting[0],starting[1]+P.humanFootOffsetMeters+.06,starting[2]));
 const collider:Collider=world.world.createCollider(
  RAPIER.ColliderDesc.capsule(P.humanHalfHeightMeters,P.humanRadiusMeters),body);
 const controller=createConfiguredPlayerCharacterController(world.world);
 const collisions=new Set<string>();
 let kccSteps=0;
 const step=(x:number,y:number,z:number)=>{
  const p=body.translation();
  controller.computeColliderMovement(collider,new Vec3(x,y,z),
   undefined,undefined,col=>world.shouldCharacterCollide(col,'HUMAN'));
  for(let n=0;n<controller.numComputedCollisions();n++){
   const col=controller.computedCollision(n)?.collider;
   const id=col?world.sourceSolidIdForCollider(col):null;
   if(id)collisions.add(id);
  }
  const d=controller.computedMovement();
  body.setNextKinematicTranslation({x:p.x+d.x,y:p.y+d.y,z:p.z+d.z});
  const grounded=controller.computedGrounded();
  world.step();kccSteps++;
  return grounded;
 };
 let grounded=false;
 for(let tick=0;tick<30;tick++){grounded=step(0,-.12,0);if(grounded)break;}
 const currentFoot=():P3=>{
  const p=body.translation();return [p.x,p.y-P.humanFootOffsetMeters,p.z];
 };
 const initialPhysical=support(world,currentFoot());
 const initialCorrect=initialPhysical.id===ORIGINAL_ID(side);
 let speed=0,vy=-.5,waypoint=0,jumpUsed=false;
 let groundedOnFloorlineTicks=0,groundedOnSlopeTicks=0;
 let firstFloorlineTick:number|null=null,firstSlopeTick:number|null=null;
 let minFloorlineXZ=Infinity,minSlopeXZ=Infinity;
 let maxOffGroundTicks=0,offGroundTicks=0;
 let lastGrounded=grounded;
 const motionSamples:unknown[]=[];
 for(let tick=0;tick<540;tick++){
  const foot=currentFoot();
  const goal=targets[Math.min(waypoint,targets.length-1)]!;
  const delta=horizontal(foot,goal);
  if(delta<.29&&waypoint<targets.length-1)waypoint++;
  const destination=targets[Math.min(waypoint,targets.length-1)]!;
  const d=horizontal(foot,destination);
  const speedTarget=Math.min(GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
   Math.sqrt(2*GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2*d));
  speed=Math.min(speedTarget,speed+GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2*DT);
  if(mode==='ONE_JUMP'&&!jumpUsed&&grounded&&waypoint>=1){
   vy=GAME_CONFIG.player.jumpSpeedMetersPerSecond;jumpUsed=true;
  }
  vy=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
   vy-GAME_CONFIG.player.gravityMetersPerSecond2*DT);
  grounded=step(d>1e-8?(destination[0]-foot[0])/d*speed*DT:0,
   vy*DT,d>1e-8?(destination[2]-foot[2])/d*speed*DT:0);
  if(grounded&&vy<0)vy=-.5;
  const after=currentFoot(),hit=support(world,after);
  if(grounded){offGroundTicks=0;}else{
   offGroundTicks++;maxOffGroundTicks=Math.max(maxOffGroundTicks,offGroundTicks);
  }
  minFloorlineXZ=Math.min(minFloorlineXZ,
   horizontal(after,inner),horizontal(after,originalSurfaceWitness),
   horizontal(after,far));
  minSlopeXZ=Math.min(minSlopeXZ,horizontal(after,target));
  if(grounded&&hit.id===originalSourceId&&
    hit.verticalError!==null&&hit.verticalError<.20){
   groundedOnFloorlineTicks++;
   if(firstFloorlineTick===null)firstFloorlineTick=tick;
  }
  if(grounded&&hit.id===slopeId&&horizontal(after,target)<.30&&
    hit.verticalError!==null&&hit.verticalError<.20){
   groundedOnSlopeTicks++;
   if(firstSlopeTick===null)firstSlopeTick=tick;
  }
  if(tick%60===0||firstFloorlineTick===tick||firstSlopeTick===tick)
   motionSamples.push({tick,foot:after,waypoint,grounded,
    physicalSupportId:hit.id,verticalError:hit.verticalError});
  lastGrounded=grounded;
  // This condition is a *real same-body* Rapier traversal, not a ray
  // or Recast-only certificate. Local QA alone never proves real CPU use.
  if(groundedOnFloorlineTicks>=3&&groundedOnSlopeTicks>=3)break;
  if(after[1]<-8)break;
 }
 const finalFoot=currentFoot();
 return {side,mode,initialReal25Supported:initialCorrect,
  initialPhysical,initialSpawnOnly:true,teleportsAfterSpawn:0,
  nativeKccSteps:kccSteps,actualJumpUsed:jumpUsed,
  nativeCollisionSolidIds:[...collisions].sort(),
  touchedExactFloorlineWithGroundedCapsule:groundedOnFloorlineTicks>0,
  floorlineSupportGroundedTicks:groundedOnFloorlineTicks,
  firstFloorlineTick,firstSlopeTick,slopeGroundedTicks:groundedOnSlopeTicks,
  exactSourceIngressPhysicallyTraversed:
   initialCorrect&&groundedOnFloorlineTicks>=3&&groundedOnSlopeTicks>=3,
  closestCandidateXZDistanceMeters:minFloorlineXZ,
  closestSlopeXZDistanceMeters:minSlopeXZ,
  furthestWaypointReached:waypoint,
  maxAirborneFrames:maxOffGroundTicks,
  finalFoot,finalGrounded:lastGrounded,
  finalPhysicalSupport:support(world,finalFoot),
  sparseFrames:motionSamples,liveCpuAgentSystemUsed:false,
  opponentPathsCertified:'0/12',productionAuthorized:false};
}
beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B239 full pinned source FloorLine00 isolated Rapier KCC + Recast',()=>{
 it('measures both mirrors against 30-solid original-source QA without changing frozen runtime',()=>{
  const seed=readSource(),results=[];
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  for(const side of SIDES){
   const c=seed.sides[side];
   const baseline=b235ExactSourceSideQaStage(side);
   const qa=stageFor(side,c);
   const baselineWorld=new RapierStagePhysics(DT,baseline);
   const qaWorld=new RapierStagePhysics(DT,qa);
   baselineWorld.step();qaWorld.step();
   const before=new RecastStageNavigation(baseline,new PerformanceStats());
   const after=new RecastStageNavigation(qa,new PerformanceStats());
   const sourceTargets=[...c.triangles.map(centroid),
    c.rightLowWitness.originalTriangleNearestWitness,
    c.slopeTopWitness.originalTriangleNearestWitness];
   const staticContact=sourceTargets.map(p=>({
    target:p,source30:support(baselineWorld,p),source31:support(qaWorld,p),
    nativeBefore:navWitness(before,TERMINAL[side],p),
    nativeAfter:navWitness(after,TERMINAL[side],p)
   }));
   const slope=b236InspectOriginalSlopeEntrance(side);
   const finalSourceTarget:[number,number,number]=[...slope.topFoot];
   const ingressBefore=navWitness(before,TERMINAL[side],finalSourceTarget);
   const ingressAfter=navWitness(after,TERMINAL[side],finalSourceTarget);
   const walking=traverse(qa,side,c,'WALK');
   const jumping=traverse(qa,side,c,'ONE_JUMP');
   const row={side,provenance:{sha256:PIN,sourceObject:c.sourceObject,
     faceIndices:c.triangles.map(t=>t.originalFaceIndex),
     originalOBJIDs:c.triangles.map(t=>t.originalOBJVertexIDs),
     material:c.sourceMaterial,
     originalWindingSignedY:c.triangles.map(t=>t.signedUnitNormalY),
     originalAreaSquareMeters:c.sourceAreaSquareMeters},
    candidateContactBeforeAfter:staticContact,
    nativeRightLowToSourceSlopeBefore:ingressBefore,
    nativeRightLowToSourceSlopeAfter:ingressAfter,
    actualKcc:{walking,jumping},
    physicalAndNavIngressAuthenticated:
     (walking.exactSourceIngressPhysicallyTraversed||
      jumping.exactSourceIngressPhysicallyTraversed)&&
      ingressAfter.strictConnected,
    actorCpuAgentSystemInstantiated:false,
    isolatedSolidsBefore:30,isolatedSolidsAfter:qa.solids.length,
    frozenStage:'25/17/26/0',productionAuthorized:false,
    originalOpponentPathsCertified:'0/12'};
   results.push(row);
   expect(qa.solids.length).toBe(31);
   expect(qa.paintSurfaces).toBe(FROZEN.paintSurfaces);
   expect(qa.navigationLinks).toBe(FROZEN.navigationLinks);
   expect(staticContact).toHaveLength(4);
   expect(walking.initialReal25Supported).toBe(true);
   expect(jumping.initialReal25Supported).toBe(true);
   expect(walking.nativeKccSteps).toBeGreaterThan(1);
   expect(jumping.nativeKccSteps).toBeGreaterThan(1);
   expect(walking.teleportsAfterSpawn).toBe(0);
   expect(jumping.teleportsAfterSpawn).toBe(0);
   expect(row.actorCpuAgentSystemInstantiated).toBe(false);
  }
  const result={version:'B239_TRUE_NATIVE_ISOLATED_SOURCE_INGRESS_QA_V1',
   originalSHA256:PIN,sourceFaceCountPerMirror:2,
   actualNativeKccTrials:4,actualNativeRecastComparison:true,
   results,originalStage:'25/17/26/0',
   liveCpuCrossTeamRoutesCertified:'0/12',
   unrestricted4v4Certified:false,officialWinner:'NONE',
   productionAuthorized:false};
  const file=process.env.T21_B239_RESULT_OUTPUT;
  if(file){mkdirSync(dirname(file),{recursive:true});
   writeFileSync(file,JSON.stringify(result,null,2));}
  console.log('B239_EXACT_ORIGINAL_FLOORLINE_NATIVE_PHYSICAL_NAV_QA',
   JSON.stringify(result));
 },120000);
});
