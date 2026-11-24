const test=require('node:test'),a=require('node:assert/strict');
const {planDualiesShot,dualiesDamage}=require('./build/dualiesShot.js');
test('normal alternating single shot plans',()=>{let side='LEFT',n=0;const seen=[];for(let i=0;i<8;i++){const p=planDualiesShot('NORMAL',true,side,n);seen.push(p.side);a.equal(p.cadenceF,5);a.equal(p.inkPercent,.72);side=p.nextSide;n=p.nextAcceptedOrdinal;}a.deepEqual(seen,['LEFT','RIGHT','LEFT','RIGHT','LEFT','RIGHT','LEFT','RIGHT']);});
test('rejected attempt does not advance caller state',()=>{const a1=planDualiesShot('NORMAL',true,'RIGHT',3);const a2=planDualiesShot('NORMAL',true,'RIGHT',3);a.deepEqual(a1,a2);});
test('physical roll lock blocks shot plan',()=>{a.equal(planDualiesShot('ROLL_LOCK',true,'LEFT',2),null);});
test('focused cadence and zero spread, air normal 7.5',()=>{const f=planDualiesShot('FOCUSED',true,'LEFT',2);a.equal(f.cadenceF,4);a.equal(f.spreadDeg,0);a.equal(planDualiesShot('NORMAL',false,'LEFT',2).spreadDeg,7.5);});
test('foot paint follows accepted-shot period across stance',()=>{const hits=[];for(let i=0;i<15;i++)if(planDualiesShot(i%2?'NORMAL':'FOCUSED',true,'LEFT',i,2).nearestSplash)hits.push(i+1);a.deepEqual(hits,[2,9]);});
test('damage endpoints and midpoint',()=>{a.deepEqual([0,7,11,15,30].map(t=>dualiesDamage(t)),[30,30,22.5,15,15]);});
test('reject invalid inputs',()=>{a.throws(()=>planDualiesShot('NORMAL',true,'LEFT',-1));a.throws(()=>dualiesDamage(NaN));a.throws(()=>planDualiesShot('NORMAL',true,'LEFT',0,0));});
