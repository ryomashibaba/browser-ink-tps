import { readFileSync, existsSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES } from '../src/stage/undertow/UndertowSpillwayVerticalSourcePhase5BGeometry';
import { UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES } from '../src/stage/undertow/UndertowSpillwayHighSourcePhase6Geometry';
import { UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES } from '../src/stage/undertow/UndertowSpillwayPhase7FramedSourceGeometry';
import { UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES } from '../src/stage/undertow/UndertowSpillwayPhase8StaticSourceGeometry';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES,UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY,undertowT21Phase9DownfaceErrors } from '../src/stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
interface SourceRecord{
  pairId:number;kind:string;sourceComponentId:string;sourceMaterial:string;
  originalSourceAreaSquareMeters:number;originalVertexCount:number;
  originalYRange:number[];side:string;
  mirrorMaxDeviationMeters:number;outsideHardBoundarySamples:number;
  floorCeilingColliderAndConnectivityAuthority:string;
  reviewOnly:boolean;runtimePromotionAuthorized:boolean;
}
interface OriginalFixture{
  version:string;sourceDownfacingInventoryVersion:string;
  meshCount:number;mirrorPairs:number;originalSourceVertexCount:number;
  originalSource3DTriangleAreaSquareMeters:number;
  records:SourceRecord[];
  originalBinary64LEPackedBase64:string;
  originalPackedByteLength:number;sourceDownfacingNotPlayableUnderfloor:boolean;
  sourceRuntimeMeaning:string;runtimePromotionAuthorized:boolean;reviewOnly:boolean;
}
describe('T21 Phase9 source-only downward oriented faces',()=>{
  it('retains T20 production, frozen floor inventory, source-only 124 unique review mesh IDs',()=>{
    expect(undertowT21Phase9DownfaceErrors()).toEqual([]);
    expect(UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY).toMatchObject({
      sourceComponentCount:10,sourceVertexCount:84,mirroredPairs:5,
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES).toHaveLength(12);
    expect(UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES).toHaveLength(2);
    expect(UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES).toHaveLength(20);
    expect(UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES).toHaveLength(16);
    const all=[
      ...UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_VERTICAL_SOURCE_PHASE5B_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_HIGH_SOURCE_PHASE6_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE7_FRAMED_SOURCE_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE8_STATIC_SOURCE_MESHES.map(x=>x.sourceComponentId),
      ...UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.map(x=>x.sourceComponentId)
    ];
    expect(all).toHaveLength(124);
    expect(new Set(all).size).toBe(124);
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
  it('matches all 84 original binary64 XYZ triples byte-for-byte against independently pinned OBJ extraction',()=>{
    const path=process.env.T21_PHASE9_EXACT_SOURCE_JSON;
    if(!path||!existsSync(path)){console.log('T21 Phase9 source original fixture present in dedicated PR CI');return;}
    const fixture=JSON.parse(readFileSync(path,'utf8')) as OriginalFixture;
    expect(fixture).toMatchObject({
      version:'T21_PHASE9_SELECTED_UNDERFACE_EXACT_V1',
      sourceDownfacingInventoryVersion:'T21_PHASE9_DOWNFACING_TRIANGLE_AUDIT_V1',
      meshCount:10,mirrorPairs:5,originalSourceVertexCount:84,
      originalPackedByteLength:2036,
      sourceDownfacingNotPlayableUnderfloor:true,
      sourceRuntimeMeaning:'UNVERIFIED',
      runtimePromotionAuthorized:false,reviewOnly:true
    });
    const bytes=Buffer.from(fixture.originalBinary64LEPackedBase64,'base64');
    expect(bytes.byteLength).toBe(2036);
    let i=0,verified=0;
    for(const [index,source] of fixture.records.entries()){
      const m=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[index]!;
      const count=bytes.readUInt16LE(i);i+=2;
      expect(count).toBe(source.originalVertexCount);
      expect(m.vertices).toHaveLength(count);
      expect(m.sourceComponentId).toBe(source.sourceComponentId);
      expect(m.sourceMaterial).toBe(source.sourceMaterial);
      expect(m.kind).toBe(source.kind);
      expect(m.pairId).toBe(source.pairId);
      expect(m.side).toBe(source.side);
      expect(m.yRange).toEqual(source.originalYRange);
      expect(m.areaSquareMeters).toBeCloseTo(source.originalSourceAreaSquareMeters,10);
      expect(source.outsideHardBoundarySamples).toBe(0);
      expect(source.mirrorMaxDeviationMeters).toBeLessThan(0.0002);
      expect(source.floorCeilingColliderAndConnectivityAuthority).toBe('NONE');
      expect(source.runtimePromotionAuthorized).toBe(false);
      expect(source.reviewOnly).toBe(true);
      for(const [n,p] of m.vertices.entries()){
        const compared=Buffer.allocUnsafe(24);
        compared.writeDoubleLE(p[0],0);compared.writeDoubleLE(p[1],8);compared.writeDoubleLE(p[2],16);
        expect(compared.equals(bytes.subarray(i+24*n,i+24*(n+1))),
          source.sourceComponentId+' original vertex '+n).toBe(true);
        verified++;
      }
      i+=24*count;
    }
    expect(i).toBe(bytes.byteLength);
    expect(verified).toBe(84);
    expect(UNDERTOW_T21_PHASE9_DOWNFACE_SUMMARY.original3DTriangleAreaSquareMeters)
      .toBeCloseTo(fixture.originalSource3DTriangleAreaSquareMeters,9);
    console.log('T21_PHASE9_DOWNFACING_EXACT_SOURCE_PASS',JSON.stringify({
      originalBinary64XYZ:verified,
      sourceOnlyMeshes:10,
      original3DArea:fixture.originalSource3DTriangleAreaSquareMeters,
      floorOrRoofGameplayPromotion:false
    }));
  });
});