import {beforeAll,describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import RAPIER from '@dimforge/rapier3d-compat';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController}
 from '../../player/PlayerCharacterPhysics';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation}
 from '../../navigation/RecastStageNavigation';
import {initializeRapier,RapierStagePhysics}
 from '../../physics/RapierStagePhysics';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {buildT21F4PhotoRouteExperiment}
 from './UndertowT21F4PhotoRouteReconstruction';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {b218OriginalRouteFaceChainSeams}
 from '../../app/B218OriginalRouteFaceChainSeams';
import {auditW10EightOriginalFaceChainSeams,
 auditW10OriginalRegisteredRampEntrance}
 from './UndertowW10EightSeamSourceCandidates';

describe('W10 exact eight CI688 original source face seams and 54 existing candidate components',()=>{
 it('audits all four ordered source-face seams per side, not just B9 long-gap pair',()=>{
  const old={solids:frozen.solids,paint:frozen.paintSurfaces,
   links:frozen.navigationLinks};
  const prior=b218OriginalRouteFaceChainSeams();
  const report=auditW10EightOriginalFaceChainSeams();
  expect(report.source).toBe('CI688_EXACT_TEMPLE01_EIGHT_FACE_CHAIN_SEAMS');
  expect(report.eightSeamsAreProvenSameAsArchivedRecastEightGaps)
   .toBe(false);
  expect(report.numberOfExactSourceFaceSeams).toBe(8);
  expect(report.rows).toHaveLength(8);
  expect(report.totalUniqueSourceCandidates).toBe(54);
  expect(report.previousStaticSourceCandidates).toBe(40);
  expect(report.addedBatch2Candidates).toBe(14);
  // Current exact public source inventory has no independent single
  // component within 30 cm of BOTH ends of ANY of the eight seams.
  // This does not rule out multiple-component / SetActor routes.
  expect(report.rows.every(x=>
   x.independentStaticPairwiseNearCount===0&&
   x.independentUnplacedPairwiseNearCount===0)).toBe(true);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const rows=report.rows.filter(x=>x.side===side);
   expect(rows).toHaveLength(4);
   for(let i=0;i<4;i++){
    const row=rows[i]!;
    expect(row.seamIndex).toBe(i);
    const p=prior.seams.find(x=>x.side===side&&x.from===row.from&&
     x.to===row.to);
    expect(p).not.toBeUndefined();
    expect(row.exactOriginalSourceFaceGapMeters).toBeCloseTo(
     p!.gapMeters,6);
    expect(row.candidateOriginalSourceMeshesExamined).toBe(27);
    expect(row.nearestIndependentStatic.length).toBeGreaterThan(0);
    expect(row.nearestIndependentUnplaced.length).toBeGreaterThan(0);
    expect(row.originalVersion72CollisionFlagsCertified).toBe(false);
    expect(row.stageRouteOrNavEnabled).toBe(false);
    for(const candidate of [
     ...row.nearestIndependentStatic,...row.nearestIndependentUnplaced]){
     expect(candidate.sourceComponentId.length).toBeGreaterThan(15);
     expect(candidate.originalTriangleCount).toBeGreaterThan(0);
     expect(candidate.independentSourceComponent).toBe(true);
     expect(candidate.overlapsKnownUpstreamEndpoint).toBe(false);
     expect(candidate.overlapsKnownDownstreamEndpoint).toBe(false);
     expect(candidate.originalTurfColliderFlagKnown).toBe(false);
     expect(candidate.originalHumanCapsuleRouteCertified).toBe(false);
     expect(candidate.worstEndpointGapMeters).toBeGreaterThanOrEqual(0);
     expect(Number.isFinite(candidate.worstEndpointGapMeters)).toBe(true);
     expect(candidate.directPairwiseWithin30cm).toBe(
      candidate.upstreamGapMeters<=.300001&&
      candidate.downstreamGapMeters<=.300001);
    }
    expect(row.nearestIndependentStatic.every(x=>
     x.placementAuthority==='STATIC_MODEL_SOURCE')).toBe(true);
    expect(row.nearestIndependentUnplaced.every(x=>
     x.placementAuthority==='SET_ACTOR_PLACEMENT_UNRESOLVED')).toBe(true);
   }
  }
  // This must not edit the old partial stage or production/main authority.
  expect(frozen.solids).toBe(old.solids);
  expect(frozen.paintSurfaces).toBe(old.paint);
  expect(frozen.navigationLinks).toBe(old.links);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
  expect(frozen.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(report.runtimeGeometryAdded).toBe(0);
  expect(report.navLinksAdded).toBe(0);
  expect(report.originalScoreable).toBe(0);
  expect(report.officialGameplayCertified).toBe(false);
  expect(report.productionAuthorized).toBe(false);
  console.log('T21_W10_EIGHT_FACE_SOURCE_CANDIDATE_TRIAGE',
   JSON.stringify(report.rows.map(x=>({
    side:x.side,seamIndex:x.seamIndex,from:x.from,to:x.to,
    directGap:x.exactOriginalSourceFaceGapMeters,
    independentStaticNear:x.independentStaticPairwiseNearCount,
    unplacedNear:x.independentUnplacedPairwiseNearCount,
    nearestStatic:x.nearestIndependentStatic[0]?{
     source:x.nearestIndependentStatic[0].sourceComponentId,
     from:x.nearestIndependentStatic[0].upstreamGapMeters,
     to:x.nearestIndependentStatic[0].downstreamGapMeters}:null,
    nearestUnplaced:x.nearestIndependentUnplaced[0]?{
     source:x.nearestIndependentUnplaced[0].sourceComponentId,
     from:x.nearestIndependentUnplaced[0].upstreamGapMeters,
     to:x.nearestIndependentUnplaced[0].downstreamGapMeters}:null
   }))));
 });

 it('matches authentic B500 entrance to all 54 source meshes without creating a walking bridge',()=>{
  const stageRefs=[frozen.solids,frozen.paintSurfaces,frozen.navigationLinks];
  const result=auditW10OriginalRegisteredRampEntrance();
  expect(result.schema).toBe('T21_V28_F4_ENTRY_ORIGINAL_SOURCE_CANDIDATES');
  expect(result.frozen).toBe('25/17/26/0');
  expect(result.rows).toHaveLength(2);
  for(const row of result.rows){
   expect(row.measuredDirectGapMeters).toBeCloseTo(1.246508,5);
   expect(row.sourceCandidatesOriginallyExamined).toBe(27);
   expect(row.independentCandidatesExamined).toBeGreaterThan(0);
   for(const c of [...row.closestStatic,...row.closestUnplaced]){
    expect(Number.isFinite(c.toRegisteredRampMeters)).toBe(true);
    expect(Number.isFinite(c.toOriginalSlopeMeters)).toBe(true);
    expect(c.original72TurfCollisionVerified).toBe(false);
    expect(c.realKccTraversalCertified).toBe(false);
   }
   expect(row.noStageGeometryAdded).toBe(true);
   expect(row.originalCollisionOrTraversalAuthorized).toBe(false);
  }
  expect(frozen.solids).toBe(stageRefs[0]);
  expect(frozen.paintSurfaces).toBe(stageRefs[1]);
  expect(frozen.navigationLinks).toBe(stageRefs[2]);
  expect(result.stagePhysicsAndNavWrites).toBe(0);
  expect(result.officialScoreable).toBe(0);
  expect(result.naturalOpponentCrossingCertified).toBe(false);
  console.log('T21_V28_F4_REAL_ENTRANCE_CANDIDATE_RANK',
   JSON.stringify(result));
 });
});

