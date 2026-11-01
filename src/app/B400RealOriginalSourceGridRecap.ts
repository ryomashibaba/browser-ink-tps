/** B400: final ownership of ONLY the 17 registered source ink grids.
 * Actual original paint events write ownerGrid; this reader NEVER writes.
 * Cell counts are NOT game area, official turf scoring, or a winner. */
export type B400SourceGrid=Readonly<{
 id:string;isScoreable:boolean;widthCells:number;heightCells:number;
 ownerGrid:Readonly<Int8Array>;
 isCellActive:(x:number,y:number)=>boolean;
}>;
export type B400SourceRecap=Readonly<{
 status:'FINAL_REGISTERED_SOURCE_ONLY'|'HOLD';
 cause:string;
 observedSurfaces:number;
 activeOriginalGridCells:number;
 teamACells:number;teamBCells:number;neutralCells:number;
 teamAPercentOfRegisteredCells:number;
 teamBPercentOfRegisteredCells:number;
 neutralPercentOfRegisteredCells:number;
 realPlayerInkEventsNotInferred:true;
 countsAreNotOfficialTurfArea:true;
 scoreableCells:0;winner:'NONE';productionAuthorized:false;
 gameplayWrites:0;
}>;
const hold=(reason:string,surfaces:number):B400SourceRecap=>({
 status:'HOLD',cause:reason,observedSurfaces:surfaces,
 activeOriginalGridCells:0,teamACells:0,teamBCells:0,neutralCells:0,
 teamAPercentOfRegisteredCells:0,teamBPercentOfRegisteredCells:0,
 neutralPercentOfRegisteredCells:0,realPlayerInkEventsNotInferred:true,
 countsAreNotOfficialTurfArea:true,scoreableCells:0,winner:'NONE',
 productionAuthorized:false,gameplayWrites:0
});
export function b400RealOriginalSourceGridRecap(
 surfaces:readonly B400SourceGrid[],timeUp:boolean,
 stage:readonly [number,number,number,number]
):B400SourceRecap{
 if(!timeUp)return hold('NO_REAL_NATIVE_TIME_UP',surfaces.length);
 if(stage.join('/')!=='25/17/26/0'||surfaces.length!==17)
  return hold('ORIGINAL_SOURCE_BOUNDARY_NOT_VERIFIED',surfaces.length);
 const ids=new Set<string>();let teamACells=0,teamBCells=0,neutralCells=0;
 for(const s of surfaces){
  if(!s.id||ids.has(s.id)||s.isScoreable||!Number.isSafeInteger(s.widthCells)||
     !Number.isSafeInteger(s.heightCells)||s.widthCells<1||s.heightCells<1||
     s.ownerGrid.length!==s.widthCells*s.heightCells)
   return hold('SOURCE_GRID_INVALID_OR_SCOREABLE',surfaces.length);
  ids.add(s.id);
  for(let y=0;y<s.heightCells;y++)for(let x=0;x<s.widthCells;x++){
   const owner=s.ownerGrid[y*s.widthCells+x];
   const active=s.isCellActive(x,y);
   if(!active){
    if(owner!==0)return hold('INK_OUTSIDE_ORIGINAL_ACTIVE_FOOTPRINT',surfaces.length);
    continue;
   }
   if(owner===1)teamACells++;
   else if(owner===-1)teamBCells++;
   else if(owner===0)neutralCells++;
   else return hold('UNRECOGNIZED_ORIGINAL_OWNER',surfaces.length);
  }
 }
 const count=teamACells+teamBCells+neutralCells;
 if(count<1)return hold('NO_REGISTERED_ACTIVE_SOURCE_CELLS',surfaces.length);
 return {status:'FINAL_REGISTERED_SOURCE_ONLY',
  cause:'REAL_NATIVE_TIME_UP_OWNER_GRID',observedSurfaces:surfaces.length,
  activeOriginalGridCells:count,teamACells,teamBCells,neutralCells,
  teamAPercentOfRegisteredCells:100*teamACells/count,
  teamBPercentOfRegisteredCells:100*teamBCells/count,
  neutralPercentOfRegisteredCells:100*neutralCells/count,
  realPlayerInkEventsNotInferred:true,countsAreNotOfficialTurfArea:true,
  scoreableCells:0,winner:'NONE',productionAuthorized:false,gameplayWrites:0
 };
}

// Only this compact aggregate is included when the owner voluntarily
// downloads a B62 session JSON. No source geometry, position, ownerGrid
// raster, source filenames, hardware identifiers or simulated Turf score.
export function b400SourceGridDownloadRecap(
 final:B400SourceRecap|null
){
 if(!final)return {
  status:'NOT_MEASURED' as const,reason:'REAL_TIME_UP_GRID_NOT_CAPTURED',
  officialTurfScoreIncluded:false as const,
  originalMapGeometryIncluded:false as const,
  playerOrCpuPositionsIncluded:false as const,
  officialWinner:'NONE' as const,gameplayWrites:0 as const
 };
 return {
  status:final.status,reason:final.cause,
  originalRegisteredSurfaceCount:final.observedSurfaces,
  totalActiveOriginalGridCells:final.activeOriginalGridCells,
  realTeamACells:final.teamACells,
  realTeamBCells:final.teamBCells,
  realNeutralCells:final.neutralCells,
  teamAPercentOfRegisteredGrid:final.teamAPercentOfRegisteredCells,
  teamBPercentOfRegisteredGrid:final.teamBPercentOfRegisteredCells,
  neutralPercentOfRegisteredGrid:final.neutralPercentOfRegisteredCells,
  officialTurfScoreIncluded:false as const,
  originalMapGeometryIncluded:false as const,
  playerOrCpuPositionsIncluded:false as const,
  officialWinner:'NONE' as const,gameplayWrites:0 as const
 };
}

// A short source-training timeout must NEVER be presented as the genuine
// 180 s native round. Caller passes only measured simulation state.
export function b400Real180SourceEndGate(v:Readonly<{
 fullRound:boolean;matchState:string;
 timeRemainingSeconds:number;nativeTick:number;
 stopReason:string|null;
}>):boolean{
 return v.fullRound&&v.matchState==='TIME_UP'&&!v.stopReason&&
  Number.isSafeInteger(v.nativeTick)&&v.nativeTick>=10800&&
  Number.isFinite(v.timeRemainingSeconds)&&
  Math.abs(v.timeRemainingSeconds)<.001;
}
