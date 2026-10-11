import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES} from '../src/stage/undertow/UndertowSpillwaySourceNativeReviewGeometry';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES} from '../src/stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES as COMPLETE,
 UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_SUMMARY as SUMMARY,
 undertowT21Phase12CEligibleSourceErrors} from '../src/stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
type Face={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:number[][]};
type Component={sourceComponentKey:string;sourceMaterial:string;sourceObject:string;
 originalTriangleCount:number;originalComponentFaceAndOBJVertexIDHash:string;
 originalSource3DAreaSquareMeters:number;originalYRangeMeters:number[];faces:Face[]};
type Original={originalSourceSHA256:string;components:Component[];originalTriangleCount:number};
type Row={sourceComponentKey:string;decision:string;sourceTriangles:number;exactSourceTriangleOverlaps:number;
 nearSourceTriangleOverlaps:number;outsideHardXZSamples:number;mirrorCandidateKeys:string[]};
type Report={version:string;candidateSourceTriangles:number;registeredExistingOriginalDisplayMeshCount:number;perComponent:Row[]};
function equal64(a:readonly number[],b:readonly number[]):boolean{
 if(a.length!==b.length)return false;
 const aa=Buffer.alloc(a.length*8),bb=Buffer.alloc(b.length*8);
 a.forEach((v,i)=>aa.writeDoubleLE(v,i*8));b.forEach((v,i)=>bb.writeDoubleLE(v,i*8));
 return aa.equals(bb);
}
describe('T21 Phase12C opt-in 8 complete pinned original source meshes',()=>{
 it('all 8 source-only meshes / 4 exact mirror pairs remain OFF by default and T20 production intact',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_SOURCE_NATIVE_REVIEW_MESHES).toHaveLength(16);
  expect(UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES).toHaveLength(16);
  expect(COMPLETE).toHaveLength(8);
  expect(SUMMARY).toMatchObject({originalSourceComponentCount:8,originalTriangleCount:70,
    originalMirrorPairCount:4,excludedSourceComponents:8,
    existingFullSourceDisplayCountUnchanged:124,defaultVisible:false,
    runtimePromotionAuthorized:false,reviewOnly:true});
  expect(undertowT21Phase12CEligibleSourceErrors()).toEqual([]);
 });
 it('matches all 70 source triangles and IDs bit-for-bit against independent pinned original, while rejecting 8 held source components',()=>{
  const originalPath=process.env.T21_PHASE12C_SOURCE_JSON;
  const reportPath=process.env.T21_PHASE12C_GATE_REPORT;
  if(!originalPath&&!reportPath)return; // npm test independent source unavailable
  if(!originalPath||!reportPath||!existsSync(originalPath)||!existsSync(reportPath))
    throw Error('Phase12C original source AND gate evidence both required');
  const source=JSON.parse(readFileSync(originalPath,'utf8')) as Original;
  const gate=JSON.parse(readFileSync(reportPath,'utf8')) as Report;
  expect(source.originalSourceSHA256).toBe('a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046');
  expect(gate.version).toBe('T21_PHASE12C_REGISTERED124_EXACT_TRIANGLE_OVERLAP_GATE_V1');
  expect(gate.candidateSourceTriangles).toBe(162);
  expect(gate.registeredExistingOriginalDisplayMeshCount).toBe(124);
  const eligible=gate.perComponent.filter(g=>g.decision==='SOURCE_ONLY_OPT_IN_REVIEW_CANDIDATE');
  expect(eligible).toHaveLength(8);
  expect(gate.perComponent.filter(g=>g.decision!=='SOURCE_ONLY_OPT_IN_REVIEW_CANDIDATE')).toHaveLength(8);
  expect(new Set(eligible.map(x=>x.sourceComponentKey))).toEqual(
    new Set(COMPLETE.map(x=>x.sourceComponentKey)));
  const raw=Buffer.alloc(70*88);let write=0;
  for(const m of COMPLETE){
    expect(m.reviewOnly).toBe(true);expect(m.runtimePromotionAuthorized).toBe(false);
    expect(m.playableFloorCollisionPaintNavAuthority).toBe('NONE');
    const comp=source.components.find(x=>x.sourceComponentKey===m.sourceComponentKey);
    expect(comp,'missing original pinned source '+m.sourceComponentKey).toBeDefined();
    const row=eligible.find(x=>x.sourceComponentKey===m.sourceComponentKey)!;
    expect(row.exactSourceTriangleOverlaps).toBe(0);
    expect(row.nearSourceTriangleOverlaps).toBe(0);
    expect(row.outsideHardXZSamples).toBe(0);
    expect(row.mirrorCandidateKeys).toHaveLength(1);
    expect(comp!.originalTriangleCount).toBe(m.vertices.length/3);
    expect(comp!.originalComponentFaceAndOBJVertexIDHash).toBe(m.originalComponentFaceAndOBJVertexIDHash);
    expect(Math.abs(comp!.originalSource3DAreaSquareMeters-m.original3DAreaSquareMeters)).toBeLessThan(1e-12);
    expect(comp!.originalYRangeMeters).toEqual(m.originalYRangeMeters);
    expect(comp!.faces.map(x=>x.originalFaceIndex)).toEqual(m.originalGlobalFaceIndices);
    expect(comp!.faces.map(x=>x.originalOBJVertexIds)).toEqual(m.originalOBJVertexIdTriples);
    for(let i=0;i<comp!.faces.length;i++){
      const f=comp!.faces[i]!;
      expect(equal64(f.originalProjectTriangleXYZ.flat(),m.vertices.slice(i*3,i*3+3).flat())).toBe(true);
      raw.writeUInt32LE(f.originalFaceIndex,write);
      f.originalOBJVertexIds.forEach((v,j)=>raw.writeUInt32LE(v,write+4+j*4));
      f.originalProjectTriangleXYZ.flat().forEach((v,j)=>raw.writeDoubleLE(v,write+16+j*8));
      write+=88;
    }
  }
  expect(write).toBe(6160);
  expect(createHash('sha256').update(raw).digest('hex')).toBe(
   'a00604a007e0e239adc483ddcde3e7623f45c2b164e5a6cc8712fead654c27e9');
 });
});
