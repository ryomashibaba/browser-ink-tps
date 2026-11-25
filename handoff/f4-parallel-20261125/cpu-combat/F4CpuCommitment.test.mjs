import {sameCpuFireLife,unemittedCpuMainDisposition,hasCpuMainWindup} from './F4CpuCommitment.mjs';
function runTests(){
 let n=0;const eq=(a,b,m)=>{if(a!==b)throw Error(m+": "+a+" != "+b);n++};
 const request={sourceId:"B1",team:2,weaponId:"wave-slosher",f4SourceLifeSerial:7,sourceInkTransaction:{chargedInkCost:7}};
 const bot={id:"B1",team:2,weaponId:"wave-slosher",f4LifeSerial:7,lifeState:"ACTIVE",hp:60};
 eq(sameCpuFireLife(request,bot),true,"same life");
 eq(sameCpuFireLife(request,{...bot,f4LifeSerial:8}),false,"new life");
 eq(sameCpuFireLife(request,null),false,"no actor");
 eq(sameCpuFireLife({...request,f4SourceLifeSerial:undefined},null),true,"legacy");
 eq(sameCpuFireLife({...request,f4SourceLifeSerial:NaN},bot),false,"invalid serial");
 eq(unemittedCpuMainDisposition(request,bot),"REFUND","living same paid actor");
 for(const [k,v] of [["id","B2"],["team",1],["weaponId","ink-saber"],["f4LifeSerial",8],["lifeState","SPLATTED"],["hp",0],["hp",NaN]])eq(unemittedCpuMainDisposition(request,{...bot,[k]:v}),"DROP_COUNT","no refund "+k);
 eq(unemittedCpuMainDisposition(request,null),"DROP_COUNT","missing actor");
 eq(unemittedCpuMainDisposition({...request,sourceInkTransaction:undefined},bot),"IGNORE","not paid");
 eq(unemittedCpuMainDisposition({...request,f4SourceLifeSerial:undefined},bot),"IGNORE","legacy untouched");
 eq(unemittedCpuMainDisposition({...request,f4SourceLifeSerial:NaN},bot),"IGNORE","bad life");
 eq(hasCpuMainWindup("B1"),false,"empty");
 const m=new Map([["B1",{}],["human",{}]]);
 eq(hasCpuMainWindup("B1",m),true,"slosher");
 eq(hasCpuMainWindup("B1",undefined,m),true,"canopy");
 eq(hasCpuMainWindup("B1",undefined,undefined,m),true,"saber");
 eq(hasCpuMainWindup("B2",m,m,m),false,"actor isolated");
 m.delete("B1");eq(hasCpuMainWindup("B1",m,m,m),false,"completion releases");
 return n;
}
console.log('CPU commitment assertions PASS:',runTests());
