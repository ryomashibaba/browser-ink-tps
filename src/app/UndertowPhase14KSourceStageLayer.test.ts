import {describe,expect,it} from 'vitest';
import {auditPhase14KSourceVisuals} from './UndertowPhase14KSourceStageLayer';
import {undertowT21dConnectivityQaStage} from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen} from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {PRODUCTION_STAGE_DEFINITION} from '../stage/StageDefinition';

describe('Phase14K original-source render-only frozen stage context',()=>{
 it('uses EXACT original 25-solid geometry with no collision/nav/paint promotion',()=>{
   const stage=undertowT21dConnectivityQaStage();
   const before=JSON.stringify({
     solids:stage.solids,paint:stage.paintSurfaces,links:stage.navigationLinks
   });
   const m=auditPhase14KSourceVisuals(stage);
   expect(m.evidenceOnly).toBe(true);
   expect(m.inputSolids).toBe(25);
   expect(m.renderedSolids).toBeGreaterThan(0);
   expect(m.renderedSolids).toBeLessThanOrEqual(25);
   expect(m.footprintRectangles+m.triangleMeshTriangles+m.boxSolids)
     .toBeGreaterThan(0);
   expect(new Set(m.sourceIds).size).toBe(25);
   expect(m.collisionModified).toBe(false);
   expect(m.paintModified).toBe(false);
   expect(m.activationAuthorized).toBe(false);
   expect(JSON.stringify({solids:stage.solids,paint:stage.paintSurfaces,
     links:stage.navigationLinks})).toBe(before);
   expect(frozen.activationReady).toBe(false);
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   console.log('T21_PHASE14K_REAL_SOURCE_RENDER_MANIFEST',JSON.stringify(m));
 });
 it('refuses source authority drift, duplicate source IDs and unrelated production stage',()=>{
   const stage=undertowT21dConnectivityQaStage();
   expect(()=>auditPhase14KSourceVisuals(PRODUCTION_STAGE_DEFINITION))
     .toThrow('SOURCE_FROZEN_STAGE_DRIFT');
   expect(()=>auditPhase14KSourceVisuals({...stage,solids:stage.solids.slice(1)}))
     .toThrow('SOURCE_FROZEN_STAGE_DRIFT');
   expect(()=>auditPhase14KSourceVisuals({...stage,solids:[
     stage.solids[0]!,stage.solids[0]!,...stage.solids.slice(2)
   ]})).toThrow('DUPLICATE_SOURCE_ID');
 });
});