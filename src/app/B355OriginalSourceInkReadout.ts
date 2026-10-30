/** B355: read-only player-facing ink status, derived from verified B76.
 * Never invent a refilled resource, physical hit, paint, or official score. */
import type {B76HumanSourceView} from './UndertowF3HumanInkCoach';
export interface B355PlayerPhase{
 enabled:boolean;matchState:string;paused:boolean;stopReason:string|null;
}
export function b355OriginalSourceInkReadout(
 human:B76HumanSourceView|null,phase:B355PlayerPhase
):{label:string;mode:string;nativeTick:number;urgent:boolean}|null{
 if(!phase.enabled||!human||human.state==='HOLD'||
  phase.matchState!=='PLAYING'||phase.paused||phase.stopReason||
  human.originalScoreableSurfaces!==0||
  human.original4v4Certified!==false||
  human.officialWinner!=='NONE'||human.inferredProjectileHitRate!==false||
  !Number.isSafeInteger(human.actualObservedTick)||
  human.actualObservedTick<0||
  !Number.isSafeInteger(human.dryFireAttempts3s)||
  human.dryFireAttempts3s<0||
  !Number.isFinite(human.playerInkPercent)||
  human.playerInkPercent<0||human.playerInkPercent>100)return null;
 const p=Math.round(human.playerInkPercent);
 const dry=human.dryFireAttempts3s>0&&p<30;
 const mode=dry?'ACTUAL_DRY_FIRE':
  human.recoveryState==='LOCKED'?'RECOVERY_DELAY':
  human.recoveryState==='SQUID_OWN'?'SQUID_OWN_REFILL':
  human.recoveryState==='HUMAN'&&p<100?'HUMAN_REFILL':
  p<30?'LOW_INK':'READY';
 const hint=mode==='ACTUAL_DRY_FIRE'?'DRY FIRE · REFILL':
  mode==='RECOVERY_DELAY'?'RECHARGE DELAY':
  mode==='SQUID_OWN_REFILL'?'OWN-INK SQUID REFILL':
  mode==='HUMAN_REFILL'?'RECOVERING':
  mode==='LOW_INK'?'INK LOW · SHIFT ON OWN INK':'READY';
 return {label:'INK '+p+'% · '+hint+' · SOURCE / NO SCORE',
  mode,nativeTick:human.actualObservedTick,
  urgent:mode==='ACTUAL_DRY_FIRE'||mode==='LOW_INK'};
}
