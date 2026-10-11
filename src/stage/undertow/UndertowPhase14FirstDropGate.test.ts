import {describe,it,expect} from 'vitest';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as STAGE} from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES as PROBES,
  UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT} from './UndertowSpillwayConnectivityQa';
import {auditPhase14FirstDrop} from './UndertowPhase14FirstDropGate';
describe('T21 Phase14A first playable corridor acceptance, evidence-only',()=>{
 it('selects both existing one-way first drops for isolated QA, not game release',()=>{
  const a=auditPhase14FirstDrop(STAGE,PROBES);
  expect(a.readiness).toBe('ISOLATED_RUNTIME_QA_CANDIDATE');
  expect(a.blockers).toEqual([]);
  expect(a.existingGeometry).toEqual({solids:25,paintSurfaces:17,navigationLinks:26});
  expect(a.existingPartialPathProbeCounts).toEqual({mustReach:6,diagnosticGap:2});
  expect(a.sides.map(s=>s.side)).toEqual(['POSITIVE_Z','NEGATIVE_Z']);
  expect(a.sides.map(s=>s.oneWayLinkId))
   .toEqual(['first-drop-positive-z-3','first-drop-negative-z-3']);
  expect(a.sides.flatMap(s=>s.sourcePaintBackingSolidIds)).toHaveLength(4);
  expect(a).toMatchObject({
   sourceGeometryModified:false,generatedSolids:0,generatedPaintSurfaces:0,
   generatedNavigationLinks:0,runtimeActivationAuthorized:false,
   humanCharacterMovementVerified:false,squidCharacterMovementVerified:false,
   collisionGroundingVerified:false,runtimePaintVerified:false,
   cpuTraversalVerified:false,turfScoreabilityVerified:false,
   fullStageConnectivityVerified:false,releaseAuthorized:false
  });
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(STAGE.activationReady).toBe(false);
  expect(UNDERTOW_FULL_STAGE_CONNECTIVITY_AUDIT.fullStageConnectivityReady).toBe(false);
 });
 it('rejects an invented shortcut, promoted unresolved gap and missing collider',()=>{
  const shortcut=PROBES.map(p=>p.id==='right-low-to-underpass-positive-z'
   ?{...p,expectation:'MUST_REACH' as const}:p);
  expect(auditPhase14FirstDrop(STAGE,shortcut).blockers)
   .toContain('PHASE14_UNRESOLVED_UNDERPASS_PROMOTION:right-low-to-underpass-positive-z');
  const solidId='UndertowT21D:spawn-high-positive-z';
  const collisionOff={...STAGE,solids:STAGE.solids.map(s=>s.id===solidId
   ?{...s,collisionEnabled:false}:s)};
  expect(auditPhase14FirstDrop(collisionOff,PROBES).blockers)
   .toContain('PHASE14_MISSING_AUDITED_GROUND_COMPONENT:'+solidId);
  const prematurelyLive={...STAGE,activationReady:true};
  expect(auditPhase14FirstDrop(prematurelyLive,PROBES).readiness).toBe('BLOCKED');
 });
 it('rejects a reversed drop, unsupported Turf scoreability or missing source paint',()=>{
  const original=STAGE.navigationLinks.find(l=>l.id==='first-drop-negative-z-3')!;
  expect(original).toBeDefined();
  const flipped={...STAGE,navigationLinks:STAGE.navigationLinks.map(l=>l.id===original.id
   ?{...l,bidirectional:true}:l)};
  expect(auditPhase14FirstDrop(flipped,PROBES).blockers)
   .toContain('PHASE14_FIRST_DROP_ONE_WAY_NAV_CHANGED:negative-z');
  const id='UndertowT21D:first-drop-landing-negative-z';
  const noPaint={...STAGE,paintSurfaces:STAGE.paintSurfaces.filter(p=>p.backingSolidId!==id)};
  expect(auditPhase14FirstDrop(noPaint,PROBES).blockers)
   .toContain('PHASE14_AUDITED_PAINT_BACKING_CHANGED:'+id);
 });
});
