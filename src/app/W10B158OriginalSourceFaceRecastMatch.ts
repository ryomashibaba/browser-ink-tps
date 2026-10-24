/** W10-B158: match native Recast terminal locations to the previously
 * CI #688 original Temple01 5+5 exact source floor/slope components.
 * CI #691 already demonstrated these faces ALONE did not bridge Recast.
 *
 * Pure spatial evidence ONLY. No stage, collider, NavMesh, KCC, actor,
 * camera, paint, mask or production state modification.
 */
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT,
 type UndertowUnderpassRouteRecord}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {B157OriginalBidirectionalSourceAudit}
 from './W10B157OriginalBidirectionalSourceAudit';

type P=readonly [number,number,number];
const subtract=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:P,b:P,t:number):P=>[a[0]+b[0]*t,a[1]+b[1]*t,a[2]+b[2]*t];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const dist=(a:P,b:P)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const distSq=(a:P,b:P)=>dot(subtract(a,b),subtract(a,b));
const seg=(p:P,a:P,b:P):P=>{
 const v=subtract(b,a),den=dot(v,v);
 return add(a,v,den<=1e-12?0:Math.max(0,Math.min(1,dot(subtract(p,a),v)/den)));
};
function nearestOnTriangle(p:P,a:P,b:P,c:P):P {
 const v0=subtract(b,a),v1=subtract(c,a),n:[number,number,number]=[
  v0[1]*v1[2]-v0[2]*v1[1],
  v0[2]*v1[0]-v0[0]*v1[2],
  v0[0]*v1[1]-v0[1]*v1[0]];
 const norm2=dot(n,n);
 if(norm2>1e-12){
  const ap=subtract(p,a),t=dot(ap,n)/norm2;
  const proj=add(p,n,-t);
  const q=subtract(proj,a);
  const d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),
   d20=dot(q,v0),d21=dot(q,v1);
  const det=d00*d11-d01*d01;
  if(det>1e-12){
   const u=(d11*d20-d01*d21)/det,v=(d00*d21-d01*d20)/det;
   if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)return proj;
  }
 }
 const candidates=[seg(p,a,b),seg(p,b,c),seg(p,c,a)];
 return candidates.sort((x,y)=>distSq(p,x)-distSq(p,y))[0]!;
}
export interface B158NearestOriginalFace{
 id:string;
 side:'POSITIVE_Z'|'NEGATIVE_Z';
 terminal:'FORWARD'|'REVERSE';
 nativeRecastPoint:P;
 exactOriginalSourceObject:string;
 exactOriginalMaterial:string;
 originalRouteComponentId:string;
 exactFaceLocalIndex:number;
 nearestOriginalTrianglePoint:P;
 originalTriangleSpatialDistanceMeters:number;
 horizontalDifferenceMeters:number;
 verticalDifferenceMeters:number;
 /** CI #691 negative: adding all 5 faces per side did not connect. */
 priorAllFiveExactFacesRecastConnectionSucceeded:false;
 originalSourceFaceMatched:true;
 runtimeOriginalFacePromoted:false;
 pathPhysicallyTraversableCertified:false;
}
export interface B158ExactOriginalRouteFaceComparison {
 source:'CI688_ORIGINAL_TRIANGLE_FACES_PLUS_B157_NATIVE_RECAST';
 originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE';
 privateOriginalObjReopened:false;
 originalSourceFaceMeshesAlreadyInRepository:10;
 originalSourceTrianglesInRepository:42;
 originalSourceFacesFromPriorCi:688;
 priorFivePerSideNativeRecastExperimentCi:691;
 priorSourceFacesAloneRecastReached:false;
 comparisons:readonly B158NearestOriginalFace[];
 noNewSourceGeometry:true;
 noNewNavLinks:true;
 noNewScoreableMask:true;
 actualNativeKccGapTraversalProven:false;
 activationReady:false;
 productionAuthorized:false;
 original4v4Certified:false;
 nextEngineeringDecision:'EXAMINE_SOURCE_FACE_CHAIN_TO_RUNTIME_NAVMESH_TO_KCC_NOT_GUESS_BRIDGE';
}
export function matchB158OriginalSourceFaces(
 evidence:B157OriginalBidirectionalSourceAudit,
 faces:readonly UndertowUnderpassRouteRecord[]=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS
):B158ExactOriginalRouteFaceComparison{
 const prior=UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT;
 if(evidence.source!=='NATIVE_RECAST_BOTH_DIRECTIONS_AND_REGISTERED_STAGE_RAYS'||
  evidence.originalAuthority!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
  evidence.originalCrossTeamRoutes!=='0/12'||
  evidence.productionAuthorized!==false||
  evidence.originalFull4v4Certified!==false||
  evidence.addedStageSolids!==0||evidence.addedNavigationLinks!==0||
  evidence.sourceScoreablePromotions!==0||
  evidence.sides.length!==2||prior.runtimePromotionAuthorized!==false||
  prior.offMeshLinkAuthorized!==false||
  prior.experimentalRuntimeInclusionReachedTarget!==false||
  prior.experimentalCiRun!==691||
  prior.newComponentsPerSide!==5||prior.newTrianglesPerSide!==21||
  faces.length!==10||new Set(faces.map(f=>f.id)).size!==10||
  faces.filter(f=>f.side==='POSITIVE_Z').length!==5||
  faces.filter(f=>f.side==='NEGATIVE_Z').length!==5)
  throw Error('B158_SOURCE_FACE_AUTHORITY_MISMATCH');
 const results:B158NearestOriginalFace[]=[];
 for(const side of evidence.sides){
  if(!['POSITIVE_Z','NEGATIVE_Z'].includes(side.side)||
   side.physicalKccTraversalCertified!==false||
   side.sourceObjGeometryRegisteredHereProven!==false||
   side.sourceOffMeshNavLinkAuthorized!==false)
   throw Error('B158_UNVERIFIED_NATIVE_TERMINALS_REQUIRED');
  for(const [terminal,point]of [
   ['FORWARD',side.forwardNativeTerminal],
   ['REVERSE',side.reverseNativeTerminal]
  ] as const){
   if(!point||point.length!==3||point.some(x=>!Number.isFinite(x)))
    throw Error('B158_REAL_RECAST_TERMINAL_ABSENT');
   let selected:Omit<B158NearestOriginalFace,
    'priorAllFiveExactFacesRecastConnectionSucceeded'|
    'originalSourceFaceMatched'|'runtimeOriginalFacePromoted'|
    'pathPhysicallyTraversableCertified'>|null=null;
   for(const f of faces.filter(x=>x.side===side.side)){
    const verts=f.mesh.vertices,indices=f.mesh.indices;
    if(indices.length%3!==0)throw Error('B158_BAD_ORIGINAL_TRIANGLE');
    for(let i=0;i<indices.length;i+=3){
     const a=verts[indices[i]!]!,b=verts[indices[i+1]!]!,
      c=verts[indices[i+2]!]!;
     if(!a||!b||!c)throw Error('B158_BAD_ORIGINAL_TRIANGLE');
     const near=nearestOnTriangle(point,a,b,c);
     const length=dist(point,near);
     if(!selected||length<selected.originalTriangleSpatialDistanceMeters){
      selected={
       id:side.side+':'+terminal,side:side.side,terminal,
       nativeRecastPoint:[...point],
       exactOriginalSourceObject:f.sourceObject,
       exactOriginalMaterial:f.sourceMaterial,
       originalRouteComponentId:f.id,
       exactFaceLocalIndex:i/3,
       nearestOriginalTrianglePoint:near,
       originalTriangleSpatialDistanceMeters:length,
       horizontalDifferenceMeters:Math.hypot(
        near[0]-point[0],near[2]-point[2]),
       verticalDifferenceMeters:near[1]-point[1]
      };
     }
    }
   }
   if(!selected)throw Error('B158_NO_MATCHABLE_PRIOR_SOURCE_FACE');
   results.push({...selected,priorAllFiveExactFacesRecastConnectionSucceeded:false,
    originalSourceFaceMatched:true,runtimeOriginalFacePromoted:false,
    pathPhysicallyTraversableCertified:false});
  }
 }
 return {
  source:'CI688_ORIGINAL_TRIANGLE_FACES_PLUS_B157_NATIVE_RECAST',
  originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  privateOriginalObjReopened:false,
  originalSourceFaceMeshesAlreadyInRepository:10,
  originalSourceTrianglesInRepository:42,
  originalSourceFacesFromPriorCi:688,
  priorFivePerSideNativeRecastExperimentCi:691,
  priorSourceFacesAloneRecastReached:false,
  comparisons:results,
  noNewSourceGeometry:true,noNewNavLinks:true,
  noNewScoreableMask:true,actualNativeKccGapTraversalProven:false,
  activationReady:false,productionAuthorized:false,
  original4v4Certified:false,
  nextEngineeringDecision:
   'EXAMINE_SOURCE_FACE_CHAIN_TO_RUNTIME_NAVMESH_TO_KCC_NOT_GUESS_BRIDGE'
 };
}
