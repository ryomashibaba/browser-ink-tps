/** B81 uses the production B70 capture/validation model against live browser
 * counters. Synthetic tests of this checker are not native gameplay evidence. */
import {captureB70Round,readB70Session,storeB70Round,compareB70Rounds}
 from '../src/app/UndertowF3OwnerAimComparison.ts';

export function auditB81Storage(raw,expected){
 if(typeof raw!=='string'||raw.length>2400)throw Error('B81_STORAGE_BOUND');
 const wanted=storeB70Round(expected.fixed?storeB70Round(null,expected.fixed):null,
  expected.sweep??expected.fixed);
 // Exact field comparison rejects leaks, schema confusion and stale records.
 if(JSON.stringify(JSON.parse(raw))!==wanted)throw Error('B81_STORAGE_NATIVE_MISMATCH');
 return readB70Session(raw);
}
export function auditB81Comparison(ui,raw,expected){
 auditB81Storage(raw,expected);
 const result=compareB70Rounds(raw);
 if(!result||ui.stage!=='TWO_REAL_COMPLETED_ROUNDS'||!ui.visible||
    ui.fixed!=='YES'||ui.sweep!=='YES'||ui.disabled||
    ui.search!=='?t21Play=preview&t21W10B68=previewSweep')
  throw Error('B81_FINAL_COMPARISON_NOT_VISIBLE');
 const text=ui.text.replaceAll(',','');
 for(const row of [
  'ACTUAL CPU SOURCE PAINT CELLS   FIXED '+result.fixed.cpuImpactInkChangedCells+
   ' / SWEEP '+result.sweep.cpuImpactInkChangedCells,
  'ACTUAL CPU SOURCE SHOTS   '+result.fixed.cpuSourceShots+' / '+result.sweep.cpuSourceShots,
  'REAL ORIGINAL-FOOT PATROL METERS   '+result.fixed.cpuOriginalPatrolMeters+
   ' / '+result.sweep.cpuOriginalPatrolMeters,
  'YOUR OWN SHOTS   '+result.fixed.humanShots+' / '+result.sweep.humanShots,
  'SOURCE INK CHANGE RATIO (NOT A TURF SCORE): '+(result.realCpuInkChangeRatio??'N/A')+'×',
  result.humanInputWasDifferent?'HUMAN INPUT DIFFERED:':'HUMAN SHOTS/INK COUNTS MATCHED;',
  'NO WINNER · NO VERIFIED OPPONENT 4v4 · CPU DEFAULT STILL FIXED'
 ])if(!text.includes(row))throw Error('B81_RENDERED_NUMBERS_OR_HOLD_MISMATCH');
 return result;
}
export {captureB70Round};
