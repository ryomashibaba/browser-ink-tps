import {describe,it,expect} from 'vitest';
import {B302_NATIVE_TEAM_A_TONES,b302NativeTeamAEligible,
 type B302NativeTeamAGate} from './B302RealInkTeamColorTrial';
const baseline:B302NativeTeamAGate={optIn:true,paused:true,pointerLocked:false,
 stopped:false,originalFullRound:true,phase:'STAGING',nativeTick:86,
 actualHumanShots:8,actualOwnedPaintCells:315,
 sourceBoundary:[25,17,26,0],meshCount:17,visibleMeshes:17,
 registeredOwnerObjectsExact:true,originalActorStyle:true,relocatedActors:0,
 current:'ORIGINAL',requested:'DEEP',startedAtTick:null};
describe('B302 same real native gameplay team A ink-only research A-B-C-A',()=>{
 it('preserves independent immutable team A ink palette specifications',()=>{
  expect(B302_NATIVE_TEAM_A_TONES.ORIGINAL).toEqual([.02,.84,.96]);
  expect(B302_NATIVE_TEAM_A_TONES.DEEP).toEqual([0,.68,.92]);
  expect(B302_NATIVE_TEAM_A_TONES.BRIGHT).toEqual([.16,1,1]);
 });
 it('permits one authentic frozen sequence and no leap/rollback drift',()=>{
  expect(b302NativeTeamAEligible(baseline)).toBe(true);
  const b={...baseline,current:'DEEP' as const,requested:'BRIGHT' as const,
   startedAtTick:86};
  expect(b302NativeTeamAEligible(b)).toBe(true);
  expect(b302NativeTeamAEligible({...b,current:'BRIGHT',
   requested:'ORIGINAL'})).toBe(true);
  expect(b302NativeTeamAEligible({...baseline,requested:'BRIGHT'})).toBe(false);
  expect(b302NativeTeamAEligible({...b,startedAtTick:85})).toBe(false);
  expect(b302NativeTeamAEligible({...b,requested:'ORIGINAL'})).toBe(false);
 });
 it('rejects fake physics, paint, source, practice and actor claims',()=>{
  for(const bad of [{optIn:false},{paused:false},{pointerLocked:true},
   {nativeTick:0},{actualHumanShots:0},{actualOwnedPaintCells:0},
   {stopped:true},{originalFullRound:false},{phase:'TIME_UP'},
   {meshCount:16},{visibleMeshes:16},{registeredOwnerObjectsExact:false},
   {originalActorStyle:false},{relocatedActors:1},
   {sourceBoundary:[25,17,26,1] as const}])
   expect(b302NativeTeamAEligible({...baseline,...bad})).toBe(false);
 });
});
