import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES} from '../src/stage/undertow/UndertowSpillwayPhase12CEligibleFullSourceGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES as RECOVERED,
  UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_SUMMARY as SUMMARY,
  undertowT21Phase12DRecoveredSourceErrors} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
type F={originalFaceIndex:number;originalOBJVertexIds:number[];originalProjectTriangleXYZ:number[][]};
type Comp={minOriginalFaceIndex:number;originalSourceTriangleCount:number;sourceComponentKey:string;
 originalComponentFaceAndOBJVertexIDHash:string;originalProjectYRangeMeters:number[];
 originalSource3DAreaSquareMeters:number;faces:F[]};
type Source={version:string;sourceSHA256:string;originalComponents:Comp[]};
type Gate={version:string;existingDefaultSourceMeshCount:number;existingOtherOptInSourceMeshCount:number;
 recoveredSourceMeshes:number;eligibleSourceOnlyComponents:number;perComponent:{
 sourceComponentKey:string;eligibleForSourceOnlyDisplay:boolean;outsideHardXZSamples:number;
 duplicatedNearOriginalTriangles:number;duplicatedExactOriginalTriangles:number}[]};
describe('T21 Phase12D four recovered exact 64-bit source mesh render integrity',()=>{
 it('keeps production and source display inventory frozen; opt-in only',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_PHASE12C_ELIGIBLE_ORIGINAL_SOURCE_MESHES).toHaveLength(8);
  expect(RECOVERED).toHaveLength(4);
  expect(SUMMARY).toMatchObject({originalFullSourceComponentCount:4,mirrorPairCount:2,
   originalTriangleCount:8,defaultVisible:false,gameplayAuthority:'NONE',
   reviewOnly:true,runtimePromotionAuthorized:false});
  expect(undertowT21Phase12DRecoveredSourceErrors()).toEqual([]);
 });
 it('compares all 8 original Face-ID + OBJ-ID + float64 coordinates and the pinned full source-gate',()=>{
  const src=process.env.T21_PHASE12D_RECOVERED_JSON,gate=process.env.T21_PHASE12D_RECOVERED_GATE_REPORT;
  if(!src&&!gate)return;
  if(!src||!gate||!existsSync(src)||!existsSync(gate))
    throw Error('Phase12D missing both independent original and 132-mesh source-gate');
  const o=JSON.parse(readFileSync(src,'utf8')) as Source;
  const report=JSON.parse(readFileSync(gate,'utf8')) as Gate;
  expect(o.version).toBe('T21_PHASE12D_FOUR_RECOVERED_EXACT_SOURCE_TRIANGLE_SETS_V1');
  expect(o.sourceSHA256).toBe('a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046');
  expect(report).toMatchObject({version:'T21_PHASE12D_RECOVERED_FOUR_ORIGINAL_SOURCE_RENDER_GATE_V1',
    existingDefaultSourceMeshCount:124,existingOtherOptInSourceMeshCount:8,
    recoveredSourceMeshes:4,eligibleSourceOnlyComponents:4});
  expect(new Set(report.perComponent.map(x=>x.sourceComponentKey))).toEqual(
    new Set(RECOVERED.map(x=>x.sourceComponentKey)));
  const bytes=Buffer.alloc(704);let off=0;
  for(const c of RECOVERED){
   const original=o.originalComponents.find(x=>x.sourceComponentKey===c.sourceComponentKey);
   const decision=report.perComponent.find(x=>x.sourceComponentKey===c.sourceComponentKey);
   expect(original).toBeDefined();expect(decision).toMatchObject({
     eligibleForSourceOnlyDisplay:true,outsideHardXZSamples:0,
     duplicatedNearOriginalTriangles:0,duplicatedExactOriginalTriangles:0});
   expect(c.originalComponentFaceAndOBJVertexIDHash).toBe(original!.originalComponentFaceAndOBJVertexIDHash);
   expect(c.originalSource3DAreaSquareMeters).toBe(original!.originalSource3DAreaSquareMeters);
   expect(c.originalProjectYRangeMeters).toEqual(original!.originalProjectYRangeMeters);
   expect(c.originalGlobalFaceIndices).toEqual(original!.faces.map(f=>f.originalFaceIndex));
   expect(c.originalOBJVertexIdTriples).toEqual(original!.faces.map(f=>f.originalOBJVertexIds));
   for(let i=0;i<original!.faces.length;i++){
    const face=original!.faces[i]!;
    bytes.writeUInt32LE(face.originalFaceIndex,off);
    face.originalOBJVertexIds.forEach((v,j)=>bytes.writeUInt32LE(v,off+4+j*4));
    face.originalProjectTriangleXYZ.flat().forEach((v,j)=>{
      bytes.writeDoubleLE(v,off+16+j*8);
      const direct=Buffer.alloc(8);direct.writeDoubleLE(c.vertices[i*3+Math.floor(j/3)]![j%3]!,0);
      expect(bytes.subarray(off+16+j*8,off+24+j*8).equals(direct)).toBe(true);
    });
    off+=88;
   }
  }
  expect(off).toBe(704);
  expect(createHash('sha256').update(bytes).digest('hex'))
    .toBe('ceab5ef5395508f6e3f4f230e0fc9fb3f2b560b77a92456239ca7e9946ed362e');
 });
});
