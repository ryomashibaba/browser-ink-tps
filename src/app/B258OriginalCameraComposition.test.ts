import {describe,it,expect} from 'vitest';
import {B258_CAMERA_PROFILES,B258_CAMERA_NAMES,B258_CAMERA_AUTHORITY,
 b258Pose,b258CameraEligible} from './B258OriginalCameraComposition';
const p=new URLSearchParams('t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&t21B258=cameraStudy');
const safe={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,solids:25,paintable:17,links:26,
 scoreable:0,triangles:57578,textures:19,cpuCount:7};
describe('B258 native third-person certified clipping research',()=>{
 it('preserves the old camera as a strictly reversible baseline',()=>{
  expect(B258_CAMERA_NAMES).toEqual(['BASELINE','REAR_WIDE','ELEVATED_RIGHT']);
  // All candidates remain within the existing SOURCE TPS pitch/zoom band.
  for(const name of B258_CAMERA_NAMES){
   const p=b258Pose(name);
   expect(p.distanceMeters).toBeGreaterThanOrEqual(3.6);
   expect(p.distanceMeters).toBeLessThanOrEqual(9.5);
   expect(p.pitchDegrees).toBeGreaterThanOrEqual(-55);
   expect(p.pitchDegrees).toBeLessThanOrEqual(28);
   expect(p.shoulderMeters).toBeLessThanOrEqual(1.5);
  }
  expect(b258Pose('BASELINE')).toEqual({
   distanceMeters:6.4,pitchDegrees:-12,shoulderMeters:.72});
  expect(b258Pose('REAR_WIDE').distanceMeters).toBeGreaterThan(6.4);
  expect(b258Pose('ELEVATED_RIGHT').pitchDegrees).toBeLessThan(-12);
  expect(b258Pose('ELEVATED_RIGHT').shoulderMeters).toBeGreaterThan(.72);
  expect(()=>b258Pose('NA' as keyof typeof B258_CAMERA_PROFILES))
   .toThrow('B258_UNKNOWN_RESEARCH_CAMERA_PROFILE');
 });
 it('requires native frozen B257 and rejects competing B256 optics',()=>{
  expect(b258CameraEligible(p,safe)).toBe(true);
  const deterministic=new URLSearchParams(p);
  deterministic.set('t21QaInput','deterministic');
  expect(b258CameraEligible(deterministic,safe)).toBe(false);
  const wrongReview=new URLSearchParams(p);
  wrongReview.set('t21FullSource','production');
  expect(b258CameraEligible(wrongReview,safe)).toBe(false);
  for(const k of ['t21Play','t21FullSource','t21B253','t21B255','t21B257','t21B258']){
   const q=new URLSearchParams(p);q.delete(k);
   expect(b258CameraEligible(q,safe),k).toBe(false);
  }
  const bad={paused:false,staging:false,stopped:true,fullRound:true,
   pointerLocked:true,otherStudy:true,verifiedUv:false,inkSafe:false,
   humanoid:false,b256Active:true,solids:26,paintable:18,links:27,
   scoreable:1,triangles:57577,textures:0,cpuCount:8};
  for(const [k,v] of Object.entries(bad))
   expect(b258CameraEligible(p,{...safe,[k]:v}),k).toBe(false);
 });
 it('never promotes experimental view to physics, gameplay, or release',()=>{
  expect(B258_CAMERA_AUTHORITY).toMatchObject({
   certifiedRapierCameraClipping:true,
   gameActorsMoved:0,newRapierSolids:0,newNavLinks:0,
   paintableSurfacesAdded:0,scoreableSurfaces:0,
   releaseAuthorized:false,productionAuthorized:false
  });
 });
});
