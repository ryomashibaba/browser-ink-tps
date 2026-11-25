import * as impl from "./f4-local-combat.mjs";
export function run({preferredBand,tacticalIntent,chooseLocalCombatGoal}){
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const foot=(x,y=0,z=0)=>({x,y,z});
 const base={f4:true,alive:true,grounded:true,rejoined:true,localWalkingAllowed:true,centerTransferPending:false,respawnPending:false,currentSupport:true,foot:foot(0),hp:100,ink:100,inkRelation:"OWN",weaponClass:"CHARGER",rangeM:20,enemy:{alive:true,visibleNow:true,foot:foot(8)}};
 const c=(x,inkRelation="OWN",y=0,z=0)=>({foot:foot(x,y,z),existingNativePoint:true,localTrafficAllowed:true,inkRelation});
 const admit=step=>({reached:true,staticSupport:true,trafficAllowed:true,step});
 ok("all weapon classes have bands",["SHOOTER","DUALIES","CHARGER","SPLATLING","SLOSHER","BLASTER","ROLLER","BRUSH","BRELLA","STRINGER","SPLATANA"].every(x=>preferredBand(x,10)));
 ok("use current native range",preferredBand("CHARGER",20).near===13&&preferredBand("CHARGER",10).near===6.5);
 ok("unknown range hold",preferredBand("CHARGER",NaN)===null);
 ok("charger too close",tacticalIntent(base).mode==="RETREAT");
 ok("brush same distance out of range",tacticalIntent({...base,weaponClass:"BRUSH",rangeM:2.45}).mode==="BASELINE");
 ok("dead/airborne/staging/no support",["alive","grounded","rejoined","currentSupport"].every(k=>tacticalIntent({...base,[k]:false}).mode==="BASELINE"));
 ok("reserved central or respawn",["centerTransferPending","respawnPending"].every(k=>tacticalIntent({...base,[k]:true}).mode==="BASELINE"));
 ok("unknown transfer refused",tacticalIntent({...base,centerTransferPending:undefined}).mode==="BASELINE");
 ok("stale sight refused",tacticalIntent({...base,enemy:{...base.enemy,visibleNow:false}}).mode==="BASELINE");
 ok("committed shot or special unchanged",["committedAction","specialActive"].every(k=>tacticalIntent({...base,[k]:true}).mode==="BASELINE"));
 ok("retreat no charge toward enemy",chooseLocalCombatGoal(base,[c(1),c(-2)],admit).step.x===-2);
 ok("not fabricated point",chooseLocalCombatGoal(base,[{...c(-2),existingNativePoint:false}],admit)===null);
 ok("no traffic reservation bypass",chooseLocalCombatGoal(base,[{...c(-2),localTrafficAllowed:false}],admit)===null);
 ok("reject disconnected path",chooseLocalCombatGoal(base,[c(-2)],x=>({...admit(x),reached:false}))===null);
 ok("reject unsupported endpoint",chooseLocalCombatGoal(base,[c(-2)],x=>({...admit(x),staticSupport:false}))===null);
 ok("reject first leg toward enemy",chooseLocalCombatGoal(base,[c(-2)],()=>admit(foot(.5)))===null);
 ok("reject large height change",chooseLocalCombatGoal(base,[c(-2,"OWN",1)],admit)===null);
 let n=0;chooseLocalCombatGoal(base,[c(-1),c(-1.5),c(-2),c(-2.5)],()=>{n++;return null});ok("bounded three expensive checks",n===3);
 const far={...base,enemy:{...base.enemy,foot:foot(20)}};
 ok("approach on current range",tacticalIntent(far).mode==="APPROACH"&&chooseLocalCombatGoal(far,[c(-1),c(2)],admit).step.x===2);
 const inband={...base,enemy:{...base.enemy,foot:foot(16)}};
 ok("healthy in band no unnecessary target",chooseLocalCombatGoal(inband,[c(-1),c(1)],admit)===null);
 ok("low HP disengage",tacticalIntent({...inband,hp:30}).mode==="RETREAT");
 ok("low ink disengage",tacticalIntent({...inband,ink:10}).mode==="RETREAT");
 ok("own ink recovery preference",chooseLocalCombatGoal({...inband,ink:30,inkRelation:"NEUTRAL"},[c(1,"ENEMY"),c(-1,"OWN")],admit).step.x===-1);
 ok("null when no safe move",chooseLocalCombatGoal(base,[],admit)===null);
 return checks
}
console.log(run(impl));
