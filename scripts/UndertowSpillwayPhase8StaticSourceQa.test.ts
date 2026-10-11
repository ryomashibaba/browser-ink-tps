import { readFileSync,existsSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES } from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES } from '../src/stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import { UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES } from '../src/stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import { UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES,
  UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY,
  undertowT21Phase8OriginalSourceErrors
} from '../src/stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
interface Fixture {
  version:string;
  pairCount:number;
  originalNearVerticalFaceComponents:number;
  originalVertexCount:number;
  source3DTriangleAreaSquareMeters:number;
  originalIndependentLEFloat64Base64:string;
  originalIndependentByteLength:number;
  coordinateDictionaryCount:number;
  reviewOnly:boolean;
  runtimePromotionAuthorized:boolean;
  playableFloorConnectivityColliderPaintNavAuthority:string;
  records:Array<{
    pairId:number;kind:string;sourceComponentId:string;sourceMaterial:string;
    sourceAreaSquareMeters:number;originalVertexCount:number;originalYRange:number[];
    side:string;sourceFaceOnlyNotWholeObject:boolean;runtimePromotionAuthorized:false;
    outsideHardBoundarySamples:number;originalMaxAbsNormalY:number;
    measuredSourceMirrorMaxDeltaMeters:number;
  }>;
}
describe('T21 Phase8 source-native vertical tower/flank/edge faces',()=>{
  it('does not mutate 64 floor inventory, T20 production or inactive T21 runtime authority',()=>{
    expect(undertowT21Phase8OriginalSourceErrors()).toEqual([]);
    expect(UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY).toMatchObject({
      originalComponentCount:16,centralTowerCount:8,flankSupportCount:4,
      edgeLinerCount:4,originalVertexCount:636,mirrorPairCount:8,
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES).toHaveLength(12);
    expect(UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES).toHaveLength(2);
    expect(UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES).toHaveLength(20);
    const ids=[
      ...UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.map(x=>x.sourceComponentId)
    ];
    expect(ids).toHaveLength(114);
    expect(new Set(ids).size).toBe(114);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('byte-for-byte matches every original source binary64 XYZ triple with the pinned OBJ independent fixture',()=>{
    const path=process.env.T21_PHASE8_SOURCE_JSON;
    if(!path||!existsSync(path)){
      console.log('Phase8 pinned original fixture only available in PR CI');
      return;
    }
    const evidence=JSON.parse(readFileSync(path,'utf8')) as Fixture;
    expect(evidence).toMatchObject({
      version:'T21_PHASE8_STATIC_SUPPORT_SOURCE_V1',
      originalNearVerticalFaceComponents:16,pairCount:8,
      originalVertexCount:636,originalIndependentByteLength:15296,
      coordinateDictionaryCount:229,reviewOnly:true,
      runtimePromotionAuthorized:false,
      playableFloorConnectivityColliderPaintNavAuthority:'NONE'
    });
    const bytes=Buffer.from(evidence.originalIndependentLEFloat64Base64,'base64');
    expect(bytes.byteLength).toBe(evidence.originalIndependentByteLength);
    let cursor=0,verified=0;
    for(const [i,record] of evidence.records.entries()){
      const mesh=UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES[i]!;
      const n=bytes.readUInt16LE(cursor);cursor+=2;
      expect(n).toBe(record.originalVertexCount);
      expect(mesh.vertices).toHaveLength(n);
      expect(mesh.sourceComponentId).toBe(record.sourceComponentId);
      expect(mesh.sourceMaterial).toBe(record.sourceMaterial);
      expect(mesh.kind).toBe(record.kind);
      expect(mesh.pairId).toBe(record.pairId);
      expect(mesh.yRange).toEqual(record.originalYRange);
      expect(mesh.areaSquareMeters).toBeCloseTo(record.sourceAreaSquareMeters,10);
      expect(mesh.side).toBe(record.side);
      expect(record.sourceFaceOnlyNotWholeObject).toBe(true);
      expect(record.runtimePromotionAuthorized).toBe(false);
      expect(record.outsideHardBoundarySamples).toBe(0);
      expect(record.originalMaxAbsNormalY).toBeLessThanOrEqual(0.32+1e-12);
      expect(record.measuredSourceMirrorMaxDeltaMeters).toBeLessThanOrEqual(0.0002);
      for(const [j,v] of mesh.vertices.entries()){
        const actual=Buffer.allocUnsafe(24);
        actual.writeDoubleLE(v[0],0);
        actual.writeDoubleLE(v[1],8);
        actual.writeDoubleLE(v[2],16);
        expect(actual.equals(bytes.subarray(cursor+j*24,cursor+(j+1)*24)),
          record.sourceComponentId+' original vertex '+j).toBe(true);
        verified++;
      }
      cursor+=n*24;
    }
    expect(cursor).toBe(bytes.byteLength);
    expect(verified).toBe(636);
    expect(UNDERTOW_T21_PHASE8_STATIC_SOURCE_SUMMARY.originalSource3DAreaSquareMeters)
      .toBeCloseTo(evidence.source3DTriangleAreaSquareMeters,9);
    console.log('T21_PHASE8_SOURCE_EXACT_PASS',JSON.stringify({
      originalXYZVertices:verified,sourceFaces:16,
      source3DTriangleArea:evidence.source3DTriangleAreaSquareMeters,
      approvedGameplayGeometry:false
    }));
  });
});