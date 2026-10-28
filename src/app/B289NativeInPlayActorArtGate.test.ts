import {describe,it,expect} from 'vitest';
import {b289RealSourceInPlayArtEligible,B289_NATIVE_ART_AUTHORITY,
 type B289NativeInPlayWitness} from './B289NativeInPlayActorArtGate';
const U='t21Play=preview&t21QaDrive=source&t21W10B192=humanCombat&'+
 't21W10B203=fullRound&t21B289=nativeInPlayActorArt';
function input():B289NativeInPlayWitness{return {
 url:new URLSearchParams(U),selectedNativeCombat:true,fullRound:true,
 paused:true,nativeTick:65,matchState:'PLAYING',stopReason:null,
 pointerLocked:false,surveyActive:false,galleryActive:false,
 nativeRenderer:'webgl2',originalSolids:25,originalPaint:17,
 originalLinks:26,scoreable:0,cpuActorIds:['A1','A2','A3','B1','B2','B3','B4'],
 playerRenderInstalled:true,sourceVisualsInstalled:8,actorBodyRelocations:0,
 acceptedHumanShots:8,actualHumanPaintCells:31,genuinePlayerTravelMeters:1.1,
 timeRemainingSeconds:178.5};}
describe('B289 real in-play actor comparison is fail-closed',()=>{
 it('allows only actual already moving & painted source round paused for A/B/C/A',()=>{
  for(const mode of ['B248_ORIGINAL','B268_COMPACT','B269_REAR_IDENTITY'] as const)
   expect(b289RealSourceInPlayArtEligible(input(),mode)).toBe(true);
 });
 it('rejects simulated evidence and actual running context',()=>{
  const v=input();
  for(const patch of [
   {acceptedHumanShots:0},{actualHumanPaintCells:0},
   {genuinePlayerTravelMeters:0},{genuinePlayerTravelMeters:.2},
   {nativeTick:0},{nativeTick:41},{paused:false},{pointerLocked:true},
   {timeRemainingSeconds:180},{timeRemainingSeconds:0},
   {matchState:'STAGING'},{stopReason:'STOP'},
   {originalSolids:26},{originalPaint:18},{originalLinks:25},
   {scoreable:1},{actorBodyRelocations:1},{nativeRenderer:'webgpu'},
   {sourceVisualsInstalled:7},{cpuActorIds:['A1','A1','A2','B1','B2','B3','B4']},
   {url:new URLSearchParams(U.replace('t21B289=nativeInPlayActorArt',''))}
  ])expect(b289RealSourceInPlayArtEligible({...v,...patch},'B268_COMPACT')).toBe(false);
 });
 it('never grants a graphics variant original-game physics or art rights',()=>{
  expect(B289_NATIVE_ART_AUTHORITY).toMatchObject({
   visualsOnly:true,existingActors:8,nativeWorldWrites:0,actorRelocations:0,
   originalSourceCollidersAdded:0,navLinksAdded:0,scoreablePromotions:0,
   nativeOpponentRoutesCertified:0,artAccepted:false,
   unrestricted4v4Certified:false,productionAuthorized:false
  });
 });
});
