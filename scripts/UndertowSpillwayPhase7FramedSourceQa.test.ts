import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES } from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES } from '../src/stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import {
  UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES,
  UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY,
  undertowT21Phase7FramedSourceErrors
} from '../src/stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
type SourceRecord={
  pairId:number;kind:'SIDE_SUPPORT'|'MID_GLASS_FRAME';
  sourceComponentId:string;sourceMaterial:string;
  sourceAreaSquareMeters:number;originalVertexCount:number;
  originalYRange:number[];outsideHardBoundarySamples:number;
  maxAbsNormalY:number;mirrorMaxDeltaMeters:number;
  pairAreaDeltaSquareMeters:number;
  gameplayAuthority:string;runtimePromotionAuthorized:false;
};
type OriginalFixture={
  version:string;sourceAuditVersion:string;
  pairCount:number;meshCount:number;originalVertexCount:number;
  selectedVerticalSourceAreaSquareMeters:number;
  independentOriginalPackedFloat64Base64:string;
  independentOriginalPackedByteLength:number;
  dictionaryCount:number;
  records:SourceRecord[];
  activeObjectInstanceAndPaintCollisionNavAuthority:string;
  originalSourceTriangleUVsAndLiveMaterials:string;
  reviewOnly:boolean;runtimePromotionAuthorized:boolean;
};
describe('T21 Phase7 original 3D side supports + mid glass frames',()=>{
  it('registers ONLY source 20 review faces, no runtime or floor XZ promotion',()=>{
    expect(undertowT21Phase7FramedSourceErrors()).toEqual([]);
    expect(UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY).toMatchObject({
      sourceMeshCount:20,sideSupportMeshes:12,midGlassFrameMeshes:8,
      sourceVertexCount:1272,mirrorPairCount:10,
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES).toHaveLength(12);
    expect(UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES).toHaveLength(2);
    const all=[
      ...UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.map(x=>x.sourceComponentId)
    ];
    expect(all.length).toBe(98);
    expect(new Set(all).size).toBe(98);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('byte-compares all 1272 original Float64 source XYZ vertices with independent pinned-OBJ extraction',()=>{
    const file=process.env.T21_PHASE7_SOURCE_JSON;
    if(!file||!existsSync(file)){
      console.log('T21 Phase7 exact original OBJ source fixture is supplied only in PR CI');
      return;
    }
    const d=JSON.parse(readFileSync(file,'utf8')) as OriginalFixture;
    expect(d).toMatchObject({
      version:'T21_PHASE7_FRAMED_SOURCE_V1',
      sourceAuditVersion:'PASS18C_SOURCE_NATIVE_V1',
      pairCount:10,meshCount:20,originalVertexCount:1272,
      independentOriginalPackedByteLength:30568,
      dictionaryCount:144,
      activeObjectInstanceAndPaintCollisionNavAuthority:'NONE',
      originalSourceTriangleUVsAndLiveMaterials:'UNVERIFIED',
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    const buf=Buffer.from(d.independentOriginalPackedFloat64Base64,'base64');
    expect(buf.byteLength).toBe(d.independentOriginalPackedByteLength);
    let cursor=0;
    let verified=0;
    for(const [i,r] of d.records.entries()){
      const mesh=UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES[i]!;
      const n=buf.readUInt16LE(cursor);cursor+=2;
      expect(mesh.sourceComponentId).toBe(r.sourceComponentId);
      expect(mesh.sourceMaterial).toBe(r.sourceMaterial);
      expect(mesh.kind).toBe(r.kind);
      expect(mesh.pairId).toBe(r.pairId);
      expect(mesh.areaSquareMeters).toBeCloseTo(r.sourceAreaSquareMeters,10);
      expect(mesh.yRange).toEqual(r.originalYRange);
      expect(mesh.vertices).toHaveLength(n);
      expect(n).toBe(r.originalVertexCount);
      expect(r.outsideHardBoundarySamples).toBe(0);
      expect(r.maxAbsNormalY).toBeLessThanOrEqual(0.32+1e-12);
      expect(r.mirrorMaxDeltaMeters).toBeLessThanOrEqual(0.0002);
      expect(r.pairAreaDeltaSquareMeters).toBeLessThanOrEqual(0.001);
      expect(r.gameplayAuthority).toBe('NONE');
      expect(r.runtimePromotionAuthorized).toBe(false);
      for(const [j,v] of mesh.vertices.entries()){
        const target=buf.subarray(cursor+j*24,cursor+(j+1)*24);
        const actual=Buffer.allocUnsafe(24);
        actual.writeDoubleLE(v[0],0);
        actual.writeDoubleLE(v[1],8);
        actual.writeDoubleLE(v[2],16);
        expect(actual.equals(target),r.sourceComponentId+' vertex '+j).toBe(true);
        verified++;
      }
      cursor+=n*24;
    }
    expect(cursor).toBe(buf.byteLength);
    expect(verified).toBe(1272);
    expect(UNDERTOW_T21_PHASE7_FRAMED_SOURCE_SUMMARY.sourceTriangleAreaSquareMeters)
      .toBeCloseTo(d.selectedVerticalSourceAreaSquareMeters,9);
    console.log('T21_PHASE7_ORIGINAL_VERTEX_SOURCE_PASS',JSON.stringify({
      originalFloat64XYZVertices:verified,reviewFaces:20,pairs:10,
      originalSource3DArea:d.selectedVerticalSourceAreaSquareMeters,
      areaNotWalkableFloor:true,gameplayPromotionAuthorized:false
    }));
  },60_000);
});