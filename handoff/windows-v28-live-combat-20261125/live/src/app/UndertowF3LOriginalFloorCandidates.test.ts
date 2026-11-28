import {describe,expect,it} from 'vitest';
import {f4OriginalFloorMaterialCandidate} from './UndertowF3LTexturedSourcePreview';

describe('F4 original floor candidates',()=>{
 it('admits real floor and slope material classes including grass and metal floors',()=>{
  expect(f4OriginalFloorMaterialCandidate('FLOOR','Fld_Temple01_FloorConcrete00')).toBe(true);
  expect(f4OriginalFloorMaterialCandidate('FLOOR','Fld_Temple01_FloorGrass00')).toBe(true);
  expect(f4OriginalFloorMaterialCandidate('FLOOR','Fld_Temple01_GrassFloor00')).toBe(true);
  expect(f4OriginalFloorMaterialCandidate('FLOOR','Fld_Temple01_FloorMetal00')).toBe(true);
  expect(f4OriginalFloorMaterialCandidate('SLOPE','Fld_Temple01_FloorSlope00')).toBe(true);
 });
 it('keeps authentic floor markings and excludes wall, bridge, fence and decor classes',()=>{
  expect(f4OriginalFloorMaterialCandidate('DETAIL','Fld_Temple01_FloorLine04')).toBe(true);
  expect(f4OriginalFloorMaterialCandidate('DETAIL','Fld_Temple01_Object00')).toBe(false);
  expect(f4OriginalFloorMaterialCandidate('METAL','Fld_Temple01_WallConcrete00')).toBe(false);
  expect(f4OriginalFloorMaterialCandidate('METAL','Fld_Temple01_BridgeMetal00')).toBe(false);
  expect(f4OriginalFloorMaterialCandidate('METAL','Fld_Temple01_FloorFence00')).toBe(false);
 });
});
