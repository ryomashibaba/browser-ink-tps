/** B127 source-backed REAL keyboard plan only; no physics/mutation here. */
export const B127_STAGES=Object.freeze([
 ['FIRST_DROP_GENUINE_FORWARD','KeyW',200],
 ['LOWER_LANDING_REAL_KEYD_LATERAL','KeyD',12],
 ['LOWER_LANDING_FORWARD','KeyW',18],
 ['REAL_KEYD_ACROSS_REGISTERED_UPHILL_RAMP','KeyD',90],
 ['RAISED_RIGHT_LOW_REAL_KEYW_INWARD_1','KeyW',24],
 ['RAISED_RIGHT_LOW_REAL_KEYW_INWARD_2','KeyW',24],
 ['RAISED_SOURCE_CORRIDOR_KEYW_3','KeyW',24],
 ['RAISED_SOURCE_CORRIDOR_KEYW_4','KeyW',24],
 ['RAISED_SOURCE_CORRIDOR_KEYW_5','KeyW',24],
 ['RAISED_SOURCE_B126_REAL_KEYA_LEFT_12','KeyA',12],
 ['RAISED_SOURCE_B126_REAL_KEYW_FORWARD_12','KeyW',12],
 ['B127_ORIGINAL_NARROW_KEYW_1','KeyW',12],
 ['B127_ORIGINAL_NARROW_KEYW_2','KeyW',12]
].map(([name,key,ticks])=>Object.freeze({name,keys:[key],ticks})));
export const B127_LATE_NAMES=new Set(B127_STAGES.slice(9).map(s=>s.name));
const R='UndertowT21D:right-low-team-a';
const source=(p,edge)=>{
 const w=p?.actualRaisedSourceBoundary;
 return p?.observedSourceSolid===R&&p.trueKccGrounded===true&&
  w?.realFootXZInsideOriginalSlab===true&&
  w.originalRaisedSourceVerticalBandWithin22cm===true&&
  w.distanceToOriginalSourcePolygonBoundaryMeters>=edge;
};
const poll=(p,edge)=>{
 const w=p?.registeredRaisedSource;
 return p?.originalFloorId===R&&p.nativeKccGrounded===true&&
  !p.nativeStopReason&&w?.realFootXZInsideOriginalSlab===true&&
  w.originalRaisedSourceVerticalBandWithin22cm===true&&
  w.distanceToOriginalSourcePolygonBoundaryMeters>=edge;
};
export function auditB127({phases,polls,b124,stop,suspicions,body,sourceId,grounded,boundary}){
 const order=Array.isArray(phases)&&phases.length===B127_STAGES.length&&
  phases.every((p,i)=>{
   const s=B127_STAGES[i],start=p?.genuineStartTick,end=p?.genuineEndTick;
   return p?.label===s.name&&p.actualCDPKeyboardKeys?.length===1&&
    p.actualCDPKeyboardKeys[0]===s.keys[0]&&
    Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&
    end-start>=(i===3?1:s.ticks)&&(i!==3||end-start<=90)&&
    (i===0||start===phases[i-1]?.genuineEndTick);
  });
 const replay=order&&b124?.completed===true&&phases.slice(3,11).every(p=>source(p,.65));
 const newEndpoints=order&&phases.slice(11).every(p=>source(p,.65));
 const actualPolls=order&&Array.isArray(polls)?polls.filter(p=>p.tick>phases[10].genuineEndTick):[];
 const samplesGood=actualPolls.length>=2&&actualPolls.every(p=>poll(p,.6));
 const begin=phases?.[10]?.observedOriginalHumanEndingBody;
 const advanced=begin?.length===3&&body?.length===3?
  Math.hypot(begin[0]-body[0],begin[2]-body[2]):null;
 const forward=begin?.length===3&&body?.length===3?begin[2]-body[2]:null;
 const finalSafe=sourceId===R&&grounded===true&&
  boundary?.realFootXZInsideOriginalSlab===true&&
  boundary.originalRaisedSourceVerticalBandWithin22cm===true&&
  boundary.distanceToOriginalSourcePolygonBoundaryMeters>=.65;
 const passed=!!(order&&replay&&newEndpoints&&samplesGood&&finalSafe&&!stop&&
  Number.isSafeInteger(suspicions)&&suspicions<=1&&
  Number.isFinite(advanced)&&advanced>=.7&&
  Number.isFinite(forward)&&forward>=.6);
 return {schema:'W10_B127_GENUINE_ORIGINAL_RAISED_CORRIDOR_V1',
  actualNativePhases:phases,actualNewPolls:actualPolls,b124RealEventProof:b124,
  priorB126ActuallyReplayed:replay,newEndpointsSupported:newEndpoints,
  everyNativeSampleSupported:samplesGood,actualNewXZDisplacementMeters:advanced,
  actualNewForwardZMeters:forward,
  minimumNewOriginalEdgeMeters:actualPolls.length?
   Math.min(...actualPolls.map(p=>p.registeredRaisedSource?.distanceToOriginalSourcePolygonBoundaryMeters??Infinity)):null,
  lastRealHumanBody:body,originalRaisedFootprint:boundary,
  nativeStopReason:stop,descentSuspicions:suspicions,
  supportedSameFloorCorridorContinuation:passed,originalAuthority:[25,17,26,0],
  newOriginalSolidsOrLinksOrScore:0,physicsTeleports:0,safetyFencesRelaxed:false,
  nextDistinctSourceCertified:false,centralOrOpposingPathCertified:false,
  productionAuthorized:false,unrestricted4v4Certified:false};
}
