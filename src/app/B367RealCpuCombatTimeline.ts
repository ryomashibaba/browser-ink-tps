/** Genuine physical-player CPU HP and SAME CPU splat/respawn timeline.
 * B367 is read-only and never awards score, projectile damage or route
 * completion. Lethal HP zero is NOT alone a CPU splat: require the exact
 * actual actor state AND a newly increased genuine native splat count.
 * F3 source CPU may splat in the SAME tick as the lethal projectile;
 * frozen T20's following-tick order remains supported. */
import {WEAPON_ORDER,type WeaponId} from '../weapons/WeaponCatalog';
export interface B367ProjectileEvent {
 sequence:number;nativeFrame:number;botId:string;weaponId:string;
 hpBefore:number;hpAfter:number;actualHpLoss:number;lethalHpZero:boolean;
}
export interface B367NativeCpuState {
 id:string;lifeState:'ACTIVE'|'SPLATTED'|'UNKNOWN';
 rejoined:boolean;hp:number|null;
}
export interface B367NativeCombatFrame {
 enabled:boolean;nativeTick:number;stage:readonly number[];
 matchState:string;paused:boolean;stopReason:string|null;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
 humanDirectHits:number;humanDirectSplats:number;
 cpuSplats:number;cpuRespawns:number;
 source:{enabled:boolean;physicalHumanCpuHpHits:number;
  events:readonly B367ProjectileEvent[];syntheticHits:number;
  actorRelocations:number;scoreable:number;source:string;
  opponentRoutesCertified:boolean;productionAuthorized:boolean};
 cpu:readonly B367NativeCpuState[];
}
export type B367CombatNoticeState='ACTUAL_HP_LOSS'|
 'LETHAL_HP_ZERO_PENDING_SPLAT'|'ACTUAL_CPU_SPLAT'|'ACTUAL_CPU_RESPAWN';
