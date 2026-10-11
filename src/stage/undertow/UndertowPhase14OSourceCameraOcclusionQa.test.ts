import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {initializeRapier,RapierStagePhysics}
 from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';

const DT=1/60;
const SIDES=['positive-z','negative-z'] as const;
const OFFSETS=[
  [9,10,16],[-9,10,16],[0,13,16],
  [0,13,-16],[12,10,2],[-12,10,2],
  [12,8,-9],[-12,8,-9],[9,12,-12],
  [-9,12,-12],[0,8,22],[0,8,-22]
] as const;
// This is a *camera candidate* preflight: not a new platform, floor,
// cinematic viewpoint, scoring mask, or production camera policy.
beforeAll(async()=>{await initializeRapier();});
describe('Phase14O camera ORIGINAL solid occlusion and retract safety',()=>{
 for(const side of SIDES){
  it('audits the original '+side+' first-drop after landing with source collision authority',()=>{
   const stage=undertowT21dConnectivityQaStage();
   const physics=new RapierStagePhysics(DT,stage);
   physics.step();
   const link=stage.navigationLinks!.find(x=>x.id==='first-drop-'+side+'-3')!;
   const floor=stage.solids.find(x=>
     x.id==='UndertowT21D:first-drop-landing-'+side)!;
   const foot=nearestT21SourceSupportedLanding(floor,{
     x:link.start[0],y:link.start[1],z:link.start[2]
   });
   const focus=new Vec3(foot.x,foot.y+
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.25,foot.z);
   const candidates=OFFSETS.map(([dx,dy,dz],index)=>{
     const desired=new Vec3(focus.x+dx,focus.y+dy,focus.z+dz);
     const full=focus.distance(desired);
     const hit=physics.castStageSegment(focus,desired,'camera');
     const remaining=hit?
       Math.max(0,Math.min(full,hit.distance-.42)):full;
     const dir=desired.clone().sub(focus).normalize();
     const safe=focus.clone().add(dir.mulScalar(remaining));
     const clipped=physics.castStageSegment(focus,safe,'camera');
     return {
       index,desired:[desired.x,desired.y,desired.z],
       originalBlocker:hit?.solidId??null,
       blockerDistanceMeters:hit?.distance??null,
       desiredDistanceMeters:full,
       safeRetractedDistanceMeters:remaining,
       safeSourceRayClear:clipped===null,
       safePosition:[safe.x,safe.y,safe.z],
       unobstructed:hit===null&&remaining>5
     };
   });
   const originalUnblocked=candidates.filter(c=>c.unobstructed);
   const smallestOcclusion=candidates.filter(c=>c.originalBlocker!==null);
   for(const candidate of candidates){
     expect(candidate.safeSourceRayClear).toBe(true);
     expect(candidate.safeRetractedDistanceMeters)
       .toBeLessThanOrEqual(candidate.desiredDistanceMeters);
     expect(candidate.safeRetractedDistanceMeters).toBeGreaterThanOrEqual(0);
     expect(candidate.safePosition.every(Number.isFinite)).toBe(true);
     if(candidate.originalBlocker)
       expect(stage.solids.some(s=>s.id===candidate.originalBlocker)).toBe(true);
   }
   // At least the source-backed landing itself must admit a finite,
   // original-query-verified observation direction. A blocked desired
   // camera MUST NOT be silently marked as a clear user view.
   expect(candidates).toHaveLength(12);
   expect(candidates.some(c=>c.safeRetractedDistanceMeters>.1)).toBe(true);
   expect(freeze.activationReady).toBe(false);
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   console.log('T21_PHASE14O_ORIGINAL_SOURCE_CAMERA_CANDIDATES',JSON.stringify({
     side,originalPlayerFoot:[foot.x,foot.y,foot.z],
     originalSourceFloor:floor.id,
     candidateCount:candidates.length,
     completelyUnobstructed:originalUnblocked.length,
     originalBlocked:smallestOcclusion.length,
     blockedByOriginalSourceIds:[...new Set(
       smallestOcclusion.map(c=>c.originalBlocker)
     )],
     firstSourceClearCandidate:originalUnblocked[0]??null,
     preferredExistingVisualCandidate:candidates[0],
     allSafeRetractions:candidates.every(c=>c.safeSourceRayClear),
     approvedProductionCamera:false,
     currentHumanCameraVisualFreeze:false,
     geometryAndCameraAuthorityUnchanged:true
   }));
  });
 }
});
