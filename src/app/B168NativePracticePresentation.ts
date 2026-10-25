/**
 * B168: bounded native-tick UI cadence, never a simulated tick or reward.
 * Triggered solely after the existing 60Hz true Rapier + ink observation.
 * Does not own run/CPU state or change practice completion thresholds.
 */
import type {UndertowF3SourcePaintRun} from './UndertowF3SourcePaintRun';
type Run=ReturnType<UndertowF3SourcePaintRun['snapshot']>;
export type B168NativePracticeState=Pick<Run,
 'status'|'practiceVariant'|'humanChangedImpactCells'|
 'requiredHumanChangedCells'|'realGroundedTravelMeters'|
 'requiredRealGroundedTravelMeters'|'actualOriginalA1TaggedImpactEvents'|
 'actualOriginalA1ChangedImpactCells'|'routePhase'|'relayStage'>;

export function shouldPresentB168NativePractice(
 before:B168NativePracticeState,after:B168NativePracticeState,
 nativeTick:number,lastPresentedNativeTick:number
):boolean{
 if(!Number.isSafeInteger(nativeTick)||nativeTick<0||
  !Number.isSafeInteger(lastPresentedNativeTick)||
  lastPresentedNativeTick< -1)return false;
 if(after.status==='IDLE')return false;
 // Do not obscure a true terminal transition until WebGL catches up.
 if(before.status!==after.status)return true;
 if(after.status!=='RUNNING')return false;
 // A restart can reset clock.tick. Do not retain stale cadence.
 if(nativeTick<lastPresentedNativeTick)return true;
 // Important real-impact events and an actually completed human goal should
 // be visible immediately, not on the sixth rendered WebGL frame.
 if(after.actualOriginalA1TaggedImpactEvents>
    before.actualOriginalA1TaggedImpactEvents||
    after.actualOriginalA1ChangedImpactCells>
    before.actualOriginalA1ChangedImpactCells||
    before.humanChangedImpactCells<after.requiredHumanChangedCells&&
    after.humanChangedImpactCells>=after.requiredHumanChangedCells||
    before.realGroundedTravelMeters<after.requiredRealGroundedTravelMeters&&
    after.realGroundedTravelMeters>=after.requiredRealGroundedTravelMeters||
    before.routePhase!==after.routePhase||
    before.relayStage!==after.relayStage)return true;
 // At most 10 running updates/s of real gameplay; no 60Hz DOM thrash.
 return lastPresentedNativeTick===-1||
  nativeTick-lastPresentedNativeTick>=6;
}
