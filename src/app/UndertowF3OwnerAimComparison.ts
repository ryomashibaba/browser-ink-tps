/**
 * B70: a deliberate owner-only comparison of TWO completed real 180s
 * original-source F3 rounds. Only anonymous numeric counters can persist
 * across page reloads in this browser tab; NO automated upload.
 */
export const B70_STORAGE_KEY='T21_B70_OPT_IN_SOURCE_CPU_AIM_ROUNDS_V1';
export type B70AimMode='FIXED'|'SWEEP';
export interface B70Frame {
 tick:number;matchState:'STAGING'|'PLAYING'|'TIME_UP';
 timeRemainingSeconds:number;stopReason:string|null;
 originalSourceSolids:number;originalPaintSurfaces:number;
 originalSourceNavigationLinks?:number;
 sourceScoreablePromotions:number;
 productionAuthorized:boolean;unrestricted4v4Certified:boolean;
 shotsFired:number;cpuSourceTurfShots:number;
 cpuImpactInkCellsChanged:number;cpuSplats:number;
 humanSplats:number;humanRespawns:number;
 b23HumanInkFeedback:{humanChangedCells:number};
 cpu:{physicalRejoins:readonly string[];
  sourcePatrol:{travelMeters:number}};
 cpuContinuity:{suspectedStallCount:number};
 sourceFrameQuality:{p95Ms:number|null;liveUpdateFrames:number};
 b64SourceInkSweep:{enabled:boolean};
}
export interface B70StoredRound {
 schema:'T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1';
 mode:B70AimMode;
 nativeSeconds:180;nativeTick:number;
 originalPhysicalSolids:25;originalPaintable:17;originalNav:26;
 scoreable:0;officialWinner:'NONE';
 original4v4Certified:false;productionAuthorized:false;
 actualSevenCpuRejoined:7;
 cpuSourceShots:number;cpuImpactInkChangedCells:number;
 cpuOriginalPatrolMeters:number;cpuSuspectedPhysicalStalls:number;
 humanShots:number;humanInkChangedCells:number;humanSplats:number;
 humanRespawns:number;cpuSplats:number;
 callbackP95Ms:number|null;renderFrameSamples:number;
}
type B70Session={schema:'T21_B70_SESSION_STORAGE_ONLY_V1';
 fixed:B70StoredRound|null;sweep:B70StoredRound|null};
