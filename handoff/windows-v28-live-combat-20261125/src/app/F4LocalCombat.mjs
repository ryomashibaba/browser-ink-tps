// F4 only. Candidate ordering, not movement/LOS/HP/ink authority.
const finite=Number.isFinite;
const point=p=>p&&[p.x,p.y,p.z].every(finite);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ratios=Object.freeze({
 SHOOTER:[.40,.78],DUALIES:[.32,.76],CHARGER:[.65,.94],
 SPLATLING:[.55,.88],SLOSHER:[.45,.82],BLASTER:[.56,.87],
 ROLLER:[.30,.80],BRUSH:[.35,.85],BRELLA:[.32,.75],
 STRINGER:[.60,.92],SPLATANA:[.36,.80]
});
export function preferredBand(weaponClass,rangeM){
 const r=ratios[weaponClass];if(!r||!finite(rangeM)||rangeM<=0)return null;
 return {near:rangeM*r[0],far:rangeM*r[1],ideal:rangeM*(r[0]+r[1])*.5};
}
// Only operate on a real living rejoined CPU, a current visible physical
// enemy, an unreserved local walking context, and actual equipped range.
// Unknown values fail closed. Original CPU navigation remains in charge.
export function tacticalIntent(s){
 if(!s||s.f4!==true||s.alive!==true||s.grounded!==true||s.rejoined!==true||
 s.localWalkingAllowed!==true||s.centerTransferPending!==false||s.respawnPending!==false||
 s.currentSupport!==true||!point(s.foot)||!finite(s.hp)||s.hp<=0||s.hp>100||
 !finite(s.ink)||s.ink<0||s.ink>100)return {mode:"BASELINE"};
 if(!s.enemy||s.enemy.alive!==true||s.enemy.visibleNow!==true||!point(s.enemy.foot))return {mode:"BASELINE"};
 const b=preferredBand(s.weaponClass,s.rangeM);if(!b)return {mode:"BASELINE"};
 const d=distance(s.foot,s.enemy.foot);
 if(!finite(d)||d<.05||Math.abs(s.foot.y-s.enemy.foot.y)>2.4||d>s.rangeM*1.25)return {mode:"BASELINE"};
 if(s.specialActive===true||s.committedAction===true)return {mode:"BASELINE"};
 // Do not chase with an empty tank; retreat preference only, no synthetic refill.
 const retreat=s.hp<=35||s.ink<=15||d<b.near;
 if(retreat)return {mode:"RETREAT",band:b,distance:d};
 if(d>b.far)return {mode:"APPROACH",band:b,distance:d};
 return {mode:"HOLD_RANGE",band:b,distance:d};
}
// Choose ONLY among actual existing source waypoints or real native path samples.
// Candidate positions are not generated here. Admission callbacks must be
// side-effect-free and use existing Recast+Rapier+traffic rules. Final KCC unchanged.
export function chooseLocalCombatGoal(s,candidates,admit,{maxChecks=3}={}){
 const intent=tacticalIntent(s);
 if(intent.mode==="BASELINE"||!Array.isArray(candidates)||typeof admit!=="function"||!Number.isSafeInteger(maxChecks)||maxChecks<1||maxChecks>3)return null;
 const {band,distance:d,mode}=intent;
 const options=[];
 for(let i=0;i<candidates.length;i++){
  const c=candidates[i];
  if(!c||c.existingNativePoint!==true||c.localTrafficAllowed!==true||!point(c.foot)||!["OWN","NEUTRAL","ENEMY","UNKNOWN"].includes(c.inkRelation))continue;
  const move=distance(s.foot,c.foot),next=distance(c.foot,s.enemy.foot);
  if(move<.35||move>3.2||Math.abs(c.foot.y-s.foot.y)>.45||!finite(next))continue;
  // No retreat deeper into the opponent or beyond the useful local envelope.
  if(mode==="RETREAT"&&(next<d+.2||next>Math.max(d+2,band.far+1.2)))continue;
  if(mode==="APPROACH"&&(next>d-.2||next<band.near))continue;
  if(mode==="HOLD_RANGE"&&(next<band.near||next>band.far||c.inkRelation==="ENEMY"))continue;
  // In-band movement only when there is a genuine advantage: leave enemy ink
  // or reach friendly ink for low resources. Avoid aim jitter / meaningless strafes.
  if(mode==="HOLD_RANGE"&&!(s.inkRelation==="ENEMY"&&c.inkRelation!=="ENEMY"||s.ink<40&&s.inkRelation!=="OWN"&&c.inkRelation==="OWN"))continue;
  const turf=c.inkRelation==="OWN"?1.0:c.inkRelation==="ENEMY"?-1.4:0;
  const benefit=(Math.abs(d-band.ideal)-Math.abs(next-band.ideal))/Math.max(.1,s.rangeM);
  const retreatGain=mode==="RETREAT"?clamp((next-d)/2,0,1):0;
  const score=benefit*2+retreatGain+turf-move*.12;
  options.push({c,score,i})
 }
 options.sort((a,b)=>b.score-a.score||a.i-b.i);
 let checks=0;
 for(const {c} of options){
  if(checks++>=maxChecks)break;
  const result=admit(c.foot,intent.mode);
  // Return the ACTUAL admitted native first walking step, not a projection
  // reconstructed here. Require fresh support and complete native route.
  if(!result||result.reached!==true||result.staticSupport!==true||result.trafficAllowed!==true||!point(result.step))continue;
  const stepDistance=distance(s.foot,result.step);
  if(stepDistance<.05||stepDistance>3.2||Math.abs(result.step.y-s.foot.y)>.45)continue;
  const stepEnemy=distance(result.step,s.enemy.foot);
  if(mode==="RETREAT"&&stepEnemy<=d+.01)continue;
  if(mode==="APPROACH"&&stepEnemy>=d-.01)continue;
  if(mode==="HOLD_RANGE"&&(stepEnemy<band.near||stepEnemy>band.far))continue;
  return {mode,step:{x:result.step.x,y:result.step.y,z:result.step.z},checks};
 }
 return null
}
