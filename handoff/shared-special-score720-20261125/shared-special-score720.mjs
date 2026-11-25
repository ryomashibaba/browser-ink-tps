// F4 only. No ownership writes, surface promotion, test fill or invented activation.
// Existing authoritative raster and physical executor remain the only writers.
export const KIT720=Object.freeze(Object.fromEntries(Object.entries({
 "pulse-sprayer":["ultraShot",210],"needle-smg":["chariot",200],"twin-comets":["chariot",190],
 "rail-charger":["blower",190],"arc-blaster":["superHook",170],"metro-roller":["greatBarrier",180],
 "dash-brush":["microLaser",180],"wave-slosher":["tripleTornado",200],"rotor-splatling":["waveBreaker",200],
 "canopy-guard":["tripleTornado",200],"chord-stringer":["microLaser",190],"ink-saber":["ultraStamp",190]
}).map(([k,v])=>[k,Object.freeze({special:v[0],required:v[1]})])));
const validId=x=>typeof x==="string"&&x.length>0;
const validTick=x=>Number.isSafeInteger(x)&&x>=0&&x<=10800;
const finiteNonneg=x=>Number.isFinite(x)&&x>=0;
const teamOK=x=>x===1||x===-1;
const SCORE=4, PAINT=1, WALL=8;
const EPS=1e-8;
function hold(reason){return {status:"HOLD",reason,winner:"NONE"}}
// Manifest entries must be constructed from actual collision/score authority by host.
// No manifest is supplied by this package. No research cells are admitted by default.
export class CertifiedTurf720 {
 #entries=new Map();#complete=false;#total=0;#roundId;
 constructor({roundId,entries=[],complete=false}){
  if(!validId(roundId)||!Array.isArray(entries))throw Error("invalid score context");this.#roundId=roundId;
  for(const e of entries){
   const s=e.surface;if(!s||!validId(s.id)||this.#entries.has(s.id)||!validId(e.evidenceId)||e.physicalBacked!==true||e.originalScoreAuthorized!==true)throw Error("invalid surface authority");
   if((s.baseFlags&(PAINT|SCORE))!==(PAINT|SCORE)||(s.baseFlags&WALL)!==0)throw Error("non-scoreable surface");
   const n=s.widthCells*s.heightCells;
   if(!Number.isSafeInteger(n)||n<=0||s.ownerGrid.length!==n||s.flagsGrid.length!==n||e.projectedAreaM2.length!==n)throw Error("invalid raster");
   const weights=Float64Array.from(e.projectedAreaM2);let sum=0;
   for(let j=0;j<n;j++){
    const w=weights[j];if(!finiteNonneg(w)||(w>0&&((s.flagsGrid[j]&(PAINT|SCORE))!==(PAINT|SCORE)||(s.flagsGrid[j]&WALL)!==0)))throw Error("unauthorized score cell");
    sum+=w
   }
   if(sum<=0||!Number.isFinite(sum))throw Error("empty authority entry");
   this.#entries.set(s.id,{surface:s,weights,flags:Uint16Array.from(s.flagsGrid)});this.#total+=sum
  }
  if(!Number.isFinite(this.#total))throw Error("invalid total");
  this.#complete=complete===true&&this.#total>0
 }
 get roundId(){return this.#roundId} get complete(){return this.#complete} get totalProjectedM2(){return this.#total}
 // Called once immediately AFTER actual GameplayInk changes a cell, never from GPU or request.
 // Does not reconstruct an ownership transition; oldOwner must be captured by actual raster.
 changedArea(surface,index,oldOwner,newOwner){
  const e=this.#entries.get(surface.id);if(!e||e.surface!==surface||!Number.isSafeInteger(index)||index<0||index>=e.weights.length||!teamOK(newOwner)||![0,1,-1].includes(oldOwner)||oldOwner===newOwner||surface.ownerGrid[index]!==newOwner||surface.flagsGrid[index]!==e.flags[index])return 0;
  return e.weights[index]
 }
 // Read the actual ownership arrays directly only at finalization; no second score grid.
 result({roundId,tick,roundEnded}){
  if(roundId!==this.#roundId||tick!==10800||roundEnded!==true)return hold("round-not-final");
  if(!this.#complete)return hold("score-authority-incomplete");
  let a=0,b=0,neutral=0;
  for(const {surface:s,weights,flags} of this.#entries.values())for(let j=0;j<weights.length;j++){
   if(s.flagsGrid[j]!==flags[j])return hold("score-authority-changed");
   const w=weights[j],o=s.ownerGrid[j];if(w===0)continue;
   if(o===1)a+=w;else if(o===-1)b+=w;else if(o===0)neutral+=w;else return hold("invalid-ownership")
  }
  const total=a+b+neutral;if(!Number.isFinite(total)||Math.abs(total-this.#total)>Math.max(EPS,total*EPS))return hold("area-inconsistent");
  // Do not invent original tie-breaking, or choose a winner using rounded HUD percentages.
  const diff=a-b, tie=Math.abs(diff)<=Math.max(EPS,total*EPS);
  return {status:tie?"HOLD":"READY",reason:tie?"tie-rule-unverified":null,winner:tie?"NONE":diff>0?"A":"B",areaA:a,areaB:b,neutralArea:neutral,totalProjectedM2:total,percentA:100*a/total,percentB:100*b/total}
 }
}
// One shared gauge for human and seven CPU. No debug fill or alternative score source.
// Port admission must be atomic, synchronous, and side-effect-free on false.
// Persistent projectiles/devices remain owned by the physical executor after cast ends.
export class SharedSpecial720 {
 #actors=new Map();#roundId;#turf;#pointsPerM2;#retention;#port;#lastPaintTick=-1;#lastPaintSequence=-1;#closed=false;#busy=false;
 constructor({roundId,turf,pointsPerProjectedM2,splatRetention,port}){
  if(!validId(roundId)||!(turf instanceof CertifiedTurf720)||turf.roundId!==roundId||!finiteNonneg(pointsPerProjectedM2)||pointsPerProjectedM2<=0||!finiteNonneg(splatRetention)||splatRetention>1||!port||typeof port.begin!=="function"||typeof port.step!=="function"||typeof port.cancel!=="function")throw Error("explicit calibration and real executor required");
  Object.assign(this,{});this.#roundId=roundId;this.#turf=turf;this.#pointsPerM2=pointsPerProjectedM2;this.#retention=splatRetention;this.#port=port
 }
 register({actorId,lifeId,team,weaponId,source}){
  if(this.#closed||!validId(actorId)||!validId(lifeId)||!teamOK(team)||!Object.hasOwn(KIT720,weaponId)||!["HUMAN","CPU"].includes(source)||this.#actors.has(actorId))throw Error("invalid actor");
  this.#actors.set(actorId,{actorId,lifeId,team,weaponId,source,points:0,active:false,alive:true,lastStep:-1,lastTick:-1,deathTick:null,lastActivationTick:-1,usedLives:new Set([lifeId]),activations:0})
 }
 state(actorId){const a=this.#actors.get(actorId);if(!a)return null;const k=KIT720[a.weaponId];const {usedLives,...view}=a;return {...view,...k,ready:!this.#closed&&this.#turf.complete&&a.alive&&!a.active&&a.points+EPS>=k.required,percent:100*a.points/k.required}}
 // Exactly one ordered callback per real immutable PaintEvent, after raster apply.
 // Sequence is the PaintCoordinator batch index. Projected delta comes from changedArea only.
 acceptPaint({roundId,tick,sequence,event,projectedChangedM2,lifeId}){
  if(this.#closed||roundId!==this.#roundId||!validTick(tick)||tick>=10800||!Number.isSafeInteger(sequence)||sequence<0||tick<this.#lastPaintTick||tick===this.#lastPaintTick&&sequence<=this.#lastPaintSequence)return 0;
  this.#lastPaintTick=tick;this.#lastPaintSequence=sequence;
  if(!this.#turf.complete||!event||event.tick!==tick||event.gaugeEligible===false||event.type==="SPECIAL"||event.type==="DEBUG"||!finiteNonneg(projectedChangedM2)||projectedChangedM2<=0)return 0;
  const a=this.#actors.get(event.actorId);
  if(!a||!a.alive||a.active||a.lifeId!==lifeId||tick<a.lastTick||event.team!==a.team||event.source!==a.source)return 0;
  a.lastTick=tick;
  const old=a.points;a.points=Math.min(KIT720[a.weaponId].required,old+projectedChangedM2*this.#pointsPerM2);return a.points-old
 }
 activate({roundId,tick,actorId,lifeId,input}){
  if(this.#closed||this.#busy||roundId!==this.#roundId||!validTick(tick)||tick>=10800)return false;
  const a=this.#actors.get(actorId),s=this.state(actorId);if(!a||!s.ready||lifeId!==a.lifeId||tick<a.lastTick||tick===a.lastActivationTick)return false;
  this.#busy=true;let ok;try{ok=this.#port.begin({roundId,tick,actorId,lifeId,team:a.team,special:s.special,input})===true}finally{this.#busy=false}
  if(!ok)return false;a.active=true;a.points=0;a.lastTick=tick;a.lastActivationTick=tick;a.activations++;return true
 }
 step({roundId,tick,actorId,lifeId,input}){
  if(this.#closed||roundId!==this.#roundId||!validTick(tick)||tick>=10800)return false;
  const a=this.#actors.get(actorId);if(!a||!a.alive||!a.active||a.lifeId!==lifeId||tick<a.lastTick||tick<=a.lastStep)return false;a.lastStep=tick;a.lastTick=tick;
  const r=this.#port.step({roundId,tick,actorId,lifeId,input});if(r?.ended===true)a.active=false;return true
 }
 splat({roundId,actorId,lifeId,tick}){
  const a=this.#actors.get(actorId);if(this.#closed||roundId!==this.#roundId||!validTick(tick)||!a||!a.alive||a.lifeId!==lifeId||tick<a.lastTick||tick>=10800)return false;
  if(a.active)this.#port.cancel({roundId,actorId,lifeId,tick,reason:"splat"});a.active=false;a.alive=false;a.deathTick=tick;a.lastTick=tick;a.points*=this.#retention;return true
 }
 respawn({roundId,actorId,oldLifeId,newLifeId,tick}){
  const a=this.#actors.get(actorId);if(this.#closed||roundId!==this.#roundId||!validTick(tick)||!a||a.alive||a.lifeId!==oldLifeId||!validId(newLifeId)||a.usedLives.has(newLifeId)||a.deathTick===null||tick<a.deathTick+150||tick<a.lastTick||tick>=10800)return false;
  a.usedLives.add(newLifeId);a.lifeId=newLifeId;a.alive=true;a.lastStep=-1;a.lastTick=tick;a.deathTick=null;return true
 }
 close(tick){if(this.#closed)return;if(!validTick(tick))throw Error("tick");this.#closed=true;for(const a of this.#actors.values())if(a.active){this.#port.cancel({roundId:this.#roundId,actorId:a.actorId,lifeId:a.lifeId,tick,reason:"round"});a.active=false}}
}
// CPU choice only; host input uses the SAME activation gate. No new aim or collision authority.
export function cpuWantsSpecial(state,obs){
 if(!state?.ready||!obs||obs.canAct!==true||obs.executorReady!==true||obs.safeToStart!==true)return false;
 const enemy=obs.visibleEnemy===true,pressure=obs.enemyThreat===true,place=obs.physicalPlacementCandidate===true;
 switch(state.special){
  case "greatBarrier":case "waveBreaker":return place&&(enemy||pressure||obs.contestedTurf===true);
  case "superHook":return obs.verifiedHookAndReturn===true&&enemy;
  case "blower":return pressure||obs.incomingEnemyProjectile===true;
  case "tripleTornado":return obs.physicalThrowCandidate===true&&(enemy||obs.contestedTurf===true);
  case "microLaser":return enemy||obs.validLockTarget===true;
  case "ultraShot":case "chariot":case "ultraStamp":return enemy;
  default:return false
 }
}
