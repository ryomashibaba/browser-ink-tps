import type {UndertowF3SourcePaintRun} from './UndertowF3SourcePaintRun';
/** Read-only 60Hz ORIGINAL source cooperation; never awards paint or winner. */
export type CoopRun=ReturnType<UndertowF3SourcePaintRun['snapshot']>;
const percent=(value:number,required:number)=>Number.isFinite(value)&&required>0?
 Math.min(100,Math.max(0,Math.round(value/required*100))):0;
export function b195NativeCoopMissionView(run:CoopRun,sevenCpuPhysicallyReady:boolean){
 const verified=run.practiceVariant==='ALLY_SYNC'&&run.originalStageVerified===true&&
  run.gameplaySource==='REAL_HUMAN_AUTHORITATIVE_INK_AND_RAPIER_FOOT'&&
  run.sourceScoreablePromotions===0&&run.officialWinner==='NONE';
 const h=run.humanChangedImpactCells>=run.requiredHumanChangedCells;
 const g=run.realGroundedTravelMeters>=run.requiredRealGroundedTravelMeters;
 const genuineA1=run.actualOriginalA1TaggedImpactEvents>0;
 const a=genuineA1&&
  run.actualOriginalA1ChangedImpactCells>=run.requiredOriginalA1ChangedImpactCells;
 const verifiedClear=verified&&h&&g&&a&&run.status==='CLEAR';
 let state='WAITING',headline='START A1 CO-OP';
 let next=sevenCpuPhysicallyReady?'Select START REAL A1 CO-OP on the right':
  'Waiting for all seven actual original CPU to recover';
 if(!verified){state='SOURCE_HOLD';headline='SOURCE PRACTICE HOLD';
  next='Original-source authority and actual A1 ink proof are required';
 }else if(run.status==='ARMED'){state='ARMED';headline='READY · CLICK TO PLAY';
  next='Click the stage to lock mouse, WASD to move and shoot with left mouse';
 }else if(run.status==='RUNNING'){
  state='ACTIVE';
  if(!h){headline='PAINT · TRUE HUMAN IMPACT';
   next='Shoot original source paintable surfaces · actual new ink required';
  }else if(!g){headline='MOVE · GROUNDED ORIGINAL FLOOR';
   next='Keep walking on actual original Rapier-supported geometry';
  }else if(!a){headline='A1 · TRUE SUPPORT INK';
   next='Let the physically rejoined A1 land its own projectile on original floor';
  }else {headline='CO-OP PROOF RECEIVED';
   next='Waiting for native 60Hz acceptance, not an official match result';
  }
 }else if(verifiedClear){state='CLEAR';headline='TRUE HUMAN + A1 CO-OP CLEAR';
  next='Original-source practice only · NO official Turf winner';
 }else if(run.status==='CLEAR'){state='SOURCE_HOLD';headline='UNVERIFIED CO-OP CLEAR';
  next='Native A1, human ink and real ground authority do not agree';
 }else if(run.status==='TIME_UP'){state='TIME_UP';headline='PRACTICE TIME UP';
  next='Release mouse and restart genuine original-source practice';
 }else if(run.status==='ABORTED'){state='ABORTED';headline='PRACTICE INTERRUPTED';
  next='Release mouse and retry · '+(run.abortReason??'unknown');
 }
 return {state,headline,next,secondsRemaining:run.secondsRemaining,
  human:run.humanChangedImpactCells,humanGoal:run.requiredHumanChangedCells,
  grounded:run.realGroundedTravelMeters,groundGoal:run.requiredRealGroundedTravelMeters,
  a1:run.actualOriginalA1ChangedImpactCells,
  a1Goal:run.requiredOriginalA1ChangedImpactCells,
  a1Impacts:run.actualOriginalA1TaggedImpactEvents,
  humanPct:percent(run.humanChangedImpactCells,run.requiredHumanChangedCells),
  groundPct:percent(run.realGroundedTravelMeters,run.requiredRealGroundedTravelMeters),
  a1Pct:genuineA1?percent(run.actualOriginalA1ChangedImpactCells,run.requiredOriginalA1ChangedImpactCells):0,
  verifiedClear,originalScoreable:0,officialWinner:'NONE' as const,
  naturalOpponentPathCertified:false as const};
}
