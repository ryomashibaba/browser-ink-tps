import {describe,it,expect} from 'vitest';
import {createF3iSceneCollector,convertF3iSceneInventory}
 from '../../scripts/t21-f3i-scene-inventory.mjs';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
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
 it('writes only local opt-in hashed preview BIN and auditable metadata',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'f3i-fixture-'));
  try{
   const source=join(dir,'fixture.obj'),output=join(dir,'preview');
   await writeFile(source,lines.join('\n'));
   const m=await convertF3iSceneInventory({input:source,output,allowTestFixture:true});
   expect(m.productionAuthorization).toBe(false);
   expect(m.stageCollisionSolidsAdded).toBe(0);
   expect(m.backgroundTriangleCount).toBe(1);
   expect(m.previewBin.bytes).toBe(36);
   expect((await readFile(join(output,m.previewBin.file))).byteLength).toBe(36);
   expect(JSON.parse(await readFile(join(output,'f3i-environment.json'),'utf-8'))
    .actorPlacementRecovered).toBe(false);
  }finally{await rm(dir,{recursive:true,force:true});}
 });
 it('fails closed on malformed face or missing OBJ indices',()=>{
  const c=createF3iSceneCollector();
  c.line('o FldBG_Temple01_BG');c.line('usemtl FldBG_Temple01_Wall');
  expect(()=>c.line('f 1 2 3')).toThrow('F3I_BAD_ORIGINAL_OBJ_FACE_INDEX');
 });
});