export interface B367CombatNotice {
 state:B367CombatNoticeState;actorId:string;
 actualNativeTick:number;description:string;
 certifiedDirectHumanDamage:boolean;officialWinner:'NONE';
 sourceScoreablePromotions:0;gameplayWrites:0;
 naturalEnemyRouteCertified:false;
}
const enemies=['B1','B2','B3','B4'] as const;
const roster=['A1','A2','A3',...enemies];
const validCount=(n:number)=>Number.isSafeInteger(n)&&n>=0;
export class B367RealCpuCombatTimeline {
 private lastTick=-1;
 private lastSequence=0;
 private lastNotice:B367CombatNotice|null=null;
 private noticeUntil=-1;
 /** Real prior physics frame totals: old accumulated splats cannot prove a
  * fresh same-tick kill. Cleared on a new round or invalid source frame. */
 private priorNativeCounts:{
  tick:number;humanSplats:number;cpuSplats:number;cpuRespawns:number;
 }|null=null;
 private readonly pending=new Map<string,{
  phase:'HP_ZERO'|'SPLATTED';
  nativeLethalTick:number;nativeSplatTick:number|null;
  humanSplatsBefore:number;cpuSplatsBefore:number;
  cpuRespawnsBefore:number;
 }>();
 public reset(){
  this.lastTick=-1;this.lastSequence=0;this.lastNotice=null;
  this.noticeUntil=-1;this.pending.clear();this.priorNativeCounts=null;
 }
 private emit(state:B367CombatNoticeState,actorId:string,tick:number,
  message:string){
  const notice:B367CombatNotice={
   state,actorId,actualNativeTick:tick,description:message,
   certifiedDirectHumanDamage:true,officialWinner:'NONE',
   sourceScoreablePromotions:0,gameplayWrites:0,
   naturalEnemyRouteCertified:false
  };
  this.lastNotice=notice;this.noticeUntil=tick+120;
 }
 public observe(x:B367NativeCombatFrame):B367CombatNotice|null {
  if(!x.enabled||x.stage.join(',')!=='25,17,26,0'||
     x.productionAuthorized!==false||
     x.unrestricted4v4Certified!==false||
     !validCount(x.nativeTick)||!!x.stopReason||
     !['STAGING','PLAYING','TIME_UP'].includes(x.matchState)||
     ![x.humanDirectHits,x.humanDirectSplats,
       x.cpuSplats,x.cpuRespawns].every(validCount)||
     x.humanDirectSplats>x.humanDirectHits||
     x.cpu.length!==7||new Set(x.cpu.map(c=>c.id)).size!==7||
     x.cpu.some(c=>!roster.includes(c.id)||
      !['ACTIVE','SPLATTED','UNKNOWN'].includes(c.lifeState)||
      c.hp!==null&&(!Number.isFinite(c.hp)||c.hp<0||c.hp>100))||
     x.source.enabled!==true||
     x.source.source!=='25/17/26/0'||
     x.source.syntheticHits!==0||x.source.actorRelocations!==0||
     x.source.scoreable!==0||x.source.productionAuthorized!==false||
     x.source.opponentRoutesCertified!==false||
     !validCount(x.source.physicalHumanCpuHpHits)){
   this.reset();return null;
  }
  if(x.nativeTick<this.lastTick)this.reset();
  const priorCounts=this.priorNativeCounts;
  // Native totals are monotonic within one genuine round. A fabricated
  // reset/mismatched lifecycle may not become a same-tick splat witness.
  if(priorCounts&&(x.humanDirectSplats<priorCounts.humanSplats||
     x.cpuSplats<priorCounts.cpuSplats||
     x.cpuRespawns<priorCounts.cpuRespawns)){
   this.reset();return null;
  }
  this.lastTick=x.nativeTick;
  if(x.source.physicalHumanCpuHpHits<this.lastSequence||
     x.source.physicalHumanCpuHpHits>x.humanDirectHits){
   this.reset();return null;
  }
  const seen=x.source.events.filter(e=>e.sequence>this.lastSequence)
   .sort((a,b)=>a.sequence-b.sequence);
  // Sequence gaps must not be silently promoted to verified enemy hits.
  if(seen.length&&seen[0]!.sequence!==this.lastSequence+1){
   this.reset();return null;
  }
  for(const e of seen){
   if(!validCount(e.sequence)||e.sequence!==this.lastSequence+1||
      !validCount(e.nativeFrame)||e.nativeFrame>x.nativeTick||
      !enemies.includes(e.botId as typeof enemies[number])||
      !WEAPON_ORDER.includes(e.weaponId as WeaponId)||
      ![e.hpBefore,e.hpAfter,e.actualHpLoss].every(Number.isFinite)||
      e.hpBefore<=0||e.hpBefore>100||e.hpAfter<0||
      e.hpAfter>=e.hpBefore||e.actualHpLoss<=0||
      Math.abs(e.actualHpLoss-(e.hpBefore-e.hpAfter))>1e-5||
      e.lethalHpZero!==(e.hpAfter===0)){
    this.reset();return null;
   }
   this.lastSequence=e.sequence;
   if(e.lethalHpZero){
    const actual=x.cpu.find(c=>c.id===e.botId);
    // F3 source collision now calls native splatBot immediately on REAL
    // projectile damage, before B367 samples this same physics tick.
    // Only a NEW count delta since a preceding verified native frame,
    // alongside this exact actor's observed SPLATTED + HP0, can certify
    // an immediate splat. Existing cumulative splats are never enough.
    const sameTickRealSplat=priorCounts!==null&&
      x.nativeTick>priorCounts.tick&&
      e.nativeFrame===x.nativeTick&&
      actual?.lifeState==='SPLATTED'&&actual.hp===0&&
      x.humanDirectSplats>priorCounts.humanSplats&&
      x.cpuSplats>priorCounts.cpuSplats;
    this.pending.set(e.botId,{
     phase:sameTickRealSplat?'SPLATTED':'HP_ZERO',
     nativeLethalTick:x.nativeTick,
     nativeSplatTick:sameTickRealSplat?x.nativeTick:null,
     humanSplatsBefore:sameTickRealSplat?
      priorCounts.humanSplats:x.humanDirectSplats,
     cpuSplatsBefore:sameTickRealSplat?
      priorCounts.cpuSplats:x.cpuSplats,
     cpuRespawnsBefore:x.cpuRespawns
    });
    if(sameTickRealSplat)
     this.emit('ACTUAL_CPU_SPLAT',e.botId,x.nativeTick,
      'REAL CPU '+e.botId+' · NATIVE SPLAT CONFIRMED');
    else this.emit('LETHAL_HP_ZERO_PENDING_SPLAT',e.botId,x.nativeTick,
     'REAL CPU '+e.botId+' · HP 0 · WAIT FOR NATIVE SPLAT');
   }else this.emit('ACTUAL_HP_LOSS',e.botId,x.nativeTick,
    'REAL CPU '+e.botId+' · HP '+e.hpBefore.toFixed(0)+
    ' → '+e.hpAfter.toFixed(0)+' · REAL MAIN-WEAPON HP');
  }
  for(const [id,prior]of this.pending){
   const c=x.cpu.find(e=>e.id===id);
   if(!c)continue;
   // A global cumulative splat/respawn count can be positive because of
   // ANOTHER CPU or an earlier life. Require a new count for this damage
   // event AND the exact actor's actual native life-state transition.
   if(prior.phase==='HP_ZERO'&&c.lifeState==='SPLATTED'&&
      c.hp===0&&x.humanDirectSplats>prior.humanSplatsBefore&&
      x.cpuSplats>prior.cpuSplatsBefore&&
      x.nativeTick>prior.nativeLethalTick){
    prior.phase='SPLATTED';
    prior.nativeSplatTick=x.nativeTick;
    this.emit('ACTUAL_CPU_SPLAT',id,x.nativeTick,
     'REAL CPU '+id+' · NATIVE SPLAT CONFIRMED');
   }else if(prior.phase==='SPLATTED'&&
     prior.nativeSplatTick!==null&&
     x.nativeTick-prior.nativeSplatTick>=150&&
     c.lifeState==='ACTIVE'&&c.hp===100&&
     // Native return is to the UPPER original spawn, not yet a new lower
     // rejoin. Rejoining is tracked separately by original Rapier descent.
     c.rejoined===false&&
     x.cpuRespawns>prior.cpuRespawnsBefore){
    this.pending.delete(id);
    this.emit('ACTUAL_CPU_RESPAWN',id,x.nativeTick,
     'REAL CPU '+id+' · NATIVE RESPAWN AT ORIGINAL SPAWN');
   }
  }
  this.priorNativeCounts={
   tick:x.nativeTick,humanSplats:x.humanDirectSplats,
   cpuSplats:x.cpuSplats,cpuRespawns:x.cpuRespawns
  };
  return this.currentNotice(x.nativeTick,x.matchState==='PLAYING',x.paused);
 }
 /** Render-only read of the native-tick witness. The caller does NOT
  * advance combat evidence on graphics/HUD frames, which may skip the
  * entire 150-tick real CPU splat/respawn window under SwiftShader. */
 public currentNotice(nativeTick:number,playing:boolean,paused:boolean):B367CombatNotice|null{
  return validCount(nativeTick)&&nativeTick>=this.lastTick&&
   playing&&!paused&&this.lastNotice&&this.noticeUntil>=nativeTick?
    this.lastNotice:null;
 }
}
