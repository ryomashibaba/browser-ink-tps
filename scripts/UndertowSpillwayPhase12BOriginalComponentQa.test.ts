import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12_FAMILY_TRIANGLES as SAMPLES} from '../src/stage/undertow/UndertowSpillwayPhase12SourceFamilyGeometry';
type Face={originalFaceIndex:number;originalOBJVertexIds:number[];sourceObject:string;
  sourceMaterial:string;sourceComponentKey:string;underfaceSourceComponentId:string;
  underfaceBoundaryEdgeIndex:number;originalProjectTriangleXYZ:number[][];source3DDistanceFromUnderfaceMeters:number};
type Connected={sourceComponentKey:string;sourceObject:string;sourceMaterial:string;
  minOriginalFaceIndex:number;originalTriangleCount:number;originalVertexIdCount:number;
  sampledOriginalFaceIndices:number[];allOriginalFaceIndices:number[];
  componentFaceAndOBJVertexIDHash:string;originalSourceTriangle3DAreaSquareMeters:number;
  bboxProjectXYZ:number[];originalProjectYRangeMeters:number[];
  sourceTopologyAuthority:string;fullComponentAlreadyDisplayedIn124:string;
  gameplayFloorCollisionPaintNavAuthority:string;reviewOnly:boolean;runtimePromotionAuthorized:boolean};
type Ledger={version:string;originalSourceSHA256:string;sourceSizeBytes:number;
  originalActiveFaceCount:number;componentAlgorithm:string;sourceScope:string;
  trackedOriginalSourceFaces:number;trackedSourceObjectMaterialGroups:number;
  uniqueOriginalVertexIDConnectedComponents:number;selectedComponents:Connected[];
  perFace:Face[];originalFullReviewComponentsAdded:number;
  currentFullReviewComponents:number;currentWalkSourceComponents:number;
  gameplayCollisionPaintNavAuthority:string;reviewOnly:boolean;runtimePromotionAuthorized:boolean};
describe('T21 Phase12B pinned OBJ shared-vertex component graph',()=>{
  it('keeps 64/124 source inventory, T20 production and T21 runtime inert',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(SAMPLES).toHaveLength(16);
    expect([...new Set(SAMPLES.map(s=>s.sourceFamily))]).toHaveLength(5);
  });
  it('audits 16 real source faces with distinct fully connected original OBJ vertex-ID components',()=>{
    const path=process.env.T21_PHASE12B_COMPONENT_JSON;
    if(!path)return; // original 43 MB OBJ available only in pinned-source CI
    if(!existsSync(path))throw Error('Missing mandatory Phase12B original component graph: '+path);
    const data=JSON.parse(readFileSync(path,'utf8')) as Ledger;
    expect(data).toMatchObject({
      version:'T21_PHASE12B_ORIGINAL_VERTEX_ID_COMPONENT_GRAPH_V1',
      originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
      sourceSizeBytes:43263289,
      componentAlgorithm:'UNDIRECTED_SHARED_ORIGINAL_VERTEX_IDS_WITHIN_SAME_OBJ_AND_MATERIAL',
      sourceScope:'STATIC_FLD_TEMPLE01_EXCLUDES_PNTSET_STAGESIDE',
      trackedOriginalSourceFaces:16,trackedSourceObjectMaterialGroups:5,
      originalFullReviewComponentsAdded:0,currentFullReviewComponents:124,
      currentWalkSourceComponents:64,gameplayCollisionPaintNavAuthority:'NONE',
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(data.originalActiveFaceCount).toBeGreaterThan(69810);
    expect(data.perFace).toHaveLength(16);
    expect(data.uniqueOriginalVertexIDConnectedComponents).toBe(data.selectedComponents.length);
    const byKey=new Map(data.selectedComponents.map(c=>[c.sourceComponentKey,c]));
    expect(byKey.size).toBe(data.selectedComponents.length);
    const allFaces=new Set<number>();
    for(const c of data.selectedComponents){
      expect(c.sourceTopologyAuthority).toBe('SAME_OBJ_AND_MATERIAL_SHARED_ORIGINAL_VERTEX_IDS');
      expect(c.fullComponentAlreadyDisplayedIn124).toBe('NOT_ESTABLISHED');
      expect(c.gameplayFloorCollisionPaintNavAuthority).toBe('NONE');
      expect(c.reviewOnly).toBe(true);
      expect(c.runtimePromotionAuthorized).toBe(false);
      expect(c.originalTriangleCount).toBe(c.allOriginalFaceIndices.length);
      expect(c.originalTriangleCount).toBeGreaterThan(0);
      expect(c.originalVertexIdCount).toBeGreaterThan(2);
      expect(c.originalSourceTriangle3DAreaSquareMeters).toBeGreaterThan(0);
      expect(c.componentFaceAndOBJVertexIDHash).toMatch(/^[a-f0-9]{64}$/);
      expect(c.minOriginalFaceIndex).toBe(c.allOriginalFaceIndices[0]);
      expect(c.bboxProjectXYZ).toHaveLength(6);
      expect(c.originalProjectYRangeMeters).toEqual([c.bboxProjectXYZ[1],c.bboxProjectXYZ[4]]);
      for(const fi of c.allOriginalFaceIndices){
        expect(allFaces.has(fi),'Original face cannot occupy two ID-components').toBe(false);
        allFaces.add(fi);
      }
    }
    expect(new Set(data.perFace.map(f=>f.originalFaceIndex)).size).toBe(16);
    for(const sample of SAMPLES){
      const face=data.perFace.find(f=>f.originalFaceIndex===sample.originalFaceIndex);
      expect(face,'Missing source sample '+sample.originalFaceIndex).toBeDefined();
      expect(face!.sourceObject).toBe(sample.originalSourceObject);
      expect(face!.sourceMaterial).toBe(sample.originalSourceMaterial);
      expect(face!.originalOBJVertexIds).toEqual(sample.originalFaceOBJVertexIds);
      expect(face!.underfaceSourceComponentId).toBe(sample.sourceUnderfaceId);
      expect(face!.underfaceBoundaryEdgeIndex).toBe(sample.sourceUnderfaceEdgeIndex);
      const comp=byKey.get(face!.sourceComponentKey);
      expect(comp).toBeDefined();
      expect(comp!.sourceObject).toBe(face!.sourceObject);
      expect(comp!.sourceMaterial).toBe(face!.sourceMaterial);
      expect(comp!.sampledOriginalFaceIndices).toContain(face!.originalFaceIndex);
      expect(comp!.allOriginalFaceIndices).toContain(face!.originalFaceIndex);
      const encode=(points:readonly (readonly number[])[])=>{
        const bytes=Buffer.alloc(72);
        points.forEach((p,i)=>p.forEach((n,j)=>bytes.writeDoubleLE(n,(i*3+j)*8)));
        return bytes;
      };
      expect(encode(face!.originalProjectTriangleXYZ).equals(encode(sample.vertices)),
        'Source projection Float64 drift at '+sample.originalFaceIndex).toBe(true);
      expect(Buffer.alloc(8).writeDoubleLE(face!.source3DDistanceFromUnderfaceMeters,0))
        .toBe(8);
      const actualDistance=Buffer.alloc(8),expectedDistance=Buffer.alloc(8);
      actualDistance.writeDoubleLE(face!.source3DDistanceFromUnderfaceMeters,0);
      expectedDistance.writeDoubleLE(sample.exactSource3DGapMeters,0);
      expect(actualDistance.equals(expectedDistance)).toBe(true);
    }
  });
});
