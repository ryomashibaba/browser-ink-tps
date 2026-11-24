import {pelletGroups,cappedPelletDamage,canopyDamage,recoverClosedCanopy,remainingOpenInkCost,nearestPhysicalContact} from "./brellaPolicy.mjs";
function checks(pelletGroups,cappedPelletDamage,canopyDamage,recoverClosedCanopy,remainingOpenInkCost,nearestPhysicalContact){
 const ok=(v,m)=>{if(!v)throw new Error(m);};
 const g=pelletGroups();
 ok(g.map(x=>x.count).join(",")==="1,6,4"&&g.reduce((n,x)=>n+x.count,0)===11,"pellet groups");
 let sum=0;for(let i=0;i<11;i++)sum+=cappedPelletDamage(sum,16.2);ok(Math.abs(sum-81)<1e-8,"max near");
 sum=0;for(let i=0;i<11;i++)sum+=cappedPelletDamage(sum,10.8);ok(Math.abs(sum-81)<1e-8,"max far");
 ok(cappedPelletDamage(0,16.2)===16.2&&cappedPelletDamage(81,16.2)===0,"independent target and cap");
 ok(canopyDamage(500,100)===400&&canopyDamage(20,100)===0&&canopyDamage(500,100,.5)===450,"shield depletion");
 ok(recoverClosedCanopy(300,60,true)===450&&recoverClosedCanopy(490,60,true)===500&&recoverClosedCanopy(300,60,false)===300&&recoverClosedCanopy(0,60,true)===0,"recover only intact closed");
 let paid=0;for(let f=0;f<120;f++)paid+=remainingOpenInkCost(paid,.28);ok(Math.abs(paid-30)<1e-8,"opening capped at total 30");
 ok(nearestPhysicalContact([{kind:"body",distance:2},{kind:"canopy",distance:1}]).kind==="canopy"&&nearestPhysicalContact([{kind:"body",distance:1},{kind:"canopy",distance:2}]).kind==="body","real front or back contact");
 ok(nearestPhysicalContact([{kind:"canopy",distance:2},{kind:"terrain",distance:1}]).kind==="terrain"&&nearestPhysicalContact([])===null,"terrain first and miss");
 let bad=0;for(const f of [()=>cappedPelletDamage(-1,10),()=>recoverClosedCanopy(20,-1,true),()=>nearestPhysicalContact([{kind:"body",distance:NaN}])])try{f()}catch{bad++}ok(bad===3,"invalid rejected");
 return 10;
}
console.log("checks passed:",checks(pelletGroups,cappedPelletDamage,canopyDamage,recoverClosedCanopy,remainingOpenInkCost,nearestPhysicalContact));
