import {WEAPON_ORDER,type WeaponId} from '../weapons/WeaponCatalog';

/** B364 genuine user center-ray CPU alignment. Pure HUD, zero gameplay writes.
 * Real target source is the already-resolved ThirdPersonCamera original Rapier
 * cover/paint-first selection and CpuAgentSystem physical hit sphere.
 * This does NOT prove a shot from the shoulder muzzle will damage CPU HP. */
export interface B364PhysicalAimContact {
 id:string;guarded:boolean;distanceMeters:number;
}
export interface B364RealCpu {
 id:string;lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';
 hp:number|null;rejoined:boolean;mobilityState?:string;
}
export interface B364SourceAimInput {
 stage:readonly number[];nativeTick:number;matchState:string;
 paused:boolean;stopReason:string|null;playerView:boolean;
 pointerLocked:boolean;playerHp:number;weaponId:string;
 sourceCombatSelected:boolean;
 /** Unofficial PRIVATE F4 terrain, never frozen SOURCE certification. */
 f4OriginalTerrainResearch?:boolean;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
 actual: B364PhysicalAimContact|null;
 cpu:readonly B364RealCpu[];
}
export function b364RealSourceCrosshair(x:B364SourceAimInput){
 const c=x.actual;
 if(x.stage.join(',')!=='25,17,26,0'||
  !x.sourceCombatSelected||!x.playerView||!x.pointerLocked||
  x.matchState!=='PLAYING'||x.paused||!!x.stopReason||
  x.productionAuthorized!==false||x.unrestricted4v4Certified!==false||
  !Number.isSafeInteger(x.nativeTick)||x.nativeTick<0||
  !Number.isFinite(x.playerHp)||x.playerHp<=0||
  (x.weaponId!=='pulse-sprayer'&&
   !(x.f4OriginalTerrainResearch===true&&
     WEAPON_ORDER.includes(x.weaponId as WeaponId)))||!c||
  !['B1','B2','B3','B4'].includes(c.id)||
  typeof c.guarded!=='boolean'||
  !Number.isFinite(c.distanceMeters)||c.distanceMeters<=0||
  c.distanceMeters>80)return null;
 const living=x.cpu.find(y=>y.id===c.id);
 // The camera contact already originates from the genuine CPU
 // physical-hit query. In F4 only, the actual center-flight CPU remains
 // a valid living capsule even while its passive Crowd rejoin reads false.
 // Formal SOURCE retains its exact historical rejoin requirement.
 const physicalF4Flight=x.f4OriginalTerrainResearch===true&&
  living?.mobilityState==='F4_CENTER_TRANSFER';
 if(!living||living.lifeState!=='ACTIVE'||
  (!living.rejoined&&!physicalF4Flight)||
  !Number.isFinite(living.hp)||living.hp===null||
  living.hp<=0||living.hp>100)return null;
 const shield=c.guarded;
 return {
  state:shield?'REAL_CPU_GUARD_CENTER_RAY' as const:
   'REAL_CPU_BODY_CENTER_RAY' as const,
  id:c.id,realHp:living.hp,distanceMeters:c.distanceMeters,
  guarded:shield,
  text:'REAL CPU '+c.id+' · CENTER RAY '+(shield?'SHIELD':'BODY')+
   ' · HP '+Math.round(living.hp)+' · NO HIT GUARANTEE',
  scoreable:0 as const,gameplayWrites:0 as const,
  directHpDamageCertified:false as const,
  opponentRouteCertified:false as const
 };
}
