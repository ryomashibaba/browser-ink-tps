#!/usr/bin/env node
/** B336: offline, read-only quality audit of an already captured real B335 run.
 * Never converts the native 180s technical PASS into gameplay, ART or 4v4 PASS.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b335VerifyNativeRound} from './t21-b335-real-180s-guard.mjs';

const requireValue=(ok,code)=>{if(!ok)throw Error('B336_EVIDENCE_'+code);};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const finite3=x=>Array.isArray(x)&&x.length===3&&x.every(finite);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const rounded=(n,d=3)=>Number(n.toFixed(d));

export function b336AuditRealGameplay(w){
 const certification=b335VerifyNativeRound(w); // Throws on tampering with source authority or clock.
 requireValue(certification.verdict==='PASS_GENUINE_CHROMIUM_180S_TIME_UP','NO_B335_TECH_PASS');
 const s=w.samples;
 const ids=s[0].actualCpuFootPositions?.map(x=>x.id);
 requireValue(Array.isArray(ids)&&ids.length===7&&new Set(ids).size===7&&
  ids.every(x=>typeof x==='string'&&x.length>0),'CPU_IDENTITIES');
 for(const sample of s){
  requireValue(finite3(sample.actualHumanBody),'HUMAN_NATIVE_COORDINATES');
  const feet=sample.actualCpuFootPositions;
  requireValue(Array.isArray(feet)&&feet.length===7&&
   feet.every((x,i)=>x.id===ids[i]&&finite3(x.foot)),
   'CPU_NATIVE_COORDINATES');
 }
 const activity=s.slice(1).map((cur,i)=>{
  const prev=s[i];
  const cpuInkDelta=cur.cpuInk-prev.cpuInk;
  const humanInkDelta=cur.humanInk-prev.humanInk;
  const humanShotsDelta=cur.humanShots-prev.humanShots;
  const wallSeconds=(cur.wallMs-prev.wallMs)/1000;
  requireValue(cpuInkDelta>=0&&humanInkDelta>=0&&humanShotsDelta>=0&&
    wallSeconds>0,'NONMONOTONIC_ACTIVITY');
  return {remainingFromSeconds:prev.thresholdSeconds,
   remainingToSeconds:cur.thresholdSeconds,
   cpuChangedCellsDelta:cpuInkDelta,
   humanChangedCellsDelta:humanInkDelta,
   humanShotsDelta,
   ciWallSeconds:rounded(wallSeconds)};
 });
 const humanPositions=s.map(x=>x.actualHumanBody);
 const humanSampledTravelLowerBoundMeters=humanPositions.slice(1)
  .reduce((n,p,i)=>n+distance(humanPositions[i],p),0);
 const cpuSnapshotMotion=ids.map((id,j)=>{
  const feet=s.map(x=>x.actualCpuFootPositions[j].foot);
  const steps=feet.slice(1).map((p,i)=>distance(feet[i],p));
  return {id,sampledTravelLowerBoundMeters:rounded(steps.reduce((a,b)=>a+b,0)),
   startToEndDistanceMeters:rounded(distance(feet[0],feet.at(-1))),
   intervalDisplacementsMeters:steps.map(x=>rounded(x))};
 });
 const wallSeconds=(s.at(-1).wallMs-s[0].wallMs)/1000;
 const nativeSeconds=s[0].remainingSeconds-s.at(-1).remainingSeconds;
 const cpuEarlyInk=activity[0].cpuChangedCellsDelta;
 const totalCpuInk=s.at(-1).cpuInk-s[0].cpuInk;
 return {
  schema:'T21_B336_GENUINE_180S_GAMEPLAY_FRONTIER_AUDIT',
  evidenceType:'SAVED_CHROMIUM_CHECKPOINTS_NOT_A_CONTINUOUS_TRAJECTORY',
  technical180sVerdict:certification.verdict,
  source:'25/17/26/0',
  sourceWinner:'NONE',
  gameClockSeconds:rounded(nativeSeconds),
  ciWallSeconds:rounded(wallSeconds),
  ciWallToGameClockRatio:rounded(wallSeconds/nativeSeconds),
  headlessPerformanceNotPlayerFps:true,
  human:{sampledTravelLowerBoundMeters:rounded(humanSampledTravelLowerBoundMeters),
   changedCellsAtExpiry:s.at(-1).humanInk,shotsAtExpiry:s.at(-1).humanShots,
   intervalsWithNewInk:activity.filter(a=>a.humanChangedCellsDelta>0).length},
  cpu:{actorCount:7,changedCellsAtExpiry:s.at(-1).cpuInk,
   first30SecondWindowShareOfObservedChangesPercent:totalCpuInk>0?
    rounded(100*cpuEarlyInk/totalCpuInk,2):null,
   snapshotMotion:cpuSnapshotMotion},
  activityWindows:activity,
  limits:[
   'Human movement is zero only across the seven saved positions; B335 does not send WASD input.',
   'CPU snapshot travel is a lower bound and does not certify routes, collision-free paths or natural play.',
   'Changed ink cells are not unique Turf score or an official winner.',
   'Software-rendered GitHub CI wall time cannot be used as end-user FPS.',
   'Original combat hits, opponent interactions, continuous FPS and ART quality are not certified by these checkpoints.'
  ],
  diagnostics:{
   noObservedHumanTravel:humanSampledTravelLowerBoundMeters<0.001,
   humanInkOnlyFirstWindow:activity[0].humanChangedCellsDelta>0&&activity.slice(1).every(a=>a.humanChangedCellsDelta===0),
   cpuPaintMoreThan90PercentFirstWindow:totalCpuInk>0&&cpuEarlyInk/totalCpuInk>0.9,
   someCpuSampledNetDisplacementBelow2m:cpuSnapshotMotion.some(x=>x.startToEndDistanceMeters<2),
   ciWallClockMoreThan5xGameClock:wallSeconds/nativeSeconds>5
  },
  authority:{gameplayCertified:false,artCertified:false,
   unrestricted4v4Certified:false,productionAuthorized:false,
   crossTeamRoutesCertified:'0/12',sourceAuthorityHold:true,
   status:'GAMEPLAY_HOLD_ART_HOLD_SOURCE_ROUTE_HOLD'}
 };
}

export function b336ReadAndAudit(jsonPath,expectedSha256){
 const stored=readFileSync(jsonPath);
 const raw=String(jsonPath).endsWith('.json.gz.b64')?
  gunzipSync(Buffer.from(stored.toString('utf8').trim(),'base64')):stored;
 const actualHash=createHash('sha256').update(raw).digest('hex');
 requireValue(actualHash===expectedSha256,'REAL_ARTIFACT_SHA256_MISMATCH');
 return b336AuditRealGameplay(JSON.parse(raw.toString('utf8')));
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const evidence=process.argv[2],manifestPath=process.argv[3],output=process.argv[4];
 requireValue(evidence&&manifestPath&&output,'CLI_EXPECTS_EVIDENCE_MANIFEST_OUTPUT');
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
 requireValue(manifest.sourceRunId===40878994476&&
  manifest.headSha==='48cd94c451ce327a79ba53d66af43d58ae8b0e43'&&
  manifest.sourceArtifactId===12901783202,'ORIGIN_MANIFEST_MISMATCH');
 const result=b336ReadAndAudit(evidence,manifest.realRoundJsonSha256);
 writeFileSync(output,JSON.stringify({origin:manifest, ...result},null,2)+'\n');
 console.log('B336_REAL_GAMEPLAY_FRONTIER',JSON.stringify({
  technical180sVerdict:result.technical180sVerdict,
  ciWallToGameClockRatio:result.ciWallToGameClockRatio,
  human:result.human,diagnostics:result.diagnostics,authority:result.authority
 }));
}
