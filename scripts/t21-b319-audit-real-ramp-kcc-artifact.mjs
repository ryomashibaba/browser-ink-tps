#!/usr/bin/env node
/** B319 independently classifies authentic source KCC ramp walk proof.
 * The script reads native JSON; CI SUCCESS != actual ramp-walk PASS.
 * A candidate inside original quad with no real foot support must HOLD. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const source='25/17/26/0';
const landing='UndertowT21D:first-drop-landing-positive-z';
const ramp='UndertowT21D:right-low-route-ramp-positive-z';
const fail=s=>{throw Error('B319_REJECT_UNTRUSTED_RAMP_WALK_'+s)};
const ok=(v,s)=>{if(!v)fail(s)};
export function classifyB319GenuineOriginalRampWalk(data){
 ok(data?.schema==='B316_GENUINE_LOWER_LANDING_TO_RAMP_KCC'&&
  data.source===source&&data.productionAuthorized===false&&
  data.original4v4Certified===false&&data.artAccepted===false&&
  data.stageSolidsChanged===0&&data.exactOriginalActorTeleportCount===0,
  'ORIGINAL_25_17_26_0_SOURCE');
 const first=data.first;
 ok(first?.genuineHumanOriginalFootSolid===landing&&
  first.realHumanOriginalFootSupported===true&&
  first.sourceActorRelocations===0&&
  first.sourceInkRewritten===false&&
  first.playerPositionRewritten===false&&
  first.originalRows?.length===17,'GENUINE_ORIGINAL_LANDING_START');
 ok(data.b318OriginalRampInteriorGuideOptIn===true&&
  data.plan?.source===source&&
  data.plan?.candidate?.originalFourSourceVertices===true&&
  data.plan?.candidate?.physicallyCertified===false&&
  data.plan?.candidate?.pointOnlyNotFootprintOrRoute===true,
  'EXACT_ORIGINAL_FOUR_VERTEX_INTERIOR_PLAN');
 ok(Array.isArray(data.steps)&&data.steps.length>=1&&
  data.steps.length<=12,'ACTUAL_BOUNDED_KEY_STEPS');
 let previousTick=first.tick,maxMove=0,atRamp=false,firstOutsideStep=null;
 for(let i=0;i<data.steps.length;i++){
  const step=data.steps[i],after=step.after;
  ok(step.realKey==='KeyW'&&step.nativeInputTicks>=1&&
   step.nativeInputTicks<=4&&
   Number.isSafeInteger(step.actualNativeTickDelta)&&
   step.actualNativeTickDelta>0&&
   step.actualNativeTickDelta<=24&&
   after?.source===source&&
   after.tick>previousTick&&
   after.originalRows?.length===17&&
   after.sourceActorRelocations===0&&
   after.sourceInkRewritten===false&&
   after.playerPositionRewritten===false&&
   Array.isArray(after.actualBodyMeters)&&
   after.actualBodyMeters.length===3&&
   after.actualBodyMeters.every(Number.isFinite),
   'REAL_KEY_NATIVE_KCC_AND_17_SOURCE_LEDGER_'+i);
  const margin=step.nativeOriginalRampQuadMargin;
  ok(margin?.source===source&&
   Number.isFinite(margin.signedOriginalRampMarginMeters)&&
   margin.certifiedWalkRoute===false&&
   margin.originalQuadPhysicalFootProven===false,
   'EXACT_ORIGINAL_BOUNDARY_NOT_PHYSICAL_PROOF_'+i);
  const dist=Math.hypot(after.actualBodyMeters[0]-first.actualBodyMeters[0],
   after.actualBodyMeters[2]-first.actualBodyMeters[2]);
  maxMove=Math.max(maxMove,dist);
  const row=after.originalRows.find(x=>x.surfaceId===ramp+':paint');
  ok(!!row,'RAMP_ORIGINAL_PAINT_SURFACE_ID_'+i);
  const actual=dist>=.5&&
   after.realHumanOriginalFootSupported===true&&
   after.genuineHumanOriginalFootSolid===ramp&&
   row.actualHumanFootOnOriginalActiveSurface===true;
  if(actual)atRamp=true;
  if(firstOutsideStep===null&&
   after.realHumanOriginalFootSupported!==true)
   firstOutsideStep=i+1;
  previousTick=after.tick;
 }
 ok((data.reachedOriginalRampOnGenuineCharacterKcc===true)===atRamp,
  'DISAGREES_WITH_LIVE_NATIVE_KCC_WITNESS');
 const verdict=atRamp?'PASS_TRUE_ORIGINAL_RAMP_HUMAN_KCC':
  'HOLD_ORIGINAL_RAMP_PHYSICAL_SUPPORT_NOT_PROVEN';
 return {schema:'B319_INDEPENDENT_ORIGINAL_RAMP_WALK_CLASSIFICATION',
  verdict,source,
  observedRealKccSteps:data.steps.length,
  actualMaximumDisplacementMeters:maxMove,
  unsupportedFirstActualStep:firstOutsideStep,
  originalRampSolidReached:atRamp,
  noInjectedStageSolids:true,noInjectedInputTicks:true,
  original4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];
 ok(typeof file==='string'&&file.endsWith('.json'),
  'PATH_TO_AUTHENTIC_KCC_JSON_REQUIRED');
 const evidence=JSON.parse(readFileSync(file,'utf8'));
 const result=classifyB319GenuineOriginalRampWalk(evidence);
 const output=resolve(file,'..','b319-independent-real-ramp-kcc-classification.json');
 writeFileSync(output,JSON.stringify(result,null,2));
 console.log('B319_INDEPENDENT_REAL_RAMP_WALK_VERDICT',JSON.stringify(result));
}
