/** B53: read-only practice objective UI, never an official match result. */
import type {UndertowF3SourcePaintRun} from './UndertowF3SourcePaintRun';
type SourceRun=ReturnType<UndertowF3SourcePaintRun['snapshot']>;
const ratio=(actual:number,required:number)=>Math.max(0,Math.min(100,
 Math.round(actual/required*100)));
export function sourcePracticeObjectiveView(run:SourceRun){
 if(run.sourceScoreablePromotions!==0||run.officialWinner!=='NONE'||
    run.originalTurfScore!=='UNAVAILABLE'||run.productionAuthorized!==false||
    run.gameplaySource!=='REAL_HUMAN_AUTHORITATIVE_INK_AND_RAPIER_FOOT'||
    run.requiredHumanChangedCells!==180||
    run.requiredRealGroundedTravelMeters!==12||
    (run.practiceVariant!=='CLASSIC'&&run.practiceVariant!=='SWITCHBACK')||
    run.routeOutMeters!==1.8||run.routeHomeRadiusMeters!==.8||
    ![run.humanChangedImpactCells,run.realGroundedTravelMeters].every(
     v=>Number.isFinite(v)&&v>=0))
  throw Error('T21_B53_SOURCE_PRACTICE_AUTHORITY_INVALID');
 const paint=ratio(run.humanChangedImpactCells,run.requiredHumanChangedCells);
 const ground=ratio(run.realGroundedTravelMeters,run.requiredRealGroundedTravelMeters);
 const routeNext=run.practiceVariant==='SWITCHBACK'?
  !run.routeTurnReached?'OUTBOUND':!run.routeReturned?'RETURN':null:null;
 const next=routeNext??(paint<100&&ground<100?
  (paint<=ground?'PAINT':'GROUND'):paint<100?'PAINT':ground<100?'GROUND':'DONE');
 const headline=run.status==='CLEAR'?'PRACTICE CLEAR · NOT TURF':
  run.status==='TIME_UP'?'PRACTICE TIME UP · NO WINNER':
  run.status==='ABORTED'?'PRACTICE INTERRUPTED':
  run.status==='ARMED'?'READY · CLICK STAGE TO START':
  run.status==='RUNNING'?run.secondsRemaining+'s · SOURCE PRACTICE':'START OPTIONAL PRACTICE';
 const hint=run.status==='RUNNING'?
  (next==='OUTBOUND'?'NEXT · MOVE 1.8m AWAY ON ORIGINAL GROUND':
   next==='RETURN'?'NEXT · RETURN WITHIN 0.8m OF START':
   next==='PAINT'?'NEXT · PAINT REAL SOURCE SURFACES':
   next==='GROUND'?'NEXT · MOVE ON ORIGINAL GROUND':
   'BOTH OBJECTIVES COMPLETE'):
  run.status==='CLEAR'?'TWO REAL OBJECTIVES COMPLETE':
  run.status==='TIME_UP'?'TRY AGAIN · NO OFFICIAL RESULT':
  run.status==='ABORTED'?'UNLOCKED / INTERRUPTED · RETRY':
  '180 changed cells + 12m real grounded travel';
 return {paint,ground,next,headline,hint,
  state:run.status,officialWinner:'NONE' as const,
  scoring:'UNSCORED' as const};
}
