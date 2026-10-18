/**
 * W10-B8: frozen-authority source-face adjacency and isolated Rapier/HUMAN
 * KCC slope witness. This is NOT a runtime route proposal, gap fill,
 * permission for enemy engagement, or original traversal certification.
 *
 * The ten model-exact FloorSlope/FloorConcrete components and the already
 * frozen right-low FloorConcrete03 ramp are used WITHOUT altering vertices.
 * Full 3D triangle-triangle distance includes segment/face intersections.
 */
import {Vec3} from 'playcanvas';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {auditPhase14JRapierRejoinStep} from './UndertowPhase14JCollisionRejoinGate';
import type {StageDefinition,StageVector3,StageTriangleMeshGeometry}
 from '../StageDefinition';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 undertowUnderpassRouteStageSolids}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from './UndertowSpillwayRouteRampGeometry';

type P=StageVector3;
const add=(a:P,b:P):P=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const scale=(a:P,s:number):P=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a:P,b:P)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:P,b:P):P=>[
 a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dist2=(a:P,b:P)=>dot(sub(a,b),sub(a,b));
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const tri=(mesh:StageTriangleMeshGeometry,i:number):readonly [P,P,P]=>{
 const ids=mesh.indices;
 return [mesh.vertices[ids[i]!]!,mesh.vertices[ids[i+1]!]!,
  mesh.vertices[ids[i+2]!]!];
};
function pointTriDist2(p:P,a:P,b:P,c:P):number{
 const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
 const d1=dot(ab,ap),d2=dot(ac,ap);
 if(d1<=0&&d2<=0)return dist2(p,a);
 const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
 if(d3>=0&&d4<=d3)return dist2(p,b);
 const vc=d1*d4-d3*d2;
 if(vc<=0&&d1>=0&&d3<=0)return dist2(p,add(a,scale(ab,d1/(d1-d3))));
 const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
 if(d6>=0&&d5<=d6)return dist2(p,c);
 const vb=d5*d2-d1*d6;
 if(vb<=0&&d2>=0&&d6<=0)return dist2(p,add(a,scale(ac,d2/(d2-d6))));
 const va=d3*d6-d5*d4;
 if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){
  const bc=sub(c,b),v=(d4-d3)/((d4-d3)+(d5-d6));
  return dist2(p,add(b,scale(bc,v)));
 }
 const denominator=va+vb+vc;
 if(Math.abs(denominator)<=1e-12)return Math.min(
  dist2(p,a),dist2(p,b),dist2(p,c));
 const v=vb/denominator,w=vc/denominator;
 return dist2(p,add(add(a,scale(ab,v)),scale(ac,w)));
}
function segmentSegmentDist2(p:P,q:P,r:P,s:P):number{
 const u=sub(q,p),v=sub(s,r),w=sub(p,r);
 const a=dot(u,u),b=dot(u,v),c=dot(v,v),d=dot(u,w),e=dot(v,w);
 if(a<1e-14&&c<1e-14)return dist2(p,r);
 if(a<1e-14){
  const t=clamp(e/c);return dist2(p,add(r,scale(v,t)));
 }
 if(c<1e-14){
  const t=clamp(-d/a);return dist2(add(p,scale(u,t)),r);
 }
 const denominator=a*c-b*b;
 let t=denominator>1e-14?clamp((b*e-c*d)/denominator):0;
 let vpar=(b*t+e)/c;
 if(vpar<0){vpar=0;t=clamp(-d/a);}
 else if(vpar>1){vpar=1;t=clamp((b-d)/a);}
 return dist2(add(p,scale(u,t)),add(r,scale(v,vpar)));
}
function segmentCutsTriangle(p:P,q:P,a:P,b:P,c:P):boolean{
 const dir=sub(q,p),e1=sub(b,a),e2=sub(c,a);
 const h=cross(dir,e2),det=dot(e1,h);
 if(Math.abs(det)<1e-10)return false;
 const f=1/det,from=sub(p,a),u=f*dot(from,h);
 if(u<0||u>1)return false;
 const v=f*dot(dir,cross(from,e1));
 if(v<0||u+v>1)return false;
 const t=f*dot(e2,cross(from,e1));
 return t>=0&&t<=1;
}
function triangleGap2(a:readonly [P,P,P],b:readonly [P,P,P]):number{
 let best=Number.POSITIVE_INFINITY;
 for(let i=0;i<3;i++){
  const j=(i+1)%3;
  best=Math.min(best,pointTriDist2(a[i]!,b[0],b[1],b[2]),
   pointTriDist2(b[i]!,a[0],a[1],a[2]));
  if(segmentCutsTriangle(a[i]!,a[j]!,...b)||
     segmentCutsTriangle(b[i]!,b[j]!,...a))return 0;
  for(let k=0;k<3;k++)best=Math.min(best,
   segmentSegmentDist2(a[i]!,a[j]!,b[k]!,b[(k+1)%3]!));
 }
 return Math.max(0,best);
}
function meshGap(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry):number{
 let best=Number.POSITIVE_INFINITY;
 for(let i=0;i<a.indices.length;i+=3)
  for(let j=0;j<b.indices.length;j+=3)
   best=Math.min(best,triangleGap2(tri(a,i),tri(b,j)));
 return Math.sqrt(best);
}

