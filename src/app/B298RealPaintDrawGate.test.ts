import {describe,it,expect} from 'vitest';
import {b298PaintDrawEligible,type B298Frame} from './B298RealPaintDrawGate';
const f:B298Frame={enabled:true,paused:true,locked:false,stopped:false,
 fullRound:true,tick:85,phase:'STAGING',shots:8,cells:315,
 source:[25,17,26,0],nativePaintMeshes:17,visibleMeshes:17,
 ownerReferencesExact:true,originalActorStyle:true,
 physicalActorRelocations:0,hiddenAtTick:null,requestHide:true};
describe('B298 actual original paint render isolation',()=>{
 it('accepts genuine frozen A-B-A only',()=>{
  expect(b298PaintDrawEligible(f)).toBe(true);
  expect(b298PaintDrawEligible({...f,requestHide:false,
   hiddenAtTick:85,visibleMeshes:0})).toBe(true);
  expect(b298PaintDrawEligible({...f,requestHide:false,
   hiddenAtTick:85,visibleMeshes:1})).toBe(false);
  expect(b298PaintDrawEligible({...f,requestHide:false,
   hiddenAtTick:84,visibleMeshes:0})).toBe(false);
 });
 it('rejects data and authority contamination',()=>{
  for(const x of [{enabled:false},{paused:false},{locked:true},
   {shots:0},{cells:0},{tick:0},{visibleMeshes:16},
   {ownerReferencesExact:false},{originalActorStyle:false},
   {physicalActorRelocations:1},{nativePaintMeshes:16},
   {source:[25,17,26,1] as const},{phase:'TIME_UP'}])
   expect(b298PaintDrawEligible({...f,...x})).toBe(false);
 });
});
