import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {compareB267IntegratedSource} from './t21-b267-native-integrated-camera-review.mjs';
const names=['HUMAN','A1','A2','A3','B1','B2','B3','B4'];
function make(){
 const a=profile=>({cameraWorldMeters:[0,0,0],cameraForwardWorld:[0,0,-1],
  cameraSettings:{b258OriginalCameraResearch:{profile}},
  sourceOriginalTriangles:57578,verifiedSourceTextures:19,
  viewportPixels:[1600,900],sameFrozenSourceTick:345,
  actualActorScreenProjections:names.map(id=>({id,projectedHeadToCenterPx:25})),
  rays:[{id:'CENTER',originalOpticalNearest:
   {name:'Fld_Temple01_Glass01',distanceMeters:1.5}},...Array.from({length:8},
     (_,i)=>({id:'ray'+i,originalOpticalNearest:
     {name:'Fld_Temple01_Glass01',distanceMeters:1.5}}))]});
 const base=a('BASELINE'),samples=Array.from({length:58},(_,i)=>({
  world:[(i-29)*.01,.1,-10],screenPx:[800+(i-29)*.73,442.7,10],
  inFront:true,insideViewport:true,grid:[i,0]}));
 return [
  {schema:'B258_NATIVE_REAL_INK_CAMERA_ABCA',source:'25/17/26/0',
   productionAuthorized:false,pixels:{appearanceRestored:true},
   baselineDepth:base,candidates:['REAR_WIDE','ELEVATED_RIGHT']
   .map(x=>({audit:a(x)}))},
  {schema:'B265_GENUINE_PINNED_METAL_SOURCE_ABA',source:'25/17/26/0',
   sourceUvTriangles:57578,productionAuthorized:false,
   pixels:{appearanceRestored:true,originalUvRestoration:{changedPixels:0}},
   nativeOwnerGridProjection:{source:'25/17/26/0',sourceUvTriangles:57578,
    sourcePaintSurfaces:17,ownedCells:115,ownedA:115,ownedB:0,
    samplesInsideViewport:58,sampledCells:58,nativeTick:345,
    cameraWorld:[0,0,0],samples}}
 ];
}
test('calibrates actual ownerGrid screen positions; art remains HOLD',()=>{
 const [c,m]=make(),r=compareB267IntegratedSource(c,m);
 assert.equal(r.cameras.length,3);assert.equal(r.cameras[0].paintSamplesWithinViewport,58);
 assert.equal(r.artAccepted,false);assert.equal(r.originalRapierSolids,25);
 assert.ok(r.exactBaselineProjectionMaxErrorPx<.05);
 assert.equal(r.cameras[1].actualInkPixelVisibilityCertified,false);
});
test('rejects falsified screen pixel and wrong original stage',()=>{
 const [c,m]=make();m.nativeOwnerGridProjection.samples[3].screenPx[0]+=4;
 assert.throws(()=>compareB267IntegratedSource(c,m),/B267_BASELINE_SCREEN_PROJECTION_DRIFT/);
 const [cc,mm]=make();mm.nativeOwnerGridProjection.sourcePaintSurfaces=18;
 assert.throws(()=>compareB267IntegratedSource(cc,mm),/B267_UNVERIFIED_SAME_REAL_NATIVE_SOURCE/);
});
test('rejects non-native camera or moved original source tick',()=>{
 const [c,m]=make();c.candidates[1].audit.cameraSettings.b258OriginalCameraResearch.profile='BASELINE';
 assert.throws(()=>compareB267IntegratedSource(c,m),/B267_CAMERA_PROFILE_IDENTITY/);
 const [cc,mm]=make();mm.nativeOwnerGridProjection.nativeTick++;
 assert.throws(()=>compareB267IntegratedSource(cc,mm),/B267_UNVERIFIED_SAME_REAL_NATIVE_SOURCE/);
});
