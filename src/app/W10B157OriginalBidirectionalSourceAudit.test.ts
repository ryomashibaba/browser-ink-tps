import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {B155SourceConnectivityReview}
 from './W10B155OriginalSourceConnectivityReview';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {auditB157OriginalBidirectionalGaps as audit}
 from './W10B157OriginalBidirectionalSourceAudit';

// Each object below is explicitly a synthetic negative/positive unit fixture,
// not a substitute for the original registered Recast/Rapier Chromium run.
const stage=():StageDefinition=>({
 metadata:{id:'undertow-t21d-partial-connectivity-qa'},
 solids:Array.from({length:25},()=>({})),
 paintSurfaces:Array.from({length:17},()=>({flags:SurfaceFlags.Paintable})),
 navigationLinks:Array.from({length:26},()=>({}))
}) as unknown as StageDefinition;
const b155=():B155SourceConnectivityReview=>({
 source:'REAL_RECAST_PATH_AND_REGISTERED_ORIGINAL_RAPIER_STAGE_RAYS',
 stage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
 originalNaturalOpponentRoutes:'0/12',
 routes:UNDERTOW_T21D_CONNECTIVITY_PROBES.map(p=>({
  id:p.id,type:p.expectation,start:p.from,end:p.to,
  recastQuerySucceeded:true,recastEndpointReached:p.expectation==='MUST_REACH',
  recastStartSnapMeters:.1,recastEndSnapMeters:.1,
  recastEndpointErrorMeters:p.expectation==='DIAGNOSTIC_GAP'?32:0,
  recastPathPoints:2,recastPathTerminal:p.expectation==='DIAGNOSTIC_GAP'?
   [1,4,30] as const:p.to,
  recastPathTerminalToRequestedGoalMeters:p.expectation==='DIAGNOSTIC_GAP'?32:0,
  originalStageRayWitnesses:[0,.25,.5,.75,1].map(fraction=>({
   fraction,originalSolidId:null,verticalDifferenceMeters:null,
   apparentOriginalSupport:false
  })),
  likelyMissingFloorRaySamples:5,
  status:p.expectation==='DIAGNOSTIC_GAP'?'UNVERIFIED_SOURCE_GAP' as const:
   'RECAST_ENDPOINT_REACHED_ONLY' as const,
  physicallyCertified:false as const
 })),
 heldDiagnosticGaps:2,mustReachRecastPaths:6,diagnosticOriginalRayMisses:10,
 actualPlayerKccTraversalCertified:false,modifiedStageGeometry:false,
 modifiedNavLinks:false,modifiedActorPositions:false,scoreablePromotions:0,
 activationReady:false,productionAuthorized:false,
 unrestricted4v4Certified:false
});
const physics=(supported:boolean)=>({
 castStageSegment:(a:Vec3,b:Vec3)=>{
  if(!supported)return null;
  return {solidId:'REGISTERED_TEST_STAGE_ONLY',
   point:new Vec3(a.x,(a.y+b.y)/2,a.z)};
 }
}) as unknown as Pick<RapierStagePhysics,'castStageSegment'>;
const nav=(reverseCanReach:boolean)=>({
 auditPath:(from:Vec3,to:Vec3)=>{
  const reached=reverseCanReach;
  return {
   startSnapDistanceMeters:.1,endSnapDistanceMeters:.1,
   querySuccess:true,
   pointCount:2,
   nativePathPoints:[
    {x:from.x,y:from.y,z:from.z},
    reached?{x:to.x,y:to.y,z:to.z}:
     {x:from.x+.4,y:from.y,z:from.z+2}
   ],
   endpointErrorMeters:reached?0:29,
   reachedTarget:reached
  };
 }
}) as unknown as Pick<RecastStageNavigation,'auditPath'>;

describe('B157 real original reverse Recast queries (fixture boundary)',()=>{
 it('retains HOLD when both native Recast query directions stop short',()=>{
  const result=audit(stage(),nav(false),physics(true),b155());
  expect(result.actualRecastReverseQueries).toBe(2);
  expect(result.sides).toHaveLength(2);
  expect(result.sides.every(s=>
   s.routeDiagnosis==='BOTH_RECAST_DIRECTIONS_STOP_SHORT')).toBe(true);
  expect(result.sides.every(s=>
   s.reverseNativePathVertices===2&&
   s.forwardTerminalOriginalStageSolid==='REGISTERED_TEST_STAGE_ONLY'&&
   s.forwardTerminalOriginalStageRayVerticalDifferenceMeters===0)).toBe(true);
  expect(result.addedNavigationLinks).toBe(0);
  expect(result.sourceScoreablePromotions).toBe(0);
  expect(result.originalFull4v4Certified).toBe(false);
 });
 it('reverse-only reach never becomes a physical KCC or game route',()=>{
  const result=audit(stage(),nav(true),physics(false),b155());
  expect(result.sides.every(s=>
   s.routeDiagnosis==='REVERSE_ONLY_RECAST_REACHABLE_NOT_PHYSICAL'&&
   s.reverseRecastEndpointReached&&
   s.reverseTerminalRemainingStartMeters===0)).toBe(true);
  expect(result.sides.every(s=>
   s.forwardTerminalOriginalStageSolid===null&&
   !s.physicalKccTraversalCertified&&
   !s.sourceOffMeshNavLinkAuthorized)).toBe(true);
 });
 it('rejects any authority forgery, source scoring or missing gap',()=>{
  const a=b155();
  const invalid={...a,productionAuthorized:true} as unknown as B155SourceConnectivityReview;
  expect(()=>audit(stage(),nav(false),physics(false),invalid))
   .toThrow(/ORIGINAL_FROZEN_SOURCE_AUTHORITY/);
  const st=stage();
  const scored={...st,paintSurfaces:[
   {...st.paintSurfaces[0]!,flags:SurfaceFlags.Scoreable},
   ...st.paintSurfaces.slice(1)
  ]};
  expect(()=>audit(scored,nav(false),physics(false),a))
   .toThrow(/ORIGINAL_FROZEN_SOURCE_AUTHORITY/);
  expect(()=>audit(st,nav(false),physics(false),
   {...a,routes:a.routes.slice(1)}))
   .toThrow(/TWO_GENUINE_UNVERIFIED/);
 });
});
