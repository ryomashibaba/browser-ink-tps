/**
 * B220: eight bounded ACTUAL Recast/Rapier seam queries on CI688 original
 * Temple01 floor/ramps. Endpoints are centroids of authentic source
 * triangles, NOT virtual physical CPU feet, new walkable geometry, or a
 * certified path. Read-only inspection follows B219 priority ranking.
 */
import {Vec3} from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition,StageTriangleMeshGeometry} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as SOURCE_FACES,
 type UndertowUnderpassRouteRecord}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {b219TriageOriginalNavmeshSourceFailure}
 from './B219OriginalUnderpassDisconnection';

type P=readonly [number,number,number];
type Nav=Pick<RecastStageNavigation,'auditNavMeshProjection'|'auditPath'>;
type Rapier=Pick<RapierStagePhysics,'castStageSegment'>;
type B219=ReturnType<typeof b219TriageOriginalNavmeshSourceFailure>;
const magnitude=(a:P,b:P)=>Math.hypot(
 a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function centers(mesh:StageTriangleMeshGeometry):readonly P[]{
 if(!mesh.indices.length||mesh.indices.length%3!==0)
  throw Error('B220_NO_ORIGINAL_TRIANGLE_CENTROIDS');
 const centroids:P[]=[];
 for(let i=0;i<mesh.indices.length;i+=3){
  const a=mesh.vertices[mesh.indices[i]!]!,
   b=mesh.vertices[mesh.indices[i+1]!]!,
   c=mesh.vertices[mesh.indices[i+2]!]!;
  if(!a||!b||!c||![...a,...b,...c].every(Number.isFinite))
   throw Error('B220_INVALID_ORIGINAL_CI688_TRIANGLE');
  centroids.push([(a[0]+b[0]+c[0])/3,
   (a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3]);
 }
 return centroids;
}
/** B220 records the closest two ACTUAL triangle centroids, distinct
 * from B218's EXACT closest triangle surface points (usually edges).
 */
export function b220SourceTriangleCentroidWitness(
 a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry
){
 const left=centers(a),right=centers(b);
 let best:{from:P;to:P;fromFaceIndex:number;toFaceIndex:number;
  distanceMeters:number}|null=null;
 for(let i=0;i<left.length;i++)for(let j=0;j<right.length;j++){
  const x=left[i]!,y=right[j]!,distanceMeters=magnitude(x,y);
  if(!best||distanceMeters<best.distanceMeters)
   best={from:x,to:y,fromFaceIndex:i,toFaceIndex:j,distanceMeters};
 }
 if(!best)throw Error('B220_NO_AUTHENTIC_ORIGINAL_FACE_PAIR');
 return best;
}
const finite=(n:number)=>Number.isFinite(n)?n:null;
export function b220AuditOriginalRecastSeamWitnesses(
 stage:StageDefinition,nav:Nav,rapier:Rapier,previous:B219,
 faces:readonly UndertowUnderpassRouteRecord[]=SOURCE_FACES
){
 if(stage.metadata.id!=='undertow-t21d-partial-connectivity-qa'||
    stage.solids.length!==25||stage.paintSurfaces.length!==17||
    stage.navigationLinks?.length!==26||
    stage.paintSurfaces.some(s=>(s.flags&SurfaceFlags.Scoreable)!==0)||
    previous.originalAuthority!==
     '25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    previous.priorityRankedSeams.length!==8||
    previous.priorCi691AllComponentsAddedButRecastFailed!==true||
    previous.nativeRecastCorridorCertified!==false||
    previous.physicalKccCorridorCertified!==false||
    previous.addedGeometry!==0||previous.addedNavLinks!==0||
    previous.sourceScoreableAdded!==0||
    previous.productionAuthorized!==false||
    faces.length!==10)
  throw Error('B220_FROZEN_ORIGINAL_RECAST_RAPIER_ONLY');
 // B221: B219 ranked seam IDs are strings; resolve them in the exact
 // original source map and still fail closed on unknown or wrong-side IDs.
 const map=new Map<string,UndertowUnderpassRouteRecord>(
  faces.map(f=>[f.id,f]));
 if(map.size!==10)throw Error('B220_ORIGINAL_SOURCE_FACE_DUPLICATION');
 const sources=previous.priorityRankedSeams.map(seam=>{
  const from=map.get(seam.from),to=map.get(seam.to);
  if(!from||!to||from.side!==seam.side||to.side!==seam.side)
   throw Error('B220_UNREGISTERED_EXACT_ORIGINAL_SOURCE_FACE_PAIR');
  const witness=b220SourceTriangleCentroidWitness(from.mesh,to.mesh);
  const a=new Vec3(...witness.from),b=new Vec3(...witness.to);
  const projectionA=nav.auditNavMeshProjection(a);
  const projectionB=nav.auditNavMeshProjection(b);
  // This real Recast endpoint request may fail. Failed is evidence.
  // A reached endpoint is not a KCC or source-floor certificate.
  const route=nav.auditPath(a,b,.35);
  const observe=(p:Vec3)=>{
   const hit=rapier.castStageSegment(
    new Vec3(p.x,p.y+.65,p.z),
    new Vec3(p.x,p.y-.65,p.z),'ink-projectile');
   const residual=hit?Math.abs(hit.point.y-p.y):null;
   return {solidId:hit?.solidId??null,
    verticalResidualMeters:residual,
    supportedByExistingRegisteredSource:
     !!hit&&residual!==null&&residual<=.25&&
     stage.solids.some(s=>s.id===hit.solidId)};
  };
  const floorA=observe(a),floorB=observe(b);
  const validRecastEndpoints=route.reachedTarget&&
   route.startSnapDistanceMeters<=.20&&
   route.endSnapDistanceMeters<=.20&&route.pointCount>0;
  const bothSourceFeetSupported=floorA.supportedByExistingRegisteredSource&&
   floorB.supportedByExistingRegisteredSource;
  const diagnosis=seam.exactSourceGapMeters>.30?
    'ORIGINAL_3D_SOURCE_FACE_SEPARATION':
    !validRecastEndpoints?
    'ORIGINAL_NATIVE_RECAST_ENDPOINT_UNREACHED_OR_SNAPPED':
    !bothSourceFeetSupported?
    'ORIGINAL_RAPIER_SOURCE_SUPPORT_MISSING':
    'RECAST_AND_STAGE_RAYS_ONLY_KCC_NOT_VALIDATED';
  return {
   side:seam.side,from:seam.from,to:seam.to,
   geometricGapMeters:seam.exactSourceGapMeters,
   referenceIsSourceTriangleCentroidNotPhysicalActor:true as const,
   fromOriginalSourceFaceIndex:witness.fromFaceIndex,
   toOriginalSourceFaceIndex:witness.toFaceIndex,
   originalSourceCentroids:[witness.from,witness.to] as const,
   centroidDistanceMeters:Number(witness.distanceMeters.toFixed(6)),
   reprojectedNative:[
    {success:projectionA.success,
     nearest:projectionA.nearestPoint?
      [projectionA.nearestPoint.x,projectionA.nearestPoint.y,
       projectionA.nearestPoint.z]:null,
     distanceMeters:finite(projectionA.distanceMeters??Infinity)},
    {success:projectionB.success,
     nearest:projectionB.nearestPoint?
      [projectionB.nearestPoint.x,projectionB.nearestPoint.y,
       projectionB.nearestPoint.z]:null,
     distanceMeters:finite(projectionB.distanceMeters??Infinity)}
   ] as const,
   nativeRecast:{
    querySucceeded:route.querySuccess,
    reachedRequestedSourceCentroid:route.reachedTarget,
    startSnapDistanceMeters:finite(route.startSnapDistanceMeters),
    endSnapDistanceMeters:finite(route.endSnapDistanceMeters),
    endpointErrorMeters:finite(route.endpointErrorMeters),
    nativePathPoints:route.pointCount,
    credibleOriginalSourceEndpoints:validRecastEndpoints
   },
   registeredSourceRapier:[floorA,floorB] as const,
   bothOriginalEndpointsRapierSupported:bothSourceFeetSupported,
   diagnosis,
   genuineCPUPathTraversalTested:false as const,
   characterKccPhysicallyTraversed:false as const,
   gameRouteAuthorized:false as const
  };
 });
 return {
  evidence:'B220_REAL_RECAST_AND_RAPIER_AT_CI688_SOURCE_TRIANGLE_CENTROIDS' as const,
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE' as const,
  actualNativeRecastAuditPathQueries:8 as const,
  actualNativeNearestProjectionQueries:16 as const,
  actualOriginalRapierStageRayQueries:16 as const,
  exactSourceFacesUnchanged:10 as const,
  actualOriginalFacePairs:sources,
  firstPrioritySeam:sources[0]??null,
  onlyReadSourceTriangles:true as const,
  originalCrossTeamRoutesCertified:'0/12' as const,
  naturalCPUEncounterCertified:false as const,
  physicalKccTraversalCertified:false as const,
  addedPhysicsBodies:0 as const,addedNavLinks:0 as const,
  addedScoreable:0 as const,productionAuthorized:false as const
 };
}
