#!/usr/bin/env node
/** B320: ORIGINAL four-vertex ramp's 2D basis, physically verifiable
 * uphill traversal. A geometric interior target is NOT a KCC path proof.
 * Zero original collision/nav/ink/body edits. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT='UndertowT21D:';
export const RAMP_SOLID=ROOT+'right-low-route-ramp-positive-z';
export const RAMP_PAINT=RAMP_SOLID+':paint';
export const LANDING_SOLID=ROOT+'first-drop-landing-positive-z';
const finite3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const wrap=x=>((x+540)%360)-180;
const check=(v,message)=>{if(!v)throw Error('B320_INVALID_ORIGINAL_RAMP_'+message)};
export function b320SourceRampCoordinates(quad,point){
 check(quad?.id==='right-low-route-ramp-positive-z'&&
  quad.sourceObject==='Fld_Temple01_pCube21569_1__FloorConcrete03'&&
  Array.isArray(quad.vertices)&&quad.vertices.length===4&&
  quad.vertices.every(finite3)&&finite3(point),'FOUR_TRUE_SOURCE_VERTICES');
 const [hiA,hiB,loA,loB]=quad.vertices;
 check(Math.abs(loA[1]-loB[1])<.001&&
  Math.abs(hiA[1]-hiB[1])<.001&&
  Math.abs((hiA[0]-loA[0])-(hiB[0]-loB[0]))<.001&&
  Math.abs((hiA[2]-loA[2])-(hiB[2]-loB[2]))<.001&&
  hiB[1]>loB[1]+1,'SAME_REGISTERED_SOURCE_RAMP');
 const w=[loA[0]-loB[0],loA[2]-loB[2]];
 const u=[hiB[0]-loB[0],hiB[2]-loB[2]];
 const det=w[0]*u[1]-w[1]*u[0];
 check(Math.abs(det)>1,'NONDEGENERATE_ORIGINAL_QUAD');
 const dx=point[0]-loB[0],dz=point[2]-loB[2];
 const alongWidth=(dx*u[1]-dz*u[0])/det;
 const alongUphill=(w[0]*dz-w[1]*dx)/det;
 const expectedSourcePlaneY=loB[1]+(hiB[1]-loB[1])*alongUphill;
 return {originalWidthFraction:alongWidth,
  originalUphillFraction:alongUphill,
  expectedOriginalSourcePlaneY:expectedSourcePlaneY,
  insideSourceQuadXZ:alongWidth>=-1e-5&&alongWidth<=1+1e-5&&
   alongUphill>=-1e-5&&alongUphill<=1+1e-5,
  physicalSupportProven:false,certifiedCrossing:false};
}
export function b320PlanOriginalTrueRampUphill({ledger,camera}){
 check(ledger?.source==='25/17/26/0'&&
  ledger.realHumanOriginalFootSupported===true&&
  ledger.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  finite3(ledger.actualBodyMeters)&&
  Number.isFinite(camera?.yawDegrees)&&
  ledger.sourceActorRelocations===0,'TRUE_HUMAN_RAMP_KCC_START');
 const quad=ledger.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,ledger.actualBodyMeters);
 check(start.insideSourceQuadXZ,'REAL_HUMAN_BODY_INSIDE_RAMP_POLYGON');
 const [hiA,hiB,loA,loB]=quad.vertices;
 const u=Math.min(.55,Math.max(.35,start.originalWidthFraction));
 const v=Math.min(.72,Math.max(.36,start.originalUphillFraction+.29));
 const target=loB.map((n,i)=>n+u*(loA[i]-n)+v*(hiB[i]-n));
 const targetCoord=b320SourceRampCoordinates(quad,target);
 check(targetCoord.insideSourceQuadXZ&&
  targetCoord.originalUphillFraction>start.originalUphillFraction+.12,
  'CANDIDATE_MUST_BE_INTERIOR_AND_UPHILL');
 const dx=target[0]-ledger.actualBodyMeters[0];
 const dz=target[2]-ledger.actualBodyMeters[2];
 const distance=Math.hypot(dx,dz);
 const targetYaw=Math.atan2(dx,-dz)*180/Math.PI;
 const mouseX=Math.round(wrap(targetYaw-camera.yawDegrees)/.22);
 const screenX=800+mouseX;
 return {schema:'B320_ORIGINAL_SOURCE_UPHILL_KCC_PLAN',
  source:'25/17/26/0',target,
  startCoordinate:start,targetCoordinate:targetCoord,
  distance,targetYaw,mouseX,screenX,
  safe:distance>.45&&distance<5&&Math.abs(mouseX)<=720&&
   screenX>=10&&screenX<=1590,
  geometricPlanIsNotPhysics:true,
  noAddedNavLinkOrCollider:true,original4v4Certified:false};
}
export function b320AuditActualNativeRampAscent(payload){
 const f=payload?.first,s=payload?.steps;
 check(payload?.schema==='B320_TRUE_CDP_ORIGINAL_RAMP_ASCENT'&&
  payload.source==='25/17/26/0'&&
  payload.productionAuthorized===false&&
  payload.original4v4Certified===false&&payload.artAccepted===false,
  'TRUE_NONPRODUCTION_SOURCE_AUTHORITY');
 check(f?.source==='25/17/26/0'&&finite3(f.actualBodyMeters)&&
  f.realHumanOriginalFootSupported===true&&
  f.genuineHumanOriginalFootSolid===RAMP_SOLID&&
  f.sourceActorRelocations===0&&f.sourceInkRewritten===false&&
  f.playerPositionRewritten===false&&f.originalRows?.length===17,
  'ACTUAL_KCC_RAMP_START');
 const quad=f.originalPositiveRampSourceQuad;
 const start=b320SourceRampCoordinates(quad,f.actualBodyMeters);
 check(start.insideSourceQuadXZ,'START_INSIDE_SOURCE_RAMP');
 check(Array.isArray(s)&&s.length<=14,'BOUNDED_PHYSICAL_STEPS');
 let lastTick=f.tick,highest=0,furthest=0,allSupported=true;
 let actualSupportedRampSteps=0;
 const positions=[];
 for(let i=0;i<s.length;i++){
  const step=s[i],a=step?.after;
  check(step.realKey==='KeyW'&&
   Number.isSafeInteger(step.nativeInputTicks)&&
   step.nativeInputTicks>=1&&step.nativeInputTicks<=4&&
   Number.isSafeInteger(step.actualNativeTickDelta)&&
   step.actualNativeTickDelta>=1&&step.actualNativeTickDelta<=24&&
   a?.source==='25/17/26/0'&&a.tick>lastTick&&
   a.sourceActorRelocations===0&&
   a.sourceInkRewritten===false&&
   a.playerPositionRewritten===false&&
   a.originalRows?.length===17&&finite3(a.actualBodyMeters),
   'GENUINE_SHORT_NATIVE_KCC_STEP_'+i);
  const p=b320SourceRampCoordinates(quad,a.actualBodyMeters);
  const yGain=a.actualBodyMeters[1]-f.actualBodyMeters[1];
  const uphillGain=p.originalUphillFraction-start.originalUphillFraction;
  const painted=a.originalRows.find(row=>row.surfaceId===RAMP_PAINT);
  const grounded=a.realHumanOriginalFootSupported===true&&
   a.genuineHumanOriginalFootSolid===RAMP_SOLID&&
   painted?.actualHumanFootOnOriginalActiveSurface===true&&
   p.insideSourceQuadXZ;
  if(grounded){actualSupportedRampSteps++;highest=Math.max(highest,yGain);
   furthest=Math.max(furthest,uphillGain);}
  else allSupported=false;
  positions.push({nativeTick:a.tick,realBody:a.actualBodyMeters,
   sourceRampWidthFraction:p.originalWidthFraction,
   sourceUphillFraction:p.originalUphillFraction,
   actualBodyHeightGainMeters:yGain,
   actualKccSourceRampFootSupported:grounded,
   realRapierSolid:a.genuineHumanOriginalFootSolid});
  lastTick=a.tick;
 }
 const accepted=allSupported&&actualSupportedRampSteps>=3&&
  highest>=.2&&furthest>=.13;
 return {schema:'B320_INDEPENDENT_TRUE_SOURCE_RAMP_UPHILL',
  verdict:accepted?'PASS_GENUINE_ORIGINAL_RAMP_UPHILL_KCC':
   'HOLD_UPHILL_PHYSICAL_SUPPORT_OR_ASCENT_NOT_PROVEN',
  source:'25/17/26/0',
  actualNativeKccSteps:s.length,
  supportedNativeRampSteps:actualSupportedRampSteps,
  continuouslyGenuineRampSupported:allSupported,
  actualMaximumHumanBodyHeightGainMeters:highest,
  originalRampUphillFractionGained:furthest,
  positions,originalStageSolidsAdded:0,originalNavigationLinksAdded:0,
  original4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const filename=process.argv[2];
 check(typeof filename==='string'&&filename.endsWith('.json'),
  'REAL_BROWSER_ARTIFACT_REQUIRED');
 const payload=JSON.parse(readFileSync(filename,'utf8'));
 const verdict=b320AuditActualNativeRampAscent(payload);
 writeFileSync(resolve(filename,'..','b320-independent-true-uphill-verdict.json'),
  JSON.stringify(verdict,null,2));
 console.log('B320_INDEPENDENT_NATIVE_RAMP_ASCENT',JSON.stringify({
  verdict:verdict.verdict,
  steps:verdict.actualNativeKccSteps,
  gain:verdict.actualMaximumHumanBodyHeightGainMeters,
  source:'25/17/26/0'}));
}
