// Read-only ownership and actual pending-map queries. No physics, weapon or resource effects.
export function sameCpuFireLife(request,bot){
 return request.f4SourceLifeSerial===undefined||
   !!bot&&Number.isSafeInteger(request.f4SourceLifeSerial)&&request.f4SourceLifeSerial===bot.f4LifeSerial;
}

export function unemittedCpuMainDisposition(request,bot){
 if(!request||!request.sourceInkTransaction||!Number.isSafeInteger(request.f4SourceLifeSerial))return "IGNORE";
 if(bot&&sameCpuFireLife(request,bot)&&bot.id===request.sourceId&&bot.team===request.team&&
   bot.weaponId===request.weaponId&&bot.lifeState==="ACTIVE"&&Number.isFinite(bot.hp)&&bot.hp>0)return "REFUND";
 return "DROP_COUNT";
}

export function hasCpuMainWindup(actorId,sloshes,canopies,sabers){
 return !!(sloshes?.has(actorId)||canopies?.has(actorId)||sabers?.has(actorId));
}
