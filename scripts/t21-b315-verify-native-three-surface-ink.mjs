#!/usr/bin/env node
/** B315 independent post-game proof: read actual Chromium B312 JSON.
 * Does NOT run the renderer, patch physics or fabricate source ink.
 * Original HUMAN impact provenance and original ownerGrid delta are
 * joint evidence; team-A ownership deltas are NOT exclusively human. */
import {readFileSync,statSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT='UndertowT21D:';
const SPAWN=ROOT+'spawn-high-positive-z:paint';
const LANDING=ROOT+'first-drop-landing-positive-z:paint';
const RAMP=ROOT+'right-low-route-ramp-positive-z:paint';
const assert=(condition,message)=>{
 if(!condition)throw Error('B315_EVIDENCE_REJECT_'+message);
};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const frame=(rows,label)=>{
 assert(Array.isArray(rows)&&rows.length===17,label+'_17_REAL_SOURCES');
 const ids=new Set();
 for(const r of rows){
  assert(r&&typeof r.surfaceId==='string'&&r.surfaceId.startsWith(ROOT),
   label+'_VALID_SOURCE_ID');
  assert(!ids.has(r.surfaceId),label+'_NO_SOURCE_DUPLICATE');
  ids.add(r.surfaceId);
  assert([r.originalOwnedA,r.originalOwnedB,r.originalNeutral,
   r.activeOriginalCells].every(x=>Number.isSafeInteger(x)&&x>=0),
   label+'_NONNEGATIVE_WHOLE_OWNER_GRIDS');
  assert(r.originalOwnedA+r.originalOwnedB+r.originalNeutral===
   r.activeOriginalCells,label+'_ORIGINAL_ACTIVE_MASK_COVERAGE');
 }
 assert(ids.has(SPAWN)&&ids.has(LANDING)&&ids.has(RAMP),
  label+'_THREE_ORIGINAL_IDENTITIES');
 return new Map(rows.map(r=>[r.surfaceId,r]));
};
const angleDelta=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function verifyB315TrueThreeSourceHumanPaint(data){
 assert(data?.schema==='B312_GENUINE_SECOND_ORIGINAL_HUMAN_PAINT_ATTEMPT',
  'B312_REAL_PAYLOAD_REQUIRED');
 assert(data.source==='25/17/26/0'&&
  data.genuineCDPKeyboardMouse===true&&
  data.original4v4Certified===false&&
  data.artAccepted===false&&data.productionAuthorized===false,
  'ORIGINAL_NONPRODUCTION_SOURCE_AUTHORITY');
 const start=data.lowerInitial;
 assert(start?.realHumanOriginalFootSupported===true&&
  start.genuineHumanOriginalFootSolid===
   ROOT+'first-drop-landing-positive-z'&&
  start.sourceActorRelocations===0&&
  start.sourceInkRewritten===false&&
  start.playerPositionRewritten===false,
  'TRUE_ORIGINAL_LOWER_RAPIER_KCC_FOOT');
 assert(start.humanLastPaintedSurface===SPAWN&&
  Number.isSafeInteger(start.humanChangedCells)&&
  start.humanChangedCells>0,'TRUE_ORIGINAL_FIRST_HUMAN_SPAWN_INK');
 frame(start.originalRows,'ORIGINAL_LOWER_BASELINE');
 const rows=data.originalTargetAttempts;
 assert(Array.isArray(rows)&&rows.length===2,
  'TWO_ACTUAL_LOWER_SOURCE_SHOT_WINDOWS');
 let previous=SPAWN,lastTick=start.tick;
 const newHumanCellsByShotWindow=[];
 const targetOwnerDeltas=[];
 for(let i=0;i<2;i++){
  const target=[LANDING,RAMP][i],a=rows[i];
  assert(a?.targetId===target&&
   a.verdict==='GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS'&&
   a.sourceGeometryChanged===false&&a.official4v4Certified===false&&
   a.productionAuthorized===false&&a.artAccepted===false,
   'REAL_TARGET_AND_HOLD_AUTHORITY_'+i);
  assert(a.originalHumanPaintSourceBefore===previous&&
   a.originalHumanPaintSourceAfter===target&&
   a.lastHumanImpactOnTarget===true&&
   a.distinctFromPriorHumanPaintSurface===true,
   'ACTUAL_HUMAN_LAST_IMPACT_SOURCE_CHAIN_'+i);
  assert(Number.isSafeInteger(a.beforeNativeTick)&&
   Number.isSafeInteger(a.afterNativeTick)&&
   a.beforeNativeTick>=lastTick&&
   a.afterNativeTick>a.beforeNativeTick&&
   a.realNewShots>0&&a.realHumanChangedCells>0&&
   a.targetNewTeamACells>0,
   'TRUE_SHOT_TICK_AND_OWNER_DELTA_'+i);
  assert(a.realHumanFootSupportedBefore===true&&
   a.realHumanFootSupportedAfter===true&&
   a.beforeFoot===ROOT+'first-drop-landing-positive-z'&&
   a.afterFoot===ROOT+'first-drop-landing-positive-z',
   'SAME_ORIGINAL_HUMAN_SUPPORTED_FOOT_'+i);
  const selected=a.selectedOriginalActiveCell;
  assert(selected?.originalActiveSourceCell===true&&
   selected.safe===true&&
   Array.isArray(selected.world)&&selected.world.length===3&&
   selected.world.every(finite)&&Array.isArray(selected.grid)&&
   selected.grid.every(Number.isSafeInteger)&&
   Array.isArray(selected.actualCDP)&&
   selected.actualCDP.length===2&&
   selected.actualCDP[0]>=10&&selected.actualCDP[0]<=1590&&
   selected.actualCDP[1]>=10&&selected.actualCDP[1]<=890,
   'ACTUAL_ORIGINAL_B271_ACTIVE_CELL_AND_CDP_INPUT_'+i);
  const measured=a.measuredRealCameraAfterAim;
  assert(finite(measured?.yawDegrees)&&
   finite(measured?.pitchDegrees)&&
   angleDelta(selected.targetYaw,measured.yawDegrees)<=3&&
   Math.abs(selected.targetPitch-measured.pitchDegrees)<=3,
   'REAL_MEASURED_CAMERA_AIM_MATCHED_'+i);
  const before=frame(a.original17Before,'BEFORE_SHOT_'+i);
  const after=frame(a.original17After,'AFTER_SHOT_'+i);
  for(const [id,b] of before){
   const z=after.get(id);
   assert(z!==undefined&&z.activeOriginalCells===b.activeOriginalCells,
    'SAME_SEVENTEEN_SOURCE_ACTIVE_FOOTPRINTS_'+i);
  }
  assert(before.get(target).originalOwnedA===a.targetTeamABefore&&
   after.get(target).originalOwnedA===a.targetTeamAAfter&&
   a.targetTeamAAfter-a.targetTeamABefore===a.targetNewTeamACells,
   'NATIVE_TEAM_A_OWNER_GRID_CHANGED_ON_EXACT_TARGET_'+i);
  newHumanCellsByShotWindow.push(a.realHumanChangedCells);
  targetOwnerDeltas.push(a.targetNewTeamACells);
  previous=target;lastTick=a.afterNativeTick;
 }
 assert(Array.isArray(data.provenSecondPaintSources)&&
  data.provenSecondPaintSources.length===2&&
  data.provenSecondPaintSources[0]===LANDING&&
  data.provenSecondPaintSources[1]===RAMP,
  'NO_INVENTED_OR_MISSING_THIRD_SOURCE');
 return {schema:'B315_TRUE_THREE_ORIGINAL_HUMAN_SOURCE_PROOF',
  verdict:'PASS_AUTHENTIC_THREE_DISTINCT_HUMAN_SOURCE_PAINT_SURFACES',
  source:'25/17/26/0',
  distinctHumanPaintSurfaceIds:[SPAWN,LANDING,RAMP],
  additionalActualHumanShots:rows.map(r=>r.realNewShots),
  additionalActualHumanCellsAcrossShotWindows:newHumanCellsByShotWindow,
  actualSourceTeamAOwnerGrowthNotExclusivelyHuman:targetOwnerDeltas,
  groundTruth:'Original Human paint events + real source owner grids + genuine CDP and Rapier KCC',
  reusedOrInventedGeometry:0,actorTeleports:0,officialWinner:'NONE',
  original4v4Certified:false,artAccepted:false,productionAuthorized:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const path=process.argv[2];
 assert(typeof path==='string'&&path.endsWith('.json'),
  'REAL_BROWSER_JSON_FILE_REQUIRED');
 const source=JSON.parse(readFileSync(path,'utf8'));
 const result=verifyB315TrueThreeSourceHumanPaint(source);
 for(const suffix of ['first-drop-landing-positive-z','right-low-route-ramp-positive-z']){
  const png=resolve(path,'..','B312_REAL_ORIGINAL_LOWER_HUMAN_'+suffix+'.png');
  assert(statSync(png).size>20000,'TRUE_FRAMEBUFFER_'+suffix);
 }
 const out=resolve(path,'..','b315-independent-original-multisurface-verdict.json');
 writeFileSync(out,JSON.stringify(result,null,2));
 console.log('B315_REAL_THREE_ORIGINAL_HUMAN_PAINT_SOURCE_PASS',
  JSON.stringify(result));
}
