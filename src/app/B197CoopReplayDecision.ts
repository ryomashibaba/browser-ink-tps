import type {B25RunStatus} from './UndertowF3SourcePaintRun';

/** B197: replay ONLY original source co-op, never reset/teleport a living
 * Rapier/CPU world in place. Actual navigation happens in the UI click. */
export function b197CoopReplayDecision(x:{
 originalSourceCoop:boolean;
 practiceStatus:B25RunStatus;
 sessionEnded:boolean;
 nativeStopped:boolean;
}){
 const finished=x.practiceStatus==='CLEAR'||x.practiceStatus==='TIME_UP'||
  x.practiceStatus==='ABORTED'||x.sessionEnded||x.nativeStopped;
 const replay=x.originalSourceCoop&&finished;
 const reason=x.practiceStatus==='CLEAR'?'COOP_PRACTICE_CLEAR':
  x.practiceStatus==='TIME_UP'?'PRACTICE_TIME_UP':
  x.practiceStatus==='ABORTED'?'PRACTICE_INTERRUPTED':
  x.nativeStopped?'NATIVE_SOURCE_STOP':x.sessionEnded?'SOURCE_SESSION_END':'NOT_FINISHED';
 return {
  replay,reason,
  buttonText:replay?'REPLAY REAL A1 CO-OP · FRESH SOURCE WORLD':'',
  guidance:replay?
   'Press ESC to unlock, then click REPLAY on the mission card; R also restarts the REAL world. No Turf winner.':'',
  requiresFreshBrowserNavigation:true as const,
  mayTeleportActiveActors:false as const,
  originalScoreable:0 as const,
  officialWinner:'NONE' as const
 };
}
