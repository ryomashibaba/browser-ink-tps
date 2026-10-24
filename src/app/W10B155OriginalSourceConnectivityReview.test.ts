import {describe,it,expect} from 'vitest';
import {Vec3} from 'playcanvas';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {buildB155OriginalSourceConnectivityReview as review}
 from './W10B155OriginalSourceConnectivityReview';

const stage=()=>({
 metadata:{id:'undertow-t21d-partial-connectivity-qa'},
 solids:Array.from({length:25},()=>({})),
 paintSurfaces:Array.from({length:17},()=>({flags:SurfaceFlags.Paintable})),
 navigationLinks:Array.from({length:26},()=>({}))
}) as unknown as StageDefinition;
const nav=(reached=true)=>({auditPath:()=>({
 startSnapDistanceMeters:0,endSnapDistanceMeters:0,
 querySuccess:true,pointCount:3,nativePathPoints:[],
 endpointErrorMeters:0,reachedTarget:reached
})}) as unknown as Pick<RecastStageNavigation,'auditPath'>;
const ray=(hit:boolean)=>({castStageSegment:(from:Vec3,to:Vec3)=>{
 if(!hit)return null;
 return {solidId:'original-test-only',
  point:new Vec3(from.x,(from.y+to.y)*.5,from.z)};
}}) as unknown as Pick<RapierStagePhysics,'castStageSegment'>;

describe('B155 F4 original right-low-to-underpass source-review only',()=>{
 it('holds both real-original diagnostic links even when Recast succeeds',()=>{
  const data=review(stage(),nav(true),ray(true));
  expect(data.routes).toHaveLength(8);
  expect(data.heldDiagnosticGaps).toBe(2);
  expect(data.mustReachRecastPaths).toBe(6);
  expect(data.diagnosticOriginalRayMisses).toBe(0);
  expect(data.routes.filter(x=>x.type==='DIAGNOSTIC_GAP')
   .every(x=>x.status==='UNVERIFIED_SOURCE_GAP'&&
    x.physicallyCertified===false)).toBe(true);
  expect(data.actualPlayerKccTraversalCertified).toBe(false);
  expect(data.modifiedNavLinks).toBe(false);
  expect(data.scoreablePromotions).toBe(0);
  expect(data.productionAuthorized).toBe(false);
 });
 it('keeps missing real floor rays as uncertainty, not invented geometry',()=>{
  const data=review(stage(),nav(false),ray(false));
  expect(data.mustReachRecastPaths).toBe(0);
  expect(data.diagnosticOriginalRayMisses).toBe(10);
  expect(data.routes.filter(x=>x.type==='DIAGNOSTIC_GAP')
   .every(x=>x.status==='UNVERIFIED_SOURCE_GAP')).toBe(true);
  expect(data.routes.filter(x=>x.type==='MUST_REACH')
   .every(x=>x.status==='RECAST_ENDPOINT_NOT_REACHED')).toBe(true);
 });
 it('rejects scoreable promotion, changed geometry or incomplete probes',()=>{
  const s=stage();
  expect(()=>review({...s,solids:s.solids.slice(1)},nav(),ray(false)))
   .toThrow(/SOURCE_AUTHORITY/);
  expect(()=>review({...s,paintSurfaces:[...s.paintSurfaces.slice(1),
   {...s.paintSurfaces[0]!,flags:SurfaceFlags.Scoreable}]},nav(),ray(false)))
   .toThrow(/SOURCE_AUTHORITY/);
  expect(()=>review(s,nav(),ray(false),
   UNDERTOW_T21D_CONNECTIVITY_PROBES.slice(1)))
   .toThrow(/SIX_REACH_TWO_HELD/);
 });
});
