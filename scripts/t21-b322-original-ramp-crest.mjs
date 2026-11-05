#!/usr/bin/env node
/** B322: original crest and adjacent original upper-floor native KCC proof.
 * World-space ramp guides are NOT gameplay collision or a certified path. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b320SourceRampCoordinates,RAMP_SOLID,RAMP_PAINT}
 from './t21-b320-original-ramp-uphill-kcc.mjs';
export const UPPER_FLOOR_SOLID='UndertowT21D:right-low-team-a';
export const UPPER_FLOOR_PAINT=UPPER_FLOOR_SOLID+':paint';
const finite3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const wrap=x=>((x+540)%360)-180;
const check=(x,s)=>{if(!x)throw Error('B322_NATIVE_ORIGINAL_'+s)};
export function b322PlanActualOriginalCrest(ledger,camera){
 check(ledger?.source==='25/17/26/0'&&finite3(ledger.actualBodyMeters)&&
  ledger.realHumanOriginalFootSupported===true&&
  ledger.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  ledger.sourceActorRelocations===0&&
  Number.isFinite(camera?.yawDegrees),'REAL_HIGH_RAMP_START');
 const quad=ledger.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,ledger.actualBodyMeters);
 check(start.insideSourceQuadXZ&&start.originalUphillFraction>=.60&&
  start.originalUphillFraction<.86,'PHYSICAL_B321_PREREQUISITE');
 const [ha,hb,la,lb]=quad.vertices;
 const u=Math.min(.54,Math.max(.46,start.originalWidthFraction));
 const world=lb.map((v,i)=>v+u*(la[i]-v)+.97*(hb[i]-v));
 const q=b320SourceRampCoordinates(quad,world);
 const dx=world[0]-ledger.actualBodyMeters[0];
 const dz=world[2]-ledger.actualBodyMeters[2];
 const distance=Math.hypot(dx,dz);
 const yaw=Math.atan2(dx,-dz)*180/Math.PI;
 const mx=Math.round(wrap(yaw-camera.yawDegrees)/.22);
 return {schema:'B322_SOURCE_CREST_CAMERA_PLAN',source:'25/17/26/0',
  start,world,coord:q,mouseX:mx,screenX:800+mx,targetYaw:yaw,distance,
  geometryOnly:true,realHumanPathNotInferred:true,
  safe:q.insideSourceQuadXZ&&q.originalUphillFraction>=.96&&
   distance>.4&&distance<4&&Math.abs(mx)<=720&&
   800+mx>=10&&800+mx<=1590};
}
/** B431: decide whether another real KeyS native pulse is permissible.
 * B430 genuine SOURCE ramp entry was v=.697909 with no B322 backstep;
 * it reached the original upper floor after ramp v=.901296 and only
 * 0.311m true measured ascent (<.32m). This permits an additional
 * real physical key pulse, not synthetic support or a softer crest gate.
 */
export function b431CanRefineOriginalPrecrest(ledger){
 if(ledger?.source!=='25/17/26/0'||
    !finite3(ledger.actualBodyMeters)||
    ledger.realHumanOriginalFootSupported!==true||
    ledger.genuineHumanOriginalFootSolid!==RAMP_SOLID||
    !Number.isFinite(ledger.genuineOriginalFootGapMeters)||
    ledger.genuineOriginalFootGapMeters<0||
    ledger.genuineOriginalFootGapMeters>.18||
    ledger.sourceActorRelocations!==0||
    ledger.sourceInkRewritten!==false||
    ledger.playerPositionRewritten!==false||
    ledger.originalRows?.length!==17||
    !ledger.originalRows.some(r=>r.surfaceId===RAMP_PAINT&&
     r.actualHumanFootOnOriginalActiveSurface===true))
  return false;
 try{
  const c=b320SourceRampCoordinates(
   ledger.originalPositiveRampSourceQuad,ledger.actualBodyMeters);
  return c.insideSourceQuadXZ&&
   c.originalUphillFraction>=.685&&
   c.originalUphillFraction<=.77;
 }catch{return false;}
}
/** Require actual original ramp physics and registered paint surface
 * before choosing the earlier short native input pulse. This never
 * authorizes a route or weakens the independent crest/exit audit.
 * RAW original B413 #13380308657 was v=.7668967 with 2-tick coarse
 * input and next sampled v=.8825; the following sample was upper floor. */
