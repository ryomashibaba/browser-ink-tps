import RAPIER from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
// @ts-ignore Node fixture IO has no types in production browser tsconfig
import {readFileSync,writeFileSync} from 'node:fs';
// @ts-ignore Node fixture IO has no types in production browser tsconfig
import {join} from 'node:path';
declare const process:{env:Record<string,string|undefined>};
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {createConfiguredPlayerCharacterController}
 from '../../player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';

type Id='A1'|'B2'|'B4';
type Foot={tick:number;foot:[number,number,number];sourceSolidId?:string;
 originalRapierSolidId?:string};
const ids:Id[]=['A1','B2','B4'],dt=1/60;
const f=(p:number[])=>new Vec3(p[0]!,p[1]!,p[2]!);
const rnd=(n:number)=>Number(n.toFixed(6));
const distance=(a:Vec3,b:Vec3)=>a.distance(b);
const xz=(a:Vec3,b:Vec3)=>Math.hypot(a.x-b.x,a.z-b.z);
const directory=process.env.T21_B494_EVIDENCE_DIR;
beforeAll(async()=>initializeRapier());
describe('B494 same original SOURCE world: three continuously integrated real-size CPU capsules',()=>{
 it.skipIf(!directory)('integrates 671 genuine native steps without re-anchoring simulated bodies',()=>{
  const read=(name:string)=>JSON.parse(readFileSync(join(directory!,name),'utf8'));
  const b=read('b454-native-b2-b4-physical-60hz.json');
  const a=read('b484-real-source-a1-foot-60hz.json');
  const topo=read('b487-real-original-16-cross-team-route-audit.json');
  const gaps=read('b488-real-original-f4-gap-authority-hold.json');
  expect(b.schema).toBe('B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1');
  expect(a.schema).toBe('B484_TRUE_NATIVE_A1_FOLLOW_THROUGH_V1');
  expect([a.source,b.source,topo.source,gaps.originalSource])
   .toEqual(Array(4).fill('25/17/26/0'));
  expect([a.firstTick,a.lastTick,a.nativeRows]).toEqual([1153,1824,672]);
  expect([a.actorInkPhysicsClockWrites,b.actorWrites,b.originalSourceGeometryWrites,
   b.nativeClockWrites,b.scoreWrites]).toEqual([0,0,0,0,0]);
  expect(a.originalCapsuleRouteCertified).toBe(false);
  expect(b.continuousCapsuleContactCertified).toBe(false);
  expect([topo.nativePathReportedPairs,topo.nativeCredibleEndpointPairs,
   gaps.currentNativeReportedPaths,gaps.currentNativeCredibleEndpointPairs])
   .toEqual([0,0,0,0]);
  expect(freeze.activationReady).toBe(false);
  expect([freeze.solids.length,freeze.paintSurfaces.length,
   freeze.navigationLinks.length]).toEqual([25,17,26]);
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(dt,stage);
  physics.step();
  const footRows:Record<Id,Foot[]>={A1:a.rows,
   B2:b.rows.B2.filter((r:Foot)=>r.tick>=1153&&r.tick<=1824),
   B4:b.rows.B4.filter((r:Foot)=>r.tick>=1153&&r.tick<=1824)};
  type Sim={foot:Vec3;body:RAPIER.RigidBody;collider:RAPIER.Collider;
   kcc:RAPIER.KinematicCharacterController;steps:number;clipped:number;
   contacts:number;cpuContacts:number;maxError:number;endError:number;
   floorSupported:number;floorMissing:number};
  const actors=new Map<Id,Sim>(),handles=new Map<number,Id>();
  for(const id of ids){
   const rows=footRows[id];
   expect(rows).toHaveLength(672);
   expect(rows[0]!.tick).toBe(1153);
   expect(rows.at(-1)!.tick).toBe(1824);
   const foot=f(rows[0]!.foot);
   const body=physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
     foot.x,foot.y+.68,foot.z));
   const collider=physics.world.createCollider(
    RAPIER.ColliderDesc.capsule(.39,.29),body);
   actors.set(id,{foot,body,collider,
    kcc:createConfiguredPlayerCharacterController(physics.world),
    steps:0,clipped:0,contacts:0,cpuContacts:0,maxError:0,
    endError:0,floorSupported:0,floorMissing:0});
   handles.set(collider.handle,id);
  }
  let minObservedB2B4=Infinity,minSimulatedB2B4=Infinity,
   observedOverlap=0,simulatedOverlap=0;
  for(let i=0;i<672;i++){
   const tick=1153+i;
   for(const id of ids){
    const s=actors.get(id)!,row=footRows[id][i]!;
    expect(row.tick).toBe(tick);
    const observed=f(row.foot);
    expect([observed.x,observed.y,observed.z].every(Number.isFinite)).toBe(true);
    const originalId=row.sourceSolidId??row.originalRapierSolidId;
    expect(stage.solids.some(x=>x.id===originalId)).toBe(true);
    const ray=physics.castStageSegment(
     new Vec3(s.foot.x,s.foot.y+.65,s.foot.z),
     new Vec3(s.foot.x,s.foot.y-.65,s.foot.z),'ink-projectile');
    if(ray&&stage.solids.some(x=>x.id===ray.solidId))
     s.floorSupported++;
    else s.floorMissing++;
    const err=distance(s.foot,observed);
    s.maxError=Math.max(s.maxError,err);
    s.endError=err;
   }
   const ob=xz(f(footRows.B2[i]!.foot),f(footRows.B4[i]!.foot));
   const si=xz(actors.get('B2')!.foot,actors.get('B4')!.foot);
   minObservedB2B4=Math.min(minObservedB2B4,ob);
   minSimulatedB2B4=Math.min(minSimulatedB2B4,si);
   if(ob<.58)observedOverlap++;
   if(si<.58)simulatedOverlap++;
   if(i===671)break;
   // Only the INITIAL foot is loaded. Subsequent sim positions are
   // accumulated KCC decisions; true native deltas are controls, not
   // instructions to teleport to the next observed destination.
   for(const id of ids){
    const s=actors.get(id)!;
    const wanted=f(footRows[id][i+1]!.foot).sub(f(footRows[id][i]!.foot));
    expect(wanted.length()).toBeLessThan(.08);
    s.kcc.computeColliderMovement(s.collider,
     {x:wanted.x,y:wanted.y,z:wanted.z},undefined,undefined,
     (other:RAPIER.Collider)=>other.handle!==s.collider.handle&&
      physics.shouldCharacterCollide(other,'HUMAN'));
    const step=s.kcc.computedMovement();
    expect([step.x,step.y,step.z].every(Number.isFinite)).toBe(true);
    if(Math.hypot(step.x-wanted.x,step.y-wanted.y,step.z-wanted.z)>.022)
     s.clipped++;
    if(s.kcc.numComputedCollisions()>0)s.contacts++;
    for(let c=0;c<s.kcc.numComputedCollisions();c++){
     const collision=s.kcc.computedCollision(c)?.collider;
     if(collision&&handles.has(collision.handle))s.cpuContacts++;
    }
    s.foot.add(new Vec3(step.x,step.y,step.z));
    s.body.setTranslation({
     x:s.foot.x,y:s.foot.y+.68,z:s.foot.z},true);
    s.steps++;
   }
   physics.step();
  }
  expect(minObservedB2B4).toBeGreaterThan(.58);
  expect(observedOverlap).toBe(0);
  const summary=Object.fromEntries(ids.map(id=>{
   const s=actors.get(id)!;
   expect(s.steps).toBe(671);
   return [id,{continuousIntegratedSteps:s.steps,
    collisionLimitedSteps:s.clipped,
    RapierKccCollisionFrames:s.contacts,dynamicCpuContactEvents:s.cpuContacts,
    supportedSimulatedFootFrames:s.floorSupported,
    missingSimulatedFootFrames:s.floorMissing,
    maxDeviationFromRealFootMeters:rnd(s.maxError),
    lastDeviationFromRealFootMeters:rnd(s.endError)}];
  }));
  const report={
   schema:'B494_TRUE_NATIVE_THREE_CPU_CONTINUOUS_SHARED_KCC_V1',
   source:'25/17/26/0',evidenceRunId:43140584988,
   nativeFirstTick:1153,nativeLastTick:1824,
   sameOriginalNativeRecordings:true,simulatedCpuIds:ids,
   recordedFramesPerCpu:672,continuousStepsPerCpu:671,
   eachFrameReanchoredToActualFoot:false,
   original25SolidRapierWorld:true,
   sharedRapierCpuCapsules:3,
   originalCpuRadiusMeters:.29,originalCpuHalfHeightMeters:.39,
   configuredPlayerKccProfileReused:true,
   minB2B4RecordedXZ:rnd(minObservedB2B4),
   minB2B4IntegratedXZ:rnd(minSimulatedB2B4),
   recordedB2B4OverlapFrames:observedOverlap,
   simulatedB2B4OverlapFrames:simulatedOverlap,
   actors:summary,
   allSevenAndHumanSimulated:false,
   original72CollisionFaceSemanticsKnown:false,
   originalGeometryNavOrScoreChanged:false,
   originalGameplayActorWrites:0,
   naturalOpposingRoutesAuthorized:0,
   formal4v4Certified:false,
   verdict:'DIAGNOSTIC_ONLY_CONTINUOUS_THREE_CPU_FORMAL_HOLD'};
  if(process.env.T21_B494_REPORT_PATH)
   writeFileSync(process.env.T21_B494_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B494_TRUE_SOURCE_CONTINUOUS_THREE_CPU_RESULT',
   JSON.stringify(report));
  for(const s of actors.values()){
   physics.world.removeCharacterController(s.kcc);
   physics.world.removeRigidBody(s.body);
  }
 });
 it.skipIf(!directory)('positive controls: identical original KCC detects real floor and another full CPU capsule',()=>{
  const raw=JSON.parse(readFileSync(join(directory!,
   'b454-native-b2-b4-physical-60hz.json'),'utf8'));
  const stage=undertowT21dConnectivityQaStage();
  const physical=new RapierStagePhysics(dt,stage);
  physical.step();
  const src=raw.rows.B2.find((r:Foot)=>r.tick===1153)!;
  const foot=f(src.foot);
  const floor=physical.castStageSegment(
   new Vec3(foot.x,foot.y+.65,foot.z),
   new Vec3(foot.x,foot.y-.65,foot.z),'ink-projectile');
  expect(floor?.solidId).toBe(
   'UndertowT21D:first-drop-landing-negative-z');
  const floorBody=physical.world.createRigidBody(
   RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    foot.x,foot.y+.68,foot.z));
  const floorCapsule=physical.world.createCollider(
   RAPIER.ColliderDesc.capsule(.39,.29),floorBody);
  const floorKcc=createConfiguredPlayerCharacterController(physical.world);
  floorKcc.computeColliderMovement(floorCapsule,{x:0,y:-.3,z:0},
   undefined,undefined,(other:RAPIER.Collider)=>
    other.handle!==floorCapsule.handle&&
    physical.shouldCharacterCollide(other,'HUMAN'));
  const floorMovement=floorKcc.computedMovement();
  const floorCollisions=Array.from({length:floorKcc.numComputedCollisions()},
   (_,i)=>floorKcc.computedCollision(i)?.collider)
   .filter((x):x is RAPIER.Collider=>!!x);
  const floorOriginalContact=floorCollisions.some(x=>
   physical.sourceSolidIdForCollider(x)===
    'UndertowT21D:first-drop-landing-negative-z');
  expect(floorOriginalContact).toBe(true);
  expect(floorMovement.y).toBeGreaterThan(-.25);
  physical.world.removeCharacterController(floorKcc);
  physical.world.removeRigidBody(floorBody);
  // Real B2/B4 shortest actual separation, NOT a claim that the
  // following deliberately forced contact occurred in the game.
  const pB2=f(raw.rows.B2.find((r:Foot)=>r.tick===1724)!.foot);
  const pB4=f(raw.rows.B4.find((r:Foot)=>r.tick===1724)!.foot);
  const actualSeparation=xz(pB2,pB4);
  expect(actualSeparation).toBeGreaterThan(.58);
  expect(actualSeparation).toBeLessThan(.65);
  const body2=physical.world.createRigidBody(
   RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    pB2.x,pB2.y+.68,pB2.z));
  const collider2=physical.world.createCollider(
   RAPIER.ColliderDesc.capsule(.39,.29),body2);
  const body4=physical.world.createRigidBody(
   RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    pB4.x,pB4.y+.68,pB4.z));
  const collider4=physical.world.createCollider(
   RAPIER.ColliderDesc.capsule(.39,.29),body4);
  const dynamicKcc=createConfiguredPlayerCharacterController(physical.world);
  const dx=(pB4.x-pB2.x)/actualSeparation*.14;
  const dz=(pB4.z-pB2.z)/actualSeparation*.14;
  dynamicKcc.computeColliderMovement(collider2,{x:dx,y:0,z:dz},
   undefined,undefined,(other:RAPIER.Collider)=>
    other.handle!==collider2.handle&&
    physical.shouldCharacterCollide(other,'HUMAN'));
  const dynamicMovement=dynamicKcc.computedMovement();
  const dynamicCollisions=Array.from(
   {length:dynamicKcc.numComputedCollisions()},
   (_,i)=>dynamicKcc.computedCollision(i)?.collider)
   .filter((x):x is RAPIER.Collider=>!!x);
  const realCpuCapsuleDetected=dynamicCollisions.some(x=>
   x.handle===collider4.handle);
  expect(realCpuCapsuleDetected).toBe(true);
  expect(Math.hypot(dynamicMovement.x,dynamicMovement.z))
   .toBeLessThan(.14-.02);
  const calibrate={
   schema:'B494_SOURCE_KCC_COLLISION_POSITIVE_CONTROLS_V1',
   source:'25/17/26/0',
   forcedDownwardProbeMeters:.3,
   originalLandingColliderDetected:floorOriginalContact,
   actualB2B4ClosestSourceTick:1724,
   actuallyRecordedPairDistanceMeters:rnd(actualSeparation),
   forcedHorizontalProbeMeters:.14,
   otherRealSizedCpuCapsuleDetected:realCpuCapsuleDetected,
   controlsWereGenuineGameplayMoves:false,
   stageColliderCountUnchanged:true,
   gameplayRouteAuthorizationGranted:false
  };
  if(process.env.T21_B494_REPORT_PATH){
   const prev=JSON.parse(readFileSync(process.env.T21_B494_REPORT_PATH,'utf8'));
   prev.sensitivityPositiveControls=calibrate;
   writeFileSync(process.env.T21_B494_REPORT_PATH,
    JSON.stringify(prev,null,2)+'\n');
  }
  console.log('B494_ORIGINAL_RAPIER_COLLISION_SENSITIVITY_PASS',
   JSON.stringify(calibrate));
  physical.world.removeCharacterController(dynamicKcc);
  physical.world.removeRigidBody(body2);
  physical.world.removeRigidBody(body4);
 });
});
