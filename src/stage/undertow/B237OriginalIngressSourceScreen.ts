/**
 * B237 source-only original Temple01 component search at real 4.22m
 * right-low ↔ FloorSlope01 upper-edge discontinuity.
 *
 * Input original data is exact, but edge sampling is a CANDIDATE SCREEN:
 * no renderer, Rapier collider, Recast link, painted floor or authority.
 * DO NOT infer absence of geometry from absence of this sample's hits.
 */
import type {StageVector3} from '../StageDefinition';
import {UNDERTOW_MODEL_XZ_GEOMETRY}
 from './UndertowSpillwayModelXZGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from './UndertowSpillwayBlockoutGeometry';
import type {B235Side} from './B235ExactOriginalSourceEntryQa';

type P=readonly[number,number,number];
export interface B237SourceCandidate{
 readonly family:string;readonly id:string;readonly sourceComponent:string;
 readonly sourceMaterial:string;readonly side:B235Side;
 readonly originalVertices:readonly StageVector3[];
 readonly originalRuntimePromotionAuthorized:false;
 readonly originalSourceShapeNotGameplayAuthority:true;
}
type Witness={distanceMeters:number;sample:P;nearestOriginalTriangle:P;
 triangleIndex:number};
const sub=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const add=(a:P,b:P,t=1):P=>[a[0]+b[0]*t,a[1]+b[1]*t,a[2]+b[2]*t];
const distance=(a:P,b:P)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function triangleClosest(p:P,a:P,b:P,c:P):P{
 const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
 const d1=dot(ab,ap),d2=dot(ac,ap);
 if(d1<=0&&d2<=0)return a;
 const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
 if(d3>=0&&d4<=d3)return b;
 const vc=d1*d4-d3*d2;
 if(vc<=0&&d1>=0&&d3<=0)return add(a,ab,d1/(d1-d3));
 const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
 if(d6>=0&&d5<=d6)return c;
 const vb=d5*d2-d1*d6;
 if(vb<=0&&d2>=0&&d6<=0)return add(a,ac,d2/(d2-d6));
 const va=d3*d6-d5*d4;
 if(va<=0&&d4-d3>=0&&d5-d6>=0)
  return add(b,sub(c,b),(d4-d3)/((d4-d3)+(d5-d6)));
 const denom=va+vb+vc;
 if(Math.abs(denom)<1e-14)return a;
 const v=vb/denom,w=vc/denom;
 return add(add(a,ab,v),ac,w);
}
function edgeSamples(a:P,b:P,count:number):P[]{
 return Array.from({length:count+1},(_,i)=>add(a,sub(b,a),i/count));
}
function sourceTriangleNearest(samples:readonly P[],vertices:readonly StageVector3[]):Witness{
 let best:Witness={distanceMeters:Infinity,sample:[0,0,0],
  nearestOriginalTriangle:[0,0,0],triangleIndex:-1};
 for(let i=0;i+2<vertices.length;i+=3){
  const a=vertices[i]!,b=vertices[i+1]!,c=vertices[i+2]!;
  for(const sample of samples){
   const near=triangleClosest(sample,a,b,c);
   const d=distance(sample,near);
   if(d<best.distanceMeters)best={distanceMeters:d,
    sample,nearestOriginalTriangle:near,triangleIndex:i/3};
  }
 }
 return best;
}
function shape(vertices:readonly StageVector3[]){
 let surfaces=0,upward=0,flat=0;
 for(let i=0;i+2<vertices.length;i+=3){
  const [a,b,c]=[vertices[i]!,vertices[i+1]!,vertices[i+2]!];
  const u=sub(b,a),v=sub(c,a);
  const cross:[number,number,number]=[
   u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],
   u[0]*v[1]-u[1]*v[0]];
  const len=Math.hypot(...cross);
  if(len<1e-8)continue;
  surfaces++;
  if(Math.abs(cross[1]/len)>=.5)upward++;
  if(Math.abs(cross[1]/len)>=.9)flat++;
 }
 return {triangles:vertices.length/3,nonDegenerate:surfaces,
  floorFacingTriangles:upward,
  shallowFloorFacingTriangles:flat,
  potentialWalkableBySlopeAngleOnly:upward>0};
}
export function b237OriginalIngressSourceScreen(
 side:B235Side,candidates:readonly B237SourceCandidate[]){
 if(FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||FROZEN.activationReady!==false)
  throw Error('B237_ORIGINAL_STAGE_FREEZE_CHANGED');
 const contour=UNDERTOW_MODEL_XZ_GEOMETRY.find(f=>
  f.id==='right-low-team-'+(side==='POSITIVE_Z'?'a':'b'));
 const slope=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(f=>f.side===side&&
  f.id==='underpass-route-slope01-'+
  (side==='POSITIVE_Z'?'positive-z':'negative-z'));
 if(!contour||!slope)throw Error('B237_SOURCE_GEOMETRY_MISSING');
 const topHeight=Math.max(...slope.mesh.vertices.map(v=>v[1]));
 const upper=[...new Map(slope.mesh.vertices.filter(v=>
  Math.abs(v[1]-topHeight)<1e-6).map(v=>[v.join(','),v] as const)).values()];
 if(upper.length!==2||contour.sourceYProjectMeters!==4.5)
  throw Error('B237_ORIGINAL_SOURCE_SEAM_DRIFT');
 const [a,b]=upper;
 const upperEdge=edgeSamples(a!,b!,16);
 const rightlow:P[]=[];
 for(let i=0;i<contour.projectOuter.length;i++){
  const p=contour.projectOuter[i]!,q=contour.projectOuter[(i+1)%contour.projectOuter.length]!;
  rightlow.push(...edgeSamples([p[0],4.5,p[1]],[q[0],4.5,q[1]],8));
 }
 const seen=new Set<string>();
 const rows=[];
 for(const c of candidates){
  if(c.side!==side||c.originalRuntimePromotionAuthorized!==false||
     !c.originalSourceShapeNotGameplayAuthority||
     c.originalVertices.length%3!==0)
   throw Error('B237_NONORIGINAL_OR_UNTRUSTED_SOURCE_CANDIDATE');
  const token=c.family+':'+c.id;
  if(seen.has(token))throw Error('B237_DUPLICATE_SOURCE_CANDIDATE');
  seen.add(token);
  const verts=c.originalVertices;
  const xs=verts.map(v=>v[0]),ys=verts.map(v=>v[1]),zs=verts.map(v=>v[2]);
  const bounds={
   x:[Math.min(...xs),Math.max(...xs)] as const,
   y:[Math.min(...ys),Math.max(...ys)] as const,
   z:[Math.min(...zs),Math.max(...zs)] as const
  };
  const morphology=shape(verts);
  // Only cheap exact 3D bounds for dispatch, not a "no missing sources" proof.
  const slopeZ=slope.mesh.vertices.map(v=>v[2]);
  const slopeX=slope.mesh.vertices.map(v=>v[0]);
  const allX=[...contour.projectOuter.map(v=>v[0]),...slopeX];
  const allZ=[...contour.projectOuter.map(v=>v[1]),...slopeZ];
  const minX=Math.min(...allX)-10,maxX=Math.max(...allX)+10;
  const minZ=Math.min(...allZ)-10,maxZ=Math.max(...allZ)+10;
  const nearRegion=bounds.x[1]>=minX&&bounds.x[0]<=maxX&&
    bounds.z[1]>=minZ&&bounds.z[0]<=maxZ&&
    bounds.y[1]>=-.5&&bounds.y[0]<=6.0;
  if(!nearRegion)continue;
  const right=sourceTriangleNearest(rightlow,verts);
  const slopeTop=sourceTriangleNearest(upperEdge,verts);
  rows.push({family:c.family,id:c.id,material:c.sourceMaterial,
   sourceComponent:c.sourceComponent,originalSourceSide:c.side,
   originalRuntimePromotionAuthorized:false as const,
   vertices:verts.length,shape:morphology,bounds,
   registeredRightLowBoundarySeparation:right,
   exactOriginalSlopeTopSeparation:slopeTop,
   bothContactsWithin035:right.distanceMeters<=.35&&
    slopeTop.distanceMeters<=.35,
   admissibleGroundSlopeCandidate:morphology.floorFacingTriangles>0,
   sourceFaceConnectivityBetweenContactsVerified:false as const,
   physicalCpuTraversalVerified:false as const,
   routeAuthority:'NONE' as const,
   combinedDistance:right.distanceMeters+slopeTop.distanceMeters});
 }
 rows.sort((a,b)=>a.combinedDistance-b.combinedDistance);
 return {side,candidateCatalogCount:candidates.length,
  candidateRegionCount:rows.length,
  originalRightLowContourY:4.5,exactSlope01TopY:topHeight,
  bestCandidateRows:rows.slice(0,16),
  geometricallyNearBothBoundarySamples:rows.filter(r=>r.bothContactsWithin035),
  topOriginalUpperEdge:[a,b],
  samplingResolution:'RIGHTLOW_8_PER_EDGE_SLOPE_TOP_16',
  candidateScreenCompleteSourceScan:false as const,
  candidateScreenCertifiesOriginalRoute:false as const,
  sanctionedNewFaces:0 as const,officialStage:'25/17/26/0' as const,
  actualCpuSourceRoutesCertified:'0/12' as const,
  productionAuthorized:false as const};
}
