#!/usr/bin/env node
/** W10-B153: verify actual native B152 CPU A1 aim -> real source ink
 * events from paired ORIGINAL WebGL2 Chromium evidence. Not a score.
 * `HOLD` is an observed outcome, never promoted to a false PASS. */
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const stop=reason=>{throw Error('B153_ORIGINAL_SOURCE_AIM_PROOF_'+reason);};
const count=v=>Number.isSafeInteger(v)&&v>=0;
const nonNegative=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
function sourceWitness(x,expectedOptIn){
 const p=x?.b152ExactOriginalAllyAimPaintProvenance;
 if(!p||p.qaOptIn!==expectedOptIn||
  p.source!=='A1_SOURCE_AIM_TO_PHYSICAL_PROJECTILE_TO_PAINT_EVENT'||
  p.sourceTagDoesNotGrantInkOrMovementAuthority!==true||
  p.scoreablePromotions!==0||p.full4v4Certified!==false)
  stop('MISSING_REAL_ORIGINAL_PROVENANCE_OR_AUTHORITY');
 const fields=['acceptedSourceAimShotRequests','spawned',
  'originalSourceSurfaceCollisions','impactEvents','changedImpactCells',
  'zeroChangedInkImpacts'];
 for(const f of fields)if(!count(p[f]))stop('UNSAFE_NON_INTEGER_'+f);
 if(p.spawned<p.originalSourceSurfaceCollisions||
   p.originalSourceSurfaceCollisions<p.impactEvents||
   p.impactEvents<p.zeroChangedInkImpacts)
  stop('INCONSISTENT_NATIVE_PROJECTILE_TO_PAINT_CHAIN');
 if(p.changedImpactCells>0&&p.impactEvents===0)
  stop('CHANGED_CELLS_WITHOUT_REAL_PAINT_IMPACT');
 const total=x?.b151A1RealProjectileImpactInk;
 if(!total||!count(total.impactEvents)||
   !count(total.changedImpactCells)||
   p.impactEvents>total.impactEvents||
   p.changedImpactCells>total.changedImpactCells)
  stop('TAGGED_PROVENANCE_EXCEEDS_ALL_A1_ACTUAL_PAINT');
 return p;
}
export function auditB153OriginalAllyAimInk(ally,fixed){
 if(ally?.variant!=='ALLY_RALLY'||fixed?.variant!=='FIXED_DEFAULT'||
    ally.originalSource!=='25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE'||
    fixed.originalSource!==ally.originalSource||
    ally.originalOppositeSideNaturalPaths!=='0/12'||
    fixed.originalOppositeSideNaturalPaths!=='0/12'||
    ally.cpuFootRelocations!==0||fixed.cpuFootRelocations!==0||
    ally.originalPhysicalCpuRejoins?.length!==7||
    fixed.originalPhysicalCpuRejoins?.length!==7||
    ally.productionAuthorized!==false||fixed.productionAuthorized!==false||
    ally.formalOriginal4v4Certified!==false||
    fixed.formalOriginal4v4Certified!==false||
    ally.finalNativePatrol?.b150AllySupportInkOptIn!==true||
    fixed.finalNativePatrol?.b150AllySupportInkOptIn!==false||
    fixed.finalNativePatrol?.b137ApprovedNativeRallies!==0||
    ally.b149ActualNativeHumanA1Contact?.actualNativeKccA1Contacts!==0||
    fixed.b149ActualNativeHumanA1Contact?.actualNativeKccA1Contacts!==0)
  stop('WRONG_NATIVE_ORIGINAL_AUTHORITY_OR_UNSAFE_RALLY');
 const a=sourceWitness(ally,true),f=sourceWitness(fixed,false);
 if(f.acceptedSourceAimShotRequests!==0||f.spawned!==0||
    f.originalSourceSurfaceCollisions!==0||f.impactEvents!==0||
    f.changedImpactCells!==0||f.zeroChangedInkImpacts!==0)
  stop('FIXED_DEFAULT_PROVENANCE_CONTAMINATION');
 const proven=a.acceptedSourceAimShotRequests>0&&a.spawned>0&&
  a.originalSourceSurfaceCollisions>0&&a.impactEvents>0&&
  a.changedImpactCells>0;
 return Object.freeze({
  schema:'W10_B153_NATIVE_REAL_SOURCE_A1_AIM_TO_INK_V1',
  result:proven?'SCOPED_REAL_ALLY_AIM_CHANGED_ORIGINAL_SOURCE_CELLS':
   'HOLD_NO_ATTRIBUTABLE_ORIGINAL_SOURCE_A1_INK',
  genuine7CpuOriginalWebGL2Only:true,
  baselineFixedUntouched:true,
  exactNativeSource:'25/17/26/0',
  originalNaturalEnemyAccess:'0/12',
  realA1AllyAimRequests:a.acceptedSourceAimShotRequests,
  realA1AllyAimProjectileSpawns:a.spawned,
  realOriginalSourceSurfaceCollisions:a.originalSourceSurfaceCollisions,
  confirmedRoutedPaintImpactEvents:a.impactEvents,
  independentlyRasterizedChangedCells:a.changedImpactCells,
  realZeroCellImpacts:a.zeroChangedInkImpacts,
  totalRealA1PaintChangedCells:ally.b151A1RealProjectileImpactInk.changedImpactCells,
  onlyAttributedProvenanceCounted:true,
  originalStageModified:false,
  scoreableSurfacePromotions:0,
  humanCpuCollisionFullyCertified:false,
  fullOriginal4v4Certified:false,
  productionAuthorized:false
 });
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 if(process.argv.length!==5)stop('USAGE_ALLY_FIXED_OUTPUT');
 const [ally,fixed]=process.argv.slice(2,4).map(x=>
  JSON.parse(readFileSync(x,'utf8')));
 const result=auditB153OriginalAllyAimInk(ally,fixed);
 writeFileSync(process.argv[4],JSON.stringify(result,null,2));
 console.log('B153_REAL_ORIGINAL_A1_AIM_INK_PROVENANCE',JSON.stringify(result));
}
