#!/usr/bin/env node
/** B410: independently certify actual late-game human CDP WASD, genuine
 * SOURCE upper-floor retargeted main-gun impacts, 4 original paint surfaces
 * after the independently audited B409 original physical ramp route.
 * Never award official score, cross-team paths, HP, or fake 4v4.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditB409OneRealOriginalSourceRound}
 from './t21-b409-original-route-full-native-game-audit.mjs';
import {b408NativeMouseAligned}
 from './t21-b408-native-original-active-aim.mjs';
const fail=s=>{throw Error('B410_GENUINE_SAME_180S_UPPER_ACTIVE_PLAY_HOLD_'+s);};
const need=(p,s)=>{if(!p)fail(s);};
const UP='UndertowT21D:right-low-team-a';
const UPPER_PAINT=UP+':paint';
const PLAN='B408_NATIVE_REAL_ORIGINAL_ACTIVE_GRID_AIM';
const markers=[120,60,30];
const realKey=['KeyW','KeyA','KeyS','KeyD'];
const int=x=>Number.isSafeInteger(x)&&x>=0;
const finite3=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
export function auditB410OneTrueUpperFloorActiveGame(round,route,extra,options={}){
 const genuine=(options.b409||auditB409OneRealOriginalSourceRound)(round,route);
 need(genuine.verdict==='PASS_ONE_REAL_180S_7CPU_WITH_ORIGINAL_RAMP_UPPER_ROUTE_AND_3_HUMAN_PAINT_SURFACES'&&
  genuine.route?.b326ExtendedUpperMeters>=5&&
  genuine.route?.b315RealDistinctHumanPaintSurfaces===3&&
  genuine.actualTimeUpTick===round.samples.at(-1)?.tick,
  'B409_GENUINE_SAME_WORLD_SOURCE_PASS_PREREQUISITE');
 need(extra?.schema==='B410_GENUINE_NATIVE_LATE_UPPER_FLOOR_ACTIVE_PLAYER'&&
  extra.source==='25/17/26/0'&&extra.sameB409BrowserWorld===true&&
  extra.syntheticTickWrites===0&&extra.syntheticPositionWrites===0&&
  extra.syntheticPaintWrites===0&&extra.officialWinner==='NONE'&&
  Array.isArray(extra.waves)&&extra.waves.length===3&&
  round.samples.length===7,
  'SOURCE_ROSTER_AND_THREE_REAL_UPPER_ACTIVITY_WINDOWS');
 let travel=0,shots=0,changed=0,upperImpacts=0;
 for(let i=0;i<3;i++){
  const w=extra.waves[i],mark=markers[i],p=w?.b408Aim;
  const start=round.samples.find(s=>s.label===String(mark));
  const end=round.samples.find(s=>s.label===String(i===0?90:i===1?30:0));
  need(w?.remaining===mark&&start&&end&&
   w.source==='25/17/26/0'&&w.sameOriginalNativeGame===true&&
   w.injectedTime===false&&w.injectedInk===false&&
   w.injectedActorPositions===false&&
   w.before?.originalFootSolid===UP&&w.after?.originalFootSolid===UP&&
   w.before.originalFootSupported===true&&
   w.after.originalFootSupported===true&&
   w.before.pointerLocked===true&&w.after.pointerLocked===true&&
   w.before.sevenCpuRejoined===7&&w.after.sevenCpuRejoined===7&&
   int(w.before.tick)&&w.before.tick>=start.tick&&
   int(w.after.tick)&&w.after.tick>w.before.tick&&
   w.after.tick<end.tick&&
   Number.isFinite(w.before.seconds)&&
   w.before.seconds<=mark+.001&&w.before.seconds>mark-6&&
   w.after.seconds<w.before.seconds&&
   int(w.before.humanShots)&&int(w.after.humanShots)&&
   w.before.humanShots===start.humanShots&&
   w.after.humanShots>w.before.humanShots&&
   w.after.humanShots<=end.humanShots&&
   int(w.before.humanChangedCells)&&int(w.after.humanChangedCells)&&
   w.before.humanChangedCells===start.humanPaintCells&&
   w.after.humanChangedCells>=w.before.humanChangedCells&&
   w.after.humanChangedCells<=end.humanPaintCells&&
   finite3(w.before.body)&&finite3(w.after.body)&&
   Array.isArray(w.legs)&&w.legs.length===4,
   'REAL_NATIVE_UPPER_SOURCE_WINDOW_'+mark);
  let length=0,previous=w.before.tick;
  for(let k=0;k<4;k++){
   const leg=w.legs[k];
   need(leg?.code===realKey[k]&&int(leg.fromTick)&&int(leg.toTick)&&
    leg.fromTick>=previous&&leg.toTick>=leg.fromTick+8&&
    leg.toTick<w.after.tick&&finite3(leg.from)&&finite3(leg.to)&&
    Number.isFinite(leg.planarMeters)&&leg.planarMeters>=0&&
    leg.planarMeters<=3&&
    Math.abs(Math.hypot(leg.to[0]-leg.from[0],
     leg.to[2]-leg.from[2])-leg.planarMeters)<.0001&&
    leg.originalFootSolid===UP&&leg.originalSupport===true&&
    leg.noActorTeleport===true,
    'REAL_NATIVE_KCC_LEG_'+mark+'_'+k);
   previous=leg.toTick;length+=leg.planarMeters;
  }
  need(Number.isFinite(w.totalRealKccPlanarMeters)&&
   Math.abs(w.totalRealKccPlanarMeters-length)<.0001&&length>.08,
   'TRUE_KCC_MOVEMENT_'+mark);
  const a=p?.plan;
  need(a?.schema===PLAN&&a.source==='25/17/26/0'&&
   a.surfaceId===UPPER_PAINT&&
   [-1,0,1].includes(a.ownerBefore)&&
   a.simulatedInput===false&&a.paintWrites===0&&
   a.actorRelocations===0&&a.scoreable===0&&
   a.actualPaintChangedCellsGuaranteed===false&&
   a.opponentHitCertified===false&&
   int(a.nativeTick)&&a.nativeTick>=w.before.tick&&a.nativeTick<w.after.tick&&
   Array.isArray(a.grid)&&a.grid.length===2&&a.grid.every(int)&&
   finite3(a.world)&&
   Array.isArray(a.cdp)&&a.cdp.length===2&&a.cdp.every(Number.isFinite)&&
   w.actualCdpMouse?.[0]===a.cdp[0]&&w.actualCdpMouse?.[1]===a.cdp[1]&&
   p.nativeMouseDispatched===true&&
   b408NativeMouseAligned(a,p.realObservedCamera)&&
   p.realLastPaintSurface===UPPER_PAINT&&
   int(p.impactTick)&&p.impactTick>a.nativeTick&&p.impactTick<=w.after.tick&&
   int(p.additionalShots)&&p.additionalShots>0&&
   p.additionalShots<=w.after.humanShots-w.before.humanShots&&
   int(p.realAddedCells)&&
   p.realAddedCells===w.after.humanChangedCells-w.before.humanChangedCells,
   'ACTUAL_ORIGINAL_UPPER_PAINT_IMPACT_'+mark);
  shots+=p.additionalShots;changed+=p.realAddedCells;
  travel+=length;upperImpacts++;
 }
 need(changed>0&&shots>0&&travel>.24,
  'NO_TRUE_EXTRA_HUMAN_INK_OR_MOVEMENT_ON_FOURTH_SURFACE');
 const final=round.samples.at(-1);
 need(int(final.humanShots)&&int(final.humanPaintCells)&&
  final.humanShots>=round.samples[0].humanShots+shots&&
  final.humanPaintCells>=round.samples[0].humanPaintCells+changed,
  'FINAL_ORIGINAL_NATIVE_OWNERGRID_NOT_MATCHING_REAL_SHOTS');
 return {
  schema:'B410_REAL_ONE_180S_ORIGINAL_ROUTE_PLUS_ACTIVE_UPPER_PLAYER',
  verdict:'PASS_ACTUAL_ORIGINAL_RAMP_UPPER_KCC_AND_THREE_LATE_NATIVE_SHOOT_WAVES',
  source:'25/17/26/0',realUpperNativeWaves:3,
  realUpperOriginalPaintSurface:UPPER_PAINT,
  genuineDistinctOriginalHumanPaintSurfaces:4,
  additionalNativeUpperKccMeters:travel,
  additionalRealUpperNativeShots:shots,
  additionalObservedHumanChangedCells:changed,
  originalRoundTimeUpTick:final.tick,
  genuine7CpuOriginalSourceMatch:true,
  actualOpponentHpHitCertified:false,
  actualOpponentSplatAnd150TickRespawnCertified:false,
  naturalCrossTeamRecastRoutesCertified:false,
  sourceScoreable:0,officialWinner:'NONE',
  formal4v4Certified:false,artAccepted:false,
  productionAuthorized:false
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dir=process.argv[2];need(typeof dir==='string',
  'ORIGINAL_CHROMIUM_EVIDENCE_DIRECTORY');
 const json=(name)=>JSON.parse(readFileSync(join(dir,name),'utf8'));
 const route={
  b316:json('b316-genuine-original-human-ramp-walk.json'),
  b312:json('b312-real-original-lower-second-ink.json'),
  b322:json('b322-actual-original-ramp-crest.json'),
  b324:json('b324-real-original-upper-floor.json'),
  b326:json('b326-extended-original-upper-floor.json')
 };
 const v=auditB410OneTrueUpperFloorActiveGame(
  json('b409-one-original-route-180s.json'),route,
  json('b410-upper-genuine-live-human-waves.json'));
 writeFileSync(join(dir,'b410-independent-true-original-active-verdict.json'),
  JSON.stringify(v,null,2)+'\n');
 console.log('B410_ACTUAL_GENUINE_UPPER_FLOOR_LATE_GAME_INK',JSON.stringify(v));
}
