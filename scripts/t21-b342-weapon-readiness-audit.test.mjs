import test from 'node:test';
import assert from 'node:assert/strict';
import {b342WeaponSourceReadiness} from './t21-b342-weapon-readiness-audit.mjs';
test('11 original-inspired classes do not imply original fidelity',()=>{
 const a=b342WeaponSourceReadiness();
 assert.equal(a.modelledClasses.length,11);
 assert.equal(a.modeledProjectWeaponCount,12);
 assert.equal(a.perfectOriginalWeaponCertified,false);
 assert.deepEqual(a.mainVerticalSliceOrder,['SHOOTER','ROLLER','CHARGER']);
});
test('source boundary and no fabricated result are preserved',()=>{
 const a=b342WeaponSourceReadiness();
 assert.equal(a.nativeCpuTurfFamilies.length,6);
 assert.equal(a.scoreablePromotions,0);
 assert.equal(a.originalSolidsWritten,0);
 assert.equal(a.originalNavLinksWritten,0);
 assert.equal(a.originalOpponentRoutesCertified,'0/12');
 assert.equal(a.productionAuthorized,false);
});
test('concrete firing budget risk and missing art proof remain explicit',()=>{
 const a=b342WeaponSourceReadiness();
 assert.equal(a.evidenceHazards.length,6);
 assert(a.evidenceHazards.find(x=>x.kind==='RESOURCE')?.evidence.includes('before checking'));
 assert(a.evidenceHazards.find(x=>x.kind==='ART'));
 assert.equal(a.artAccepted,false);
});
