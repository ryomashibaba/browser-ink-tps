export function planSlosh(grounded) {
  if(typeof grounded!=="boolean")throw new TypeError("grounded must be boolean");
  return [{group:"HEAD",count:4,delay:0,interval:1,speed:grounded?1.7609:1.6852,step:-0.16,collisionStage:0.8,collisionPlayer:0.85,collisionStep:-0.12},{group:"TAIL",count:5,delay:4,interval:2,speed:grounded?1.1:1.0,step:-0.2,collisionStage:0.4,collisionPlayer:0.45,collisionStep:-0.05}].flatMap(g=>Array.from({length:g.count},(_,i)=>({group:g.group,index:i,offsetF:g.delay+i*g.interval,speedRaw:g.speed+i*g.step,fieldRadiusEndRaw:g.collisionStage+i*g.collisionStep,playerRadiusEndRaw:g.collisionPlayer+i*g.collisionStep})));
}

export function sloshDamage(group,fallRaw) {
  if(!Number.isFinite(fallRaw)||!["HEAD","TAIL"].includes(group))throw new RangeError("invalid damage inputs");
  if(group==="TAIL")return 50;
  const t=Math.max(0,Math.min(1,(fallRaw-1.5)/(7.625-1.5)));
  return 70-20*t;
}

export function canApplySwingHit(seen,targetLifeId) {
  if(typeof targetLifeId!=="string"||!targetLifeId)throw new TypeError("target life identity required");
  return !seen.has(targetLifeId);
}

export function markResolvedSwingHit(seen,targetLifeId) {
  if(typeof targetLifeId!=="string"||!targetLifeId)throw new TypeError("target life identity required");
  seen.add(targetLifeId);
}
