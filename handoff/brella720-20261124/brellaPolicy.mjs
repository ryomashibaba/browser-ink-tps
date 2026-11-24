export function pelletGroups(){
 return [{group:0,count:1,horizontalRawDeg:0,verticalRawDeg:0,horizontalOffsetRaw:0,verticalOffsetRaw:0},{group:1,count:6,horizontalRawDeg:6,verticalRawDeg:4,horizontalOffsetRaw:.12,verticalOffsetRaw:.1},{group:2,count:4,horizontalRawDeg:2,verticalRawDeg:3,horizontalOffsetRaw:.05,verticalOffsetRaw:.05}];
}

export function cappedPelletDamage(priorAcceptedDamage, pelletDamage, cap=81){
 if(![priorAcceptedDamage,pelletDamage,cap].every(Number.isFinite)||priorAcceptedDamage<0||pelletDamage<0||cap<=0)throw new RangeError("invalid volley damage");
 return Math.min(pelletDamage,Math.max(0,cap-priorAcceptedDamage));
}

export function canopyDamage(hp,damage,multiplier=1){
 if(![hp,damage,multiplier].every(Number.isFinite)||hp<0||damage<0||multiplier<0)throw new RangeError("invalid canopy damage");
 return Math.max(0,hp-damage*multiplier);
}

export function recoverClosedCanopy(hp,frames,closed,maxHp=500,perF=2.5){
 if(![hp,frames,maxHp,perF].every(Number.isFinite)||!Number.isSafeInteger(frames)||frames<0||hp<0||maxHp<=0||hp>maxHp||perF<0||typeof closed!=="boolean")throw new RangeError("invalid canopy recovery");
 return closed&&hp>0?Math.min(maxHp,hp+frames*perF):hp;
}

export function remainingOpenInkCost(alreadySpent,requestedThisFrame,totalBudget=30){
 if(![alreadySpent,requestedThisFrame,totalBudget].every(Number.isFinite)||alreadySpent<0||requestedThisFrame<0||totalBudget<0)throw new RangeError("invalid canopy cost");
 return Math.min(requestedThisFrame,Math.max(0,totalBudget-alreadySpent));
}

export function nearestPhysicalContact(contacts){
 const priority={terrain:0,canopy:1,body:2};
 if(!Array.isArray(contacts))throw new TypeError("contacts must be array");
 let best=null;
 for(const c of contacts){
  if(!c||!Object.hasOwn(priority,c.kind)||!Number.isFinite(c.distance)||c.distance<0)throw new RangeError("invalid contact");
  if(!best||c.distance<best.distance||(c.distance===best.distance&&priority[c.kind]<priority[best.kind]))best=c;
 }
 return best;
}
