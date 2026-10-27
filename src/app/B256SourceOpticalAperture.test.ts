import {describe,it,expect} from 'vitest';
import {B256_APERTURE_FOCUS,B256_OPTICAL_AUTHORITY,
 b256OpticalMaterialEligible,b256SourceOpticalEligible} from './B256SourceOpticalAperture';
const params=new URLSearchParams(
 't21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B256=opticalAperture');
const safe={
 paused:true,staging:true,fullRound:false,stopReason:false,
 pointerLocked:false,verifiedUv:true,inkSafe:true,humanoid:true,
 sourceTriangles:57578,textures:19,solids:25,paintable:17,
 navLinks:26,scoreable:0
};
describe('B256 render-only original-source optical sightline',()=>{
 it('requires all original UV + B255 + own URL gates',()=>{
  expect(b256SourceOpticalEligible(params,safe)).toBe(true);
  for(const k of ['t21Play','t21FullSource','t21B253','t21B255','t21B256']){
   const p=new URLSearchParams(params);p.delete(k);
   expect(b256SourceOpticalEligible(p,safe),k).toBe(false);
  }
 });
 it('rejects physics, unpaused, or missing texture authority',()=>{
  for(const [k,v] of Object.entries({
   paused:false,staging:false,fullRound:true,stopReason:true,
   pointerLocked:true,verifiedUv:false,inkSafe:false,humanoid:false,
   sourceTriangles:11,textures:0,solids:26,paintable:18,
   navLinks:27,scoreable:1
  })){
   expect(b256SourceOpticalEligible(params,{...safe,[k]:v}),k).toBe(false);
  }
 });
 it('acts on optical architecture only and retains real floor/ink',()=>{
  for(const k of ['STRUCTURE','SUPPORT','METAL','DETAIL'])
   expect(b256OpticalMaterialEligible(k)).toBe(true);
  for(const k of ['FLOOR','SLOPE','GLASS','WALKABLE','PAINT'])
   expect(b256OpticalMaterialEligible(k)).toBe(false);
  expect([...B256_APERTURE_FOCUS]).toEqual([.5,.30000001192092896,.38999998569488525,.4300000071525574]);
  expect(B256_OPTICAL_AUTHORITY).toMatchObject({
   source:'25/17/26/0',originalUvPositionDataUnmodified:true,
   newRapierSolids:0,newPaintableSurfaces:0,newNavLinks:0,
   scoreableSurfaces:0,productionAuthorized:false
  });
 });
});
