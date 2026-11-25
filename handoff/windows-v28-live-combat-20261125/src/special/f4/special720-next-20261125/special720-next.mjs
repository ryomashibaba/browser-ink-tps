// F4 720 execution helpers; no activation/gauge/score authority. Real physics adapter required.
export const reference720 = {
  "ultraShot": {
    "blob": "5adc8c7fae7c4e53d22191f914b3021705256075",
    "points": 210,
    "durationF": 360,
    "delayF": 15,
    "repeatF": 55,
    "directDamage": 220,
    "blastDamage": 53,
    "blastRadiusRaw": 4,
    "paintRadiusRaw": 3.2,
    "straightF": 18,
    "orbitalRadiusRaw": 1,
    "orbitalTransitionF": 10
  },
  "chariot": {
    "blob": "49f607647f2d1499219e79b1fc4a8e5c71ea0cf1",
    "durationF": 480,
    "armorHPRaw": 5000,
    "shooterDamageMax": 32,
    "shooterDamageMin": 16,
    "reduceStartF": 9,
    "reduceEndF": 25,
    "cannonSplashDamage": 30,
    "cannonNoShotF": 32,
    "firstDelayF": 20
  },
  "greatBarrier": {
    "blob": "7481f0ba84e8b62db98fb827efff5e17ccdb555a",
    "radiusMinRaw": 2.255,
    "radiusMaxRaw": 7.5,
    "fieldHPRaw": 30720,
    "droneHPRaw": 15360,
    "timeDamageRaw": 921,
    "damageRatioRaw": 0.64,
    "ignitionF": 15
  },
  "microLaser": {
    "blob": "5b0efbe9281eeb00fb0c9cf2eaf0d2beff02ce7a",
    "chargeF": 36,
    "lockEndF": 15,
    "durationF": 180,
    "damage": 3.5,
    "intervalF": 5,
    "afterWaitF": 20,
    "afterShotLockF": 40,
    "lockRadiusRaw": 10,
    "lockAngleRaw": 80
  },
  "blower": {
    "blob": "3f02d97a28883dccd61238192c12ea7d87cfaf50",
    "exhaleWaitF": 150,
    "transitionF": 20,
    "damage": 220,
    "blastMinRaw": 6,
    "blastMaxRaw": 10,
    "inhaleLengthRaw": 15
  },
  "superHook": {
    "blob": "1c831adf90392736352b5eb1efa3812456e7766b",
    "durationF": 540,
    "maxLengthRaw": 35,
    "inkCapacityMultiplier": 1.5,
    "hookConsumeRaw": 0.06,
    "consumePerSecondRaw": 0.15,
    "waitShotToAttackF": 12,
    "failedIntervalF": 20,
    "blastNearDamage": 45,
    "blastFarDamage": 35
  },
  "ultraStamp": {
    "blob": "690ccc3095ff0ea8ee61a4030fa1acf0ba7f491a",
    "durationF": 450,
    "swingSplash": 40,
    "throwDirect": 220,
    "throwNear": 60,
    "throwFar": 30,
    "throwPaintRadiusRaw": 5
  }
};
export function validTick(t){return Number.isSafeInteger(t)&&t>=0}
export function startUltraShot(tick,roundId,lifeId,readyDelayF=18){if(!validTick(tick)||!roundId||!lifeId||!validTick(readyDelayF))throw Error("invalid activation");return {tick,roundId,lifeId,ready:tick+readyDelayF,end:tick+360,count:0,pending:null,last:null}}
export function stepUltraShot(state,input,launchVolley){const {tick,roundId,lifeId,trigger,alive}=input;if(!validTick(tick)||tick<state.tick||roundId!==state.roundId||lifeId!==state.lifeId||!alive||tick>=state.end||state.count>=3)return {state:null,event:"ended"};let s={...state};if(tick<s.ready)return {state:s,event:"arming"};if(s.pending===null&&trigger){let due=s.last!==null&&tick<=s.last+55?Math.max(tick,s.last+55):tick+15;if(due<s.end)s.pending=due}if(s.pending!==null&&tick>=s.pending){const volleyId=JSON.stringify([s.roundId,s.lifeId,s.tick,s.count]);const result=launchVolley({volleyId,tick,count:3,directDamage:220,blastDamage:53});s.pending=null;if(result!==true)return {state:s,event:"rejected"};s.count++;s.last=tick;return {state:s,event:"launched",volleyId,finished:s.count===3}}return {state:s,event:"waiting"}}
export function orbitalOffsets(ageF,radiusMeters,radiansPerTick){if(!validTick(ageF)||!Number.isFinite(radiusMeters)||radiusMeters<=0||!Number.isFinite(radiansPerTick))throw Error("calibration required");const r=radiusMeters*Math.min(ageF/10,1);return [0,1,2].map(i=>{const a=ageF*radiansPerTick+i*2*Math.PI/3;return [r*Math.cos(a),r*Math.sin(a)]})}
export function laserDamagePulse(ageF){return validTick(ageF)&&ageF>=36&&ageF<216&&(ageF-36)%5===0?3.5:0}
export function acceptLaserContact(ledger,{roundId,beamId,targetLifeId,ageF,liveEnemy,beamOverlap}){if(!roundId||!beamId||!targetLifeId||!liveEnemy||!beamOverlap||!laserDamagePulse(ageF))return 0;const key=JSON.stringify([roundId,beamId,targetLifeId,ageF]);if(ledger.has(key))return 0;ledger.add(key);return 3.5}
export function crabShotDamage(ageF){if(!validTick(ageF))throw Error("invalid bullet age");return 32-16*Math.max(0,Math.min(1,(ageF-9)/16))}
export function stampThrowDamage({direct,near,far,physicalContact}){if(!physicalContact)return 0;return direct?220:near?60:far?30:0}
