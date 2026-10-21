import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditB81Storage,auditB81Comparison} from './t21-w10b81-comparison-witness.mjs';
import {storeB70Round} from '../src/app/UndertowF3OwnerAimComparison.ts';
// Synthetic checker regression fixtures, never treated as native evidence.
const round=mode=>({schema:'T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1',
 mode,nativeSeconds:180,nativeTick:11856,originalPhysicalSolids:25,
 originalPaintable:17,originalNav:26,scoreable:0,officialWinner:'NONE',
 original4v4Certified:false,productionAuthorized:false,actualSevenCpuRejoined:7,
 cpuSourceShots:mode==='FIXED'?112:491,cpuImpactInkChangedCells:mode==='FIXED'?3615:11779,
 cpuOriginalPatrolMeters:4951.4,cpuSuspectedPhysicalStalls:0,humanShots:7,
 humanInkChangedCells:281,humanSplats:0,humanRespawns:0,cpuSplats:0,
 callbackP95Ms:500,renderFrameSamples:3434});
const fixed=round('FIXED'),sweep=round('SWEEP');
const first=storeB70Round(null,fixed),raw=storeB70Round(first,sweep);
const ui={stage:'TWO_REAL_COMPLETED_ROUNDS',visible:true,fixed:'YES',sweep:'YES',disabled:false,
 search:'?t21Play=preview&t21W10B68=previewSweep',
 text:'ACTUAL CPU SOURCE PAINT CELLS   FIXED 3,615 / SWEEP 11,779\n'+
 'ACTUAL CPU SOURCE SHOTS   112 / 491\n'+
 'REAL ORIGINAL-FOOT PATROL METERS   4951.4 / 4951.4\nYOUR OWN SHOTS   7 / 7\n'+
 'SOURCE INK CHANGE RATIO (NOT A TURF SCORE): 3.258×\n'+
 'HUMAN SHOTS/INK COUNTS MATCHED; other conditions can still differ.\n'+
 'NO WINNER · NO VERIFIED OPPONENT 4v4 · CPU DEFAULT STILL FIXED'};
test('requires two exact native captures and correctly rendered comparison',()=>{
 auditB81Storage(first,{fixed});
 assert.equal(auditB81Comparison(ui,raw,{fixed,sweep}).realCpuInkChangedCellsDelta,8164);
});
test('rejects schema confusion, private fields, stale or auto-saved records',()=>{
 for(const change of [q=>q.schema=q.fixed.schema,q=>q.fixed.actorTransform=[1,2,3],
  q=>q.fixed.cpuSourceShots++,q=>q.sweep=null,q=>q.sweep.scoreable=1]){
  const q=JSON.parse(raw);change(q);
  assert.throws(()=>auditB81Storage(JSON.stringify(q),{fixed,sweep}));
 }
 assert.throws(()=>auditB81Storage(raw,{fixed}));
});
test('rejects hidden, incomplete, wrong-number or falsely controlled result',()=>{
 for(const change of [{visible:false},{stage:'REAL_ROUND_AVAILABLE'},
  {text:ui.text.replace('11,779','11,778')},{text:ui.text.replace('3.258','4.000')},
  {search:'?t21QaDrive=source'},{disabled:true},{fixed:'NO'},
  {text:ui.text.replace('HUMAN SHOTS/INK COUNTS MATCHED;','HUMAN INPUT DIFFERED:')}])
  assert.throws(()=>auditB81Comparison({...ui,...change},raw,{fixed,sweep}));
});
