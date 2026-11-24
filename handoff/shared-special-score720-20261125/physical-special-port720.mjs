import {startTornadoCast,acceptTornadoGuide,tornadoPulse,waveFronts,acceptWaveHit} from "../special720-20261125/special720.mjs";
import {startUltraShot,stepUltraShot,orbitalOffsets,laserDamagePulse,acceptLaserContact} from "../special720-next-20261125/special720-next.mjs";
import {Crab720,Barrier720} from "../crab-barrier720-20261125/crab-barrier720.mjs";
import {InkVac720,Stamp720,Zip720} from "../vac-stamp-zip720-20261125/vac-stamp-zip720.mjs";
// Shared F4 physical port; host implements actual physics, never stub acceptance.
const id=v=>typeof v==="string"&&v.length>0;
const f=v=>Number.isSafeInteger(v)&&v>=0;
const p=v=>Number.isFinite(v)&&v>0;
const team=v=>v===1?"A":v===-1?"B":null;
const methods=(o,n)=>o&&n.every(k=>typeof o[k]==="function");
const req={ultraShot:["launchVolley"],chariot:["physicalMode","changeMode","launch"],greatBarrier:["deploy"],waveBreaker:["deploy"],tripleTornado:["launchGuide"],microLaser:["launchPair"],blower:["consume","launch"],ultraStamp:["swing","launchThrow"],superHook:["queryHook","beginHook","stepHook","cancelHook","detach","beginReturn","stepReturn"]};
export function waveDevice({roundId,deviceId,tick,radiusM,physicalPlacementAccepted}){
 if(!id(roundId)||!id(deviceId)||!f(tick)||!p(radiusM)||physicalPlacementAccepted!==true)throw Error("physical placement required");
 const ledger=new Set();let dead=null,last=tick;
 const fronts=(t,r)=>{if(r!==roundId||!f(t)||t<last)return [];last=t;return waveFronts(t-tick,radiusM).filter(w=>dead===null||tick+w.emitF<dead)};
 return {deviceId,fronts,destroy(t){if(!f(t)||t<last)throw Error("clock");last=t;if(dead===null)dead=t},hit(h){return fronts(h.tick,h.roundId).some(w=>w.index===h.waveIndex)&&acceptWaveHit(ledger,{...h,deviceId})?45:0},finished(t){return t>tick+550}}
}
export function laserPair({roundId,pairId,tick,physicalLaunchAccepted}){
 if(!id(roundId)||!id(pairId)||!f(tick)||physicalLaunchAccepted!==true)throw Error("physical launch required");
 const ledger=new Set(),beamIds=[pairId+":0",pairId+":1"];return {beamIds,damage(h){if(h.roundId!==roundId||!beamIds.includes(h.beamId)||!f(h.tick))return 0;return acceptLaserContact(ledger,{...h,ageF:h.tick-tick})},finished(t){return t>=tick+216}}
}
function controller(q,c){
 const b={tick:q.tick,roundId:q.roundId,lifeId:q.scoped,team:team(q.team)};
 switch(q.special){
 case "ultraShot":if(!f(c.readyDelayF))throw Error("timing");return startUltraShot(b.tick,b.roundId,b.lifeId,c.readyDelayF);
 case "chariot":if(!id(c.armorId))throw Error("armor");return null;
 case "greatBarrier":case "waveBreaker":
  if(!f(c.readyDelayF)||!f(c.castLimitF)||c.castLimitF<=c.readyDelayF|| (q.special==="greatBarrier"?(!p(c.minRadiusM)||!p(c.maxRadiusM)||c.minRadiusM>c.maxRadiusM):!p(c.radiusM)))throw Error("placement calibration");
  return {ready:q.tick+c.readyDelayF,end:q.tick+c.castLimitF};
 case "tripleTornado":if(!f(c.readyDelayF)||!f(c.repeatF)||c.repeatF<1)throw Error("timing");return startTornadoCast(b.tick,b.roundId,b.lifeId);
 case "microLaser":if(!f(c.pairIntervalF)||c.pairIntervalF<1||!f(c.actionLockF))throw Error("timing");return {pairs:0,next:q.tick,end:q.tick};
 case "blower":return new InkVac720({...c,...b});
 case "ultraStamp":return new Stamp720({...c,...b});
 case "superHook":return new Zip720({...c,...b});
 default:throw Error("special")
 }
}
export class PhysicalSpecialPort720{
 #active=new Map();#host;#round;#closed=false;
 constructor({roundId,host}){if(!id(roundId)||!methods(host,["prepare"]))throw Error("host");this.#round=roundId;this.#host=host}
 begin(q){
  if(this.#closed||q.roundId!==this.#round||!f(q.tick)||q.tick>=10800||!id(q.actorId)||!id(q.lifeId)||!team(q.team)||!Object.hasOwn(req,q.special)||this.#active.has(q.actorId))return false;
  const ctx=Object.freeze({...q,scoped:JSON.stringify([q.actorId,q.lifeId])}),plan=this.#host.prepare(ctx);if(!plan)return false;
  let s;try{if(!methods(plan,["commit","abort","finish"])||!methods(plan.ops,req[q.special]))throw Error("missing physical operation");
   s=controller(ctx,plan.config||{});if(plan.commit()!==true){plan.abort();return false}
   if(q.special==="chariot")s=new Crab720({tick:q.tick,roundId:q.roundId,lifeId:ctx.scoped,team:team(q.team),armorId:plan.config.armorId,physicalArmorInstalled:plan.ops.physicalMode()==="turret"});
  }catch(e){if(typeof plan.abort==="function")plan.abort();return false}
  this.#active.set(q.actorId,{ctx,plan,s,last:q.tick-1});return true
 }
 #get(q){const a=this.#active.get(q.actorId);return a&&q.roundId===this.#round&&q.lifeId===a.ctx.lifeId?a:null}
 #finish(a,reason,tick){this.#active.delete(a.ctx.actorId);a.plan.finish(reason,tick);return {ended:true,reason}}
 step(q){
  const a=this.#get(q);if(!a||this.#closed)return {ended:true,reason:"inactive"};if(!f(q.tick)||q.tick>=10800||q.tick<=a.last)return {ended:false,ignored:true};a.last=q.tick;
  const {ctx,plan}=a,o=plan.ops,c=plan.config||{},x=q.input||{},b={tick:q.tick,roundId:q.roundId,lifeId:ctx.scoped,alive:true};let s=a.s,r;
  switch(ctx.special){
  case "ultraShot":r=stepUltraShot(s,{...b,trigger:x.trigger===true},v=>o.launchVolley({...v,aim:x.aim,orbitalOffsets})===true);a.s=r.state;if(!r.state||r.finished)return this.#finish(a,"completed",q.tick);break;
  case "chariot":r=s.step({...b,roll:x.roll===true,rapid:x.rapid===true,cannon:x.cannon===true,physicalMode:o.physicalMode()},o);if(r.ended)return this.#finish(a,r.ended.reason,q.tick);break;
  case "tripleTornado":
   if(q.tick>=s.startTick+360)return this.#finish(a,"timeout",q.tick);
   if(x.trigger===true&&q.tick>=s.startTick+c.readyDelayF&&(s.lastThrowTick===null||q.tick>=s.lastThrowTick+c.repeatF)){
    const guideId=JSON.stringify([q.roundId,ctx.scoped,s.startTick,s.accepted]);
    if(o.launchGuide({guideId,tick:q.tick,aim:x.aim,tornadoPulse})===true){a.s=acceptTornadoGuide(s,{tick:q.tick,roundId:q.roundId,ownerLifeId:ctx.scoped,realLaunchAccepted:true});if(a.s.accepted===3)return this.#finish(a,"completed",q.tick)}
   }break;
  case "greatBarrier":case "waveBreaker":
   if(q.tick>=s.end)return this.#finish(a,"timeout",q.tick);
   if(q.tick>=s.ready&&x.trigger===true){
    let made=false;
    const factory=z=>{if(made)throw Error("duplicate factory");const result=ctx.special==="greatBarrier"?new Barrier720({tick:q.tick,roundId:q.roundId,team:team(ctx.team),deviceId:z.deviceId,physicalPlacementAccepted:z.physicalPlacementAccepted,minRadiusM:c.minRadiusM,maxRadiusM:c.maxRadiusM}):waveDevice({tick:q.tick,roundId:q.roundId,deviceId:z.deviceId,physicalPlacementAccepted:z.physicalPlacementAccepted,radiusM:c.radiusM});made=true;return result};
    const accepted=o.deploy({tick:q.tick,aim:x.aim,factory})===true;if(accepted!==made)throw Error("physical deployment contract");if(accepted)return this.#finish(a,"deployed",q.tick)
   }break;
  case "microLaser":
   if(s.pairs===3&&q.tick>=s.end)return this.#finish(a,"completed",q.tick);
   if(s.pairs<3&&q.tick>=s.next){let made=false;const pairId=JSON.stringify([q.roundId,ctx.scoped,ctx.tick,s.pairs]);
    const factory=z=>{if(made)throw Error("duplicate factory");const result=laserPair({roundId:q.roundId,pairId,tick:q.tick,physicalLaunchAccepted:z.physicalLaunchAccepted});made=true;return result};
    const accepted=o.launchPair({tick:q.tick,aim:x.aim,pairId,factory})===true;if(accepted!==made)throw Error("physical pair contract");if(accepted){s.pairs++;s.next=q.tick+c.pairIntervalF;s.end=q.tick+c.actionLockF}else if(q.tick>=ctx.tick+360)return this.#finish(a,"launch-timeout",q.tick)
   }break;
  case "blower":case "ultraStamp":case "superHook":
   r=s.step({...x,...b},o);if(r.phase==="ended")return this.#finish(a,r.reason,q.tick);break;
  }return {ended:false}
 }
 contact(q){
  const a=this.#get(q);if(!a||!f(q.tick)||q.tick>=10800)return null;const b={...q,lifeId:a.ctx.scoped,alive:true};
  switch(a.ctx.special){case "chariot":return a.s.hit({...b,sourceTeam:team(q.sourceTeam)});case "blower":return a.s.absorb({...b,sourceTeam:team(q.sourceTeam)},a.plan.ops);case "ultraStamp":return a.s.contact({...b,targetTeam:team(q.targetTeam)});default:return null}
 }
 closeSwing(q){const a=this.#get(q);if(a?.ctx.special!=="ultraStamp")return false;a.s.closeSwing(q.swingId);return true}
 spendZipMain(q,commit){const a=this.#get(q);return a?.ctx.special==="superHook"?a.s.spendMain(q.cost,commit):false}
 cancel(q){const a=this.#get(q);if(a)this.#finish(a,q.reason,q.tick)}
 close(tick){this.#closed=true;for(const a of this.#active.values())this.#finish(a,"round",tick)}
}
