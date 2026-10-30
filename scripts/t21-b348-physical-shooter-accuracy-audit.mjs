#!/usr/bin/env node
/** B348 independent native fixed-muzzle physical shooter accuracy
 * research comparison. No fabricated ink/shots and no Nintendo fidelity
 * certification. Original 25/17/26/0 required by B337/344/345/346 too.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b346AuditNativeFull} from './t21-b346-native-projectile-audit.mjs';
const ensure=(ok,why)=>{if(!ok)throw Error('B348_REAL_SOURCE_'+why);};
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(
 x=>typeof x==='number'&&Number.isFinite(x));
const angle=(u,v)=>{
 const n1=Math.hypot(...u),n2=Math.hypot(...v);
 ensure(n1>0&&n2>0,'VELOCITY_ZERO');
 const dot=u.reduce((sum,x,i)=>sum+x*v[i],0)/(n1*n2);
 return Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI;
};
const displacement=(p,q)=>Math.hypot(...p.map((x,i)=>x-q[i]));
export function verifyB348OriginalPhysicalAccuracy(w){
 const q=w?.truePhysicalEvidence,c=w?.actualCandidate;
 ensure(w?.schema==='B348_NATIVE_SOURCE_SHOOTER_ACCURACY_CANDIDATE'&&
  w.source==='25/17/26/0'&&w.noSyntheticInput===true&&
  w.noInjectedInk===true&&w.noFakeProjectiles===true&&
  w.nativeCameraMouseMoveDuringHeldFire===false&&
  w.scoreable===0&&w.productionAuthorized===false&&
  w.baselineB346RealFixedAimRun===40999824961&&
  w.baselineRealFixedAimChangedCells===91&&
  c?.enabled===true&&c.originalReferenceModelCertified===false&&
  c.candidateResearchOnly===true&&c.syntheticShots===0&&
  c.syntheticInk===0&&c.productionAuthorized===false,
  'NATIVE_EXPERIMENT_PROVENANCE');
 ensure(q?.enabled===true&&q.source==='25/17/26/0'&&
  q.productionAuthorized===false&&q.droppedOldestEvents===0&&
  q.noSyntheticProjectilesOrCollision===true&&
  q.scoreablePromotions===0&&
  q.observedNativeTick===w.realNativeFinalTick,
  'ACTUAL_3D_PHYSICS_TRACE');
 const launches=q.events.filter(e=>e.kind==='LAUNCH');
 const exits=q.events.filter(e=>e.kind==='EXIT');
 ensure(launches.length===w.realHumanShots&&
  launches.length===q.totalActualShooterLaunches&&
  launches.length===c.actualAcceptedCandidateShots&&
  launches.length===10&&exits.length===q.totalActualShooterExits&&
  exits.length===10&&
  c.actualGroundedCandidateShots+c.actualAirborneCandidateShots===10,
  'HUMAN_ACCEPTED_SHOTS_EACH_MATCH_REAL_BULLET');
 ensure(launches.every(e=>e.weaponId==='pulse-sprayer'&&
  vec(e.worldVelocity)&&vec(e.worldPosition)&&
  Number.isSafeInteger(e.nativeTick)),
  'REAL_MUZZLE_PHYSICAL_VELOCITY');
 const normalized=launches.map(e=>e.worldVelocity);
 const reference=normalized[0];
 const deviations=normalized.slice(1).map(v=>angle(reference,v));
 const maximum=Math.max(...deviations);
 ensure(maximum>=.04,'ALL_NATURAL_BULLETS_STILL_IDENTICAL');
 const declaredLimit=c.actualAirborneCandidateShots>0?11.66:4.86;
 ensure(maximum<=declaredLimit+.01,'CANDIDATE_EXCEEDS_RESEARCH_ANGLE_ENVELOPE');
 const painted=exits.filter(e=>e.reason==='ORIGINAL_PAINTABLE');
 ensure(painted.length>=7&&painted.every(e=>vec(e.worldPosition)&&
  typeof e.originalPaintSurfaceId==='string'),
  'REAL_ORIGINAL_PAINTABLE_PHYSICAL_COLLISIONS_REQUIRED');
 const physicalSpread=Math.max(...painted.map(e=>
  displacement(e.worldPosition,painted[0].worldPosition)));
 ensure(physicalSpread>=.01,'PHYSICAL_ORIGINAL_HIT_POINTS_STILL_IDENTICAL');
 ensure(Number.isSafeInteger(w.originalOwnerChangedCells)&&
  w.originalOwnerChangedCells>=0,'ORIGINAL_OWNER_CHANGE_NOT_OBSERVED');
 return {schema:'B348_GENUINE_ORIGINAL_SHOOTER_SPREAD_RESEARCH_VERDICT',
  verdict:'PASS_REAL_FIXED_AIM_BULLETS_HAVE_BOUNDED_PHYSICAL_DEVIATION',
  originalSource:'25/17/26/0',realHumanShots:launches.length,
  realPhysicalExits:exits.length,realOriginalPaintableHits:painted.length,
  realGroundShots:c.actualGroundedCandidateShots,
  realAirShots:c.actualAirborneCandidateShots,
  realMaximumAngularDeviationDegrees:Number(maximum.toFixed(6)),
  measuredMaximum3DImpactDisplacementMeters:Number(physicalSpread.toFixed(6)),
  actualOriginalChangedCellEvents:w.originalOwnerChangedCells,
  b346RealFixedAimBaselineChangedCellEvents:91,
  observedPaintChangeDifference:w.originalOwnerChangedCells-91,
  thisIsResearchHypothesisNotNintendoRng:true,
  exactlyCorrectNintendoSpreadCertified:false,
  originalOwnerGridNewCellsPerShotCertified:false,
  sourceScoreable:0,originalCrossTeamRoutesCertified:'0/12',
  artAccepted:false,formal4v4Certified:false,
  productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];ensure(!!dir,'EVIDENCE_DIR');
 const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const held=read('b344-native-human-shooter-ticks.json');
 const physical=read('b346-genuine-physical-projectile-events.json');
 const human=read('b337-real-input-ink.json');
 const underlying=b346AuditNativeFull(physical,human,held);
 ensure(underlying.verdict==='PASS_GENUINE_NATIVE_PLAYCANVAS_SHOOTER_SPAWN_AND_EXIT',
  'B346_ACTUAL_NATIVE_PHYSICS_UNVERIFIED');
 const result=verifyB348OriginalPhysicalAccuracy(
  read('b348-native-shooter-accuracy-candidate.json'));
 writeFileSync(join(dir,'b348-independent-research-accuracy-verdict.json'),
  JSON.stringify(result,null,2)+'\n');
 console.log('B348_REAL_ORIGINAL_PHYSICAL_SHOOTER_ACCURACY',JSON.stringify(result));
}