export function b322UseFineNativeCrestCadence(ledger){
 if(ledger?.source!=='25/17/26/0'||
    !finite3(ledger.actualBodyMeters)||
    ledger.realHumanOriginalFootSupported!==true||
    ledger.genuineHumanOriginalFootSolid!==RAMP_SOLID||
    !Number.isFinite(ledger.genuineOriginalFootGapMeters)||
    ledger.genuineOriginalFootGapMeters<0||
    ledger.genuineOriginalFootGapMeters>.18||
    ledger.sourceActorRelocations!==0||
    ledger.sourceInkRewritten!==false||
    ledger.playerPositionRewritten!==false||
    ledger.originalRows?.length!==17||
    !ledger.originalRows.some(r=>
     r.surfaceId===RAMP_PAINT&&
     r.actualHumanFootOnOriginalActiveSurface===true))
  return false;
 try{
  const physical=b320SourceRampCoordinates(
   ledger.originalPositiveRampSourceQuad,ledger.actualBodyMeters);
  return physical.insideSourceQuadXZ&&
   physical.originalUphillFraction>=.74&&
   physical.originalUphillFraction<1;
 }catch{return false;}
}
/** Real CDP KeyS before the crest: read only original native KCC proof.
 * B322's >=.32m ascent threshold and genuine 17-grid owner gate unchanged. */
