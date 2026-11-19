import {beforeAll,describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
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
  expect(stage.solids).toHaveLength(49);
  expect(repairs).toHaveLength(14);
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
