#!/usr/bin/env node
/** B344: independent real human held-fire source sampling, not actual
 * projectile-spawn-tick or Nintendo-exact-cadence certification. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const need=(ok,s)=>{if(!ok)throw Error('B344_SOURCE_'+s);};
const labels=['PRE_FIRE','HOLD_12','HOLD_24','HOLD_36','HOLD_48','HOLD_60'];
export function verifyB344RealShooter(w){
 need(w?.schema==='B344_ACTUAL_SOURCE_HUMAN_HELD_SHOOTER'&&
  w.source==='25/17/26/0'&&w.fakeTicks===0&&w.fakeShots===0&&
  Number.isSafeInteger(w.baselineTick),'GENUINE_PROVENANCE');
 const a=w.checkpoints;
 need(Array.isArray(a)&&a.length===labels.length&&
  a.every((x,i)=>x.label===labels[i]),'SIX_NATIVE_SAMPLES');
 for(let i=0;i<a.length;i++){
  const x=a[i];
  need(Number.isSafeInteger(x.tick)&&x.tick>=w.baselineTick+12*i&&
   Number.isSafeInteger(x.actualHumanShotRequests)&&x.actualHumanShotRequests>=0&&
   Number.isSafeInteger(x.changedOriginalHumanCells)&&x.changedOriginalHumanCells>=0&&
   Number.isFinite(x.realPlayerInk)&&x.realPlayerInk>=0&&x.realPlayerInk<=100&&
   Number.isSafeInteger(x.actualFreePhysicalProjectileSlots)&&
   x.actualFreePhysicalProjectileSlots>=0&&
   x.actualFreePhysicalProjectileSlots<=128&&x.scoreable===0&&
   x.productionAuthorized===false,'SOURCE_SHOT_FRAME_'+i);
  if(i)need(x.tick>=a[i-1].tick&&
    x.actualHumanShotRequests>=a[i-1].actualHumanShotRequests&&
    x.changedOriginalHumanCells>=a[i-1].changedOriginalHumanCells,
    'NATIVE_ACTUAL_COUNTERS_MONOTONIC_'+i);
 }
 const shots=a.at(-1).actualHumanShotRequests-a[0].actualHumanShotRequests;
 const ink=a.at(-1).changedOriginalHumanCells-a[0].changedOriginalHumanCells;
 need(shots>=2&&ink>=1,'REAL_SHOOTING_AND_PAINT_REQUIRED');
 return {schema:'B344_GENUINE_SOURCE_SHOOTER_SAMPLED_VERDICT',
  verdict:'PASS_ACTUAL_NATIVE_HUMAN_HELD_SHOT_AND_INK_SAMPLES',
  nativeTickSpan:a.at(-1).tick-a[0].tick,
  actualHumanShotRequests:shots,actualOriginalChangedCells:ink,
  recordedPlayerInk:[a[0].realPlayerInk,a.at(-1).realPlayerInk],
  perIntervalActualShotRequests:a.slice(1).map((x,i)=>
   x.actualHumanShotRequests-a[i].actualHumanShotRequests),
  didNotSamplePhysicalProjectileSpawnTimes:true,
  originalShooterCadenceCertified:false,
  originalShooterAccuracyCertified:false,
  genuineSourceWorld:'25/17/26/0',
  verifiedOpponentRoutes:'0/12',scoreable:0,officialWinner:'NONE',
  gameplayCertified:false,artAccepted:false,
  unrestricted4v4Certified:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(!!dir,'PROOF_DIR');
 const w=JSON.parse(readFileSync(join(dir,'b344-native-human-shooter-ticks.json'),'utf8'));
 const v=verifyB344RealShooter(w);
 writeFileSync(join(dir,'b344-independent-verdict.json'),JSON.stringify(v,null,2)+'\n');
 console.log('B344_REAL_SOURCE_SHOOTER_VERDICT',JSON.stringify(v));
}
