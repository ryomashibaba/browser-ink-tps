import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES,
  UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY,
  undertowT21VerticalSourcePhase5BErrors
} from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';

interface Source {
  pairId:number;sourceComponentId:string;sourceObject:string;
  sourceMaterial:string;sourceAreaSquareMeters:number;
  yRange:number[];side:string;vertexCount:number;
  outsideHardBoundarySamples:number;normalYAbsMax:number;
  placementAuthority:string;connectivityAuthority:string;
  runtimePromotionAuthorized:false;
}
interface Fixture {
  version:string;sourceAuditVersion:string;sourcePrimitive:string;
  pairCount:number;meshCount:number;
  records:Source[];packedFloat64LEBase64:string;packedByteLength:number;
  reviewOnly:boolean;runtimePromotionAuthorized:boolean;
  sourceXYZAuthority:string;sourceHeightAuthority:string;
  wallCollisionNavPaintScoringAuthority:string;
  full3DConnectionAuthority:string;
}
describe('T21 Phase5B original near-vertical glass, metal, pillar source',()=>{
  it('retains 12 separate source-face meshes without modifying floor coverage or stage runtime',()=>{
    expect(undertowT21VerticalSourcePhase5BErrors()).toEqual([]);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY).toMatchObject({
      pairCount:6,meshCount:12,glassCount:6,metalCount:4,pillarCount:2,
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    const walk=UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory;
    expect(walk).toHaveLength(64);
    const ids=new Set(walk.map(w=>w.sourceComponentId));
    for(const vertical of UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES){
      expect(ids.has(vertical.sourceComponentId)).toBe(false);
      expect(vertical.shapeAuthority).toBe('ORIGINAL_TEMPLE01_VERTICAL_SOURCE_TRIANGLES_ONLY');
      expect(vertical.wallCollisionNavPaintScoringAuthority).toBe('NONE');
      expect(vertical.connectivityAuthority).toBe('UNRESOLVED');
    }
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('checks each original float64 XYZ triple, source ID, material, height and 180-degree pair',()=>{
    const path=process.env.T21_VERTICAL_5B_EXACT_SOURCE_JSON;
    if(!path||!existsSync(path)){
      console.log('T21 Phase5B pinned original OBJ source fixture only supplied in PR CI');
      return;
    }
    const original=JSON.parse(readFileSync(path,'utf8')) as Fixture;
    expect(original).toMatchObject({
      version:'T21_VERTICAL_EXACT_REVIEW_PHASE5B_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      sourcePrimitive:'ORIGINAL_OBJ_TRIANGLES_STRONGLY_VERTICAL_ONLY_NOT_WHOLE_COLLISION_SOLIDS',
      pairCount:6,meshCount:12,reviewOnly:true,runtimePromotionAuthorized:false,
      sourceXYZAuthority:'EXACT_FLOAT64_FROM_PINNED_TEMPLE01',
      sourceHeightAuthority:'EXACT_Y_FROM_PINNED_TEMPLE01',
      wallCollisionNavPaintScoringAuthority:'NONE',
      full3DConnectionAuthority:'UNRESOLVED'
    });
    expect(original.records).toHaveLength(12);
    const bytes=Buffer.from(original.packedFloat64LEBase64,'base64');
    expect(bytes.byteLength).toBe(original.packedByteLength);
    expect(original.packedByteLength).toBe(2616);
    let offset=0,matchedVertices=0;
    for(const [index,record] of original.records.entries()){
      const mesh=UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES[index]!;
      const count=bytes.readUInt16LE(offset);offset+=2;
      expect(mesh.vertices).toHaveLength(count);
      expect(count).toBe(record.vertexCount);
      expect(mesh.sourceComponentId).toBe(record.sourceComponentId);
      expect(mesh.sourceMaterial).toBe(record.sourceMaterial);
      expect(mesh.side).toBe(record.side);
      expect(mesh.pairId).toBe(record.pairId);
      expect(mesh.areaSquareMeters).toBeCloseTo(record.sourceAreaSquareMeters,10);
      expect(mesh.yRange).toEqual(record.yRange);
      expect(record.normalYAbsMax).toBeLessThanOrEqual(0.32+1e-12);
      expect(record.outsideHardBoundarySamples).toBe(0);
      expect(record.placementAuthority).toBe('STATIC_SOURCE_IDENTITY_ONLY');
      expect(record.connectivityAuthority).toBe('PENDING');
      expect(record.runtimePromotionAuthorized).toBe(false);
      for(const v of mesh.vertices){
        const encoded=Buffer.allocUnsafe(24);
        encoded.writeDoubleLE(v[0],0);
        encoded.writeDoubleLE(v[1],8);
        encoded.writeDoubleLE(v[2],16);
        expect(encoded.equals(bytes.subarray(offset,offset+24)),mesh.sourceComponentId).toBe(true);
        offset+=24;matchedVertices++;
      }
    }
    expect(offset).toBe(bytes.byteLength);
    expect(matchedVertices).toBe(108);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY.sourceTriangleAreaSquareMeters).toBeCloseTo(391.5966251017583,8);
    console.log('T21_PHASE5B_EXACT_SOURCE_PASS',JSON.stringify({
      sourceVerticalMeshes:12,originalFloat64VerticesMatched:matchedVertices,
      sourceArea3DSquareMeters:UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_SUMMARY.sourceTriangleAreaSquareMeters,
      originalObjects:'Fld_Temple01 only',
      note:'12 review-only original near-vertical SOURCE TRIANGLE components; not 12 physical collision walls'
    }));
  },60_000);
});