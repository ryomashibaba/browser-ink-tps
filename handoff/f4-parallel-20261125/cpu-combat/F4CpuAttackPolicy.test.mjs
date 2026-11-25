import {chooseRailRelease,reachablePreference} from './F4CpuAttackPolicy.mjs';
function railCharge(fraction) {
  const charge = Math.min(1, Math.max(0, fraction));
  const full = charge >= 1 - 1e-8;
  const depth = 2.73 + (1.56 - 2.73) * charge;
  const overlap = full ? 0.34 : 0.125 + (0.25 - 0.125) * charge;
  return {
    range: 9.033 + (24.037 - 9.033) * charge,
    damage: full ? 160 : 40 + 40 * charge,
    inkCost: 2.25 + (18 - 2.25) * charge,
    depth,
    width: 0.34 + 0.30 * charge,
    spacing: 2 * depth * (1 - overlap),
    impact: full ? 1.05 : 0.38 + 0.48 * charge
  };
}


function runTests(railCharge){
 let n=0;const eq=(a,b,m)=>{if(a!==b)throw Error(m+": "+a+" != "+b);n++};
 const near=(a,b,m)=>{if(Math.abs(a-b)>1e-7)throw Error(m+": "+a+" != "+b);n++};
 const base={heldSeconds:0,dt:1/60,fullSeconds:1,minSeconds:.12,distance:15,ink:100,recentlyHit:false};
 function simulate(s,max=120){let held=s.heldSeconds;for(let tick=1;tick<=max;tick++){let r=chooseRailRelease({...s,heldSeconds:held},railCharge);held=r.heldSeconds;if(r.releaseFraction!==null)return {tick,fraction:r.releaseFraction};}return null;}
 let r=simulate(base);eq(r.tick,60,"full 60 ticks");near(r.fraction,1,"full fraction");
 r=simulate({...base,distance:4});eq(r.tick,21,"close partial");near(r.fraction,.35,"actual held partial");
 r=simulate({...base,distance:10,recentlyHit:true});eq(r.tick,21,"under fire partial");
 r=simulate({...base,distance:10,ink:8});eq(r.tick,8,"affordable quick partial");eq(railCharge(r.fraction).inkCost<=8,true,"actual cost");eq(railCharge(r.fraction).range>=10,true,"actual reach");
 eq(simulate({...base,distance:20,ink:5}),null,"cannot buy range");
 eq(simulate({...base,distance:25}),null,"out of range");
 eq(simulate({...base,ink:1}),null,"dry");
 eq(chooseRailRelease({...base,heldSeconds:.8,ink:4},railCharge).releaseFraction,null,"no charge truncation");
 eq(chooseRailRelease({...base,heldSeconds:.8,ink:4},railCharge).heldSeconds,0,"dry release hold resets");
 eq(chooseRailRelease({...base,dt:NaN},railCharge).heldSeconds,0,"invalid dt");
 eq(chooseRailRelease({...base,distance:NaN},railCharge).releaseFraction,null,"invalid target");
 const p=(x,y,z)=>({x,y,z}),o=p(0,1,0),a=[{id:"HUMAN",body:p(15,1,0)},{id:"B2",body:p(4,1,0)},{id:"B3",body:p(3,4,0)}];
 eq(reachablePreference(o,a,"HUMAN",10),null,"out of weapon range");
 eq(reachablePreference(o,a,"HUMAN",20),"HUMAN","actual nearby human");
 eq(reachablePreference(o,a,"B2",10),"B2","actual attacker");
 eq(reachablePreference(o,a,"B3",10),null,"height veto");
 eq(reachablePreference(o,a,"A2",10),null,"absent/ally");
 eq(reachablePreference(o,a,null,10),null,"no preference");
 return n;
}
console.log('CPU attack policy assertions PASS:',runTests(railCharge));
