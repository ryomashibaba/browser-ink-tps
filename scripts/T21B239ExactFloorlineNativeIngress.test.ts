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
import {Application,NullGraphicsDevice,Vec3} from 'playcanvas';
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
import {buildTestStage} from '../src/stage/TestStage';
import {buildT21F4ResearchStage,f4OriginalCorridorEndpoints,isT21F4OriginalTerrainStage,isT21F4ResearchStage}
 from '../src/stage/undertow/UndertowT21F4PhotoRouteReconstruction';
import {parseT21F4OriginalTerrain}
 from '../src/stage/undertow/UndertowT21F4OriginalTerrain';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import {undertowT21dConnectivityQaStage}
 from '../src/stage/undertow/UndertowSpillwayConnectivityQa';
import {planSourceSupportedT21QaSpawnSlots}
 from '../src/stage/undertow/UndertowPhase14QSourceSpawnPlan';
import {planT21F2SourceDropRoutes} from '../src/stage/undertow/UndertowF2SourceDropRoutes';
import {ORIGINAL_SOURCE_CPU_CAPSULE,UndertowPhase14QSharedActorCollision}
 from '../src/stage/undertow/UndertowPhase14QSharedActorCollision';

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
describe.skipIf(Boolean(process.env.T21_F4_LOCAL_TERRAIN&&!process.env.T21_B239_FACES_OUTPUT))('B239 full pinned source FloorLine00 isolated Rapier KCC + Recast',()=>{
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
   // First verified B239 native run #40328240414: genuine two-sided
   // physical source ingresses succeed, with no teleport or invented floor.
   // A raycast alone is not sufficient: the SAME Rapier body must be
   // grounded on BOTH the new original FloorLine and exact Slope01.
   expect(staticContact.slice(0,2).every(x=>
    x.source30.id===null&&
    x.source31.id==='B239_PINNED_ORIGINAL_FLOORLINE:'+side&&
    x.source31.verticalError!==null&&x.source31.verticalError<.00001)).toBe(true);
   expect(walking.exactSourceIngressPhysicallyTraversed).toBe(true);
   expect(jumping.exactSourceIngressPhysicallyTraversed).toBe(true);
   expect(walking.floorlineSupportGroundedTicks).toBeGreaterThanOrEqual(3);
   expect(walking.slopeGroundedTicks).toBeGreaterThanOrEqual(3);
   // The native Recast "reached target" flag currently projects the
   // *real slope target* ~1m away. Never call this CPU navigation success.
   expect(ingressAfter.nativeReachedTarget).toBe(true);
   expect(ingressAfter.endSnap).toBeGreaterThan(1.0);
   expect(ingressAfter.strictConnected).toBe(false);
   expect(row.physicalAndNavIngressAuthenticated).toBe(false);
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

it.skipIf(!process.env.T21_F4_LOCAL_TERRAIN)(
 'checks the local original F4 ground with genuine Rapier capsules and Recast',
 ()=>{
  const seed=JSON.parse(readFileSync(process.env.T21_F4_LOCAL_TERRAIN!,'utf8'));
  const terrain=parseT21F4OriginalTerrain(seed);
  const base=undertowT21dConnectivityQaStage();
  const stage=buildT21F4ResearchStage(base,terrain);
  expect(isT21F4ResearchStage(stage)).toBe(true);
  expect(isT21F4OriginalTerrainStage(stage)).toBe(true);
  expect(isT21F4ResearchStage({...stage})).toBe(false);
  const corridors=f4OriginalCorridorEndpoints(stage);
  if(!corridors.length){
   expect(stage.solids).toHaveLength(51);
   expect(stage.solids.slice(0,25)).toEqual(base.solids);
  }
  expect(base.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toBe(base.paintSurfaces);
  expect(stage.navigationLinks).toBe(base.navigationLinks);
  const dt=1/60;
  const physics=new RapierStagePhysics(dt,stage);
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const profile=P;
  const cpu=ORIGINAL_SOURCE_CPU_CAPSULE;
  physics.step();
  const project=(x:number,y:number,z:number)=>{
   const [px,pz]=undertowTemple01ModelXZToProjectXZ([x,z]);
   return new Vec3(px,y-3,pz);
  };
  const support=(p:Vec3,offset:number)=>{
   const center=new Vec3(p.x,p.y+offset,p.z);
   return physics.castCharacterFootSupport(center,offset,'HUMAN');
  };
  const canvas={id:'f4-original-terrain',width:1,height:1} as HTMLCanvasElement;
  const app=new Application(canvas,{graphicsDevice:new NullGraphicsDevice(canvas)});
  buildTestStage(app,{...stage,solids:Object.values(terrain)},[],{} as Parameters<typeof buildTestStage>[3]);
  let maxRenderPhysicsError=0;
  const signedNormals=Object.values(terrain).map(solid=>{
   const entity=app.root.findByName(solid.id)!;
   const rendered=entity.render!.meshInstances[0]!.mesh;
   const positions:number[]=[];
   const indices:number[]=[];
   rendered.getPositions(positions);
   rendered.getIndices(indices);
   expect(indices).toEqual(solid.triangleMesh!.indices);
   return Array.from({length:indices.length/3},(_,face)=>{
    const [a,b,c]=indices.slice(face*3,face*3+3).map(i=>
     entity.getWorldTransform().transformPoint(
      new Vec3(positions[3*i]!,positions[3*i+1]!,positions[3*i+2]!)));
    const center=a!.clone().add(b!).add(c!).mulScalar(1/3);
    const normal=new Vec3().cross(b!.sub(a!),c!.sub(a!)).normalize();
    const origin=center.clone().add(normal.clone().mulScalar(.05));
    const hit=physics.world.castRayAndGetNormal(new RAPIER.Ray(origin,normal.clone().mulScalar(-1)),
     .10,true,undefined,undefined,undefined,undefined,
     collider=>physics.sourceSolidIdForCollider(collider)===solid.id);
    expect(hit?.timeOfImpact).toBeCloseTo(.05,4);
    expect(hit?.normal.y).toBeCloseTo(normal.y,4);
    maxRenderPhysicsError=Math.max(maxRenderPhysicsError,Math.abs(hit!.timeOfImpact-.05));
    return normal.y;
   });
  });
  app.destroy();
  const centerLow=project(-6,3,0);
  const centerTop=project(0,4.5,0);
  expect(support(centerLow,profile.humanFootOffsetMeters)?.point.y).toBeCloseTo(0,4);
  expect(support(centerTop,profile.humanFootOffsetMeters)?.point.y).toBeCloseTo(1.5,4);
  const centerProjection=nav.auditNavMeshProjection(centerTop);
  const centerRoute=nav.auditPath(centerLow,centerTop,.30);
  const ingress=SIDES.map(side=>{
   const slope=b236InspectOriginalSlopeEntrance(side);
   return {side,...navWitness(nav,TERMINAL[side],slope.topFoot)};
  });
  const basePhysics=new RapierStagePhysics(dt,base);basePhysics.step();
  const baseNav=new RecastStageNavigation(base,new PerformanceStats());
  const spawns=planSourceSupportedT21QaSpawnSlots(base,baseNav,basePhysics);
  baseNav.crowd.destroy();
  basePhysics.world.free();
  expect(planT21F2SourceDropRoutes(stage,nav,spawns).routes).toHaveLength(8);

  const createMover=(foot:Vec3,radius:number,halfHeight:number)=>{
   const offset=radius+halfHeight;
   const body=physics.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(foot.x,foot.y+offset+.035,foot.z));
   const collider=physics.world.createCollider(RAPIER.ColliderDesc.capsule(halfHeight,radius),body);
   const controller=createConfiguredPlayerCharacterController(physics.world);
   const position=()=>{
    const p=body.translation();
    return new Vec3(p.x,p.y-offset,p.z);
   };
   let unsupported=0;
   let upward=0;
   let maxRise=0;
   let ungrounded=0;
   let vertical=-.5;
   const blockers=new Set<string>();
   const advance=(target:Vec3,maxSpeed:number)=>{
    const p=position();
    const direction=new Vec3(target.x-p.x,0,target.z-p.z);
    const distance=direction.length();
    if(distance>0)direction.mulScalar(Math.min(1,maxSpeed*dt/distance));
    vertical=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
     vertical-GAME_CONFIG.player.gravityMetersPerSecond2*dt);
    direction.y=vertical*dt;
    controller.computeColliderMovement(collider,direction,undefined,undefined,
     other=>physics.shouldCharacterCollide(other,'HUMAN'));
    const d=controller.computedMovement();
    if(!controller.computedGrounded())ungrounded++;
    maxRise=Math.max(maxRise,d.y);
    if(Math.hypot(d.x-direction.x,d.z-direction.z)>.01){
     for(let i=0;i<controller.numComputedCollisions();i++){
      const other=controller.computedCollision(i)?.collider;
      const id=other&&physics.sourceSolidIdForCollider(other);
      if(id)blockers.add(id);
     }
    }
    if(controller.computedGrounded()&&vertical<0)vertical=-.5;
    body.setNextKinematicTranslation({x:p.x+d.x,y:p.y+offset+d.y,z:p.z+d.z});
    upward=Math.max(upward,p.y+d.y);
   };
   return {position,advance,sample(){
    const foot=position();
    const hit=support(foot,offset);
    if(!hit||Math.abs(foot.y-hit.point.y)>.25)unsupported++;
   },result:(goal:Vec3)=>({
    endpointError:position().distance(goal),unsupported,ungrounded,maxRise,
    maxFootY:upward,blockers:[...blockers],
    finalFoot:position()
   }),release(){
    physics.world.removeCharacterController(controller);
    physics.world.removeRigidBody(body);
   }};
  };

  const human=createMover(centerLow,profile.humanRadiusMeters,profile.humanHalfHeightMeters);
  const runHuman=(goal:Vec3,ticks:number)=>{
   for(let i=0;i<ticks;i++){
    human.advance(goal,GAME_CONFIG.player.humanSpeedMetersPerSecond);
    physics.step();
    human.sample();
   }
   return human.result(goal);
  };
  const approach=runHuman(centerTop,150);
  const returned=runHuman(centerLow,120);
  human.release();
  expect(approach.endpointError).toBeGreaterThan(1);
  expect(approach.unsupported).toBe(0);
  expect(returned.endpointError).toBeLessThan(.15);
  expect(returned.unsupported).toBe(0);

  const movers=Array.from({length:GAME_CONFIG.cpu.cpuPlayers},(_,i)=>{
   const side=i<3?-1:1;
   const z=i<3?.2+i*1.25:-4+(i-3)*1.25;
   const start=project(side*8,3,z);
   const goal=project(side*5.2,3,z);
   const agent=nav.addAgent(start);
   agent.requestMoveTarget(nav.closestPoint(goal));
   return {agent,goal,mover:createMover(start,cpu.radiusMeters,cpu.halfHeightMeters)};
  });
  for(let i=0;i<180;i++){
   nav.fixedUpdate(dt);
   for(const {agent,mover} of movers)
    mover.advance(new Vec3().copy(agent.position()),GAME_CONFIG.cpu.maxSpeedMetersPerSecond);
   physics.step();
   for(const {mover} of movers)mover.sample();
  }
  const cpuLocal=movers.map(({goal,mover})=>mover.result(goal));
  const supportedCpuArrivals=cpuLocal.filter(row=>row.endpointError<.30&&row.unsupported===0).length;
  expect(supportedCpuArrivals).toBe(GAME_CONFIG.cpu.cpuPlayers);
  console.log('T21_F4_LOCAL_ORIGINAL_TERRAIN',JSON.stringify({
   faceCounts:signedNormals.map(group=>group.length),
   centerProjectionMeters:centerProjection.distanceMeters,centerRoute:{
    reached:centerRoute.reachedTarget,endSnap:centerRoute.endSnapDistanceMeters,
    endpointError:centerRoute.endpointErrorMeters
   },ingress:ingress.map(({side,strictConnected})=>({side,strictConnected})),supportedCpuArrivals
  }));
  for(const {mover,agent} of movers){
   mover.release();
   nav.removeAgent(agent);
  }
  if(corridors.length){
   expect(terrain['corridor-floors']?.triangleMesh?.indices.length).toBe(48*3);
   expect(terrain['corridor-sides']?.triangleMesh?.indices.length).toBe(34*3);
   const walkOnlyNav=new RecastStageNavigation({...stage,navigationLinks:[]},new PerformanceStats());
   let directedCapsulePasses=0;
   for(const [low,slope] of corridors){
    for(const [radius,halfHeight] of [
     [profile.humanRadiusMeters,profile.humanHalfHeightMeters],
     [cpu.radiusMeters,cpu.halfHeightMeters]
    ] as const){
     const mover=createMover(vec(low),radius,halfHeight);
     try{
      for(const [from,to] of [[low,slope],[slope,low]] as const){
       const path=walkOnlyNav.auditPath(vec(from),vec(to),.20);
       expect(path.reachedTarget).toBe(true);
       expect(path.startSnapDistanceMeters).toBeLessThan(.30);
       expect(path.endSnapDistanceMeters).toBeLessThan(.30);
       for(const point of path.nativePathPoints.slice(1)){
        const goal=new Vec3().copy(point);
       let ticks=0;
       for(;ticks<900;ticks++){
        const foot=mover.position();
        if(Math.hypot(foot.x-goal.x,foot.z-goal.z)<=.055)break;
         mover.advance(goal,3.12);
         physics.step();
         mover.sample();
        }
        expect(ticks).toBeLessThan(900);
       }
       const result=mover.result(vec(to));
       expect(result.endpointError).toBeLessThan(.12);
       expect(result.unsupported).toBe(0);
       expect(result.ungrounded).toBe(0);
       expect(result.maxRise).toBeLessThan(profile.autostepMaxHeightMeters);
       directedCapsulePasses++;
      }
     }finally{
      mover.release();
     }
    }
   }
   walkOnlyNav.crowd.destroy();

   // Local starts are physical floor points. The existing Crowd and shared
   // runtime CPU KCC handle both directions with all seven bodies present.
   const crowdNav=new RecastStageNavigation(stage,new PerformanceStats());
   const crowdPhysics=new RapierStagePhysics(dt,stage);
   const shared=new UndertowPhase14QSharedActorCollision(crowdPhysics,stage,true);
   crowdPhysics.step();
   const agents=Array.from({length:GAME_CONFIG.cpu.cpuPlayers},(_,i)=>{
    const first=i<3;
    const lane=first?i:i-3;
    const [low,slope]=corridors[first?0:1]!;
    const sign=first?1:-1;
    const start=vec(low).add(new Vec3(sign*(lane%2-.5)*1.25,0,
     sign*(Math.floor(lane/2)-.5)*1.25));
    const goal=vec(slope);
    const id=(first?'A':'B')+(lane+1);
    expect(support(start,cpu.centerOffsetMeters)?.point.y).toBeCloseTo(start.y,4);
    shared.syncRealCpuFoot(id,start);
    const agent=crowdNav.addAgent(start);
    return {id,start,goal,agent,foot:start,arrived:false,returned:false};
   });
   for(let tick=0;tick<1200&&agents.some(a=>!a.returned);tick++){
    // All bodies are present from the start. Space their normal goal
    // requests so they do not all crowd the same seam on the first tick.
    const joining=agents[tick/36];
    if(joining)joining.agent.requestMoveTarget(crowdNav.closestPoint(joining.goal));
    crowdNav.fixedUpdate(dt);
    for(const a of agents){
     if(a.returned)continue;
     const foot=shared.tryF4GroundStep(a.id,a.foot,a.agent.position(),
      GAME_CONFIG.cpu.maxSpeedMetersPerSecond*dt);
     if(!foot)continue;
     a.foot=new Vec3().copy(foot);
     shared.syncRealCpuFoot(a.id,a.foot);
     if(!a.arrived&&a.foot.distance(a.goal)<1.15){
      a.arrived=true;
      a.agent.requestMoveTarget(crowdNav.closestPoint(a.start));
     }else if(a.arrived&&a.foot.distance(a.start)<.38){
      a.returned=true;
      a.agent.resetMoveTarget();
     }
    }
    crowdPhysics.step();
   }
   const crowdRoundTrips=agents.filter(a=>a.returned).length;
   expect(crowdRoundTrips).toBe(GAME_CONFIG.cpu.cpuPlayers);
   shared.dispose();
   crowdNav.crowd.destroy();
   crowdPhysics.world.free();
   console.log('T21_F4_ORIGINAL_CORRIDORS',JSON.stringify({
    newFloorTriangles:48,newSideTriangles:34,directedCapsulePasses,crowdRoundTrips,
    maxRenderPhysicsError
   }));
  }
  nav.crowd.destroy();
  physics.world.free();
 }
);

