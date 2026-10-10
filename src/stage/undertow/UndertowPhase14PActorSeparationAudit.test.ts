import {describe,expect,it} from 'vitest';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {auditPhase14PActorSeparation} from './UndertowPhase14PActorSeparationAudit';
describe('T21 Phase14P eight-actor source-true visual overlap is explicitly not physical collision authority',()=>{
 it('detects the EXACT Chrome evidence B4 almost sharing a real player foot at F380',()=>{
  const human=[2.777132272720337,3.02474081993103,-53.759193420410156] as const;
  const result=auditPhase14PActorSeparation(human,[
   {id:'A1',foot:[2.459609,3.10,55.561115]},
   {id:'A2',foot:[3.971557,3.10,55.026913]},
   {id:'A3',foot:[3.309526,3.10,54.913528]},
   {id:'B1',foot:[1.759957,3.10,-55.543999]},
   {id:'B2',foot:[2.486282,3.10,-53.307472]},
   {id:'B3',foot:[0.579337,3.10,-53.442276]},
   {id:'B4',foot:[2.724739,3.10,-53.858051]}
  ]);
  expect(result.cpuCount).toBe(7);
  expect(result.closestCpu).toBe('B4');
  expect(result.closestHorizontalMeters).toBeLessThan(.12);
  expect(result.nearVisualContacts.map(x=>x.id)).toContain('B4');
  expect(result.nearVisualContacts.map(x=>x.id)).toContain('B2');
  expect(result.possibleHumanCpuVisualOverlap).toBe(true);
  expect(result.sharedDynamicHumanCpuColliderWorld).toBe(false);
  expect(result.humanCpuPhysicalCollisionApproved).toBe(false);
  expect(result.nearVisualContacts[0]!.visualProximityThresholdMeters)
    .toBeCloseTo(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+.29,8);
  console.log('T21_PHASE14P_REAL_ACTORS_NEAR_CONTACT_NOT_APPROVED',JSON.stringify(result));
 });
 it('does not mistake genuine higher-island/falling actors for grounded overlaps',()=>{
  const result=auditPhase14PActorSeparation([2.77,3.025,-53.75],[
   {id:'B1',foot:[2.77,7.6,-53.75]},
   {id:'B2',foot:[9,3.1,-53.75]}
  ]);
  expect(result.nearVisualContacts).toHaveLength(0);
  expect(result.possibleHumanCpuVisualOverlap).toBe(false);
  expect(result.humanCpuPhysicalCollisionApproved).toBe(false);
 });
 it('rejects corrupted/untrusted positions and repeated actor IDs',()=>{
  expect(()=>auditPhase14PActorSeparation([NaN,3,0],[])).toThrow(
   'T21_PHASE14P_PLAYER_SOURCE_FOOT_NONFINITE');
  expect(()=>auditPhase14PActorSeparation([0,3,0],[
   {id:'A1',foot:[0,3,0]},{id:'A1',foot:[2,3,0]}
  ])).toThrow('T21_PHASE14P_CPU_SOURCE_FOOT_NONFINITE_OR_DUPLICATE');
 });
});
