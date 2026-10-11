import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES as ORIGINALS} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
type XYZ=readonly[number,number,number];
type Neighbor={originalFaceIndex:number;sourceObject:string;sourceMaterial:string;
 originalOBJVertexIds:number[];sourceIsActorPlacement:boolean};
type Proximity=Neighbor&{midpointToTriangle3DDistanceMeters:number};
type Edge={sourceComponentKey:string;sourceOriginalMinFace:number;edgeNumber:number;
 originalOBJVertexIds:number[];originalProjectEndpointXYZ:[XYZ,XYZ];
 edgeLengthMeters:number;edgeMidpointXYZ:XYZ;
 exactOBJEdgeNeighborCount:number;exactOBJEdgeNeighbors:Neighbor[];
 coordinateOnlyNeighborCount:number;coordinateOnlyNeighbors:Neighbor[];
 oneOBJIdNeighborCount:number;oneOBJIdNeighbors:Neighbor[];
 nearestOriginalTriangles:Proximity[];tier:string;
 gameplayConnectivityProof:false;runtimePromotionAuthorized:false};
type Audit={version:string;originalSourceSHA256:string;originalSourceBytes:number;
 originalActiveFaceCount:number;sourceFullComponentCount:number;
 sourceOriginalTriangleCount:number;sourceBoundaryEdgeCount:number;
 allOriginalFacesSearched:boolean;distanceSampling:string;
 coordinateToleranceMeters:number;midpointSearchRadiusMeters:number;
 tierCounts:Record<string,number>;edges:Edge[];actorGeometryUntrusted:boolean;
 gameplayAuthority:'NONE';reviewOnly:true;runtimePromotionAuthorized:false;
 newRegisteredSourceMeshes:number;defaultOriginalFullSourceMeshes:number};
function hash64(v:readonly number[]):string{
 const b=Buffer.alloc(8*v.length);v.forEach((x,i)=>b.writeDoubleLE(x,i*8));return b.toString('hex');
}
function classify(e:Edge):string{
 return e.exactOBJEdgeNeighborCount?'EXACT_TWO_ORIGINAL_OBJ_IDS_STATIC_ONLY':
 e.coordinateOnlyNeighborCount?'COINCIDENT_XYZ_NOT_WELDED':
 e.oneOBJIdNeighborCount?'ONE_ORIGINAL_ID_ONLY_NOT_EDGE':
 e.nearestOriginalTriangles.length?'NEARBY_TRIANGLE_NOT_CONNECTIVITY':
 'NO_SOURCE_TRIANGLE_MIDPOINT_WITHIN_0_75M';
}
describe('T21 Phase12F independent 16 source boundary-edge evidence',()=>{
 it('leaves T20 gameplay, 64 original walk source and 4 opt-in meshes untouched',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(ORIGINALS).toHaveLength(4);
 });
 it('proves all 16 edges start with actual decoded original OBJ triangle vertices',()=>{
  const path=process.env.T21_PHASE12F_EDGES_JSON;
  if(!path)return;
  if(!existsSync(path))throw Error('T21 Phase12F mandatory source audit missing');
  const r=JSON.parse(readFileSync(path,'utf8')) as Audit;
  expect(r).toMatchObject({
   version:'T21_PHASE12F_PINNED_16_SOURCE_EDGE_TOPOLOGY_V1',
   originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
   originalSourceBytes:43263289,sourceFullComponentCount:4,
   sourceOriginalTriangleCount:8,sourceBoundaryEdgeCount:16,
   allOriginalFacesSearched:true,coordinateToleranceMeters:1e-7,
   midpointSearchRadiusMeters:0.75,actorGeometryUntrusted:true,
   gameplayAuthority:'NONE',reviewOnly:true,runtimePromotionAuthorized:false,
   newRegisteredSourceMeshes:0,defaultOriginalFullSourceMeshes:124
  });
  expect(r.originalActiveFaceCount).toBeGreaterThan(70000);
  expect(r.edges).toHaveLength(16);
  const names=new Set<string>(),counts=new Map<number,number>();
  const tiers:Record<string,number>={};
  for(const e of r.edges){
   const mesh=ORIGINALS.find(o=>o.originalMinFace===e.sourceOriginalMinFace);
   expect(mesh).toBeDefined();
   expect(e.sourceComponentKey).toBe(mesh!.sourceComponentKey);
   expect(e.originalOBJVertexIds).toHaveLength(2);
   const vertexIds=new Set(mesh!.originalOBJVertexIdTriples.flat());
   for(const id of e.originalOBJVertexIds)expect(vertexIds.has(id)).toBe(true);
   const coords=new Set(mesh!.vertices.map(hash64));
   for(const pos of e.originalProjectEndpointXYZ)expect(coords.has(hash64(pos))).toBe(true);
   const a=e.originalProjectEndpointXYZ[0],b=e.originalProjectEndpointXYZ[1];
   expect(e.edgeLengthMeters).toBeCloseTo(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),12);
   for(let k=0;k<3;k++)expect(e.edgeMidpointXYZ[k]).toBeCloseTo((a[k]+b[k])/2,12);
   const key=e.sourceOriginalMinFace+':'+[...e.originalOBJVertexIds].sort((x,y)=>x-y).join(',');
   expect(names.has(key)).toBe(false);names.add(key);
   counts.set(e.sourceOriginalMinFace,(counts.get(e.sourceOriginalMinFace)||0)+1);
   expect(e.gameplayConnectivityProof).toBe(false);
   expect(e.runtimePromotionAuthorized).toBe(false);
   expect(e.tier).toBe(classify(e));
   tiers[e.tier]=(tiers[e.tier]||0)+1;
   for(const [quantity,items] of [
    [e.exactOBJEdgeNeighborCount,e.exactOBJEdgeNeighbors],
    [e.coordinateOnlyNeighborCount,e.coordinateOnlyNeighbors],
    [e.oneOBJIdNeighborCount,e.oneOBJIdNeighbors]
   ] as const){
    expect(quantity).toBeGreaterThanOrEqual(items.length);
    for(const n of items){
     const idset=new Set(n.originalOBJVertexIds);
     expect(n.sourceIsActorPlacement).toBe(n.sourceObject.startsWith('FldObj_Temple01_PntSet_'));
     if(items===e.exactOBJEdgeNeighbors)expect(e.originalOBJVertexIds.every(id=>idset.has(id))).toBe(true);
     if(items===e.coordinateOnlyNeighbors)expect(e.originalOBJVertexIds.every(id=>idset.has(id))).toBe(false);
     if(items===e.oneOBJIdNeighbors)expect(e.originalOBJVertexIds.filter(id=>idset.has(id))).toHaveLength(1);
    }
   }
   let prev=0;
   for(const n of e.nearestOriginalTriangles){
    expect(n.midpointToTriangle3DDistanceMeters).toBeGreaterThanOrEqual(prev);
    expect(n.midpointToTriangle3DDistanceMeters).toBeLessThanOrEqual(.75);
    prev=n.midpointToTriangle3DDistanceMeters;
   }
  }
  expect(names.size).toBe(16);
  for(const id of [60006,61516,61728,62086])expect(counts.get(id)).toBe(4);
  expect(tiers).toEqual(r.tierCounts);
  console.log('T21_PHASE12F_PINNED_ORIGINAL_SOURCE_EDGE_TIERS',JSON.stringify(tiers));
 });
});
