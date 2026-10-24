import {describe,it,expect} from 'vitest';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as source}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import type {B157OriginalBidirectionalSourceAudit}
 from './W10B157OriginalBidirectionalSourceAudit';
import {matchB158OriginalSourceFaces as match}
 from './W10B158OriginalSourceFaceRecastMatch';

const fixture=(onFace:boolean):B157OriginalBidirectionalSourceAudit=>{
 const sides=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
  const first=source.find(f=>f.side===side)!;
  const point=first.mesh.vertices[first.mesh.indices[0]!]!;
  return {
   side,
   forwardNativeTerminal:onFace?point:[point[0]+200,point[1],point[2]] as const,
   reverseNativeTerminal:onFace?point:[point[0]+200,point[1],point[2]] as const,
   physicalKccTraversalCertified:false as const,
   sourceObjGeometryRegisteredHereProven:false as const,
   sourceOffMeshNavLinkAuthorized:false as const
  };
 });
 return {
  source:'NATIVE_RECAST_BOTH_DIRECTIONS_AND_REGISTERED_STAGE_RAYS',
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalCrossTeamRoutes:'0/12',
  productionAuthorized:false,originalFull4v4Certified:false,
  addedStageSolids:0,addedNavigationLinks:0,sourceScoreablePromotions:0,
  sides
 } as unknown as B157OriginalBidirectionalSourceAudit;
};

describe('B158 original CI688 exact triangles / actual-source witness matching',()=>{
 it('never promotes the already tested unsuccessful CI691 route into authority',()=>{
  const x=match(fixture(true));
  expect(x.comparisons).toHaveLength(4);
  expect(x.originalSourceFaceMeshesAlreadyInRepository).toBe(10);
  expect(x.originalSourceTrianglesInRepository).toBe(42);
  expect(x.priorFivePerSideNativeRecastExperimentCi).toBe(691);
  expect(x.priorSourceFacesAloneRecastReached).toBe(false);
  expect(x.comparisons.every(t=>
   t.originalTriangleSpatialDistanceMeters<1e-6&&
   t.originalSourceFaceMatched&&!t.runtimeOriginalFacePromoted&&
   !t.pathPhysicallyTraversableCertified)).toBe(true);
  expect(x.noNewSourceGeometry&&x.noNewNavLinks).toBe(true);
  expect(x.original4v4Certified).toBe(false);
 });
 it('measures distance in 3D, not a faked 2D bridge',()=>{
  const x=match(fixture(false));
  expect(x.comparisons.every(t=>
   t.originalTriangleSpatialDistanceMeters>1&&
   t.horizontalDifferenceMeters>1&&
   t.originalTriangleSpatialDistanceMeters>=t.horizontalDifferenceMeters))
   .toBe(true);
  expect(x.comparisons.map(x=>x.terminal)).toEqual([
   'FORWARD','REVERSE','FORWARD','REVERSE'
  ]);
 });
 it('rejects unsafe stage authority and missing genuine Recast terminals',()=>{
  const f=fixture(true);
  const forged={...f,productionAuthorized:true} as unknown as B157OriginalBidirectionalSourceAudit;
  expect(()=>match(forged)).toThrow(/SOURCE_FACE_AUTHORITY/);
  const bad={...f,sides:f.sides.map((x,i)=>i===0?{
   ...x,forwardNativeTerminal:null
  }:x)} as unknown as B157OriginalBidirectionalSourceAudit;
  expect(()=>match(bad)).toThrow(/REAL_RECAST_TERMINAL_ABSENT/);
  expect(()=>match(f,source.slice(1))).toThrow(/SOURCE_FACE_AUTHORITY/);
 });
});
