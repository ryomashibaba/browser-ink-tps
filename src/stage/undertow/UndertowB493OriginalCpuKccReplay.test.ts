import RAPIER from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {createConfiguredPlayerCharacterController} from '../../player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen} from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';

type Row={tick:number;id:string;foot:[number,number,number];mode:string;life:string;
 rejoined:boolean;registeredOriginalHit:boolean;originalRapierSolidId:string;
 originalRapierHitY:number;absFootToRapierY:number;withinUnchanged025m:boolean};
const ids=['B2','B4'] as const,dt=1/60;
const land='UndertowT21D:first-drop-landing-negative-z';
const ramp='UndertowT21D:right-low-route-ramp-negative-z';
const low='UndertowT21D:right-low-team-b';
const rounded=(n:number)=>Number(n.toFixed(6));
const dir=process.env.T21_B493_EVIDENCE_DIR;
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
describe('B493 genuine 60Hz B2/B4: original CPU-size static Rapier KCC vs Recast',()=>{
 it.skipIf(!dir)('measures 767 observed source-ground steps per actor without route authorization',()=>{
  const read=(name:string)=>JSON.parse(readFileSync(join(dir!,name),'utf8'));
  const raw=read('b454-native-b2-b4-physical-60hz.json');
  const independent=read('b454-independent-real-original-60hz-foot.json');
  const topology=read('b487-real-original-16-cross-team-route-audit.json');
  const gap=read('b488-real-original-f4-gap-authority-hold.json');
  expect(raw.schema).toBe('B454_TRUE_60HZ_B2_B4_SOURCE_STATIC_FOOT_TRACE_V1');
  expect(raw.source).toBe('25/17/26/0');
  expect(raw.browserWorldOrigin).toBe(independent.browserWorldOrigin);
  expect(raw.originalPathAuthorizationChanged).toBe(false);
  expect(raw.continuousCapsuleContactCertified).toBe(false);
  for(const n of [raw.actorWrites,raw.originalSourceGeometryWrites,
   raw.nativeClockWrites,raw.scoreWrites])expect(n).toBe(0);
  expect(topology.nativePathReportedPairs).toBe(0);
  expect(topology.nativeCredibleEndpointPairs).toBe(0);
  expect(gap.currentNativeReportedPaths).toBe(0);
  expect(gap.currentNativeCredibleEndpointPairs).toBe(0);
  expect(frozen.activationReady).toBe(false);
  expect([frozen.solids.length,frozen.paintSurfaces.length,
   frozen.navigationLinks.length]).toEqual([25,17,26]);
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(dt,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const actors:Record<string,unknown>={};
  for(const id of ids){
   const rows=raw.rows[id] as Row[];
   const witness=independent.B2B4[id];
   expect(rows).toHaveLength(768);
   expect(witness.nativeTickCount).toBe(768);
   expect(witness.missingNativeTicks).toBe(0);
   expect(witness.originalRapierRegisteredSamples).toBe(768);
   const initial=rows[0]!.foot;
   const body=physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
     initial[0],initial[1]+.68,initial[2]));
   const capsule=physics.world.createCollider(
    RAPIER.ColliderDesc.capsule(.39,.29),body);
   const kcc=createConfiguredPlayerCharacterController(physics.world);
   const allowed=(other:typeof capsule)=>other.handle!==capsule.handle&&
    physics.shouldCharacterCollide(other,'HUMAN');
   const idsFound:string[]=[];
   let supported=0,uncertain=0,projCount=0,maxProjGap=0;
   let allowedSteps=0,deniedSteps=0,maxErrXZ=0,maxErrY=0,contacts=0;
   const firstDisagreements:Array<{tick:number;errXZ:number;errY:number;solid:string}>=[];
   for(let n=0;n<rows.length;n++){
    const r=rows[n]!;
    expect(r.id).toBe(id);
    expect(r.tick).toBe(rows[0]!.tick+n);
    expect([r.mode,r.life,r.rejoined,r.registeredOriginalHit])
     .toEqual(['GROUND','ACTIVE',true,true]);
    if(idsFound.at(-1)!==r.originalRapierSolidId)
     idsFound.push(r.originalRapierSolidId);
    const p=new Vec3(...r.foot);
    const hit=physics.castStageSegment(
     new Vec3(p.x,p.y+.65,p.z),new Vec3(p.x,p.y-.65,p.z),
     'ink-projectile');
    expect(hit?.solidId).toBe(r.originalRapierSolidId);
    expect(Math.abs(hit!.point.y-r.originalRapierHitY)).toBeLessThan(.005);
    const dist=Math.abs(hit!.point.y-p.y);
    expect(Math.abs(dist-r.absFootToRapierY)).toBeLessThan(.005);
    expect(dist<=.25).toBe(r.withinUnchanged025m);
    if(dist<=.25)supported++;else uncertain++;
    const projection=nav.auditNavMeshProjection(p);
    if(projection.success&&projection.nearestPoint){
     projCount++;
     maxProjGap=Math.max(maxProjGap,
      Math.abs(projection.nearestPoint.y-hit!.point.y));
    }
    if(n===rows.length-1)continue;
    const q=rows[n+1]!.foot;
    const dx=q[0]-p.x,dy=q[1]-p.y,dz=q[2]-p.z;
    expect(Math.hypot(dx,dy,dz)).toBeLessThan(.08);
    body.setTranslation({x:p.x,y:p.y+.68,z:p.z},true);
    kcc.computeColliderMovement(capsule,{x:dx,y:dy,z:dz},
     undefined,undefined,allowed);
    const moved=kcc.computedMovement();
    const exz=Math.hypot(moved.x-dx,moved.z-dz);
    const ey=Math.abs(moved.y-dy);
    maxErrXZ=Math.max(maxErrXZ,exz);maxErrY=Math.max(maxErrY,ey);
    contacts+=kcc.numComputedCollisions()>0?1:0;
    if(exz<=.022&&ey<=.09)allowedSteps++;
    else{
     deniedSteps++;
     if(firstDisagreements.length<8)
      firstDisagreements.push({tick:r.tick,errXZ:rounded(exz),
       errY:rounded(ey),solid:r.originalRapierSolidId});
    }
   }
   expect(idsFound).toEqual([land,ramp,low]);
   expect(supported+uncertain).toBe(768);
   expect(uncertain).toBe(4);
   expect(allowedSteps+deniedSteps).toBe(767);
   actors[id]={actualSourceFootSupportTicks:768,
    originalSolidSequence:idsFound,strict025mFrames:supported,
    rampStaticGapExcessFrames:uncertain,
    recastNearestPointSamples:projCount,
    maxRecastProjectionYVsRapierFloor:rounded(maxProjGap),
    individuallyReplayedSourceKccSteps:767,
    KccWithinCurrentXYTolerance:allowedSteps,
    KccOutsideCurrentXYTolerance:deniedSteps,
    KccStaticCollisionSteps:contacts,
    maxHorizontalKccError:rounded(maxErrXZ),
    maxVerticalKccError:rounded(maxErrY),
    firstDisagreements,fullNativeSevenCpuRouteCertified:false};
   physics.world.removeCharacterController(kcc);
   physics.world.removeRigidBody(body);
  }
  const report={schema:'B493_PINNED_REAL_60HZ_CPU_STATIC_KCC_REPLAY_V1',
   source:'25/17/26/0',evidenceRunId:43140584988,
   originalSourceBrowserWorld:raw.browserWorldOrigin,
   realCpuCapsuleRadiusMeters:.29,realCpuCapsuleHalfHeightMeters:.39,
   productionKccProfileReused:true,stageOnlyReconstruction:true,
   perFrameReseededFromActualReadOnlyFoot:true,
   actorWritesToRealGame:0,sourceGeometryWrites:0,
   realGameClockWrites:0,realGameInkWrites:0,
   originalOpponentRoutesAuthorized:0,officialScoreable:0,
   allSevenActorsSimultaneouslyVerified:false,
   original72CollisionSemanticsCertified:false,
   verdict:'DIAGNOSTIC_ONLY_NOT_A_CONTINUOUS_GAMEPLAY_ROUTE',
   actors};
  if(process.env.T21_B493_REPORT_PATH)
   writeFileSync(process.env.T21_B493_REPORT_PATH,
    JSON.stringify(report,null,2)+'\n');
  console.log('B493_ORIGINAL_CPU_KCC_RECAST_READONLY',JSON.stringify(report));
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
 });
});
