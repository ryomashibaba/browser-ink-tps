#!/usr/bin/env node
/** B433: original SOURCE opponent distances from actual B409 native browser polls.
 * HALF-SECOND polling observations, NOT every native 60Hz tick and NOT
 * authorization for a traversal, combat, turf winner or 4v4 production. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const gate=(v,why)=>{if(!v)throw Error('B433_TRUE_SOURCE_POLL_HOLD_'+why)};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const pos=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);

/** Use read-only window.__t21F3.snapshot() from an already running game. */
export function b433CaptureReadOnlySourcePoll(n){
 gate(n?.originalSourceSolids===25&&n.originalPaintSurfaces===17&&
  n.originalSourceNavigationLinks===26&&n.sourceScoreablePromotions===0&&
  n.productionAuthorized===false&&n.unrestricted4v4Certified===false&&
  n.cpu?.physicalFootRelocations===0&&
  n.cpu?.physicalRejoins?.length===7&&
  Array.isArray(n.cpu?.cpu)&&n.cpu.cpu.length===7&&
  Number.isSafeInteger(n.tick)&&n.tick>=0&&
  finite(n.timeRemainingSeconds)&&n.timeRemainingSeconds>=0&&
  n.timeRemainingSeconds<=180&&pos(n.player?.position)&&
  Number.isSafeInteger(n.shotsFired)&&n.shotsFired>=0&&
  Number.isSafeInteger(n.cpuSourceTurfShots)&&n.cpuSourceTurfShots>=0&&
  Number.isSafeInteger(n.humanCpuDirectHits)&&n.humanCpuDirectHits>=0&&
  Number.isSafeInteger(n.humanCpuDirectSplats)&&n.humanCpuDirectSplats>=0&&
  ['PLAYING','TIME_UP'].includes(n.matchState),'SOURCE_AND_CLOCK');
 const actors=n.cpu.cpu.map(b=>({
  id:b.id,foot:b.physicalFoot,lifeState:b.lifeState,hp:b.hp,
  rejoined:b.rejoined
 }));
 gate(actors.map(a=>a.id).sort().join(',')===ids.join(',')&&
  actors.every(a=>pos(a.foot)&&a.rejoined===true&&
   ['ACTIVE','SPLATTED'].includes(a.lifeState)&&finite(a.hp)&&
   a.hp>=0),'TRUE_CPU_ACTORS');
 return {tick:n.tick,remaining:n.timeRemainingSeconds,phase:n.matchState,
  paused:n.paused===true,player:n.player.position,actors,
  shots:n.shotsFired,cpuShotRequests:n.cpuSourceTurfShots,
  humanCpuDirectHits:n.humanCpuDirectHits,
  humanCpuDirectSplats:n.humanCpuDirectSplats};
}

