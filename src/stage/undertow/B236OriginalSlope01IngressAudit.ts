/**
 * B236 source-derived right-low -> FloorSlope01 top -> FloorConcrete01
 * candidate. This only INSPECTS exact source triangles and original
 * registered surfaces, NEVER fabricates a bridge or route link.
 */
import {Vec3} from 'playcanvas';
import {UNDERTOW_MODEL_XZ_GEOMETRY}
 from './UndertowSpillwayModelXZGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS}
 from './UndertowSpillwayUnderpassRouteGeometry';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from './UndertowSpillwayBlockoutGeometry';
import type {B235Side} from './B235ExactOriginalSourceEntryQa';
type P=readonly[number,number];
const dist=(a:P,b:P)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function linePointDistance(p:P,a:P,b:P){
 const ux=b[0]-a[0],uz=b[1]-a[1];
 const d=ux*ux+uz*uz;
 const t=d===0?0:Math.max(0,Math.min(1,
  ((p[0]-a[0])*ux+(p[1]-a[1])*uz)/d));
 return {distance:dist(p,[a[0]+t*ux,a[1]+t*uz] as P),t,
  closest:[a[0]+t*ux,a[1]+t*uz] as P};
}
function signedCross(a:P,b:P,c:P){
 return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
}
function intersect2d(a:P,b:P,c:P,d:P){
 const k1=signedCross(a,b,c),k2=signedCross(a,b,d);
 const k3=signedCross(c,d,a),k4=signedCross(c,d,b);
 return k1*k2<=0&&k3*k4<=0;
}
function boundaryToLine(poly:readonly P[],a:P,b:P){
 let best={distanceMeters:Infinity,polygonEdge:-1,
  polygonClosest:[0,0] as P,slopeClosest:[0,0] as P};
 for(let i=0;i<poly.length;i++){
  const u=poly[i]!,v=poly[(i+1)%poly.length]!;
  const candidates=[
   {p:u,q:linePointDistance(u,a,b).closest,
    d:linePointDistance(u,a,b).distance},
   {p:v,q:linePointDistance(v,a,b).closest,
    d:linePointDistance(v,a,b).distance},
   {p:linePointDistance(a,u,v).closest,q:a,
    d:linePointDistance(a,u,v).distance},
   {p:linePointDistance(b,u,v).closest,q:b,
    d:linePointDistance(b,u,v).distance}
  ];
  if(intersect2d(a,b,u,v))candidates.push({
   p:u,q:u,d:0
  });
  for(const x of candidates)if(x.d<best.distanceMeters)
   best={distanceMeters:x.d,polygonEdge:i,
    polygonClosest:x.p,slopeClosest:x.q};
 }
 return best;
}
/** Exact original source, not a route proposal accepted in production. */
export function b236InspectOriginalSlopeEntrance(side:B235Side){
 if(FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||FROZEN.activationReady!==false)
  throw Error('B236_ORIGINAL25_STAGE_CHANGED');
 const suffix=side==='POSITIVE_Z'?'positive-z':'negative-z';
 const slope=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(f=>
  f.id==='underpass-route-slope01-'+suffix&&f.side===side);
 const floor=UNDERTOW_UNDERPASS_ROUTE_COMPONENTS.find(f=>
  f.id==='underpass-route-floor-concrete01-'+suffix&&f.side===side);
 const contour=UNDERTOW_MODEL_XZ_GEOMETRY.find(c=>
  c.id===('right-low-team-'+(side==='POSITIVE_Z'?'a':'b')));
 if(!slope||!floor||!contour)throw Error('B236_SOURCE_PROVENANCE_MISSING');
 if(slope.sourceObject!=='FldObj_Temple01_PntSet_mesh01_low139_1__FloorSlope01'||
  floor.sourceObject!=='Fld_Temple01_pCube21595_1__FloorConcrete01'||
  contour.sourceYModelMeters!==7.5||contour.sourceYProjectMeters!==4.5)
  throw Error('B236_SOURCE_HEIGHT_OR_MATERIAL_CHANGED');
 // CI688 source triangles are intentionally nonindexed: six actual
 // original triangle corners including duplicate shared corner positions.
 // Deduplicate *only for the geometry audit*, never change the source mesh.
 const corners=slope.mesh.vertices;
 const mesh=[...new Map(corners.map(v=>[
  v.map(n=>n.toFixed(10)).join(','),v] as const)).values()];
 const hi=Math.max(...mesh.map(x=>x[1]));
 const low=Math.min(...mesh.map(x=>x[1]));
 const top=mesh.filter(v=>Math.abs(v[1]-hi)<1e-5);
 const bottom=mesh.filter(v=>Math.abs(v[1]-low)<1e-5);
 if(top.length!==2||bottom.length!==2||
   mesh.length!==4||slope.mesh.indices.length!==6)
  throw Error('B236_UNEXPECTED_ORIGINAL_SLOPE01_TRIANGLE_FORM');
 const mean=(pts:readonly (readonly number[])[])=>[
  pts.reduce((v,p)=>v+p[0]!,0)/pts.length,
  pts.reduce((v,p)=>v+p[1]!,0)/pts.length,
  pts.reduce((v,p)=>v+p[2]!,0)/pts.length
 ] as [number,number,number];
 const t=mean(top),bt=mean(bottom);
 const pointOnRamp=(v:number)=>new Vec3(
  t[0]+(bt[0]-t[0])*v,
  t[1]+(bt[1]-t[1])*v,
  t[2]+(bt[2]-t[2])*v
 );
 const upper: P=[top[0]![0],top[0]![2]],upper2:P=[top[1]![0],top[1]![2]];
 const separation=boundaryToLine(contour.projectOuter,upper,upper2);
 const floorY=3-3;
 const sample=pointOnRamp(.10),lower=pointOnRamp(.90);
 return {side,
  slopeOriginalSourceObject:slope.sourceObject,
  registeredRightLowSourceY:contour.sourceYProjectMeters,
  originalSlopeTopY:hi,originalSlopeBottomY:low,
  topFoot:[sample.x,sample.y,sample.z] as const,
  lowFoot:[lower.x,lower.y,lower.z] as const,
  topOriginalEdgeA:top[0],topOriginalEdgeB:top[1],
  bottomOriginalEdgeA:bottom[0],bottomOriginalEdgeB:bottom[1],
  closestRightLowPolygonToSlopeTopEdge:separation,
  dropFromRightLowToSlopeTopMeters:contour.sourceYProjectMeters-hi,
  dropFromRightLowToSlopeAt90pctMeters:
   contour.sourceYProjectMeters-lower.y,
  horizontalSlopeMidlineMeters:Math.hypot(t[0]-bt[0],t[2]-bt[2]),
  sourceFloorY:floorY,sourceFloorOriginalObject:floor.sourceObject,
  originalRightLowContourPointCount:contour.projectOuter.length,
  triangleCount:slope.mesh.indices.length/3,
  candidateNotCertified:true,
  frozenStage:'25/17/26/0' as const,
  originalTeamRoutes:'0/12' as const,productionAuthorized:false as const};
}
