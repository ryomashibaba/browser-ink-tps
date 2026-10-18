import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage,
 UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {undertowTemple01ModelXZToProjectXZ}
 from './UndertowSpillwayModelXZGeometry';
import {auditW10SourceTransition} from './UndertowW10SourceTransitionAudit';

const INTERIORS=[
 {id:'SPAWN_POSITIVE',from:[-22,59] as const,to:[-22,61] as const,
  y:7.5,solid:'UndertowT21D:spawn-high-positive-z'},
 {id:'SPAWN_NEGATIVE',from:[22,-59] as const,to:[22,-61] as const,
  y:7.5,solid:'UndertowT21D:spawn-high-negative-z'},
 {id:'LANDING_POSITIVE',from:[-22.5,43] as const,
  to:[-22.5,45] as const,
  y:3,solid:'UndertowT21D:first-drop-landing-positive-z'},
 {id:'LANDING_NEGATIVE',from:[22.5,-43] as const,
  to:[22.5,-45] as const,
  y:3,solid:'UndertowT21D:first-drop-landing-negative-z'}
] as const;
const toProject=(model:readonly [number,number],y:number)=>{
 const [x,z]=undertowTemple01ModelXZToProjectXZ(model);
 return [x,y,z] as [number,number,number];
};
beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});

describe('W10-A original-source floor/Nav triage: never promotes safety',()=>{
 it('classifies four existing W4 source floor interiors without authoring new ground',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const results=INTERIORS.map(route=>{
   const evidence=auditW10SourceTransition(
    physics,nav,toProject(route.from,route.y),toProject(route.to,route.y));
   expect(evidence.from.solidId).toBe(route.solid);
   expect(evidence.to.solidId).toBe(route.solid);
   expect(evidence.from.raySupported).toBe(true);
   expect(evidence.to.raySupported).toBe(true);
   expect(evidence.hold).not.toBe('HOLD_NO_RAPIER_ENDPOINT_SUPPORT');
   expect(evidence.chord.straightChordOnly).toBe(true);
   expect(evidence.chord.interiorRayProbes).toBeGreaterThan(0);
   expect(evidence.chord.sourceGapSamples).toBe(0);
   expect(evidence.chord.kccSweepAttempted).toBe(true);
   expect(evidence.chord.kccStepsAttempted).toBeGreaterThan(0);
   expect(evidence.chord.fullTrajectoryReplayed).toBe(false);
   expect(evidence.chord.sourceCertified).toBe(false);
   expect(evidence.nativeRoute.nativePolylineOnly).toBe(true);
   expect(evidence.nativeRoute.sourceCertified).toBe(false);
   expect(evidence.nativeRoute.fullTrajectoryReplayed).toBe(false);
   if(evidence.nativePathReached){
    expect(evidence.nativeRoute.evaluated).toBe(true);
    expect(evidence.nativeRoute.rapierSamples).toBeGreaterThan(0);
   }
   expect(evidence.kccCertified).toBe(false);
   expect(evidence.productionAuthorized).toBe(false);
   return {id:route.id,hold:evidence.hold,chord:evidence.chord,
    nativeRoute:evidence.nativeRoute,
    nativePathReached:evidence.nativePathReached,
    fromSolid:evidence.from.solidId,toSolid:evidence.to.solidId};
  });
  console.log('T21_W10A_ORIGINAL_SOURCE_INTERIORS',JSON.stringify(results));
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(stage.solids.length).toBe(25);
  expect(stage.paintSurfaces.length).toBe(17);
  expect(stage.navigationLinks?.length).toBe(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
 it('records both existing underpass diagnostic gaps without claiming physical certification',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const gaps=UNDERTOW_T21D_CONNECTIVITY_PROBES
   .filter(p=>p.id.startsWith('right-low-to-underpass-'));
  expect(gaps).toHaveLength(2);
  const record=gaps.map(g=>{
   expect(g.expectation).toBe('DIAGNOSTIC_GAP');
   const result=auditW10SourceTransition(physics,nav,g.from,g.to);
   expect(result.kccCertified).toBe(false);
   expect(result.chord.sourceCertified).toBe(false);
   expect(result.chord.fullTrajectoryReplayed).toBe(false);
   expect(result.nativeRoute.sourceCertified).toBe(false);
   expect(result.nativeRoute.fullTrajectoryReplayed).toBe(false);
   expect(result.sourcePromoted).toBe(false);
   expect(result.productionAuthorized).toBe(false);
   return {id:g.id,hold:result.hold,chord:result.chord,
    nativeRoute:result.nativeRoute,
    nativePathReached:result.nativePathReached,
    fromSolid:result.from.solidId,toSolid:result.to.solidId};
  });
  console.log('T21_W10A_UNBOUND_UNDERPASS_GAPS',JSON.stringify({
   record,historicalFatalTracesReplayed:0,
   historicalFloorHoleCrossingsReplayed:0,
   originalLocalSourceAvailableInPublicCI:false,
   sourceCertified:false,productionAuthorized:false
  }));
 });
});
