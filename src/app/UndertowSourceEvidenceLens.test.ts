import {describe,it,expect} from 'vitest';
import {expectedEvidenceLensGroupVisibility,
 WALK_SOURCE_ROOT_KEYS as WALK,VERTICAL_SOURCE_ROOT_KEYS as VERTICAL,
 NON_SOURCE_CONTEXT_ROOT_KEYS as CONTEXT,EVIDENCE_LENS_GAMEPLAY_AUTHORITY as AUTH} from './UndertowSourceEvidenceLens';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as GEO} from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../stage/undertow/UndertowSpillwayMacroCoverage';
describe('T21 Phase13D reversible source-family visibility',()=>{
 it('has separate, complete, non-overlapping original source display families',()=>{
  expect([WALK.length,VERTICAL.length,CONTEXT.length]).toEqual([5,10,5]);
  expect(new Set([...WALK,...VERTICAL,...CONTEXT]).size).toBe(20);
  expect(expectedEvidenceLensGroupVisibility('WALK_ORIENTED')).toEqual({
   walk:true,vertical:false,context:false,gameplayFloorOrColliderProven:false});
  expect(expectedEvidenceLensGroupVisibility('VERTICAL_HIGH')).toEqual({
   walk:false,vertical:true,context:false,gameplayFloorOrColliderProven:false});
  expect(AUTH).toBe('NONE');
 });
 it('rejects invalid lens and preserves original T20 production, inactive T21 and XZ',()=>{
  expect(()=>expectedEvidenceLensGroupVisibility('NONSENSE' as never)).toThrow();
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(GEO.activationReady).toBe(false);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
 });
});
