/** B266: cross-run original optical ray / native owned-ink pixel registration.
 * Offline evidence ONLY. NO drawing, geometry, collision, camera or ink edits.
 * Inputs are genuine B264 ray JSON, B265 ABA JSON, and previously
 * SHA-checked B265 offline pixel report. Does not certify colored pixels.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const FROZEN='25/17/26/0';
const GLASS='Fld_Temple01_Glass01';
const METAL='Fld_Temple01_WallMetal00';
const DETAIL='Fld_Temple01_FloorLine02';
function check(ok,code){if(!ok)throw Error('B266_'+code);}
function med(nums){
 check(nums.length>0,'EMPTY_METRIC');
 const x=[...nums].sort((a,b)=>a-b),n=x.length,m=Math.floor(n/2);
 return n%2?x[m]:(x[m-1]+x[m])/2;
}
function sat(rgb){
 check(Array.isArray(rgb)&&rgb.length===3&&
  rgb.every(x=>Number.isFinite(x)&&x>=0&&x<=255),'INVALID_RGB');
 const hi=Math.max(...rgb);
 return hi===0?0:(hi-Math.min(...rgb))/hi;
}
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-5;
export function analyzeB266Crossrun(b264,b265,offline){
 const r=b264?.report,o=b265?.nativeOwnerGridProjection,p=offline?.REAL_INK;
 check(b264?.context==='REAL_INK'&&b265?.label==='REAL_INK'&&
  r?.schema==='B264_ACTUAL_NATIVE_INK_CELL_OPTICAL_AND_RAPIER_DEPTH'&&
  b265?.schema==='B265_GENUINE_PINNED_METAL_SOURCE_ABA','SOURCE_SCHEMA');
 check(b264?.source===FROZEN&&r?.source===FROZEN&&
  b265?.source===FROZEN&&o?.source===FROZEN&&
  p?.summary?.source===FROZEN,'SOURCE_AUTHORITY');
 check(r.originalSourceTriangles===57578&&
  b265.sourceUvTriangles===57578&&o.sourceUvTriangles===57578&&
  p.summary.sourceUvTriangles===57578&&
  r.realPaintSurfaces===17&&o.sourcePaintSurfaces===17,'SOURCE_IDENTITY');
 check(b265.metalMaterial?.hiddenMaterial===METAL&&
  b265.metalMaterial?.materialKind==='METAL'&&
  b265.metalMaterial?.exactSourceMaterialIdentityVerified===true&&
  b265.metalMaterial?.originalUvTriangles===57578,'EXACT_PINNED_METAL');
 check(b265.pixels?.appearanceRestored===true&&
  b265.pixels?.originalUvRestoration?.changedPixels===0&&
  p.summary.restoreDifferingPixels===0,'FRAMEBUFFER_RESTORATION');
 check(b265.artAccepted===false&&b265.productionAuthorized===false&&
  r.changedInkOwnership===0&&r.changedOriginalMeshes===0&&
  r.newCollisionSolids===0&&r.newNavigationLinks===0&&
  r.newScoreableSurfaces===0,'UNAUTHORIZED_CHANGE');
 check(r.ownerCells===o.ownedCells&&
  o.ownedCells===p.summary.ownedCells&&
  r.ownerCells===115&&o.ownedA===115&&o.ownedB===0&&
  r.sampledRays>0&&r.sampledRays<=24&&
  r.sampledRays===r.rays.length&&
  o.samplesInsideViewport===p.summary.onscreenSamples&&
  p.summary.onscreenSamples===p.samplePoints.length,
  'NATIVE_OWNER_PROVENANCE');
 // The real runs are repeatable but not the SAME clock tick: B264=346,
 // B265=345. Only exact projected positions justify cross-run matching.
 check(Math.abs(r.nativeTick-o.nativeTick)<=2,'NONCOMPARABLE_TICKS');
 const rows=[];
 const keys=new Set();
 for(const ray of r.rays){
  const key=ray.surfaceId+'|'+ray.ownerCellGrid.join(',');
  check(!keys.has(key),'DUPLICATE_RAY');keys.add(key);
  const orig=o.samples.filter(s=>s.surfaceId===ray.surfaceId&&
   s.grid[0]===ray.ownerCellGrid[0]&&s.grid[1]===ray.ownerCellGrid[1]);
  check(orig.length===1&&orig[0].insideViewport&&orig[0].inFront,
   'UNMATCHED_ORIGINAL_OWNER');
  check(ray.nativeScreenPx.every((v,i)=>close(v,orig[0].screenPx[i]))&&
   ray.trueOwnerCellWorld.every((v,i)=>close(v,orig[0].world[i])),
   'CROSSRUN_CAMERA_OR_WORLD_DRIFT');
  const pixel=p.samplePoints.filter(s=>s.surfaceId===ray.surfaceId&&
   s.screenPx.every((v,i)=>close(v,orig[0].screenPx[i])));
  check(pixel.length===1,'PIXEL_PROJECTION_MISMATCH');
  const mat=ray.originalOpticalFirstSix;
  const g=mat.find(m=>m.name===GLASS&&m.kind==='GLASS');
  const m=mat.find(m=>m.name===METAL&&m.kind==='METAL');
  const d=mat.find(m=>m.name===DETAIL&&m.kind==='DETAIL');
  check(g&&m&&d&&g.distanceMeters<m.distanceMeters&&
   m.distanceMeters<d.distanceMeters&&
   d.distanceMeters<ray.rayLengthMeters&&
   ray.opticalBeforePaint===true&&ray.physicalBeforePaint===false,
   'UNSUPPORTED_RAY_ORDER');
  const before=pixel[0].baselineRgb,after=pixel[0].metalHiddenRgb;
  const delta=Math.max(...before.map((v,i)=>Math.abs(v-after[i])));
  check(delta===pixel[0].maxChannelDelta,'ORIGINAL_PIXEL_DELTA');
  rows.push({
   ownerCellGrid:ray.ownerCellGrid,screenPx:ray.nativeScreenPx.slice(0,2),
   opticalDistanceMeters:{glass:g.distanceMeters,metal:m.distanceMeters,
    floorLine:d.distanceMeters,paintCell:ray.rayLengthMeters},
   originalMedianRgb:before,metalHiddenMedianRgb:after,
   metalAblationMaxChannelDelta:delta,
   saturationBefore:sat(before),saturationAfter:sat(after)
  });
 }
 check(rows.length===r.sampledRays,'RAY_COUNT_MISMATCH');
 return {
  schema:'B266_CROSSRUN_NATIVE_INK_OPTICAL_REGISTERED_EVIDENCE',
  originalSource:FROZEN,originalUvTriangles:57578,
  nativePaintSurfaces:17,nonNeutralOwnedCells:115,
  originalRayRunTick:r.nativeTick,originalMetalAbaRunTick:o.nativeTick,
  comparedDifferentRealBrowserRuns:true,matchedOwnedInkRays:rows.length,
  allMatchedGlassMetalFloorLineBeforePaint:true,
  rapierBeforePaint:0,ownerGridMutations:0,
  medianGlassMeters:med(rows.map(x=>x.opticalDistanceMeters.glass)),
  medianMetalMeters:med(rows.map(x=>x.opticalDistanceMeters.metal)),
  medianFloorLineMeters:med(rows.map(x=>x.opticalDistanceMeters.floorLine)),
  medianActualPaintMeters:med(rows.map(x=>x.opticalDistanceMeters.paintCell)),
  medianPixelMaxRgbDelta:med(rows.map(x=>x.metalAblationMaxChannelDelta)),
  samplesRgb8:rows.filter(x=>x.metalAblationMaxChannelDelta>=8).length,
  samplesSaturationIncreases:rows.filter(x=>
   x.saturationAfter>x.saturationBefore+.01).length,
  medianSaturationBefore:med(rows.map(x=>x.saturationBefore)),
  medianSaturationAfter:med(rows.map(x=>x.saturationAfter)),
  all58OriginalFrameChangeFraction:p.summary.changedRatio,
  originalFramesRestoredExact:true,
  actualColoredInkPixelVisibilityCertified:false,
  originalOpticalFullyOpaqueCertified:false,
  perceptualArtImprovementCertified:false,
  wallMetalDeletionAuthorized:false,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false,
  samples:rows
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 check(process.argv.length===6,'CLI_USE_B264_B265_B265PIXEL_OUTJSON');
 const [r,m,p,o]=process.argv.slice(2);
 const result=analyzeB266Crossrun(
  JSON.parse(readFileSync(r,'utf8')),
  JSON.parse(readFileSync(m,'utf8')),
  JSON.parse(readFileSync(p,'utf8')));
 writeFileSync(o,JSON.stringify(result,null,2));
 console.log(JSON.stringify({schema:result.schema,rays:result.matchedOwnedInkRays,
  medianDelta:result.medianPixelMaxRgbDelta,
  saturationIncreaseCount:result.samplesSaturationIncreases,
  artAccepted:result.artAccepted,productionAuthorized:false}));
}