beforeAll(async()=>await Promise.all([
 initializeRecastNavigation(),initializeRapier()
]));
describe('F4 photo/video reconstruction: isolated genuine Recast and Rapier',()=>{
 it('closes both SOURCE right-low-to-underpass physical corridor candidates before any game integration',()=>{
  const proof=buildT21F4PhotoRouteExperiment();
  const {stage,repairs}=proof;
  expect(proof.originalStageUnmodified).toBe(true);
  expect(proof.actualOriginalCollisionProven).toBe(false);
  expect(proof.sceneIsolated).toBe(true);
  expect(stage.solids).toHaveLength(51);
  expect(repairs).toHaveLength(16);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(repairs.every(p=>p.geometryApproximate&&p.notOriginalCollision))
   .toBe(true);
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const results=[];
  for(const side of ['positive-z','negative-z'] as const){
   const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(x=>
    x.id==='right-low-to-underpass-'+side)!;
   const from=new Vec3(...probe.from),to=new Vec3(...probe.to);
   const path=nav.auditPath(from,to,.35);
   const floorPoints=repairs.filter(p=>p.side===
    (side==='positive-z'?'POSITIVE_Z':'NEGATIVE_Z')).map(p=>{
    const tri=p.solid.triangleMesh!;
    const centroid=new Vec3(
     (tri.vertices[0]![0]+tri.vertices[1]![0]+tri.vertices[2]![0])/3,
     (tri.vertices[0]![1]+tri.vertices[1]![1]+tri.vertices[2]![1])/3,
     (tri.vertices[0]![2]+tri.vertices[1]![2]+tri.vertices[2]![2])/3
    );
    const ray=physics.castCharacterFootSupport(
     new Vec3(centroid.x,centroid.y+.87,centroid.z),
     .87,'HUMAN');
    return {id:p.id,hit:ray?.solidId??null,
     residual:ray?Math.abs(ray.point.y-centroid.y):null};
   });
   results.push({side,startSnap:path.startSnapDistanceMeters,
    endSnap:path.endSnapDistanceMeters,
    query:path.querySuccess,points:path.pointCount,
    error:path.endpointErrorMeters,reached:path.reachedTarget,
    floorPoints});
  }
  console.log('T21_F4_PHOTO_EXPERIMENT_NATIVE_CONNECTIVITY',
   JSON.stringify(results));
  expect(results.map(r=>r.reached)).toEqual([true,true]);
  expect(results.every(r=>r.startSnap<.3&&r.endSnap<.3))
   .toBe(true);
 });
});

