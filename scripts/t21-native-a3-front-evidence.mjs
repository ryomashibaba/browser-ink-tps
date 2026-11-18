/** Only READ source A3 evidence, never grant a target or simulated movement.
 * Original B445 authorization can be used without a redundant new B448
 * fallback. Both paths require real same-world KCC foot progress and a
 * genuinely issued native goal to distinguish motion from proposed paths.
 */
export function auditLiveA3SourceGoalEvidence({source,evidence,initialGate,observed}){
 const initiallyAdmitted=initialGate?.id==='A3'&&
  Number.isSafeInteger(initialGate.strictlyApprovedGoals)&&
  initialGate.strictlyApprovedGoals>0&&
  Number.isSafeInteger(initialGate.runtimeTrueOriginalGoalRequests)&&
  initialGate.runtimeTrueOriginalGoalRequests>0&&
  Array.isArray(initialGate.approvedOriginalGoals)&&
  initialGate.approvedOriginalGoals.some(g=>
   Array.isArray(g)&&g.length===3&&g.every(Number.isFinite));
 const freshlyAdmitted=Number.isSafeInteger(evidence?.actualOriginalGoalsAuthorized)&&
  evidence.actualOriginalGoalsAuthorized>0;
 const basis=freshlyAdmitted?'B448_FRESH_STRICT_SOURCE_GOAL':
  initiallyAdmitted?'B445_EXISTING_STRICT_SOURCE_GOAL':'UNVERIFIED';
 const pass=source==='25/17/26/0'&&
  evidence?.enabled===true&&evidence.noActorPoseOrClockWrites===true&&
  evidence.crossTeamPathCertified===false&&
  evidence.formal4v4Certified===false&&
  Number.isSafeInteger(evidence.actualNativeGoalRequests)&&
  evidence.actualNativeGoalRequests>0&&
  Number.isSafeInteger(observed?.closestObservationCount)&&
  observed.closestObservationCount>0&&
  Number.isFinite(observed.minimumObservedGoalDistanceMeters)&&
  observed.minimumObservedGoalDistanceMeters<=1.5&&
  Number.isFinite(evidence.nativePlanarDisplacementMeters)&&
  evidence.nativePlanarDisplacementMeters>.5&&basis!=='UNVERIFIED';
 return {pass,basis};
}
