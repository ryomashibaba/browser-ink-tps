import {describe,it,expect} from 'vitest';
import type {B155SourceConnectivityReview}
 from './W10B155OriginalSourceConnectivityReview';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {triageB156OriginalGaps as triage}
 from './W10B156OriginalGapTriage';

const witness=():B155SourceConnectivityReview=>{
 const routes=UNDERTOW_T21D_CONNECTIVITY_PROBES.map(p=>{
  const held=p.expectation==='DIAGNOSTIC_GAP';
  const rays=[0,.25,.5,.75,1].map(fraction=>({
   fraction,
   originalSolidId:held&&(fraction===.5||fraction===.75)?null:
    fraction===0?'frozen-first':fraction===1?'frozen-last':'ramp',
   verticalDifferenceMeters:held&&fraction===.5?null:0,
   apparentOriginalSupport:!held||fraction===0||fraction===1
  }));
  return {
   id:p.id,type:p.expectation,
   start:p.from,end:p.to,
   recastQuerySucceeded:true,
   recastEndpointReached:!held,
   recastStartSnapMeters:.1,recastEndSnapMeters:.1,
   recastEndpointErrorMeters:held?31.7:0,
   recastPathPoints:2,
   recastPathTerminal:held?[3,4,5] as const:[...p.to] as [number,number,number],
   recastPathTerminalToRequestedGoalMeters:held?32:0,
   originalStageRayWitnesses:rays,
   likelyMissingFloorRaySamples:held?3:0,
   status:held?'UNVERIFIED_SOURCE_GAP' as const:
    'RECAST_ENDPOINT_REACHED_ONLY' as const,
   physicallyCertified:false as const
  };
 });
 return {
  source:'REAL_RECAST_PATH_AND_REGISTERED_ORIGINAL_RAPIER_STAGE_RAYS',
  stage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalNaturalOpponentRoutes:'0/12',
  routes,heldDiagnosticGaps:2,mustReachRecastPaths:6,
  diagnosticOriginalRayMisses:6,
  actualPlayerKccTraversalCertified:false,
  modifiedStageGeometry:false,modifiedNavLinks:false,
  modifiedActorPositions:false,scoreablePromotions:0,
  activationReady:false,productionAuthorized:false,
  unrestricted4v4Certified:false
 };
};

describe('B156 actual-evidence interpreter (synthetic fixture only)',()=>{
 it('correctly identifies both projected-but-path-stopped source endpoints',()=>{
  const out=triage(witness());
  expect(out.knownSixAuthoredRecastEndpointPaths).toBe(6);
  expect(out.bothSidesNativeRecastStoppedShort).toBe(true);
  expect(out.heldGapCount).toBe(2);
  expect(out.sides).toHaveLength(2);
  expect(out.sides.every(x=>x.recastClassification===
   'RECAST_PATH_STOPS_SHORT_ENDPOINTS_NEAR_NAVMESH')).toBe(true);
  expect(out.sides.map(x=>x.originalRegisteredSourceRayMissingAtMidspan))
   .toEqual([[.5,.75],[.5,.75]]);
  expect(out.exactOriginalTriangleGapProven).toBe(false);
  expect(out.runtimeNavmeshConnectionApproved).toBe(false);
  expect(out.original4v4Certified).toBe(false);
 });
 it('does not label a snapped Recast endpoint as certified playable',()=>{
  const data=witness();
  const routes=data.routes.map(x=>x.type==='DIAGNOSTIC_GAP'?{
   ...x,recastEndpointReached:true,recastEndpointErrorMeters:0
  }:x);
  const out=triage({...data,routes});
  expect(out.bothSidesNativeRecastStoppedShort).toBe(false);
  expect(out.sides.every(x=>x.recastClassification===
   'RECAST_REACHED_BUT_UNCERTIFIED_PHYSICAL_ROUTE')).toBe(true);
  expect(out.originalScoreableCellApproved).toBe(false);
 });
 it('keeps bad source authority, invalid intermediate ray or missing path held',()=>{
  const data=witness();
  // Test an intentionally malformed external witness; it must not type-check
  // as a normally produced B155 source report.
  const forged={...data,productionAuthorized:true} as unknown
   as B155SourceConnectivityReview;
  expect(()=>triage(forged))
   .toThrow(/ORIGINAL_EVIDENCE_AUTHORITY/);
  expect(()=>triage({...data,routes:data.routes.slice(1)}))
   .toThrow(/ORIGINAL_EVIDENCE_AUTHORITY/);
  const routes=data.routes.map(x=>x.type==='DIAGNOSTIC_GAP'?{
   ...x,originalStageRayWitnesses:x.originalStageRayWitnesses.slice(1)
  }:x);
  expect(()=>triage({...data,routes}))
   .toThrow(/INVALID_SOURCE_GAP/);
  const unknown=data.routes.map(x=>x.type==='DIAGNOSTIC_GAP'?{
   ...x,recastQuerySucceeded:false
  }:x);
  expect(triage({...data,routes:unknown}).sides.every(
   x=>x.recastClassification==='RECAST_QUERY_UNAVAILABLE')).toBe(true);
 });
});
