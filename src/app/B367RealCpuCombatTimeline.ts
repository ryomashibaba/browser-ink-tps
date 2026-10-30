/** Genuine physical-player CPU HP and SAME CPU splat/respawn timeline.
 * B367 is read-only and never awards score, projectile damage or route
 * completion. A zero-HP projectile impact is NOT itself a CPU splat. */
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
 private readonly pending=new Map<string,'HP_ZERO'|'SPLATTED'>();
 public reset(){
  this.lastTick=-1;this.lastSequence=0;this.lastNotice=null;
  this.noticeUntil=-1;this.pending.clear();
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
      e.weaponId!=='pulse-sprayer'||
      ![e.hpBefore,e.hpAfter,e.actualHpLoss].every(Number.isFinite)||
      e.hpBefore<=0||e.hpBefore>100||e.hpAfter<0||
      e.hpAfter>=e.hpBefore||e.actualHpLoss<=0||
      Math.abs(e.actualHpLoss-(e.hpBefore-e.hpAfter))>1e-5||
      e.lethalHpZero!==(e.hpAfter===0)){
    this.reset();return null;
   }
   this.lastSequence=e.sequence;
   if(e.lethalHpZero){
    this.pending.set(e.botId,'HP_ZERO');
    this.emit('LETHAL_HP_ZERO_PENDING_SPLAT',e.botId,x.nativeTick,
     'REAL CPU '+e.botId+' · HP 0 · WAIT FOR NATIVE SPLAT');
   }else this.emit('ACTUAL_HP_LOSS',e.botId,x.nativeTick,
    'REAL CPU '+e.botId+' · HP '+e.hpBefore.toFixed(0)+
    ' → '+e.hpAfter.toFixed(0)+' · REAL PROJECTILE');
  }
  for(const [id,phase]of this.pending){
   const c=x.cpu.find(e=>e.id===id);
   if(!c)continue;
   if(phase==='HP_ZERO'&&c.lifeState==='SPLATTED'&&
      x.humanDirectSplats>0&&x.cpuSplats>0){
    this.pending.set(id,'SPLATTED');
    this.emit('ACTUAL_CPU_SPLAT',id,x.nativeTick,
     'REAL CPU '+id+' · NATIVE SPLAT CONFIRMED');
   }else if(phase==='SPLATTED'&&c.lifeState==='ACTIVE'&&
     c.rejoined&&c.hp===100&&x.cpuRespawns>0){
    this.pending.delete(id);
    this.emit('ACTUAL_CPU_RESPAWN',id,x.nativeTick,
     'REAL CPU '+id+' · NATIVE RESPAWN CONFIRMED');
   }
  }
  return x.matchState==='PLAYING'&&!x.paused&&
   this.lastNotice&&this.noticeUntil>=x.nativeTick?
    this.lastNotice:null;
 }
}