type Side='POSITIVE_Z'|'NEGATIVE_Z';
export interface W10B8PairDistance{
 readonly side:Side;
 readonly upstreamId:string;
 readonly downstreamId:string;
 readonly exactSourceFaceGapMeters:number;
 readonly withinNominalRecastErosionRadius:boolean;
 readonly actorTraversalProven:false;
}
export interface W10B8SlopePhysicalWitness{
 readonly side:Side;
 readonly candidateSolidId:string;
 readonly interiorSamples:number;
 readonly baselineSupportedSamples:number;
 readonly isolatedCandidateSupportedSamples:number;
 readonly isolatedCandidateHitSamples:number;
 readonly candidateOnlyPhysicsWorld:true;
 readonly kccStepsAttempted:number;
 readonly kccBlockedSteps:number;
 readonly fullRouteReplayed:false;
 readonly originalCollisionAuthorityAuthorized:false;
 readonly productionAuthorized:false;
}
export interface W10B8Result{
 readonly sourcePairs:readonly W10B8PairDistance[];
 readonly slopeWitnesses:readonly W10B8SlopePhysicalWitness[];
 readonly unchangedFrozenSolids:25;
 readonly unchangedFrozenPaintSurfaces:17;
 readonly unchangedFrozenNavLinks:26;
 readonly sourceRawObjRequired:false;
 readonly addedProductionSolids:0;
 readonly addedProductionNavLinks:0;
 readonly approvedNewRouteCount:0;
 readonly productionAuthorized:false;
}
function faceSupport(physics:RapierStagePhysics,p:P){
 const hit=physics.castStageSegment(new Vec3(p[0],p[1]+.65,p[2]),
  new Vec3(p[0],p[1]-.65,p[2]),'ink-projectile');
 return hit&&Math.abs(hit.point.y-p[1])<=.15?hit.solidId:null;
}
/** Test-only collider world. The candidate is never assigned to a runtime Stage. */
function slopeWitness(original:StageDefinition,baseline:RapierStagePhysics,
 side:Side,mesh:StageTriangleMeshGeometry,
 solid:ReturnType<typeof undertowUnderpassRouteStageSolids>[number]
):W10B8SlopePhysicalWitness{
 const stage:StageDefinition={
  ...original,metadata:{...original.metadata,id:'w10b8-throwaway-collision'},
  solids:[...original.solids,{...solid,render:false,
   navigationEnabled:false,collisionEnabled:true,
   projectileBlocker:true,cameraBlocker:false}]
 };
 if(stage.solids.length!==original.solids.length+1||
    stage.solids.slice(0,25).some((s,i)=>s!==original.solids[i])||
    stage.paintSurfaces!==original.paintSurfaces||
    stage.navigationLinks!==original.navigationLinks)
  throw Error('W10B8_ISOLATION_ESCAPED_FROZEN_STAGE');
 const physics=new RapierStagePhysics(1/60,stage);physics.step();
 // Source exact quad has lower pair [0,1] and upper pair [2,4].
 const v=mesh.vertices;
 const low=scale(add(v[0]!,v[1]!),.5);
 const high=scale(add(v[2]!,v[4]!),.5);
 let baselineSupportedSamples=0,isolatedCandidateSupportedSamples=0;
 let isolatedCandidateHitSamples=0,kccStepsAttempted=0,kccBlockedSteps=0;
 // Every isolated KCC move must obey the SAME real 60Hz CPU limit.
 // The first attempt used fixed 16 steps and correctly failed overspeed.
 const sampledMeters=Math.hypot(...sub(high,low))*.40;
 const stepCapMeters=GAME_CONFIG.cpu.maxSpeedMetersPerSecond/60*.60;
 const n=Math.max(1,Math.ceil(sampledMeters/stepCapMeters));
 const interp=(t:number):P=>add(low,scale(sub(high,low),t));
 let previous=interp(.30);
 for(let i=0;i<=n;i++){
  const p=interp(.30+.40*i/n);
  if(faceSupport(baseline,p))baselineSupportedSamples++;
  const support=faceSupport(physics,p);
  if(support)isolatedCandidateSupportedSamples++;
  if(support===solid.id)isolatedCandidateHitSamples++;
  if(i>0){
   const step=auditPhase14JRapierRejoinStep(physics,
    {x:previous[0],y:previous[1],z:previous[2]},
    {x:p[0],y:p[1],z:p[2]},1/60);
   kccStepsAttempted++;
   if(!step.approved)kccBlockedSteps++;
  }
  previous=p;
 }
 return {side,candidateSolidId:solid.id,interiorSamples:n+1,
  baselineSupportedSamples,isolatedCandidateSupportedSamples,
  isolatedCandidateHitSamples,candidateOnlyPhysicsWorld:true,
  kccStepsAttempted,kccBlockedSteps,fullRouteReplayed:false,
  originalCollisionAuthorityAuthorized:false,productionAuthorized:false};
}
export function auditW10SourceSeamContact():W10B8Result{
 const original=undertowT21dConnectivityQaStage();
 const originals=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS;
 const solidBatch=undertowUnderpassRouteStageSolids();
 if(original.solids.length!==25||original.paintSurfaces.length!==17||
   original.navigationLinks?.length!==26||originals.length!==10||
   solidBatch.length!==10)
  throw Error('W10B8_SOURCE_FROZEN_COUNT_DRIFT');
 const baseline=new RapierStagePhysics(1/60,original);baseline.step();
 const sourcePairs:W10B8PairDistance[]=[];
 const slopeWitnesses:W10B8SlopePhysicalWitness[]=[];
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const chain=originals.filter(x=>x.side===side);
  const ramp=UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.find(x=>x.side===side);
  if(!ramp||chain.length!==5)throw Error('W10B8_EXACT_SOURCE_CHAIN_MISSING');
  const sorted=[{id:ramp.id,mesh:ramp.mesh},
   ...chain.map(x=>({id:x.id,mesh:x.mesh}))];
  for(let i=0;i+1<sorted.length;i++){
   const a=sorted[i]!,b=sorted[i+1]!;
   const gap=meshGap(a.mesh,b.mesh);
   if(!Number.isFinite(gap))throw Error('W10B8_SOURCE_DISTANCE_INVALID');
   sourcePairs.push({side,upstreamId:a.id,downstreamId:b.id,
    exactSourceFaceGapMeters:gap,
    withinNominalRecastErosionRadius:gap<=.36,
    actorTraversalProven:false});
  }
  const slope=chain[0]!;
  const solid=solidBatch.find(x=>x.id==='UndertowT21D:'+slope.id);
  if(!solid)throw Error('W10B8_ENTRANCE_SLOPE_MISSING');
  slopeWitnesses.push(slopeWitness(original,baseline,side,slope.mesh,solid));
 }
 return {sourcePairs,slopeWitnesses,unchangedFrozenSolids:25,
  unchangedFrozenPaintSurfaces:17,unchangedFrozenNavLinks:26,
  sourceRawObjRequired:false,addedProductionSolids:0,
  addedProductionNavLinks:0,approvedNewRouteCount:0,
  productionAuthorized:false};
}
