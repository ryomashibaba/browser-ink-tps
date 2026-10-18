import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {auditW10SourceSeamContact} from './UndertowW10SourceSeamContactAudit';

beforeAll(async()=>{await initializeRapier();});
describe('W10-B8 original face adjacency and isolated Human KCC',()=>{
 it('does not invent a link at any of the five bilateral source seams',()=>{
  const x=auditW10SourceSeamContact();
  expect(x.sourcePairs).toHaveLength(10);
  expect(x.slopeWitnesses).toHaveLength(2);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const pairs=x.sourcePairs.filter(p=>p.side===side);
   expect(pairs).toHaveLength(5);
   expect(pairs[0]!.upstreamId).toContain('right-low-route-ramp');
   expect(pairs[0]!.downstreamId).toContain('underpass-route-slope01');
   for(const p of pairs){
    expect(p.exactSourceFaceGapMeters).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(p.exactSourceFaceGapMeters)).toBe(true);
    expect(p.actorTraversalProven).toBe(false);
   }
   const witness=x.slopeWitnesses.find(w=>w.side===side)!;
   expect(witness.interiorSamples).toBe(17);
   expect(witness.candidateOnlyPhysicsWorld).toBe(true);
   expect(witness.kccStepsAttempted).toBe(16);
   expect(witness.kccBlockedSteps).toBeLessThanOrEqual(16);
   expect(witness.isolatedCandidateHitSamples).toBeGreaterThan(0);
   expect(witness.isolatedCandidateSupportedSamples)
    .toBeGreaterThanOrEqual(witness.isolatedCandidateHitSamples);
   expect(witness.fullRouteReplayed).toBe(false);
   expect(witness.originalCollisionAuthorityAuthorized).toBe(false);
   expect(witness.productionAuthorized).toBe(false);
  }
  for(let i=0;i<5;i++){
   const a=x.sourcePairs[i]!,b=x.sourcePairs[i+5]!;
   // Both source meshes were transformed with the SAME frozen source
   // registration. The 180-degree twin ramp was rounded to 6 decimals.
   expect(a.exactSourceFaceGapMeters).toBeCloseTo(
    b.exactSourceFaceGapMeters,3);
  }
  expect(x.addedProductionSolids).toBe(0);
  expect(x.addedProductionNavLinks).toBe(0);
  expect(x.approvedNewRouteCount).toBe(0);
  expect(x.productionAuthorized).toBe(false);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_W10B8_ORIGINAL_SOURCE_SEAM_CONTACT',JSON.stringify(x));
 });
});
