// F4 tactical decisions only. Existing physical weapons and ink system own all effects.
export function recoveringInk(previous,ink,capacity){
 if(!Number.isFinite(ink)||!Number.isFinite(capacity)||capacity<=0||ink<0||ink>capacity+1e-6)return false;
 return previous===true?ink<capacity*.45:ink<=capacity*.18;
}

export function recoveryAction(s){
 if(!s||s.recovering!==true)return "NORMAL";
 if(s.committed===true)return "FINISH";
 if(![s.ink,s.minCost,s.range].every(Number.isFinite)||s.minCost<=0||s.range<=0||s.ink+1e-6<s.minCost)return "RECOVER";
 if(s.visible===true&&Number.isFinite(s.distance)&&s.distance>=0&&s.distance<=Math.min(s.range,Math.max(2,s.range*.55)))return "DEFEND";
 return "RECOVER";
}

export function shouldThrowCombatSub(s){
 if(!s||!["pulse-bomb","snap-bomb","anchor-bomb","torpedo"].includes(s.subId)||s.visible!==true||s.mainTargetVisible!==false||s.committed!==false||s.recovering!==false)return false;
 if(![s.ink,s.cost,s.capacity,s.distance,s.mainRange,s.subMin,s.subMax].every(Number.isFinite)||
 s.capacity<=0||s.cost<=0||s.ink>s.capacity+1e-6||s.mainRange<=0||s.subMin<0||s.subMax<s.subMin)return false;
 return s.ink-s.cost>=s.capacity*.25-1e-6&&s.distance>s.mainRange&&s.distance>=s.subMin&&s.distance<=s.subMax;
}

export function mergedRecovery(previous,next){
 if(![previous,next].every(Number.isFinite)||previous<0||next<0)return null;
 return Math.max(previous,next);
}
