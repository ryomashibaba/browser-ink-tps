import {describe,expect,it} from 'vitest';
import {b488OriginalCrossTeamGapDecision as decide}
 from './B488OriginalCrossTeamGapDecision';
const live=()=>({
 source:'25/17/26/0',nativeTick:1900,
 originalOneWayDropLinks:26,originalExplicitCrossSideLinks:0,
 totalOriginalNativePathQueries:16,nativePathReportedPairs:0,
 nativeCredibleEndpointPairs:0,nearestHumanEnemy3dMeters:104.586,
 nearestAllyEnemy3dMeters:78.614,
 naturalCrossTeamPathCertified:false,
 physicalCapsuleRouteCertified:false,officialWinner:'NONE'
});
const archived=()=>({localGapCountTotal:8,localGapCountPerSide:4,
 strictBridgeThresholdMeters:.30,
 strictBridgesAfterFloorLineAndFenceOverlayRemoval:0,
 ordinaryWalkSurfaceRecovered:false,runtimePromotionAuthorized:false,
 offMeshLinkAuthorized:false});
describe('B488 genuine SOURCE 0/16 path and eight archived gaps',()=>{
 it('shows the actual source authority deficit without promoting geometry',()=>{
  expect(decide(live(),archived())).toMatchObject({
   archivedAuditCompatible:true,archivedUnresolvedLocalGaps:8,
   archivedUnresolvedGapsPerSide:4,currentNativeOpposingQueries:16,
   currentNativeReportedPaths:0,individuallyProvenOriginalGapCollisionFaces:0,
   candidateRuntimeStagePromotionAuthorized:false,
   actorPhysicsNavMeshInkClockScoreWrites:0,
   verdict:'HOLD_REFERENCE_REQUIRED_NO_AUTHORIZED_CROSSING'
  });
 });
 it('exposes archived drift as HOLD rather than permission',()=>{
  const decision=decide(live(),{
   ...archived(),strictBridgesAfterFloorLineAndFenceOverlayRemoval:1});
  expect(decision?.verdict).toBe('HOLD_ARCHIVED_SOURCE_BASELINE_DRIFT');
  expect(decision?.archivedUnresolvedLocalGaps).toBeNull();
  expect(decision?.candidateRuntimeStagePromotionAuthorized).toBe(false);
 });
 it('never upgrades a reported Recast route to true capsule crossing',()=>{
  const decision=decide({...live(),nativePathReportedPairs:1,
   nativeCredibleEndpointPairs:1},archived());
  expect(decision?.currentNativeCredibleEndpointPairs).toBe(1);
  expect(decision?.originalCpuCapsuleContinuousTraversalVerified).toBe(false);
  expect(decision?.officialWinner).toBe('NONE');
 });
 it('rejects forged native world, modified links, official score and invalid values',()=>{
  for(const changed of [
   {source:'25/17/27/0'},
   {nativeTick:NaN},{nativeTick:0},
   {originalExplicitCrossSideLinks:1},
   {originalOneWayDropLinks:25},
   {totalOriginalNativePathQueries:12},
   {nativePathReportedPairs:17},
   {nativePathReportedPairs:0,nativeCredibleEndpointPairs:1},
   {nearestHumanEnemy3dMeters:Infinity},
   {naturalCrossTeamPathCertified:true},
   {physicalCapsuleRouteCertified:true},
   {officialWinner:'A'}
  ])expect(decide({...live(),...changed},archived())).toBeNull();
 });
});
