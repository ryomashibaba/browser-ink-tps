#!/usr/bin/env node
/** B326: extended genuine native walking on the existing original upper floor.
 * Never derive gameplay success from projected paths or sampled geometry.
 * Independent acceptance needs B322 + B324 genuine proof and additional KCC. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b324AuditGenuineUpperFloor}
 from './t21-b324-original-upper-floor-continuation.mjs';
import {UPPER_FLOOR_SOLID,UPPER_FLOOR_PAINT}
 from './t21-b322-original-ramp-crest.mjs';
const tri=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const check=(x,m)=>{if(!x)throw Error('B326_REAL_SOURCE_UPPER_FLOOR_'+m);};
export function b326AuditExtendedUpperFloor(b322,b324,attempt){
 check(attempt?.schema==='B326_NATIVE_SOURCE_UPPER_FLOOR_EXTENSION'&&
  attempt.source==='25/17/26/0'&&
  attempt.productionAuthorized===false&&attempt.original4v4Certified===false&&
  attempt.artAccepted===false,'NONPRODUCTION_AUTHORITY');
 const earlier=b324AuditGenuineUpperFloor(b322,b324);
 if(earlier.continuousUpperFloor!==true)return {
  schema:'B326_TRUE_UPPER_FLOOR_EXTENSION_AUDIT',source:'25/17/26/0',
  verdict:'HOLD_B324_GENUINE_NATIVE_KCC_PREREQUISITE',
  extendedUpperFloorProven:false,officialWinner:'NONE',productionAuthorized:false};
 const last=b324.steps.at(-1)?.after,first=attempt.first;
 check(last?.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
  tri(last.actualBodyMeters)&&tri(first?.actualBodyMeters)&&
  Number.isSafeInteger(first.tick)&&first.tick===last.tick&&
  Math.hypot(...first.actualBodyMeters.map((n,i)=>n-last.actualBodyMeters[i]))<=1e-6&&
  first.realHumanOriginalFootSupported===true&&
  first.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
  first.originalRows?.length===17&&
  first.sourceActorRelocations===0&&first.sourceInkRewritten===false&&
  first.playerPositionRewritten===false,'TRUE_B324_LAST_NATIVE_BODY_CARRYOVER');
 check(Array.isArray(attempt.steps)&&attempt.steps.length<=8,
  'BOUNDED_KEY_STEPS');
 let previous=first,supported=0,walked=0,firstUnsupported=null;
 const trace=[];
 for(let i=0;i<attempt.steps.length;i++){
  const t=attempt.steps[i],before=t?.before,after=t?.after;
  check(t?.realKey==='KeyW'&&t.nativeInputTicks===2&&
   Number.isSafeInteger(t.actualNativeTickDelta)&&
   t.actualNativeTickDelta>=1&&t.actualNativeTickDelta<=24&&
   before?.source==='25/17/26/0'&&
   Number.isSafeInteger(before.tick)&&before.tick>=previous.tick&&
   before.tick-previous.tick<=18&&tri(before.actualBodyMeters)&&
   before.originalRows?.length===17&&
   before.sourceActorRelocations===0&&
   before.sourceInkRewritten===false&&
   before.playerPositionRewritten===false&&
   after?.source==='25/17/26/0'&&
   Number.isSafeInteger(after.tick)&&
   after.tick-before.tick===t.actualNativeTickDelta&&
   tri(after.actualBodyMeters)&&after.originalRows?.length===17&&
   after.sourceActorRelocations===0&&
   after.sourceInkRewritten===false&&
   after.playerPositionRewritten===false,
   'GENUINE_CDPSOURCE_WITNESS_'+i);
  const idleDrift=Math.hypot(...before.actualBodyMeters.map(
   (n,j)=>n-previous.actualBodyMeters[j]));
  const displacement=Math.hypot(
   after.actualBodyMeters[0]-before.actualBodyMeters[0],
   after.actualBodyMeters[2]-before.actualBodyMeters[2]);
  const vertical=Math.abs(after.actualBodyMeters[1]-before.actualBodyMeters[1]);
  const grounded=s=>s.realHumanOriginalFootSupported===true&&
   s.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
   Number.isFinite(s.genuineOriginalFootGapMeters)&&
   s.genuineOriginalFootGapMeters>=0&&
   s.genuineOriginalFootGapMeters<=.18&&
   s.originalRows.some(row=>row.surfaceId===UPPER_FLOOR_PAINT&&
    row.actualHumanFootOnOriginalActiveSurface===true);
  const genuine=idleDrift<=.15&&displacement<=.8&&vertical<=.22&&
   Math.abs(after.actualBodyMeters[1]-first.actualBodyMeters[1])<=.20&&
   grounded(before)&&grounded(after);
  if(!genuine&&firstUnsupported===null)firstUnsupported=i+1;
  if(genuine&&firstUnsupported===null){supported++;walked+=displacement;}
  trace.push({step:i+1,beforeTick:before.tick,afterTick:after.tick,
   actualWorldMeters:after.actualBodyMeters,actualPlanarMeters:displacement,
   driftWithoutInputMeters:idleDrift,
   onOriginalUpperFloorWithRealKcc:genuine,
   originalSupportingSolid:after.genuineHumanOriginalFootSolid});
  previous=after;
 }
 const valid=firstUnsupported===null&&supported>=6&&walked>=2.5;
 return {schema:'B326_TRUE_UPPER_FLOOR_EXTENSION_AUDIT',
  verdict:valid?'PASS_GENUINE_EXTENDED_ORIGINAL_UPPER_FLOOR_KCC':
   'HOLD_NO_GENUINE_EXTENDED_UPPER_FLOOR_KCC',
  source:'25/17/26/0',extendedUpperFloorProven:valid,
  actualAdditionalPlanarMeters:walked,actualPreviousB324Meters:
   earlier.witnessedPlanarMeters,
  combinedVerifiedUpperFloorMeters:earlier.witnessedPlanarMeters+walked,
  realOriginalSupportedSteps:supported,
  firstUnsupportedStep:firstUnsupported,trace,
  originalSolidsAdded:0,navLinksAdded:0,actorTeleports:0,
  officialWinner:'NONE',original4v4Certified:false,artAccepted:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [b322,b324,b326]=process.argv.slice(2);
 check([b322,b324,b326].every(p=>typeof p==='string'&&p.endsWith('.json')),
  'THREE_NATIVE_JSON_REQUIRED');
 const result=b326AuditExtendedUpperFloor(
  JSON.parse(readFileSync(b322,'utf8')),
  JSON.parse(readFileSync(b324,'utf8')),
  JSON.parse(readFileSync(b326,'utf8')));
 check(statSync(resolve(b326,'..','B326_TRUE_UPPER_FLOOR_EXTENSION.png'))
  .size>20000,'REAL_CHROMIUM_FRAMEBUFFER_REQUIRED');
 writeFileSync(resolve(b326,'..','b326-independent-upper-floor-verdict.json'),
  JSON.stringify(result,null,2));
 console.log('B326_REAL_UPPER_FLOOR_EXTENSION_VERDICT',JSON.stringify({
  verdict:result.verdict,extraMeters:result.actualAdditionalPlanarMeters??0,
  combinedMeters:result.combinedVerifiedUpperFloorMeters??0,
  steps:result.realOriginalSupportedSteps??0}));
 if(!result.extendedUpperFloorProven)process.exitCode=1;
}
