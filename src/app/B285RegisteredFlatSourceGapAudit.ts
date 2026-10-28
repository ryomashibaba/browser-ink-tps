/**
 * B285: exact registered 2D-source boundary distances, not a route claim.
 * Measures only flat, already-registered floor polygons inside frozen 25 solids.
 * Slopes, triangle meshes, KCC, CPU and NavMesh are NOT substituted by this scan.
 */
import {UNDERTOW_MODEL_XZ_GEOMETRY} from '../stage/undertow/UndertowSpillwayModelXZGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';

type XZ=readonly [number,number];
const EPS=1e-9;

function cross(a:XZ,b:XZ,c:XZ){
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
}
function onSegment(a:XZ,b:XZ,p:XZ){
 return Math.abs(cross(a,b,p))<=EPS&&
  p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&
  p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS;
}
function intersects(a:XZ,b:XZ,c:XZ,d:XZ){
 const p=cross(a,b,c),q=cross(a,b,d),r=cross(c,d,a),s=cross(c,d,b);
 return (p*q < -EPS&&r*s < -EPS)||
  onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);
}
function closestPointOnSegment(p:XZ,a:XZ,b:XZ):{distance:number;point:XZ}{
 const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;
 const t=l2<EPS?0:Math.max(0,Math.min(1,
  ((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2));
 const q:XZ=[a[0]+t*dx,a[1]+t*dz];
 return {distance:Math.hypot(p[0]-q[0],p[1]-q[1]),point:q};
}
export function b285BoundaryDistanceMeters(a:readonly XZ[],b:readonly XZ[]){
 if(a.length<3||b.length<3||
    [...a,...b].some(p=>p.length!==2||!p.every(Number.isFinite)))
  throw Error('B285_INVALID_REGISTERED_CONTOUR');
 let best=Infinity;
 for(let i=0;i<a.length;i++){
  const p=a[i]!,q=a[(i+1)%a.length]!;
  for(let j=0;j<b.length;j++){
   const u=b[j]!,v=b[(j+1)%b.length]!;
   if(intersects(p,q,u,v))return 0;
   best=Math.min(best,
    closestPointOnSegment(p,u,v).distance,
    closestPointOnSegment(q,u,v).distance,
    closestPointOnSegment(u,p,q).distance,
    closestPointOnSegment(v,p,q).distance);
  }
 }
 return best;
}

export function auditB285FrozenFlatSurfaceGaps(){
 if(stage.activationReady!==false||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks.length!==26)
  throw Error('B285_FROZEN_SOURCE_STAGE_CHANGED');
 const named=new Map(stage.solids.map(x=>[x.id,x]));
 if(UNDERTOW_MODEL_XZ_GEOMETRY.length!==10)
  throw Error('B285_REGISTERED_FLAT_FAMILY_CHANGED');
 for(const p of UNDERTOW_MODEL_XZ_GEOMETRY){
  const s=named.get('UndertowT21D:'+p.id);
  if(!s?.footprint||s.triangleMesh||s.rotationEulerDegrees||
     Math.abs(s.center[1]+s.size[1]/2-p.sourceYProjectMeters)>EPS||
     p.projectOuter.length<3)
   throw Error('B285_SOURCE_FLAT_REGISTRATION_INVALID_'+p.id);
 }
 const byId=new Map(UNDERTOW_MODEL_XZ_GEOMETRY.map(p=>[p.id,p]));
 function auditPair(sourceId:string,destId:string){
  const a=byId.get(sourceId),b=byId.get(destId);
  if(!a||!b)throw Error('B285_EXPECTED_SOURCE_ID_NOT_REGISTERED');
  return {
   from:'UndertowT21D:'+a.id,to:'UndertowT21D:'+b.id,
   originalProjectYFrom:a.sourceYProjectMeters,
   originalProjectYTo:b.sourceYProjectMeters,
   verticalDeltaMeters:b.sourceYProjectMeters-a.sourceYProjectMeters,
   directFlatBoundarySeparationMeters:b285BoundaryDistanceMeters(
    a.projectOuter,b.projectOuter),
   // A 2D boundary distance is neither a physics capsule sweep nor
   // a geodesic path through all 25 Rapier solids.
   actualRapierKccTraversalMeasuredHere:false as const,
   sourceRecastPathMeasuredHere:false as const,
   remainingTriMeshAndRampRoutesNotExcluded:true as const
  };
 }
 const pairs=[
  auditPair('right-low-team-a','glass-underpass-positive-z'),
  auditPair('right-low-team-b','glass-underpass-negative-z'),
  auditPair('right-low-team-a','center-low-team-b'),
  auditPair('right-low-team-b','center-low-team-a'),
  auditPair('right-low-team-a','first-drop-landing-positive-z'),
  auditPair('right-low-team-b','first-drop-landing-negative-z')
 ];
 return {
  schema:'B285_FROZEN_FLAT_SOURCE_GAP_V1' as const,
  registeredFlatSourceFootprintsAudited:10 as const,
  registeredSolidCount:25 as const,
  registeredPaintCount:17 as const,
  registeredNavLinkCount:26 as const,
  scoreablePromotions:0 as const,
  sourceOriginalCollisionAuthorizationAdded:0 as const,
  originalFaceGeometryAltered:false as const,
  pairs,
  // Historical real B155 Recast failures, NOT fresh native queries.
  historicB155NativePositiveEndpointErrorMeters:31.7162272,
  historicB155NativeNegativeEndpointErrorMeters:31.7857453,
  newDistinctSourceReached:false as const,
  newSafeCpuRouteCertified:false as const,
  gameOriginalFloorLine00CollisionInclusionAuthenticated:false as const,
  activationReady:false as const,
  productionAuthorized:false as const,
  unrestricted4v4Certified:false as const
 };
}
