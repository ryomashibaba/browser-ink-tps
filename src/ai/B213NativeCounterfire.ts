/** B213 native direct-projectile attacker memory; zero hit, movement, or route authority. */
export function b213RealAttackerPreference(x:{
 enabled:boolean;tick:number;hitTick:number;attacker:string|null;
 actualLivingEnemyIds:readonly string[];
}):string|null{
 if(!x.enabled||!Number.isSafeInteger(x.tick)||
    !Number.isSafeInteger(x.hitTick)||x.hitTick<0||
    x.tick<x.hitTick||x.tick-x.hitTick>120||
    !x.attacker||!['HUMAN','A1','A2','A3','B1','B2','B3','B4'].includes(x.attacker)||
    !x.actualLivingEnemyIds.includes(x.attacker))return null;
 return x.attacker;
}