export function b322AuditRealOriginalPreCrestBackstep(before,after,key){
 const original=x=>x?.source==='25/17/26/0'&&
  finite3(x.actualBodyMeters)&&
  x.realHumanOriginalFootSupported===true&&
  x.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  Number.isFinite(x.genuineOriginalFootGapMeters)&&
  x.genuineOriginalFootGapMeters>=0&&x.genuineOriginalFootGapMeters<=.18&&
  x.sourceActorRelocations===0&&x.sourceInkRewritten===false&&
  x.playerPositionRewritten===false&&x.originalRows?.length===17&&
  x.originalRows.some(r=>r.surfaceId===RAMP_PAINT&&
   r.actualHumanFootOnOriginalActiveSurface===true);
 if(key!=='KeyS'||!original(before)||!original(after)||
  !Number.isSafeInteger(before.tick)||!Number.isSafeInteger(after.tick)||
  after.tick<=before.tick||after.tick-before.tick>24)return false;
 const b=b320SourceRampCoordinates(
  before.originalPositiveRampSourceQuad,before.actualBodyMeters);
 const a=b320SourceRampCoordinates(
  before.originalPositiveRampSourceQuad,after.actualBodyMeters);
 const horizontal=Math.hypot(
  after.actualBodyMeters[0]-before.actualBodyMeters[0],
  after.actualBodyMeters[2]-before.actualBodyMeters[2]);
 const heightDelta=after.actualBodyMeters[1]-before.actualBodyMeters[1];
 return b.insideSourceQuadXZ&&a.insideSourceQuadXZ&&
  b.originalUphillFraction>=.70&&b.originalUphillFraction<.86&&
  a.originalUphillFraction>=.60&&a.originalUphillFraction<=.77&&
  b.originalUphillFraction-a.originalUphillFraction>=.02&&
  b.originalUphillFraction-a.originalUphillFraction<=.14&&
  horizontal>=.04&&horizontal<=.8&&
  heightDelta>=-.35&&heightDelta<=.10;
}
export function b322AuditNativeOriginalCrestExit(d){
 check(d?.schema==='B322_REAL_NATIVE_CREST_EXIT'&&
  d.source==='25/17/26/0'&&d.productionAuthorized===false&&
  d.original4v4Certified===false&&d.artAccepted===false,
  'AUTHORITY');
 if(d.prerequisiteB321Passed!==true)return {
  schema:'B322_INDEPENDENT_ORIGINAL_CREST',source:'25/17/26/0',
  verdict:'HOLD_B321_REAL_HIGH_RAMP_PREREQUISITE',
  crestProven:false,originalUpperFloorReached:false};
 const first=d.first,steps=d.steps;
 check(first?.source==='25/17/26/0'&&finite3(first.actualBodyMeters)&&
  first.realHumanOriginalFootSupported===true&&
  first.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  first.sourceActorRelocations===0&&first.sourceInkRewritten===false&&
  first.playerPositionRewritten===false&&first.originalRows?.length===17&&
  Array.isArray(steps)&&steps.length<=26,
  'EXACT_NATIVE_ORIGINAL_KCC_START');
 const quad=first.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,first.actualBodyMeters);
 check(start.insideSourceQuadXZ&&start.originalUphillFraction>=.6&&
  start.originalUphillFraction<.86,'HIGH_RAMP_ORIGIN');
 const standingHeight=first.actualBodyMeters[1]-start.expectedOriginalSourcePlaneY;
 let tick=first.tick,body=first.actualBodyMeters;
 let maxRampV=start.originalUphillFraction,maxAscent=0,
  rampSupportSteps=0,crestProven=false,upperFloorReached=false;
 let badStep=null,phase='RAMP';
 const trace=[];
 for(let i=0;i<steps.length;i++){
  const t=steps[i],s=t?.after;
  check(t?.realKey==='KeyW'&&['RAMP','EXIT'].includes(t.phase)&&
   Number.isSafeInteger(t.nativeInputTicks)&&
   t.nativeInputTicks>=1&&t.nativeInputTicks<=3&&
   Number.isSafeInteger(t.actualNativeTickDelta)&&
   t.actualNativeTickDelta>=1&&t.actualNativeTickDelta<=24&&
   s?.source==='25/17/26/0'&&s.tick>tick&&
   finite3(s.actualBodyMeters)&&s.originalRows?.length===17&&
   s.sourceActorRelocations===0&&s.sourceInkRewritten===false&&
   s.playerPositionRewritten===false,'REAL_ORIGINAL_INPUT_'+i);
  check(t.phase===phase||(phase==='RAMP'&&t.phase==='EXIT'&&
   crestProven),'NO_EXIT_WITHOUT_PROVEN_CREST');
  phase=t.phase;
  const c=b320SourceRampCoordinates(quad,s.actualBodyMeters);
  const planar=Math.hypot(s.actualBodyMeters[0]-body[0],
   s.actualBodyMeters[2]-body[2]);
  const vertical=Math.abs(s.actualBodyMeters[1]-body[1]);
  const goodStep=planar<=.8&&vertical<=.35&&
   s.realHumanOriginalFootSupported===true&&
   Number.isFinite(s.genuineOriginalFootGapMeters)&&
   s.genuineOriginalFootGapMeters>=0&&
   s.genuineOriginalFootGapMeters<=.18;
  const ramp=goodStep&&c.insideSourceQuadXZ&&
   s.genuineHumanOriginalFootSolid===RAMP_SOLID&&
   s.originalRows.some(r=>r.surfaceId===RAMP_PAINT&&
    r.actualHumanFootOnOriginalActiveSurface===true)&&
   Math.abs(s.actualBodyMeters[1]-
    c.expectedOriginalSourcePlaneY-standingHeight)<=.16;
  const floor=goodStep&&
   s.genuineHumanOriginalFootSolid===UPPER_FLOOR_SOLID&&
   s.originalRows.some(r=>r.surfaceId===UPPER_FLOOR_PAINT&&
    r.actualHumanFootOnOriginalActiveSurface===true)&&
   c.originalUphillFraction>=.90&&
   Math.abs(s.actualBodyMeters[1]-4.5-standingHeight)<=.2;
  if(!ramp&&!floor&&badStep===null)badStep=i+1;
  if(ramp&&badStep===null){
   rampSupportSteps++;
   maxRampV=Math.max(maxRampV,c.originalUphillFraction);
   maxAscent=Math.max(maxAscent,s.actualBodyMeters[1]-
    first.actualBodyMeters[1]);
   if(rampSupportSteps>=3&&maxRampV>=.90&&maxAscent>=.32)
    crestProven=true;
  }
  if(floor&&crestProven&&badStep===null)upperFloorReached=true;
  trace.push({step:i+1,phase:t.phase,tick:s.tick,
   originalFootSolid:s.genuineHumanOriginalFootSolid,
   body:s.actualBodyMeters,originalUphillFraction:c.originalUphillFraction,
   trueRampSupport:ramp,trueOriginalUpperFloorSupport:floor,
   realPlanarMeters:planar,realVerticalMeters:vertical});
  tick=s.tick;body=s.actualBodyMeters;
 }
 const crest=crestProven&&badStep===null;
 const exit=crest&&upperFloorReached;
 return {schema:'B322_INDEPENDENT_ORIGINAL_CREST',
  verdict:exit?'PASS_REAL_ORIGINAL_RAMP_TO_UPPER_FLOOR':
   crest?'PASS_REAL_ORIGINAL_RAMP_CREST_ONLY_EXIT_HOLD':
   'HOLD_NO_TRUE_ORIGINAL_CREST_SUPPORT',
  source:'25/17/26/0',crestProven:crest,originalUpperFloorReached:exit,
  originalRampFraction:maxRampV,actualHeightGainMeters:maxAscent,
  genuineRampKccSteps:rampSupportSteps,
  totalNativeObservedKeySteps:steps.length,
  firstUnsupportedNativeStep:badStep,trace,
  originalSolidsAdded:0,navLinksAdded:0,actorTeleports:0,
  original4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];check(file?.endsWith('.json'),'ARTIFACT_REQUIRED');
 const d=JSON.parse(readFileSync(file,'utf8'));
 const x=b322AuditNativeOriginalCrestExit(d);
 writeFileSync(resolve(file,'..','b322-independent-original-crest-verdict.json'),
  JSON.stringify(x,null,2));
 console.log('B322_INDEPENDENT_REAL_CREST',JSON.stringify({
  verdict:x.verdict,crest:x.crestProven,exit:x.originalUpperFloorReached}));
 if(x.crestProven!==true)process.exitCode=1;
}
