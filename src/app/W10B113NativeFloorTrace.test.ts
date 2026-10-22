import {describe,expect,it} from 'vitest';
import {W10B112HumanGroundLedger} from './W10B112HumanGroundLedger';
import {buildB113NativeFloorTrace,type B113HumanFallInput}
 from './W10B113NativeFloorTrace';
const make=()=>{
 const ledger=new W10B112HumanGroundLedger();
 ledger.observe({tick:1,center:[0,8.4,64],mode:'HUMAN',
  sourceSolidId:'original-a',sourceSupportGapMeters:.02,grounded:true});
 return {
  nativeTick:1,humanBody:[0,8.4,64],
  originalSourceSolids:25,originalPaintSurfaces:17,
  originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
  productionAuthorized:false,unrestricted4v4Certified:false,
  matchState:'PLAYING',stopReason:null,footLedger:ledger.snapshot()
 } as B113HumanFallInput;
};
describe('W10-B113 local genuine-source floor evidence',()=>{
 it('does not convert a normal original walking sample into a floor hole',()=>{
  const report=buildB113NativeFloorTrace(make());
  expect(report.classification).toBe('NO_UNSUPPORTED_DESCENT_OBSERVED_IN_BOUNDED_WINDOW');
  expect(report.originalSourceAuthority).toEqual([25,17,26,0]);
  expect(report.originalSourceFloorHoleCertified).toBe(false);
  expect(report.unrestricted4v4Certified).toBe(false);
  expect(report.evidenceExport).toBe('EXPLICIT_LOCAL_USER_CLICK_NO_AUTO_UPLOAD');
 });
 it('retains native fall frames after real respawn for one-click evidence',()=>{
  const ledger=new W10B112HumanGroundLedger();
  ledger.observe({tick:1,center:[0,8.4,64],mode:'HUMAN',
   sourceSolidId:'original-a',sourceSupportGapMeters:0,grounded:true});
  for(let tick=2;tick<=16;tick++)
   ledger.observe({tick,center:[0,8.4-(tick-2)*.055,64],
    grounded:false,mode:'HUMAN',sourceSolidId:null,sourceSupportGapMeters:null});
  const first=ledger.snapshot();
  expect(first.suspicionCount).toBe(1);
  expect(first.suspicions[0]!.realNativeFramesBeforeDetection.length).toBeGreaterThan(8);
  ledger.resetOnRespawn();
  ledger.observe({tick:17,center:[0,9,67],mode:'HUMAN',
   sourceSolidId:'original-a',sourceSupportGapMeters:.05,grounded:true});
  const result=buildB113NativeFloorTrace({...make(),nativeTick:17,
   humanBody:[0,9,67],footLedger:ledger.snapshot()});
  expect(result.classification).toBe('UNSUPPORTED_DESCENT_SUSPECT_ONLY');
  expect(result.authenticSuspectedDescentEvents).toBe(1);
  expect(result.observedOriginalFoot.suspicions[0]!.firstUnsupportedNativeTick).toBe(2);
  expect(result.originalSourceFloorHoleCertified).toBe(false);
 });
 it('rejects unsupported original authority or impossible chronology',()=>{
  const a=make();a.originalSourceSolids=24;
  expect(()=>buildB113NativeFloorTrace(a))
   .toThrow('B113_ORIGINAL_SOURCE_AUTHORITY_NOT_VERIFIED');
  a.originalSourceSolids=25;a.nativeTick=0;
  expect(()=>buildB113NativeFloorTrace(a))
   .toThrow('B113_INCONSISTENT_TRUE_NATIVE_FOOT_WITNESS');
  a.nativeTick=1;a.sourceScoreablePromotions=1;
  expect(()=>buildB113NativeFloorTrace(a))
   .toThrow('B113_ORIGINAL_SOURCE_AUTHORITY_NOT_VERIFIED');
 });
});
