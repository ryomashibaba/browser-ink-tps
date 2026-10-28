import {describe,it,expect} from 'vitest';
import {b288FrozenVisualStudyEligible,B288_ART_RESEARCH_AUTHORITY,
 type B288FrozenActorStudyWitness} from './B288NativeSourceActorArtGate';
const IDs=['A1','A2','A3','B1','B2','B3','B4'];
function native():B288FrozenActorStudyWitness{
 return {
  url:new URLSearchParams(
   't21Play=preview&t21QaDrive=source&t21W10B192=humanCombat&t21W10B203=fullRound'),
  selectedNativeCombat:true,fullRound:true,paused:true,
  nativeTick:0,matchState:'STAGING',stopReason:null,pointerLocked:false,
  surveyActive:false,galleryActive:false,nativeRenderer:'webgl2',
  originalSolids:25,originalPaint:17,originalLinks:26,scoreable:0,
  cpuActorIds:IDs,playerRenderInstalled:true,sourceVisualsInstalled:8,
  actorBodyRelocations:0
 };
}
describe('B288 native frozen actor optical study authority',()=>{
 it('admits all three pre-existing visual variants only at original source READY',()=>{
  for(const name of ['B248_ORIGINAL','B268_COMPACT','B269_REAR_IDENTITY'] as const)
   expect(b288FrozenVisualStudyEligible(native(),name)).toBe(true);
 });
 it('blocks active gameplay, pointer lock, time advancement, stop and survey',()=>{
  const v=native();
  for(const patch of [{paused:false},{nativeTick:1},{matchState:'PLAYING'},
   {pointerLocked:true},{stopReason:'SAFE_STOP'},{surveyActive:true},
   {galleryActive:true},{actorBodyRelocations:1}]){
   expect(b288FrozenVisualStudyEligible({...v,...patch},'B269_REAR_IDENTITY')).toBe(false);
  }
 });
 it('rejects modified original source, missing actors and non-native input',()=>{
  const v=native();
  for(const patch of [{scoreable:1},{originalSolids:26},{originalPaint:18},
   {originalLinks:25},{nativeRenderer:'webgpu'},{sourceVisualsInstalled:7},
   {cpuActorIds:['A1','A1','A2','B1','B2','B3','B4']}]){
   expect(b288FrozenVisualStudyEligible({...v,...patch},'B268_COMPACT')).toBe(false);
  }
  expect(b288FrozenVisualStudyEligible({...v,
   url:new URLSearchParams('t21Play=preview')},'B248_ORIGINAL')).toBe(false);
 });
 it('cannot authorize production, art acceptance or extra collision',()=>{
  expect(B288_ART_RESEARCH_AUTHORITY).toMatchObject({
   actorBodyRelocations:0,rapierCollidersAdded:0,navLinksAdded:0,
   sourceGeometryEdited:0,paintCellsModified:0,scoreablePromotions:0,
   artAccepted:false,productionAuthorized:false,fullFourVsFourCertified:false
  });
 });
});