describe('F4 physical-capsule follow-through and actual opposing connectivity',()=>{
 it('tests full real-size KCC movement across BOTH intra-side and opposing-side native paths',()=>{
  const {stage}=buildT21F4PhotoRouteExperiment();
  const physics=new RapierStagePhysics(1/60,stage);physics.step();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const probes=['positive-z','negative-z'].map(side=>
   UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>
    p.id==='right-low-to-underpass-'+side)!);
  const cross=probes.map((p,i)=>{
   const q=probes[1-i]!;
   const a=nav.auditPath(new Vec3(...p.from),new Vec3(...q.to),.35);
   return {from:p.id,to:q.id,pathReached:a.reachedTarget,
    startSnap:a.startSnapDistanceMeters,endSnap:a.endSnapDistanceMeters,
    points:a.pointCount,error:a.endpointErrorMeters};
  });
  // The previous CI only walked the two same-side routes. Real crossing
  // must also be walked with the ACTUAL player capsule at 60 Hz, rather
  // than claiming a Recast-success silhouette as physical traversal.
  const physicalRoutes=[
   ...probes.map(p=>({id:p.id,from:p.from,to:p.to})),
   ...probes.map((p,i)=>({
    id:'cross-team-'+p.id,from:p.from,to:probes[1-i]!.to
   }))
  ];
  const result=physicalRoutes.map(probe=>{
   const path=nav.auditPath(new Vec3(...probe.from),
    new Vec3(...probe.to),.35);
   if(!path.reachedTarget||!path.nativePathPoints.length)
    throw Error('F4_PHOTO_RECAST_NOT_CONTINUOUS_'+probe.id);
   const points=path.nativePathPoints;
   const initial=physics.castCharacterFootSupport(
    new Vec3(points[0]!.x,points[0]!.y+
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,points[0]!.z),
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
   if(!initial)throw Error('F4_PHOTO_INITIAL_REAL_FOOT_UNSUPPORTED');
   const now={x:points[0]!.x,y:initial.point.y,z:points[0]!.z};
   const body=physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
     now.x,now.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,now.z));
   const collider=physics.world.createCollider(RAPIER.ColliderDesc.capsule(
    PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
    PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
   const kcc=createConfiguredPlayerCharacterController(physics.world);
   physics.step();
   const stepLimit=GAME_CONFIG.cpu.maxSpeedMetersPerSecond/60;
   const heightBySegment=new Map<number,{segment:number;substep:number;
    x:number;z:number;navY:number;rapierY:number|null;
    solidId:string|null;gap:number}>();
   const clipBySegment=new Map<number,{segment:number;substep:number;
    x:number;z:number;clip:number;solidId:string|null}>();
   let steps=0,unsupported=0,unprojected=0,clipsOver3cm=0,
    maxXZClip=0,maxDrift=0,maxGroundGap=0,firstFailure:null|
    {segment:number;substep:number;cause:string;at:[number,number,number]}=null;
   for(let seg=1;seg<points.length;seg++){
    const a=points[seg-1]!,b=points[seg]!;
    const parts=Math.max(1,Math.ceil(Math.hypot(
     b.x-a.x,b.y-a.y,b.z-a.z)/stepLimit));
    for(let k=1;k<=parts;k++){
     const fraction=k/parts;
     const x=a.x+(b.x-a.x)*fraction;
     const z=a.z+(b.z-a.z)*fraction;
     const navY=a.y+(b.y-a.y)*fraction;
     const point=new Vec3(x,navY+
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z);
     const floor=physics.castCharacterFootSupport(point,
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
     const gap=floor?Math.abs(floor.point.y-navY):Infinity;
     if(Number.isFinite(gap))maxGroundGap=Math.max(maxGroundGap,gap);
     if(!floor||gap>.20){
      const prev=heightBySegment.get(seg);
      if(!prev||gap>prev.gap)heightBySegment.set(seg,{
       segment:seg,substep:k,x,z,navY,rapierY:floor?.point.y??null,
       solidId:floor?.solidId??null,gap});
     }
     if(!floor||gap>.25){unprojected++;
      if(!firstFailure)firstFailure={segment:seg,substep:k,
       cause:floor?'NATIVE_RECAST_Y_DIFFERS_FROM_REAL_RAPIER':
        'NO_RAPIER_FLOOR_SUPPORT',at:[x,navY,z]};
     }
     const targetY=floor?.point.y??navY;
     const wanted={x:x-now.x,y:targetY-now.y,z:z-now.z};
     kcc.computeColliderMovement(collider,wanted,
      undefined,undefined,(other:RAPIER.Collider)=>
       other.handle!==collider.handle&&
       physics.shouldCharacterCollide(other,'HUMAN'));
     const moved=kcc.computedMovement();
     const clipXZ=Math.hypot(wanted.x-moved.x,wanted.z-moved.z);
     maxXZClip=Math.max(maxXZClip,clipXZ);
     if(clipXZ>.03){
      const prev=clipBySegment.get(seg);
      if(!prev||clipXZ>prev.clip)clipBySegment.set(seg,{
       segment:seg,substep:k,x,z,clip:clipXZ,
       solidId:floor?.solidId??null});
      clipsOver3cm++;
      if(!firstFailure)firstFailure={segment:seg,substep:k,
       cause:'TRUE_CAPSULE_HORIZONTAL_CLIP',at:[x,navY,z]};}
     now.x+=moved.x;now.y+=moved.y;now.z+=moved.z;
     maxDrift=Math.max(maxDrift,Math.hypot(now.x-x,now.z-z));
     if(!physics.castCharacterFootSupport(new Vec3(now.x,
       now.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,now.z),
       PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN'))unsupported++;
     body.setTranslation({x:now.x,y:now.y+
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:now.z},true);
     physics.step();steps++;
    }
   }
   physics.world.removeCharacterController(kcc);
   physics.world.removeRigidBody(body);physics.step();
   return {id:probe.id,steps,unprojected,unsupported,clipsOver3cm,
    maxXZClip,maxDrift,maxGroundGap,firstFailure,
    worstHeightSegments:[...heightBySegment.values()]
     .sort((a,b)=>b.gap-a.gap).slice(0,8),
    worstClipSegments:[...clipBySegment.values()]
     .sort((a,b)=>b.clip-a.clip).slice(0,8),
    finalFoot:{x:now.x,y:now.y,z:now.z},
    endpoint:{x:probe.to[0],y:probe.to[1],z:probe.to[2]}};
  });
  // Unlike the earlier raycast-Y follower, this uses continuous 60Hz
  // horizontal acceleration and gravity. No floor-target Y, teleport,
  // or horizontal recovery from an obsolete NavMesh sample is allowed.
  const naturalCross=probes.map((probe,i)=>{
   const id='cross-team-'+probe.id;
   const points=nav.auditPath(new Vec3(...probe.from),
    new Vec3(...probes[1-i]!.to),.35).nativePathPoints;
   const sim=new RapierStagePhysics(1/60,stage);sim.step();
   const first=points[0]!;
   const support=sim.castCharacterFootSupport(new Vec3(first.x,
    first.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,first.z),
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
   if(!support)throw Error('F4_NO_START_SUPPORT_'+id);
   const foot={x:first.x,y:support.point.y,z:first.z};
   const body=sim.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
     foot.x,foot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,foot.z));
   const collider=sim.world.createCollider(RAPIER.ColliderDesc.capsule(
    PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
    PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
   const kcc=createConfiguredPlayerCharacterController(sim.world);
   sim.step();
   let vx=0,vz=0,vy=0,waypoint=1,grounded=false;
   let airborneTicks=0,unsupportedTicks=0,stalledTicks=0,
    maxStall=0,maxVerticalTick=0,ticks=0;
   let blockedAt:null|{waypoint:number;foot:[number,number,number];
    target:[number,number,number]}=null;
   for(;ticks<2400&&waypoint<points.length;ticks++){
    const target=points[waypoint]!;
    const dx=target.x-foot.x,dz=target.z-foot.z;
    const dist=Math.hypot(dx,dz);
    if(dist<.18){waypoint++;continue;}
    const speed=Math.min(GAME_CONFIG.player.humanSpeedMetersPerSecond,dist*12);
    const acceleration=GAME_CONFIG.player.groundAccelerationMetersPerSecond2/60;
    const approach=(a:number,b:number)=>a+
     Math.max(-acceleration,Math.min(acceleration,b-a));
    vx=approach(vx,dx/dist*speed);
    vz=approach(vz,dz/dist*speed);
    vy=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
     vy-GAME_CONFIG.player.gravityMetersPerSecond2/60);
    kcc.computeColliderMovement(collider,
     {x:vx/60,y:vy/60,z:vz/60},undefined,undefined,
     (other:RAPIER.Collider)=>other.handle!==collider.handle&&
      sim.shouldCharacterCollide(other,'HUMAN'));
    const delta=kcc.computedMovement();
    grounded=kcc.computedGrounded();
    if(grounded&&vy<0)vy=-.5;
    if(!grounded)airborneTicks++;
    maxVerticalTick=Math.max(maxVerticalTick,Math.abs(delta.y));
    stalledTicks=Math.hypot(delta.x,delta.z)<.002?stalledTicks+1:0;
    maxStall=Math.max(maxStall,stalledTicks);
    body.setNextKinematicTranslation({x:foot.x+delta.x,
     y:foot.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+delta.y,
     z:foot.z+delta.z});
    sim.step();
    const actual=body.translation();
    foot.x=actual.x;
    foot.y=actual.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    foot.z=actual.z;
    if(!sim.castCharacterFootSupport(new Vec3(actual.x,actual.y,actual.z),
     PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN'))unsupportedTicks++;
    if(stalledTicks>90||foot.y< -6){
     blockedAt={waypoint,foot:[foot.x,foot.y,foot.z],
      target:[target.x,target.y,target.z]};break;
    }
   }
   const dest=points[points.length-1]!;
   const endpointXZError=Math.hypot(foot.x-dest.x,foot.z-dest.z);
   sim.world.removeCharacterController(kcc);
   sim.world.removeRigidBody(body);
   return {id,ticks,waypoint,totalWaypoints:points.length,
    grounded,airborneTicks,unsupportedTicks,maxStall,maxVerticalTick,
    endpointXZError,blockedAt,actualFoot:foot,
    naturalTraversalProven:waypoint===points.length&&grounded&&
     unsupportedTicks===0&&endpointXZError<.35&&maxStall<90};
  });
  console.log('T21_F4_NATURAL_GRAVITY_KCC_DIAGNOSTIC',JSON.stringify(naturalCross));
  console.log('T21_F4_PHOTO_REAL_CAPSULE_AND_CROSS_TEAM',
   JSON.stringify({result,cross,global4v4Ready:false}));
  // Cross-team target is a real NavMesh polygon on the opposite side.
  // This is an experimental connectivity gate only, never original Turf
  // geometry certification or direct approval for live world activation.
  expect(cross.map(c=>c.pathReached)).toEqual([true,true]);
  expect(result.every(x=>x.steps>100)).toBe(true);
  const realCrossCapsules=result.filter(x=>x.id.startsWith('cross-team-'));
  expect(realCrossCapsules).toHaveLength(2);
  // This is the actual KCC position, accumulated with collider movement,
  // not a prescribed Recast endpoint teleported into place.
  expect(realCrossCapsules.every(x=>
   x.unsupported===0&&
   Math.hypot(x.finalFoot.x-x.endpoint.x,
    x.finalFoot.z-x.endpoint.z)<.35)).toBe(true);
  expect(stage.solids.length).toBe(51);
 });
});
