import {describe,it,expect} from 'vitest';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';
import {auditF3gPackManifest,buildIsolatedFirstDropOriginalTriangleStage,
 buildIsolatedV23LowOriginalFloor,V23_LOW_ISOLATED_SOLID_ID,
 auditV23WindowsFallStaticHeightSection,ORIGINAL_F3G_KINDS,
 v23ExplicitPhysicsReviewRequested,
 v23HasSourceUpwardFloorWinding,predictV23OriginalY0LandingFromNativeAir,
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
