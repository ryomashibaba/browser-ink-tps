import {describe,expect,it} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {auditW10Batch2GapCandidates} from './UndertowW10Batch2GapCandidates';
describe('W10-B10 original Batch2 exact floor candidate and actor HOLD audit',()=>{
 it('separates reviewed static source from PntSet actor placement unknown',()=>{
  const report=auditW10Batch2GapCandidates();
  expect(report.batch2OriginalCandidateCount).toBe(14);
  expect(report.staticSourceCount).toBe(6);
  expect(report.actorPlacementUnresolvedCount).toBe(8);
  expect(report.previousB9SourceCount).toBe(40);
  expect(report.gaps).toHaveLength(4);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const gaps=report.gaps.filter(x=>x.side===side);
   expect(gaps).toHaveLength(2);
   expect(gaps[0]!.originalDirectSeparationMeters)
    .toBeCloseTo(1.246508,3);
   expect(gaps[1]!.originalDirectSeparationMeters)
    .toBeCloseTo(2.074235,3);
   for(const gap of gaps){
    expect(gap.b9SourceCandidatesInspectedPerSide).toBe(20);
    expect(gap.b9IndependentStrictPairwiseCount).toBe(0);
    expect(gap.additionalCandidateCount).toBe(7);
    expect(gap.staticCandidates).toBe(3);
    expect(gap.actorPlacementUnresolvedCandidates).toBe(4);
    expect(gap.nearestStatic).toHaveLength(3);
    expect(gap.nearestActorUnresolved).toHaveLength(4);
    // All 14 separately sourced meshes were screened against the two
    // original seams. None individually touches both faces within 30cm.
    // Retain a HOLD instead of inventing a runtime bridge.
    expect(gap.geometricPairwiseCandidates).toBe(0);
    for(const record of [
     ...gap.nearestStatic,...gap.nearestActorUnresolved]){
     expect(record.side).toBe(side);
     expect(record.sourceTriangleCount).toBeGreaterThan(0);
     expect(record.minimaxDistanceMeters).toBeGreaterThanOrEqual(0);
     expect(Number.isFinite(record.minimaxDistanceMeters)).toBe(true);
     expect(record.canPromoteWithoutActorProof).toBe(false);
     expect(record.originalRuntimeColliderAuthorized).toBe(false);
     expect(record.nativeNavPathCertified).toBe(false);
     expect(record.future4v4EngagementAuthorized).toBe(false);
    }
    expect(gap.nearestStatic.every(x=>
     x.placementAuthority==='STATIC_MODEL_SOURCE')).toBe(true);
    expect(gap.nearestActorUnresolved.every(x=>
     x.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED')).toBe(true);
    expect(gap.crossingCanBeEnabled).toBe(false);
    // Distinguish known static floors from model objects whose SetActor
    // enablement or placement is UNRESOLVED. Neither grants collision.
    expect(gap.nearestStatic[0]!.minimaxDistanceMeters).toBeGreaterThan(5);
    expect(gap.nearestActorUnresolved[0]!.placementAuthority)
     .toBe('SET_ACTOR_PLACEMENT_UNRESOLVED');
    expect(gap.newRuntimeSolids).toBe(0);
    expect(gap.newNavLinks).toBe(0);
   }
   // The mirrored candidate family has equal original geometry with tiny
   // translation-rounding differences. These are NO new playable crossings.
   if(side==='POSITIVE_Z'){
    const entrance=gaps[0]!.nearestActorUnresolved[0]!;
    expect(entrance.distanceToUpstreamMeters).toBeCloseTo(3.595057,3);
    expect(entrance.distanceToDownstreamMeters).toBeCloseTo(2.852454,3);
    const intermediate=gaps[1]!.nearestActorUnresolved[0]!;
    expect(intermediate.distanceToUpstreamMeters).toBeCloseTo(.12,3);
    expect(intermediate.distanceToDownstreamMeters).toBeCloseTo(20.480614,3);
   }
  }
  expect(report.approvedOriginalGeometryConnections).toBe(0);
  expect(report.crossTeamContactCertified).toBe(false);
  expect(report.originalActorPlacementConfirmed).toBe(false);
  expect(report.productionAuthorized).toBe(false);
  expect(report.activationReady).toBe(false);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_W10B10_ORIGINAL_BATCH2_GAP_EVIDENCE',JSON.stringify(report));
 });
});
