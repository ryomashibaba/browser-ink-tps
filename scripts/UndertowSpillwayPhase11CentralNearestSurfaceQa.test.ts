import { existsSync,readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES } from '../src/stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
import { UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE } from '../src/stage/undertow/UndertowSpillwayPhase10EdgeDiagnosticGeometry';
import { UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES, UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY, undertowT21Phase11CandidateErrors } from '../src/stage/undertow/UndertowSpillwayPhase11NearestSourceDiagnostic';
type Candidate={
  sourceObject:string;sourceMaterial:string;originalOrientation:string;
  originalNormalY:number;originalFaceIndex:number;
  originalFaceOBJVertexIds:number[];originalSourceTriangleXYZ:number[][];
  originalSourceTriangleCenterXYZ:number[];originalYRange:number[];
  closest3DDistanceMeters:number;
  candidateSourceWithinHardXZCenterOnly:boolean;gameplayConnectionAuthorized:boolean;
};
type Edge={
  sourceComponentId:string;boundaryEdgeIndex:number;
  originalSourceEdgeVertexIds:number[];originalProjectEdgeXYZ:number[][];
  originalModelEdgeXYZ:number[][];candidateTrianglesWithinRadius:number;
  distinctSourceGroupsWithin8Meters:number;closestOriginalSourceCandidates:Candidate[];
  originalSourceDistanceRadiusMeters:number;
  originalStaticOBJSharedEdge:boolean;playableConnectionVerified:boolean;
  nearestOriginal3DDistanceMeters:number|null;distanceBand:string;
};
type Fixture={
  version:string;originalSourceSHA256:string;sourceEdgeAuthority:string;
  algorithm:string;candidateRule:string;originalStaticTriangleSearchRadiusMeters:number;
  centerDownfaceComponentCount:number;centerUnmatchedEdgeCount:number;
  sourceTrianglesAABBWindow:number;sourceTrianglesInsideHardXZCenterSample:number;
  sourceExact3DDistanceCalculations:number;
  distanceBands:Record<string,number>;nearestNeighborOrientationCounts:Record<string,number>;
  perEdge:Edge[];originalVertexIDTopologyProof:boolean;
  gameplayFloorWallRoofCollisionAndNavigationAuthority:string;
  runtimePromotionAuthorized:boolean;reviewOnly:boolean;
};
const bands=['LE_0_01M','LE_0_1M','LE_0_5M','LE_2M','LE_8M','NO_CANDIDATE'];
const orientation=(y:number)=>y>=Math.cos(50*Math.PI/180)?'ORIGINAL_UP_FACING':
  y<=-0.65?'ORIGINAL_DOWN_FACING':Math.abs(y)<=0.32?'ORIGINAL_NEAR_VERTICAL':'ORIGINAL_TRANSITION_SLOPE';
