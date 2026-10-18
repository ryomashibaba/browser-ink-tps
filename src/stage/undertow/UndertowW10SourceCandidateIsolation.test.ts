import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRecastNavigation} from '../../navigation/RecastStageNavigation';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {auditW10CandidateNavIsolation} from './UndertowW10SourceCandidateIsolation';

beforeAll(async()=>{await initializeRecastNavigation();});
describe('W10-B7: isolated original source candidate ablations, no route promotion',()=>{
 it('distinguishes each of five exact original floor/slope components per side',()=>{
  const result=auditW10CandidateNavIsolation();
  expect(result.snapshots).toHaveLength(22);
  expect(result.componentNavRepresentatives).toHaveLength(10);
  expect(result.allCandidatesNavOnly).toBe(true);
  expect(result.originalLocalKccTracesReplayed).toBe(0);
  expect(result.archivedFiveEachSideDidNotConnect).toBe(true);
  expect(result.productionAuthorized).toBe(false);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const records=result.snapshots.filter(x=>x.side===side);
   expect(records).toHaveLength(11);
   expect(records.filter(x=>x.kind==='BASELINE')).toHaveLength(1);
   expect(records.filter(x=>x.kind==='PREFIX')).toHaveLength(5);
   expect(records.filter(x=>x.kind==='ISOLATED')).toHaveLength(5);
   expect(records.filter(x=>x.kind==='ISOLATED')
    .map(x=>x.sourceComponentIds[0])).toEqual(
     records.filter(x=>x.kind==='PREFIX'&&x.prefixCount===5)[0]!
      .sourceComponentIds);
   expect(records.find(x=>x.kind==='PREFIX'&&x.prefixCount===5)!
    .navOnlyAdditionalSolids).toBe(5);
   for(const x of records){
    expect(x.querySuccess).toBe(true);
    expect(x.nativePathPointCount).toBeGreaterThan(0);
    expect(x.sourceComponentIds).toHaveLength(x.prefixCount);
    expect(x.nativeTerminal).not.toBeNull();
    expect(x.nativeTerminalDistanceToTargetMeters).not.toBeNull();
    expect(x.nativeTerminalDistanceToTargetMeters!).toBeGreaterThanOrEqual(0);
    expect(x.unchangedProductionRoutes).toBe(true);
    expect(x.kccTraversabilityCertified).toBe(false);
    expect(x.sourcePromoted).toBe(false);
    expect(x.productionAuthorized).toBe(false);
   }
   const witnesses=result.componentNavRepresentatives.filter(x=>x.side===side);
   expect(witnesses).toHaveLength(5);
   expect(witnesses.map(x=>x.sourceId)).toEqual(
    records.find(x=>x.kind==='PREFIX'&&x.prefixCount===5)!
     .sourceComponentIds);
   const entrance=witnesses.find(w=>
    w.sourceId==='underpass-route-slope01-'+
     (side==='POSITIVE_Z'?'positive-z':'negative-z'));
   expect(entrance).toBeDefined();
   expect(entrance!.firstSlopeEdgeWidthMeters).not.toBeNull();
   expect(entrance!.firstSlopeEdgeWidthMeters!).toBeGreaterThan(.50);
   expect(entrance!.firstSlopeEdgeWidthMeters!).toBeLessThan(.54);
   expect(entrance!.humanCapsuleDiameterMeters).toBeCloseTo(.64,6);
   expect(entrance!.nominalRecastErosionDiameterMeters).toBeCloseTo(.72,6);
   expect(entrance!.isolatedFirstSlopeNarrowerThanBoth).toBe(true);
   expect(entrance!.nearestRecastSnapMeters).toBeGreaterThan(1.0);
   for(const witness of witnesses){
    if(witness!==entrance){
     expect(witness.firstSlopeEdgeWidthMeters).toBeNull();
     expect(witness.nearbyNativeNavRepresentative).toBe(true);
    }
    expect(witness.nearestRecastSnapMeters).toBeGreaterThanOrEqual(0);
    expect(witness.physicalHumanKccValidated).toBe(false);
    expect(witness.originalGameTravelDirectionProven).toBe(false);
    expect(witness.sourcePromoted).toBe(false);
   }
   const baseline=records.find(x=>x.kind==='BASELINE')!;
   expect(baseline.nativePathReached).toBe(false);
   expect(baseline.nativeEndpointErrorMeters).toBeGreaterThan(20);
   const full=records.find(x=>x.kind==='PREFIX'&&x.prefixCount===5)!;
   // Archived CI #691's all-five experiment did not repair this seam.
   // If this differs, fail and investigate before gameplay promotion.
   expect(full.nativePathReached).toBe(false);
  }
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  const useful=result.snapshots.map(x=>({
   side:x.side,kind:x.kind,
   source:x.sourceComponentIds,
   graph:x.sourceGraphComponentIds,
   nativePathReached:x.nativePathReached,
   waypointCount:x.nativePathPointCount,
   endpointErrorMeters:x.nativeEndpointErrorMeters,
   terminal:x.nativeTerminal,
   remainingDistanceMeters:x.nativeTerminalDistanceToTargetMeters
  }));
  console.log('T21_W10B7_SOURCE_COMPONENT_ABLATION',JSON.stringify({
   snapshots:useful,candidateNavRepresentatives:
    result.componentNavRepresentatives,
   stageFrozen:true,rawOriginalObjNotUsed:true,
   candidateRuntimeCollisionEnabled:false,
   authoredNewNavLinks:0,sourcePromoted:false,
   productionAuthorized:false
  }));
 });
});
