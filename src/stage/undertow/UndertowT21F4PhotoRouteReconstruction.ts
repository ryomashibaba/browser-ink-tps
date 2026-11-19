/** Photo/video-guided F4 reconstruction EXPERIMENT. The user permits a
 * few centimeters of alignment error, NOT unverified original 7.2 Turf
 * provenance. Keep this stage separate from the live 25-solid SOURCE world.
 * The original Temple01 faces remain exact and unmodified.
 */
import type {StageDefinition,StageSolidDefinition,StageVector3}
 from '../StageDefinition';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS,
 undertowUnderpassRouteStageSolids}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_RIGHT_LOW_ROUTE_RAMPS}
 from './UndertowSpillwayRouteRampGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from './UndertowSpillwayModelXZGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';

type P=readonly [number,number,number];
type Side='POSITIVE_Z'|'NEGATIVE_Z';
type RepairKind='NARROW_SOURCE_SLOPE_WALKWAY'|'SOURCE_EDGE_ALIGNMENT'|
 'SOURCE_MISSING_FLAT_BAND'|'SOURCE_SLOPE_TO_FLAT_LIP'|
 'SOURCE_INNER_UNDERPASS_LIP'|'REGISTERED_RAMP_ENTRANCE'|
 'CENTRAL_STEP_APPROACH';

export type PhotoRouteRepair=Readonly<{
 id:string;side:Side;kind:RepairKind;
 sourceOriginalFaceIds:readonly string[];
 geometryApproximate:true;notOriginalCollision:true;
 solid:StageSolidDefinition;
}>;

const BASE='T21V28:F4-photo-reconstruction:';
const sides=['POSITIVE_Z','NEGATIVE_Z'] as const;
const asModel=(x:number,y:number,z:number):P=>[x,y,z];
function project(p:P,side:Side):StageVector3{
 const q=side==='POSITIVE_Z'?p:([-p[0],p[1],-p[2]] as const);
 const [x,z]=undertowTemple01ModelXZToProjectXZ([q[0],q[2]]);
 return [x,q[1]-3,z];
}
function modelQuad(x0:number,x1:number,z0:number,z1:number,
 y0:number,y1:number):readonly P[]{
 if(!(x1>x0&&z1>z0))throw Error('F4_PHOTO_BAD_SOURCE_RECTANGLE');
 // Source coordinates: y0/y1 are the two measured model-Z height slices.
 return [
  asModel(x0,y0,z0),asModel(x0,y1,z1),
  asModel(x1,y0,z0),asModel(x1,y1,z1)
 ];
}
/** Arbitrary hand-authored trapezoid for the transition from the genuine
 * ramp's lower x=-19.5,z=41.4 edge onto the original narrow source slope.
 * The four points encode the visibly continuous walkable direction; their
 * source collision flags are unknown and must never be claimed exact.
 */
