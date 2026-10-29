import {describe,it,expect} from 'vitest';
import {b308NativeRouteOpportunityGate,b308NativePathIsOnlyCandidate,
 b308SummarizeNativeOriginalSurfaces,type B308NativeRouteCandidate}
 from './B308NativeOriginalOtherPaintRoute';
const base={requested:true,paused:true,locked:false,stopped:false,
 fullRound:true,phase:'STAGING',tick:94,shots:10,humanCells:380,
 movedMeters:3.4,originalActors:true,actorsRelocated:0,
 solids:25,paint:17,links:26,scoreable:0};
const p=()=>({querySuccess:true,pointCount:3,startSnap:.1,
 endSnap:.2,endpointError:.1,reachedTarget:true});
const makeRows=():B308NativeRouteCandidate[]=>
 Array.from({length:17},(_,i)=>({
  surfaceId:'original-'+i,actualOwnerCells:i===0?380:0,
  activeFootprintCells:600,sourceCellWorld:[i,8,55] as const,
  playerToCellEuclideanMeters:i+1,
  startSnapDistanceMeters:.1,endSnapDistanceMeters:.2,
  nativePathQuerySuccess:true,nativePathPointCount:3,
  nativePathEndpointErrorMeters:.1,nativePathReachesSnappedTarget:true,
  strictNativeNavCandidateOnly:true
 }));
describe('B308 original 17 paintable Recast route ≠ genuine human travel',()=>{
 it('rejects all fabricated tick/owner/authority/actor relocation',()=>{
  expect(b308NativeRouteOpportunityGate(base)).toBe(true);
  for(const x of [{tick:0},{requested:false},{paused:false},
   {locked:true},{stopped:true},{fullRound:false},{humanCells:0},
   {shots:0},{movedMeters:0},{originalActors:false},{actorsRelocated:1},
   {solids:26},{paint:16},{links:27},{scoreable:1}])
   expect(b308NativeRouteOpportunityGate({...base,...x})).toBe(false);
 });
 it('does not equate snapping to other island with a route',()=>{
  expect(b308NativePathIsOnlyCandidate(p())).toBe(true);
  for(const x of [{startSnap:3},{endSnap:1},{pointCount:1},
   {querySuccess:false},{reachedTarget:false},{endpointError:2}])
   expect(b308NativePathIsOnlyCandidate({...p(),...x})).toBe(false);
 });
 it('requires exact native seventeen source ledger, even on positive Recast',()=>{
  const rows=makeRows(),summary=b308SummarizeNativeOriginalSurfaces(rows,380);
  expect(summary.originalPaintedSurfaceCount).toBe(1);
  expect(summary.nextUnpaintedNativeNavCandidateCount).toBe(16);
  expect(summary.noPhysicallyCertifiedOtherSurfaceYet).toBe(true);
  expect(()=>b308SummarizeNativeOriginalSurfaces(rows.slice(1),380)).toThrow();
  expect(()=>b308SummarizeNativeOriginalSurfaces(rows,381)).toThrow();
  expect(()=>b308SummarizeNativeOriginalSurfaces([
   ...rows.slice(0,1),{...rows[1]!,strictNativeNavCandidateOnly:false},
   ...rows.slice(2)],380)).toThrow();
 });
});
