/** B267 native-camera + actual ownerGrid + original optical 9-ray study.
 * Inputs: REAL B258 camera JSON and REAL B265 source-owned ink JSON.
 * No estimated original actor placement, no gameplay writes, no art PASS.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const SRC='25/17/26/0',W=1600,H=900;
const fail=s=>{throw Error('B267_'+s)};
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function unit(v){
 const n=Math.sqrt(dot(v,v));if(!Number.isFinite(n)||n<1e-10)fail('CAMERA_AXIS');
 return v.map(x=>x/n);
}
function cameraUv(a,world){
 const f=unit(a.cameraForwardWorld),right=unit(cross(f,[0,1,0]));
 const up=unit(cross(right,f)),d=sub(world,a.cameraWorldMeters),z=dot(d,f);
 if(!Number.isFinite(z)||z<=0)fail('OWNED_SAMPLE_BEHIND_CAMERA');
 return [dot(d,right)/z,dot(d,up)/z];
}
const median=xs=>{if(!xs.length)fail('NO_SAMPLES');let a=[...xs].sort((x,y)=>x-y);
 const k=Math.floor(a.length/2);return a.length%2?a[k]:(a[k-1]+a[k])/2};
export function compareB267IntegratedSource(camera,metal){
 const own=metal?.nativeOwnerGridProjection,b=camera?.baselineDepth;
 if(camera?.schema!=='B258_NATIVE_REAL_INK_CAMERA_ABCA'||
    metal?.schema!=='B265_GENUINE_PINNED_METAL_SOURCE_ABA'||
    camera.source!==SRC||metal.source!==SRC||
    camera.productionAuthorized!==false||metal.productionAuthorized!==false||
    metal.sourceUvTriangles!==57578||b?.sourceOriginalTriangles!==57578||
    b?.verifiedSourceTextures!==19||JSON.stringify(b?.viewportPixels)!=='[1600,900]'||
    own?.source!==SRC||own?.sourceUvTriangles!==57578||
    own?.sourcePaintSurfaces!==17||own?.ownedCells!==115||
    own?.ownedA!==115||own?.ownedB!==0||
    own?.samplesInsideViewport!==58||own?.sampledCells!==58||
    own?.samples?.length!==58||own?.nativeTick!==b?.sameFrozenSourceTick||
    Math.max(...sub(b?.cameraWorldMeters??[1e6,0,0],own?.cameraWorld??[0,0,0])
     .map(Math.abs))>1e-5||
    !camera?.pixels?.appearanceRestored||
    !metal?.pixels?.appearanceRestored||
    metal?.pixels?.originalUvRestoration?.changedPixels!==0)
  fail('UNVERIFIED_SAME_REAL_NATIVE_SOURCE_AND_INK');
 const pairs=own.samples.map(s=>{
  const [x,y]=cameraUv(b,s.world);return [x,y,s.screenPx[0]-W/2,H/2-s.screenPx[1]]});
 const num=pairs.reduce((v,[x,y,sx,sy])=>v+x*sx+y*sy,0);
 const den=pairs.reduce((v,[x,y])=>v+x*x+y*y,0);
 if(!(den>1e-9))fail('NO_FOV_WITNESS');
 const focal=num/den;
 if(!Number.isFinite(focal)||focal<400||focal>2500)fail('INVALID_NATIVE_CAMERA_FOV');
 const projectionError=Math.max(...pairs.map(([x,y,sx,sy])=>
  Math.max(Math.abs(focal*x-sx),Math.abs(focal*y-sy))));
 if(projectionError>=.05)fail('BASELINE_SCREEN_PROJECTION_DRIFT');
 const cameras=[b,...(camera.candidates??[]).map(x=>x.audit)];
 if(cameras.map(x=>x.cameraSettings?.b258OriginalCameraResearch?.profile).join('|')!==
    'BASELINE|REAR_WIDE|ELEVATED_RIGHT')fail('CAMERA_PROFILE_IDENTITY');
 const views=cameras.map(a=>{
  const pts=own.samples.map(s=>{
   const [x,y]=cameraUv(a,s.world);
   return [W/2+focal*x,H/2-focal*y];
  });
  const screenCount=pts.filter(([x,y])=>x>=0&&x<W&&y>=0&&y<H).length;
  const actors=a.actualActorScreenProjections;
  if(!Array.isArray(actors)||actors.length!==8||
     actors.filter(x=>x.id==='HUMAN').length!==1||
     !Array.isArray(a.rays)||a.rays.length!==9)fail('UNVERIFIED_NATIVE_ACTOR_OR_OPTICAL_PROBES');
  const human=actors.find(x=>x.id==='HUMAN');
  const center=a.rays.find(x=>x.id==='CENTER')?.originalOpticalNearest;
  if(!center||!center.name.startsWith('Fld_Temple01_')||
     !(center.distanceMeters>0))fail('UNVERIFIED_ORIGINAL_OPTICAL_NEAREST');
  return {profile:a.cameraSettings.b258OriginalCameraResearch.profile,
   cameraPositionMeters:a.cameraWorldMeters,realNativeActorCount:8,
   actualHumanHeadToCenterProjectionPx:human.projectedHeadToCenterPx,
   actualPaintOwnerCellScreenSamples:pts.length,paintSamplesWithinViewport:screenCount,
   medianPaintCenterReticleDistancePx:median(pts.map(([x,y])=>Math.hypot(x-800,y-450))),
   medianNativePaintProjectedPx:[median(pts.map(x=>x[0])),median(pts.map(x=>x[1]))],
   originalOpticalNearestAtCenter:{material:center.name,distanceMeters:center.distanceMeters},
   actualInkPixelVisibilityCertified:false,opaqueOcclusionCertified:false,
   nativeHumanSilhouettePixelsCertified:false};
 });
 if(views.some(x=>x.paintSamplesWithinViewport!==58))fail('CAMERA_LOST_ACTUAL_PAINT_REGION');
 return {schema:'B267_REAL_NATIVE_INTEGRATED_CAMERA_ACTOR_INK_AUDIT',
  source:SRC,originalTriangles:57578,sourcePaintSurfaces:17,
  originalRapierSolids:25,originalNavLinks:26,scoreableSurfaces:0,
  sameRealSourceTick:own.nativeTick,realOwnerCells:115,sampledOwnerCells:58,
  exactBaselineProjectionMaxErrorPx:projectionError,
  calibratedNativeFocalPixels:focal,cameras:views,
  originalActorPositionsChanged:0,sourceGeometryModified:0,
  inkOwnersModified:0,certifiedCollisionModified:0,
  noClaimNativeInkFullyVisible:true,noCameraArtCandidateAccepted:true,
  artAccepted:false,unrestricted4v4Certified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==5)fail('USAGE_B258_JSON_B265_JSON_RESULT_JSON');
 const r=compareB267IntegratedSource(
  JSON.parse(readFileSync(process.argv[2],'utf8')),
  JSON.parse(readFileSync(process.argv[3],'utf8')));
 writeFileSync(process.argv[4],JSON.stringify(r,null,2));
 console.log('B267_REAL_SOURCE_CAMERA_PAINT_PROJECTION_PASS',
  JSON.stringify({views:r.cameras.map(x=>({
   name:x.profile,onscreen:x.paintSamplesWithinViewport,
   reticleMedianPx:x.medianPaintCenterReticleDistancePx,
   humanHeadPx:x.actualHumanHeadToCenterProjectionPx})),artAccepted:false}));
}
