/** B476: compact *real* B475 SOURCE practice UI for focused play.
 * Only changes layout. The seven native CPU, B25 mission, paint owners,
 * route, Rapier physics, 60Hz clock and official scoring are untouched. */
export type B476FrontlinePracticePhase='READY'|'WAIT_REAL_7_CPU'|
 'LIVE'|'CLEAR'|'INTERRUPTED'|'OTHER';
export function b476OriginalFrontlineObjectiveLayout(input:{
 readonly selected:boolean;readonly originalStage:readonly number[];
 readonly nativeTick:number;readonly matchState:string;
 readonly paused:boolean;readonly pointerLocked:boolean;
 readonly practiceStatus:string;readonly stopReason:string|null;
}):{readonly location:'BOTTOM_LEFT';readonly compact:boolean;
 readonly phase:B476FrontlinePracticePhase;readonly userReadOnly:true;
 readonly originalSourceOnly:true;readonly officialWinner:'NONE'}|null{
 if(!input.selected||input.originalStage.join(',')!=='25,17,26,0'||
    !Number.isSafeInteger(input.nativeTick)||input.nativeTick<0||
    !['STAGING','PLAYING','TIME_UP'].includes(input.matchState)||
    !['IDLE','ARMED','RUNNING','CLEAR','TIME_UP','ABORTED']
     .includes(input.practiceStatus))return null;
 const phase:B476FrontlinePracticePhase=input.stopReason?
  'INTERRUPTED':input.practiceStatus==='ARMED'?
  'WAIT_REAL_7_CPU':input.practiceStatus==='RUNNING'?'LIVE':
  input.practiceStatus==='CLEAR'?'CLEAR':
  input.practiceStatus==='ABORTED'?'INTERRUPTED':
  input.matchState==='STAGING'?'READY':'OTHER';
 const compact=input.matchState==='PLAYING'&&!input.paused&&
  !input.stopReason&&input.pointerLocked&&
  ['ARMED','RUNNING','CLEAR'].includes(input.practiceStatus);
 return {location:'BOTTOM_LEFT',compact,phase,
  userReadOnly:true,originalSourceOnly:true,officialWinner:'NONE'};
}
