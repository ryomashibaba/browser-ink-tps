/** B463: short-lived, local-only comparison of authentic SOURCE sessions.
 * These records are never official Turf results or remote QA attestations. */
import {sourceCanonicalPlayableMode} from './SourcePlayPortal';

export const B463_LOCAL_KEY='t21-f3-last-real-source-round-v1';
/** Read-only browser SOURCE mode provenance. A local comparison can only
 * compare the same canonically launched playable mode: co-op/frontline
 * metrics are NOT interchangeable with combat/circuit performance. */
export type B463SourceMode='combat'|'circuit'|'coop'|'frontline'|'OTHER_SOURCE';
const B463_SOURCE_MODES:readonly B463SourceMode[]=[
 'combat','circuit','coop','frontline','OTHER_SOURCE'
];
const b463SourceMode=(sourceHref:string):B463SourceMode=>{
 try{
  const url=new URL(sourceHref);
  // Historical /index.html SOURCE worlds use the same native round,
  // even though their URL itself is not a fresh portal launcher. Decode
  // the mode for LOCAL statistics only; never broaden boot/replay gates.
  if(url.pathname.endsWith('/index.html'))
   url.pathname=url.pathname.slice(0,-'index.html'.length);
  return sourceCanonicalPlayableMode(url.href)??'OTHER_SOURCE';
 }catch{return 'OTHER_SOURCE';}
};
export interface B463RoundView {
 finished:boolean;timeRemainingSeconds:number;
 cpuPhysicallyRejoined:number;
 genuineHumanShots:number;realHumanImpactInkCells:number;
 actualCpuSourceShots:number;actualCpuImpactInkCells:number;
 actualHumanSplats:number;actualHumanRespawns:number;
 officialScoreableSurfaces:number;officialWinner:string;
 productionAuthorized:boolean;
}
export interface B463RoundRecord {
 schema:'B463_LOCAL_SOURCE_ROUND_V1';source:'25/17/26/0';
 worldOrigin:number;realNativeTick:number;
 /** Optional only for old V1 sessionStorage records written before
  * browser SOURCE mode provenance was recorded. */
 sourceMode?:B463SourceMode;
 humanShots:number;humanOriginalInkCells:number;
 cpuSourceShots:number;cpuOriginalInkCells:number;
 humanSplats:number;humanRespawns:number;
 cpuRejoined:7;officialScoreable:0;officialWinner:'NONE';
 localBrowserRecordOnly:true;formal4v4Certified:false;
}
const nonnegativeInteger=(n:unknown):n is number=>
 typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
/** One physical SOURCE human life may still be waiting for its next
 * 150th native tick at TIME_UP, but cannot have two pending splats or
 * more genuine returns than fatal contacts. No synthetic respawn granted. */
