import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES} from '../src/stage/undertow/UndertowSpillwayPhase11NearestSourceDiagnostic';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES as FACES,UNDERTOW_T21_PHASE12_FAMILY_SUMMARY,undertowT21Phase12FamilyErrors} from '../src/stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
type Candidate={sourceObject:string;sourceMaterial:string;originalOrientation:string;
 originalFaceIndex:number;originalFaceOBJVertexIds:number[];originalSourceTriangleXYZ:number[][];closest3DDistanceMeters:number};
type Fixture={originalSourceSHA256:string;reviewOnly:boolean;runtimePromotionAuthorized:boolean;
 perEdge:{sourceComponentId:string;boundaryEdgeIndex:number;closestOriginalSourceCandidates:Candidate[]}[]};
describe('T21 Phase12 independent pinned-original source-family triangles',()=>{
 it('does not promote source evidence into gameplay or count samples as components',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES).toHaveLength(16);
  expect(undertowT21Phase12FamilyErrors()).toEqual([]);
  expect(UNDERTOW_T21_PHASE12_FAMILY_SUMMARY).toMatchObject({
   sourceFaceSamples:16,materialFamilies:5,fullOriginalSourceComponentsAdded:0,
   sourceInventoryFloorsAdded:0,verifiedConnectivity:0,reviewOnly:true,
   runtimePromotionAuthorized:false
  });
  expect([...new Set(FACES.map(x=>x.sourceFamily))].sort()).toEqual(
   ['FloorLine02','Glass01','GlassEdge00','PillarBase02','WallMetal00']);
  expect(FACES.every(x=>!UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES.some(y=>
   y.originalCandidateFaceIndex===x.originalFaceIndex))).toBe(true);
 });
 it('byte-compares all 16 original face XYZ/gaps and checks face/OBJ vertex IDs from independent CI original extraction',()=>{
  const path=process.env.T21_PHASE11_SOURCE_JSON;
  if(!path)return; // regular npm test has no independent pinned 43MB OBJ fixture
  if(!existsSync(path))throw Error('Missing Phase12 independent original source fixture: '+path);
  const fixture=JSON.parse(readFileSync(path,'utf8')) as Fixture;
  expect(fixture.originalSourceSHA256).toBe('a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046');
  expect(fixture.runtimePromotionAuthorized).toBe(false);
  expect(fixture.reviewOnly).toBe(true);
  expect(fixture.perEdge).toHaveLength(16);
  const encode=(gap:number,vertices:readonly (readonly number[])[])=>{
   const b=Buffer.alloc(80);b.writeDoubleLE(gap,0);
   vertices.forEach((v,i)=>v.forEach((x,j)=>b.writeDoubleLE(x,8+i*24+j*8)));
   return b;
  };
  for(const sample of FACES){
   const edge=fixture.perEdge.find(x=>x.sourceComponentId===sample.sourceUnderfaceId&&
    x.boundaryEdgeIndex===sample.sourceUnderfaceEdgeIndex&&
    x.closestOriginalSourceCandidates.some(c=>c.originalFaceIndex===sample.originalFaceIndex));
   expect(edge,'Source edge binding missing for face '+sample.originalFaceIndex).toBeDefined();
   const candidate=edge!.closestOriginalSourceCandidates.find(c=>c.originalFaceIndex===sample.originalFaceIndex)!;
   expect(sample.originalSourceObject).toBe(candidate.sourceObject);
   expect(sample.originalSourceMaterial).toBe(candidate.sourceMaterial);
   expect(sample.originalOrientation).toBe(candidate.originalOrientation);
   expect(sample.originalFaceOBJVertexIds).toEqual(candidate.originalFaceOBJVertexIds);
   expect(encode(sample.exactSource3DGapMeters,sample.vertices).equals(
    encode(candidate.closest3DDistanceMeters,candidate.originalSourceTriangleXYZ)),
    'Phase12 exact Float64 XYZ/gap drift face '+sample.originalFaceIndex).toBe(true);
  }
 });
});