const positiveCount=(n:number)=>Number.isSafeInteger(n)&&n>=0;
const nonnegative=(n:number)=>Number.isFinite(n)&&n>=0;
export function captureB70Round(mode:B70AimMode,f:B70Frame):B70StoredRound{
 if(mode!=='FIXED'&&mode!=='SWEEP')throw Error('B70_MODE_INVALID');
 if(f.matchState!=='TIME_UP'||f.timeRemainingSeconds!==0||
    f.tick<10800||f.stopReason!==null)
  throw Error('B70_GENUINE_NATIVE_180S_REQUIRED');
 if(f.originalSourceSolids!==25||f.originalPaintSurfaces!==17||
    f.originalSourceNavigationLinks!==26||
    f.sourceScoreablePromotions!==0||f.productionAuthorized!==false||
    f.unrestricted4v4Certified!==false||f.cpu.physicalRejoins.length!==7||
    new Set(f.cpu.physicalRejoins).size!==7||
    f.b64SourceInkSweep.enabled!==(mode==='SWEEP'))
  throw Error('B70_SOURCE_AUTHORITY_OR_CPU_MODE_MISMATCH');
 const numeric=[f.tick,f.shotsFired,f.cpuSourceTurfShots,
  f.cpuImpactInkCellsChanged,f.cpuSplats,f.humanSplats,
  f.humanRespawns,f.b23HumanInkFeedback.humanChangedCells,
  f.cpuContinuity.suspectedStallCount,
  f.sourceFrameQuality.liveUpdateFrames];
 if(numeric.some(x=>!positiveCount(x))||
    !nonnegative(f.cpu.sourcePatrol.travelMeters)||
    (f.sourceFrameQuality.p95Ms!==null&&
     !nonnegative(f.sourceFrameQuality.p95Ms)))
  throw Error('B70_INVALID_NATIVE_MEASUREMENT');
 return {
  schema:'T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1',
  mode,nativeSeconds:180,nativeTick:f.tick,
  originalPhysicalSolids:25,originalPaintable:17,originalNav:26,
  scoreable:0,officialWinner:'NONE',
  original4v4Certified:false,productionAuthorized:false,
  actualSevenCpuRejoined:7,
  cpuSourceShots:f.cpuSourceTurfShots,
  cpuImpactInkChangedCells:f.cpuImpactInkCellsChanged,
  cpuOriginalPatrolMeters:Number(f.cpu.sourcePatrol.travelMeters.toFixed(2)),
  cpuSuspectedPhysicalStalls:f.cpuContinuity.suspectedStallCount,
  humanShots:f.shotsFired,
  humanInkChangedCells:f.b23HumanInkFeedback.humanChangedCells,
  humanSplats:f.humanSplats,humanRespawns:f.humanRespawns,
  cpuSplats:f.cpuSplats,
  callbackP95Ms:f.sourceFrameQuality.p95Ms,
  renderFrameSamples:f.sourceFrameQuality.liveUpdateFrames
 };
}
const empty=():B70Session=>({
 schema:'T21_B70_SESSION_STORAGE_ONLY_V1',fixed:null,sweep:null
});
function validStored(x:unknown,mode:B70AimMode):x is B70StoredRound{
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 const a=x as Record<string,unknown>;
 if(a.schema!=='T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1'||
  a.mode!==mode||a.nativeSeconds!==180||!positiveCount(a.nativeTick as number)||
  (a.nativeTick as number)<10800||a.originalPhysicalSolids!==25||
  a.originalPaintable!==17||a.originalNav!==26||a.scoreable!==0||
  a.officialWinner!=='NONE'||a.original4v4Certified!==false||
  a.productionAuthorized!==false||a.actualSevenCpuRejoined!==7)return false;
 const count=['cpuSourceShots','cpuImpactInkChangedCells',
  'cpuSuspectedPhysicalStalls','humanShots','humanInkChangedCells',
  'humanSplats','humanRespawns','cpuSplats','renderFrameSamples'];
 return count.every(k=>positiveCount(a[k] as number))&&
  nonnegative(a.cpuOriginalPatrolMeters as number)&&
  (a.callbackP95Ms===null||nonnegative(a.callbackP95Ms as number));
}
export function readB70Session(raw:string|null):B70Session{
 if(!raw||raw.length>2400)return empty();
 try{
  const a=JSON.parse(raw) as Partial<B70Session>;
  if(!a||a.schema!=='T21_B70_SESSION_STORAGE_ONLY_V1')
   return empty();
  // Reconstruct from known numeric fields alone; strip injected properties
  // such as actor GUIDs, source URLs or raw local source payloads.
  const safe=(q:unknown,mode:B70AimMode):B70StoredRound|null=>{
   if(!validStored(q,mode))return null;
   const o=q as B70StoredRound;
   return {
    schema:o.schema,mode,nativeSeconds:180,nativeTick:o.nativeTick,
    originalPhysicalSolids:25,originalPaintable:17,originalNav:26,
    scoreable:0,officialWinner:'NONE',
    original4v4Certified:false,productionAuthorized:false,
    actualSevenCpuRejoined:7,
    cpuSourceShots:o.cpuSourceShots,
    cpuImpactInkChangedCells:o.cpuImpactInkChangedCells,
    cpuOriginalPatrolMeters:o.cpuOriginalPatrolMeters,
    cpuSuspectedPhysicalStalls:o.cpuSuspectedPhysicalStalls,
    humanShots:o.humanShots,
    humanInkChangedCells:o.humanInkChangedCells,
    humanSplats:o.humanSplats,humanRespawns:o.humanRespawns,
    cpuSplats:o.cpuSplats,
    callbackP95Ms:o.callbackP95Ms,
    renderFrameSamples:o.renderFrameSamples
   };
  };
  return {schema:'T21_B70_SESSION_STORAGE_ONLY_V1',
   fixed:safe(a.fixed,'FIXED'),sweep:safe(a.sweep,'SWEEP')};
 }catch{return empty();}
}
export function storeB70Round(raw:string|null,round:B70StoredRound):string{
 if(!validStored(round,round.mode))throw Error('B70_UNVERIFIED_ROUND');
 const old=readB70Session(raw);
 const q:B70Session={schema:old.schema,
  fixed:round.mode==='FIXED'?round:old.fixed,
  sweep:round.mode==='SWEEP'?round:old.sweep};
 return JSON.stringify(q);
}
export function compareB70Rounds(raw:string|null){
 const q=readB70Session(raw),a=q.fixed,b=q.sweep;
 if(!a||!b)return null;
 const gain=b.cpuImpactInkChangedCells-a.cpuImpactInkChangedCells;
 const movementPercent=a.cpuOriginalPatrolMeters>0?
  Number(((b.cpuOriginalPatrolMeters/a.cpuOriginalPatrolMeters-1)*100)
   .toFixed(2)):null;
 return {
  source:'OWNER_EXPLICIT_TWO_REAL_LOCAL_COMPLETED_180S_ROUNDS' as const,
  original4v4Certified:false as const,
  originalTurfScore:'UNAVAILABLE' as const,
  defaultCpuUnchanged:true as const,
  fixed:a,sweep:b,
  realCpuInkChangedCellsDelta:gain,
  realCpuInkChangeRatio:a.cpuImpactInkChangedCells>0?
   Number((b.cpuImpactInkChangedCells/a.cpuImpactInkChangedCells)
    .toFixed(3)):null,
  realPatrolDistanceDifferencePercent:movementPercent,
  humanInputWasDifferent:a.humanShots!==b.humanShots||
   a.humanInkChangedCells!==b.humanInkChangedCells,
  noCausalWindowsGpuClaim:true as const,
  winner:'NONE' as const
 };
}
