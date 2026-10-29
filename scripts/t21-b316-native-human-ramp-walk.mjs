/** B316: classify real KCC lower landing -> original ramp traversal.
 * Only real browser keyboard and original Rapier support can prove movement. */
const ROOT='UndertowT21D:';
export const RAMP=ROOT+'right-low-route-ramp-positive-z';
export const LANDING=ROOT+'first-drop-landing-positive-z';
const wrap=x=>((x+540)%360)-180;
const finiteTriplet=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
export function planB316ActualOriginalRampApproach({ledger,camera}){
 if(!ledger||!finiteTriplet(ledger.actualBodyMeters)||
  !camera||![camera.yawDegrees,camera.pitchDegrees].every(Number.isFinite)||
  ledger.source!=='25/17/26/0'||ledger.originalRows?.length!==17||
  !ledger.realHumanOriginalFootSupported)
  throw Error('B316_ORIGINAL_HUMAN_KCC_GROUND_OR_SOURCE_UNVERIFIED');
 const ramp=ledger.originalRows.find(x=>x.surfaceId===RAMP+':paint');
 if(!ramp||!Array.isArray(ramp.originalSourceActiveProbeCells)||
  ramp.originalSourceActiveProbeCells.length<1||
  ramp.originalSourceActiveProbeCells.length>3)
  throw Error('B316_MISSING_REAL_ORIGINAL_ACTIVE_RAMP_CELLS');
 const body=ledger.actualBodyMeters;
 const candidates=ramp.originalSourceActiveProbeCells.map(p=>{
  if(!finiteTriplet(p.world)||!Array.isArray(p.grid)||
   p.grid.length!==2||!p.grid.every(Number.isSafeInteger))
   throw Error('B316_NOT_REAL_B271_ACTIVE_ORIGINAL_RAMP_CELL');
  const dx=p.world[0]-body[0],dz=p.world[2]-body[2];
  const distance=Math.hypot(dx,dz);
  // PlayerController uses camera flat-forward=(sin(yaw),-cos(yaw)).
  const targetForwardYaw=Math.atan2(dx,-dz)*180/Math.PI;
  const deltaYaw=wrap(targetForwardYaw-camera.yawDegrees);
  const mouseX=Math.round(deltaYaw/.22);
  return {grid:p.grid,world:p.world,distance,
   targetForwardYaw,mouseX,screenX:800+mouseX,
   candidateOnly:true,physicallyVerified:false,
   safe:distance>=.4&&distance<=4&&
    Math.abs(mouseX)<=720&&800+mouseX>=10&&800+mouseX<=1590};
 });
 const sorted=candidates.filter(x=>x.safe).sort((a,b)=>a.distance-b.distance);
 return {schema:'B316_TRUE_NATIVE_ORIGINAL_KCC_RAMP_APPROACH_PLAN',
  candidate:sorted[0]??null,candidates,
  originalSource:'25/17/26/0',original4v4Certified:false};
}
export function auditB316RealMovement({first,steps,targetId=RAMP}){
 if(!first||!Array.isArray(steps)||steps.length===0||steps.length>14||
  first.source!=='25/17/26/0'||!finiteTriplet(first.actualBodyMeters)||
  first.genuineHumanOriginalFootSolid!==LANDING||
  first.realHumanOriginalFootSupported!==true)
  throw Error('B316_NOT_ORIGINAL_KCC_LANDING_START');
 let previous=first,seenActualRamp=false,firstSafe=0,maxTravel=0;
 for(const row of steps){
  const next=row.after;
  if(!next||next.source!=='25/17/26/0'||
   !finiteTriplet(next.actualBodyMeters)||
   !Number.isSafeInteger(next.tick)||next.tick<=previous.tick||
   next.originalRows?.length!==17||
   next.sourceActorRelocations!==0||next.sourceInkRewritten!==false||
   next.playerPositionRewritten!==false)
    throw Error('B316_NONAUTHENTIC_STEP_OR_SOURCE_MUTATION');
  if(!['KeyW','KeyA','KeyD','KeyS'].includes(row.realKey)||
   !Number.isSafeInteger(row.nativeInputTicks)||row.nativeInputTicks<1||
   row.nativeInputTicks>12||row.nativeInputTicks>next.tick-previous.tick)
   throw Error('B316_NONAUTHENTIC_NATIVE_KEYBOARD_MOVEMENT');
  const shift=Math.hypot(
   next.actualBodyMeters[0]-first.actualBodyMeters[0],
   next.actualBodyMeters[2]-first.actualBodyMeters[2]);
  const delta=Math.hypot(
   next.actualBodyMeters[0]-previous.actualBodyMeters[0],
   next.actualBodyMeters[2]-previous.actualBodyMeters[2]);
  if(!Number.isFinite(delta)||delta>2.6)
   throw Error('B316_HUMAN_IMPOSSIBLE_SHORT_SOURCE_KCC_STEP');
  maxTravel=Math.max(maxTravel,shift);
  if(next.realHumanOriginalFootSupported){
   firstSafe++;
   if(next.genuineHumanOriginalFootSolid===targetId&&shift>=.5){
    const member=next.originalRows.find(x=>x.surfaceId===targetId+':paint');
    if(member?.actualHumanFootOnOriginalActiveSurface===true)
     seenActualRamp=true;
   }
  }
  previous=next;
 }
 return {schema:'B316_GENUINE_LOWER_LANDING_TO_RAMP_KCC',
  source:'25/17/26/0',attemptedTrueKeyboardSteps:steps.length,
  independentlySupportedSteps:firstSafe,
  actualMaximumPlanarDisplacementMeters:maxTravel,
  reachedOriginalRampOnGenuineCharacterKcc:seenActualRamp,
  verdict:seenActualRamp?'GENUINE_ORIGINAL_RAMP_HUMAN_WALK_PASS':
   'HOLD_NO_PHYSICAL_ORIGINAL_RAMP_WALK',
  exactOriginalActorTeleportCount:0,originalScoreablePromotions:0,
  stageSolidsChanged:0,original4v4Certified:false,
  artAccepted:false,productionAuthorized:false};
}
