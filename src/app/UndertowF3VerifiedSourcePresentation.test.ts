import {describe,it,expect} from 'vitest';
import {selectVerifiedSourcePresentation,B29_SOURCE_VISUAL_AUTHORITY}
 from './UndertowF3VerifiedSourcePresentation';
const base={
 fullSourceReviewRequested:true,flatSourceVerified:true,
 texturedSourceVerified:true,prefersFlat:false
};
describe('W10-B29 exact-original full-static-stage optical priority',()=>{
 it('defaults to verified original 57,578-triangle UV only in explicit review',()=>{
  expect(selectVerifiedSourcePresentation(base)).toBe('F3L_ORIGINAL_UV');
  expect(selectVerifiedSourcePresentation({...base,fullSourceReviewRequested:false}))
   .toBe('F3E_REFERENCE');
  expect(selectVerifiedSourcePresentation({...base,flatSourceVerified:false}))
   .toBe('F3E_REFERENCE');
 });
 it('does not infer missing/invalid texture pack or original gameplay authority',()=>{
  expect(selectVerifiedSourcePresentation({...base,texturedSourceVerified:false}))
   .toBe('F3G_FLAT');
  expect(selectVerifiedSourcePresentation({...base,flatSourceVerified:true,
   texturedSourceVerified:false,prefersFlat:true})).toBe('F3G_FLAT');
  expect(B29_SOURCE_VISUAL_AUTHORITY).toMatchObject({
   sourceOnly:true,originalSetActorMatricesRecovered:false,
   newGameplayColliders:0,newNavigationLinks:0,scoreableSurfaces:0,
   productionAuthorized:false
  });
 });
 it('an explicit flat request overrides auto UV while preserving source geometry',()=>{
  expect(selectVerifiedSourcePresentation({...base,prefersFlat:true}))
   .toBe('F3G_FLAT');
  expect(selectVerifiedSourcePresentation({...base,prefersFlat:false}))
   .toBe('F3L_ORIGINAL_UV');
 });
});
