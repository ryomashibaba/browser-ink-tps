import {describe,expect,it} from 'vitest';
import {
 b285BoundaryDistanceMeters,auditB285FrozenFlatSurfaceGaps
} from './B285RegisteredFlatSourceGapAudit';

describe('B285: existing original registered flat polygons, not a new corridor',()=>{
 it('measures BOTH mirrored right-low to original glass-underpass 2D gaps',()=>{
  const a=auditB285FrozenFlatSurfaceGaps();
  expect(a.registeredFlatSourceFootprintsAudited).toBe(10);
  expect(a.registeredSolidCount).toBe(25);
  expect(a.registeredPaintCount).toBe(17);
  expect(a.registeredNavLinkCount).toBe(26);
  expect(a.scoreablePromotions).toBe(0);
  expect(a.pairs[0]?.directFlatBoundarySeparationMeters).toBeCloseTo(27.7428903,4);
  expect(a.pairs[1]?.directFlatBoundarySeparationMeters).toBeCloseTo(27.7428903,4);
  expect(a.pairs[0]?.verticalDeltaMeters).toBe(-4.5);
  expect(a.pairs[1]?.verticalDeltaMeters).toBe(-4.5);
 });
 it('independently checks mirrored opposite-center and known lower support',()=>{
  const a=auditB285FrozenFlatSurfaceGaps();
  expect(a.pairs[2]?.directFlatBoundarySeparationMeters).toBeCloseTo(27.4912782,4);
  expect(a.pairs[3]?.directFlatBoundarySeparationMeters).toBeCloseTo(27.4912782,4);
  expect(a.pairs[4]?.directFlatBoundarySeparationMeters).toBe(0);
  expect(a.pairs[5]?.directFlatBoundarySeparationMeters).toBe(0);
  expect(a.pairs[4]?.verticalDeltaMeters).toBe(-1.5);
 });
 it('refuses to convert geometric separation into KCC or Recast certification',()=>{
  const a=auditB285FrozenFlatSurfaceGaps();
  expect(a.pairs.every(x=>x.actualRapierKccTraversalMeasuredHere===false)).toBe(true);
  expect(a.pairs.every(x=>x.sourceRecastPathMeasuredHere===false)).toBe(true);
  expect(a.pairs.every(x=>x.remainingTriMeshAndRampRoutesNotExcluded)).toBe(true);
  expect(a.newDistinctSourceReached).toBe(false);
  expect(a.newSafeCpuRouteCertified).toBe(false);
  expect(a.gameOriginalFloorLine00CollisionInclusionAuthenticated).toBe(false);
  expect(a.productionAuthorized).toBe(false);
  expect(a.unrestricted4v4Certified).toBe(false);
 });
 it('handles segment crosses and rejects incomplete/nonfinite source geometry',()=>{
  const A=[[0,0],[2,0],[2,2],[0,2]] as const;
  const B=[[1,-1],[3,-1],[3,1],[1,1]] as const;
  const C=[[3,0],[4,0],[4,1],[3,1]] as const;
  expect(b285BoundaryDistanceMeters(A,B)).toBe(0);
  expect(b285BoundaryDistanceMeters(A,C)).toBeCloseTo(1);
  expect(()=>b285BoundaryDistanceMeters(A,[[Infinity,1],[3,1],[4,1]])).toThrow();
  expect(()=>b285BoundaryDistanceMeters(A,[[1,1],[2,2]])).toThrow();
 });
});
