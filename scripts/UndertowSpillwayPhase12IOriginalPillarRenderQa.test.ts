import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as MESHES,
 UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS_SUMMARY as SUMMARY}
 from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
type XYZ=readonly[number,number,number];
type F={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectTriangleXYZ:[XYZ,XYZ,XYZ]};
type Original={originalMinFace:number;originalMirrorMinFace:number;
 sourceComponentKey:string;sourceObject:string;sourceMaterial:string;
 originalTriangleCount:number;original3DAreaSquareMeters:number;
 componentFaceAndOriginalOBJVertexIDHash:string;faces:F[]};
type Source={version:string;originalSourceSHA256:string;
 candidateSourceMirroredComponents:Original[];reviewOnly:true;runtimePromotionAuthorized:false};
type GateEntry={originalMinFace:number;originalMirrorMinFace:number;
 originalHardXZOutsideSampleCount:number;originalHardXZProperEdgeCrossings:number;
 originalHardXZBoundaryVerticesEnclosedInTriangleCount:number;
 exactDisplayedTriangleDuplicates:number;nearDisplayedTriangleDuplicates:number;
 mirrorFullOriginalVertexIDMultisetMatched:boolean;decision:string};
type Gate={version:string;sourceOnlyEligibleComponents:number;
 sourceOnlyEligibleCompleteMirroredPairs:number;perComponent:GateEntry[];
 runtimePromotionAuthorized:false};
