import {beforeAll,describe,it,expect} from 'vitest';
// Node builtins exist in Vitest's runner, but this browser application
// intentionally does not install @types/node for its production TS build.
// @ts-ignore TS2307: test-runner-only Node import (not game runtime)
import {readFileSync} from 'node:fs';
// @ts-ignore TS2307: test-runner-only Node import (not game runtime)
import {createHash} from 'node:crypto';
declare const process:{env:Record<string,string|undefined>};
import {initializeRapier,RapierStagePhysics} from '../physics/RapierStagePhysics';
import type {StageDefinition} from '../stage/StageDefinition';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {auditF3gOriginalFloorAgainstRapier,
 auditF3gPackManifest,buildIsolatedFirstDropOriginalTriangleStage,
 buildIsolatedV23LowOriginalFloor,V23_LOW_ISOLATED_SOLID_ID,
 auditV23WindowsFallStaticHeightSection,ORIGINAL_F3G_KINDS,
 v23ExplicitPhysicsReviewRequested,
 v23HasSourceUpwardFloorWinding,predictV23OriginalY0LandingFromNativeAir,
 predictV23ReleasedInputY0Position,v23HypotheticalAirXZDeltaAtTick,
 probeV23PredictedOriginalLowLandingKcc,probeV23IsolatedLowHumanKcc,
 classifyV23LowOriginalFootprintContact,
 f3hSourceMaterialStyle,T21_F3G_SOURCE_SHA256,ORIGINAL_F3G_FLOOR_SAMPLES,
 type OriginalF3gKind}
 from './UndertowF3GWholeSourcePreview';