const ENTRANCE:readonly P[]=[
 // 1.8m-wide ruled strip. The low end follows the measured 0.40m/m
 // original slope; the high end intersects the real registered ramp.
 [-20.39,6.146,40.74],[-19.29,6.070,42.34],
 [-19.11,5.634,39.46],[-18.01,6.497,41.06]
];
function normalY(a:StageVector3,b:StageVector3,c:StageVector3){
 const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2];
 return uz*vx-ux*vz;
}
function solidFromQuad(id:string,quad:readonly P[],side:Side):StageSolidDefinition{
 if(quad.length!==4)throw Error('F4_PHOTO_BAD_QUAD');
 const vertices=quad.map(p=>project(p,side));
 if(vertices.some(v=>v.some(k=>!Number.isFinite(k))))
  throw Error('F4_PHOTO_NONFINITE_GEOMETRY');
 const up=normalY(vertices[0]!,vertices[1]!,vertices[2]!);
 if(Math.abs(up)<.005)throw Error('F4_PHOTO_DEGENERATE_FOOT_FACE_'+id);
 const indices=up>0?[0,1,2,1,3,2]:[0,2,1,1,2,3];
 return {
  id:BASE+id,center:[0,0,0],
  size:[
   Math.max(...vertices.map(v=>v[0]))-Math.min(...vertices.map(v=>v[0])),
   Math.max(...vertices.map(v=>v[1]))-Math.min(...vertices.map(v=>v[1])),
   Math.max(...vertices.map(v=>v[2]))-Math.min(...vertices.map(v=>v[2]))
  ],
  material:'medium',render:true,projectileBlocker:true,cameraBlocker:true,
  collisionEnabled:true,navigationEnabled:true,
  triangleMesh:{vertices,indices}
 };
}
const patches:readonly Readonly<{
 name:string;kind:RepairKind;model:readonly P[];
 references:readonly string[];
}>[]=[
 {name:'ramp-to-slope01',kind:'REGISTERED_RAMP_ENTRANCE',
  model:ENTRANCE,references:['right-low-route-ramp','underpass-route-slope01']},
 {name:'slope01-walkway-width',kind:'NARROW_SOURCE_SLOPE_WALKWAY',
  model:modelQuad(-20.60,-18.90,33.0,40.45,3.05,6.03),
  references:['underpass-route-slope01']},
 {name:'slope01-to-concrete01',kind:'SOURCE_EDGE_ALIGNMENT',
  model:modelQuad(-20.55,-18.90,32.2,33.6,3,3.29),
  references:['underpass-route-slope01','underpass-route-floor-concrete01']},
 {name:'concrete01-to-slope00',kind:'SOURCE_MISSING_FLAT_BAND',
  model:modelQuad(-8.75,-4.13,19.16,21.83,3,3),
  references:['underpass-route-floor-concrete01','underpass-route-slope00-outer']},
 {name:'slope00-to-concrete02',kind:'SOURCE_SLOPE_TO_FLAT_LIP',
  model:modelQuad(-8.75,-4.13,14.22,15.33,4.5,4.5),
  references:['underpass-route-slope00-outer','underpass-route-floor-concrete02']},
 {name:'concrete02-to-inner-slope00',kind:'SOURCE_SLOPE_TO_FLAT_LIP',
  model:modelQuad(-13.24,-10.95,10.22,11.30,4.5,4.5),
  references:['underpass-route-floor-concrete02','underpass-route-slope00-inner']},
 {name:'inner-slope00-to-underpass',kind:'SOURCE_INNER_UNDERPASS_LIP',
  model:modelQuad(-13.24,-10.95,5.88,6.35,3,3),
  references:['underpass-route-slope00-inner','glass-underpass']},
 // The source center-low pieces end near model X=+-2.938 (Y=3.0),
 // whereas the PDF-registered central step-top begins near X=+-2.29
 // at model Y=4.5. A flat bridge would contradict that 1.5m rise.
 // Isolated photo-guided ramp candidate joins each genuine center-low
 // footprint (at X=+-8.15) to the genuine step top (X=+-1.9),
 // using 1.9m width at model Z around 0. No novel offmesh link.
 // This is approximate visual reconstruction, NOT exact original collision.
 {name:'center-low-to-step-top',kind:'CENTRAL_STEP_APPROACH',
  model:[[-8.15,3,-.95],[-8.15,3,.95],
         [-1.90,4.5,-.95],[-1.90,4.5,.95]],
  references:['center-low-floor','center-origin-step-top-face']}
];

export function buildT21F4PhotoRouteExperiment(){
 const frozen=undertowT21dConnectivityQaStage();
 if(frozen.solids.length!==25||frozen.paintSurfaces.length!==17||
    frozen.navigationLinks?.length!==26||
    UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.length!==10||
    UNDERTOW_RIGHT_LOW_ROUTE_RAMPS.length!==2)
  throw Error('F4_PHOTO_RECONSTRUCTION_REQUIRES_FROZEN_BASE');
 const repairs:PhotoRouteRepair[]=sides.flatMap(side=>patches.map(p=>{
  const id=p.name+'-'+side.toLowerCase();
  return {id,side,kind:p.kind,sourceOriginalFaceIds:p.references,
   geometryApproximate:true as const,notOriginalCollision:true as const,
   solid:solidFromQuad(id,p.model,side)};
 }));
 // Every original visible / collision / paint / source face stays intact.
 // Only this isolated experiment sees these extra inferred triangles.
 const stage:StageDefinition={
  metadata:{...frozen.metadata,id:'t21-v28-f4-photo-connectivity-isolated'},
  solids:[...frozen.solids,...undertowUnderpassRouteStageSolids(),
   ...repairs.map(r=>r.solid)],
  paintSurfaces:frozen.paintSurfaces,
  navigationLinks:frozen.navigationLinks
 };
 return {stage,repairs,
  frozenSource:'25/17/26/0' as const,
  originalStageUnmodified:stage.solids.length===51&&
   stage.paintSurfaces===frozen.paintSurfaces&&
   stage.navigationLinks===frozen.navigationLinks,
  sceneIsolated:true as const,actualOriginalCollisionProven:false as const};
}

