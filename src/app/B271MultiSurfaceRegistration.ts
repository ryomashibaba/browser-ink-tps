/** B271: explicit 17-surface native optical-versus-physical registration.
 * Never equate a UV triangle, footprint cell, or nearby NavLink endpoint to
 * visible ink pixels, traversability, a certified original 4v4 route or art.
 */
import {b263ScreenWitnessGate} from './B263RealInkScreenWitness';
type ScreenCtx=Parameters<typeof b263ScreenWitnessGate>[1];
export type B271Point={x:number;y:number;z:number};
export type B271NativeSurface={
 id:string;widthCells:number;heightCells:number;cellSize:number;
 widthMeters:number;heightMeters:number;
 ownerGrid:Int8Array;isCellActive:(x:number,y:number)=>boolean;
 localToWorld:(u:number,v:number)=>B271Point;
};
export const B271_ORIGINAL_SOURCE='25/17/26/0';
export const B271_MAX_SURFACE_RAYS=51;
export const B271_REGISTRATION_AUTHORITY=Object.freeze({
 source:B271_ORIGINAL_SOURCE,originalUvTriangles:57578,
 originalPaintSurfaces:17,originalRapierSolids:25,
 originalNavLinks:26,originalScoreables:0,readOnly:true,
 originalOpticalIsNotCollision:true,navEndpointNotPath:true,
 paintedPixelVisibilityNotCertified:true,
 gameplayRouteNotCertified:true,artAccepted:false,
 unrestricted4v4Certified:false,productionAuthorized:false
});
export function b271RegistrationGate(p:URLSearchParams,c:ScreenCtx,
 raster:string,hidden:string|null,qaFocus:boolean){
 return p.get('t21B271')==='multiSurfaceRegistration'&&
  b263ScreenWitnessGate(p,c,raster,hidden,qaFocus);
}
/** 1 to 3 ACTUAL active PaintSurface grid cells. No fake rectangles or
 * assumed static underlying stage footprint. Exhaustive for inactive masks. */
export function b271NativeFootprintProbes(s:B271NativeSurface){
 if(!s.id||s.widthCells<1||s.heightCells<1||
  !Number.isSafeInteger(s.widthCells)||!Number.isSafeInteger(s.heightCells)||
  !Number.isFinite(s.cellSize)||s.cellSize<=0||
  !Number.isFinite(s.widthMeters)||s.widthMeters<=0||
  !Number.isFinite(s.heightMeters)||s.heightMeters<=0||
  s.ownerGrid.length!==s.widthCells*s.heightCells)
  throw Error('B271_UNVERIFIED_ORIGINAL_PAINT_FOOTPRINT');
 let first=-1,last=-1,nearest=-1,near=Infinity,active=0,owned=0;
 for(let y=0;y<s.heightCells;y++)for(let x=0;x<s.widthCells;x++){
  const i=y*s.widthCells+x;
  const v=s.ownerGrid[i];
  if(v!==0&&v!==1&&v!==-1)throw Error('B271_UNKNOWN_NATIVE_PAINT_OWNER');
  const enabled=s.isCellActive(x,y);
  if(v!==0&&!enabled)throw Error('B271_REAL_INK_OUTSIDE_ORIGINAL_FOOTPRINT');
  if(v!==0)owned++;
  if(!enabled)continue;
  active++;if(first===-1)first=i;last=i;
  const d=(x+.5-s.widthCells*.5)**2+(y+.5-s.heightCells*.5)**2;
  if(d<near){near=d;nearest=i;}
 }
 if(!active)throw Error('B271_NO_REAL_ACTIVE_PAINT_FOOTPRINT');
 const ids=[nearest,first,last].filter((x,i,a)=>a.indexOf(x)===i);
 return {surfaceId:s.id,activeCells:active,ownedCells:owned,
  probes:ids.map(i=>{
   const x=i%s.widthCells,y=Math.floor(i/s.widthCells);
   const world=s.localToWorld(Math.min((x+.5)*s.cellSize,s.widthMeters),
    Math.min((y+.5)*s.cellSize,s.heightMeters));
   if(![world.x,world.y,world.z].every(Number.isFinite))
    throw Error('B271_NONFINITE_NATIVE_SOURCE_SURFACE');
   return {grid:[x,y] as [number,number],
    owner:s.ownerGrid[i]!,world:[world.x,world.y,world.z] as [number,number,number]};
  })};
}
export function b271ClassifyOpticalPhysicalRay(
 distance:number,
 optical:readonly {name:string;kind:string;distanceMeters:number}[],
 physical:{solidId:string;distanceMeters:number}|null,
 nearestNavEndpointMeters:number|null){
 if(!Number.isFinite(distance)||distance<=1e-7||
  optical.some(v=>!v.name||!v.kind||
   !Number.isFinite(v.distanceMeters)||v.distanceMeters<0||
   v.distanceMeters>distance+.001)||
  (physical&&(!physical.solidId||!Number.isFinite(physical.distanceMeters)||
   physical.distanceMeters<0||physical.distanceMeters>distance+.001))||
  (nearestNavEndpointMeters!==null&&(!Number.isFinite(nearestNavEndpointMeters)||
   nearestNavEndpointMeters<0)))
  throw Error('B271_INVALID_ORIGINAL_RAY_OR_NAV_ENDPOINT');
 const before=optical.filter(x=>x.distanceMeters<distance-.08);
 const clipped=physical!==null&&physical.distanceMeters<distance-.08;
 return {
  opticalHitsBeforeSourcePaint:before.length,
  nearestOpticalMaterial:before[0]?.name??null,
  nearestOpticalKind:before[0]?.kind??null,
  opticalMaterialsBeforePaint:before.map(x=>x.name),
  physicalBeforeSourcePaint:clipped,
  physicalBlockingId:clipped?physical!.solidId:null,
  nearestNavLinkEndpointDistanceMeters:nearestNavEndpointMeters,
  nativeRasterOcclusionCertified:false,
  navEndpointProvesReachability:false,
  realPaintedPixelVisibilityCertified:false,
  originalCollisionOrNavigationPromoted:false
 };
}
