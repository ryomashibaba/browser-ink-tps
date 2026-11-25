import {recoveringInk,recoveryAction,shouldThrowCombatSub,mergedRecovery} from './F4CpuRecoveryPolicy.mjs';
function runTests(){
 let n=0;const eq=(a,b,m)=>{if(a!==b)throw Error(m+": "+a+" != "+b);n++};
 eq(recoveringInk(false,18,100),true,"enter");
 eq(recoveringInk(false,18.1,100),false,"above threshold");
 eq(recoveringInk(true,44.9,100),true,"hysteresis");
 eq(recoveringInk(true,45,100),false,"exit");
 eq(recoveringInk(true,NaN,100),false,"invalid tank");
 eq(recoveringInk(false,9,50),true,"capacity normalized");
 const s={recovering:true,committed:false,ink:12,minCost:3,range:10,visible:true,distance:4};
 eq(recoveryAction(s),"DEFEND","close visible threat");
 eq(recoveryAction({...s,distance:8}),"RECOVER","distant threat");
 eq(recoveryAction({...s,visible:false}),"RECOVER","covered threat");
 eq(recoveryAction({...s,ink:2}),"RECOVER","dry");
 eq(recoveryAction({...s,committed:true,ink:2}),"FINISH","committed action remains native");
 eq(recoveryAction({...s,recovering:false}),"NORMAL","not recovering");
 eq(recoveryAction({...s,distance:NaN}),"RECOVER","invalid distance");
 eq(recoveryAction({...s,range:2.45,distance:2}),"DEFEND","short melee defense");
 const b={subId:"pulse-bomb",visible:true,mainTargetVisible:false,committed:false,recovering:false,ink:95,cost:70,capacity:100,distance:9,mainRange:5,subMin:2.6,subMax:11.5};
 eq(shouldThrowCombatSub(b),true,"out of main range real sub opportunity");
 for(const subId of ["anchor-bomb","snap-bomb","torpedo"])eq(shouldThrowCombatSub({...b,subId}),true,subId);
 for(const subId of ["sprinkler","poison-mist","curling-bomb"])eq(shouldThrowCombatSub({...b,subId}),false,subId);
 for(const [k,v] of [["ink",94],["distance",4],["subMax",8],["mainTargetVisible",true],["visible",false],["committed",true],["recovering",true],["cost",NaN]])eq(shouldThrowCombatSub({...b,[k]:v}),false,k);
 eq(mergedRecovery(1.2,.4),1.2,"keep longer lock");
 eq(mergedRecovery(.4,1.2),1.2,"extend lock");
 eq(mergedRecovery(0,0),0,"zero valid");
 eq(mergedRecovery(1,NaN),null,"NaN");
 eq(mergedRecovery(-1,1),null,"negative");
 // Simulated tank progression only; recovery policy never changes ink.
 let latch=false,ink=17;
 for(let i=0;i<28;i++){latch=recoveringInk(latch,ink,100);eq(latch,true,"recovering until actual threshold "+i);ink++;}
 eq(recoveringInk(latch,ink,100),false,"actual recovery reached threshold");
 return n;
}
console.log('CPU recovery assertions PASS:',runTests());
