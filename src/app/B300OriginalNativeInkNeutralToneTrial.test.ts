import {describe,it,expect} from 'vitest';
import {B300_NATIVE_NEUTRAL_TONES,b300NativeToneEligible,
 type B300NativeToneGate} from './B300OriginalNativeInkNeutralToneTrial';
const baseline:B300NativeToneGate={optIn:true,paused:true,pointerLocked:false,
 stopped:false,originalFullRound:true,phase:'STAGING',nativeTick:86,
 actualHumanShots:8,actualOwnedPaintCells:315,
 sourceBoundary:[25,17,26,0],meshCount:17,visibleMeshes:17,
 registeredOwnerObjectsExact:true,originalActorStyle:true,relocatedActors:0,
 current:'ORIGINAL',requested:'SLATE',startedAtTick:null};
describe('B300 same real native gameplay neutral-only research A-B-C-A',()=>{
 it('preserves independent immutable neutral palette specifications',()=>{
  expect(B300_NATIVE_NEUTRAL_TONES.ORIGINAL).toEqual([.24,.27,.31]);
  expect(B300_NATIVE_NEUTRAL_TONES.SLATE).toEqual([.40,.47,.52]);
  expect(B300_NATIVE_NEUTRAL_TONES.STONE).toEqual([.51,.57,.62]);
 });
 it('permits one authentic frozen sequence and no leap/rollback drift',()=>{
  expect(b300NativeToneEligible(baseline)).toBe(true);
  const b={...baseline,current:'SLATE' as const,requested:'STONE' as const,
   startedAtTick:86};
  expect(b300NativeToneEligible(b)).toBe(true);
  expect(b300NativeToneEligible({...b,current:'STONE',
   requested:'ORIGINAL'})).toBe(true);
  expect(b300NativeToneEligible({...baseline,requested:'STONE'})).toBe(false);
  expect(b300NativeToneEligible({...b,startedAtTick:85})).toBe(false);
  expect(b300NativeToneEligible({...b,requested:'ORIGINAL'})).toBe(false);
 });
 it('rejects fake physics, paint, source, practice and actor claims',()=>{
  for(const bad of [{optIn:false},{paused:false},{pointerLocked:true},
   {nativeTick:0},{actualHumanShots:0},{actualOwnedPaintCells:0},
   {stopped:true},{originalFullRound:false},{phase:'TIME_UP'},
   {meshCount:16},{visibleMeshes:16},{registeredOwnerObjectsExact:false},
   {originalActorStyle:false},{relocatedActors:1},
   {sourceBoundary:[25,17,26,1] as const}])
   expect(b300NativeToneEligible({...baseline,...bad})).toBe(false);
 });
});
