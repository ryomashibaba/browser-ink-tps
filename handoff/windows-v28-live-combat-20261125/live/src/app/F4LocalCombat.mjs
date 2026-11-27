// F4 only. Candidate ordering; no movement, LOS, HP or ink authority.
const finite=Number.isFinite;
const point=p=>p&&[p.x,p.y,p.z].every(finite);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Keep planar steering and original local foot/path limits. F4 callers
// that provide the real sight sample use the same 3D firing envelope.
const physicalAim=s=>point(s.enemy?.hitPoint)&&finite(s.muzzleHeight)&&s.muzzleHeight>=0;
const engagementDistance=(s,foot)=>physicalAim(s)
 ?Math.hypot(foot.x-s.enemy.hitPoint.x,foot.y+s.muzzleHeight-s.enemy.hitPoint.y,foot.z-s.enemy.hitPoint.z)
 :distance(foot,s.enemy.foot);
const ratios=Object.freeze({"SHOOTER":[0.4,0.78],"DUALIES":[0.32,0.76],"CHARGER":[0.65,0.94],"SPLATLING":[0.55,0.88],"SLOSHER":[0.45,0.82],"BLASTER":[0.56,0.87],"ROLLER":[0.18,0.78],"BRUSH":[0.12,0.8],"BRELLA":[0.32,0.75],"STRINGER":[0.6,0.92],"SPLATANA":[0.3,0.8]});
export function preferredBand(weaponClass,rangeM){
 const r=ratios[weaponClass];if(!Array.isArray(r)||!finite(rangeM)||rangeM<=0)return null;
 return {near:rangeM*r[0],far:rangeM*r[1],ideal:rangeM*(r[0]+r[1])*.5};
}

export function combatSpacing(weaponClass,rangeM,d,visible,recovering){
 const band=preferredBand(weaponClass,rangeM);
 if(!band||!finite(d)||d<0)return null;
 return {band,advance:recovering||d<band.near?-1:!visible||d>band.far?1:0};
}

export function rankCombatCandidate({distance:next,band,covered,ownInk,recovering,lateral,recentlyHit}){
 if(!finite(next)||!band||!finite(band.ideal)||!finite(lateral)||typeof covered!=="boolean")return -Infinity;
 if(recovering)return (covered?6:0)+(ownInk?2:0)+Math.min(next,band.far+3)*.2;
 return (covered?-5:0)-Math.abs(next-band.ideal)*.35+(lateral===0?-.2:recentlyHit?.45:.1)+(ownInk?.25:0);
}

export function tacticalIntent(s){
 if(!s||s.f4!==true||s.alive!==true||s.grounded!==true||s.rejoined!==true||
 s.localWalkingAllowed!==true||s.centerTransferPending!==false||s.respawnPending!==false||
 s.currentSupport!==true||!point(s.foot)||!finite(s.hp)||s.hp<=0||s.hp>100||
 !finite(s.ink)||s.ink<0||s.ink>100||s.specialActive===true||s.committedAction===true)return {mode:"BASELINE"};
 if(!s.enemy||s.enemy.alive!==true||s.enemy.visibleNow!==true||!point(s.enemy.foot))return {mode:"BASELINE"};
 const d=engagementDistance(s,s.foot),b=preferredBand(s.weaponClass,s.rangeM);
 if(!b||!finite(d)||d<.05||(!physicalAim(s)&&Math.abs(s.foot.y-s.enemy.foot.y)>2.4)||d>s.rangeM*1.25)return {mode:"BASELINE"};
 const recovering=s.recovering===true||s.hp<=35||s.ink<=15;
 const spacing=combatSpacing(s.weaponClass,s.rangeM,d,true,recovering);
 return {mode:spacing.advance<0?"RETREAT":spacing.advance>0?"APPROACH":"HOLD_RANGE",band:b,distance:d,recovering};
}

function lateralMove(from,to,enemy){
 const d=distance(from,enemy);
 return d>.05?Math.abs((to.x-from.x)*(enemy.z-from.z)-(to.z-from.z)*(enemy.x-from.x))/d:0;
}

function admissibleCombatMove(s,intent,p,ink,covered,minAdvance){
 const {band,distance:d,mode,recovering}=intent;
 const next=engagementDistance(s,p),lateral=lateralMove(s.foot,p,s.enemy.foot);
 if(mode==="RETREAT"){
  if(next>Math.max(d+2,band.far+1.2))return false;
  // A wounded bot may step sideways behind measured cover, not closer.
  if(recovering&&covered===true&&next>=d&&lateral>=minAdvance)return true;
  return next>=d+minAdvance;
 }
 if(mode==="APPROACH")return covered!==true&&next<=d-minAdvance&&next>=band.near;
 if(next<band.near||next>band.far||ink==="ENEMY"||covered===true)return false;
 const improvesInk=s.inkRelation==="ENEMY"&&ink!=="UNKNOWN"||
    s.ink<40&&s.inkRelation!=="OWN"&&ink==="OWN";
 // Do not stand still on neutral turf if a real lateral firing lane exists.
 return improvesInk||(covered===false&&lateral>=minAdvance);
}

export function chooseLocalCombatGoal(s,candidates,admit,{maxChecks=3}={}){
 const intent=tacticalIntent(s);
 if(intent.mode==="BASELINE"||!Array.isArray(candidates)||typeof admit!=="function"||!Number.isSafeInteger(maxChecks)||maxChecks<1||maxChecks>3)return null;
 const {band,distance:d,mode,recovering}=intent;
 const options=[];
 for(let i=0;i<candidates.length;i++){
  const c=candidates[i];
  if(!c||c.existingNativePoint!==true||c.localTrafficAllowed!==true||!point(c.foot)||!["OWN","NEUTRAL","ENEMY","UNKNOWN"].includes(c.inkRelation))continue;
  const move=distance(s.foot,c.foot),next=engagementDistance(s,c.foot);
  if(move<.35||move>3.2||Math.abs(c.foot.y-s.foot.y)>.45||!finite(next))continue;
  if(!admissibleCombatMove(s,intent,c.foot,c.inkRelation,c.coveredFromEnemy,.20))continue;
  const turf=c.inkRelation==="OWN"?1:c.inkRelation==="ENEMY"?-1.4:0;
  const benefit=(Math.abs(d-band.ideal)-Math.abs(next-band.ideal))/Math.max(.1,s.rangeM);
  const lateral=lateralMove(s.foot,c.foot,s.enemy.foot);
  const score=(recovering?Math.min(2,next-d)*.7+(c.coveredFromEnemy===true?4:0):benefit*2)
   +turf-move*.12+(mode==="HOLD_RANGE"?Math.min(1,lateral)*(s.recentlyHit?.7:.35):0);
  options.push({c,score,i});
 }
 options.sort((a,b)=>b.score-a.score||a.i-b.i);
 let checks=0;
 for(const {c} of options){
  if(checks>=maxChecks)break;
  checks++;
  const result=admit(c.foot,mode);
  if(!result||result.reached!==true||result.staticSupport!==true||result.trafficAllowed!==true||!point(result.step))continue;
  const stepDistance=distance(s.foot,result.step);
  if(stepDistance<.05||stepDistance>3.2||Math.abs(result.step.y-s.foot.y)>.45)continue;
  // Check the actual native first leg, not the candidate endpoint.
  if(!admissibleCombatMove(s,intent,result.step,result.inkRelation??"UNKNOWN",result.coveredFromEnemy,.05))continue;
  return {mode,step:{x:result.step.x,y:result.step.y,z:result.step.z},checks};
 }
 return null;
}
