import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES as P} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
describe('T21 Phase12E original-only two-mirror camera isolate QA',()=>{
  it('requires two exact original source parts per side and matches symmetric pair IDs',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(P).toHaveLength(4);
    expect(P.filter(m=>m.side==='POSITIVE_Z')).toHaveLength(2);
    expect(P.filter(m=>m.side==='NEGATIVE_Z')).toHaveLength(2);
    for(const id of [1,2]){
      const pair=P.filter(m=>m.pairId===id);
      expect(pair).toHaveLength(2);
      expect(pair.map(m=>m.side).sort()).toEqual(['NEGATIVE_Z','POSITIVE_Z']);
      expect(pair.reduce((s,m)=>s+m.vertices.length/3,0)).toBe(4);
      for(const m of pair){
        expect(m.playableFloorNavCollisionPaintScoringAuthority).toBe('NONE');
        expect(m.runtimePromotionAuthorized).toBe(false);
        expect(m.originalGlobalFaceIndices).toHaveLength(2);
      }
    }
  });
  it('review-only focus stays opt-in and removes other 124 source meshes without scene mutation',()=>{
    const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
    const capture=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
    expect(app).toContain("params.get('reviewRecoveredFocus')==='POSITIVE_Z'");
    expect(app).toContain("this.canvas.dataset.t21ReviewPreset='FOCUS_ORIGINAL_SOURCE_ONLY'");
    expect(app).toContain("this.recoveredSourcePhase12DRoot.children.length!==4");
    expect(app).toContain("this.confirmedRoot,this.occupancyRoot,this.sourceNativeRoot");
    expect(app).toContain("this.recoveredSourcePhase12DRoot.enabled=false;");
    expect(capture).toContain("for(const side of ['POSITIVE_Z','NEGATIVE_Z'])");
    expect(capture).toContain("allDefault124OriginalSourceMeshesHiddenForIsolation:true");
    expect(capture).toContain("authorizesVisualFreeze:false");
  });
});
