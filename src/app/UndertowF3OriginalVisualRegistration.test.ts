import {describe,it,expect} from 'vitest';
import {Entity,Vec3} from 'playcanvas';
import {originalVisualRegistration,originalCanonicalSourceVisualRegistration,
 originalF4LocalResearchVisualRegistration,applyOriginalVisualRegistration}
 from './UndertowF3OriginalVisualRegistration';
import {sourcePlayPortalDestinations,sourcePlayFrontlineResearchUrl}
 from './SourcePlayPortal';
import {selectVerifiedSourcePresentation,sourceF3kShowroomEligible}
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

describe('F4 pinned-local original UV stage in the same physical frame',()=>{
 const url='http://127.0.0.1:4176/?t21Play=preview&t21QaDrive=source&'+
  't21W10B183=firstDropPlay&t21W10B192=humanCombat&'+
  't21W10B203=fullRound&t21F4Central=research&t21F4Terrain=original';
 it('reuses the exact F3L pose without upgrading collision or score',()=>{
  const pose=originalF4LocalResearchVisualRegistration(url)!;
  expect(pose).toEqual(originalVisualRegistration(new URLSearchParams(
   't21Play=preview&t21FullSource=review&t21F3Registration=project')));
  const entity=new Entity('F4_LOCAL_OPTICAL_ONLY');
  applyOriginalVisualRegistration(entity,pose);
  for(const [mx,my,mz] of [[0,3,0],[-8,10.5,40],[12,3,-6]] as const){
   const actual=entity.getWorldTransform().transformPoint(new Vec3(mx,my,mz));
   const [x,z]=undertowTemple01ModelXZToProjectXZ([mx,mz]);
   expect(actual.x).toBeCloseTo(x,4);
   expect(actual.y).toBeCloseTo(my-3,4);
   expect(actual.z).toBeCloseTo(z,4);
  }
  expect(pose.collidersAdded).toBe(0);
  expect(pose.wholeMapAlignedCertified).toBe(false);
 });
 it('rejects remote, deterministic, official or non-F4 sessions',()=>{
  for(const candidate of [
   url.replace('127.0.0.1','example.com'),
   url.replace('http:','https:'),
   url.replace('t21F4Terrain=original','t21F4Terrain=photo'),
   url.replace('t21F4Central=research','t21F4Central=play'),
   url+'&t21F4Terrain=original',url+'&production=1',
   url+'&scoreable=1',url+'&t21QaInput=deterministic',
   url+'&t21FullSource=review',url+'&t21F3Registration=project'
  ])expect(originalF4LocalResearchVisualRegistration(candidate)).toBeNull();
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

describe('actual SOURCE 180s gameplay does not load unrelated F3K unplaced OBJ showroom',()=>{
 it('only permits source-verified isolated gallery during deliberate optical REVIEW',()=>{
  expect(sourceF3kShowroomEligible(true,false)).toBe(true);
  expect(sourceF3kShowroomEligible(false,false)).toBe(false);
  expect(sourceF3kShowroomEligible(false,true)).toBe(false);
  expect(sourceF3kShowroomEligible(true,true)).toBe(false);
 });
});
