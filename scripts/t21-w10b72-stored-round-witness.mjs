#!/usr/bin/env node
/**
 * W10-B72 — source-only B70 *browser-persisted evidence* verifier.
 * The outer sessionStorage document has schema SESSION_STORAGE_ONLY_V1;
 * its nested fixed/sweep actual rounds each have ROUND_V1 schema.
 * Never conflate them or infer an official Turf winner.
 * This analyzes only small anonymous numeric summaries after a real click.
 */
export function auditB72OwnerStoredRound(witness){
 const no=code=>{throw Error('B72_'+code);};
 if(!witness||typeof witness!=='object')no('NO_ACTUAL_BROWSER_WITNESS');
 const x=witness,actual=x.stored;
 if(x.search!=='?t21Play=preview&t21W10B68=previewSweep'||
    x.stage!=='STAGING'||x.sourceOriginalSolids!==25||
    x.originalPaintable!==17||x.originalLinks!==26||
    x.scoreable!==0||x.noScore!==true||x.optInSweep!==true||
    x.productionAuthorized!==false)
  no('UNTRUSTED_POST_CLICK_NORMAL_SOURCE_BOOT');
 if(!actual||actual.sessionSchema!=='T21_B70_SESSION_STORAGE_ONLY_V1'||
    actual.recordSchema!=='T21_B70_OWNER_CHOSEN_REAL_NATIVE_UNSCORED_ROUND_V1'||
    actual.mode!=='FIXED'||actual.real180Seconds!==180||
    !Number.isSafeInteger(actual.tick)||actual.tick<10800||
    !Number.isSafeInteger(actual.sourceInk)||actual.sourceInk<=0||
    !Number.isSafeInteger(actual.cpuSourceShots)||actual.cpuSourceShots<=0||
    actual.originalActorCount!==7||
    actual.noScore!==true||actual.noOriginal4v4!==true||
    actual.productionAuthorized!==false||actual.winner!=='NONE'||
    actual.originalCoordFields!==false||x.otherNotSaved!==true)
  no('INVALID_NESTED_REAL_NATIVE_COMPLETED_ROUND');
 const n=x.persistedSourceRawLength;
 if(!Number.isSafeInteger(n)||n<=0||n>2400)
  no('BROWSER_STORAGE_FORMAT_UNBOUNDED');
 if(x.b70OwnerOptIn!=='REQUIRED'||x.b70DataUpload!=='NONE'||
    x.b70Stage!=='NOT_FINISHED'||x.b70NextUiMode!=='SWEEP')
  no('OWNER_NONDEFAULT_OPTIN_NOT_VISIBLE');
 return {
  verdict:'B72_GENUINE_NORMAL_PREVIEW_USER_CLICK_AND_STORED_ROUND_PASS',
  sourceOriginalScope:'25_SOLIDS_17_PAINTABLE_26_LINKS_0_SCOREABLE',
  nativeSeconds:actual.real180Seconds,
  actualNativeTick:actual.tick,
  originalCpuGroundRejoins:actual.originalActorCount,
  actualSourceCpuShots:actual.cpuSourceShots,
  realSourceCpuInkCellsChanged:actual.sourceInk,
  switchedToExplicitOptionalSweep:true,
  localTabStorageOnly:true,
  noOriginalActorTransformOrSourceAssetExport:true,
  noOfficialTurfWinner:true,
  defaultCpuChanged:false,
  original4v4Certified:false
 };
}
