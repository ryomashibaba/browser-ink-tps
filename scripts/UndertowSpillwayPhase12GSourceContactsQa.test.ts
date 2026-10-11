import {existsSync,readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_PHASE12D_RECOVERED_SOURCE_MESHES as PARTS} from '../src/stage/undertow/UndertowSpillwayPhase12DRecoveredSourceGeometry';
type Point=readonly[number,number,number];
type Contact={contactClass:string;sourceSegmentParameters:[number,number];
 sourceContactXYZ:[Point,Point];overlapLengthMeters:number;
 sourceNormalPlaneDistancesMeters:[number,number]};
type Other={originalFaceIndex:number;sourceObject:string;sourceMaterial:string;
 originalOBJVertexIds:number[];sourceIsActorPntSetUntrusted:boolean;
 segmentToTriangleDistanceMeters:number;contact:Contact|null;
 originalSourceTriangleArea3DSquareMeters:number};
type Boundary={sourceOriginalMinFace:number;sourceBoundaryEdgeIndex:number;
 originalOBJVertexIds:number[];originalProjectEndpointXYZ:[Point,Point];
 edgeLengthMeters:number;originalStageSourceSeamTier:string;
 sourceConfirmedOriginalContactCount:number;sourceContactClassCounts:Record<string,number>;
 nearestActualSegmentToOriginalTriangles:Other[];
 firstEightExactGeometrySourceContacts:Other[];oneOrMoreSourceContacts:boolean;
 newPlayableSurfaceOrBridgeAuthorized:false};
type Ledger={version:string;originalSourceSHA256:string;originalSourceBytes:number;
 sourceOriginalActiveFaceCount:number;unresolvedSourceBoundaryCount:number;
 originalSourceComponentCount:number;edgeIntersectionsNotWeldedOrGameplayConnectivity:true;
 checkedEveryOriginalSourceTriangle:true;contactToleranceMeters:number;
 searchRadiusMeters:number;perBoundary:Boundary[];totalActualSourceContacts:number;
 reviewOnly:true;runtimePromotionAuthorized:false;
 existingDefaultOriginalSourceMeshes:number;newGameCollidersOrWalkablePlatforms:number;
 t20ProductionChanged:false;t21ActivationReady:false};
