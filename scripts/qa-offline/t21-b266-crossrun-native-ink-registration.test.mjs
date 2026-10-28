import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {analyzeB266Crossrun} from './t21-b266-crossrun-native-ink-registration.mjs';
const S='UndertowT21D:spawn-high-positive-z:paint';
function fixtures(){
 const sample={surfaceId:S,team:'A',grid:[117,69],
  world:[0,7.502,58],screenPx:[795,444,13.76],
  insideViewport:true,inFront:true};
 const ray={surfaceId:S,ownerCellGrid:[117,69],
  trueOwnerCellWorld:[0,7.502,58],nativeScreenPx:[795,444,13.76],
  rayLengthMeters:13.9,opticalBeforePaint:true,physicalBeforePaint:false,
  originalOpticalFirstSix:[
   {name:'Fld_Temple01_Glass01',kind:'GLASS',distanceMeters:1.3},
   {name:'Fld_Temple01_WallMetal00',kind:'METAL',distanceMeters:1.4},
   {name:'Fld_Temple01_FloorLine02',kind:'DETAIL',distanceMeters:10.2}
  ]};
 const b264={context:'REAL_INK',source:'25/17/26/0',report:{
  schema:'B264_ACTUAL_NATIVE_INK_CELL_OPTICAL_AND_RAPIER_DEPTH',
  source:'25/17/26/0',originalSourceTriangles:57578,
  realPaintSurfaces:17,ownerCells:115,nativeTick:346,sampledRays:1,
  changedInkOwnership:0,changedOriginalMeshes:0,newCollisionSolids:0,
  newNavigationLinks:0,newScoreableSurfaces:0,rays:[ray]}};
 const b265={label:'REAL_INK',schema:'B265_GENUINE_PINNED_METAL_SOURCE_ABA',
  source:'25/17/26/0',sourceUvTriangles:57578,artAccepted:false,
  productionAuthorized:false,
  pixels:{appearanceRestored:true,originalUvRestoration:{changedPixels:0}},
  metalMaterial:{hiddenMaterial:'Fld_Temple01_WallMetal00',
   materialKind:'METAL',exactSourceMaterialIdentityVerified:true,
   originalUvTriangles:57578},
  nativeOwnerGridProjection:{source:'25/17/26/0',sourceUvTriangles:57578,
   sourcePaintSurfaces:17,ownedCells:115,ownedA:115,ownedB:0,
   nativeTick:345,samplesInsideViewport:1,samples:[sample]}};
 const offline={REAL_INK:{summary:{source:'25/17/26/0',
  sourceUvTriangles:57578,ownedCells:115,onscreenSamples:1,
  changedRatio:.52,restoreDifferingPixels:0},
  samplePoints:[{surfaceId:S,screenPx:[795,444],
   baselineRgb:[63,97,106],metalHiddenRgb:[55,106,118],
   maxChannelDelta:12}]}};
 return [b264,b265,offline];
}
test('same genuine owner/sample geometry correlates without ART promotion',()=>{
 const [a,b,c]=fixtures(),x=analyzeB266Crossrun(a,b,c);
 assert.equal(x.matchedOwnedInkRays,1);
 assert.equal(x.samplesSaturationIncreases,1);
 assert.equal(x.originalFramesRestoredExact,true);
 assert.equal(x.perceptualArtImprovementCertified,false);
 assert.equal(x.wallMetalDeletionAuthorized,false);
 assert.equal(x.artAccepted,false);
});
test('mismatched original ray & owner projection must fail',()=>{
 const [a,b,c]=fixtures();
 a.report.rays[0].nativeScreenPx[0]+=1;
 assert.throws(()=>analyzeB266Crossrun(a,b,c),/B266_CROSSRUN_CAMERA_OR_WORLD_DRIFT/);
});
test('source proof & restoration cannot be bypassed',()=>{
 const [a,b,c]=fixtures();
 b.pixels.originalUvRestoration.changedPixels=1;
 assert.throws(()=>analyzeB266Crossrun(a,b,c),/B266_FRAMEBUFFER_RESTORATION/);
});
test('in-front source METAL is mandatory, not a Rapier solid',()=>{
 const [a,b,c]=fixtures();
 a.report.rays[0].originalOpticalFirstSix[1].distanceMeters=14.5;
 assert.throws(()=>analyzeB266Crossrun(a,b,c),/B266_UNSUPPORTED_RAY_ORDER/);
});
