import {describe,it,expect} from 'vitest';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from './UndertowSpillwayBlockoutGeometry';
import {auditB119OriginalFirstDropLanding as audit}
 from './UndertowPhase14QFirstDropPassiveProxyGate';
describe('B119 original-only first drop human passive agent gate',()=>{
 it('matches native tick 175 grounded original first-drop positive Z foot',()=>{
  const w=audit({x:-.1737196147441864,y:3.0249975967407225,
   z:54.13089370727539},frozen.solids);
  expect(w.withheld).toBe(true);
  expect(w.originalSourceSolidId)
   .toBe('UndertowT21D:first-drop-landing-positive-z');
  expect(w.sourceTopYMeters).toBe(3);
  expect(w.physicalHumanPositionModified).toBe(false);
  expect(w.sevenCpuPositionsModified).toBe(false);
  expect(w.humanCpuCollisionCertified).toBe(false);
  expect(w.originalAuthority).toEqual([25,17,26,0]);
 });
 it('withholds on both existing registered mirrored original landings',()=>{
  for(const side of ['positive-z','negative-z']){
   const original=frozen.solids.find(s=>
    s.id==='UndertowT21D:first-drop-landing-'+side)!;
   const w=audit({x:original.center[0],y:3.01,z:original.center[2]},
    frozen.solids);
   expect(w.originalSourceSolidId).toBe(original.id);
  }
 });
 it('does not withhold off original layer or outside actual polygon',()=>{
  const physical={x:-.1737196147441864,z:54.13089370727539};
  expect(audit({...physical,y:4.2},frozen.solids).withheld).toBe(false);
  expect(audit({x:90,y:3,z:90},frozen.solids).withheld).toBe(false);
  expect(audit({x:0,y:7.5,z:64},frozen.solids).withheld).toBe(false);
 });
 it('rejects non-source geometry and nonfinite physical player feet',()=>{
  expect(()=>audit({x:0,y:3,z:54},[...frozen.solids]))
   .toThrow('T21_B119_ORIGINAL_STAGE_FROZEN_SOURCE_REQUIRED');
  expect(()=>audit({x:NaN,y:3,z:54},frozen.solids))
   .toThrow('T21_B119_NONFINITE_ORIGINAL_HUMAN_FOOT');
 });
});
