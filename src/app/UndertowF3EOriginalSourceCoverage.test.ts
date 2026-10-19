import {describe,expect,it} from 'vitest';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';
import {auditF3eSourceCoverage,f3eSourceMassingStyle,F3E_SOURCE_MASSING_MODES}
 from './UndertowF3EOriginalSourceCoverage';

describe('F3E all source backed architectural visual terrain only',()=>{
 it('assembles pinned original OBJ triangles with no fabricated floor, source gameplay authority or actor-set props',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const before={solids:stage.solids,paint:stage.paintSurfaces,
   links:stage.navigationLinks};
  const {parts,manifest}=auditF3eSourceCoverage(stage);
  expect(manifest.sourceComponents).toBeGreaterThan(95);
  expect(manifest.originalTriangles).toBeGreaterThan(200);
  expect(manifest.skippedUnplacedActorComponents).toBe(8);
  expect(manifest.visualOnlyUnderpassRouteComponents).toBe(8);
  expect(manifest.originalSourceVerticalAdditions).toBe(12);
  expect(manifest.originalSourceEdgeLinerAdditions).toBe(4);
  expect(manifest.unresolvedUnderpassOriginalGapMeters).toBeCloseTo(31.71622721122581,9);
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

describe('W10-B28 visual massing on actual source-only architecture',()=>{
 it('makes original walls/pillars/high optical structures depth-writing opaque',()=>{
  expect(F3E_SOURCE_MASSING_MODES).toEqual(['ARCHITECTURE','HOLOGRAM']);
  for(const kind of ['WALL','SUPPORT','HIGH'] as const){
   const mass=f3eSourceMassingStyle(kind,'ARCHITECTURE');
   expect(mass).toMatchObject({opaque:true,depthWrite:true,opacity:1});
   const old=f3eSourceMassingStyle(kind,'HOLOGRAM');
   expect(old).toMatchObject({opaque:false,depthWrite:false});
   expect(old.opacity).toBeLessThan(1);
  }
 });
 it('never makes unverified floor/slope/underpass or glass opaque game surfaces',()=>{
  for(const kind of ['CONCRETE','SLOPE','GLASS','DETAIL'] as const){
   const mass=f3eSourceMassingStyle(kind,'ARCHITECTURE');
   expect(mass.opaque).toBe(false);
   expect(mass.depthWrite).toBe(false);
   expect(mass.opacity).toBeLessThan(1);
  }
  expect(f3eSourceMassingStyle('GLASS','ARCHITECTURE').opacity)
   .toBeLessThan(.25);
 });
 it('exact same source mesh audit and 25/17/26 original authority across both styles',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const before=[stage.solids,stage.paintSurfaces,stage.navigationLinks] as const;
  const orig=auditF3eSourceCoverage(stage);
  for(const mode of F3E_SOURCE_MASSING_MODES){
   for(const k of Object.keys(orig.manifest.categories) as (
    keyof typeof orig.manifest.categories)[]){
     const style=f3eSourceMassingStyle(k,mode);
     expect(style.rgb.every(x=>Number.isFinite(x)&&x>=0&&x<=1)).toBe(true);
     expect(style.opacity).toBeGreaterThan(0);
     expect(style.opacity).toBeLessThanOrEqual(1);
    }
   expect(auditF3eSourceCoverage(stage).manifest.originalTriangles)
    .toBe(orig.manifest.originalTriangles);
  }
  expect(stage.solids).toBe(before[0]);
  expect(stage.paintSurfaces).toBe(before[1]);
  expect(stage.navigationLinks).toBe(before[2]);
  expect(stage.solids.length).toBe(25);
  expect(stage.paintSurfaces.length).toBe(17);
  expect(stage.navigationLinks?.length).toBe(26);
  expect(orig.manifest.addedPhysicalSolids).toBe(0);
  expect(orig.manifest.productionAuthorized).toBe(false);
 });
});
