import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES } from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES, UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY, undertowT21HighSourcePhase6Errors } from '../src/stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';

interface RecordSource {
  sourceComponentId:string;
  sourceVertexCount:number;
  sourceAreaSquareMeters:number;
  side:'POSITIVE_Z'|'NEGATIVE_Z';
  yRange:number[];
  runtimePromotionAuthorized:false;
}
interface Original {
  version:string;
  pairs:number;meshes:number;
  records:RecordSource[];
  packedByteLength:number;
  packedFloat64LEBase64:string;
  visualReviewOnly:boolean;
  runtimePromotionAuthorized:boolean;
  connectivityPaintCollisionAndCeilingAuthority:string;
}
describe('T21 Phase6 original high-structure source is not a game ceiling',()=>{
  it('uses two unique source-only high faces, preserving the 64 walk and 12 vertical inventories',()=>{
    expect(undertowT21HighSourcePhase6Errors()).toEqual([]);
    expect(UNDERTOW_T21_HIGH_SOURCE_PHASE6_SUMMARY).toMatchObject({
      registeredOriginalMeshes:2,
      reviewedOriginalSourcePairs:1,
      originalSourceCandidatePairs:7,
      reviewOnly:true,
      runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES).toHaveLength(12);
    const allIds=[
      ...UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.map(x=>x.sourceComponentId)
    ];
    expect(allIds).toHaveLength(78);
    expect(new Set(allIds).size).toBe(78);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('bytewise verifies chosen ceiling-adjacent panel vertices against all seven source-audited pairs',()=>{
    const file=process.env.T21_HIGH_PHASE6_SOURCE_JSON;
    if(!file||!existsSync(file)){
      console.log('T21 high-structure original OBJ fixture supplied only in PR CI');
      return;
    }
    const original=JSON.parse(readFileSync(file,'utf8')) as Original;
    expect(original).toMatchObject({
      version:'T21_HIGH_STRUCTURE_EXACT_SOURCE_V1',
      pairs:7,meshes:14,
      visualReviewOnly:true,
      runtimePromotionAuthorized:false,
      connectivityPaintCollisionAndCeilingAuthority:'NONE_UNVERIFIED'
    });
    const blob=Buffer.from(original.packedFloat64LEBase64,'base64');
    expect(blob.length).toBe(original.packedByteLength);
    let offset=0,matched=0;
    const seen=new Set<string>();
    for(const candidate of original.records){
      const count=blob.readUInt16LE(offset);offset+=2;
      expect(count).toBe(candidate.sourceVertexCount);
      expect(candidate.runtimePromotionAuthorized).toBe(false);
      expect(seen.has(candidate.sourceComponentId)).toBe(false);
      seen.add(candidate.sourceComponentId);
      const selected=UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.find(x=>
        x.sourceComponentId===candidate.sourceComponentId);
      if(selected){
        expect(selected.vertices).toHaveLength(count);
        expect(selected.yRange).toEqual(candidate.yRange);
        expect(selected.areaSquareMeters).toBeCloseTo(candidate.sourceAreaSquareMeters,10);
        expect(selected.side).toBe(candidate.side);
        for(let i=0;i<count;i++){
          const vertex=selected.vertices[i]!;
          const asBytes=Buffer.allocUnsafe(24);
          asBytes.writeDoubleLE(vertex[0],0);
          asBytes.writeDoubleLE(vertex[1],8);
          asBytes.writeDoubleLE(vertex[2],16);
          expect(asBytes.equals(blob.subarray(offset+i*24,offset+(i+1)*24))).toBe(true);
          matched++;
        }
      }
      offset+=24*count;
    }
    expect(offset).toBe(blob.length);
    expect(seen.size).toBe(14);
    expect(matched).toBe(12);
    console.log('T21_PHASE6_HIGH_EXACT_SOURCE',JSON.stringify({
      originalCandidates:14,selectedExactReviewMeshes:2,
      byteExactSourceVertices:matched,
      noRooftopFloorOrCeilingGameplayAuthority:true
    }));
  },60_000);
});