// F4 special execution helpers: no gauge injection, no fabricated contact.
export const special720Reference={
  "tripleTornado": {
    "points": 200,
    "totalF": 360,
    "guideCount": 3,
    "radiusSpreadF": 50,
    "paintRadiusStartRaw": 0.5,
    "paintRadiusEndRaw": 7,
    "damageRadiusEndRaw": 7.7,
    "damageHeightUpRaw": 20,
    "paintSpanF": 2,
    "paintRotateDegrees": 8.5,
    "damageRaw": 75
  },
  "waveBreaker": {
    "points": 200,
    "emitF": [
      90,
      240,
      390
    ],
    "waveMaxF": 160,
    "waveMaxRadiusRaw": 20,
    "damage": 45,
    "contactDamage": 30,
    "contactIntervalF": 30,
    "damageYMaxRaw": 2.8,
    "damageYMinRaw": -5.2,
    "initialMarkF": 45,
    "initialMarkCurve": [
      [
        4,
        0.19
      ],
      [
        10,
        0.4
      ],
      [
        18,
        0.615
      ],
      [
        27,
        0.615
      ],
      [
        37,
        0.615
      ],
      [
        47,
        0.615
      ],
      [
        57,
        0.615
      ]
    ]
  },
  "ultraShot": {
    "points": 210,
    "firstShotDelayF": 15,
    "repeatF": 55,
    "durationF": 360,
    "directDamage": 220,
    "blastDamage": 53,
    "blastRadiusRaw": 4,
    "paintRadiusRaw": 3.2
  }
};
export function startTornadoCast(tick,roundId,ownerLifeId){if(!Number.isSafeInteger(tick)||tick<0||!roundId||!ownerLifeId)throw RangeError("invalid cast");return {startTick:tick,roundId,ownerLifeId,accepted:0,lastThrowTick:null};}

export function acceptTornadoGuide(s,{tick,roundId,ownerLifeId,realLaunchAccepted}){
 if(!Number.isSafeInteger(tick)||tick<s.startTick||roundId!==s.roundId||ownerLifeId!==s.ownerLifeId||tick-s.startTick>=360||s.accepted>=3||!realLaunchAccepted||s.lastThrowTick!==null&&tick<=s.lastThrowTick)return null;
 return {...s,accepted:s.accepted+1,lastThrowTick:tick};
}

export function tornadoPulse(ageF,{damageRadiusMeters,paintRadiusMeters,damageStartRadiusMeters=0}){
 if(!Number.isSafeInteger(ageF)||![damageRadiusMeters,paintRadiusMeters,damageStartRadiusMeters].every(Number.isFinite)||damageRadiusMeters<=0||paintRadiusMeters<=0||damageStartRadiusMeters<0||damageStartRadiusMeters>damageRadiusMeters)return null;
 if(ageF<0||ageF>50)return null;
 let t=ageF/50;
 return {damageRadiusMeters:damageStartRadiusMeters+(damageRadiusMeters-damageStartRadiusMeters)*t,paintRadiusMeters:paintRadiusMeters*(.5/7+(1-.5/7)*t),damageDue:ageF%5===0,damage:37.5,paintDue:ageF%2===0,paintAngleDegrees:(ageF/2)*8.5};
}

export function waveFronts(ageF,radiusMeters){
 if(!Number.isSafeInteger(ageF)||!Number.isFinite(radiusMeters)||radiusMeters<=0)return [];
 return [90,240,390].flatMap((emitF,index)=>{const n=ageF-emitF;if(n<0||n>160)return [];return [{index,emitF,previousRadiusMeters:radiusMeters*Math.max(0,n-1)/160,radiusMeters:radiusMeters*n/160,damage:45}];});
}

export function acceptWaveHit(ledger,{deviceId,waveIndex,targetLifeId,roundId,liveEnemy,physicalWaveContact}){
 if(!liveEnemy||!physicalWaveContact||!deviceId||!targetLifeId||!roundId||!Number.isInteger(waveIndex)||waveIndex<0||waveIndex>2)return false;
 const k=JSON.stringify([roundId,deviceId,waveIndex,targetLifeId]);if(ledger.has(k))return false;ledger.add(k);return true;
}
