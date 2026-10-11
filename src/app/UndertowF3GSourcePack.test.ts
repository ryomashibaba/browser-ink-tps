import {describe,it,expect} from 'vitest';
import {createF3gObjCollector,classifyStaticMaterial,F3G_KINDS,
 PINNED_TEMPLE01_SHA256} from '../../scripts/t21-f3g-source-pack.mjs';
describe('F3G full-original OBJ optical-only importer',()=>{
 it('separates correct static source from unplaced PntSet and background',()=>{
  const c=createF3gObjCollector({allowTestFixture:true});
  const obj=[
   'o Fld_Temple01_mesh01_low_1__FloorConcrete00',
   'v 0 3 18','v 3 3 18','v 3 3 21','v 0 3 21',
   'usemtl Fld_Temple01_FloorConcrete00','f 1/1/1 2/2/1 3/3/1 4/4/1',
   'o FldObj_Temple01_PntSet_WalkBridge',
   'usemtl FldObj_Temple01_PntSet_FloorSlope01',
   'f 1 2 3',
   'o FldBG_Temple01_Ceiling00','usemtl FldBG_Temple01_Ceiling00',
   'f 1 2 3',
   'o Fld_Temple01_group20357_1__Glass01','usemtl Fld_Temple01_Glass01',
   'f -4 -3 -2'
  ];
  for(const line of obj)c.line(line);
  const m=c.finish();
  expect(m.vertexCount).toBe(4);
  expect(m.totalFaces).toBe(4);
  expect(m.ignoredFaces).toBe(2);
  expect(m.triangleCount).toBe(3);
  expect(m.perKind.FLOOR?.length).toBe(18);
  expect(m.perKind.GLASS?.length).toBe(9);
  expect(m.perKind.SLOPE?.length).toBe(0);
  expect(classifyStaticMaterial('Fld_Temple01_PillarBase00')).toBe('SUPPORT');
  expect(F3G_KINDS).toHaveLength(7);
  expect(PINNED_TEMPLE01_SHA256).toHaveLength(64);
 });
 it('rejects invented missing face vertex identities',()=>{
  const c=createF3gObjCollector();
  c.line('o Fld_Temple01_X');
  c.line('usemtl Fld_Temple01_FloorConcrete00');
  c.line('v 0 0 0');
  expect(()=>c.line('f 1 2 3')).toThrow('F3G_INVALID_ORIGINAL_OBJ_FACE_INDEX');
 });
});
