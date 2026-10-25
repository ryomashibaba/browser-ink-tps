import {describe,it,expect} from 'vitest';
import {b218OriginalTriangleMeshSeparation as dist,
 b218OriginalRouteFaceChainSeams as report} from './B218OriginalRouteFaceChainSeams';
import type {StageTriangleMeshGeometry} from '../stage/StageDefinition';
const triangle=(points:[number,number,number][]):StageTriangleMeshGeometry=>
 ({vertices:points,indices:[0,1,2]});
const a=triangle([[0,0,0],[2,0,0],[0,0,2]]);
describe('B218 immutable original source 42-face chain seam geometry',()=>{
 it('measures 3D vertical and horizontal gaps without projected false links',()=>{
  expect(dist(a,triangle([[0,1,0],[2,1,0],[0,1,2]]))).toBeCloseTo(1,8);
  expect(dist(a,triangle([[3,0,0],[5,0,0],[3,0,2]]))).toBeCloseTo(1,8);
 });
 it('finds zero exact edge and internal face overlap without certifying path',()=>{
  expect(dist(a,triangle([[0,0,2],[2,0,2],[0,0,4]]))).toBe(0);
  expect(dist(a,triangle([[.1,0,.1],[.2,0,.1],[.1,0,.2]]))).toBe(0);
 });
 it('refuses invalid and nonfinite source mesh',()=>{
  expect(()=>dist(a,{vertices:a.vertices,indices:[0,1]})).toThrow();
  expect(()=>dist(a,{vertices:a.vertices,indices:[0,1,8]})).toThrow();
  expect(()=>dist(a,triangle([[NaN,0,0],[1,0,0],[0,0,1]]))).toThrow();
 });
 it('measures eight authentic source-face seams but grants no traversal',()=>{
  const result=report();
  expect(result.seams).toHaveLength(8);
  expect(result.seams.filter(x=>x.side==='POSITIVE_Z')).toHaveLength(4);
  expect(result.seams.filter(x=>x.side==='NEGATIVE_Z')).toHaveLength(4);
  expect(result.seams.every(x=>Number.isFinite(x.gapMeters)&&x.gapMeters>=0&&
    x.nativeConnectedCertified===false&&x.physicalKccCertified===false)).toBe(true);
  expect(result.previousAllFiveFaceRecastExperimentSucceeded).toBe(false);
  expect(result.inventedStageSolids).toBe(0);
  expect(result.navLinksAdded).toBe(0);
  expect(result.scoreablePromotions).toBe(0);
  expect(result.productionAuthorized).toBe(false);
 });
});
