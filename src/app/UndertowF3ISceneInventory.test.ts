import {describe,it,expect} from 'vitest';
import {createF3iSceneCollector}
 from '../../scripts/t21-f3i-scene-inventory.mjs';
const lines=[
 'v 0 0 0','v 2 0 0','v 0 0 3','v 400 0 0',
 'o FldBG_Temple01_BG','usemtl FldBG_Temple01_Wall','f 1 2 3',
 'f 1 3 4','o FldObj_Temple01_ActorX',
 'usemtl FldObj_Temple01_Metal','f 1 2 3','f -4 -3 -2',
 'o Fld_Temple01_Static','usemtl Fld_Temple01_Floor','f 1 2 3'];
describe('F3I macro environment diagnostic without authority promotion',()=>{
 it('separates pinned OBJ-space background candidates and unplaced actors',()=>{
  const c=createF3iSceneCollector();
  for(const line of lines)c.line(line);
  const m=c.finish();
  expect(m.backgroundTriangles).toBe(1);
  expect(m.background).toHaveLength(9);
  expect(m.backgroundExcludedFaces).toBe(1);
  expect(m.actorObjectCount).toBe(1);
  expect(m.actorFaceCount).toBe(2);
  expect(m.actorTriangles).toBe(2);
  expect(m.largestUnplacedActors[0]?.min).toEqual([0,0,0]);
  expect(m.actorPlacementRecovered).toBe(false);
  expect(m.environmentStageRegistrationRecovered).toBe(false);
  expect(m.traversalAuthorityRecovered).toBe(false);
 });
 it('fails closed on malformed face or missing OBJ indices',()=>{
  const c=createF3iSceneCollector();
  c.line('o FldBG_Temple01_BG');c.line('usemtl FldBG_Temple01_Wall');
  expect(()=>c.line('f 1 2 3')).toThrow('F3I_BAD_ORIGINAL_OBJ_FACE_INDEX');
 });
});