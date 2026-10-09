import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';

interface Candidate {
  sourceComponentId: string;
  sourceObject: string;
  sourceMaterial: string;
  sourceAreaSquareMeters: number;
  triangleCount: number;
  bboxProjectXYZ: number[];
  yRangeProjectMeters: number[];
  planZoneDiagnostic: 'CENTER' | 'POS' | 'NEG' | 'LEFT_SIDE' | 'RIGHT_SIDE';
  withinFrozenBoundarySampleCount: number;
  outsideFrozenBoundarySampleCount: number;
  boundarySampleDisposition: string;
  placementAuthority: string;
  runtimePromotionAuthorized: false;
}
interface Audit {
  version:string;
  sourceAuditVersion:string;
  sourceScope:string;
  sourceOrientationMaxSlopeDegrees:number;
  frozenHardSilhouetteVertices:number;
  boundaryAuthority:string;
  reviewOnly:boolean;
  runtimePromotionAuthorized:boolean;
  sourceComponentsTotal:number;
  zoneStats:Record<string,{componentCount:number,allSamplesInsideCount:number,boundaryConflictCount:number}>;
  components:Candidate[];
}
describe('T21 Temple01 WHOLE-stage source inventory — evidence-only',()=>{
  it('audits the entire active walk-token source component pool, not just Pass18G route crops',()=>{
    const p=process.env.T21_FULL_STAGE_SOURCE_JSON;
    if(!p||!existsSync(p)){
      console.log('T21 whole-stage source fixture not supplied (PR-only expensive audit)');
      return;
    }
    const audit=JSON.parse(readFileSync(p,'utf8')) as Audit;
    expect(audit).toMatchObject({
      version:'T21_WHOLE_STAGE_WALK_SOURCE_INVENTORY_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      sourceScope:'ALL_ACTIVE_TEMPLE01_UPWARD_WALK_TOKEN_COMPONENTS_NOT_ALL_MATERIALS',
      sourceOrientationMaxSlopeDegrees:50,
      frozenHardSilhouetteVertices:42,
      boundaryAuthority:'7_XZ_SAMPLES_PER_SOURCE_TRIANGLE_NOT_EXACT_POLYGON_CLIPPING',
      reviewOnly:true,
      runtimePromotionAuthorized:false
    });
    expect(audit.components.length).toBe(audit.sourceComponentsTotal);
    expect(audit.sourceComponentsTotal).toBeGreaterThanOrEqual(237);
    const ids=new Set(audit.components.map(c=>c.sourceComponentId));
    expect(ids.size).toBe(audit.sourceComponentsTotal);
    expect(audit.components.every(c=>c.sourceAreaSquareMeters>0 && c.triangleCount>0
      && c.runtimePromotionAuthorized===false
      && c.yRangeProjectMeters.length===2
      && c.bboxProjectXYZ.length===6
      && c.yRangeProjectMeters.every(Number.isFinite)
      && c.outsideFrozenBoundarySampleCount+c.withinFrozenBoundarySampleCount===c.triangleCount*7
      && c.boundarySampleDisposition===(c.outsideFrozenBoundarySampleCount===0
        ?'ALL_7_PER_TRIANGLE_INSIDE':'REQUIRES_BOUNDARY_RECONCILIATION')
      && (!c.sourceObject.startsWith('FldObj_') || c.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED')
    )).toBe(true);
    expect(Object.values(audit.zoneStats).reduce((n,z)=>n+z.componentCount,0)).toBe(audit.sourceComponentsTotal);

    // All 54 displayed source meshes must be distinct original
    // source components inside the actual exhaustive model-wide inventory.
    const current=UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory;
    expect(current).toHaveLength(54);
    for(const mesh of current){
      const source=audit.components.find(c=>c.sourceComponentId===mesh.sourceComponentId);
      expect(source,mesh.sourceComponentId).toBeDefined();
      expect(source!.sourceMaterial).toBe(mesh.sourceMaterial);
      expect(source!.sourceAreaSquareMeters).toBeCloseTo(mesh.sourceTriangleAreaSquareMeters,6);
      expect(source!.yRangeProjectMeters).toEqual(mesh.yRange);
      expect(source!.outsideFrozenBoundarySampleCount).toBe(0);
    }

    const boundaryHold=['c2','c17','c3','c16'].map(x=>
      'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|'+x);
    expect(boundaryHold.every(id=>ids.has(id))).toBe(true);
    const already=new Set(current.map(c=>c.sourceComponentId));
    const newInside=audit.components.filter(c=>!already.has(c.sourceComponentId)
      && c.outsideFrozenBoundarySampleCount===0);
    const byZone=Object.fromEntries(['CENTER','POS','NEG','LEFT_SIDE','RIGHT_SIDE'].map(z=>[
      z,newInside.filter(c=>c.planZoneDiagnostic===z).length
    ]));
    console.log('T21_WHOLE_SOURCE_PROVENANCE',JSON.stringify({
      totalOriginalSourceComponents:audit.sourceComponentsTotal,
      existingExactSourceReviewMeshes:current.length,
      additionalOriginalCandidates7PointInside:newInside.length,
      byZone,
      largestOriginalSourceComponents:newInside.slice().sort((a,b)=>
        b.sourceAreaSquareMeters-a.sourceAreaSquareMeters).slice(0,16).map(c=>({
          id:c.sourceComponentId,material:c.sourceMaterial,
          sourceTriangleAreaSquareMeters:c.sourceAreaSquareMeters,
          bbox:c.bboxProjectXYZ,
          placementAuthority:c.placementAuthority
        })),
      warning:'This does not prove in-game set-actor placement, source components may contain stacked or non-playable geometry; exterior check is 7 XZ samples/triangle only.'
    }));
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  },60_000);
});