/** B312 compares the exact original 17 source-owner ledgers with a
 * real HUMAN impact event, never CPU ink or merely a shot request. */
export type B312Row={
 surfaceId:string;originalOwnedA:number;originalOwnedB:number;
 originalNeutral:number;activeOriginalCells:number;
};
export type B312RealReadOnlyFrame={
 tick:number;shots:number;humanChangedCells:number;
 humanLastImpactTick:number|null;humanLastPaintedSurface:string|null;
 source:'25/17/26/0';originalRows:readonly B312Row[];
};
export function b312ValidateOriginalOwnerFrame(frame:B312RealReadOnlyFrame){
 const rows=frame.originalRows;
 if(frame.source!=='25/17/26/0'||rows.length!==17||
  new Set(rows.map(r=>r.surfaceId)).size!==17||
  !Number.isSafeInteger(frame.tick)||frame.tick<1||
  !Number.isSafeInteger(frame.shots)||frame.shots<0||
  !Number.isSafeInteger(frame.humanChangedCells)||
  frame.humanChangedCells<0||
  rows.some(r=>!r.surfaceId||[
   r.originalOwnedA,r.originalOwnedB,r.originalNeutral,
   r.activeOriginalCells].some(x=>!Number.isSafeInteger(x)||x<0)||
   r.originalOwnedA+r.originalOwnedB+r.originalNeutral!==
    r.activeOriginalCells))
  throw Error('B312_ORIGINAL_17_OWNER_GRID_INVALID');
 return true;
}
export function b312JudgeRealHumanSecondSurface(
 before:B312RealReadOnlyFrame,after:B312RealReadOnlyFrame,
 targetId:string){
 b312ValidateOriginalOwnerFrame(before);
 b312ValidateOriginalOwnerFrame(after);
 if(!targetId||after.tick<=before.tick||after.shots<before.shots||
  after.humanChangedCells<before.humanChangedCells||
  (before.humanLastImpactTick!==null&&
   (after.humanLastImpactTick===null||
    after.humanLastImpactTick<before.humanLastImpactTick)))
  throw Error('B312_GENUINE_HUMAN_TIMELINE_OR_TARGET_INVALID');
 const targetBefore=before.originalRows.find(x=>x.surfaceId===targetId);
 const targetAfter=after.originalRows.find(x=>x.surfaceId===targetId);
 if(!targetBefore||!targetAfter||before.originalRows.some(r=>
  !after.originalRows.some(q=>q.surfaceId===r.surfaceId&&
   q.activeOriginalCells===r.activeOriginalCells)))
  throw Error('B312_SOURCE_PAINT_SURFACE_IDENTITY_CHANGED');
 const hasHumanShot=after.shots>before.shots;
 const newlyHumanImpact=after.humanLastPaintedSurface===targetId&&
  after.humanLastImpactTick!==null&&
  after.humanLastImpactTick>before.tick&&
  after.humanChangedCells>before.humanChangedCells;
 const targetAIncreased=targetAfter.originalOwnedA>targetBefore.originalOwnedA;
 const distinctHumanSurface=before.humanLastPaintedSurface!==null&&
  before.humanLastPaintedSurface!==targetId;
 const accepted=hasHumanShot&&newlyHumanImpact&&targetAIncreased&&
  distinctHumanSurface;
 return {schema:'B312_GENUINE_SECOND_ORIGINAL_HUMAN_SURFACE_EVENT',
  targetId,originalSource:'25/17/26/0' as const,
  beforeNativeTick:before.tick,afterNativeTick:after.tick,
  realNewShots:after.shots-before.shots,
  realHumanChangedCells:after.humanChangedCells-before.humanChangedCells,
  targetNewTeamACells:targetAfter.originalOwnedA-targetBefore.originalOwnedA,
  lastHumanImpactOnTarget:newlyHumanImpact,
  distinctFromPriorHumanPaintSurface:distinctHumanSurface,
  originalHumanPaintSourceBefore:before.humanLastPaintedSurface,
  originalHumanPaintSourceAfter:after.humanLastPaintedSurface,
  verdict:accepted?'GENUINE_SECOND_SOURCE_HUMAN_PAINT_PASS' as const:
   'HOLD_NO_PROVEN_SECOND_HUMAN_SOURCE_PAINT' as const,
  official4v4Certified:false as const,sourceGeometryChanged:false as const,
  productionAuthorized:false as const,artAccepted:false as const};
}
