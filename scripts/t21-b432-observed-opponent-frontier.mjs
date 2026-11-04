#!/usr/bin/env node
/** B432: inspect genuine B409 7-CPU SOURCE round without altering gameplay.
 * Euclidean XZ proximity at seven sampled native ticks, NOT proof that
 * opponents met (or did not meet) between those samples. No score authority. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const fail=x=>{throw Error('B432_ORIGINAL_OPPONENT_FRONTIER_HOLD_'+x)};
const ok=(v,x)=>{if(!v)fail(x)};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const foot=x=>Array.isArray(x)&&x.length===3&&x.every(finite);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const labels=['AFTER_ROUTE','150','120','90','60','30','0'];
const ids=['A1','A2','A3','B1','B2','B3','B4'];
export function auditB432ObservedOriginalOpponentFrontier(data){
 ok(data?.schema==='B409_GENUINE_B322_ROUTE_AND_FULL_180S_ONE_SOURCE_GAME'&&
  data.source==='25/17/26/0'&&data.nativeKeyboardMouse===true&&
  data.sameBrowserWorld===true&&data.syntheticTicks===false&&
  data.syntheticPlayerOrCpuMoves===false&&
  data.syntheticPaintOrScore===false&&
  data.originalSourceStageModified===false&&
  data.officialWinner==='NONE'&&
  Array.isArray(data.samples)&&data.samples.length===7,'RAW_AUTHORITY');
 const measured=[];
 let lastTick=-1,firstOrigin=null;
 for(let i=0;i<7;i++){
  const s=data.samples[i],c=s?.cpu;
  ok(s?.label===labels[i]&&Number.isSafeInteger(s.tick)&&s.tick>lastTick&&
   s.matchState===(i===6?'TIME_UP':'PLAYING')&&
   s.originalSourceSolids===25&&s.originalPaintSurfaces===17&&
   s.originalSourceNavigationLinks===26&&s.scoreable===0&&
   s.productionAuthorized===false&&
   s.unrestricted4v4Certified===false&&
   s.turfResult==='UNAVAILABLE_SOURCE_SCORE_MASK_NOT_AUTHORIZED'&&
   s.cpuRelocations===0&&s.cpuRejoined===7&&
   s.browserWorldOrigin>0&&
   (firstOrigin===null||firstOrigin===s.browserWorldOrigin)&&
   foot(s.player)&&Array.isArray(c)&&c.length===7&&
   c.map(b=>b.id).sort().join(',')===ids.join(',')&&
   c.every(b=>foot(b.foot)&&b.rejoined===true&&
    (b.lifeState==='ACTIVE'||b.lifeState==='SPLATTED')&&
    finite(b.hp))&&
   Number.isSafeInteger(s.humanShots)&&s.humanShots>=0&&
   Number.isSafeInteger(s.cpuSourceShots)&&s.cpuSourceShots>=0&&
   Number.isSafeInteger(s.humanCpuDirectHits)&&
   s.humanCpuDirectHits>=0&&
   Number.isSafeInteger(s.humanCpuDirectSplats)&&
   s.humanCpuDirectSplats>=0,'NATIVE_SAMPLE_'+i);
  lastTick=s.tick;
  firstOrigin??=s.browserWorldOrigin;
  const allies=c.filter(b=>b.id.startsWith('A'));
  const enemies=c.filter(b=>b.id.startsWith('B'));
  const humanNearest=Math.min(...enemies.map(b=>dist(s.player,b.foot)));
  const cpuNearest=Math.min(...allies.flatMap(a=>
   enemies.map(b=>dist(a.foot,b.foot))));
  measured.push({label:s.label,tick:s.tick,
   nearestHumanEnemyHorizontalMeters:humanNearest,
   nearestFriendlyCpuEnemyCpuHorizontalMeters:cpuNearest,
   humanShots:s.humanShots,cpuShotRequests:s.cpuSourceShots,
   actualHumanCpuHits:s.humanCpuDirectHits,
   actualHumanCpuSplats:s.humanCpuDirectSplats});
 }
 ok(data.samples.at(-1).secondsRemaining===0&&
  data.samples.at(-1).paused===true&&
  data.samples.at(-1).humanShots>=data.samples[0].humanShots&&
  data.samples.at(-1).cpuSourceShots>=data.samples[0].cpuSourceShots,
  'TRUE_180S_FINAL_SAMPLE');
 return {schema:'B432_READ_ONLY_SEVEN_NATIVE_OPPONENT_FRONTIER',
  verdict:'SOURCE_OPPONENT_PROXIMITY_MEASURED_NOT_ROUTE_CERTIFIED',
  originalSource:'25/17/26/0',observedNativeSamples:7,
  firstBrowserOrigin:firstOrigin,
  minimumSampledHumanEnemyHorizontalMeters:
   Math.min(...measured.map(s=>s.nearestHumanEnemyHorizontalMeters)),
  minimumSampledCpuVsCpuHorizontalMeters:
   Math.min(...measured.map(s=>s.nearestFriendlyCpuEnemyCpuHorizontalMeters)),
  finalNativeTick:measured.at(-1).tick,
  finalActualHumanCpuHits:measured.at(-1).actualHumanCpuHits,
  finalActualHumanCpuSplats:measured.at(-1).actualHumanCpuSplats,
  samples:measured,
  betweenSamplesEncounterResolved:false,
  originalNaturalCrossTeamPathCertified:false,
  originalScoreable:0,officialWinner:'NONE',
  trueFull4v4Certified:false,artAccepted:false,
  productionAuthorized:false,sourceOrGameplayWrites:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=process.argv[2];ok(file?.endsWith('.json'),'RAW_FILE');
 const x=auditB432ObservedOriginalOpponentFrontier(
  JSON.parse(readFileSync(file,'utf8')));
 const out=process.argv[3]||
  resolve(file,'..','b432-original-opponent-frontier.json');
 writeFileSync(out,JSON.stringify(x,null,2)+'\n');
 console.log('B432_REAL_ORIGINAL_OPPONENT_FRONTIER',
  JSON.stringify({verdict:x.verdict,
   samples:x.observedNativeSamples,
   humanEnemyMinimumMeters:x.minimumSampledHumanEnemyHorizontalMeters,
   cpuEnemyMinimumMeters:x.minimumSampledCpuVsCpuHorizontalMeters,
   hits:x.finalActualHumanCpuHits,splats:x.finalActualHumanCpuSplats,
   scoreable:x.originalScoreable,officialWinner:x.officialWinner}));
}
