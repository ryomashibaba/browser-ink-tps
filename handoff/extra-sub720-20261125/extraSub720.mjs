// 720 data reference plus provisional F4 state policies, not physics.
export const reference720={
  "curling": {
    "ink": 65,
    "recovery": [
      70,
      30
    ],
    "chargeMax": 60,
    "fuseBase": 210,
    "chargeFuseRate": 2,
    "nearRaw": [
      1.6,
      4.6
    ],
    "farRaw": [
      5,
      8
    ],
    "paintRaw": [
      2.133,
      5
    ],
    "directDamage": 20,
    "directIntervalF": 40,
    "blastNear": 180,
    "blastFar": 30,
    "splashes": 12
  },
  "sprinkler": {
    "ink": 60,
    "recovery": 60,
    "firstF": 480,
    "secondRawF": 900,
    "hitPaintRaw": 2.9
  },
  "mist": {
    "ink": 60,
    "recovery": 75,
    "durationF": 300,
    "distanceForOffRaw": 5.4,
    "levels": [
      {
        "frame": 60,
        "count": 3
      },
      {
        "frame": 30,
        "count": 4
      },
      {
        "frame": 15,
        "count": 0
      }
    ]
  },
  "torpedo": {
    "ink": 65,
    "recovery": 88,
    "groundFuseF": 30,
    "nearDamage": 60,
    "farDamage": 35,
    "nearRaw": 2.6,
    "farRaw": 6,
    "paintRaw": 3.5,
    "scatterCount": 8,
    "scatterDamage": 12,
    "scatterRadiusRaw": 2.6,
    "scatterPaintRaw": 2
  }
};
export function curlingPlan(heldF){if(!Number.isSafeInteger(heldF)||heldF<0)throw RangeError("invalid hold");let f=Math.min(heldF,60),t=f/60;const lerp=(a,b)=>a+(b-a)*t;return {chargeF:f,fuseF:210-2*f,ink:65,recoveryF:Math.round(lerp(70,30)),nearRaw:lerp(1.6,4.6),farRaw:lerp(5,8),paintRaw:lerp(2.133,5),directDamage:20,nearDamage:180,farDamage:30};}

export function reflectGroundVelocity(v,n){if(![v?.x,v?.z,n?.x,n?.z].every(Number.isFinite))return null;let l=Math.hypot(n.x,n.z);if(l<1e-8)return null;let x=n.x/l,z=n.z/l,d=v.x*x+v.z*z;if(d>=0)return null;return {x:v.x-2*d*x,z:v.z-2*d*z};}

export function acceptContactTick(lastTick,tick,intervalF=40){return Number.isSafeInteger(tick)&&tick>=0&&Number.isSafeInteger(intervalF)&&intervalF>0&&(lastTick===null||Number.isSafeInteger(lastTick)&&lastTick>=0&&tick-lastTick>=intervalF);}

export function selectOwnedObject(objects,ownerId,kind,roundId){return objects.filter(o=>o.active&&o.ownerId===ownerId&&o.kind===kind&&o.roundId===roundId);}

export function torpedoMode({state,actualContact,visibleLivingEnemy,groundedTicks,shotDown}){if(shotDown&&state==="CHASE")return "DESTROY";if(state==="THROWN"){if(actualContact==="STAGE")return "ROLL";if(visibleLivingEnemy)return "CHASE";return "THROWN";}if(state==="ROLL")return groundedTicks>=30?"BURST":"ROLL";if(state==="CHASE")return actualContact==="STAGE"||actualContact==="ENEMY_BODY"?"BURST":"CHASE";return "DESTROY";}
