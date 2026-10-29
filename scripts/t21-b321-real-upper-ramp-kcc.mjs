#!/usr/bin/env node
/** B321 - TRUE higher part of ORIGINAL source ramp; strictly Rapier KCC.
 * Never infer a completed path from an optical, UV or source-quad guide. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b320SourceRampCoordinates,RAMP_SOLID,RAMP_PAINT}
 from './t21-b320-original-ramp-uphill-kcc.mjs';
const finite3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
const wrap=a=>((a+540)%360)-180;
const gate=(x,e)=>{if(!x)throw Error('B321_REAL_RAMP_HIGH_SECTION_'+e)};
export function b321OriginalRampHighSectionPlan({ledger,camera}){
 gate(ledger?.source==='25/17/26/0'&&
  ledger.realHumanOriginalFootSupported===true&&
  ledger.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  finite3(ledger.actualBodyMeters)&&
  Number.isFinite(camera?.yawDegrees),'AUTHENTIC_ORIGINAL_HUMAN_RAMP_START');
 const quad=ledger.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,ledger.actualBodyMeters);
 gate(start.insideSourceQuadXZ&&start.originalUphillFraction>=.10&&
  start.originalUphillFraction<.72,'PHYSICAL_B320_UPHILL_PREREQUISITE');
 const [hiA,hiB,loA,loB]=quad.vertices;
 const u=Math.min(.56,Math.max(.43,start.originalWidthFraction));
 const v=Math.min(.85,Math.max(.75,start.originalUphillFraction+.4));
 const target=loB.map((x,i)=>x+
  u*(loA[i]-x)+v*(hiB[i]-x));
 const targetCoord=b320SourceRampCoordinates(quad,target);
 gate(targetCoord.insideSourceQuadXZ&&
  targetCoord.originalUphillFraction>
   start.originalUphillFraction+.20,'ONLY_ORIGINAL_UPPER_INTERIOR');
 const dx=target[0]-ledger.actualBodyMeters[0];
 const dz=target[2]-ledger.actualBodyMeters[2];
 const distance=Math.hypot(dx,dz);
 const yaw=Math.atan2(dx,-dz)*180/Math.PI;
 const mx=Math.round(wrap(yaw-camera.yawDegrees)/.22);
 const px=800+mx;
 return {schema:'B321_GENUINE_ORIGINAL_HIGH_RAMP_HEADING',
  source:'25/17/26/0',start,target,targetCoord,
  originalQuadOnly:true,noRouteOrColliderGenerated:true,
  targetYaw:yaw,mouseX:mx,screenX:px,distance,
  safe:distance>.5&&distance<=5&&Math.abs(mx)<=720&&
   px>=10&&px<=1590,physicalPassNotInferred:true};
}
export function b321AuditTrueOriginalHigherRamp(data){
 gate(data?.schema==='B321_TRUE_CDP_UPPER_RAMP_TRAVERSE'&&
  data.source==='25/17/26/0'&&
  data.productionAuthorized===false&&
  data.original4v4Certified===false&&data.artAccepted===false,
  'NONPRODUCTION_ORIGINAL_25_17_26_0');
 if(data.prerequisiteB320Passed!==true)
  return {schema:'B321_HIGH_RAMP_INDEPENDENT_CHECK',
   verdict:'HOLD_B320_REAL_UPHILL_PREREQUISITE_MISSING',
   actualKccSteps:0,source:'25/17/26/0',
   original4v4Certified:false,artAccepted:false,productionAuthorized:false};
 const first=data.first,steps=data.steps;
 gate(first?.source==='25/17/26/0'&&
  first.realHumanOriginalFootSupported===true&&
  first.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  first.sourceActorRelocations===0&&
  first.sourceInkRewritten===false&&
  first.playerPositionRewritten===false&&
  finite3(first.actualBodyMeters)&&first.originalRows?.length===17&&
  Array.isArray(steps)&&steps.length<=14,
  'TRUE_NATIVE_RAMP_START_AND_BOUNDED_STEPS');
 const quad=first.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,first.actualBodyMeters);
 gate(start.insideSourceQuadXZ,'TRUE_RAMP_B320_ORIGIN_INSIDE');
 let previousTick=first.tick,allSupported=true,maxHeight=0,
  furthest=start.originalUphillFraction,supported=0;
 const trace=[];
 for(let i=0;i<steps.length;i++){
  const entry=steps[i],s=entry?.after;
  gate(entry.realKey==='KeyW'&&
   Number.isSafeInteger(entry.nativeInputTicks)&&
   entry.nativeInputTicks>=1&&entry.nativeInputTicks<=4&&
   Number.isSafeInteger(entry.actualNativeTickDelta)&&
   entry.actualNativeTickDelta>=1&&entry.actualNativeTickDelta<=24&&
   s?.source==='25/17/26/0'&&s.tick>previousTick&&
   finite3(s.actualBodyMeters)&&s.originalRows?.length===17&&
   s.sourceActorRelocations===0&&
   s.sourceInkRewritten===false&&
   s.playerPositionRewritten===false,
   'UNMODIFIED_NATIVE_KCC_STEP_'+i);
  const coord=b320SourceRampCoordinates(quad,s.actualBodyMeters);
  const point=s.originalRows.find(r=>r.surfaceId===RAMP_PAINT);
  const actualHeight=s.actualBodyMeters[1]-first.actualBodyMeters[1];
  const predictedFromOriginalSlope=1.5*(
   coord.originalUphillFraction-start.originalUphillFraction);
  const physics=coord.insideSourceQuadXZ&&
   s.realHumanOriginalFootSupported===true&&
   s.genuineHumanOriginalFootSolid===RAMP_SOLID&&
   point?.actualHumanFootOnOriginalActiveSurface===true&&
   Number.isFinite(s.genuineOriginalFootGapMeters)&&
   s.genuineOriginalFootGapMeters>=0&&
   s.genuineOriginalFootGapMeters<=.18&&
   Math.abs(actualHeight-predictedFromOriginalSlope)<=.16;
  if(physics){
   supported++;
   maxHeight=Math.max(maxHeight,actualHeight);
   furthest=Math.max(furthest,coord.originalUphillFraction);
  }else allSupported=false;
  trace.push({tick:s.tick,body:s.actualBodyMeters,
   rampUphillFraction:coord.originalUphillFraction,
   rampWidthFraction:coord.originalWidthFraction,
   actualHeightMeters:actualHeight,
   trueOriginalRapierRampSupport:physics,
   nativeSupportSolid:s.genuineHumanOriginalFootSolid});
  previousTick=s.tick;
 }
 const pass=allSupported&&supported>=4&&
  furthest>=.60&&maxHeight>=.45;
 return {schema:'B321_HIGH_RAMP_INDEPENDENT_CHECK',
  verdict:pass?'PASS_GENUINE_ORIGINAL_RAMP_HIGH_SECTION_KCC':
   'HOLD_NO_GENUINE_CONTINUOUS_HIGH_RAMP_KCC',
  source:'25/17/26/0',actualKccSteps:steps.length,
  actuallyRampSupportedSteps:supported,
  allStepsSupported:allSupported,
  maximumHeightIncreaseMeters:maxHeight,
  farthestOriginalUphillFraction:furthest,
  trace,noOtherSurfaceOrNavLinkSynthesized:true,
  original4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const path=process.argv[2];
 gate(typeof path==='string'&&path.endsWith('.json'),
  'GENUINE_CHROMIUM_ARTIFACT_REQUIRED');
 const data=JSON.parse(readFileSync(path,'utf8'));
 const result=b321AuditTrueOriginalHigherRamp(data);
 writeFileSync(resolve(path,'..','b321-independent-original-upper-ramp-verdict.json'),
  JSON.stringify(result,null,2));
 console.log('B321_REAL_ORIGINAL_HIGH_RAMP_VERDICT',
  JSON.stringify({verdict:result.verdict,steps:result.actualKccSteps,
   height:result.maximumHeightIncreaseMeters??0,source:'25/17/26/0'}));
}
