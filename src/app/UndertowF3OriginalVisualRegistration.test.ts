import {describe,it,expect} from 'vitest';
import {Entity,Vec3} from 'playcanvas';
import {originalVisualRegistration,originalCanonicalSourceVisualRegistration,
 applyOriginalVisualRegistration}
 from './UndertowF3OriginalVisualRegistration';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl}
 from './SourcePlayPortal';
import {selectVerifiedSourcePresentation}
 from './UndertowF3VerifiedSourcePresentation';
import {undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';
describe('verified optical-only original model stage placement',()=>{
 const q=new URLSearchParams('t21Play=preview&t21FullSource=review&t21F3Registration=project');
 it('matches actual PlayCanvas vertex transform to existing registered floor frame',()=>{
  const pose=originalVisualRegistration(q)!;expect(pose).not.toBeNull();
  const e=new Entity('OPTICAL_ONLY');applyOriginalVisualRegistration(e,pose);
  for(const [mx,my,mz] of ([[0,3,0],[1,6,50],[-8,10.5,40],[12,3,-6],[3,7.5,-47]] as const)){
   const world=e.getWorldTransform().transformPoint(new Vec3(mx,my,mz));
   const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
   expect(world.x).toBeCloseTo(x,4);
   expect(world.y).toBeCloseTo(my-3,4);
   expect(world.z).toBeCloseTo(z,4);
  }
  expect(pose.collidersAdded).toBe(0);
  expect(pose.wholeMapAlignedCertified).toBe(false);
 });
 it('rejects default game and unrelated QA or production parameters',()=>{
  for(const url of [
   't21Play=preview&t21FullSource=review',
   q.toString()+'&t21QaInput=deterministic',
   q.toString()+'&production=1',q.toString()+'&scoreable=1',
   q.toString()+'&t21B257=depthAudit',q.toString()+'&t21B264=inkOpticalRays',
   q.toString()+'&t21B271=register',
   q.toString()+'&t21F3Registration=project'
  ])expect(originalVisualRegistration(new URLSearchParams(url))).toBeNull();
 });
 it('does not make disabled optical entity visible',()=>{
  const e=new Entity('HIDDEN');e.enabled=false;
  applyOriginalVisualRegistration(e,originalVisualRegistration(q)!);
  expect(e.enabled).toBe(false);
 });
});

describe('canonical SOURCE playable stage uses only preinstalled local optical geometry',()=>{
 const menu='http://127.0.0.1:4173/browser-ink-tps/play-source.html';
 const actual=sourcePlayPortalDestinations(menu);
 const playable=[actual.circuit,actual.combat,actual.coop,
  sourcePlayFrontlineResearchUrl(menu)];
 const review=new URLSearchParams(
  't21Play=preview&t21FullSource=review&t21F3Registration=project');
 it('shares the existing exact project pose without changing a native game URL',()=>{
  const pinnedReview=originalVisualRegistration(review);
  expect(pinnedReview).not.toBeNull();
  for(const href of playable){
   const originalHref=href;
   const same=originalCanonicalSourceVisualRegistration(href);
   expect(same).toEqual(pinnedReview);
   expect(same).toMatchObject({
    collidersAdded:0,wholeMapAlignedCertified:false});
   expect(href).toBe(originalHref);
   const q=new URL(href).searchParams;
   expect(q.has('t21FullSource')).toBe(false);
   expect(q.has('t21F3Registration')).toBe(false);
  }
 });
 it('rejects injected review flags, deterministic QA and fake score or production',()=>{
  for(const href of [
   'http://127.0.0.1:4173/browser-ink-tps/',
   ...['t21FullSource=review','t21F3Registration=project',
    't21QaInput=deterministic','production=1','scoreable=1',
    't21UnknownStageCollider=1'].map(x=>actual.combat+'&'+x)
  ]){
   expect(originalCanonicalSourceVisualRegistration(href)).toBeNull();
  }
 });
});

describe('true native SOURCE original stage floor remains physically honest',()=>{
 const base={
  fullSourceReviewRequested:true,flatSourceVerified:true,
  texturedSourceVerified:false,prefersFlat:false,
  nativeRegisteredFloorOnly:true
 };
 it('never loads unsplit flat F3G optical FloorLine/FloorFence bridges into native PLAYER',()=>{
  expect(selectVerifiedSourcePresentation(base)).toBe('F3E_REFERENCE');
  expect(selectVerifiedSourcePresentation({...base,prefersFlat:true}))
   .toBe('F3E_REFERENCE');
  expect(selectVerifiedSourcePresentation({...base,flatSourceVerified:false,
   texturedSourceVerified:true})).toBe('F3E_REFERENCE');
 });
 it('uses independently verified UV F3L when present and preserves explicit QA-only flat review',()=>{
  expect(selectVerifiedSourcePresentation({...base,texturedSourceVerified:true}))
   .toBe('F3L_ORIGINAL_UV');
  expect(selectVerifiedSourcePresentation({...base,texturedSourceVerified:true,
   prefersFlat:true})).toBe('F3L_ORIGINAL_UV');
  expect(selectVerifiedSourcePresentation({...base,nativeRegisteredFloorOnly:false}))
   .toBe('F3G_FLAT');
  expect(selectVerifiedSourcePresentation({...base,nativeRegisteredFloorOnly:false,
   texturedSourceVerified:true,prefersFlat:true})).toBe('F3G_FLAT');
 });
});
