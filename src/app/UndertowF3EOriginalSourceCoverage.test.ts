import {describe,expect,it} from 'vitest';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';
import {auditF3eSourceCoverage} from './UndertowF3EOriginalSourceCoverage';

describe('F3E all source backed architectural visual terrain only',()=>{
 it('assembles pinned original OBJ triangles with no fabricated floor, source gameplay authority or actor-set props',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const before={solids:stage.solids,paint:stage.paintSurfaces,
   links:stage.navigationLinks};
  const {parts,manifest}=auditF3eSourceCoverage(stage);
  expect(manifest.sourceComponents).toBeGreaterThan(55);
  expect(manifest.originalTriangles).toBeGreaterThan(200);
  expect(manifest.skippedUnplacedActorComponents).toBe(8);
  expect(new Set(parts.map(m=>m.sourceComponentId)).size).toBe(parts.length);
  expect(parts.every(m=>m.originalMesh&&m.vertices.length%3===0&&
   m.collisionPaintNavigationScoreAuthority==='NONE')).toBe(true);
  expect(parts.some(m=>m.vertices.some(v=>v[2]>30))).toBe(true);
  expect(parts.some(m=>m.vertices.some(v=>v[2]<-30))).toBe(true);
  expect(parts.some(m=>m.vertices.some(v=>Math.abs(v[2])<20))).toBe(true);
  expect(manifest.inferredCorridorConnections).toBe(0);
  expect(manifest.addedPhysicalSolids).toBe(0);
  expect(manifest.addedPaintSurfaces).toBe(0);
  expect(manifest.addedNavigationLinks).toBe(0);
  expect(manifest.productionAuthorized).toBe(false);
  expect(stage.solids).toBe(before.solids);
  expect(stage.paintSurfaces).toBe(before.paint);
  expect(stage.navigationLinks).toBe(before.links);
  expect(before.solids).toBe(frozen.solids);
  expect(()=>auditF3eSourceCoverage(PRODUCTION_STAGE_DEFINITION))
   .toThrow('T21_F3E_IMMUTABLE_STAGE_AUTHORITY_REQUIRED');
  console.log('T21_F3E_ARCHITECTURAL_VISUAL_SOURCE',JSON.stringify(manifest));
 });
});