describe('T21 Phase11 true original 3D distance from 16 unmatched central underside source edges',()=>{
  it('retains 64 original walk source regions and T20/T21 runtime isolation',()=>{
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES).toHaveLength(10);
    expect(UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE).toHaveLength(48);
    expect(undertowT21Phase11CandidateErrors()).toEqual([]);
    expect(UNDERTOW_T21_PHASE11_CENTRAL_GAP_SUMMARY).toMatchObject({
      centerUnmatchedOriginalEdges:16,
      sourceTouchingZeroMeterEdges:8,
      source2Point55CentimeterGapEdges:8,
      reviewOnly:true,runtimePromotionAuthorized:false
    });
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
  it('proves the original source candidate fixture, orientation and edge endpoints without promoting geometry',()=>{
    const path=process.env.T21_PHASE11_SOURCE_JSON;
    if(!path)return; // full npm test has no independent 43MB OBJ fixture
    if(!existsSync(path))throw Error('T21 Phase11 dedicated source fixture missing '+path);
    const f=JSON.parse(readFileSync(path,'utf8')) as Fixture;
    expect(f).toMatchObject({
      version:'T21_PHASE11_CENTRAL_ORIGINAL_3D_GAP_V1',
      originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
      sourceEdgeAuthority:'16_UNMATCHED_CENTRAL_DOWNFACING_ORIGINAL_OBJ_BOUNDARY_EDGES',
      algorithm:'BOUNDED_8M_TRUE_FINITE_SEGMENT_TO_ORIGINAL_TRIANGLE_3D_DISTANCE',
      candidateRule:'DISTINCT_ORIGINAL_OBJECT_MATERIAL_ORIENTATION_GROUPS_TOP8_NEAREST',
      originalStaticTriangleSearchRadiusMeters:8,
      centerDownfaceComponentCount:2,centerUnmatchedEdgeCount:16,
      originalVertexIDTopologyProof:false,
      gameplayFloorWallRoofCollisionAndNavigationAuthority:'NONE',
      runtimePromotionAuthorized:false,reviewOnly:true
    });
    expect(f.perEdge).toHaveLength(16);
    expect(f.sourceTrianglesAABBWindow).toBeGreaterThan(0);
    expect(f.sourceExact3DDistanceCalculations).toBeGreaterThan(0);
    expect(f.sourceTrianglesInsideHardXZCenterSample).toBeLessThanOrEqual(f.sourceTrianglesAABBWindow);
    const sourceEdgeLookup=new Map<string,number>();
    for(const e of UNDERTOW_T21_PHASE10_ORIGINAL_EDGE_EVIDENCE)
      if(e.kind==='CENTER_UNDER_METAL' && e.tier==='NO_EXACT_ORIGINAL_EDGE_NEIGHBOR'){
        const key=e.sourceComponentId;
        sourceEdgeLookup.set(key,(sourceEdgeLookup.get(key)||0)+1);
      }
    expect([...sourceEdgeLookup.values()].sort()).toEqual([8,8]);
    const histogram=Object.fromEntries(bands.map(x=>[x,0]));
    const originIds=new Set<string>();
    let total=0;
    for(const [index,e] of f.perEdge.entries()){
      const visual=UNDERTOW_T21_PHASE11_NEAREST_ORIGINAL_SOURCE_TRIANGLES[index]!;
      const candidate=e.closestOriginalSourceCandidates[0]!;
      expect(visual.sourceUnderfaceId).toBe(e.sourceComponentId);
      expect(visual.sourceUnderfaceEdgeIndex).toBe(e.boundaryEdgeIndex);
      expect(visual.originalCandidateMaterial).toBe(candidate.sourceMaterial);
      expect(visual.originalCandidateFaceIndex).toBe(candidate.originalFaceIndex);
      expect(visual.originalNormalClass).toBe(candidate.originalOrientation);
      const serialized=Buffer.allocUnsafe(80);
      serialized.writeDoubleLE(visual.exactOriginal3DGapMeters,0);
      visual.vertices.forEach((vertex,i)=>vertex.forEach((n,j)=>{
        serialized.writeDoubleLE(n,8+i*24+j*8);
      }));
      const original=Buffer.allocUnsafe(80);
      original.writeDoubleLE(candidate.closest3DDistanceMeters,0);
      candidate.originalSourceTriangleXYZ.forEach((vertex,i)=>vertex.forEach((n,j)=>{
        original.writeDoubleLE(n,8+i*24+j*8);
      }));
      expect(serialized.equals(original),'Phase11 source triangle exact XYZ distance '+index).toBe(true);
      expect(sourceEdgeLookup.has(e.sourceComponentId)).toBe(true);
      expect(e.originalSourceDistanceRadiusMeters).toBe(8);
      expect(e.originalStaticOBJSharedEdge).toBe(false);
      expect(e.playableConnectionVerified).toBe(false);
      expect(e.originalProjectEdgeXYZ).toHaveLength(2);
      const src=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES.find(x=>x.sourceComponentId===e.sourceComponentId)!;
      const originalVertex=new Set(src.vertices.map(x=>x.join(',')));
      for(const point of e.originalProjectEdgeXYZ)expect(originalVertex.has(point.join(','))).toBe(true);
      const k=e.sourceComponentId+'#'+e.boundaryEdgeIndex;
      expect(originIds.has(k)).toBe(false);originIds.add(k);
      expect(e.closestOriginalSourceCandidates.length).toBeLessThanOrEqual(8);
      expect(e.distinctSourceGroupsWithin8Meters).toBeGreaterThanOrEqual(e.closestOriginalSourceCandidates.length);
      let last=-1;
      const groupSet=new Set<string>();
      for(const c of e.closestOriginalSourceCandidates){
        expect(c.sourceObject.startsWith('Fld_Temple01_')).toBe(true);
        expect(c.sourceObject).not.toContain('PntSet');
        expect(c.sourceMaterial).not.toContain('StageSide');
        expect(c.originalFaceOBJVertexIds).toHaveLength(3);
        expect(c.originalSourceTriangleXYZ).toHaveLength(3);
        expect(c.originalSourceTriangleXYZ.every(v=>v.length===3&&v.every(Number.isFinite))).toBe(true);
        expect(c.originalOrientation).toBe(orientation(c.originalNormalY));
        expect(c.closest3DDistanceMeters).toBeGreaterThanOrEqual(0);
        expect(c.closest3DDistanceMeters).toBeLessThanOrEqual(8+1e-8);
        expect(c.closest3DDistanceMeters+1e-12).toBeGreaterThanOrEqual(last);last=c.closest3DDistanceMeters;
        expect(c.candidateSourceWithinHardXZCenterOnly).toBe(true);
        expect(c.gameplayConnectionAuthorized).toBe(false);
        const group=[c.sourceObject,c.sourceMaterial,c.originalOrientation].join('|');
        expect(groupSet.has(group)).toBe(false);groupSet.add(group);
      }
      expect(bands).toContain(e.distanceBand);
      histogram[e.distanceBand]++;
      if(e.closestOriginalSourceCandidates.length){
        expect(e.nearestOriginal3DDistanceMeters).toBeCloseTo(e.closestOriginalSourceCandidates[0]!.closest3DDistanceMeters,12);
        total++;
      }else expect(e.nearestOriginal3DDistanceMeters).toBeNull();
    }
    expect(originIds.size).toBe(16);
    expect(histogram).toEqual(f.distanceBands);
    expect(Object.values(f.distanceBands).reduce((a,b)=>a+b,0)).toBe(16);
    console.log('T21_PHASE11_BOUNDED_SOURCE_NEAREST_PASS',JSON.stringify({
      edges:f.perEdge.length,withCandidate:total,sourceTriangleWindow:f.sourceTrianglesAABBWindow,
      orientation:f.nearestNeighborOrientationCounts,bands:f.distanceBands,gameplayPromotion:false
    }));
  },60000);
});
