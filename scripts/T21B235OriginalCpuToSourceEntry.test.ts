/**
 * B235: actually measured F3 PLAYING native seven CPU feet captured by
 * B234 real Chromium #40314156481, frame 1057. Recast + Rapier
 * queries occur live in Vitest on exact frozen-25 vs source QA-30 stages.
 * THIS IS A REPLAY OF ACTUAL MEASURED FOOT COORDINATES, NOT seven live
 * autonomous CPU agents executing a path in this test.
 */
import {beforeAll,describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {PerformanceStats} from '../src/core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../src/navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics}
 from '../src/physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS as PROFILE}
 from '../src/player/PlayerCharacterPhysics';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {B235_QA_PREFIX,b235ExactSourceSideQaStage,
 b235AssertIsolatedSourceStage,type B235Side}
 from '../src/stage/undertow/B235ExactOriginalSourceEntryQa';
import {undertowTemple01ModelXZToProjectXZ}
 from '../src/stage/undertow/UndertowSpillwayModelXZGeometry';
import type {StageDefinition,StageVector3} from '../src/stage/StageDefinition';

type RealCpu=Readonly<{id:string;side:B235Side;
 foot:readonly [number,number,number];
 originalRegisteredSupportId:string}>;
/** Exact B234 PLAYING frame 1057 F3 browser sample, with actual KCC feet. */
const B234_NATIVE_CROWD_CPU_MEASUREMENTS:readonly RealCpu[]=[
 {id:'A1',side:'POSITIVE_Z',foot:[4.209049224853516,3.2439024448394775,53.43796157836914],
  originalRegisteredSupportId:'UndertowT21D:right-low-route-ramp-positive-z'},
 {id:'A2',side:'POSITIVE_Z',foot:[3.6576528549194336,3.0999999046325684,54.53781509399414],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-positive-z'},
 {id:'A3',side:'POSITIVE_Z',foot:[3.5986366271972656,3.1354997158050537,53.451168060302734],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-positive-z'},
 {id:'B1',side:'NEGATIVE_Z',foot:[1.5043108463287354,3.0999999046325684,-52.59242630004883],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-negative-z'},
 {id:'B2',side:'NEGATIVE_Z',foot:[2.7247390747070312,3.0999999046325684,-53.8424186706543],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-negative-z'},
 {id:'B3',side:'NEGATIVE_Z',foot:[0.9809051156044006,3.0999999046325684,-53.442989349365234],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-negative-z'},
 {id:'B4',side:'NEGATIVE_Z',foot:[0.8728739619255066,3.0999999046325684,-52.796791076660156],
  originalRegisteredSupportId:'UndertowT21D:first-drop-landing-negative-z'}
];
function project(x:number,y:number,z:number,side:B235Side):StageVector3{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
}
const vec=(p:readonly[number,number,number])=>new Vec3(p[0],p[1],p[2]);
const anchor=(side:B235Side)=>project(-6,3,21.9,side);
function physicalFoot(physics:RapierStagePhysics,foot:readonly[number,number,number]){
 const body=vec([foot[0],
  foot[1]+PROFILE.humanFootOffsetMeters+.06,foot[2]]);
 const hit=physics.castCharacterFootSupport(body,
  PROFILE.humanFootOffsetMeters,'HUMAN');
 return {id:hit?.solidId??null,
  measuredGroundHeight:hit?.point.y??null,
  mismatch:hit?Math.abs(hit.point.y-foot[1]):null};
}
beforeAll(async()=>{await initializeRapier();await initializeRecastNavigation();});
describe('B235 native original CPU genuine grounded positions versus source entry in 25 / 30 stage',()=>{
 it('checks 7 measured REAL native F3 CPU start feet to source entry without an offmesh bridge',()=>{
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
  const results=[];
  const base=new RecastStageNavigation({
   metadata:{id:'b235-original25-baseline',displayName:'B235 frozen25',
    worldBounds:FROZEN.worldBounds,teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
    teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
    tacticalNodes:[],splatZones:[]},
   solids:FROZEN.solids,paintSurfaces:FROZEN.paintSurfaces,
   navigationLinks:FROZEN.navigationLinks
  },new PerformanceStats());
  const baselinePhysics=new RapierStagePhysics(1/60,{
   metadata:{id:'b235-frozen25-source',displayName:'B235 original25',
    worldBounds:FROZEN.worldBounds,teamASpawn:[0,0,0],
    teamBSpawn:[0,0,0],teamASpawnSlots:[[0,0,0]],
    teamBSpawnSlots:[[0,0,0]],tacticalNodes:[],splatZones:[]},
   solids:FROZEN.solids,paintSurfaces:FROZEN.paintSurfaces,
   navigationLinks:FROZEN.navigationLinks
  });
  baselinePhysics.step();
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const stage=b235ExactSourceSideQaStage(side);
   b235AssertIsolatedSourceStage(stage,side);
   const nav=new RecastStageNavigation(stage,new PerformanceStats());
   const rapier=new RapierStagePhysics(1/60,stage);rapier.step();
   const entry=anchor(side),baseline=physicalFoot(baselinePhysics,entry);
   const added=physicalFoot(rapier,entry);
   const originalEntryNav=base.auditNavMeshProjection(vec(entry));
   const qaEntryNav=nav.auditNavMeshProjection(vec(entry));
   const cpu=[];
   for(const bot of B234_NATIVE_CROWD_CPU_MEASUREMENTS.filter(b=>b.side===side)){
    const foot=vec(bot.foot);
    const b25Floor=physicalFoot(baselinePhysics,bot.foot);
    const b30Floor=physicalFoot(rapier,bot.foot);
    const fromBaseline=base.auditNavMeshProjection(foot);
    const fromQa=nav.auditNavMeshProjection(foot);
    const originalRoute=base.auditPath(foot,vec(entry),.30);
    const qaRoute=nav.auditPath(foot,vec(entry),.30);
    cpu.push({id:bot.id,
     browserSample:'B234_PLAYING_FRAME_1057_TRUE_CPU_FOOT',
     foot:bot.foot,originalRegisteredSupportId:bot.originalRegisteredSupportId,
     actual25Foot:b25Floor,qa30Foot:b30Floor,
     originalNavStart:fromBaseline,qaNavStart:fromQa,
     baseline25:{querySuccess:originalRoute.querySuccess,
      reachedTarget:originalRoute.reachedTarget,
      endpointErrorMeters:originalRoute.endpointErrorMeters,
      startSnapDistanceMeters:originalRoute.startSnapDistanceMeters,
      endSnapDistanceMeters:originalRoute.endSnapDistanceMeters,
      points:originalRoute.pointCount},
     added30:{querySuccess:qaRoute.querySuccess,
      reachedTarget:qaRoute.reachedTarget,
      endpointErrorMeters:qaRoute.endpointErrorMeters,
      startSnapDistanceMeters:qaRoute.startSnapDistanceMeters,
      endSnapDistanceMeters:qaRoute.endSnapDistanceMeters,
      points:qaRoute.pointCount},
     trueGapPhysicalJumpNotTestedHere:true,originalCpuDidNotTraversePath:true
    });
   }
   results.push({side,
    stageSolids:stage.solids.length,
    exactOriginalExtraFaces:stage.solids.slice(25).map(s=>s.id),
    addedScoreable:0,addedOffmesh:0,productionStageModified:false,
    originalEntryPhysical25:baseline,sourceEntryPhysical30:added,
    entryProjection25:originalEntryNav,entryProjection30:qaEntryNav,
    actualRealCpuStarts:cpu,
    originalSourceFaceWalkLinkToOuterSlopeAuthenticated:false,
    originalOpponentRoutesCertified:'0/12',officialWinner:'NONE'});
  }
  console.log('B235_MEASURED_REAL_7_CPU_TO_EXACT_ORIGINAL_SOURCE_ENTRY_NATIVE_ACCESS',
   JSON.stringify({result:results,sampleOrigin:
     'ACTUAL_B234_REAL_F3_CHROME_PLAYING_FRAME_1057_ACTIONS_RUN_40314156481',
    nativeRecastAndRapierQueriesInThisVitest:true,
    actorsAutonomouslyWalkingHere:false,
    productionAuthorized:false}));
  expect(results).toHaveLength(2);
  expect(results.flatMap(x=>x.actualRealCpuStarts)).toHaveLength(7);
  for(const row of results){
   expect(row.stageSolids).toBe(30);
   expect(row.exactOriginalExtraFaces).toHaveLength(5);
   expect(row.sourceEntryPhysical30.id).toBe(
    B235_QA_PREFIX+'underpass-route-floor-concrete01-'+
    (row.side==='POSITIVE_Z'?'positive-z':'negative-z'));
   expect(row.originalEntryPhysical25.id).toBeNull();
   expect(row.entryProjection25.success).toBe(false);
   expect(row.entryProjection30.success).toBe(true);
   for(const cpu of row.actualRealCpuStarts){
    expect(cpu.actual25Foot.id).toBe(cpu.originalRegisteredSupportId);
    expect(cpu.qa30Foot.id).toBe(cpu.originalRegisteredSupportId);
    expect(cpu.originalNavStart.success).toBe(true);
    expect(cpu.qaNavStart.success).toBe(true);
    expect(cpu.originalCpuDidNotTraversePath).toBe(true);
   }
  }
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(FROZEN.activationReady).toBe(false);
 },120000);
 it('rejects side-source forgery and production promotion',()=>{
  const q=b235ExactSourceSideQaStage('POSITIVE_Z');
  const stage={...q,solids:[...q.solids]};
  stage.solids[26]={...stage.solids[26]!,navigationEnabled:false};
  expect(()=>b235AssertIsolatedSourceStage(stage,'POSITIVE_Z'))
   .toThrow('B235_FORGED_OR_UNTRUSTED_CI688_NAV_COLLIDER');
  expect(()=>b235AssertIsolatedSourceStage({...q,
   metadata:{...q.metadata,id:'undertow-t21d-partial-connectivity-qa'}},
   'POSITIVE_Z')).toThrow('B235_SOURCE_QA_25_17_26_FROZEN_AUTHORITY_VIOLATION');
  expect(()=>b235AssertIsolatedSourceStage(q,'NEGATIVE_Z'))
   .toThrow('B235_SOURCE_QA_25_17_26_FROZEN_AUTHORITY_VIOLATION');
 });
});
