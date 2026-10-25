/**
 * B173: bulk exact Temple01 source-face continuity classification.
 * Distances are nearest surface-to-surface spatial witnesses, NOT true
 * player KCC clearance, traversability or additional authorized geometry.
 * Uses only the 42 already repository-verified source triangles.
 */
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';

type P=readonly [number,number,number];
const minus=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const plus=(a:P,b:P,s:number):P=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const len=(a:P,b:P)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const segmentPoint=(p:P,a:P,b:P):P=>{
 const v=minus(b,a),s=dot(v,v);
 return plus(a,v,s<1e-10?0:clamp(dot(minus(p,a),v)/s));
};
/** Ericson barycentric closest triangle surface point; no ray assumption. */
function trianglePoint(p:P,a:P,b:P,c:P):P{
 const ab=minus(b,a),ac=minus(c,a),ap=minus(p,a);
 const d1=dot(ab,ap),d2=dot(ac,ap);
 if(d1<=0&&d2<=0)return a;
 const bp=minus(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
 if(d3>=0&&d4<=d3)return b;
 const vc=d1*d4-d3*d2;
 if(vc<=0&&d1>=0&&d3<=0)
  return plus(a,ab,d1/(d1-d3));
 const cp=minus(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
 if(d6>=0&&d5<=d6)return c;
 const vb=d5*d2-d1*d6;
 if(vb<=0&&d2>=0&&d6<=0)
  return plus(a,ac,d2/(d2-d6));
 const va=d3*d6-d5*d4;
 if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0)
  return plus(b,minus(c,b),(d4-d3)/((d4-d3)+(d5-d6)));
 const sum=va+vb+vc;
 if(Math.abs(sum)<1e-12){
  return [segmentPoint(p,a,b),segmentPoint(p,b,c),
   segmentPoint(p,c,a)].sort((u,v)=>len(u,p)-len(v,p))[0]!;
 }
 const inv=1/sum;
 return plus(plus(a,ab,vb*inv),ac,vc*inv);
}
/** Closest endpoints on two bounded line segments, not infinite lines. */
function segmentPair(a:P,b:P,c:P,d:P):readonly [P,P]{
 const u=minus(b,a),v=minus(d,c),w=minus(a,c);
 const A=dot(u,u),B=dot(u,v),C=dot(v,v),
  D=dot(u,w),E=dot(v,w);
 if(A<1e-12)return [a,segmentPoint(a,c,d)];
 if(C<1e-12)return [segmentPoint(c,a,b),c];
 const determinant=A*C-B*B;
 let s=determinant>1e-12?clamp((B*E-C*D)/determinant):0;
 let t=clamp((B*s+E)/C);
 s=clamp((B*t-D)/A);
 t=clamp((B*s+E)/C);
 return [plus(a,u,s),plus(c,v,t)];
}
type Triangle=readonly [P,P,P];
function allTriangles(id:string):Triangle[]{
 const record=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(r=>r.id===id);
 if(!record)throw Error('B173_MISSING_EXACT_ORIGINAL_COMPONENT_'+id);
 const {vertices,indices}=record.mesh,out:Triangle[]=[];
 if(indices.length%3!==0)throw Error('B173_INVALID_ORIGINAL_TRIANGLES');
 for(let i=0;i<indices.length;i+=3){
  const points=[vertices[indices[i]!]!,
   vertices[indices[i+1]!]!,vertices[indices[i+2]!]!] as Triangle;
  if(points.some(p=>!p||p.some(n=>!Number.isFinite(n))))
   throw Error('B173_NONFINITE_ORIGINAL_SOURCE_FACE');
  out.push(points);
 }
 return out;
}
function nearestSurfaces(left:Triangle[],right:Triangle[]){
 let best=Infinity,first:P|null=null,second:P|null=null;
 const offer=(a:P,b:P)=>{
  const dist=len(a,b);
  if(dist<best){best=dist;first=a;second=b;}
 };
 for(const aa of left)for(const bb of right){
  for(const p of aa)offer(p,trianglePoint(p,...bb));
  for(const p of bb)offer(trianglePoint(p,...aa),p);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
   const pair=segmentPair(aa[i]!,aa[(i+1)%3]!,
    bb[j]!,bb[(j+1)%3]!);
   offer(pair[0],pair[1]);
  }
 }
 if(!first||!second||!Number.isFinite(best))
  throw Error('B173_NO_FINITE_ORIGINAL_FACE_CLEARANCE');
 return {distanceMeters:best,nearestA:first as P,nearestB:second as P};
}
const ORDER=[
 'underpass-route-slope01',
 'underpass-route-floor-concrete01',
 'underpass-route-slope00-outer',
 'underpass-route-floor-concrete02',
 'underpass-route-slope00-inner'
] as const;
export function inspectB173ExactSourceChain(){
 const prior=UNDERTOW_UNDERPASS_ROUTE_COMPONENT_AUDIT;
 if(prior.experimentalCiRun!==691||
    prior.experimentalRuntimeInclusionReachedTarget!==false||
    prior.runtimePromotionAuthorized!==false||
    prior.offMeshLinkAuthorized!==false||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.length!==10)
  throw Error('B173_UNVERIFIED_SOURCE_OR_WRONG_PRIOR_TRIAL');
 const links=[];
 for(const side of ['positive-z','negative-z'] as const){
  for(let i=0;i<ORDER.length-1;i++){
   const idA=ORDER[i]+'-'+side,idB=ORDER[i+1]+'-'+side;
   const a=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(x=>x.id===idA)!;
   const b=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(x=>x.id===idB)!;
   const nearest=nearestSurfaces(allTriangles(idA),allTriangles(idB));
   links.push({
    side,sourceFrom:idA,sourceTo:idB,
    exactOriginalSourceGraphFrom:a.routeGraphComponentId,
    exactOriginalSourceGraphTo:b.routeGraphComponentId,
    existingExactSource3dFaceGapMeters:
     Number(nearest.distanceMeters.toFixed(6)),
    nearestExactSourceFacePointFrom:nearest.nearestA,
    nearestExactSourceFacePointTo:nearest.nearestB,
    originalFacesSpatiallyNearWithin030m:nearest.distanceMeters<=.30,
    originalHumanKccTraversabilityCertified:false as const,
    nativeRecastEndpointConnectedCertified:false as const,
    noOriginalSourceCollisionPromoted:true as const
   });
  }
 }
 return {
  authority:'CI688_ORIGINAL_42_TRIANGLES_AND_FAILED_CI691' as const,
  inputOriginalSourceComponents:10 as const,
  inputOriginalSourceTriangles:42 as const,
  sourceRouteSides:2 as const,
  adjacentExactSourcePairsChecked:8 as const,
  links,
  allEightSpatialConnectionsWithin030m:
   links.every(x=>x.originalFacesSpatiallyNearWithin030m),
  previousNativeExperimentConnected:false as const,
  currentOriginalRapierKccSourceTraversalCertified:false as const,
  originalTwoTeamRouteCertified:false as const,
  originalStageChanged:false as const,
  newNavLinks:0 as const,
  newScoreable:0 as const,
  productionAuthorized:false as const,
  nextAction:'RECOVER_MISSING_ORIGINAL_FACE_CHAIN_OR_KCC_EVIDENCE' as const
 };
}
