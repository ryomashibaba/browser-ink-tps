#!/usr/bin/env node
/** B449: independently verify A3's movement TOWARD a real, previously
 * SOURCE-authorized goal, rather than merely moving somewhere else.
 * Research-only native snapshot analysis: never grants a route or a score. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectB444Trial} from './t21-b444-native-front-goal-comparator.mjs';
const hold=s=>{throw Error('B449_NATIVE_SOURCE_HOLD_'+s)};
const vec3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
const xzd=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
export function compareB449TrueA3GoalProgress(pre,after){
  const first=inspectB444Trial(pre),second=inspectB444Trial(after);
  if(first.browserWorldOrigin===second.browserWorldOrigin)hold('SHARED_CHROMIUM_ORIGIN');
  const p=pre?.b441NativeEvidence?.b446LiveActualCpuFootDryRouteProbes;
  if(!Array.isArray(p)||p.length!==3)hold('B446_PROVENANCE');
  const dry=p.find(v=>v.id==='A3');
  if(!dry||!vec3(dry.firstPassingExistingGoal)||dry.passedAllOriginalChecks<1||
     dry.probeOnlyNoActorOrGoalWrites!==true||dry.firstPassingExistingGoal[2]<33||
     !vec3(dry.actualPhysicalFoot)||
     p.filter(v=>v.id==='B2'||v.id==='B4').some(v=>v.passedAllOriginalChecks!==0))
    hold('ACTUAL_A3_ORIGINAL_GOAL_UNVERIFIED');
  const e=after?.b441NativeEvidence,b=e?.b448A3RealEvidence;
  if(after.b448A3ResearchOnly!==true||b?.enabled!==true||
     b.actualOriginalGoalsAuthorized!==1||b.actualNativeGoalRequests<1||
     b.noActorPoseOrClockWrites!==true||b.crossTeamPathCertified!==false||
     b.formal4v4Certified!==false||b.verifiedSourceOnlyGoalPass!==true||
     !vec3(b.initialNativeFoot)||!vec3(b.endingNativeFoot)||
     !Number.isFinite(b.nativePlanarDisplacementMeters)||
     Math.abs(xzd(b.initialNativeFoot,b.endingNativeFoot)-b.nativePlanarDisplacementMeters)>.001)
    hold('REAL_A3_AUTHORIZATION');
  // Before B448, A3 had no constructor-authorized front goal.
  if(pre.b441NativeEvidence.b445LastOriginalGateByCpu.find(x=>x.id==='A3')?.strictlyApprovedGoals!==0)
    hold('OLD_A3_ALREADY_AUTHORIZED');
  const samples=[];
  for(const f of e.realFrames){
    const a=f.b442RealApprovedOriginalGoals.find(v=>v.id==='A3');
    if(!a)continue;
    if(xzd(a.target,dry.firstPassingExistingGoal)>.001||
       Math.abs(a.target[1]-dry.firstPassingExistingGoal[1])>.001||
       !vec3(a.physicalFoot)||a.physicalFoot[2]<33)
      hold('GOAL_IS_NOT_THE_B446_ORIGINAL');
    samples.push({tick:f.tick,distance:a.distanceXZ,foot:a.physicalFoot});
  }
  if(samples.length<2)hold('NOT_ENOUGH_TRUE_A3_GOAL_SAMPLES');
  let best=samples[0].distance,firstTick=samples[0].tick,lastImprovedTick=firstTick;
  for(let i=1;i<samples.length;i++){
    if(samples[i].distance<best){best=samples[i].distance;lastImprovedTick=samples[i].tick;}
  }
  const gain=samples[0].distance-best;
  const afterApprovalFootMovement=xzd(samples[0].foot,
      samples.reduce((bestRow,r)=>r.distance<bestRow.distance?r:bestRow,samples[0]).foot);
  const pass=gain>=.5&&afterApprovalFootMovement>=.5&&lastImprovedTick>firstTick;
  return {schema:'B449_TRUE_A3_ORIGINAL_GOAL_DIRECTIONAL_PROGRESS_V1',
    verdict:pass?'PASS_ACTUAL_A3_DIRECTIONAL_APPROACH_ON_REGISTERED_SOURCE_NOT_4V4':
      'HOLD_NO_PROVEN_DIRECTIONAL_APPROACH',
    beforeBrowserOrigin:first.browserWorldOrigin,
    afterBrowserOrigin:second.browserWorldOrigin,
    originalGoal:[...dry.firstPassingExistingGoal],
    actualGoalRequests:b.actualNativeGoalRequests,
    actualA3AuthorizedGoalCount:b.actualOriginalGoalsAuthorized,
    observedRealGoalSamples:samples.length,
    earliestGoalTick:firstTick,lastImprovedTick,
    distanceAtFirstObservedAcceptedGoal:samples[0].distance,
    minimumObservedDistanceToSameGoal:best,
    verifiedGoalDistanceImprovementMeters:gain,
    movedTowardSameApprovedGoalMeters:afterApprovalFootMovement,
    originalSource:'25/17/26/0',
    actorWrites:0,scoreWrites:0,clockWrites:0,
    official4v4Certified:false,crossTeamTraversalCertified:false,
    limits:'A3 only; no enemy encounters, scoring, or 7.2 original crossing'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.length!==4)hold('REQUIRES_TWO_REAL_JSON_ARTIFACTS');
  const [a,b]=process.argv.slice(2).map(p=>JSON.parse(readFileSync(resolve(p),'utf8')));
  console.log(JSON.stringify(compareB449TrueA3GoalProgress(a,b),null,2));
}
