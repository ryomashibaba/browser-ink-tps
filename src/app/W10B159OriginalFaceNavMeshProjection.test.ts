import {describe,it,expect} from 'vitest';
import {SurfaceFlags} from '../ink/types';
import type {StageDefinition} from '../stage/StageDefinition';
import type {RecastStageNavigation} from '../navigation/RecastStageNavigation';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {B158ExactOriginalRouteFaceComparison}
 from './W10B158OriginalSourceFaceRecastMatch';
import {examineB159OriginalSourceFaceProjections as audit}
 from './W10B159OriginalFaceNavMeshProjection';

const stage=()=>({
 metadata:{id:'undertow-t21d-partial-connectivity-qa'},
 solids:Array.from({length:25},()=>({})),
 paintSurfaces:Array.from({length:17},()=>({flags:SurfaceFlags.Paintable})),
 navigationLinks:Array.from({length:26},()=>({}))
}) as unknown as StageDefinition;
const previous=()=>({
 source:'CI688_ORIGINAL_TRIANGLE_FACES_PLUS_B157_NATIVE_RECAST',
 originalStage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
 original4v4Certified:false,productionAuthorized:false,
 noNewSourceGeometry:true,noNewNavLinks:true,noNewScoreableMask:true,
 priorSourceFacesAloneRecastReached:false,
 comparisons:Array.from({length:4},()=>({}))
}) as unknown as B158ExactOriginalRouteFaceComparison;
const samples={count:0};
const navigation=(offset:number|undefined)=>({
 auditNavMeshProjection:(v:{x:number;y:number;z:number})=>{
  samples.count++;
  if(offset===undefined)return {
   success:false,nearestPoint:null,distanceMeters:null
  };
  return {
   success:true,
   nearestPoint:{x:v.x,y:v.y+offset,z:v.z},
   distanceMeters:Math.abs(offset)
  };
 }
}) as Pick<RecastStageNavigation,'auditNavMeshProjection'>;
const rays={count:0};
const rapier=()=>({
 castStageSegment:()=>{
  rays.count++;
  return null;
 }
}) as unknown as Pick<RapierStagePhysics,'castStageSegment'>;

describe('B159 original Temple01 face / frozen native Recast projection',()=>{
 it('audits 42 genuine source face centroids but never promotes geometry',()=>{
  samples.count=0;rays.count=0;
  const data=audit(stage(),navigation(.1),rapier(),previous());
  expect(samples.count).toBe(42);
  expect(rays.count).toBe(42);
  expect(data.components).toHaveLength(10);
  expect(data.samples).toHaveLength(42);
  expect(data.components.reduce((n,x)=>n+x.originalFaceCount,0)).toBe(42);
  expect(data.components.every(x=>x.nearNavMeshSamples035m===
   x.originalFaceCount&&
   x.exactSourceComponentColliderHitCount===0&&
   x.sourceFacePlayableOrConnectedCertified===false)).toBe(true);
  expect(data.samples.every(s=>s.nativeProjectionYDifferenceMeters!==null&&
   Math.abs(s.nativeProjectionYDifferenceMeters-.1)<1e-8&&
   s.exactFaceNavMeshMembershipCertified===false)).toBe(true);
  expect(data.addedStageGeometry).toBe(0);
  expect(data.addedOffmeshLinks).toBe(0);
  expect(data.addedScoreableRegions).toBe(0);
  expect(data.priorCi691ExperimentalFivePerSideInsertionReachedGoal).toBe(false);
 });
 it('records distant native height mismatch without calling source a floor',()=>{
  const high=audit(stage(),navigation(4.6),rapier(),previous());
  expect(high.components.every(x=>x.nearNavMeshSamples035m===0&&
   x.smallest3dProjectionDistanceMeters!==null&&
   Math.abs(x.smallest3dProjectionDistanceMeters-4.6)<1e-8))
   .toBe(true);
  const failure=audit(stage(),navigation(undefined),rapier(),previous());
  expect(failure.samples.every(x=>!x.nativeProjectionSucceeded&&
   x.nativeProjectionPoint===null&&
   x.nativeProjectionDistanceMeters===null)).toBe(true);
  expect(failure.components.every(x=>x.successfulNativeProjectionCount===0))
   .toBe(true);
 });
 it('refuses fabricated scoreable areas, production promotion and provenance',()=>{
  const forbidden={...previous(),productionAuthorized:true} as unknown as B158ExactOriginalRouteFaceComparison;
  expect(()=>audit(stage(),navigation(.1),rapier(),forbidden))
   .toThrow(/FROZEN_FACE_AUTHORITY/);
  const ss=stage();
  const scored={...ss,paintSurfaces:[
   {...ss.paintSurfaces[0]!,flags:SurfaceFlags.Scoreable},
   ...ss.paintSurfaces.slice(1)
  ]};
  expect(()=>audit(scored,navigation(.1),rapier(),previous()))
   .toThrow(/FROZEN_FACE_AUTHORITY/);
 });
});
