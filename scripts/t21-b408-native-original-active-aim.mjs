/** B408 selects a fresh genuine active ORIGINAL PaintSurface cell for CDP aim.
 * Read-only SOURCE projection. Never mutates native game, HP, ink, ticks, or actor. */
import {b313ChooseOriginalActiveAim,b313ObservedRealAimMatch}
 from './t21-b313-actual-original-cell-aim.mjs';
const fail=s=>{throw Error('B408_NATIVE_ORIGINAL_AIM_HOLD_'+s);};
const v3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
export function b408ChooseActiveOriginalCell(ledger,frame,footId,{excludeGrids=[]}={}){
 const cam=frame?.cameraSourcePractice,ground=ledger;
 if(!footId?.startsWith('UndertowT21D:')||
  ground?.source!=='25/17/26/0'||ground.originalRows?.length!==17||
  ground.realHumanOriginalFootSupported!==true||
  ground.genuineHumanOriginalFootSolid!==footId||
  !Number.isFinite(ground.genuineOriginalFootGapMeters)||
  ground.genuineOriginalFootGapMeters<0||ground.genuineOriginalFootGapMeters>.4||
  ground.sourceActorRelocations!==0||ground.sourceInkRewritten!==false||
  ground.playerPositionRewritten!==false||
  !v3(ground.actualBodyMeters)||!v3(ground.actualCameraMeters)||
  frame.originalSourceSolids!==25||frame.originalPaintSurfaces!==17||
  frame.originalSourceNavigationLinks!==26||frame.sourceScoreablePromotions!==0||
  frame.productionAuthorized!==false||frame.unrestricted4v4Certified!==false||
  frame.cpu?.physicalFootRelocations!==0||frame.matchState!=='PLAYING'||frame.paused||
  cam?.sourceAimSensitivityMultiplier!==1||
  !Number.isFinite(cam.yawDegrees)||!Number.isFinite(cam.pitchDegrees))
  fail('CURRENT_SOURCE_AND_KCC_REQUIRED');
 const surfaceId=footId+':paint';
 const cells=ground.originalRows.find(r=>r.surfaceId===surfaceId)
   ?.originalB337NearbyActiveCells;
 if(!Array.isArray(cells)||cells.length<1||cells.length>3||
  cells.some(c=>![-1,0,1].includes(c.originalOwner)||
   c.realCellProvenance!=='B337_NATIVE_LOCAL_ACTIVE_GRID'))
  fail('REAL_ACTIVE_ORIGINAL_GRID_UNAVAILABLE');
 const unowned=cells.filter(c=>c.originalOwner!==1);
 const pool=unowned.length?unowned:cells;
 // Genuine CDP retries must use a different currently sourced nearby grid.
 // A failed projectile or painted-own cell is NEVER credited as an impact.
 if(!Array.isArray(excludeGrids)||excludeGrids.length>3||
    excludeGrids.some(g=>!Array.isArray(g)||g.length!==2||
      !g.every(Number.isSafeInteger)))fail('INVALID_REAL_AIM_EXCLUSIONS');
 const available=pool.filter(c=>!excludeGrids.some(g=>
   g[0]===c.grid[0]&&g[1]===c.grid[1]));
 if(available.length<1)fail('NO_DISTINCT_LIVE_ORIGINAL_TARGET');
 const selected=b313ChooseOriginalActiveAim({
  cells:available,body:ground.actualBodyMeters,camera:ground.actualCameraMeters,
  yaw:cam.yawDegrees,pitch:cam.pitchDegrees
 }).selected;
 if(!selected)fail('NO_SAFE_LIVE_MOUSE_TARGET');
 const sourceCell=available.find(c=>c.grid[0]===selected.grid[0]&&
  c.grid[1]===selected.grid[1]);
 if(!sourceCell||!v3(sourceCell.world))fail('REAL_ACTIVE_CELL_PROVENANCE');
 return {
  schema:'B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM',
  source:'25/17/26/0',surfaceId,grid:selected.grid,world:selected.world,
  ownerBefore:sourceCell.originalOwner,
  nonOwnCandidateCount:unowned.length,
  nativeTick:frame.tick,cdp:selected.actualCDP,
  yaw:selected.targetYaw,pitch:selected.targetPitch,
  simulatedInput:false,paintWrites:0,actorRelocations:0,
  scoreable:0,actualPaintChangedCellsGuaranteed:false,
  opponentHitCertified:false
 };
}
export const b408NativeMouseAligned=(p,c)=>
 p?.schema==='B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM'&&
 b313ObservedRealAimMatch({targetYaw:p.yaw,targetPitch:p.pitch},c);
