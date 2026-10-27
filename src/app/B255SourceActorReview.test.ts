import {describe,it,expect} from 'vitest';
import {b255ActorReviewEligible,B255_ACTOR_REVIEW_AUTHORITY}
 from './B255SourceActorReview';
const url=new URLSearchParams('t21Play=preview&t21FullSource=review&t21B253=liveInk&t21B255=actorStudy');
const safe={
 paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudyActive:false,inkSafeEnabled:true,
 verifiedUvActive:true,sourceTriangles:57578,verifiedTextures:19,
 existingCpuActors:7,registeredSolids:25,paintableSurfaces:17,
 genuineLinks:26,scoreableSurfaces:0
};
describe('B255 opt-in native SOURCE actor visuals',()=>{
 it('requires all URL gates and the true eight-actor source roster',()=>{
  expect(b255ActorReviewEligible(url,safe)).toBe(true);
  for(const k of ['t21Play','t21FullSource','t21B253','t21B255']){
   const p=new URLSearchParams(url);p.delete(k);
   expect(b255ActorReviewEligible(p,safe),k).toBe(false);
  }
 });
 it('rejects live or full-round modes, missing UV and spoofed SOURCE counts',()=>{
  for(const [key,value] of Object.entries({
   paused:false,staging:false,stopped:true,fullRound:true,
   pointerLocked:true,otherStudyActive:true,inkSafeEnabled:false,
   verifiedUvActive:false,sourceTriangles:2,verifiedTextures:0,
   existingCpuActors:8,registeredSolids:26,paintableSurfaces:18,
   genuineLinks:27,scoreableSurfaces:1
  })){
   expect(b255ActorReviewEligible(url,{...safe,[key]:value}),key).toBe(false);
  }
 });
 it('adds zero actor physics, source routes, scores, or public game assets',()=>{
  expect(B255_ACTOR_REVIEW_AUTHORITY).toMatchObject({
   source:'25/17/26/0',existingActorsOnly:true,
   gameBodiesMoved:0,sourceNavLinksAdded:0,scoreableSurfacesAdded:0,
   rawOriginalAssetsPublished:false,productionAuthorized:false
  });
 });
});
