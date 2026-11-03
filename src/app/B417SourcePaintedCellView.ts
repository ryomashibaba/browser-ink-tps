/** F3 SOURCE-only, real playable painted-cell contest display.
 * 17 genuine owner grids; this is NOT scoreable Turf or an official result.
 * Every value comes from the already-sampled read-only B401 registry. */
import type {B401LiveState} from './B401NativeLiveSourceInkOwnership';

export type B417PaintedCellsView=Readonly<{
 status:'LIVE_REAL_PAINTED_CELLS';source:'25/17/26/0';
 sampleNativeTick:number;nativeAgeTicks:number;
 teamA:number;teamB:number;neutral:number;registeredCells:number;
 aSharePaintedPercent:number;bSharePaintedPercent:number;
 label:string;officialTurfScore:false;officialWinner:'NONE';
 original4v4Certified:false;gameplayWrites:0;productionAuthorized:false;
}>;
const validCount=(n:number)=>Number.isSafeInteger(n)&&n>=0;
/** NULL = hide rather than guess. No conversion of SOURCE ownership into Turf. */
export function b417RealSourcePaintedCellView(
 state:B401LiveState,actualNativeTick:number,
 actualSource:readonly number[],playing:boolean
):B417PaintedCellsView|null{
 if(!playing||actualSource.join('/')!=='25/17/26/0'||
  state.status!=='LIVE_REGISTERED_SOURCE_ONLY'||
  state.originalSourceOnly!==true||state.officialTurfScore!==false||
  state.winner!=='NONE'||state.gameplayWrites!==0||
  state.productionAuthorized!==false||state.registeredSurfaces!==17||
  !Number.isSafeInteger(actualNativeTick)||actualNativeTick<1||
  !Number.isSafeInteger(state.sampleNativeTick)||state.sampleNativeTick<1||
  state.sampleNativeTick>actualNativeTick||
  actualNativeTick-state.sampleNativeTick>360||
  ![state.totalActiveCells,state.teamA,state.teamB,state.neutral].every(validCount)||
  state.totalActiveCells<1||
  state.teamA+state.teamB+state.neutral!==state.totalActiveCells||
  ![state.aPercent,state.bPercent,state.neutralPercent].every(Number.isFinite)||
  Math.abs(state.aPercent-100*state.teamA/state.totalActiveCells)>1e-6||
  Math.abs(state.bPercent-100*state.teamB/state.totalActiveCells)>1e-6||
  Math.abs(state.neutralPercent-100*state.neutral/state.totalActiveCells)>1e-6)
  return null;
 const painted=state.teamA+state.teamB;
 const aShare=painted>0?Number((100*state.teamA/painted).toFixed(2)):0;
 const bShare=painted>0?Number((100*state.teamB/painted).toFixed(2)):0;
 return {
  status:'LIVE_REAL_PAINTED_CELLS',source:'25/17/26/0',
  sampleNativeTick:state.sampleNativeTick,
  nativeAgeTicks:actualNativeTick-state.sampleNativeTick,
  teamA:state.teamA,teamB:state.teamB,neutral:state.neutral,
  registeredCells:state.totalActiveCells,
  aSharePaintedPercent:aShare,bSharePaintedPercent:bShare,
  label:'REAL SOURCE PAINTED CELLS · A '+state.teamA.toLocaleString('en-US')+
   ' / B '+state.teamB.toLocaleString('en-US')+
   ' · UNSCORED / NO TURF RESULT',
  officialTurfScore:false,officialWinner:'NONE',
  original4v4Certified:false,gameplayWrites:0,productionAuthorized:false
 };
}
