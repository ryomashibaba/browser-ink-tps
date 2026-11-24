import {planSlosh,sloshDamage,canApplySwingHit,markResolvedSwingHit} from "./slosherPlan.mjs";
function testSuite(planSlosh,sloshDamage,canApplySwingHit,markResolvedSwingHit){
  const check=(x,msg)=>{if(!x)throw Error(msg);};
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const a=planSlosh(true), b=planSlosh(false);
  check(eq(a.map(x=>x.offsetF),[0,1,2,3,4,6,8,10,12]),"emission schedule");
  check(a.filter(x=>x.group==="HEAD").length===4&&a.filter(x=>x.group==="TAIL").length===5,"group counts");
  check(Math.abs(a[3].speedRaw-1.2809)<1e-9&&Math.abs(a[8].speedRaw-.3)<1e-9,"speed decrement");
  check(b[0].speedRaw===1.6852&&b[4].speedRaw===1,"air origin speeds");
  check(a.every(x=>x.fieldRadiusEndRaw>0&&x.playerRadiusEndRaw>0),"positive collision endpoints");
  check(eq([-1,1.5,4.5625,7.625,99].map(x=>sloshDamage("HEAD",x)),[70,70,60,50,50])&&sloshDamage("TAIL",99)===50,"height falloff");
  const seen=new Set();check(canApplySwingHit(seen,"B1:life1"),"initial contact");markResolvedSwingHit(seen,"B1:life1");check(!canApplySwingHit(seen,"B1:life1")&&canApplySwingHit(seen,"B2:life1")&&canApplySwingHit(seen,"B1:life2")&&canApplySwingHit(new Set(),"B1:life1"),"swing-local target scope");
  let invalid=0;for(const f of [()=>planSlosh(null),()=>sloshDamage("HEAD",NaN),()=>canApplySwingHit(seen,"")])try{f()}catch{invalid++}check(invalid===3,"invalid inputs");
  return 8;
}
console.log("Checks passed:",testSuite(planSlosh,sloshDamage,canApplySwingHit,markResolvedSwingHit));
