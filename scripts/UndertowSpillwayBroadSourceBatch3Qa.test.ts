import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES, UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY, undertowT21BroadStaticSourceErrors } from '../src/stage/undertow/UndertowSpillwayBroadStaticSourceGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
interface SourceRecord { pairId:number;sourceComponentId:string;sourceMaterial:string;areaSquareMeters:number;yRange:[number,number];vertexCount:number;placementAuthority:string;runtimePromotionAuthorized:false }
interface Batch3 {version:string;sourceAuditVersion:string;reviewOnly:boolean;runtimePromotionAuthorized:boolean;meshCount:number;pairCount:number;records:SourceRecord[];packedFloat64LEBase64:string;packedByteLength:number;}
describe('T21 broad static source terrain — byte-exact OBJ evidence',()=>{
  it('preserves 8 original large static floor meshes, paired source ID, XYZ/Y and no runtime authority',()=>{
    expect(undertowT21BroadStaticSourceErrors()).toEqual([]);
    expect(UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY).toMatchObject({
      meshCount:8,pairCount:4,reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(56);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    const p=process.env.T21_BATCH3_EXACT_SOURCE_JSON;
    if(!p||!existsSync(p)){ console.log('T21 batch3 OBJ source fixture unavailable outside PR');return; }
    const data=JSON.parse(readFileSync(p,'utf8')) as Batch3;
    expect(data).toMatchObject({
      version:'T21_LARGE_TERRAIN_BATCH3_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      reviewOnly:true,runtimePromotionAuthorized:false,
      meshCount:8,pairCount:4,packedByteLength:6064
    });
    expect(data.records).toHaveLength(8);
    const buf=Buffer.from(data.packedFloat64LEBase64,'base64');
    expect(buf.byteLength).toBe(data.packedByteLength);
    let offset=0;
    for(let i=0;i<data.records.length;i++){
      const record=data.records[i]!,current=UNDERTOW_T21_BROAD_STATIC_SOURCE_MESHES[i]!;
      const count=buf.readUInt16LE(offset);offset+=2;
      expect(count).toBe(record.vertexCount);
      expect(current.sourceComponentId).toBe(record.sourceComponentId);
      expect(current.sourceMaterial).toBe(record.sourceMaterial);
      expect(current.pairId).toBe(record.pairId);
      expect(current.yRange).toEqual(record.yRange);
      expect(current.areaSquareMeters).toBeCloseTo(record.areaSquareMeters,10);
      expect(current.runtimePromotionAuthorized).toBe(false);
      expect(record.runtimePromotionAuthorized).toBe(false);
      expect(record.placementAuthority).toBe('STATIC_SOURCE_IDENTITY_ONLY');
      const original:[number,number,number][]=[];
      for(let k=0;k<count;k++){
        original.push([buf.readDoubleLE(offset),buf.readDoubleLE(offset+8),buf.readDoubleLE(offset+16)]);offset+=24;
      }
      expect(current.vertices).toEqual(original);
    }
    expect(offset).toBe(buf.byteLength);
    console.log('T21_BROAD_STATIC',JSON.stringify({
      exactSourceMeshes:data.meshCount,pairs:data.pairCount,
      sourceTriangleAreaSquareMeters:UNDERTOW_T21_BROAD_STATIC_SOURCE_SUMMARY.totalSourceAreaSquareMeters,
      originalFloat64XYZMatched:true,collisionNavPaintRuntimePromotion:false
    }));
  },60_000);
});