import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import { UNDERTOW_T21_COVERAGE_LEDGER_V3 } from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import { UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES } from '../src/stage/undertow/UndertowSpillwayPhase9DownfaceSourceGeometry';
type OriginalNeighbor = {
  originalFaceIndex:number;sourceObject:string;sourceMaterial:string;
  originalOBJVertexIds:number[];originalNormalY:number;
  originalOrientation:string;
};
type OriginalEdge = {
  objVertexIds:number[];originalEndpointXYZ:number[][];projectEndpointXYZ:number[][];
  neighborWithSharedOriginalOBJIds:OriginalNeighbor[];
  neighborWithSameCoordinatesButDistinctIDs:OriginalNeighbor[];
  strongestOriginalEdgeEvidence:string;
};
type Component = {
  sourceComponentId:string;kind:string;originalTriangleCount:number;
  originalVertexCount:number;sourceMaterial:string;boundaryEdges:OriginalEdge[];
  boundaryEdgeEvidenceCounts:Record<string,number>;
  sharedOriginalIdNeighborOrientationEdgeCounts:Record<string,number>;
  playableFloorOrCollisionConnectionProof:boolean;
};
type Fixture = {
  version:string;sourceAuthority:string;algorithm:string;
  exactOriginalOBJVertexIDEdge:string;coincidentXYZDifferentOBJIndices:string;
  originalUndersideComponentCount:number;originalSourceXYZVertexCount:number;
  orientationFromOriginalFaceNormalNotMaterial:boolean;
  summary:{edgeEvidenceCounts:Record<string,number>,
           sharedOriginalIdNeighborOrientationEdgeCounts:Record<string,number>};
  components:Component[];
  includesUnverifiedActorPlacement:boolean;validGameplayFloorConnectivity:boolean;
  gameplayColliderNavPaintScoringAuthority:string;runtimePromotionAuthorized:boolean;
  reviewOnly:boolean;
};
function edgeOrient(n:OriginalNeighbor):string{
  if(n.originalNormalY>=Math.cos(50*Math.PI/180))return 'ORIGINAL_UP_FACING';
  if(n.originalNormalY<=-0.65)return 'ORIGINAL_DOWN_FACING';
  if(Math.abs(n.originalNormalY)<=0.32)return 'ORIGINAL_NEAR_VERTICAL';
  return 'ORIGINAL_TRANSITION_SLOPE';
}
describe('T21 Phase10 pinned OBJ edge-connected model topology (no gameplay promotion)',()=>{
  it('protects unchanged source-only previous phases and active T20',()=>{
    expect(UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES).toHaveLength(10);
    expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
  it('validates actual original vertex-ID seams separately from coincident coordinate seams',()=>{
    const path=process.env.T21_PHASE10_TOPOLOGY_JSON;
    if(!path||!existsSync(path)){
      if(process.env.CI)throw new Error('T21 Phase10 independent original-OBJ adjacency fixture missing in CI');
      return;
    }
    const f=JSON.parse(readFileSync(path,'utf8')) as Fixture;
    expect(f).toMatchObject({
      version:'T21_PHASE10_EXACT_SOURCE_EDGE_TOPOLOGY_V1',
      originalUndersideComponentCount:10,originalSourceXYZVertexCount:84,
      exactOriginalOBJVertexIDEdge:'STRONGEST_STATIC_MODEL_TOPOLOGY_ONLY',
      coincidentXYZDifferentOBJIndices:'NONWELDED_SEAM_NOT_PROOF_OF_PHYSICAL_CONNECTION',
      orientationFromOriginalFaceNormalNotMaterial:true,
      includesUnverifiedActorPlacement:false,validGameplayFloorConnectivity:false,
      gameplayColliderNavPaintScoringAuthority:'NONE',
      runtimePromotionAuthorized:false,reviewOnly:true
    });
    expect(f.sourceAuthority).toContain('a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046');
    expect(f.components).toHaveLength(10);
    let totalEdges=0;
    const tiers:Record<string,number>={};
    const orientations:Record<string,number>={};
    for(const [i,c] of f.components.entries()){
      const source=UNDERTOW_T21_PHASE9_ORIGINAL_DOWNFACES[i]!;
      expect(c.sourceComponentId).toBe(source.sourceComponentId);
      expect(c.sourceMaterial).toBe(source.sourceMaterial);
      expect(c.originalVertexCount).toBe(source.vertices.length);
      expect(c.originalTriangleCount).toBe(source.vertices.length/3);
      expect(c.playableFloorOrCollisionConnectionProof).toBe(false);
      // Each boundary edge is composed of two endpoints from the actual
      // already byte-verified Phase9 original Float64 projected XYZ.
      const originalXYZ=new Set(source.vertices.map(v=>v.join(',')));
      const perTiers:Record<string,number>={};
      const perOrientation:Record<string,number>={};
      const unique=new Set<string>();
      for(const e of c.boundaryEdges){
        expect(e.objVertexIds).toHaveLength(2);
        expect(e.objVertexIds[0]).toBeLessThan(e.objVertexIds[1]!);
        expect(e.projectEndpointXYZ).toHaveLength(2);
        expect(e.originalEndpointXYZ).toHaveLength(2);
        expect(e.projectEndpointXYZ.every(x=>originalXYZ.has(x.join(',')))).toBe(true);
        const edgeID=e.objVertexIds.join(',');
        expect(unique.has(edgeID)).toBe(false);unique.add(edgeID);
        const exact=e.neighborWithSharedOriginalOBJIds;
        const geom=e.neighborWithSameCoordinatesButDistinctIDs;
        const tier=exact.length?'EXACT_ORIGINAL_OBJ_VERTEX_ID_EDGE':
          geom.length?'COINCIDENT_XYZ_ONLY_NOT_WELDED':'NO_EXACT_ORIGINAL_EDGE_NEIGHBOR';
        expect(e.strongestOriginalEdgeEvidence).toBe(tier);
        tiers[tier]=(tiers[tier]||0)+1;
        perTiers[tier]=(perTiers[tier]||0)+1;
        for(const n of exact){
          expect(n.sourceObject.startsWith('Fld_Temple01_')).toBe(true);
          expect(n.originalOrientation).toBe(edgeOrient(n));
          for(const index of e.objVertexIds)expect(n.originalOBJVertexIds).toContain(index);
          const cls=n.originalOrientation;
          if(!perOrientation[cls]){perOrientation[cls]=1;orientations[cls]=(orientations[cls]||0)+1;}
        }
        // Coordinate-only neighbors may not reuse BOTH original vertex IDs.
        for(const n of geom){
          expect(n.sourceObject.startsWith('Fld_Temple01_')).toBe(true);
          expect(n.originalOrientation).toBe(edgeOrient(n));
          expect(e.objVertexIds.every(id=>n.originalOBJVertexIds.includes(id))).toBe(false);
        }
      }
      expect(perTiers).toEqual(c.boundaryEdgeEvidenceCounts);
      // This per-orientation count is per edge, not per number of adjacent triangles.
      // Recompute below rather than accidentally using aggregate per-component data.
      const computed:Record<string,number>={};
      for(const e of c.boundaryEdges){
        for(const cls of new Set(e.neighborWithSharedOriginalOBJIds.map(n=>n.originalOrientation)))
          computed[cls]=(computed[cls]||0)+1;
      }
      expect(computed).toEqual(c.sharedOriginalIdNeighborOrientationEdgeCounts);
      totalEdges+=c.boundaryEdges.length;
    }
    expect(tiers).toEqual(f.summary.edgeEvidenceCounts);
    expect(Object.values(tiers).reduce((a,b)=>a+b,0)).toBe(totalEdges);
    const orientationCounts:Record<string,number>={};
    for(const c of f.components)for(const [k,v] of Object.entries(c.sharedOriginalIdNeighborOrientationEdgeCounts))
      orientationCounts[k]=(orientationCounts[k]||0)+v;
    expect(orientationCounts).toEqual(f.summary.sharedOriginalIdNeighborOrientationEdgeCounts);
    expect(totalEdges).toBeGreaterThan(0);
    console.log('T21_PHASE10_PINNED_OBJ_EDGE_EVIDENCE_PASS',JSON.stringify({sourceComponents:10,boundaryEdges:totalEdges,tiers,orientationCounts,gameplayApproval:false}));
  });
});