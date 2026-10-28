/**
 * B284: pinned game-data SceneInfo identity audit; no game runtime or physics
 * changes. The third-party KiTrix human-name helper is non-authoritative.
 *
 * node --test scripts/qa-offline/t21-b284-stage-identity-provenance.test.mjs
 * node scripts/qa-offline/t21-b284-stage-identity-provenance.mjs --verify-upstream
 */
import {writeFileSync} from 'node:fs';

export const B284_LEANNY_COMMIT='7280ff9cde8bb1c5dcef46c700c326471584d2e6';
export const B284_KITRIX_COMMIT='0611f51b35c9736ee986fb2218461e2585b7875e';
export const B284_SNAPSHOTS=Object.freeze(['720','920','1130']);
export const B284_GAME_ROWS=Object.freeze([
 {id:'Vss_Temple01',label:'マテガイ放水路（改修後）',resource:'Model/Fld_Temple01.bfres'},
 {id:'Vss_Temple00',label:'マテガイ放水路',resource:'Model/Fld_Temple00.bfres'},
 {id:'Vss_Nagasaki03',label:'チョウザメ造船',resource:'Model/Fld_Nagasaki03.bfres'}
]);

function assertPinnedSha(commit){
 if(!/^[0-9a-f]{40}$/.test(commit))throw Error('B284_INVALID_PINNED_SHA');
}
export function auditB284GameSceneRows(snapshots,sourceLoader){
 assertPinnedSha(B284_LEANNY_COMMIT);
 assertPinnedSha(B284_KITRIX_COMMIT);
 if(!Array.isArray(snapshots)||snapshots.length!==B284_SNAPSHOTS.length)
  throw Error('B284_THREE_PINNED_SCENEINFO_SNAPSHOTS_REQUIRED');
 const sceneEvidence=[];
 for(let i=0;i<B284_SNAPSHOTS.length;i++){
  const snap=snapshots[i],expectedVersion=B284_SNAPSHOTS[i];
  if(snap?.version!==expectedVersion||!Array.isArray(snap?.rows))
   throw Error('B284_SCENEINFO_VERSION_OR_ROWS_MISSING_'+expectedVersion);
  const mapping=[];
  for(const target of B284_GAME_ROWS){
   const found=snap.rows.filter(row=>row?.__RowId===target.id);
   if(found.length!==1)throw Error('B284_GAME_ROW_NOT_UNIQUE_'+expectedVersion+'_'+target.id);
   const row=found[0];
   if(row.Label!==target.label||row.SequenceName!=='Versus'||
      !Array.isArray(row.PreloadResources)||
      !row.PreloadResources.includes(target.resource))
    throw Error('B284_GAME_STAGE_IDENTITY_MISMATCH_'+expectedVersion+'_'+target.id);
   mapping.push({row:target.id,label:row.Label,model:target.resource});
  }
  sceneEvidence.push({version:expectedVersion,mapping});
 }
 if(typeof sourceLoader!=='string')throw Error('B284_PINNED_KITRIX_LOADER_NOT_PROVIDED');
 const extract=(name)=>{
  const escaped=name.replace(/[.*+?^{}()|[\]\\]/g,'\\$&');
  return sourceLoader.match(new RegExp('"'+escaped+'"\\s*:\\s*"([^"]+)"'))?.[1]??null;
 };
 const kiUndertow=extract('Undertow Spillway'),kiCamp=extract('Camp Triggerfish');
 if(kiUndertow!=='Vss_Nagasaki03'||kiCamp!=='Vss_Temple01')
  throw Error('B284_PINNED_KITRIX_CONTRADICTION_DRIFT');
 return {
  schema:'T21_B284_PINNED_SCENEINFO_IDENTITY_V1',
  primaryEvidence:'Leanny/splat3 SceneInfo game-data rows',
  pinnedLeannyCommit:B284_LEANNY_COMMIT,
  pinnedKiTrixCommit:B284_KITRIX_COMMIT,
  sceneEvidence,
  kitrixConflictingConvenienceNames:{undertow:kiUndertow,camp:kiCamp},
  identityVerdict:'TEMPLE01_CONFIRMED_REMODELED_UNDERTOW',
  /** Collision flags are NOT supplied by SceneInfo or an OBJ rendering mesh. */
  floorLine00OriginalGameCollisionRoleAuthenticated:false,
  sourceFloorlineLiveProductionPromotionAuthorized:false,
  authenticatedUnderpassRoute:false,
  authenticHumanKccHistoricalEvidencePreserved:true,
  registeredStageAuthority:[25,17,26,0],
  activationReady:false,productionAuthorized:false,unrestricted4v4Certified:false
 };
}
async function fetchPinnedText(url){
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error('B284_UPSTREAM_FETCH_FAILED_'+response.status+'_'+url);
 return await response.text();
}
export async function verifyB284PinnedUpstream(fetchText=fetchPinnedText){
 const base='https://raw.githubusercontent.com/';
 const snaps=[];
 for(const version of B284_SNAPSHOTS){
  const url=base+'Leanny/splat3/'+B284_LEANNY_COMMIT+
   '/data/mush/'+version+'/SceneInfo.json';
  snaps.push({version,rows:JSON.parse(await fetchText(url))});
 }
 const loader=await fetchText(base+'kirakira-dev/KiTrix/'+B284_KITRIX_COMMIT+
  '/KiTrix/SceneKit/StageLoader.swift');
 return auditB284GameSceneRows(snaps,loader);
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 if(process.argv.includes('--verify-upstream')){
  try {
   const result=await verifyB284PinnedUpstream();
   if(process.env.B284_PROVENANCE_OUTPUT)
    writeFileSync(process.env.B284_PROVENANCE_OUTPUT,
     JSON.stringify(result,null,2)+'\n');
   console.log('B284_PINNED_GAME_SCENE_IDENTITY_PASS',JSON.stringify(result));
  } catch(e) {
   console.error('B284_PINNED_GAME_SCENE_IDENTITY_FAIL',e);
   process.exitCode=1;
  }
 } else {
  console.error('Usage: node scripts/qa-offline/t21-b284-stage-identity-provenance.mjs --verify-upstream');
  process.exitCode=2;
 }
}
