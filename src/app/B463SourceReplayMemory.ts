/** B463: short-lived, local-only comparison of authentic SOURCE sessions.
 * These records are never official Turf results or remote QA attestations. */
export const B463_LOCAL_KEY='t21-f3-last-real-source-round-v1';
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
 humanShots:number;humanOriginalInkCells:number;
 cpuSourceShots:number;cpuOriginalInkCells:number;
 humanSplats:number;humanRespawns:number;
 cpuRejoined:7;officialScoreable:0;officialWinner:'NONE';
 localBrowserRecordOnly:true;formal4v4Certified:false;
}
const nonnegativeInteger=(n:unknown)=>Number.isSafeInteger(n)&&
 typeof n==='number'&&n>=0;
export function b463FromRealTimeUp(
 v:B463RoundView,realNativeTick:number,worldOrigin:number
):B463RoundRecord|null{
 if(v.finished!==true||v.timeRemainingSeconds!==0||
    v.officialScoreableSurfaces!==0||v.officialWinner!=='NONE'||
    v.productionAuthorized!==false||v.cpuPhysicallyRejoined!==7||
    !Number.isFinite(worldOrigin)||worldOrigin<=0||
    !nonnegativeInteger(realNativeTick)||realNativeTick<10800||
    ![v.genuineHumanShots,v.realHumanImpactInkCells,
      v.actualCpuSourceShots,v.actualCpuImpactInkCells,
      v.actualHumanSplats,v.actualHumanRespawns].every(nonnegativeInteger))
  return null;
 return {schema:'B463_LOCAL_SOURCE_ROUND_V1',
  source:'25/17/26/0',worldOrigin,realNativeTick,
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
     !Number.isFinite(x.worldOrigin)||!x.worldOrigin||
     x.worldOrigin>=currentWorldOrigin||
     !nonnegativeInteger(x.realNativeTick)||x.realNativeTick!<10800||
     ![x.humanShots,x.humanOriginalInkCells,x.cpuSourceShots,
       x.cpuOriginalInkCells,x.humanSplats,x.humanRespawns]
       .every(nonnegativeInteger))return null;
  return x as B463RoundRecord;
 }catch{return null;}
}
export function b463FormatSourceRoundComparison(
 previous:B463RoundRecord,current:B463RoundRecord
):string{
 const delta=(n:number)=>n>0?'+'+n:String(n);
 return 'PREVIOUS LOCAL SOURCE ROUND • NOT AN OFFICIAL SCORE\n'+
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
  'LOCAL TAB DATA ONLY · DIFFERENT MODES ARE NOT RANKED · WINNER NONE';
}
