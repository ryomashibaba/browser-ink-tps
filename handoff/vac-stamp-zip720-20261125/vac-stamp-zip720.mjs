// F4 physical execution contracts, not gauge admission or collision authority.
const id=x=>typeof x==="string"&&x.length>0, pos=x=>Number.isFinite(x)&&x>0, tick=x=>Number.isSafeInteger(x)&&x>=0;
class Cast{
 constructor(c){if(!tick(c.tick)||![c.roundId,c.lifeId,c.team].every(id))throw Error("identity");Object.assign(this,{roundId:c.roundId,lifeId:c.lifeId,team:c.team,start:c.tick,clock:c.tick,phase:"active",reason:null})}
 end(reason){this.phase="ended";this.reason=reason;return this.status()}
 status(){return {phase:this.phase,reason:this.reason}}
 live(i){if(!tick(i.tick)||i.tick<this.clock)throw Error("nonmonotonic clock");this.clock=i.tick;if(this.phase==="ended")return false;if(i.roundId!==this.roundId||i.lifeId!==this.lifeId||i.alive!==true){this.end("lifecycle");return false}return true}
}
export class InkVac720 extends Cast{
 constructor(c){super(c);if(![c.capacity,c.minRadiusM,c.maxRadiusM].every(pos)||c.minRadiusM>c.maxRadiusM)throw Error("calibration required");Object.assign(this,{phase:"suction",capacity:c.capacity,minRadiusM:c.minRadiusM,maxRadiusM:c.maxRadiusM,charge:0,held:false,seen:new Set()})}
 transition(t){this.phase="transition";this.held=false;this.ready=t+20;this.deadline=this.ready+150}
 advance(t){if(this.phase==="suction"&&t>=this.start+360)this.transition(this.start+360);if(this.phase==="transition"&&t>=this.ready)this.phase="exhale"}
 step(i,p){if(!this.live(i))return this.status();this.advance(i.tick);if(this.phase==="suction")this.held=i.hold===true;
 if(this.phase==="exhale"&&(i.fire===true||i.tick>=this.deadline)){const fraction=this.charge/this.capacity;if(p.launch({tick:i.tick,roundId:this.roundId,lifeId:this.lifeId,damage:220,fraction,radiusM:this.minRadiusM+(this.maxRadiusM-this.minRadiusM)*fraction})===true)return this.end("fired");return {...this.status(),rejected:true}}
 return this.status()}
 absorb(i,p){if(!this.live(i))return false;this.advance(i.tick);if(this.phase!=="suction"||!this.held||!id(i.projectileId)||!id(i.sourceTeam)||i.sourceTeam===this.team||i.eligible!==true||i.physicalContact!==true||i.unoccluded!==true||!pos(i.chargeValue)||this.seen.has(i.projectileId))return false;
 if(p.consume(i.projectileId)!==true)return false;this.seen.add(i.projectileId);this.charge=Math.min(this.capacity,this.charge+i.chargeValue);if(this.charge>=this.capacity)this.transition(i.tick);return true}
}
export class Stamp720 extends Cast{
 constructor(c){super(c);if(!tick(c.firstSwingF)||!tick(c.repeatF)||c.repeatF===0||!tick(c.throwDelayF))throw Error("animation calibration required");Object.assign(this,{next:this.start+c.firstSwingF,repeat:c.repeatF,delay:c.throwDelayF,seq:0,swings:new Set(),hits:new Map()})}
 step(i,p){if(!this.live(i))return this.status();if(i.tick>=this.start+450)return this.end("timeout");
 if(i.holdThrow&&this.phase==="active")this.phase="aimThrow";if(i.releaseThrow&&this.phase==="aimThrow"){this.phase="throwPending";this.throwAt=i.tick+this.delay}
 if(this.phase==="throwPending"&&i.tick>=this.throwAt){if(p.launchThrow({tick:i.tick,roundId:this.roundId,lifeId:this.lifeId,direct:220,near:60,far:30})===true)return this.end("thrown");return {...this.status(),rejected:true}}
 if(this.phase==="active"&&i.holdStamp&&i.tick>=this.next){const swingId=JSON.stringify([this.roundId,this.lifeId,this.start,this.seq]);if(p.swing({tick:i.tick,swingId,mode:i.airborne?"air":"ground"})!==true)return {...this.status(),rejected:true};this.seq++;this.swings.add(swingId);this.next=i.tick+this.repeat;return {...this.status(),swingId}}
 return this.status()}
 closeSwing(s){this.swings.delete(s);for(const k of this.hits.keys())if(JSON.parse(k)[0]===s)this.hits.delete(k)}
 contact(i){if(!this.live(i)||i.tick>=this.start+450||!this.swings.has(i.swingId)||!id(i.targetLifeId)||!id(i.targetTeam)||i.targetTeam===this.team||i.liveTarget!==true||i.physicalContact!==true)return 0;const d=i.hitClass==="direct"?100:i.hitClass==="splash"?40:0,k=JSON.stringify([i.swingId,i.targetLifeId]),old=this.hits.get(k)||0;if(d<=old)return 0;this.hits.set(k,d);return d-old}
}
export class Zip720 extends Cast{
 constructor(c){super(c);if(!id(c.returnAnchorId)||c.physicalReturnAnchorVerified!==true||![c.maxHookM,c.inkCapacity,c.passiveDrainPerTick,c.hookCost].every(pos))throw Error("verified return and calibration required");Object.assign(this,{phase:"free",returnAnchorId:c.returnAnchorId,maxHookM:c.maxHookM,ink:c.inkCapacity,drain:c.passiveDrainPerTick,cost:c.hookCost,lastDrain:this.start,ready:this.start,hook:null})}
 step(i,p){if(!this.live(i))return this.status();const t=i.tick;
 if(!["returnHold","returning"].includes(this.phase)){this.ink=Math.max(0,this.ink-(t-this.lastDrain)*this.drain);this.lastDrain=t;if(t>=this.start+540||this.ink<=0){if(this.phase==="travel"||this.phase==="attached")p.cancelHook();this.phase="returnHold";this.hook=null}}
 if(this.phase==="returnHold"){if(p.beginReturn({anchorId:this.returnAnchorId,tick:t})===true)this.phase="returning";return this.status()}
 if(this.phase==="returning"){const r=p.stepReturn({anchorId:this.returnAnchorId,tick:t});if(r==="supportedArrival")return this.end("returned");if(r==="blocked")this.phase="returnHold";return this.status()}
 if(this.phase==="travel"){const r=p.stepHook({anchorId:this.hook,tick:t});if(r==="physicalArrival"){this.phase="attached";this.hook=null}else if(r==="blocked"){this.phase="free";this.hook=null;this.ready=t+20}return this.status()}
 if(i.hookPressed===true&&t>=this.ready&&this.ink>=this.cost){const h=p.queryHook({maxDistanceM:this.maxHookM});if(!h||h.physicalContact!==true||h.authorizedAnchor!==true||!id(h.anchorId)||!pos(h.distanceM)||h.distanceM>this.maxHookM||p.beginHook({anchorId:h.anchorId,tick:t,waitF:12})!==true){this.ready=t+20;return {...this.status(),rejected:true}}this.ink-=this.cost;this.hook=h.anchorId;this.phase="travel";return this.status()}
 if(this.phase==="attached"&&i.detach===true&&p.detach()===true)this.phase="free";return this.status()}
 spendMain(cost,commit){if(!["free","attached"].includes(this.phase)||!pos(cost)||cost>this.ink||commit()!==true)return false;this.ink-=cost;return true}
}
