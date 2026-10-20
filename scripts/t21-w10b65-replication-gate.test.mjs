import {test} from 'node:test';
import assert from 'node:assert/strict';
import {judgeB65IndependentRuns} from './t21-w10b65-replication-gate.mjs';
const mk=(mode,inks,walkMeters)=>({
 mode,truePhysicsUntil130NativeMatchSeconds:true,
 originalStageAuthority:'25/17/26/0',sourceCpuFixedGoals:true,
 promotedAsNormalCpu:false,points:inks.map((v,i)=>({
  trueNativeMatchSeconds:i*20,realPhysicsTick:1000+i*1200,
  allSevenCpuOriginalFootRejoined:7,realCpuSourceShots:i*30,
  realCpuChangedSourceInkCells:v,
  trueSourceShotsBySevenAnonymousCpu:[i*8,i*7,i*5,i*4,i*3,i*2,i],
  cpuSourcePatrolMeters:walkMeters*i/6,
  suspectedPhysicalCpuStalls:0,
  sourceInkTargetCandidates:mode==='SWEEP'?i*450:0,
  sourceLateralAimsChosen:mode==='SWEEP'?i*30:0
 }))
});
const pairs=()=>({
 fixed:mk('FIXED',[0,2200,3000,3520,3560,3610,3615],3200),
 sweep:mk('SWEEP',[0,4500,7500,10300,10800,11300,11400],3230)
});
test('B65 two authentic independent source A/B experiments may qualify for separate default QA only',()=>{
 const result=judgeB65IndependentRuns(pairs(),pairs());
 assert.equal(result.replicatedSubstantiveSourceInkGain,true);
 assert.equal(result.defaultCpuSwitched,false);
 assert.equal(result.decision,'QUALIFIED_FOR_SEPARATE_PREVIEW_DEFAULT_REPRODUCTION_QA');
 assert.equal(result.originalScoreable,0);
 assert.equal(result.original4v4Certified,false);
 assert.equal(result.prior.changedCellsDeltaAt120,7785);
 assert.equal(result.B66SourceCpuActorParticipation.genuineNewRepeatPerCpuEvidenceVerified,true);
 assert.equal(result.B66SourceCpuActorParticipation.actualNativeCpuWithSourceWeaponShots,7);
});
test('B65 bad repeat ink, physical foot trajectory or source authorization cannot promote CPU',()=>{
 const x=pairs(),y=pairs();
 y.sweep=mk('SWEEP',[0,2000,3100,3500,3550,3580,3600],3230);
 assert.equal(judgeB65IndependentRuns(x,y).replicatedSubstantiveSourceInkGain,false);
 const z=pairs();
 z.sweep.points[6].cpuSourcePatrolMeters=3800;
 assert.equal(judgeB65IndependentRuns(x,z).replicatedSubstantiveSourceInkGain,false);
 const w=pairs();
 w.sweep.promotedAsNormalCpu=true;
 assert.throws(()=>judgeB65IndependentRuns(x,w),/AUTHORITY/);
 const v=pairs();
 v.fixed.points[3].suspectedPhysicalCpuStalls=1;
 assert.throws(()=>judgeB65IndependentRuns(x,v),/STALL/);
});

test('B66 replica cannot qualify if per-CPU source-shot evidence is missing or forged',()=>{
 const oldPair=pairs(),repeat=pairs();
 for(const p of repeat.sweep.points)delete p.trueSourceShotsBySevenAnonymousCpu;
 const noCpuEvidence=judgeB65IndependentRuns(oldPair,repeat);
 assert.equal(noCpuEvidence.replicatedSubstantiveSourceInkGain,false);
 assert.equal(noCpuEvidence.defaultCpuSwitched,false);
 const forged=pairs();
 forged.sweep.points[6].trueSourceShotsBySevenAnonymousCpu[0]+=1;
 assert.throws(()=>judgeB65IndependentRuns(oldPair,forged),/SHOT_DISTRIBUTION/);
});