const targets=new Set(['60006:1','60006:2','61728:1','61728:2']);
function xyz64(p:readonly number[]):string{
 const b=Buffer.alloc(8*p.length);p.forEach((x,i)=>b.writeDoubleLE(x,i*8));return b.toString('hex');
}
describe('T21 Phase12G exact four unresolved 3D source segment-to-triangle contact audit',()=>{
 it('does not change original source component inventory or gameplay activation',()=>{
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
   expect(PARTS).toHaveLength(4);
   expect(PARTS.reduce((s,p)=>s+p.vertices.length/3,0)).toBe(8);
 });
 it('checks all original endpoint bytes, 3D intersection certificates and non-gameplay governance',()=>{
   const path=process.env.T21_PHASE12G_CONTACT_JSON;
   if(!path)return; // pinned 43MB original available only on CI PR runner
   if(!existsSync(path))throw Error('Phase12G original source report required on CI');
   const data=JSON.parse(readFileSync(path,'utf8')) as Ledger;
   expect(data).toMatchObject({
    version:'T21_PHASE12G_EXACT_SOURCE_SEGMENT_TRIANGLE_CONTACT_V1',
    originalSourceSHA256:'a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046',
    originalSourceBytes:43263289,sourceOriginalActiveFaceCount:70396,
    unresolvedSourceBoundaryCount:4,originalSourceComponentCount:4,
    edgeIntersectionsNotWeldedOrGameplayConnectivity:true,
    checkedEveryOriginalSourceTriangle:true,contactToleranceMeters:1e-9,
    searchRadiusMeters:0.75,reviewOnly:true,runtimePromotionAuthorized:false,
    existingDefaultOriginalSourceMeshes:124,newGameCollidersOrWalkablePlatforms:0,
    t20ProductionChanged:false,t21ActivationReady:false
   });
   expect(data.perBoundary).toHaveLength(4);
   const seen=new Set<string>();let total=0;
   for(const e of data.perBoundary){
     const key=e.sourceOriginalMinFace+':'+e.sourceBoundaryEdgeIndex;
     expect(targets.has(key)).toBe(true);expect(seen.has(key)).toBe(false);seen.add(key);
     expect(e.originalStageSourceSeamTier).toBe('NEARBY_TRIANGLE_NOT_CONNECTIVITY');
     const part=PARTS.find(x=>x.originalMinFace===e.sourceOriginalMinFace);
     expect(part).toBeDefined();
     const validIds=new Set(part!.originalOBJVertexIdTriples.flat());
     const validXYZ=new Set(part!.vertices.map(xyz64));
     for(const id of e.originalOBJVertexIds)expect(validIds.has(id)).toBe(true);
     for(const p of e.originalProjectEndpointXYZ)expect(validXYZ.has(xyz64(p))).toBe(true);
     const a=e.originalProjectEndpointXYZ[0],b=e.originalProjectEndpointXYZ[1];
     expect(e.edgeLengthMeters).toBeCloseTo(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),12);
     let prev=-1;
     for(const t of e.nearestActualSegmentToOriginalTriangles){
       expect(t.segmentToTriangleDistanceMeters).toBeGreaterThanOrEqual(prev);
       expect(t.segmentToTriangleDistanceMeters).toBeLessThanOrEqual(0.75);
       prev=t.segmentToTriangleDistanceMeters;
       expect(t.originalSourceTriangleArea3DSquareMeters).toBeGreaterThanOrEqual(0);
       expect(t.sourceIsActorPntSetUntrusted).toBe(t.sourceObject.startsWith('FldObj_Temple01_PntSet_'));
       if(t.contact){
         expect(t.segmentToTriangleDistanceMeters).toBe(0);
         expect(t.contact.sourceSegmentParameters).toHaveLength(2);
         expect(t.contact.sourceContactXYZ).toHaveLength(2);
         for(let i=0;i<2;i++){
           const p=t.contact.sourceContactXYZ[i]!;
           const u=t.contact.sourceSegmentParameters[i]!;
           expect(u).toBeGreaterThanOrEqual(-1e-7);expect(u).toBeLessThanOrEqual(1+1e-7);
           for(let k=0;k<3;k++)
             expect(p[k]).toBeCloseTo(a[k]+u*(b[k]-a[k]),9);
         }
         expect(t.contact.overlapLengthMeters).toBeGreaterThanOrEqual(0);
       }
     }
     expect(e.firstEightExactGeometrySourceContacts).toHaveLength(
        Math.min(8,e.sourceConfirmedOriginalContactCount));
     expect(e.oneOrMoreSourceContacts).toBe(e.sourceConfirmedOriginalContactCount>0);
     expect(e.newPlayableSurfaceOrBridgeAuthorized).toBe(false);
     const counted=Object.entries(e.sourceContactClassCounts).reduce((s,[type,n])=>{
        expect(n).toBeGreaterThanOrEqual(0);
        expect(['SOURCE_POINT_PLANE_INTERSECTION','COPLANAR_SOURCE_SEGMENT_OVERLAP',
         'COPLANAR_SOURCE_POINT_ONLY','SOURCE_SEGMENT_NEAR_TRIANGLE_NO_INTERSECTION']).toContain(type);
        return s+n;
     },0);
     expect(counted).toBeGreaterThanOrEqual(e.sourceConfirmedOriginalContactCount);
     total+=e.sourceConfirmedOriginalContactCount;
   }
   expect(seen).toEqual(targets);
   expect(total).toBe(data.totalActualSourceContacts);
   console.log('T21_PHASE12G_ORIGINAL_SEGMENT_TRIANGLE_CONTACTS',JSON.stringify(
      data.perBoundary.map(x=>({edge:x.sourceOriginalMinFace+':'+x.sourceBoundaryEdgeIndex,
      counts:x.sourceContactClassCounts,contacts:x.sourceConfirmedOriginalContactCount}))));
 });
});
