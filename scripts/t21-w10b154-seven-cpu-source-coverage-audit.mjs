#!/usr/bin/env node
/** W10-B154 native source-only 7CPU paint contribution audit.
 * Reads genuine B139 Chromium artifacts, never creates paint evidence.
 * Does not certify original Nintendo 4v4, score or cross-team routes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const ids=['A1','A2','A3','B1','B2','B3','B4'];
const error=s=>{throw Error('B154_SOURCE_TEAM_INK_'+s);};
const n=v=>Number.isSafeInteger(v)&&v>=0;
function witness(x,variant){
 if(x?.variant!==variant||x.originalSource!==
   '25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    x.originalOppositeSideNaturalPaths!=='0/12'||
    x.cpuFootRelocations!==0||x.originalPhysicalCpuRejoins?.length!==7||
    x.formalOriginal4v4Certified!==false||
    x.productionAuthorized!==false||
    x.b149ActualNativeHumanA1Contact?.actualNativeKccA1Contacts!==0)
  error('FALSE_ORIGINAL_NATIVE_STAGE_OR_PHYSICS');
 const mode=variant==='TEAM_COVERAGE';
 const a=x.b154NativeSevenCpuInk;
 if(a?.coordinatedMode!==mode||
   a?.source!=='REAL_PAINT_COORDINATOR_GAMEPLAY_INK_ACCEPTED_CHANGES'||
   a?.excludesUnexecutedCpuShotRequests!==true||
   a?.sourceOnly!==true||a?.originalScoreablePromotions!==0||
   a?.normalPreviewDefaultChanged!==false||
   a?.productionAuthorized!==false||
   x.b154SourceInkSweepAuthority?.enabled!==mode||
   x.finalNativePatrol?.b150AllySupportInkOptIn!==
     (variant!=='FIXED_DEFAULT'))
  error('MODE_OR_AUTHORITY_DRIFT');
 const keys=Object.keys(a.byActor??{}).sort();
 if(JSON.stringify(keys)!==JSON.stringify([...ids].sort()))
  error('SEVEN_REAL_CPU_OWNERS_REQUIRED');
 const byActor={};let all=0,impact=0,participating=0;
 for(const id of ids){
  const v=a.byActor[id];
  if(!v||!['stampEvents','changedCells','impactEvents',
     'impactChangedCells','footChangedCells'].every(k=>n(v[k]))||
     v.impactEvents>v.stampEvents||
     v.impactChangedCells>v.changedCells||
     v.footChangedCells>v.changedCells||
     v.changedCells>0&&v.stampEvents===0)
   error('BAD_CPU_'+id+'_RASTERIZATION');
  if(v.changedCells>0)participating++;
  all+=v.changedCells;impact+=v.impactChangedCells;
  byActor[id]={...v};
 }
 if(!n(all)||!n(impact))error('BAD_AGGREGATE');
 const aTeam=['A1','A2','A3'].reduce((sum,id)=>sum+byActor[id].changedCells,0);
 const bTeam=['B1','B2','B3','B4'].reduce((sum,id)=>sum+byActor[id].changedCells,0);
 if(!n(a.teamAChangedCells)||!n(a.teamBChangedCells)||
    a.teamAChangedCells!==aTeam||a.teamBChangedCells!==bTeam||
    aTeam+bTeam!==all)
  error('REAL_SOURCE_TEAM_SUMS_MISMATCH');
 if(JSON.stringify(Object.keys(a.actualAcceptedSourceTurfShotRequests??{}).sort())!==
    JSON.stringify([...ids].sort())||
    ids.some(id=>!n(a.actualAcceptedSourceTurfShotRequests[id])))
  error('SEVEN_ACTUAL_SOURCE_SHOT_COUNTERS_MISSING');
 return {mode,all,impact,participating,byActor,aTeam,bTeam};
}
export function auditB154ActualSevenCpuCoverage(fixed,ally,team){
 const f=witness(fixed,'FIXED_DEFAULT');
 const a=witness(ally,'ALLY_RALLY');
 const t=witness(team,'TEAM_COVERAGE');
 const baseline=fixed.b152ExactOriginalAllyAimPaintProvenance;
 if(baseline?.acceptedSourceAimShotRequests!==0||
    baseline?.changedImpactCells!==0)
  error('DEFAULT_ALLY_PROVENANCE_CONTAMINATION');
 const qualified=t.participating===7&&t.all>0;
 return Object.freeze({
  schema:'W10_B154_NATIVE_ORIGINAL_SEVEN_CPU_TEAM_INK_V1',
  result:qualified?'SCOPED_REAL_SEVEN_CPU_INK_PARTICIPATION':
   'HOLD_NOT_ALL_SEVEN_COVERAGE_OBSERVED',
  comparisonKind:'THREE_INDEPENDENT_ACTUAL_CHROME_RUNS',
  identicalSourceStageOnly:true,
  originalAuthority:'25/17/26/0',
  originalOpponentAccess:'0/12',
  fixed:{changedCells:f.all,impactChangedCells:f.impact,paintedActors:f.participating,
   teamAChangedCells:f.aTeam,teamBChangedCells:f.bTeam},
  ally:{changedCells:a.all,impactChangedCells:a.impact,paintedActors:a.participating,
   teamAChangedCells:a.aTeam,teamBChangedCells:a.bTeam},
  teamCoverage:{
   changedCells:t.all,impactChangedCells:t.impact,
   teamAChangedCells:t.aTeam,teamBChangedCells:t.bTeam,
   paintedActors:t.participating,byActor:t.byActor
  },
  teamVsAllyChangedCellDifference:t.all-a.all,
  noCrossRunCausalOrMatchWinClaim:true,
  standardCpuAimDefaultChanged:false,
  originalGeometryChanged:false,
  originalScoreablePromotions:0,
  unrestricted4v4Certified:false,
  productionAuthorized:false
 });
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 if(process.argv.length!==6)error('USAGE_FIXED_ALLY_TEAM_OUTPUT');
 const [fixed,ally,team]=process.argv.slice(2,5).map(f=>
  JSON.parse(readFileSync(f,'utf8')));
 const out=auditB154ActualSevenCpuCoverage(fixed,ally,team);
 writeFileSync(process.argv[5],JSON.stringify(out,null,2));
 console.log('B154_REAL_NATIVE_SEVEN_CPU_TEAM_PAINT',JSON.stringify({
  result:out.result,fixed:out.fixed,ally:out.ally,
  team:{paintedActors:out.teamCoverage.paintedActors,
   changedCells:out.teamCoverage.changedCells,
   impactChangedCells:out.teamCoverage.impactChangedCells},
  original4v4Certified:false
 }));
}
