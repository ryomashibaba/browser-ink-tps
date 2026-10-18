import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {auditW10SourceSeamSection} from './UndertowW10SourceSeamSectionAudit';

beforeAll(async()=>{await Promise.all([
 initializeRapier(),initializeRecastNavigation()
]);});
describe('W10-B6 original-only source support sections, no invented bridge',()=>{
 it('audits both frozen mirrored Native Recast seams on three observed levels',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const solids=new Set(stage.solids.map(s=>s.id));
  const probes=UNDERTOW_T21D_CONNECTIVITY_PROBES.filter(p=>
   p.id.startsWith('right-low-to-underpass-'));
  expect(probes).toHaveLength(2);
  const results=probes.map(p=>{
   expect(p.expectation).toBe('DIAGNOSTIC_GAP');
   const audit=auditW10SourceSeamSection(
    physics,nav,p.from,p.to,solids);
   expect(audit.planarDirectDistanceMeters).toBeGreaterThan(20);
   expect(audit.bands).toHaveLength(3);
   expect(audit.sourceGraphReference.walkableNodesPerSide).toBe(276);
   expect(audit.sourceGraphReference.localGapsPerSide).toBe(4);
   expect(audit.sourceGraphReference.strictOrdinaryBridges).toBe(0);
   expect(audit.sourceGraphReference.offMeshLinkAuthorized).toBe(false);
   for(const band of audit.bands){
    expect(band.totalSampleCount).toBeGreaterThan(70);
    expect(band.supportedSampleCount+band.unsupportedSampleCount)
     .toBe(band.totalSampleCount);
    expect(band.contiguousSpans.length).toBeGreaterThan(0);
    // W10-B6 actual source measurement: no pre-existing direct bridge at
    // these three diagnostic heights. Reject accidental invented support.
    // A future authoritative original route must be evidenced separately.
    expect(band.unsupportedSampleCount/band.totalSampleCount).toBeGreaterThan(.90);
    expect(band.contiguousSpans.some(span=>
     !span.supported&&span.toMeters-span.fromMeters>20)).toBe(true);
    expect(band.contiguousSpans[0]!.fromMeters).toBe(0);
    expect(band.contiguousSpans.at(-1)!.toMeters)
     .toBeCloseTo(audit.planarDirectDistanceMeters,6);
    for(const span of band.contiguousSpans){
     expect(span.fromMeters).toBeLessThanOrEqual(span.toMeters);
     if(span.supported)expect(solids.has(span.originalSolidId!)).toBe(true);
     else expect(span.originalSolidId).toBeNull();
    }
    expect(band.originalSourceOnly).toBe(true);
    expect(band.routeCertified).toBe(false);
   }
   // SOURCE contact at both terminal levels does not connect the interior.
   expect(audit.bands[0]!.supportedSampleCount).toBeGreaterThan(0);
   expect(audit.bands[1]!.supportedSampleCount).toBeGreaterThan(0);
   expect(audit.bands.some(b=>b.unsupportedSampleCount>0)).toBe(true);
   expect(audit.mirroredFrontierReachable).toBe(false);
   expect(audit.inferredBridgeCount).toBe(0);
   expect(audit.authoredNewFloorCount).toBe(0);
   expect(audit.authoredNewLinkCount).toBe(0);
   expect(audit.productionAuthorized).toBe(false);
   return {id:p.id,start:audit.sourceEndpointA,end:audit.sourceEndpointB,
    directPlanarMeters:audit.planarDirectDistanceMeters,
    sourceGraph:audit.sourceGraphReference,bands:audit.bands,
    geometryPromoted:false,playableCrossingCertified:false};
  });
  console.log('T21_W10B6_SOURCE_SECTION_AUDIT',JSON.stringify(results));
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
