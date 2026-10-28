/** B263: sample ACTUAL already-owned native PaintSurface cells in the
 * current genuine camera. This is NOT a screen-space paint renderer, ray
 * visibility test or guarantee that a pixel is colored/legible.
 * Original CPU ownership, atlas, geometry, and camera remain untouched. */
import {Team} from '../ink/types';
import {b262QaFocusEligible} from './B262SourceQaFocusStudy';
type VecLike={x:number;y:number;z:number};
export type B263PaintGrid={
 id:string;widthCells:number;heightCells:number;cellSize:number;
 widthMeters:number;heightMeters:number;
 ownerGrid:Int8Array;isCellActive(x:number,y:number):boolean;
 localToWorld(u:number,v:number):VecLike;
};
export function b263ScreenWitnessGate(p:URLSearchParams,
 c:Parameters<typeof b262QaFocusEligible>[1],
 raster:string,hidden:string|null,qaFocus:boolean){
 return p.get('t21B263')==='paintProjection'&&
  b262QaFocusEligible(p,c,raster,hidden)&&!qaFocus;
}
export function b263ReadNativeInkProjection(
 surfaces:readonly B263PaintGrid[],
 project:(world:VecLike)=>VecLike,
 width:number,height:number,maxPerSurface=96){
 if(surfaces.length!==17||!Number.isSafeInteger(width)||
   !Number.isSafeInteger(height)||width<200||height<200||
   !Number.isSafeInteger(maxPerSurface)||maxPerSurface<1||
   maxPerSurface>128||new Set(surfaces.map(s=>s.id)).size!==17)
  throw Error('B263_UNVERIFIED_REAL_PAINT_SURFACE_VIEWPORT');
 let owned=0,ownedA=0,ownedB=0,projected=0,inCanvas=0;
 const observations: {
  surfaceId:string;team:'A'|'B';grid:[number,number];
  world:[number,number,number];screenPx:[number,number,number];
  inFront:boolean;insideViewport:boolean
 }[]=[];
 const surfaceSummaries: {
  surfaceId:string;owned:number;ownedA:number;ownedB:number;
  sampled:number;inCanvas:number
 }[]=[];
 for(const s of surfaces){
  if(!s.id||!Number.isSafeInteger(s.widthCells)||s.widthCells<=0||
    !Number.isSafeInteger(s.heightCells)||s.heightCells<=0||
    !Number.isFinite(s.cellSize)||s.cellSize<=0||
    !Number.isFinite(s.widthMeters)||s.widthMeters<=0||
    !Number.isFinite(s.heightMeters)||s.heightMeters<=0||
    s.ownerGrid.length!==s.widthCells*s.heightCells)
   throw Error('B263_INVALID_ORIGINAL_PAINT_GRID');
  let count=0,countA=0,countB=0;
  for(let i=0;i<s.ownerGrid.length;i++){
   const owner=s.ownerGrid[i];
   if(owner!==Team.A&&owner!==Team.B&&owner!==Team.Neutral)
    throw Error('B263_UNTRUSTED_NATIVE_INK_OWNER');
   if(owner!==Team.Neutral){
    const x=i%s.widthCells,y=Math.floor(i/s.widthCells);
    if(!s.isCellActive(x,y))throw Error('B263_PAINTED_OUTSIDE_SOURCE_FOOTPRINT');
    count++;if(owner===Team.A)countA++;else countB++;
   }
  }
  const stride=Math.max(1,Math.ceil(count/maxPerSurface));
  let rank=0,sampled=0,onscreen=0;
  for(let i=0;i<s.ownerGrid.length;i++){
   const owner=s.ownerGrid[i];
   if(owner===Team.Neutral)continue;
   const cur=rank++;
   if(cur%stride!==0||sampled>=maxPerSurface)continue;
   const x=i%s.widthCells,y=Math.floor(i/s.widthCells);
   const u=Math.min((x+.5)*s.cellSize,s.widthMeters);
   const v=Math.min((y+.5)*s.cellSize,s.heightMeters);
   const world=s.localToWorld(u,v);
   const px=project(world);
   if(![world.x,world.y,world.z,px.x,px.y,px.z]
       .every(Number.isFinite))throw Error('B263_NONFINITE_CAMERA_PROJECTION');
   const inFront=px.z>0;
   const inside=inFront&&px.x>=0&&px.y>=0&&px.x<width&&px.y<height;
   if(inside){inCanvas++;onscreen++;}
   projected++;sampled++;
   observations.push({surfaceId:s.id,team:owner===Team.A?'A':'B',
    grid:[x,y],world:[world.x,world.y,world.z],
    screenPx:[px.x,px.y,px.z],inFront,insideViewport:inside});
  }
  owned+=count;ownedA+=countA;ownedB+=countB;
  surfaceSummaries.push({surfaceId:s.id,owned:count,ownedA:countA,
   ownedB:countB,sampled,inCanvas:onscreen});
 }
 if(owned!==ownedA+ownedB||projected>17*maxPerSurface)
  throw Error('B263_NATIVE_PAINT_SAMPLE_INCONSISTENT');
 return {schema:'B263_ACTUAL_NATIVE_PAINT_CELL_CAMERA_PROJECTION' as const,
  source:'25/17/26/0' as const,sourcePaintSurfaces:17 as const,
  sourceUvTriangles:57578 as const,viewport:[width,height] as const,
  ownedCells:owned,ownedA,ownedB,sampledCells:projected,
  samplesInsideViewport:inCanvas,
  // Projected cell centers are not optical-raster visibility or colored pixels.
  projectionOnly:true as const,occlusionTested:false as const,
  renderedInkPixelsCertified:false as const,
  humanProvenanceFromOwnershipAlone:false as const,
  perSurface:surfaceSummaries,samples:observations,
  originalGeometryModified:0 as const,paintOwnershipModified:0 as const,
  originalPaintAtlasModified:0 as const,physicsSolidsModified:0 as const,
  navLinksModified:0 as const,scoreableSurfacesAdded:0 as const,
  artAccepted:false as const,productionAuthorized:false as const};
}
