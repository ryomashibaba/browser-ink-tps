export function spinnerChargeStage(chargeF){
 if(!Number.isFinite(chargeF)||chargeF<0)throw new RangeError("invalid charge");
 const f=Math.min(75,chargeF);
 return {ring:f>=75?2:f>=50?1:0,rangeProgress:Math.min(1,f/50),secondProgress:Math.max(0,(f-50)/25)};
}

export function spinnerShotOffsets(acceptedCount){
 if(!Number.isSafeInteger(acceptedCount)||acceptedCount<0||acceptedCount>37)throw new RangeError("invalid reference shot count");
 return Array.from({length:acceptedCount},(_,i)=>i*4);
}

export function spinnerDamage(ageF){
 if(!Number.isFinite(ageF)||ageF<0)throw new RangeError("invalid projectile age");
 return 30-15*Math.max(0,Math.min(1,(ageF-11)/8));
}

export function saberPlan(kind){
 if(!["HORIZONTAL","CHARGED","LUNGE"].includes(kind))throw new RangeError("invalid swing");
 const h=kind==="HORIZONTAL",l=kind==="LUNGE";
 return {kind,inkPercent:h?3:6,slashDamage:h?15:120,projectileDamage:h?30:60,slashStartF:l?14:3,slashAliveF:4,projectileStartF:l?17:6,recoveryF:h?30:30,collisionOffsetsRaw:h?[[-.7,0,-.2],[0,0,0],[.7,0,-.2]]:Array.from({length:7},(_,i)=>[0,1.2-.4*i,-.3+.1*i]),collisionRadiiRaw:h?[.25,.3,.25]:[.3,.35,.45,.5,.45,.35,.3],splashIntervalRaw:h?2:1.5,splashMax:h?8:14,burstF:h?4:14,burstPaintRadiusRaw:h?2.2:3};
}

export function acceptSaberComponent(ledger,targetLifeId,component){
 if(typeof targetLifeId!=="string"||!targetLifeId||!["SLASH","WAVE"].includes(component))throw new RangeError("invalid hit identity");
 const k=JSON.stringify([targetLifeId,component]);
 if(ledger.has(k))return false;
 ledger.add(k);return true;
}
