import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES,
  UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY,
  undertowT21FlankElevationPhase4Errors
} from '../src/stage/undertow/UndertowSpillwayFlankElevationPhase4Geometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';

interface OriginalMesh {
  pairId:number;
  sourceComponentId:string;
  sourceMaterial:string;
  sourceAreaSquareMeters:number;
  yRange:number[];
  planZoneDiagnostic:string;
  side:'POSITIVE_Z'|'NEGATIVE_Z';
  vertexCount:number;
  boundarySamplesInside:number;
  boundarySamplesOutside:number;
  placementAuthority:string;
  runtimePromotionAuthorized:false;
}
interface ExactSource {
  version:string;sourceAuditVersion:string;reviewOnly:boolean;
  originalModel:string;runtimePromotionAuthorized:boolean;pairs:number;
  records:OriginalMesh[];packedFloat64LEBase64:string;packedByteLength:number;
  sourcePrecision:string;connectivityAuthority:string;
  runtimePropertiesAuthorized:unknown[];
}
describe('T21 Phase4 flank and elevation: whole-stage source exactness',()=>{
  it('keeps original 10 source meshes/5 pairs inside hard silhouette and review-only',()=>{
    expect(undertowT21FlankElevationPhase4Errors()).toEqual([]);
    expect(UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY).toMatchObject({
      meshCount:10,pairCount:5,reviewOnly:true,
      runtimePromotionAuthorized:false,sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1'
    });
    const inventory=UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory;
    expect(inventory).toHaveLength(64);
    expect(new Set(inventory.map(x=>x.sourceComponentId)).size).toBe(64);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('checks EVERY original float64 XYZ triple, source ID/Y/material and symmetry against pinned OBJ',()=>{
    const path=process.env.T21_PHASE4_EXACT_SOURCE_JSON;
    if(!path||!existsSync(path)){
      console.log('T21 Phase4 whole-source JSON fixture available in PR CI only');
      return;
    }
    const original=JSON.parse(readFileSync(path,'utf8')) as ExactSource;
    expect(original).toMatchObject({
      version:'T21_FLANK_ELEVATION_SOURCE_PHASE4_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      originalModel:'PINNED_KITRIX_VSS_TEMPLE01_OBJ',
      reviewOnly:true,runtimePromotionAuthorized:false,
      pairs:5,sourcePrecision:'UNMODIFIED_FLOAT64_XYZ',
      connectivityAuthority:'UNRESOLVED',runtimePropertiesAuthorized:[]
    });
    expect(original.records).toHaveLength(10);
    const bytes=Buffer.from(original.packedFloat64LEBase64,'base64');
    expect(bytes.byteLength).toBe(original.packedByteLength);
    let offset=0,checkedVertices=0;
    for(const [i,record] of original.records.entries()){
      const actual=UNDERTOW_T21_FLANK_ELEVATION_PHASE4_MESHES[i]!;
      const n=bytes.readUInt16LE(offset);offset+=2;
      expect(n).toBe(record.vertexCount);
      expect(actual.vertices).toHaveLength(n);
      expect(actual.sourceComponentId).toBe(record.sourceComponentId);
      expect(actual.sourceMaterial).toBe(record.sourceMaterial);
      expect(actual.side).toBe(record.side);
      expect(actual.pairId).toBe(record.pairId);
      expect(actual.yRange).toEqual(record.yRange);
      expect(actual.areaSquareMeters).toBeCloseTo(record.sourceAreaSquareMeters,10);
      expect(actual.runtimePromotionAuthorized).toBe(false);
      expect(record.runtimePromotionAuthorized).toBe(false);
      expect(record.boundarySamplesOutside).toBe(0);
      expect(record.boundarySamplesInside).toBe(n/3*7);
      expect(record.placementAuthority).toBe('STATIC_SOURCE_IDENTITY_ONLY');
      for(const vertex of actual.vertices){
        const match=Buffer.allocUnsafe(24);
        match.writeDoubleLE(vertex[0],0);
        match.writeDoubleLE(vertex[1],8);
        match.writeDoubleLE(vertex[2],16);
        expect(match.equals(bytes.subarray(offset,offset+24)),actual.sourceComponentId).toBe(true);
        offset+=24;
        checkedVertices++;
      }
    }
    expect(offset).toBe(bytes.byteLength);
    expect(checkedVertices).toBe(294);
    console.log('T21_PHASE4_BYTE_EXACT_PASS',JSON.stringify({
      pairs:5,meshes:10,originalFloat64TriplesMatched:checkedVertices,
      sourceTriangleAreaSquareMeters:UNDERTOW_T21_FLANK_ELEVATION_PHASE4_SUMMARY.sourceTriangleAreaSquareMeters,
      reviewOnly:true,runtimePromotionAuthorized:false
    }));
  },60_000);
});