/**
 * F4 experimental physical corridor steering points.
 * Every point is interpolated on the two ALREADY PRESENT approximate
 * center ramps or on the existing center step-top line between them.
 * Steering only: never creates a collider, off-mesh connection, floor or
 * height correction. Geometry is photo-estimated, NOT certified original.
 */
export function t21F4CentralCrossingGuide(
 repairs:readonly PhotoRouteRepair[],originSide:'POSITIVE_Z'|'NEGATIVE_Z'
):readonly StageVector3[]{
 const destSide=originSide==='POSITIVE_Z'?'NEGATIVE_Z':'POSITIVE_Z';
 const edge=(side:Side)=>{
  const repair=repairs.find(r=>r.kind==='CENTRAL_STEP_APPROACH'&&r.side===side);
  const v=repair?.solid.triangleMesh?.vertices;
  if(!v||v.length!==4||!repair?.geometryApproximate||
     !repair.notOriginalCollision)
   throw Error('F4_CENTRAL_GUIDE_REQUIRES_ISOLATED_UNCERTIFIED_RAMP');
  const mid=(a:StageVector3,b:StageVector3):StageVector3=>[
   (a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  return {low:mid(v[0]!,v[1]!),high:mid(v[2]!,v[3]!)};
 };
 const start=edge(originSide),end=edge(destSide);
 const line=(a:StageVector3,b:StageVector3):StageVector3[]=> 
  Array.from({length:9},(_,j)=>{
   const t=j/8;
   return [a[0]+(b[0]-a[0])*t,
    a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  });
 return [
  ...line(start.low,start.high),
  ...line(start.high,end.high).slice(1),
  ...line(end.high,end.low).slice(1)
 ];
}

/** Uncertified, explicitly opted-in F4 physical research world. */
export const T21_F4_RESEARCH_STAGE_LABEL='T21 V28 F4 CENTRAL ROUTE RESEARCH ONLY';

export function buildT21F4ResearchStage(base:StageDefinition):StageDefinition{
 const frozen=undertowT21dConnectivityQaStage();
 if(base.metadata.id!==frozen.metadata.id||
    base.solids!==frozen.solids||
    base.paintSurfaces!==frozen.paintSurfaces||
    base.navigationLinks!==frozen.navigationLinks)
  throw Error('F4_RESEARCH_MUST_START_FROM_IMMUTABLE_SOURCE');
 const candidate=buildT21F4PhotoRouteExperiment();
 return {...base,
  metadata:{...base.metadata,displayName:T21_F4_RESEARCH_STAGE_LABEL},
  solids:candidate.stage.solids};
}

/** Allow the 51-solid opt-in only if the exact 25 original solids plus
 * 26 known original/approximate additions are byte-for-byte unchanged.
 */
export function isT21F4ResearchStage(stage:StageDefinition):boolean{
 const base=undertowT21dConnectivityQaStage();
 if(stage.metadata.id!==base.metadata.id||
    stage.metadata.displayName!==T21_F4_RESEARCH_STAGE_LABEL||
    stage.solids.length!==51||
    stage.paintSurfaces!==base.paintSurfaces||
    stage.navigationLinks!==base.navigationLinks||
    !base.solids.every((s,i)=>stage.solids[i]===s))return false;
 const expected=buildT21F4PhotoRouteExperiment().stage.solids;
 return stage.solids.every((s,i)=>i<25||
  JSON.stringify(s)===JSON.stringify(expected[i]));
}
