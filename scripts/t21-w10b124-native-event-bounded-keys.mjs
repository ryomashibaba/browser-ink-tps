/**
 * B124 QA acceptance uses ACTUAL event-bounded native CDP keyboard phases,
 * not the nominal 368-tick ceiling. The real D90 phase may terminate
 * early ONLY when the real Rapier KCC has reached the distinct original
 * raised Y4.5 floor. Does not move or simulate an actor.
 */
const ids=['FIRST_DROP_GENUINE_FORWARD',
 'LOWER_LANDING_REAL_KEYD_LATERAL',
 'LOWER_LANDING_FORWARD',
 'REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP',
 'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_1',
 'RAISED_RIGHT_LOW_REAL_KEYW_INWARD_2'];
const keys=['KeyW','KeyD','KeyW','KeyD','KeyW','KeyW'];
const raised='UndertowT21D:right-low-team-a';
export function auditB124RealNativeEventBoundedKeyboardPhases(
 phases, firstTick, endTick
){
 const fail=(why,durations)=>({
  schema:'W10_B124_REAL_EVENT_BOUNDED_KEYBOARD_PHASE_AUDIT_V1',
  completed:false,reason:why,measuredActualNativePhaseDurations:durations,
  originalRaisedSourceEventReached:false,
  syntheticTickAdded:false,playerOrCpuPoseSetByAudit:false,
  originalNavigationModified:false,official4v4Certified:false
 });
 if(!Array.isArray(phases)||phases.length!==6||
    !Number.isSafeInteger(firstTick)||!Number.isSafeInteger(endTick)||
    firstTick<0||endTick<firstTick)
  return fail('MISSING_ACTUAL_NATIVE_SIX_KEY_PHASES',[]);
 const durations=[];
 for(let i=0;i<6;i++){
  const v=phases[i];
  if(!v||!Number.isSafeInteger(v.genuineStartTick)||
     !Number.isSafeInteger(v.genuineEndTick)||
     v.genuineEndTick<v.genuineStartTick||
     v.label!==ids[i]||!Array.isArray(v.actualCDPKeyboardKeys)||
     v.actualCDPKeyboardKeys.length!==1||
     v.actualCDPKeyboardKeys[0]!==keys[i]||
     (i>0&&v.genuineStartTick!==phases[i-1].genuineEndTick))
   return fail('ACTUAL_NATIVE_KEY_PHASE_ORDER_OR_BOUNDARY_INVALID',durations);
  durations.push(v.genuineEndTick-v.genuineStartTick);
 }
 if(phases[0].genuineStartTick!==firstTick||
    phases[5].genuineEndTick!==endTick||
    durations[0]<200||durations[1]<12||durations[2]<18||
    durations[3]<1||durations[3]>90||
    durations[4]<24||durations[5]<24)
  return fail('ACTUAL_NATIVE_CDPS_UNDERRAN_OR_INVALID_RAMP_EVENT',durations);
 const correctRampEarlyEnd=phases[3].observedSourceSolid===raised&&
  phases[3].trueKccGrounded===true;
 if(!correctRampEarlyEnd)
  return fail('EARLY_RAMP_KEY_RELEASE_WITHOUT_REAL_RAISED_KCC',durations);
 return {
  schema:'W10_B124_REAL_EVENT_BOUNDED_KEYBOARD_PHASE_AUDIT_V1',
  completed:true,reason:'SIX_TRUE_INPUT_PHASES_AND_REAL_KCC_RAMP_EVENT',
  measuredActualNativePhaseDurations:durations,
  measuredTotalNativeTicks:endTick-firstTick,
  nominalExclusiveTrialBudgetTicks:368,
  originalRaisedSourceEventReached:correctRampEarlyEnd,
  actualRampCDPKeyDTicks:durations[3],
  actualTwoIndependentWKeySegmentsCompleted:true,
  syntheticTickAdded:false,playerOrCpuPoseSetByAudit:false,
  originalNavigationModified:false,official4v4Certified:false
 };
}
