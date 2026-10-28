import {describe,it,expect} from 'vitest';
import {b262QaFocusEligible,b262FocusPresentation}
 from './B262SourceQaFocusStudy';
const p=new URLSearchParams('t21Play=preview&t21FullSource=review&'+
 't21B253=liveInk&t21B255=actorStudy&t21B257=depthAudit&'+
 't21B258=cameraStudy&t21B259=layerAudit&t21B260=materialAudit&'+
 't21B261=sortAudit&t21B262=qaFocusAudit');
const good={paused:true,staging:true,stopped:false,fullRound:false,
 pointerLocked:false,otherStudy:false,verifiedUv:true,inkSafe:true,
 humanoid:true,b256Active:false,cameraBaseline:true,solids:25,
 paintable:17,links:26,scoreable:0,triangles:57578,textures:19,cpuCount:7};
describe('B262 opt-in source QA panel space recovery',()=>{
 it('only permits paused verified B261/B260 source, never gameplay',()=>{
  expect(b262QaFocusEligible(p,good,'BASELINE',null)).toBe(true);
  for(const key of ['t21B262','t21B261','t21B260','t21B259',
    't21B253','t21FullSource']){
   const q=new URLSearchParams(p);q.delete(key);
   expect(b262QaFocusEligible(q,good,'BASELINE',null)).toBe(false);
  }
  expect(b262QaFocusEligible(p,good,'HIDE_UV_GLASS',null)).toBe(false);
  expect(b262QaFocusEligible(p,good,'BASELINE',
   'Fld_Temple01_Glass01')).toBe(false);
  for(const v of [{paused:false},{staging:false},{pointerLocked:true},
   {otherStudy:true},{fullRound:true},{cameraBaseline:false},
   {scoreable:1},{solids:24},{paintable:16},{links:25},
   {triangles:57577},{cpuCount:6}]){
   expect(b262QaFocusEligible(p,{...good,...v},'BASELINE',null)).toBe(false);
  }
 });
 it('only toggles QA panel and restore tab, no source state',()=>{
  const a=b262FocusPresentation(false),b=b262FocusPresentation(true);
  expect(a.qaPanelHidden).toBe(false);
  expect(b.qaPanelHidden).toBe(true);
  expect(a.restoreButtonVisible).toBe(false);
  expect(b.restoreButtonVisible).toBe(true);
  for(const state of [a,b]){
   expect(state.source).toBe('25/17/26/0');
   expect(state.originalSourceTriangles).toBe(57578);
   expect(Object.entries(state).filter(([k])=>k.startsWith('changed'))
    .every(([,n])=>n===0)).toBe(true);
   expect(state.productionAuthorized).toBe(false);
   expect(state.artAccepted).toBe(false);
  }
 });
});
