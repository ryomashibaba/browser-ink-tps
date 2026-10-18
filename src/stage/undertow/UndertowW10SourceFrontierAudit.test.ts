import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {auditW10SourceFrontierPair} from './UndertowW10SourceFrontierAudit';

beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});

describe('W10-B5 original-source bilateral Nav/KCC frontier, read-only',()=>{
 it('diagnoses BOTH mirrored unbound underpasses without inferring a bridge',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const gaps=UNDERTOW_T21D_CONNECTIVITY_PROBES.filter(
   x=>x.id.startsWith('right-low-to-underpass-'));
  expect(gaps).toHaveLength(2);
  const results=gaps.map(g=>{
   expect(g.expectation).toBe('DIAGNOSTIC_GAP');
   const x=auditW10SourceFrontierPair(physics,nav,g.from,g.to);
   expect(x.forward.hold).toBe('HOLD_NO_NATIVE_RECAST_PATH');
   expect(x.anyDirectionUnreached).toBe(true);
   expect(x.forward.nativePathReached).toBe(false);
   expect(x.forward.nativeTerminal?.rapierSupported).toBe(true);
   expect(x.nativeTerminalSeparationMeters).not.toBeNull();
   expect(x.nativeTerminalSeparationMeters!).toBeGreaterThanOrEqual(0);
   expect(x.firstChordUnsupportedFromStartMeters).not.toBeNull();
   expect(x.firstChordUnsupportedFromEndMeters).not.toBeNull();
   for(const witness of [x.forwardTerminalKcc,x.reverseTerminalKcc]){
    expect(witness.lastNativeLegOnly).toBe(true);
    expect(witness.sampleCount).toBe(
     witness.supportedSampleCount+witness.unsupportedSampleCount);
    expect(witness.kccStepsAttempted).toBeLessThanOrEqual(
     Math.max(0,witness.sampleCount-1));
    expect(witness.kccBlockedSteps).toBeLessThanOrEqual(
     witness.kccStepsAttempted);
    expect(witness.fullNativeTrajectoryReplayed).toBe(false);
    expect(witness.certifiedTraversable).toBe(false);
   }
   expect(x.originalDirectionalityProven).toBe(false);
   expect(x.originalFloorGapRepairAuthorized).toBe(false);
   expect(x.navLinkAuthorized).toBe(false);
   expect(x.scoreablePromotionAuthorized).toBe(false);
   expect(x.fullGameplayCertified).toBe(false);
   expect(x.productionAuthorized).toBe(false);
   return {id:g.id,forwardHold:x.forward.hold,
    reverseHold:x.reverse.hold,forwardReach:x.forward.nativePathReached,
    reverseReach:x.reverse.nativePathReached,
    forwardTerminal:x.forward.nativeTerminal,
    reverseTerminal:x.reverse.nativeTerminal,
    nativeTerminalSeparationMeters:x.nativeTerminalSeparationMeters,
    firstSourceGapMetersFromStart:x.firstChordUnsupportedFromStartMeters,
    firstSourceGapMetersFromEnd:x.firstChordUnsupportedFromEndMeters,
    forwardTerminalKcc:x.forwardTerminalKcc,
    reverseTerminalKcc:x.reverseTerminalKcc,
    sourceCertified:false,productionAuthorized:false};
  });
  console.log('T21_W10B5_SOURCE_FRONTIER_PAIR',JSON.stringify({
   results,originalLocalFatalTracesReplayed:0,
   fullKccRouteReplays:0,stageSolidsAdded:0,navLinksAdded:0,
   scoreablePromotions:0,productionAuthorized:false
  }));
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
});
