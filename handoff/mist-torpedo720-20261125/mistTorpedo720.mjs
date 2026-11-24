// F4 provisional state rules; no simulated physics or direct writes.
export const mistReference={
  "inkCost": 60,
  "recoverF": 75,
  "lifetimeF": 300,
  "rawLevels": [
    {
      "intervalF": 60,
      "count": 3
    },
    {
      "intervalF": 30,
      "count": 4
    },
    {
      "intervalF": 15,
      "count": 0
    }
  ]
};
export function stepMistExposure(previous,{tick,lifeId,roundId,live,insideEnemyMist,ink},policy){
 const clean={tick,lifeId,roundId,exposureF:0,drained:0,pulseF:0,level:0,count:0,inkDrain:0,recoveryBlocked:false,speedScale:1};
 if(!Number.isSafeInteger(tick)||tick<0||!Number.isFinite(ink)||ink<0||ink>100)throw RangeError("invalid actor state");
 if(!live||!insideEnemyMist)return clean;
 if(!policy||!Array.isArray(policy.drainPercent)||policy.drainPercent.length!==3||!policy.drainPercent.every(v=>Number.isFinite(v)&&v>=0&&v<=40)||!Number.isFinite(policy.speedScale)||policy.speedScale<=0||policy.speedScale>1)throw RangeError("explicit local calibration required");
 const continuous=previous&&previous.lifeId===lifeId&&previous.roundId===roundId&&previous.recoveryBlocked;
 if(continuous&&previous.tick===tick)return {...previous,inkDrain:0};
 if(continuous&&previous.tick>tick)throw RangeError("nonmonotonic tick");
 const s=continuous&&previous.tick===tick-1?{...previous,tick,inkDrain:0}:{...clean,recoveryBlocked:true};
 s.speedScale=policy.speedScale;s.exposureF++;s.pulseF++;
 const intervals=[60,30,15],counts=[3,4,Infinity];
 if(s.pulseF>=intervals[s.level]){
   s.pulseF=0;s.count++;
   s.inkDrain=Math.min(ink,Math.max(0,40-s.drained),policy.drainPercent[s.level]);s.drained+=s.inkDrain;
   if(s.count>=counts[s.level]&&s.level<2){s.level++;s.count=0;}
 }
 return s;
}

export function torpedoStep(s,event){
 if(!s||!["THROWN","ROLL","CHASE","BURST","DESTROY"].includes(s.mode))throw RangeError("bad state");
 if(!Number.isSafeInteger(event.tick)||!Number.isSafeInteger(s.tick)||event.tick!==s.tick+1)throw RangeError("one fixed tick required");
 const next={...s,tick:event.tick,emitBlast:false,scatterCount:0};
 if(["BURST","DESTROY"].includes(s.mode))return next;
 if(!event.roundLive||event.outsideWorld)return {...next,mode:"DESTROY"};
 if(s.mode==="CHASE"&&event.actualEnemyProjectileDestroyed)return {...next,mode:"DESTROY"};
 if(s.mode==="THROWN"){
   if(event.actualStageContact)return {...next,mode:"ROLL",supportedF:0,targetLifeId:null};
   if(event.visibleLiveEnemyLifeId)return {...next,mode:"CHASE",targetLifeId:event.visibleLiveEnemyLifeId};
   return next;
 }
 if(s.mode==="ROLL"){
   next.supportedF=(s.supportedF??0)+(event.realGroundSupport?1:0);
   if(next.supportedF>=30)return {...next,mode:"BURST",emitBlast:true};
   return next;
 }
 if(event.actualStageContact||event.actualEnemyBodyContact)return {...next,mode:"BURST",emitBlast:true,scatterCount:8};
 if(!event.targetStillSameLife)next.targetLifeId=null;
 return next;
}