describe('F3G whole-original source pack source authority',()=>{
 const group=(kind:'FLOOR'|'SLOPE'|'GLASS')=>({
  kind,file:'original-'+kind.toLowerCase()+'.bin',
  triangles:10,bytes:360,sha256:'a'.repeat(64)
 });
 const valid=()=>({
  schema:'T21_F3G_PINNED_ORIGINAL_STATIC_OBJ_V1' as const,
  sourceSHA256:T21_F3G_SOURCE_SHA256,
  verifiedAgainstPinnedSource:true,
  includedOriginalTriangles:1600,
  groups:[{...group('FLOOR'),triangles:1580,bytes:1580*36},
   group('SLOPE'),group('GLASS')],
  stagePlayableAuthority:'NONE' as const,
  stageCollisionSolidsAdded:0 as const,stagePaintSurfacesAdded:0 as const,
  navigationLinksAdded:0 as const,scoreableSurfacesAdded:0 as const,
  inferredFloorOrRouteAdded:0 as const,productionAuthorization:false as const
 });
 it('solid depth write and safe source floor review modes',()=>{
  expect(f3hSourceMaterialStyle('FLOOR','SOLID')).toEqual(
   {opacity:1,depthWrite:true,opaque:true});
  expect(f3hSourceMaterialStyle('GLASS','SOLID').opaque).toBe(false);
  expect(f3hSourceMaterialStyle('SUPPORT','TRAVERSAL').opacity).toBeLessThan(.3);
  expect(f3hSourceMaterialStyle('FLOOR','TRAVERSAL').depthWrite).toBe(true);
  expect(f3hSourceMaterialStyle('FLOOR','X_RAY').depthWrite).toBe(false);
 });
 it('requires exact pinned original hash and all non-gameplay flags',()=>{
  expect(auditF3gPackManifest(valid()).sourceTriangles).toBe(1600);
  expect(()=>auditF3gPackManifest({...valid(),sourceSHA256:'0'.repeat(64)}))
   .toThrow('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
  expect(()=>auditF3gPackManifest({...valid(),navigationLinksAdded:1 as 0}))
   .toThrow('T21_F3G_FULL_OBJ_UNAPPROVED_OR_UNPINNED');
  const coverage={staticObjectCount:2,unplacedFldObjFaceCount:4,
   skippedFldBgFaceCount:3,regionTriangles:{positiveZ:800,core:400,negativeZ:400},
   actorPlacementRecovered:false as const,traversalAuthorityRecovered:false as const};
  expect(auditF3gPackManifest({...valid(),coverage}).sourceTriangles).toBe(1600);
  expect(()=>auditF3gPackManifest({...valid(),coverage:{...coverage,
   actorPlacementRecovered:true as unknown as false}})).toThrow('T21_F3H_SOURCE_COVERAGE_UNTRUSTED');
  expect(()=>auditF3gPackManifest({...valid(),includedOriginalTriangles:1599}))
   .toThrow('T21_F3G_UNVERIFIED_GROUP_TRIANGLE_TOTAL');
 });
});

// K1 original ramp and Windows native fall are different trials; do not
// invent a hybrid route or accidentally treat model region anchors as inputs.
describe('V23 witnessed same-run K1 start and end',()=>{
 it('keeps ramp probe within the actual K1 witness family',()=>{
  const start=ORIGINAL_F3G_FLOOR_SAMPLES.find(p=>p.id==='RAMP_APPROACH_K1')!;
  const end=ORIGINAL_F3G_FLOOR_SAMPLES.find(p=>p.id==='RAMP_CONTACT_K1')!;
  const win=ORIGINAL_F3G_FLOOR_SAMPLES.find(p=>p.id==='LOW_SUPPORTED_1355')!;
  expect(start.provenance).toBe('CHROMIUM_K1');
  expect(end.provenance).toBe('CHROMIUM_K1');
  expect(win.provenance).toBe('WINDOWS_NATIVE');
  expect(start.x).toBeCloseTo(-.079,6);
  expect(start.z).toBeCloseTo(50.582,6);
  expect(start.footY).toBeGreaterThan(3);
  expect(end.z).toBeCloseTo(49.8099,6);
 });
});

// Exact first-drop outline has a narrow notch missed by the old 7 probes.
describe('V23 isolated original floor does not bridge a narrow source notch',()=>{
 it('keeps an entirely visual crossing triangle out of Rapier',()=>{
  const original=undertowT21dConnectivityQaStage();
  const bins=new Map<OriginalF3gKind,Float32Array>([['FLOOR',new Float32Array([
   -20.236309557423198,6,41.95787529719732,
   -19.80742768402166,6,40.13979829501014,
   -25.064128761291794,6,44.671345133447424
  ])]]);
  const candidate=buildIsolatedFirstDropOriginalTriangleStage(bins,original);
  expect(candidate.status).toBe('HOLD_NO_ENTIRELY_INSIDE_ORIGINAL_TRIANGLES');
  expect(candidate.stage).toBeNull();
  expect(original.solids).toHaveLength(25);
 });
});

// This is an isolated physics replacement, never a runtime SOURCE promotion.
describe('V23 original first-drop isolated Rapier candidate',()=>{
 it('replaces only the registered landing and excludes optical-only outside floor',()=>{
  const frozen=undertowT21dConnectivityQaStage();
  const bins=new Map<OriginalF3gKind,Float32Array>([['FLOOR',new Float32Array([
   -22,6,44,-21.5,6,44,-22,6,44.5,
   -18,6,38,-17.5,6,38,-18,6,38.5
  ])]]);
  const candidate=buildIsolatedFirstDropOriginalTriangleStage(bins,frozen);
  expect(candidate.status).toBe('ISOLATED_24_ORIGINAL_PLUS_SOURCE_TRIANGLE_REPLACEMENT');
  expect(candidate.triangles).toBe(1);
  const isolated=candidate.stage!;
  expect(isolated).not.toBe(frozen);
  expect(isolated.solids).toHaveLength(25);
  expect(isolated.paintSurfaces).toHaveLength(0);
  expect(isolated.navigationLinks).toHaveLength(0);
  expect(isolated.solids.filter(s=>s.id===
   'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY')).toHaveLength(1);
  expect(isolated.solids.some(s=>s.id===
   'UndertowT21D:first-drop-landing-positive-z')).toBe(false);
  expect(frozen.solids.some(s=>s.id===
   'UndertowT21D:first-drop-landing-positive-z')).toBe(true);
  expect(isolated.solids.find(s=>s.id===
   'T21_V23_ISOLATED_FIRST_DROP_GEOMETRIC_TRIMESH_ONLY')?.triangleMesh?.indices)
   .toEqual([0,1,2]);
 });
});

describe('V23 source-Y0 original lower floor is review-only',()=>{
 it('does not make a floor from upper-only or missing original triangles',()=>{
  const stage=undertowT21dConnectivityQaStage();
  // Missing source never turns into a polygon proxy or a 26th live solid.
  const fakePhysics={castCharacterFootSupport:()=>null} as unknown as
   import('../physics/RapierStagePhysics').RapierStagePhysics;
  const missing=buildIsolatedV23LowOriginalFloor(
   new Map<OriginalF3gKind,Float32Array>(),stage,fakePhysics);
  expect(missing.stage).toBeNull();
  expect(missing.status).toBe('HOLD_NO_PINNED_FLOOR_BIN');
  const onlyHigh=new Map<OriginalF3gKind,Float32Array>([['FLOOR',
   new Float32Array([-22,6,44,-21.5,6,44,-22,6,44.5])]]);
  const rejected=buildIsolatedV23LowOriginalFloor(onlyHigh,stage,fakePhysics);
  expect(rejected.stage).toBeNull();
  expect(rejected.status).toBe('HOLD_LOW_FLOOR_ANCHOR_AMBIGUOUS');
  expect(stage.solids).toHaveLength(25);
  expect(stage.solids.some(s=>s.id===V23_LOW_ISOLATED_SOLID_ID)).toBe(false);
 });
});

describe('V23 original low floor source ray is NOT original human landfall',()=>{
 it('rejects a center ray as full capsule support when original edge is close',()=>{
  const hit=classifyV23LowOriginalFootprintContact(V23_LOW_ISOLATED_SOLID_ID,
   .11226701182842902/.964211);
  expect(hit.exactSourceRayHit).toBe(true);
  expect(hit.fullCapsulePlanarClearancePass).toBe(false);
  expect(hit.playerReachedOrLandedAtY0).toBe(false);
  expect(hit.sourcePlaneRayIsRealGameplaySupport).toBe(false);
 });
 it('requires the precise source collider, finite boundary margin and radius',()=>{
  expect(classifyV23LowOriginalFootprintContact('other-solid',2)
   .fullCapsulePlanarClearancePass).toBe(false);
  expect(classifyV23LowOriginalFootprintContact(V23_LOW_ISOLATED_SOLID_ID,null)
   .fullCapsulePlanarClearancePass).toBe(false);
  expect(classifyV23LowOriginalFootprintContact(V23_LOW_ISOLATED_SOLID_ID,Infinity)
   .fullCapsulePlanarClearancePass).toBe(false);
  const interior=classifyV23LowOriginalFootprintContact(
   V23_LOW_ISOLATED_SOLID_ID,.7);
  expect(interior.fullCapsulePlanarClearancePass).toBe(true);
  expect(interior.playerReachedOrLandedAtY0).toBe(false);
 });
});

describe('V23 isolated original native floor winding guard',()=>{
 const a=[0,3,0] as const,b=[0,3,1] as const,c=[1,3,0] as const;
 it('accepts the native +Y normal, rejects reversed orientation',()=>{
  expect(v23HasSourceUpwardFloorWinding([a,b,c])).toBe(true);
  expect(v23HasSourceUpwardFloorWinding([a,c,b])).toBe(false);
 });
 it('rejects altered plane, collapsed and malformed source triangles',()=>{
  expect(v23HasSourceUpwardFloorWinding([a,b,[1,3.2,0]])).toBe(false);
  expect(v23HasSourceUpwardFloorWinding([a,a,c])).toBe(false);
  expect(v23HasSourceUpwardFloorWinding([a,b,[Infinity,3,0]])).toBe(false);
 });
});

describe('V23 two-witness static-source plane height checks',()=>{
 it('fails closed with missing bins instead of saying the floor is absent',()=>{
  const x=auditV23WindowsFallStaticHeightSection(
   new Map<OriginalF3gKind,Float32Array>());
  expect(x.status).toBe('HOLD_INCOMPLETE_PINNED_SOURCE');
  expect(x.nearRecordedFootSamples).toBeNull();
  expect(x.actualRouteCertified).toBe(false);
 });
 it('does not classify a source plane 3m below as recorded foot support',()=>{
  // Intentionally artificial broad-plane fixtures: never original game data.
  const fake=(y:number)=>new Map<OriginalF3gKind,Float32Array>(
   ORIGINAL_F3G_KINDS.map(k=>[k,new Float32Array([
    0,y,1000,1000,y,-1000,-1000,y,-1000
   ])]));
  const lower=auditV23WindowsFallStaticHeightSection(fake(3));
  expect(lower.sampledPoints).toBe(21);
  expect(lower.nearRecordedFootSamples).toBe(0);
  const atFoot=auditV23WindowsFallStaticHeightSection(fake(6));
  expect(atFoot.nearRecordedFootSamples).toBe(21);
  expect(atFoot.actualRouteCertified).toBe(false);
 });
});

describe('V23 original optical preview remains independent of heavy Rapier review',()=>{
 const visual=()=>new URLSearchParams(
  't21Play=preview&t21FullSource=review&t21F3Registration=project');
 it('does not allocate an isolated physics review for ordinary visual loading',()=>{
  expect(v23ExplicitPhysicsReviewRequested(visual())).toBe(false);
  const only=visual();
  only.set('t21V23Physics','isolated');
  expect(v23ExplicitPhysicsReviewRequested(only)).toBe(true);
 });
 it('rejects duplicate, implicit or unsafe physics-review requests',()=>{
  const bad=visual();
  bad.set('t21V23Physics','isolated');
  bad.append('t21V23Physics','isolated');
  expect(v23ExplicitPhysicsReviewRequested(bad)).toBe(false);
  bad.delete('t21V23Physics');
  bad.set('t21V23Physics','true');
  expect(v23ExplicitPhysicsReviewRequested(bad)).toBe(false);
  bad.set('t21V23Physics','isolated');
  bad.set('production','1');
  expect(v23ExplicitPhysicsReviewRequested(bad)).toBe(false);
  bad.delete('production');
  bad.set('t21QaInput','deterministic');
  expect(v23ExplicitPhysicsReviewRequested(bad)).toBe(false);
  bad.delete('t21QaInput');
  bad.set('t21F3Registration','raw');
  expect(v23ExplicitPhysicsReviewRequested(bad)).toBe(false);
 });
});

describe('V23 authentic Windows airborne frames and hypothetical Y0 crossing',()=>{
 it('reproduces native 28m/s2 gravity and predicts full descent before testing a floor',()=>{
  const p=predictV23OriginalY0LandingFromNativeAir();
  expect(p.observedGravityConsistent).toBe(true);
  expect(p.predictedNativeTick).toBeCloseTo(1404.656356,3);
  expect(p.firstWholeNativeTickAtOrBelowY0).toBe(1405);
  expect(p.projectedXZ[0]).toBeCloseTo(1.441329,3);
  expect(p.projectedXZ[1]).toBeCloseTo(42.982578,3);
  expect(p.lastRecordedFootY).toBeCloseTo(2.8799814,5);
  expect(p.actualPost1390PlayerPathObserved).toBe(false);
  expect(p.sourceY0IsGameplayFloorCertified).toBe(false);
  expect(p.normalStageModified).toBe(false);
 });
});

describe('V23 actual zero-input per-axis deceleration is a separate hypothesis',()=>{
 it('records the nearly edge-bound Y0 crossing without granting collision',()=>{
  const p=predictV23ReleasedInputY0Position();
  expect(p.projectedXZ[0]).toBeCloseTo(.89547712538,5);
  expect(p.projectedXZ[1]).toBeCloseTo(43.82584747314,5);
  expect(p.actualPlayerInputAfter1390Observed).toBe(false);
  expect(p.rapierContactCertified).toBe(false);
  expect(p.liveStageModified).toBe(false);
 });
});

describe('V23 authentic native KCC horizontal input cases are separate',()=>{
 it('continues measured delta unchanged, but releases each axis at 34m/s²',()=>{
  const cont=v23HypotheticalAirXZDeltaAtTick(1,'CONTINUE');
  const released=v23HypotheticalAirXZDeltaAtTick(1,'RELEASE');
  expect(cont[0]).toBeCloseTo(.04236036539077759,7);
  expect(cont[1]).toBeCloseTo(-.0756072998046875,7);
  expect(released[0]).toBeCloseTo(.03291592094633315,7);
  expect(released[1]).toBeCloseTo(-.06616285536024306,7);
  expect(v23HypotheticalAirXZDeltaAtTick(8,'RELEASE')[0]).toBe(0);
  expect(v23HypotheticalAirXZDeltaAtTick(15,'RELEASE')[1]).toBe(0);
 });
 it('refuses invalid case/time without granting any physical authority',()=>{
  expect(()=>v23HypotheticalAirXZDeltaAtTick(0,'RELEASE')).toThrow();
  expect(()=>v23HypotheticalAirXZDeltaAtTick(41,'CONTINUE')).toThrow();
  expect(()=>v23HypotheticalAirXZDeltaAtTick(NaN,'RELEASE')).toThrow();
  expect(()=>v23HypotheticalAirXZDeltaAtTick(1,'FAKE' as 'CONTINUE')).toThrow();
  expect(predictV23ReleasedInputY0Position().rapierContactCertified).toBe(false);
 });
});

/** Run REAL Rapier 0.20.0 KCC with a synthetic, locally-defined Y0 plane.
 * This checks the two native-input controller branches and correct collider
 * ray mapping, NOT the original 11-face stage, 7.2.0 flags, human landing,
 * Recast, Scoreable, or official 4v4. No source mesh/asset is embedded.
 */
describe('V23 real isolated Rapier native-air mechanics on non-original fixture',()=>{
 beforeAll(async()=>{await initializeRapier()});
 it('tests continued/released input in separate TRUE KCC physics worlds',()=>{
  const frozen=undertowT21dConnectivityQaStage();
  const plane={
   id:V23_LOW_ISOLATED_SOLID_ID,
   center:[1.5,0,43] as const,size:[12,.01,12] as const,
   material:'medium' as const,render:false,
   projectileBlocker:false,cameraBlocker:false,
   collisionEnabled:true,navigationEnabled:false,
   // Upward-wound synthetic square. Test-only, not an original 7.2.0 face.
   triangleMesh:{
    vertices:[[-6,0,-6],[-6,0,6],[6,0,-6],[6,0,6]] as const,
    indices:[0,1,2,1,3,2] as const
   }
  };
  const isolated:StageDefinition={
   metadata:frozen.metadata,solids:[plane],paintSurfaces:[],navigationLinks:[]
  };
  const results=[] as ReturnType<typeof probeV23PredictedOriginalLowLandingKcc>[];
  for(const inputCase of ['CONTINUE','RELEASE'] as const){
   const physics=new RapierStagePhysics(1/60,isolated);
   try{
    physics.step();
    results.push(probeV23PredictedOriginalLowLandingKcc(
     physics,inputCase));
   }finally{physics.world.free();}
  }
  for(const [index,scenario] of (['CONTINUE','RELEASE'] as const).entries()){
   const r=results[index]!;
   expect(r.inputCase).toBe(scenario);
   expect(r.genuineRapierInIsolatedWorld).toBe(true);
   expect(r.status).toBe('ISOLATED_NATIVE_AIR_KCC_LANDED_ON_SOURCE_Y0_ONLY');
   expect(r.firstGroundedNativeTick).toBeGreaterThanOrEqual(1394);
   expect(r.firstGroundedNativeTick).toBeLessThanOrEqual(1410);
   expect(r.actualGroundedSolidId).toBe(V23_LOW_ISOLATED_SOLID_ID);
   expect(r.originalGameplayLandingCertified).toBe(false);
   expect(r.originalVersion72CollisionFlagsCertified).toBe(false);
   expect(r.normalStageModified).toBe(false);
  }
  // TypeScript's union includes HOLD responses without a grounded position:
  // narrow explicitly instead of claiming every isolated attempt lands.
  const continued=results[0]!,released=results[1]!;
  if(!('actualGroundedXZ' in continued)||
     !('actualGroundedXZ' in released))
   throw Error('T21_V23_SYNTHETIC_RAPIER_GROUND_CONTACT_NOT_OBSERVED');
  expect(continued.actualGroundedXZ).not.toEqual(released.actualGroundedXZ);
  expect(frozen.solids).toHaveLength(25);
  expect(frozen.paintSurfaces).toHaveLength(17);
  expect(frozen.navigationLinks).toHaveLength(26);
 });
});

/** Ephemeral SOURCE-only 11-face integration test.
 * The original source pack is downloaded to GitHub runner TEMP (not repo,
 * build, public/, upload artifact or action cache), SHA verified, then
 * erased by workflow trap on exit. No source bytes are embedded here.
 * Only the exact 2,146-Face FLOOR BIN may enter this private research test.
 * Collision flags, 7.2.0 actor placement and game route remain UNKNOWN.
 */
describe('V23 authentic pinned original 11-face isolated real Rapier',()=>{
 beforeAll(async()=>{await initializeRapier()});
 it.skipIf(!process.env.T21_V23_PINNED_FLOOR_BIN)(
  'uses EXACT original-source 11 faces, not synthetic geometry',()=>{
   const bytes=readFileSync(process.env.T21_V23_PINNED_FLOOR_BIN!);
   expect(bytes.byteLength).toBe(77256);
   const sha=createHash('sha256').update(bytes).digest('hex');
   expect(sha).toBe('c2769136586b9a68657a5a090bafbe58d2ffcd5f4af23cf6b9ca8e6073f38fe4');
   const byteCopy=Uint8Array.from(bytes).buffer;
   const bins=new Map<OriginalF3gKind,Float32Array>([
    ['FLOOR',new Float32Array(byteCopy)]
   ]);
   const original=undertowT21dConnectivityQaStage();
   const physical=new RapierStagePhysics(1/60,original);
   let candidate:ReturnType<typeof buildIsolatedV23LowOriginalFloor>;
   try{
    physical.step();
    candidate=buildIsolatedV23LowOriginalFloor(bins,original,physical);
   }finally{physical.world.free();}
   console.info('V23_REAL_11_FACE_BUILD_STATUS',JSON.stringify({
    status:candidate.status,triangles:candidate.triangles,
    hasIsolatedWorld:candidate.stage!==null,
    sourceVersionCollisionFlags:'UNKNOWN',originalRuntimeModified:false
   }));
   expect(candidate.status).toBe('ISOLATED_ORIGINAL_Y0_GEOMETRIC_CANDIDATE');
   expect(candidate.triangles).toBe(11);
   expect(candidate.stage).not.toBeNull();
   const isolated=candidate.stage!;
   expect(isolated.solids).toHaveLength(26);
   expect(isolated.solids.filter(s=>s.id===V23_LOW_ISOLATED_SOLID_ID))
    .toHaveLength(1);
   expect(isolated.paintSurfaces).toHaveLength(0);
   expect(isolated.navigationLinks).toHaveLength(0);
   const results=[] as ReturnType<typeof probeV23PredictedOriginalLowLandingKcc>[];
   for(const scenario of ['CONTINUE','RELEASE'] as const){
    const engine=new RapierStagePhysics(1/60,isolated);
    try{
     engine.step();
     results.push(probeV23PredictedOriginalLowLandingKcc(engine,scenario));
    }finally{engine.world.free();}
   }
   console.info('V23_REAL_11_FACE_KCC_ISOLATED',JSON.stringify(
    results.map(r=>({
     inputCase:r.inputCase,status:r.status,
     originalGameplayLandingCertified:r.originalGameplayLandingCertified,
     originalVersion72CollisionFlagsCertified:r.originalVersion72CollisionFlagsCertified,
     groundedTick:r.firstGroundedNativeTick,
     sourceId:'actualGroundedSolidId' in r?r.actualGroundedSolidId:null
    }))
   ));
   for(const [i,scenario] of (['CONTINUE','RELEASE'] as const).entries()){
    const observed=results[i]!;
    expect(observed.inputCase).toBe(scenario);
    expect(observed.originalGameplayLandingCertified).toBe(false);
    expect(observed.originalVersion72CollisionFlagsCertified).toBe(false);
    expect(observed.status).toBe(
     'ISOLATED_NATIVE_AIR_KCC_LANDED_ON_SOURCE_Y0_ONLY');
   }
   // Existing, previously unexecuted 40-tick HUMAN KCC validates 1m
   // continuous support over the EXACT same pinned 11-face component.
   // Synthetic start at Y0: NOT a continuous observed Windows trajectory
   // from the preceding native-air landing and NOT an original collision flag.
   const walkWorld=new RapierStagePhysics(1/60,isolated);
   let walk:ReturnType<typeof probeV23IsolatedLowHumanKcc>;
   try{
    walkWorld.step();
    walk=probeV23IsolatedLowHumanKcc(walkWorld);
   }finally{walkWorld.world.free();}
   console.info('V23_REAL_11_FACE_HUMAN_KCC_40_TICK',JSON.stringify({
    status:walk.status,supportedSteps:walk.supportedSteps,
    firstUnsupportedStep:walk.firstUnsupportedStep,
    endpointErrorMeters:walk.endpointErrorMeters,
    originalCollisionFlagsCertified:false,continuousWithNativeAir:false,
    stageModified:false
   }));
   expect(walk.status).toBe('ISOLATED_Y0_HUMAN_KCC_SUPPORT_ONLY');
   expect(walk.supportedSteps).toBe(40);
   expect(walk.firstUnsupportedStep).toBeNull();
   expect(walk.endpointErrorMeters).not.toBeNull();
   expect(walk.endpointErrorMeters!).toBeLessThanOrEqual(.12);
   expect(walk.originalCollisionFlagsCertified).toBe(false);
   expect(walk.cpuRecastCertified).toBe(false);
   expect(walk.normalGameModified).toBe(false);
   expect(original.solids).toHaveLength(25);
   expect(original.paintSurfaces).toHaveLength(17);
   expect(original.navigationLinks).toHaveLength(26);
  }
 );
});

/** The one-shot SHA-verified ephemeral F3G pack also permits an ORIGINAL
 * visual surface vs ACTUAL registered 25-Rapier-support coordinate audit.
 * These thirteen anchors include genuine Windows, K1 and NON-witness model
 * regions. No missing native support or optical-only material becomes floor.
 * Nothing from the upstream OBJ/mesh is embedded, uploaded or persisted.
 */
describe('V23 authentic pinned original 11-face isolated real Rapier / 13-anchor visual versus registered physics',()=>{
 beforeAll(async()=>{await initializeRapier()});
 it.skipIf(!process.env.T21_V23_PINNED_FLOOR_BIN)(
  'measures original-source 7-category planes against existing 25-solid Rapier',()=>{
   const floorPath=process.env.T21_V23_PINNED_FLOOR_BIN!;
   if(!floorPath.endsWith('/original-floor.bin'))
    throw Error('T21_V23_EPHEMERAL_SOURCE_PATH_INVALID');
   const dir=floorPath.slice(0,-'original-floor.bin'.length);
   const manifest=JSON.parse(readFileSync(dir+'manifest.json','utf8')) as {
    schema:string;sourceSHA256:string;productionAuthorization:boolean;
    groups:{kind:string;file:string;sha256:string;triangles:number;bytes:number}[]
   };
   expect(manifest.sourceSHA256).toBe(T21_F3G_SOURCE_SHA256);
   expect(manifest.productionAuthorization).toBe(false);
   expect(manifest.groups).toHaveLength(7);
   const verified=new Map<OriginalF3gKind,Float32Array>();
   for(const group of manifest.groups){
    if(!ORIGINAL_F3G_KINDS.includes(group.kind as OriginalF3gKind))
     throw Error('T21_V23_UNRECOGNIZED_SOURCE_KIND');
    if(group.file!=='original-'+group.kind.toLowerCase()+'.bin')
     throw Error('T21_V23_UNEXPECTED_SOURCE_FILE');
    const bytes=readFileSync(dir+group.file);
    expect(bytes.byteLength).toBe(group.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(group.sha256);
    const floatBuffer=Uint8Array.from(bytes).buffer;
    const scalars=new Float32Array(floatBuffer);
    expect(scalars.length).toBe(group.triangles*9);
    verified.set(group.kind as OriginalF3gKind,scalars);
   }
   const stage=undertowT21dConnectivityQaStage();
   const native=new RapierStagePhysics(1/60,stage);
   let audit:ReturnType<typeof auditF3gOriginalFloorAgainstRapier>;
   try{
    native.step();
    audit=auditF3gOriginalFloorAgainstRapier(verified,stage,native);
   }finally{native.world.free();}
   expect(audit.originalStage).toBe('25/17/26/0');
   expect(audit.rows).toHaveLength(ORIGINAL_F3G_FLOOR_SAMPLES.length);
   expect(audit.rows).toHaveLength(13);
   expect(audit.fullStageAlignmentCertified).toBe(false);
   expect(audit.newGameColliders).toBe(0);
   expect(audit.newGameNavigationLinks).toBe(0);
   const rows=audit.rows.map(r=>({
    id:r.id,provenance:r.provenance,
    opticalFloorKind:r.nearestSourceOpticalFloorKind,
    opticalFloorY:r.nearestSourceOpticalFloorY,
    recordedFootVsOpticalMeters:r.sourceOpticalFloorMinusRecordedFootMeters,
    registeredRapierSupportId:r.rapierSupportId,
    registeredRapierFootGapMeters:r.rapierFootGapMeters,
    opticalFloorVsRegisteredMeters:r.sourceOpticalFloorMinusRegisteredRapierMeters,
    originalCollisionFlagsCertified:false
   }));
   console.info('T21_V23_PINNED_SOURCE_VS_RAPIER_13_ANCHORS',JSON.stringify({
    certifiedSourceSha256:manifest.sourceSHA256,
    originalStage:audit.originalStage,rows,
    caveats:['MODEL_REGION_NOT_HUMAN_OBSERVATIONS',
     'MISSING_RAPIER_SUPPORT_REMAINS_UNKNOWN',
     'ORIGINAL_VERSION_COLLISION_FLAGS_UNKNOWN',
     'NO_GAME_STAGE_MODIFICATION']}));
   expect(rows.some(r=>r.provenance==='WINDOWS_NATIVE')).toBe(true);
   expect(rows.some(r=>r.provenance==='CHROMIUM_K1')).toBe(true);
   expect(rows.some(r=>r.provenance==='REGISTERED_MODEL_REGION')).toBe(true);
   expect(audit.rows.every(r=>r.fullF3gFaceCollisionAuthority==='UNKNOWN'&&
    !r.connectedWalkableRouteCertified)).toBe(true);
   expect([stage.solids.length,stage.paintSurfaces.length,
    stage.navigationLinks?.length]).toEqual([25,17,26]);
  }
 );
});
