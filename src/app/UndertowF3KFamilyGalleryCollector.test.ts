import {describe,it,expect} from 'vitest';
import {createF3kFamilyCollector}
 from '../../scripts/t21-f3k-family-gallery.mjs';
const families=[{family:'BridgeMetal00',
 representativeObject:'FldObj_Temple01_A__BridgeMetal00',representativeTriangles:2},
 {family:'PillarBase02',
 representativeObject:'FldObj_Temple01_B__PillarBase02',representativeTriangles:1}];
describe('F3K real original-local mesh gallery extractor',()=>{
 it('triangulates selected component families without placing actors',()=>{
  const c=createF3kFamilyCollector(families);
  for(const row of ['v 0 0 0','v 2 0 0','v 2 2 0','v 0 2 0',
   'o FldObj_Temple01_A__BridgeMetal00','f 1 2 3 4',
   'o FldObj_Temple01_B__PillarBase02','f -4 -2 -1',
   'o FldBG_Temple01_C','f 1 3 4'])c.line(row);
  const parts=c.finish();
  expect(parts).toHaveLength(2);
  expect(parts[0]?.triangles).toBe(2);
  expect(parts[0]?.positions).toHaveLength(18);
  expect(parts[0]?.min).toEqual([0,0,0]);
  expect(parts[0]?.max).toEqual([2,2,0]);
  expect(parts[1]?.triangles).toBe(1);
 });
 it('rejects missing faces and double-selected objects',()=>{
  expect(()=>createF3kFamilyCollector([families[0]!,families[0]!])).toThrow();
  const c=createF3kFamilyCollector(families);
  expect(()=>c.finish()).toThrow('F3K_REPRESENTATIVE_TRIANGLE_OR_BOUNDS_DRIFT');
 });
 it('rejects unsafe OBJ face indices',()=>{
  const c=createF3kFamilyCollector([families[0]!]);
  c.line('o FldObj_Temple01_A__BridgeMetal00');
  expect(()=>c.line('f 1 2 3')).toThrow('F3K_INVALID_ORIGINAL_FACE_INDEX');
 });
});