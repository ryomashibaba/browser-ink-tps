/** B165: Source-only cooperative practice readability.
 * Three genuinely independent native original conditions, never Turf.
 * This cannot modify player movement, A1, paint, score or progression.
 */
import type {UndertowF3SourcePaintRun}
 from './UndertowF3SourcePaintRun';
type Native=ReturnType<UndertowF3SourcePaintRun['snapshot']>;
const proportion=(a:number,b:number)=>Math.min(100,
 Math.max(0,Math.round(a/b*100)));
export type B165AllyPhase='HUMAN_PAINT'|'HUMAN_GROUND'|
 'A1_REAL_ORIGINAL_IMPACT'|'REAL_COOPERATIVE_CLEAR'|'NOT_RUNNING';
export function summarizeB165OriginalAllyPractice(run:Native){
 if(run.practiceVariant!=='ALLY_SYNC')return null;
 if(run.gameplaySource!=='REAL_HUMAN_AUTHORITATIVE_INK_AND_RAPIER_FOOT'||
    run.mode!=='OPTIONAL_NONSCORING_SOURCE_PAINT_RUN'||
    run.officialWinner!=='NONE'||run.originalTurfScore!=='UNAVAILABLE'||
    run.sourceScoreablePromotions!==0||run.productionAuthorized!==false||
    run.requiredHumanChangedCells!==180||
    run.requiredRealGroundedTravelMeters!==12||
    run.requiredOriginalA1ChangedImpactCells!==30||
    run.cooperativeModeNeverCertifiesOpponentEngagement!==true)
  throw Error('B165_SOURCE_ONLY_NONSCORING_AUTHORITY_REQUIRED');
 if(!Number.isSafeInteger(run.humanChangedImpactCells)||
    run.humanChangedImpactCells<0||
    !Number.isFinite(run.realGroundedTravelMeters)||
    run.realGroundedTravelMeters<0||
    !Number.isSafeInteger(run.actualOriginalA1ChangedImpactCells)||
    run.actualOriginalA1ChangedImpactCells<0||
    !Number.isSafeInteger(run.actualOriginalA1TaggedImpactEvents)||
    run.actualOriginalA1TaggedImpactEvents<0)
  throw Error('B165_INVALID_REAL_SOURCE_PROGRESS');
 const humanPaintReady=run.humanChangedImpactCells>=180;
 const humanGroundReady=run.realGroundedTravelMeters>=12;
 const actualA1Ready=run.actualOriginalA1ChangedImpactCells>=30&&
   run.actualOriginalA1TaggedImpactEvents>0;
 if(run.originalA1CooperativeGoalSatisfied!==actualA1Ready)
  throw Error('B165_SOURCE_A1_IMPACT_PROVENANCE_CONFLICT');
 const allReady=humanPaintReady&&humanGroundReady&&actualA1Ready;
 if((run.status==='CLEAR')!==allReady&&
   (run.status==='CLEAR'||run.status==='RUNNING'&&allReady))
  throw Error('B165_GENUINE_CLEAR_GATE_INCONSISTENT');
 const phase:B165AllyPhase=run.status==='CLEAR'?
  'REAL_COOPERATIVE_CLEAR':
  run.status!=='RUNNING'?'NOT_RUNNING':
  !humanPaintReady?'HUMAN_PAINT':
  !humanGroundReady?'HUMAN_GROUND':'A1_REAL_ORIGINAL_IMPACT';
 const guidance=phase==='HUMAN_PAINT'?
  'Paint genuine original ground with your own weapon':
  phase==='HUMAN_GROUND'?
  'Travel on real grounded original terrain':
  phase==='A1_REAL_ORIGINAL_IMPACT'?
  'Move near A1 on the same safe original floor; let real A1 ink land':
  phase==='REAL_COOPERATIVE_CLEAR'?
  'COOPERATIVE PRACTICE CLEAR · real human + A1 impact':
  run.status==='TIME_UP'?'TIME UP · NO OFFICIAL WINNER':
  run.status==='ABORTED'?'INTERRUPTED · ORIGINAL SOURCE PRACTICE':
  'Arm the optional original-source cooperative practice';
 return {
  phase,guidance,
  humanPaintPct:proportion(run.humanChangedImpactCells,180),
  groundedPct:proportion(run.realGroundedTravelMeters,12),
  realA1ImpactPct:run.actualOriginalA1TaggedImpactEvents>0?
   proportion(run.actualOriginalA1ChangedImpactCells,30):0,
  humanPaintReady,humanGroundReady,actualA1Ready,
  realTaggedA1ImpactEvents:run.actualOriginalA1TaggedImpactEvents,
  realTaggedA1ImpactChangedCells:run.actualOriginalA1ChangedImpactCells,
  genuinePracticeClear:run.status==='CLEAR',
  actualNativeElapsedTicks:run.elapsedTicks,
  sourceOnly:true as const,officialWinner:'NONE' as const,
  originalTurfScore:'UNAVAILABLE' as const,scoreableCells:0 as const,
  unrestrictedOriginal4v4Certified:false as const
 };
}
