// F4 720: shared human/CPU execution controllers; no gauge admission here.
export const CRAB=Object.freeze({duration:480,hp:500,firstShot:20,rollExit:20,exitLock:25,cannonInterval:75,cannonDirect:60,cannonBlast:30,rollDamage:40});
export const BARRIER=Object.freeze({hp:1536,fieldFactor:.64,decayPerTick:92.1/60,ignition:15});
const tickOK=t=>Number.isSafeInteger(t)&&t>=0;
const positive=x=>Number.isFinite(x)&&x>0;
const idOK=x=>typeof x==="string"&&x.length>0;
function ensureIds(...ids){if(!ids.every(idOK))throw new TypeError("missing authority id")}
function monotonic(t,last){if(!tickOK(t)||t<last)throw new RangeError("nonmonotonic tick")}
// Candidate interpolation; raw RepeatFrame_First=12, Term=90, Bias=.2; 4F floor community.
export function crabRepeat(heldF){if(!tickOK(heldF))throw new RangeError("age");return Math.max(4,Math.round(12-8*Math.min(1,heldF/90)))}
export function crabProjectileDamage(age){if(!tickOK(age))throw new RangeError("age");return 32-16*Math.min(1,Math.max(0,(age-9)/16))}
export class Crab720 {
 constructor({tick,roundId,lifeId,team,armorId,physicalArmorInstalled}){
  ensureIds(roundId,lifeId,team,armorId);monotonic(tick,0);if(physicalArmorInstalled!==true)throw new Error("actual armor required");
  Object.assign(this,{roundId,lifeId,team,armorId,start:tick,last:tick-1,clock:tick,hp:500,mode:"turret",ready:tick+20,nextShot:tick+20,heldSince:null,shotCount:0,ended:null,seen:new Set()});
 }
 end(reason,tick){if(!this.ended)this.ended={reason,tick,actionUnlockTick:tick+(reason==="death"||reason==="round"?0:25)};return this.ended}
 step({tick,roundId,lifeId,alive,roll,rapid,cannon,physicalMode},port){
  monotonic(tick,this.clock);if(this.ended)return {ended:this.ended};if(roundId!==this.roundId)return {ended:this.end("round",tick)};if(lifeId!==this.lifeId||alive!==true)return {ended:this.end("death",tick)};
  if(tick>=this.start+480)return {ended:this.end("timeout",this.start+480)};if(tick===this.last)return {duplicate:true};this.last=tick;this.clock=tick;
  const requested=roll?"ball":"turret";
  if(requested!==this.mode){this.heldSince=null;if(port.changeMode({armorId:this.armorId,mode:requested})===true){this.mode=requested;if(requested==="turret")this.ready=Math.max(this.ready,tick+20)}}
  // A stale or unconfirmed collider configuration cannot fire.
  if(this.mode==="ball"||physicalMode!==this.mode||roll){this.heldSince=null;return {mode:this.mode,shot:null}}
  if(cannon||!rapid)this.heldSince=null;
  if(tick<this.ready||tick<this.nextShot)return {mode:this.mode,shot:null};
  if(cannon){if(port.launch({kind:"cannon",armorId:this.armorId,tick,direct:60,blast:30})!==true)return {rejected:true};this.nextShot=tick+75;this.ready=Math.max(this.ready,tick+32);return {shot:"cannon"}}
  if(rapid){if(this.heldSince===null)this.heldSince=tick;const muzzle=this.shotCount%2;if(port.launch({kind:"rapid",armorId:this.armorId,tick,muzzle,damageMax:32,damageMin:16})!==true)return {rejected:true};this.shotCount++;this.nextShot=tick+crabRepeat(tick-this.heldSince);return {shot:"rapid",muzzle}}
  return {mode:this.mode,shot:null}
 }
 hit({tick,roundId,armorId,eventId,sourceTeam,damage,objectMultiplier,firstPhysicalHit}){
  monotonic(tick,this.clock);if(this.ended||roundId!==this.roundId||armorId!==this.armorId||tick>=this.start+480||firstPhysicalHit!=="armor"||!idOK(sourceTeam)||sourceTeam===this.team||!idOK(eventId)||this.seen.has(eventId)||!positive(damage)||!positive(objectMultiplier))return {accepted:false};
  this.clock=tick;this.seen.add(eventId);const applied=Math.min(this.hp,damage*objectMultiplier);this.hp=Math.max(0,this.hp-applied);if(this.hp===0)this.end("armorDestroyed",tick);return {accepted:true,applied,hp:this.hp,ended:this.ended}
 }
}
// Barrier stays independent of owner life after real placement. Only round reset destroys it by lifecycle.
export class Barrier720 {
 constructor({tick,roundId,deviceId,team,physicalPlacementAccepted,minRadiusM,maxRadiusM}){
  ensureIds(roundId,deviceId,team);monotonic(tick,0);if(physicalPlacementAccepted!==true||!positive(minRadiusM)||!positive(maxRadiusM)||maxRadiusM<minRadiusM)throw new Error("real placement and calibration required");
  Object.assign(this,{roundId,deviceId,team,ignition:tick+15,last:tick,hp:1536,minRadiusM,maxRadiusM,ended:false,seen:new Set()})
 }
 advance(tick,roundId){monotonic(tick,this.last);if(this.ended)return false;if(roundId!==this.roundId){this.ended=true;return false}
  const elapsed=Math.max(0,tick-Math.max(this.last,this.ignition));this.last=tick;this.hp=Math.max(0,this.hp-elapsed*BARRIER.decayPerTick);if(this.hp<=1e-8){this.hp=0;this.ended=true}return !this.ended
 }
 // Candidate shrink curve until raw Hermite semantics are independently confirmed.
 radius(tick,roundId){if(!this.advance(tick,roundId)||tick<this.ignition)return 0;const k=Math.max(0,Math.min(1,(this.hp/1536-.1940299)/(1-.1940299)));return this.minRadiusM+(this.maxRadiusM-this.minRadiusM)*k}
 hit({tick,roundId,deviceId,eventId,sourceTeam,damage,objectMultiplier,firstPhysicalHit,enteringFromOutside}){
  if(!this.advance(tick,roundId)||deviceId!==this.deviceId||!idOK(sourceTeam)||sourceTeam===this.team||!idOK(eventId)||this.seen.has(eventId)||!positive(damage)||!positive(objectMultiplier))return {accepted:false};
  const field=firstPhysicalHit==="field"&&tick>=this.ignition&&enteringFromOutside===true;
  const weak=firstPhysicalHit==="device"||(firstPhysicalHit==="top"&&tick>=this.ignition);
  if(!field&&!weak)return {accepted:false};
  this.seen.add(eventId);const applied=Math.min(this.hp,damage*objectMultiplier*(field?.64:1));this.hp=Math.max(0,this.hp-applied);if(this.hp===0)this.ended=true;return {accepted:true,blockProjectile:field,applied,hp:this.hp,destroyed:this.ended}
 }
}