function coherentHumanLife(
 splats:unknown,returns:unknown,nativeTick:unknown
):boolean{
 return nonnegativeInteger(splats)&&nonnegativeInteger(returns)&&
  nonnegativeInteger(nativeTick)&&returns<=splats&&
  splats-returns<=1&&returns<=Math.floor(nativeTick/150);
}
export function b463FromRealTimeUp(
 v:B463RoundView,realNativeTick:number,worldOrigin:number,
 sourceHref?:string
):B463RoundRecord|null{
 if(v.finished!==true||v.timeRemainingSeconds!==0||
    v.officialScoreableSurfaces!==0||v.officialWinner!=='NONE'||
    v.productionAuthorized!==false||v.cpuPhysicallyRejoined!==7||
    !Number.isFinite(worldOrigin)||worldOrigin<=0||
    !nonnegativeInteger(realNativeTick)||realNativeTick<10800||
    ![v.genuineHumanShots,v.realHumanImpactInkCells,
      v.actualCpuSourceShots,v.actualCpuImpactInkCells].every(nonnegativeInteger)||
    !coherentHumanLife(v.actualHumanSplats,
      v.actualHumanRespawns,realNativeTick))
  return null;
 const href=sourceHref??(typeof window==='undefined'?'':window.location.href);
 return {schema:'B463_LOCAL_SOURCE_ROUND_V1',
  source:'25/17/26/0',worldOrigin,realNativeTick,
  sourceMode:b463SourceMode(href),
  humanShots:v.genuineHumanShots,
  humanOriginalInkCells:v.realHumanImpactInkCells,
  cpuSourceShots:v.actualCpuSourceShots,
  cpuOriginalInkCells:v.actualCpuImpactInkCells,
  humanSplats:v.actualHumanSplats,
  humanRespawns:v.actualHumanRespawns,
  cpuRejoined:7,officialScoreable:0,officialWinner:'NONE',
  localBrowserRecordOnly:true,formal4v4Certified:false};
}
export function b463ReadPreviousSourceRound(
 raw:string|null,currentWorldOrigin:number
):B463RoundRecord|null{
 if(!raw||!Number.isFinite(currentWorldOrigin)||currentWorldOrigin<=0||
    raw.length>2048)return null;
 try{
  const x=JSON.parse(raw) as Partial<B463RoundRecord>;
  if(x.schema!=='B463_LOCAL_SOURCE_ROUND_V1'||
     x.source!=='25/17/26/0'||x.cpuRejoined!==7||
     x.officialScoreable!==0||x.officialWinner!=='NONE'||
     x.localBrowserRecordOnly!==true||x.formal4v4Certified!==false||
     (x.sourceMode!==undefined&&
      !B463_SOURCE_MODES.includes(x.sourceMode as B463SourceMode))||
     typeof x.worldOrigin!=='number'||
     !Number.isFinite(x.worldOrigin)||x.worldOrigin<=0||
     x.worldOrigin>=currentWorldOrigin||
     !nonnegativeInteger(x.realNativeTick)||x.realNativeTick!<10800||
     ![x.humanShots,x.humanOriginalInkCells,x.cpuSourceShots,
       x.cpuOriginalInkCells].every(nonnegativeInteger)||
     !coherentHumanLife(x.humanSplats,x.humanRespawns,
       x.realNativeTick))return null;
  return x as B463RoundRecord;
 }catch{return null;}
}
export function b463FormatSourceRoundComparison(
 previous:B463RoundRecord,current:B463RoundRecord
):string{
 // A previous tab-local record may predate mode provenance, or the
 // player may have selected a different genuine SOURCE mode at READY.
 // Cross-mode shot/ink/splat differences are not a valid comparison.
 // Do not discard either round, infer an opponent route or award a win.
 const currentMode=current.sourceMode??'UNKNOWN';
 const previousMode=previous.sourceMode??'UNKNOWN';
 if(currentMode==='UNKNOWN'||previousMode==='UNKNOWN'||
    currentMode==='OTHER_SOURCE'||previousMode==='OTHER_SOURCE'||
    currentMode!==previousMode)
  return 'PREVIOUS LOCAL SOURCE ROUND • NOT AN OFFICIAL SCORE\n'+
   'PREVIOUS MODE '+previousMode+' / CURRENT MODE '+currentMode+'\n'+
   'DIRECT PERFORMANCE COMPARISON UNAVAILABLE · MODES MUST MATCH\n'+
   'LOCAL TAB DATA ONLY · HP CONTACT NOT CERTIFIED · WINNER NONE';
 const delta=(n:number)=>n>0?'+'+n:String(n);
 return 'PREVIOUS LOCAL SOURCE ROUND • '+currentMode+
  ' • NOT AN OFFICIAL SCORE\n'+
  'HUMAN SHOTS '+previous.humanShots+' → '+current.humanShots+
  ' ('+delta(current.humanShots-previous.humanShots)+')\n'+
  'HUMAN INK CELLS '+previous.humanOriginalInkCells+
  ' → '+current.humanOriginalInkCells+
  ' ('+delta(current.humanOriginalInkCells-previous.humanOriginalInkCells)+')\n'+
  'CPU SOURCE SHOTS '+previous.cpuSourceShots+' → '+current.cpuSourceShots+
  ' ('+delta(current.cpuSourceShots-previous.cpuSourceShots)+')\n'+
  'CPU INK CELLS '+previous.cpuOriginalInkCells+
  ' → '+current.cpuOriginalInkCells+
  ' ('+delta(current.cpuOriginalInkCells-previous.cpuOriginalInkCells)+')\n'+
  'HUMAN SPLATS '+previous.humanSplats+' → '+current.humanSplats+
  ' ('+delta(current.humanSplats-previous.humanSplats)+')\n'+
  'HUMAN 150-TICK RETURNS '+previous.humanRespawns+
  ' → '+current.humanRespawns+
  ' ('+delta(current.humanRespawns-previous.humanRespawns)+')\n'+
  'PENDING HUMAN RETURN AT TIME_UP '+
  (previous.humanSplats>previous.humanRespawns?'YES':'NO')+
  ' → '+(current.humanSplats>current.humanRespawns?'YES':'NO')+'\n'+
  'LOCAL TAB DATA ONLY · HP CONTACT NOT CERTIFIED BY THIS RECORD · WINNER NONE';
}
