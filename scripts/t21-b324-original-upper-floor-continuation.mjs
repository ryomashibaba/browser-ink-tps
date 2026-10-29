#!/usr/bin/env node
/** B324: independent real-human KCC continuation on the ORIGINAL upper floor. */
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b322AuditNativeOriginalCrestExit,UPPER_FLOOR_SOLID,UPPER_FLOOR_PAINT}
 from './t21-b322-original-ramp-crest.mjs';
const good3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const gate=(c,m)=>{if(!c)throw Error('B324_GENUINE_ORIGINAL_'+m);};
export function b324AuditGenuineUpperFloor(prior,attempt){
 gate(attempt?.schema==='B324_REAL_ORIGINAL_UPPER_FLOOR'&&
  attempt.source==='25/17/26/0'&&
  attempt.productionAuthorized===false&&
  attempt.original4v4Certified===false&&attempt.artAccepted===false,
  'RESEARCH_AUTHORITY');
 const prerequisite=b322AuditNativeOriginalCrestExit(prior);
 if(prerequisite.verdict!=='PASS_REAL_ORIGINAL_RAMP_TO_UPPER_FLOOR')
  return {schema:'B324_UPPER_FLOOR_AUDIT',source:'25/17/26/0',
   verdict:'HOLD_B322_GENUINE_UPPER_FLOOR_PREREQUISITE',
   continuousUpperFloor:false};
 const last=prior.steps.at(-1)?.after,first=attempt.first;
 gate(last?.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
  good3(last.actualBodyMeters)&&good3(first?.actualBodyMeters)&&
  first.tick===last.tick&&
  Math.hypot(...first.actualBodyMeters.map((v,i)=>v-last.actualBodyMeters[i]))<=1e-6&&
  first.realHumanOriginalFootSupported===true&&
  first.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
  first.originalRows?.length===17&&
  first.sourceActorRelocations===0&&first.sourceInkRewritten===false&&
  first.playerPositionRewritten===false,'SAME_B322_TRUE_FLOOR_START');
 gate(Array.isArray(attempt.steps)&&attempt.steps.length<=8,'BOUNDED_STEPS');
 let prev=first,supported=0,meters=0,firstBad=null;
 const trace=[];
 for(let i=0;i<attempt.steps.length;i++){
  const t=attempt.steps[i],before=t?.before,s=t?.after;
  gate(t?.realKey==='KeyW'&&t.nativeInputTicks===2&&
   Number.isSafeInteger(t.actualNativeTickDelta)&&
   t.actualNativeTickDelta>=1&&t.actualNativeTickDelta<=24&&
   before?.source==='25/17/26/0'&&
   Number.isSafeInteger(before.tick)&&
   before.tick>=prev.tick&&before.tick-prev.tick<=18&&
   good3(before.actualBodyMeters)&&before.originalRows?.length===17&&
   before.sourceActorRelocations===0&&
   before.sourceInkRewritten===false&&
   before.playerPositionRewritten===false&&
   s?.source==='25/17/26/0'&&Number.isSafeInteger(s.tick)&&
   s.tick>before.tick&&s.tick-before.tick===t.actualNativeTickDelta&&
   good3(s.actualBodyMeters)&&s.originalRows?.length===17&&
   s.sourceActorRelocations===0&&s.sourceInkRewritten===false&&
   s.playerPositionRewritten===false,'ACTUAL_NATIVE_INPUT_'+i);
  // Observe pre-input KCC, not merely the later shot. No hidden relocation,
  // source change, or large unobserved drift between real observations.
  const inter=Math.hypot(...before.actualBodyMeters.map(
   (value,index)=>value-prev.actualBodyMeters[index]));
  const planar=Math.hypot(s.actualBodyMeters[0]-before.actualBodyMeters[0],
   s.actualBodyMeters[2]-before.actualBodyMeters[2]);
  const rise=Math.abs(s.actualBodyMeters[1]-before.actualBodyMeters[1]);
  const beforeFloor=inter<=.15&&before.realHumanOriginalFootSupported===true&&
   before.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
   Number.isFinite(before.genuineOriginalFootGapMeters)&&
   before.genuineOriginalFootGapMeters>=0&&
   before.genuineOriginalFootGapMeters<=.18&&
   before.originalRows.some(r=>r.surfaceId===UPPER_FLOOR_PAINT&&
    r.actualHumanFootOnOriginalActiveSurface===true);
  const onFloor=beforeFloor&&planar<=.8&&rise<=.22&&
   Math.abs(s.actualBodyMeters[1]-first.actualBodyMeters[1])<=.20&&
   s.realHumanOriginalFootSupported===true&&
   s.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
   Number.isFinite(s.genuineOriginalFootGapMeters)&&
   s.genuineOriginalFootGapMeters>=0&&s.genuineOriginalFootGapMeters<=.18&&
   s.originalRows.some(r=>r.surfaceId===UPPER_FLOOR_PAINT&&
    r.actualHumanFootOnOriginalActiveSurface===true);
  if(!onFloor&&firstBad===null)firstBad=i+1;
  if(onFloor&&firstBad===null){supported++;meters+=planar;}
  trace.push({step:i+1,tick:s.tick,beforeTick:before.tick,body:s.actualBodyMeters,
   interInputDriftMeters:inter,genuineOriginalUpperFloorSupport:onFloor,
   actualPlanarMeters:planar,
   supportingSolid:s.genuineHumanOriginalFootSolid});
  prev=s;
 }
 const pass=firstBad===null&&supported>=4&&meters>=.30;
 return {schema:'B324_UPPER_FLOOR_AUDIT',source:'25/17/26/0',
  verdict:pass?'PASS_GENUINE_ORIGINAL_UPPER_FLOOR_CONTINUOUS_KCC':
   'HOLD_NO_CONTINUOUS_ORIGINAL_UPPER_FLOOR_KCC',
  continuousUpperFloor:pass,genuineSupportedNativeSteps:supported,
  witnessedPlanarMeters:meters,firstUnsupportedStep:firstBad,trace,
  originalSolidsAdded:0,navLinksAdded:0,actorTeleports:0,
  productionAuthorized:false,original4v4Certified:false,artAccepted:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const a=process.argv[2],b=process.argv[3];
 gate(a?.endsWith('.json')&&b?.endsWith('.json'),'TWO_REAL_JSON_REQUIRED');
 const result=b324AuditGenuineUpperFloor(
  JSON.parse(readFileSync(a,'utf8')),JSON.parse(readFileSync(b,'utf8')));
 gate(statSync(resolve(b,'..','B324_TRUE_ORIGINAL_UPPER_FLOOR_KCC.png'))
  .size>20000,'CHROMIUM_FRAMEBUFFER');
 writeFileSync(resolve(b,'..','b324-independent-original-upper-floor-verdict.json'),
  JSON.stringify(result,null,2));
 console.log('B324_REAL_UPPER_FLOOR_PROOF',JSON.stringify({
  verdict:result.verdict,steps:result.genuineSupportedNativeSteps??0,
  actualPlanarMeters:result.witnessedPlanarMeters??0}));
 if(!result.continuousUpperFloor)process.exitCode=1;
}
