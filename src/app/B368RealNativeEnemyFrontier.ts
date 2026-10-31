/** B368 — actual source CPU physical-foot proximity in one living world.
 * A distance or unblocked stage ray NEVER authorizes Recast connectivity,
 * human/CPU crossing, a projectile hit, or an official match.
 * Read-only and exclusive to selected source shooter + 1 human / 7 CPUs.
 */
export interface B368PhysicalCpu{
 id:string;physicalFoot:readonly number[];
 mobilityState:string;rejoined:boolean;
 lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';hp:number|null;
}
export type B368Triple=readonly [number,number,number];
export interface B368EnemyFrontierInput {
 enabled:boolean;stage:readonly number[];nativeTick:number;
 matchState:string;paused:boolean;stopReason:string|null;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
 humanBody:readonly number[];humanHp:number;
 humanGrounded:boolean;humanOriginalSupportId:string|null;
 cpu:readonly B368PhysicalCpu[];
 stageRayBlocked:(from:B368Triple,to:B368Triple)=>boolean;
}
const ALL_IDS=['A1','A2','A3','B1','B2','B3','B4'] as const;
const IDS=['B1','B2','B3','B4'] as const;
function is3(x:readonly number[]){return x.length===3&&x.every(Number.isFinite);}
export function b368RealNativeEnemyFrontier(x:B368EnemyFrontierInput){
 if(x.enabled!==true||x.stage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
    x.matchState!=='PLAYING'||x.paused||!!x.stopReason||
    x.productionAuthorized!==false||
    x.unrestricted4v4Certified!==false||
    !is3(x.humanBody)||!Number.isFinite(x.humanHp)||
    x.humanHp<=0||x.humanHp>100||
    x.humanGrounded!==true||
    !x.humanOriginalSupportId?.startsWith('UndertowT21D:')||
    x.cpu.length!==7||
    new Set(x.cpu.map(c=>c.id)).size!==7||
    x.cpu.some(c=>!ALL_IDS.includes(c.id as typeof ALL_IDS[number])||
       !is3(c.physicalFoot)||typeof c.rejoined!=='boolean'||
       !['ACTIVE','SPLATTED','UNKNOWN'].includes(c.lifeState)||
       !Number.isFinite(c.hp??NaN)||
       c.hp!<0||c.hp!>100))
   return null;
 const enemies=x.cpu.filter(c=>
   IDS.includes(c.id as typeof IDS[number])&&
   c.lifeState==='ACTIVE'&&c.hp!>0&&c.rejoined&&
   c.mobilityState==='GROUND')
  .map(c=>({
   id:c.id,hp:c.hp!,foot:[...c.physicalFoot],
   horizontalMeters:Math.hypot(
    c.physicalFoot[0]!-x.humanBody[0]!,
    c.physicalFoot[2]!-x.humanBody[2]!),
   verticalMeters:Math.abs(c.physicalFoot[1]!-x.humanBody[1]!)
  })).sort((a,b)=>a.horizontalMeters-b.horizontalMeters||
    a.id.localeCompare(b.id));
 if(!enemies.length)return null;
 const nearest=enemies[0]!;
 // Registered Rapier stage ray from true human body to actual real CPU
 // foot volume. Never convert a clear ray to a certified projectile.
 const blocked=x.stageRayBlocked(
  [x.humanBody[0]!,x.humanBody[1]!+.18,x.humanBody[2]!],
  [nearest.foot[0]!,nearest.foot[1]!+.9,nearest.foot[2]!]
 );
 if(typeof blocked!=='boolean')return null;
 const meters=Number(nearest.horizontalMeters.toFixed(3));
 const separation=nearest.verticalMeters;
 const label=meters>32?
  'REAL ENEMY '+nearest.id+' · '+meters.toFixed(1)+
   'm · DISTANT · NO CROSS-TEAM PATH':
  'REAL ENEMY '+nearest.id+' · '+meters.toFixed(1)+'m · '+
   (separation>1.3?'DIFFERENT HEIGHT':
    blocked?'REGISTERED STAGE COVER':'STAGE RAY CLEAR ONLY')+
   ' · NO PATH CERTIFIED';
 return {
  nativeTick:x.nativeTick,nearestId:nearest.id,
  horizontalMeters:meters,
  verticalMeters:Number(separation.toFixed(3)),
  measuredEnemies:enemies.map(e=>({
   id:e.id,hp:e.hp,foot:e.foot,
   horizontalMeters:Number(e.horizontalMeters.toFixed(3))
  })),
  sourceHumanSupportId:x.humanOriginalSupportId,
  originalStageRayBlocked:blocked,
  label,
  genuinePhysicalPositionsOnly:true as const,
  sourceStage:'25/17/26/0' as const,
  scoreable:0 as const,productionAuthorized:false as const,
  enemyRouteCertified:false as const,
  projectileHitCertified:false as const,
  actualEncounterCertified:false as const,
  actorRelocations:0 as const,
  gameplayWrites:0 as const,
  officialWinner:'NONE' as const
 };
}
