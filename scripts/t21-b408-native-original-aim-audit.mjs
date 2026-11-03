/** B408 independent real target/impact gate. B407 full-round proof stays mandatory.
 * Original ownerGrid delta is NOT official Turf score or enemy HP damage. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {b407AuditRealHumanWaves} from './t21-b407-time-distributed-human-audit.mjs';
import {b408NativeMouseAligned} from './t21-b408-native-original-active-aim.mjs';
const assert=(ok,label)=>{if(!ok)throw Error('B408_REAL_NATIVE_TARGET_HOLD_'+label);};
export function b408AuditLiveOriginalAim(raw,round,options={}){
 const b407=(options.auditB407||b407AuditRealHumanWaves)(raw,round);
 assert(b407.verdict==='PASS_FIVE_REAL_HUMAN_KCC_AND_FIRE_WAVES_IN_ONE_180S_SOURCE_GAME',
  'B407_PREREQUISITE');
 assert(raw.waves?.length===5,'FIVE_REAL_ACTION_WINDOWS');
 let totalCells=0,totalShots=0;
 for(let i=0;i<5;i++){
  const w=raw.waves[i],p=w?.b408Aim,plan=p?.plan;
  assert(plan?.schema==='B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM'&&
   plan.source==='25/17/26/0'&&plan.scoreable===0&&
   plan.simulatedInput===false&&plan.paintWrites===0&&
   plan.actorRelocations===0&&plan.actualPaintChangedCellsGuaranteed===false&&
   plan.opponentHitCertified===false&&
   [-1,0,1].includes(plan.ownerBefore)&&
   Number.isSafeInteger(plan.nativeTick)&&
   plan.nativeTick>=w.before.tick&&plan.nativeTick<=w.after.tick&&
   plan.surfaceId===w.before.originalFootSolid+':paint'&&
   Array.isArray(plan.grid)&&plan.grid.length===2&&plan.grid.every(Number.isSafeInteger)&&
   Array.isArray(plan.world)&&plan.world.length===3&&plan.world.every(Number.isFinite)&&
   Array.isArray(plan.cdp)&&plan.cdp.length===2&&plan.cdp.every(Number.isFinite)&&
   w.actualCdpMouse[0]===plan.cdp[0]&&w.actualCdpMouse[1]===plan.cdp[1]&&
   p.nativeMouseDispatched===true&&
   b408NativeMouseAligned(plan,p.realObservedCamera)&&
   Number.isSafeInteger(p.impactTick)&&p.impactTick>plan.nativeTick&&
   p.impactTick<=w.after.tick&&p.realLastPaintSurface===plan.surfaceId&&
   Number.isSafeInteger(p.additionalShots)&&p.additionalShots>0&&
   p.additionalShots<=w.after.humanShots-w.before.humanShots&&
   Number.isSafeInteger(p.realAddedCells)&&p.realAddedCells>=0&&
   p.realAddedCells===w.after.humanChangedCells-w.before.humanChangedCells,
   'LIVE_ORIGINAL_MOUSETARGET_AND_PAINT_'+i);
  totalCells+=p.realAddedCells;totalShots+=p.additionalShots;
 }
 assert(totalCells>0,'NO_NEW_SOURCE_OWNERGRID_CELLS_IN_ANY_WAVE');
 return {schema:'B408_INDEPENDENT_NATIVE_180S_REAL_ORIGINAL_AIM',
  verdict:'PASS_FIVE_REAL_MOUSE_AIMS_AND_SOURCE_PAINT_IMPACTS',
  observedAimedWaves:5,actualNativeHumanShots:totalShots,
  genuineNewOriginalGridCells:totalCells,realNativeRound:true,
  source:'25/17/26/0',sourceScoreable:0,
  actualOpponentHpDamageCertified:false,killRespawnChainCertified:false,
  sourceOpponentRouteCertified:false,formal4v4Certified:false,
  productionAuthorized:false,officialWinner:'NONE'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];assert(typeof dir==='string','EVIDENCE_DIR');
 const raw=JSON.parse(readFileSync(join(dir,'b407-real-time-distributed-human.json'),'utf8'));
 const round=JSON.parse(readFileSync(join(dir,'b405-same-original-180s-round.json'),'utf8'));
 const r=b408AuditLiveOriginalAim(raw,round);
 writeFileSync(join(dir,'b408-independent-native-active-aim-verdict.json'),
  JSON.stringify(r,null,2)+'\n');
 console.log('B408_INDEPENDENT_ONE_REAL_GAME_ACTIVE_AIM',JSON.stringify(r));
}
