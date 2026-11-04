#!/usr/bin/env node
/** Real B433 browser-poll frontline audit; read-only, never stage/CPU authority. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const names=['A1','A2','A3','B1','B2','B3','B4'];
const finite3=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const guard=(ok,tag)=>{if(!ok)throw Error('F4_REAL_FRONTLINE_HOLD_'+tag)};
const horizontal=(p,q)=>Math.hypot(p[0]-q[0],p[2]-q[2]);
export function auditNativeFrontlinePolls(data){
 guard(data?.schema==='B433_SOURCE_NATIVE_BROWSER_POLL_SAMPLES'&&
  data.source==='25/17/26/0'&&data.nativeObserverOnly===true&&
  data.syntheticTicks===false&&data.actorWrites===0&&
  data.inkWrites===0&&data.scoreWrites===0&&data.nativeClockWrites===0&&
  data.pointerOrInputWrites===0&&data.originalScoreable===0&&
  data.officialWinner==='NONE'&&Number.isFinite(data.browserWorldOrigin)&&
  data.browserWorldOrigin>0&&Array.isArray(data.polls)&&data.polls.length>=2,
  'SOURCE_PROVENANCE');
 const state=Object.fromEntries(names.map(id=>[id,{samples:0,minimumZ:Infinity,
  maximumZ:-Infinity,minimumHp:Infinity,observedSplatted:0,
  observedInsideAbsZ33:0,travelLowerBoundMeters:0,previous:null}]));
 let previousTick=-1,maxUnobservedTickGap=0;
 let nearestHumanEnemy={tick:null,id:null,meters:Infinity};
 let nearestCpuEnemy={tick:null,ally:null,enemy:null,meters:Infinity};
 for(const sample of data.polls){
  guard(Number.isSafeInteger(sample?.tick)&&sample.tick>previousTick&&
   sample.tick>=0&&finite3(sample.player)&&
   ['PLAYING','TIME_UP'].includes(sample.phase)&&
   Array.isArray(sample.actors)&&sample.actors.length===7&&
   Number.isSafeInteger(sample.shots)&&sample.shots>=0&&
   Number.isSafeInteger(sample.cpuShotRequests)&&sample.cpuShotRequests>=0,
   'AUTHENTIC_SAMPLE');
  if(previousTick>=0)maxUnobservedTickGap=Math.max(maxUnobservedTickGap,
    sample.tick-previousTick-1);
  previousTick=sample.tick;
  const map=new Map();
  for(const actor of sample.actors){
   guard(names.includes(actor?.id)&&!map.has(actor.id)&&finite3(actor.foot)&&
    ['ACTIVE','SPLATTED'].includes(actor.lifeState)&&
    Number.isFinite(actor.hp)&&actor.hp>=0&&actor.hp<=100&&
    typeof actor.rejoined==='boolean','AUTHENTIC_CPU');
   map.set(actor.id,actor);
  }
  guard(map.size===7,'SEVEN_CPU_INVENTORY');
  for(const id of names){
   const a=map.get(id),s=state[id];
   s.samples++;
   s.minimumZ=Math.min(s.minimumZ,a.foot[2]);
   s.maximumZ=Math.max(s.maximumZ,a.foot[2]);
   s.minimumHp=Math.min(s.minimumHp,a.hp);
   if(a.lifeState==='SPLATTED')s.observedSplatted++;
   if(Math.abs(a.foot[2])<33)s.observedInsideAbsZ33++;
   if(s.previous)s.travelLowerBoundMeters+=horizontal(s.previous,a.foot);
   s.previous=a.foot;
  }
  for(const e of ['B1','B2','B3','B4']){
   const b=map.get(e).foot,hd=horizontal(sample.player,b);
   if(hd<nearestHumanEnemy.meters)
    nearestHumanEnemy={tick:sample.tick,id:e,meters:hd};
   for(const a of ['A1','A2','A3']){
    const d=horizontal(map.get(a).foot,b);
    if(d<nearestCpuEnemy.meters)
     nearestCpuEnemy={tick:sample.tick,ally:a,enemy:e,meters:d};
   }
  }
 }
 const cpu=Object.fromEntries(names.map(id=>{
  const s=state[id];const {previous,...rest}=s;
  return [id,{...rest,mostForwardZ:id.startsWith('A')?s.minimumZ:s.maximumZ}];
 }));
 return {schema:'F4_REAL_CPU_FRONTLINE_OBSERVATION_V1',
  verdict:'PASS_READ_ONLY_NATIVE_CPU_FRONTLINE_MEASUREMENT_NOT_ROUTE_CERTIFICATION',
  originalSource:'25/17/26/0',polls:data.polls.length,
  firstNativeTick:data.polls[0].tick,lastNativeTick:previousTick,
  largestUnobservedTickGap:maxUnobservedTickGap,
  nearestObservedHumanEnemy:nearestHumanEnemy,
  nearestObservedCpuEnemy:nearestCpuEnemy,cpu,
  observedCpuInsideAbsZ33:names.reduce((n,id)=>n+cpu[id].observedInsideAbsZ33,0),
  samplePointsOnly:true,betweenPollMotionUnknown:true,
  endpointDoesNotProveCapsuleRoute:true,enemyHitCertified:false,
  crossTeamPhysicalRouteCertified:false,sourceScoreable:0,
  officialWinner:'NONE',formal4v4Certified:false,productionAuthorized:false,
  actorWrites:0,scoreWrites:0,nativeClockWrites:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 guard(process.argv.length===3&&process.argv[2].endsWith('.json'),'INPUT_FILE');
 console.log(JSON.stringify(auditNativeFrontlinePolls(
  JSON.parse(readFileSync(resolve(process.argv[2]),'utf8'))),null,2));
}
