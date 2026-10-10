import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as M,
 UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS_SUMMARY as S}
 from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';

const FACES=[13154,13198,63834,63858];
describe('T21 Phase12K two original mirror pairs, opt-in source visual only',()=>{
 it('protects production and default review inventory',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(S).toMatchObject({
   componentCount:4,mirrorPairCount:2,originalTriangleCount:92,
   frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:18,
   originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
   originalPackedFloat64FaceVertexIDDigest:'447baf35dfbab26e12f310842d309ee2162b86de1791afea2ea6e52251275c75',
   defaultVisible:false,reviewOnly:true,runtimePromotionAuthorized:false,gameplayAuthority:'NONE'
  });
  expect(M.map(m=>m.originalMinFace)).toEqual(FACES);
  expect(M.map(m=>m.reviewGroup)).toEqual(['OLD','OLD','CUT','CUT']);
  for(const m of M){
   expect(m.reviewOnly).toBe(true);
   expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
   expect(m.originalMirrorMinFace).not.toBe(m.originalMinFace);
   expect(M.find(x=>x.originalMinFace===m.originalMirrorMinFace)?.originalMirrorMinFace)
    .toBe(m.originalMinFace);
  }
 });
 it('matches every original Face ID / OBJ vertex ID / Float64 XYZ byte-for-byte with pinned Phase12J independent 142-mesh 42-point hard-XZ PASS',()=>{
  const a=process.env.T21_PHASE12J_SOURCE_JSON,b=process.env.T21_PHASE12J_GATE_REPORT;
  if(!a&&!b)return;
  if(!a||!b||!existsSync(a)||!existsSync(b))
   throw Error('Phase12K requires BOTH pinned independent source and gate reports');
  const source=JSON.parse(readFileSync(a,'utf8'));
  const gate=JSON.parse(readFileSync(b,'utf8'));
  expect(source.originalSourceSHA256).toBe(S.originalSourceSHA256);
  expect(source.originalActiveFaceCount).toBe(70396);
  expect(source.selectedFullSourceComponentCount).toBe(44);
  expect(source.selectedOriginalTriangleCount).toBe(972);
  expect(gate.version).toBe('T21_PHASE12J_INDEPENDENT_142_SOURCE_AND_42_POINT_XZ_GATE_V1');
  expect(gate.originalSourceSHA256).toBe(S.originalSourceSHA256);
  expect(gate.existingDefaultSourceMeshes).toBe(124);
  expect(gate.alreadyOptionalPreviousSourceMeshes).toBe(18);
  expect(gate.sourceOnlyEligibleComponents).toBe(44);
  expect(gate.sourceOnlyEligibleMirrorPairs).toBe(22);
  expect(gate.gameplayAuthority).toBe('NONE');
  const orig=new Map<number,any>(source.selectedFullOriginalSourceComponents.map((c:any)=>[c.minFace,c]));
  const approved=new Map<number,any>(gate.perComponent.map((c:any)=>[c.minFace,c]));
  const bytes=Buffer.alloc(92*88);
  let offset=0;
  const globallyUsedFaces=new Set<number>();
  for(const m of M){
   const c=orig.get(m.originalMinFace),g=approved.get(m.originalMinFace);
   expect(c).toBeDefined();expect(g).toBeDefined();
   expect(g.decision).toBe('OPTIONAL_SOURCE_VISUAL_REVIEW_CANDIDATE_ONLY');
   expect(g.originalMirrorVertexMultisetMatched).toBe(true);
   for(const key of ['originalHardXZSevenSampleOutsideCount',
    'originalHardXZRingEdgeProperIntersections','originalHardXZRingVerticesInsideOriginalTriangles',
    'exactExistingSourceTriangleDuplicates','nearExistingSourceTriangleDuplicates'])
     expect(g[key]).toBe(0);
   expect(c.mirrorOriginalMinFace).toBe(m.originalMirrorMinFace);
   expect(c.sourceComponentKey).toBe(m.sourceComponentId);
   expect(c.sourceObject).toBe(m.sourceObject);
   expect(c.sourceMaterial).toBe(m.sourceMaterial);
   expect(c.originalSourceComponentFaceAndOBJVertexIDHash).toBe(m.originalComponentFaceAndOBJVertexIDHash);
   expect(c.sourceTriangleCount).toBe(m.originalSourceTriangleCount);
   expect(c.originalTriangleArea3DSquareMeters).toBeCloseTo(m.originalSource3DAreaSquareMeters,9);
   expect(c.faces).toHaveLength(m.originalSourceTriangleCount);
   expect(m.vertices).toHaveLength(m.originalSourceTriangleCount*3);
   for(let f=0;f<c.faces.length;f++){
    const face=c.faces[f];
    expect(globallyUsedFaces.has(face.originalFaceIndex)).toBe(false);
    globallyUsedFaces.add(face.originalFaceIndex);
    expect(face.originalFaceIndex).toBe(m.originalGlobalFaceIndices[f]);
    expect(face.originalOBJVertexIds).toEqual(m.originalOBJVertexIdTriples[f]);
    bytes.writeUInt32LE(face.originalFaceIndex,offset);
    for(let n=0;n<3;n++)bytes.writeUInt32LE(face.originalOBJVertexIds[n],offset+4+n*4);
    for(let n=0;n<3;n++)for(let axis=0;axis<3;axis++){
     const v=m.vertices[f*3+n]![axis]!;
     const expected=face.originalProjectTriangleXYZ[n][axis];
     const a=Buffer.alloc(8),b=Buffer.alloc(8);
     a.writeDoubleLE(v);b.writeDoubleLE(expected);
     expect(a.equals(b)).toBe(true);
     bytes.writeDoubleLE(v,offset+16+n*24+axis*8);
    }
    offset+=88;
   }
  }
  expect(offset).toBe(8096);
  expect(globallyUsedFaces.size).toBe(92);
  expect(createHash('sha256').update(bytes).digest('hex'))
   .toBe(S.originalPackedFloat64FaceVertexIDDigest);
 });
 it('has separate OFF roots and separate real WebGL2 capture, not a sixth mandatory view',()=>{
  const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
  const cap=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
  expect(app).toContain('this.phase12KOldRoot.enabled=false;');
  expect(app).toContain('this.phase12KCutRoot.enabled=false;');
  expect(app).toContain("private focusPhase12KNeighbors(selected:'ALL'|'OLD'|'CUT'):void");
  expect(cap).toContain("manifest.phase12KOriginalNeighborDiagnostics=[];");
  expect(cap).toContain("for(const choice of ['ALL','OLD','CUT'])");
  expect(cap).toContain('authorizesVisualFreeze:false');
  expect(cap).toContain("const views=['OVERVIEW','TOP','POS_TO_NEG','SPAWN_A','SPAWN_B'];");
 });
});