const APPROVED=[12934,12956,13110,13132,13176,13220];
describe('T21 Phase12I exact 132 original face large pillars source-only review',()=>{
 it('keeps Phase12I review meshes strictly optional and no T20 runtime promotion',()=>{
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
   expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
   expect(SUMMARY).toMatchObject({
      componentCount:6,mirrorPairCount:3,originalTriangleCount:132,
      frozenDefaultSourceComponentCount:124,previousOptionalSourceComponentCount:12,
      defaultVisible:false,reviewOnly:true,runtimePromotionAuthorized:false,gameplayAuthority:'NONE',
      originalPackedFloat64FaceVertexIDDigest:'b158e4843e2c9d3afbe45da481e8383ddd5096f5d022fa7e0ca57dc5bbc4c250'
   });
   expect(MESHES.map(c=>c.originalMinFace)).toEqual(APPROVED);
   expect(MESHES.every(c=>!c.runtimePromotionAuthorized&&
     c.gameplayFloorCollisionPaintNavScoringAuthority==='NONE'&&c.reviewOnly)).toBe(true);
 });
 it('byte-exact compares all 132 original Float64 vertices and OBJ face/id triples with independent full 43MB original survey',()=>{
   const surveyPath=process.env.T21_PHASE12I_SOURCE_JSON;
   const gatePath=process.env.T21_PHASE12I_GATE_REPORT;
   if(!surveyPath||!gatePath)return;
   if(!existsSync(surveyPath)||!existsSync(gatePath))throw Error('T21 Phase12I original source report/gate missing');
   const survey=JSON.parse(readFileSync(surveyPath,'utf8')) as Source;
   const gate=JSON.parse(readFileSync(gatePath,'utf8')) as Gate;
   expect(survey.version).toBe('T21_PHASE12I_WHOLE_STATIC_ORIGINAL_COMPONENT_MIRROR_SURVEY_V1');
   expect(survey.originalSourceSHA256).toBe(SUMMARY.sourceSHA256);
   expect(survey.reviewOnly).toBe(true);expect(survey.runtimePromotionAuthorized).toBe(false);
   expect(gate).toMatchObject({
     version:'T21_PHASE12I_INDEPENDENT_136_EXISTING_SOURCE_AND_FULL_HARD_XZ_GATE_V1',
     sourceOnlyEligibleComponents:6,sourceOnlyEligibleCompleteMirroredPairs:3,
     runtimePromotionAuthorized:false
   });
   const original=new Map(survey.candidateSourceMirroredComponents.map(c=>[c.originalMinFace,c]));
   const approved=new Map(gate.perComponent.map(c=>[c.originalMinFace,c]));
   const buf=Buffer.alloc(132*88);
   let byte=0;
   let totalSourceArea=0;
   for(const c of MESHES){
     const expected=original.get(c.originalMinFace),decision=approved.get(c.originalMinFace);
     expect(expected).toBeDefined();expect(decision).toBeDefined();
     expect(decision!.decision).toBe('SOURCE_ONLY_OPTIONAL_REVIEW_CANDIDATE');
     expect(decision!.mirrorFullOriginalVertexIDMultisetMatched).toBe(true);
     for(const name of ['originalHardXZOutsideSampleCount',
       'originalHardXZProperEdgeCrossings','originalHardXZBoundaryVerticesEnclosedInTriangleCount',
       'exactDisplayedTriangleDuplicates','nearDisplayedTriangleDuplicates'] as const)
       expect(decision![name]).toBe(0);
     expect(c.originalMirrorMinFace).toBe(decision!.originalMirrorMinFace);
     expect(c.sourceObject).toBe(expected!.sourceObject);
     expect(c.sourceMaterial).toBe(expected!.sourceMaterial);
     expect(c.sourceComponentId).toBe(expected!.sourceComponentKey);
     expect(c.originalComponentFaceAndOBJVertexIDHash).toBe(expected!.componentFaceAndOriginalOBJVertexIDHash);
     expect(c.originalGlobalFaceIndices).toHaveLength(22);
     expect(c.originalOBJVertexIdTriples).toHaveLength(22);
     expect(c.vertices).toHaveLength(66);
     expect(expected!.faces).toHaveLength(22);
     totalSourceArea+=c.originalSource3DAreaSquareMeters;
     expect(c.originalSource3DAreaSquareMeters).toBeCloseTo(expected!.original3DAreaSquareMeters,9);
     for(let i=0;i<22;i++){
       const source=expected!.faces[i]!;
       const ids=c.originalOBJVertexIdTriples[i]!;
       expect(c.originalGlobalFaceIndices[i]).toBe(source.originalFaceIndex);
       expect(ids).toEqual(source.originalOBJVertexIds);
       buf.writeUInt32LE(source.originalFaceIndex,byte);
       for(let n=0;n<3;n++)buf.writeUInt32LE(ids[n]!,byte+4+n*4);
       for(let n=0;n<3;n++){
         const vertex=c.vertices[i*3+n]!;
         const xyz=source.originalProjectTriangleXYZ[n]!;
         for(let k=0;k<3;k++){
           const check=Buffer.alloc(8);check.writeDoubleLE(vertex[k],0);
           const original=Buffer.alloc(8);original.writeDoubleLE(xyz[k],0);
           expect(check.equals(original)).toBe(true);
           buf.writeDoubleLE(vertex[k],byte+16+n*24+k*8);
         }
       }
       byte+=88;
     }
   }
   expect(byte).toBe(11616);
   expect(createHash('sha256').update(buf).digest('hex')).toBe(
     SUMMARY.originalPackedFloat64FaceVertexIDDigest);
   expect(SUMMARY.totalOriginal3DAreaSquareMeters).toBeCloseTo(totalSourceArea,8);
 });
 it('uses isolated switchable browser review root; does not change mandatory five view',()=>{
   const app=readFileSync('src/app/UndertowVisualReviewApp.ts','utf8');
   const capture=readFileSync('scripts/t21-review-five-view-capture.mjs','utf8');
   expect(app).toContain("this.phase12IPillarRoot.enabled=false;");
   expect(app).toContain("this.canvas.dataset.t21ReviewPhase12IPillars='off';");
   expect(app).toContain("private focusPhase12IOriginalPillars(selected:'ALL'|number):void");
   expect(app).toContain("this.canvas.dataset.t21ReviewPreset='PHASE12I_PINNED_ORIGINAL_PILLARS_ONLY'");
   expect(capture).toContain('manifest.phase12IOriginalPillarDiagnostics=[]');
   expect(capture).toContain("for(const choice of ['ALL','12934','12956','13176'])");
   expect(capture).toContain("authorizesVisualFreeze:false");
 });
});
