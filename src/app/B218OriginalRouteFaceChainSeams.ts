/** B218. Exact geometric closest distance between existing CI688
 * ORIGINAL Temple01 3D triangle meshes. Never fabricates connected floor,
 * Recast access, KCC, official Turf, CPU feet or cross-team routes.
 */
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT as BASE,
 type UndertowUnderpassRouteRecord as SourceFace}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {StageTriangleMeshGeometry} from '../stage/StageDefinition';
type P=readonly [number,number,number];
const EPS=1e-12;
const diff=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix=(a:P,v:P,t:number):P=>[a[0]+v[0]*t,a[1]+v[1]*t,a[2]+v[2]*t];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm=(a:P,b:P)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const cut=(t:number)=>Math.max(0,Math.min(1,t));
function nearestEdge(p:P,a:P,b:P):P{
 const v=diff(b,a),d=dot(v,v);
 return mix(a,v,d<EPS?0:cut(dot(diff(p,a),v)/d));
}
function nearestTriangle(p:P,a:P,b:P,c:P):P{
 const u=diff(b,a),v=diff(c,a),n:P=[
 u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 const nn=dot(n,n);
 if(nn>EPS){
  const projection=mix(p,n,-dot(diff(p,a),n)/nn);
  const w=diff(projection,a),uu=dot(u,u),uv=dot(u,v),
   vv=dot(v,v),wu=dot(w,u),wv=dot(w,v);
  const den=uu*vv-uv*uv;
  if(den>EPS){
   const x=(vv*wu-uv*wv)/den,y=(uu*wv-uv*wu)/den;
   if(x>=-1e-8&&y>=-1e-8&&x+y<=1+1e-8)return projection;
  }
 }
 return [nearestEdge(p,a,b),nearestEdge(p,b,c),nearestEdge(p,c,a)]
  .sort((x,y)=>norm(x,p)-norm(y,p))[0]!;
}
function edgeDistance(p:P,q:P,r:P,s:P):number{
 const u=diff(q,p),v=diff(s,r),w=diff(p,r),
  uu=dot(u,u),vv=dot(v,v),uw=dot(u,w),vw=dot(v,w);
 if(uu<EPS&&vv<EPS)return norm(p,r);
 let a=0,c=0;
 if(uu<EPS)c=cut(vw/vv);
 else if(vv<EPS)a=cut(-uw/uu);
 else{
  const uv=dot(u,v),den=uu*vv-uv*uv;
  a=den>EPS?cut((uv*vw-uw*vv)/den):0;
  c=(uv*a+vw)/vv;
  if(c<0){c=0;a=cut(-uw/uu);}
  else if(c>1){c=1;a=cut((uv-uw)/uu);}
 }
 return norm(mix(p,u,a),mix(r,v,c));
}
type Tri=readonly [P,P,P];
function readTriangles(m:StageTriangleMeshGeometry):Tri[]{
 if(m.indices.length===0||m.indices.length%3!==0||
  m.vertices.some(p=>p.length!==3||!p.every(Number.isFinite)))
  throw Error('B218_INVALID_ORIGINAL_SOURCE_TRIANGLES');
 const out:Tri[]=[];
 for(let i=0;i<m.indices.length;i+=3){
  const a=m.vertices[m.indices[i]!]!,b=m.vertices[m.indices[i+1]!]!,
   c=m.vertices[m.indices[i+2]!]!;
  if(!a||!b||!c)throw Error('B218_UNDEFINED_SOURCE_TRIANGLE');
  out.push([a,b,c]);
 }
 return out;
}
export function b218OriginalTriangleMeshSeparation(
 a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry
):number{
 const x=readTriangles(a),y=readTriangles(b);
 let best=Infinity;
 for(const t of x)for(const v of y){
  for(const p of t)best=Math.min(best,norm(p,nearestTriangle(p,...v)));
  for(const p of v)best=Math.min(best,norm(p,nearestTriangle(p,...t)));
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)
   best=Math.min(best,edgeDistance(t[i]!,t[(i+1)%3]!,
      v[j]!,v[(j+1)%3]!));
 }
 return best;
}
const CHAIN=['underpass-route-slope01','underpass-route-floor-concrete01',
 'underpass-route-slope00-outer','underpass-route-floor-concrete02',
 'underpass-route-slope00-inner'] as const;
export function b218OriginalRouteFaceChainSeams(
 faces:readonly SourceFace[]=FACES
){
 if(BASE.experimentalCiRun!==691||
    BASE.experimentalRuntimeInclusionReachedTarget!==false||
    BASE.runtimePromotionAuthorized!==false||
    BASE.offMeshLinkAuthorized!==false||
    faces.length!==10||new Set(faces.map(f=>f.id)).size!==10||
    faces.filter(f=>f.side==='POSITIVE_Z').length!==5||
    faces.filter(f=>f.side==='NEGATIVE_Z').length!==5)
   throw Error('B218_FROZEN_SOURCE_FACE_AUTHORITY');
 const results:{
  side:'POSITIVE_Z'|'NEGATIVE_Z';from:string;to:string;
  gapMeters:number;priorGraphComponents:readonly [number,number];
  nearOriginalFaceWithin30cm:boolean;
  nativeConnectedCertified:false;physicalKccCertified:false
 }[]=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const chain=CHAIN.map(name=>{
   const id=name+(side==='POSITIVE_Z'?'-positive-z':'-negative-z');
   const hit=faces.find(f=>f.id===id&&f.side===side);
   if(!hit)throw Error('B218_MISSING_ORIGINAL_FACE_'+id);
   return hit;
  });
  for(let i=0;i<4;i++){
   const a=chain[i]!,b=chain[i+1]!;
   const dist=b218OriginalTriangleMeshSeparation(a.mesh,b.mesh);
   if(!Number.isFinite(dist)||dist<0)
    throw Error('B218_INVALID_ORIGINAL_FACE_DISTANCE');
   results.push({
    side,from:a.id,to:b.id,gapMeters:Number(dist.toFixed(6)),
    priorGraphComponents:[a.routeGraphComponentId,b.routeGraphComponentId],
    nearOriginalFaceWithin30cm:dist<=.3,
    nativeConnectedCertified:false,physicalKccCertified:false
   });
  }
 }
 return {
  evidence:'CI688_EXACT_ORIGINAL_TEMPLE01_TRIANGLE_SURFACE_DISTANCE' as const,
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE' as const,
  adjacentSeams:8 as const,originalFaces:42 as const,
  seams:results,
  widestBySide:(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
   side,meters:Math.max(...results.filter(x=>x.side===side).map(x=>x.gapMeters))
  })),
  previousAllFiveFaceRecastExperimentSucceeded:false as const,
  nativeTraversalCertified:false as const,
  actualKccTraversalCertified:false as const,
  originalRouteCertified:'0/12' as const,
  inventedStageSolids:0 as const,navLinksAdded:0 as const,
  scoreablePromotions:0 as const,productionAuthorized:false as const
 };
}
