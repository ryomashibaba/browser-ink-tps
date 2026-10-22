import {describe,it,expect} from 'vitest';
import {auditB114OriginalFootprint,type B114RayContact}
 from './W10B114OriginalFootprintAudit';
const none:B114RayContact={sourceSolidId:null,gapMeters:null};
function audit(center:B114RayContact,probe:(dx:number,dz:number)=>B114RayContact,
 mode:'HUMAN'|'SQUID'='HUMAN'){
 return auditB114OriginalFootprint({
  tick:120,body:[0,8.4,64],mode,capsuleRadiusMeters:.4,
  center,originalRapierProbe:probe
 });
}
describe('W10-B114 authentic KCC-width source-foot evidence',()=>{
 it('original center with four actual edge hits is not a floor-hole certificate',()=>{
  const v=audit({sourceSolidId:'original-high',gapMeters:.025},
   ()=>({sourceSolidId:'original-high',gapMeters:.04}));
  expect(v.probes).toHaveLength(5);
  expect(v.probes.map(p=>p.name)).toEqual([
   'CENTER','FRONT','BACK','LEFT','RIGHT']);
  expect(v.classification).toBe('CENTER_AND_EDGE_SOURCE_RAYS');
  expect(v.nearCenter).toBe(true);
  expect(v.originalFloorHoleCertified).toBe(false);
  expect(v.genuineCapsuleContactCertified).toBe(false);
  expect(v.originalGeometryAdded).toBe(0);
 });
 it('distinguishes near-original edge-only support from no near rays',()=>{
  const v=audit(none,(x,z)=>x<0?
   {sourceSolidId:'original-left-edge',gapMeters:.1}:none);
  expect(v.classification).toBe('EDGE_ONLY_SOURCE_RAY');
  expect(v.observedSourceSolidIds).toEqual(['original-left-edge']);
  expect(v.probes[3]!.offsetX).toBeCloseTo(-.32);
  expect(v.nearCenter).toBe(false);
  expect(v.nearPerimeter).toBe(true);
  const fullyNone=audit(none,()=>none,'SQUID');
  expect(fullyNone.classification).toBe('NO_NEAR_ORIGINAL_SOURCE_RAY');
  expect(fullyNone.mode).toBe('SQUID');
  expect(fullyNone.originalFloorHoleCertified).toBe(false);
 });
 it('a far-below original hit is not a near source floor witness',()=>{
  const v=audit({sourceSolidId:'low-floor',gapMeters:1},
   ()=>({sourceSolidId:'low-floor',gapMeters:.7}));
  expect(v.observedSourceSolidIds).toEqual(['low-floor']);
  expect(v.classification).toBe('NO_NEAR_ORIGINAL_SOURCE_RAY');
 });
 it('rejects fabricated original IDs, NaNs and implausible body/capsule geometry',()=>{
  expect(()=>audit(none,()=>({sourceSolidId:'',gapMeters:0})))
   .toThrow('B114_ORIGINAL_RAPIER_RAY_INVALID_ID_OR_GAP');
  expect(()=>audit(none,()=>({sourceSolidId:'original',gapMeters:NaN})))
   .toThrow('B114_ORIGINAL_RAPIER_RAY_INVALID_ID_OR_GAP');
  expect(()=>auditB114OriginalFootprint({tick:1,
   body:[0,NaN,0],mode:'HUMAN',capsuleRadiusMeters:.4,
   center:none,originalRapierProbe:()=>none}))
   .toThrow('B114_INVALID_GENUINE_SOURCE_FOOTPRINT_INPUT');
 });
});
