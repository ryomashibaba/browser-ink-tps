/**
 * B283: Read-only geometrical screen against the already registered 25-solid
 * right-low footprint. A sampled hypothetical pose is NEVER a Rapier sample.
 * No actor, camera, navigation or collision state is touched by this module.
 */
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as source}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {pointInStageFootprint} from '../stage/StageFootprint';

type XZ=readonly [number,number];
const ORIGINAL_RIGHT_LOW='UndertowT21D:right-low-team-a';
const MAX_GEOMETRY_SAMPLE_SPACING=.025;
const GEOMETRY_MARGIN_GATE=.65; // conservative endpoint fence for every sample
/** From genuine B127 trial #39958818393, tick 468, original right-low KCC. */
export const B283_HISTORIC_SAFE_B126_POSE=
 [6.2972002,5.3949986,38.6824722] as const;
/** The genuine B127 rejected endpoint. This is a regression, not a route. */
export const B283_HISTORIC_UNSAFE_B127_POSE=
 [6.2972093,5.3950791,36.6032677] as const;

function edgeDistance(point:XZ,ring:readonly XZ[]):number {
 let min=Infinity;
 for(let i=0;i<ring.length;i++){
  const a=ring[i]!,b=ring[(i+1)%ring.length]!;
  const dx=b[0]-a[0],dz=b[1]-a[1],s=dx*dx+dz*dz;
  const t=s===0?0:Math.max(0,Math.min(1,
   ((point[0]-a[0])*dx+(point[1]-a[1])*dz)/s));
  min=Math.min(min,Math.hypot(point[0]-a[0]-dx*t,
   point[1]-a[1]-dz*t));
 }
 return min;
}
function originalPolygon(){
 if(source.activationReady!==false||source.solids.length!==25||
    source.paintSurfaces.length!==17||
    source.navigationLinks.length!==26)
  throw Error('B283_FROZEN_ORIGINAL_STAGE_CHANGED');
 const s=source.solids.find(x=>x.id===ORIGINAL_RIGHT_LOW);
 if(!s?.footprint||s.triangleMesh||s.rotationEulerDegrees||
    s.center[1]+s.size[1]/2!==4.5)
  throw Error('B283_ORIGINAL_REGISTERED_FOOTPRINT_MISSING');
 return s;
}
export function screenB283OriginalRegisteredFootprint(point:XZ){
 if(!point.every(Number.isFinite))
  throw Error('B283_NONFINITE_HYPOTHETICAL_COORDINATE');
 const s=originalPolygon(),f=s.footprint!;
 const p:[number,number]=[
  point[0]-(s.center[0]-s.size[0]/2),
  point[1]-(s.center[2]-s.size[2]/2)
 ];
 return {
  insideRegisteredFootprint:pointInStageFootprint(p[0],p[1],f),
  edgeClearanceMeters:Math.min(edgeDistance(p,f.outer),
   ...(f.holes??[]).map(h=>edgeDistance(p,h))),
  originalFootprintId:ORIGINAL_RIGHT_LOW,
  holeCount:f.holes?.length??0
 };
}
/** Candidate: move laterally at the last measured safe KCC pose, then forward.
 * This MUST NOT be fed to live input until real CDP+Rapier testing is designed.
 */
export function screenB283TwoLegHypothesis(lateralDX:number,forwardDZ:number){
 if(!Number.isFinite(lateralDX)||!Number.isFinite(forwardDZ)||
    Math.abs(lateralDX)>2||forwardDZ>0||forwardDZ< -3)
  throw Error('B283_HYPOTHESIS_OUTSIDE_BOUNDED_AUDIT');
 const anchor=B283_HISTORIC_SAFE_B126_POSE;
 const begin:[number,number]=[anchor[0],anchor[2]];
 const pivot:[number,number]=[anchor[0]+lateralDX,anchor[2]];
 const end:[number,number]=[pivot[0],pivot[1]+forwardDZ];
 const sample=(a:XZ,b:XZ)=>{
  const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/
   MAX_GEOMETRY_SAMPLE_SPACING));
  return Array.from({length:n+1},(_,i)=>{
   const t=i/n;
   return screenB283OriginalRegisteredFootprint([
    a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])
   ]);
  });
 };
 const samples=[...sample(begin,pivot),...sample(pivot,end).slice(1)];
 const minimum=Math.min(...samples.map(x=>x.edgeClearanceMeters));
 const allInside=samples.every(x=>x.insideRegisteredFootprint);
 return {
  schema:'B283_FROZEN_REGISTERED_SOURCE_GEOMETRY_SCREEN_V1' as const,
  anchorNativeProof:'B127 genuine native tick 468, NOT current test' as const,
  hypotheticalLateralDXMeters:lateralDX,
  hypotheticalForwardDZMeters:forwardDZ,
  hypotheticalPivotXZ:pivot,hypotheticalEndXZ:end,
  originalSourceFootprintId:ORIGINAL_RIGHT_LOW,
  originalHoleCount:samples[0]!.holeCount,
  geometrySampleSpacingAtMostMeters:MAX_GEOMETRY_SAMPLE_SPACING,
  sampleCount:samples.length,
  allSamplesInsideRegisteredFootprint:allInside,
  minimumOriginalPolygonEdgeMeters:minimum,
  geometricallyEligibleForRealInputStudy:allInside&&minimum>=GEOMETRY_MARGIN_GATE,
  // Never confuse an original 2D footprint with native KCC or original-game
  // collision intent. Third-party Temple01 stage identity is also unresolved.
  genuineRapierSupportMeasuredHere:false as const,
  genuineCdpKeyboardInputPerformedHere:false as const,
  nextDistinctOriginalFloorCertified:false as const,
  underpassRecastConnected:false as const,
  originalGameCollisionAuthorityAuthenticated:false as const,
  originalGameStageIdentityAuthenticated:false as const,
  originalAuthority:[25,17,26,0] as const,
  productionAuthorized:false as const,
  unrestricted4v4Certified:false as const
 };
}