/** Independently recompute true sampled horizontal distance from all polls. */
export function b433AuditOriginalOpponentPolls(d){
 gate(d?.schema==='B433_SOURCE_NATIVE_BROWSER_POLL_SAMPLES'&&
  d.source==='25/17/26/0'&&d.nativeObserverOnly===true&&
  d.syntheticTicks===false&&d.actorWrites===0&&
  d.inkWrites===0&&d.scoreWrites===0&&d.nativeClockWrites===0&&
  d.pointerOrInputWrites===0&&d.originalScoreable===0&&
  d.officialWinner==='NONE'&&
  Array.isArray(d.polls)&&d.polls.length>=7&&
  d.polls.length<=4096,'AUTHORITY');
 const origin=d.browserWorldOrigin;
 gate(finite(origin)&&origin>0,'BROWSER_ORIGIN');
 let lastTick=-1,prevRemaining=181,maximumTickGap=0;
 let closestHuman=null,closestCpuPair=null;
 let totalActiveOpposingPolls=0;
 for(let i=0;i<d.polls.length;i++){
  const p=d.polls[i];
  gate(Number.isSafeInteger(p.tick)&&p.tick>lastTick&&
   p.tick>=0&&finite(p.remaining)&&p.remaining>=0&&
   p.remaining<=180&&p.remaining<=prevRemaining+.001&&
   pos(p.player)&&Array.isArray(p.actors)&&p.actors.length===7&&
   p.actors.map(a=>a.id).sort().join(',')===ids.join(',')&&
   p.actors.every(a=>pos(a.foot)&&a.rejoined===true&&
    ['ACTIVE','SPLATTED'].includes(a.lifeState)&&
    finite(a.hp)&&a.hp>=0)&&
   Number.isSafeInteger(p.shots)&&p.shots>=0&&
   Number.isSafeInteger(p.cpuShotRequests)&&p.cpuShotRequests>=0&&
   Number.isSafeInteger(p.humanCpuDirectHits)&&p.humanCpuDirectHits>=0&&
   Number.isSafeInteger(p.humanCpuDirectSplats)&&p.humanCpuDirectSplats>=0&&
   p.phase===(i===d.polls.length-1?'TIME_UP':'PLAYING')&&
   p.paused===(i===d.polls.length-1),'NATIVE_POLL_'+i);
  if(lastTick>=0)maximumTickGap=Math.max(maximumTickGap,p.tick-lastTick);
  lastTick=p.tick;prevRemaining=p.remaining;
  const active=p.actors.filter(x=>x.lifeState==='ACTIVE');
  const friends=active.filter(x=>x.id.startsWith('A'));
  const opponents=active.filter(x=>x.id.startsWith('B'));
  if(opponents.length){
   totalActiveOpposingPolls++;
   for(const b of opponents){
    const dist=distance(p.player,b.foot);
    if(!closestHuman||dist<closestHuman.meters)
     closestHuman={tick:p.tick,enemyId:b.id,meters:dist};
   }
   for(const a of friends)for(const b of opponents){
    const dist=distance(a.foot,b.foot);
    if(!closestCpuPair||dist<closestCpuPair.meters)
     closestCpuPair={tick:p.tick,allyId:a.id,enemyId:b.id,meters:dist};
   }
  }
 }
 const end=d.polls.at(-1);
 gate(end.remaining===0&&d.polls[0].remaining>120&&
  end.tick-d.polls[0].tick>7000&&
  totalActiveOpposingPolls>0&&closestHuman!==null&&
  closestCpuPair!==null,'ORIGINAL_180S_POLL_SPAN');
 return {schema:'B433_INDEPENDENT_ORIGINAL_OPPONENT_POLL_AUDIT',
  verdict:'PASS_REAL_SAMPLED_SOURCE_OPPONENT_DISTANCES_NO_ROUTE_CLAIM',
  browserWorldOrigin:origin,originalSource:'25/17/26/0',
  polls:d.polls.length,
  observedFirstTick:d.polls[0].tick,observedTimeUpTick:end.tick,
  observedNativeTickSpan:end.tick-d.polls[0].tick,
  largestUnobservedNativeTickGap:maximumTickGap-1,
  closestSampledHumanEnemy:closestHuman,
  closestSampledAllyCpuEnemyCpu:closestCpuPair,
  actualHumanDirectHitsAtTimeUp:end.humanCpuDirectHits,
  actualHumanDirectSplatsAtTimeUp:end.humanCpuDirectSplats,
  actualHumanShotsAtTimeUp:end.shots,
  actualCpuShotRequestsAtTimeUp:end.cpuShotRequests,
  allNativeTicksObserved:false,
  betweenPollsEnemyEncounterResolved:false,
  enemyRouteOrHitCertified:false,full4v4Certified:false,
  originalScoreable:0,officialWinner:'NONE',
  productionAuthorized:false,artAccepted:false,
  sourceOrGameplayWrites:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const path=process.argv[2];gate(path?.endsWith('.json'),'FILE');
 const report=b433AuditOriginalOpponentPolls(
  JSON.parse(readFileSync(path,'utf8')));
 writeFileSync(resolve(path,'..','b433-independent-native-opponent-poll.json'),
  JSON.stringify(report,null,2)+'\n');
 console.log('B433_REAL_ORIGINAL_OPPONENT_POLL',JSON.stringify(report));
}
