import { beforeAll, describe, expect, it } from 'vitest';
import { initializeRapier, RapierStagePhysics } from '../../physics/RapierStagePhysics';
import { initializeRecastNavigation, RecastStageNavigation } from '../../navigation/RecastStageNavigation';
import { PerformanceStats } from '../../core/PerformanceStats';
import { GameplayInkSystem } from '../../ink/GameplayInkSystem';
import { PaintEventType, PaintSource, Team } from '../../ink/types';
import { defineTestSurfaces, stagePhysicallyBackedPaintSurfaceIds }
 from '../TestStage';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen } from './UndertowSpillwayBlockoutGeometry';
import { undertowT21dConnectivityQaStage } from './UndertowSpillwayConnectivityQa';
import {
  ISSUE13_HISTORICAL_FLOOR_EDGE,
  registeredSourceFootprintWitnesses,
  auditUndertowOriginalFloorEdge
} from './UndertowOriginalFootEdgeAudit';

const sourceId='UndertowT21D:first-drop-landing-positive-z';
const {from,to}=ISSUE13_HISTORICAL_FLOOR_EDGE;

describe('Issue #13 original SOURCE first-drop landing / physical edge',()=>{
 it('proves the registered 0.125m raster ends between historical 1355 and 1356',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const first=registeredSourceFootprintWitnesses(stage,from);
  const second=registeredSourceFootprintWitnesses(stage,to);
  const landing=first.find(item=>item.solidId===sourceId);
  expect(landing).toBeDefined();
  expect(landing!.topY).toBe(3);
  expect(landing!.staticCollisionEnabled).toBe(true);
  // Simplified outline != raster cell-center coverage. Do not interpret
  // either as new Phive/Actor source authorization.
  expect(landing!.insideSimplifiedPolygon).toBe(false);
  expect(landing!.insideActualCollisionRaster).toBe(true);
  expect(second.some(item=>item.insideActualCollisionRaster)).toBe(false);
  expect(stage.solids).toBe(frozen.solids);
  expect(stage.paintSurfaces).toBe(frozen.paintSurfaces);
  expect(stage.navigationLinks).toBe(frozen.navigationLinks);
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(frozen.activationReady).toBe(false);
 });
 it('rejects nonfinite coordinates rather than manufacturing a floor',()=>{
  const stage=undertowT21dConnectivityQaStage();
  expect(()=>registeredSourceFootprintWitnesses(stage,
    [Number.NaN,3,46.629])).toThrow('ISSUE13_NONFINITE_SOURCE_SAMPLE');
 });
});

describe('Issue #13 actual registered Rapier vs Recast nearest-floor witness',()=>{
 beforeAll(async()=>{await Promise.all([
  initializeRapier(),initializeRecastNavigation()
 ]);});
 it('checks the same frozen original solids without changing geometry or authorizing F4',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const physics=new RapierStagePhysics(1/60,stage);
  physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const result=auditUndertowOriginalFloorEdge(stage,physics,nav,from,to);
  expect(result.sourceEdgeClassification)
    .toBe('REGISTERED_RASTER_COVERAGE_ENDS');
  // Static ray witnesses are separately measured. The historical player
  // support flags belong to the B490 trace, not to this isolated run.
  expect(result.from.staticRapierSolidId).toBe(sourceId);
  expect(result.from.staticRapierHitY).toBeCloseTo(3,4);
  expect(result.to.staticRapierSolidId).toBeNull();
  expect(result.planarStepMeters).toBeGreaterThan(.42);
  expect(result.planarStepMeters).toBeLessThan(.44);
  expect(result.sourceRouteCertified).toBe(false);
  expect(result.newFloorAuthorized).toBe(false);
  expect(result.newNavLinkAuthorized).toBe(false);
  expect(result.originalPlayerCollisionAuthorityCertified).toBe(false);
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
 });
});

describe('F4 original floor replacement cannot leave orphan painted SOURCE planes',()=>{
 it('keeps all 17 registration records but denies painting where the physical backing was removed',()=>{
  const original=undertowT21dConnectivityQaStage();
  const removed=original.paintSurfaces.find(surface=>
   original.solids.some(s=>s.id===surface.backingSolidId));
  expect(removed).toBeDefined();
  const replaced={...original,solids:original.solids.filter(s=>
   s.id!==removed!.backingSolidId)};
  const allowed=stagePhysicallyBackedPaintSurfaceIds(replaced);
  expect(allowed.has(removed!.id)).toBe(false);
  expect(stagePhysicallyBackedPaintSurfaceIds(original).has(removed!.id)).toBe(true);
  expect(replaced.paintSurfaces).toBe(original.paintSurfaces);
  expect(original.paintSurfaces).toBe(frozen.paintSurfaces);
  const ink=new GameplayInkSystem();
  defineTestSurfaces(ink,original);
  expect(ink.getSurfaces().length).toBe(17);
  ink.restrictToPhysicallyBackedSurfaces(allowed);
  expect(ink.getSurfaces().length).toBe(17);
  const denied=ink.apply({tick:1,source:PaintSource.Human,team:Team.A,
   surfaceId:removed!.id,centerU:0.5,centerV:0.5,
   radiusU:1,radiusV:1,angle:0,type:PaintEventType.Impact,strength:1});
  expect(denied.changedCells).toBe(0);
  expect(denied.rasterEligibleCells).toBe(0);
  expect(denied.paintableRuns).toEqual([]);
  expect(ink.getSurface(removed!.id)).toBeDefined();
  expect(original.solids.length).toBe(25);
  expect(original.paintSurfaces.length).toBe(17);
  expect(original.navigationLinks?.length).toBe(26);
  expect(frozen.activationReady).toBe(false);
 });
});
