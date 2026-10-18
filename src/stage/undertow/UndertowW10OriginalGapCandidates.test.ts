import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {auditW10OriginalGapCandidates}
 from './UndertowW10OriginalGapCandidates';
describe('W10-B9 two mirrored longest gaps versus exact review-only original source',()=>{
 it('ranks only source-native real triangle meshes, without fabricating a bridge',()=>{
  const report=auditW10OriginalGapCandidates();
  expect(report.seams).toHaveLength(4);
  expect(report.originalSourceInventoryCount).toBeGreaterThan(5);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const sideSeams=report.seams.filter(x=>x.side===side);
   expect(sideSeams).toHaveLength(2);
   expect(sideSeams[0]!.seam).toBe('RIGHT_RAMP_TO_ENTRANCE');
   expect(sideSeams[1]!.seam).toBe('MID_FLOOR_TO_OUTER_SLOPE');
   expect(sideSeams[0]!.directExact3DSeparationMeters).toBeCloseTo(
    1.246508,3);
   expect(sideSeams[1]!.directExact3DSeparationMeters).toBeCloseTo(
    2.074235,3);
   for(const seam of sideSeams){
    expect(seam.originalCandidateCount).toBeGreaterThan(0);
    expect(seam.closestOriginalCandidates.length).toBeGreaterThan(0);
    expect(seam.closestOriginalCandidates.length).toBeLessThanOrEqual(8);
    // Source components already overlapping an endpoint are provenance,
    // not newly discovered independent crossing solids.
    expect(seam.strictPairwiseCandidateCount).toBe(0);
    expect(seam.independentStrictPairwiseCandidateCount).toBe(0);
    expect(seam.closestIndependentCandidates.length).toBeGreaterThan(0);
    expect(seam.closestIndependentCandidates.every(c=>
     c.independentOriginalSourceCandidate)).toBe(true);
    for(const c of seam.closestOriginalCandidates){
     expect(c.side).toBe(side);
     expect(c.originalGeometryOnly).toBe(true);
     expect(c.sourceMaterial).toMatch(/FloorConcrete|FloorSlope/);
     expect(c.distanceToUpstreamMeters).toBeGreaterThanOrEqual(0);
     expect(c.distanceToDownstreamMeters).toBeGreaterThanOrEqual(0);
     expect(c.gameplayCollisionAuthorized).toBe(false);
     expect(c.gameplayNavAuthorized).toBe(false);
     expect(c.originalActorSemanticsResolved).toBe(false);
     expect(c.proposedLinkAuthorized).toBe(false);
     expect(c.independentOriginalSourceCandidate).toBe(
      !c.overlapsKnownUpstreamSource&&!c.overlapsKnownDownstreamSource);
    }
    expect(seam.inferredPhysicalConnection).toBe(false);
    expect(seam.newNavLinks).toBe(0);
    expect(seam.newPhysicsSolids).toBe(0);
    expect(seam.productionAuthorized).toBe(false);
   }
   const entrance=sideSeams[0]!,middle=sideSeams[1]!;
   expect(entrance.knownEndpointSourceOverlapCount).toBe(0);
   expect(middle.knownEndpointSourceOverlapCount).toBe(2);
  }
  expect(report.frozenRuntimeSolidCount).toBe(25);
  expect(report.frozenRuntimePaintCount).toBe(17);
  expect(report.frozenRuntimeLinkCount).toBe(26);
  expect(report.candidateMeshRuntimePromotionCount).toBe(0);
  expect(report.fullHumanKccCrossingsReplayed).toBe(0);
  expect(report.gameplayCertified).toBe(false);
  expect(report.productionAuthorized).toBe(false);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_W10B9_ORIGINAL_GAP_CANDIDATES',JSON.stringify(report));
 });
});
