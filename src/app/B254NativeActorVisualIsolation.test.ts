import {describe,it,expect} from 'vitest';
import {b254ActorRenderFlags,B254_VISIBILITY_MODES,
 B254_NATIVE_VISUAL_AUTHORITY} from './B254NativeActorVisualIsolation';
describe('B254 source actor silhouette visual diagnostics',()=>{
 it('can isolate original native CPU and player render-only without editing gameplay',()=>{
  expect(B254_VISIBILITY_MODES).toEqual([
   'ALL','HIDE_CPU','HIDE_PLAYER','HIDE_BOTH']);
  expect(b254ActorRenderFlags('ALL'))
   .toEqual({cpuVisible:true,playerVisible:true});
  expect(b254ActorRenderFlags('HIDE_CPU'))
   .toEqual({cpuVisible:false,playerVisible:true});
  expect(b254ActorRenderFlags('HIDE_PLAYER'))
   .toEqual({cpuVisible:true,playerVisible:false});
  expect(b254ActorRenderFlags('HIDE_BOTH'))
   .toEqual({cpuVisible:false,playerVisible:false});
  expect(()=>b254ActorRenderFlags('INVALID' as never))
   .toThrow('B254_UNKNOWN_SOURCE_VISUAL_DIAGNOSTIC');
 });
 it('never authorizes an added SOURCE surface, source instance, scoring, or route',()=>{
  expect(B254_NATIVE_VISUAL_AUTHORITY).toMatchObject({
   source:'25/17/26/0',sevenExistingSourceCpuOnly:true,
   visualComponentsEnabledOnly:true,gameBodiesMoved:0,
   sourceNavLinksAdded:0,originalScoreablesAdded:0,
   sourceBancActorMatricesRecovered:false,
   staticOriginalMeshModified:false,productionAuthorized:false
  });
 });
});
