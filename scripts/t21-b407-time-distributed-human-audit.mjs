#!/usr/bin/env node
/** B407 scope is five dispersed genuine HUMAN movement/fire waves, not 4v4 combat. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { b405AuditReal180SourceSession } from './t21-b405-single-180s-human-7cpu-audit.mjs';
const need = (condition, why) => {
  if (!condition) throw Error('B407_TIME_DISTRIBUTED_REAL_SOURCE_HOLD_' + why);
};
const markers = [150, 120, 90, 60, 30];
const valid3 = x => Array.isArray(x) && x.length === 3 && x.every(Number.isFinite);
const nonnegative = x => Number.isSafeInteger(x) && x >= 0;
export function b407AuditRealHumanWaves(data, rawB405, { auditB405 = b405AuditReal180SourceSession } = {}) {
  const b405 = auditB405(rawB405);
  need(b405.verdict === 'PASS_ONE_REAL_NATIVE_180S_7CPU_HUMAN_INPUT_SHOT_INK' &&
    b405.sameNativeCdpGameFromHumanShotUntilTimeUp === true, 'B405_NOT_PROVEN');
  need(data?.schema === 'B407_SAME_REAL_180S_TIME_DISTRIBUTED_HUMAN_INPUT' &&
    data.source === '25/17/26/0' && data.enabled === true &&
    data.injectedTime === false && data.injectedInk === false &&
    data.injectedActorPositions === false && data.officialWinner === 'NONE' &&
    data.sameB405NativeGame === true && Array.isArray(data.waves) &&
    data.waves.length === 5, 'SOURCE_SCOPE');
  const firstOriginal = rawB405.samples[0].originalHumanFoot.id;
  let movements = 0, newShots = 0, changedCells = 0, prevTick = rawB405.samples[0].tick;
  for (let i = 0; i < markers.length; i++) {
    const wave = data.waves[i], a = wave?.before, z = wave?.after;
    const marker = markers[i], frame = rawB405.samples[i + 1];
    const future = rawB405.samples[i + 2];
    need(wave?.remaining === marker && wave.source === '25/17/26/0' &&
      wave.sameOriginalNativeGame === true &&
      wave.injectedTime === false && wave.injectedInk === false &&
      wave.injectedActorPositions === false &&
      a?.pointerLocked === true && z?.pointerLocked === true &&
      a?.originalFootSupported === true && z?.originalFootSupported === true &&
      a.originalFootSolid === firstOriginal && z.originalFootSolid === firstOriginal &&
      a.sevenCpuRejoined === 7 && z.sevenCpuRejoined === 7 &&
      valid3(a.body) && valid3(z.body) &&
      Number.isSafeInteger(a.tick) && Number.isSafeInteger(z.tick) &&
      a.tick >= frame.tick && a.tick >= prevTick && z.tick > a.tick &&
      z.tick < future.tick &&
      a.seconds <= marker + .001 && a.seconds > marker - 5 &&
      z.seconds <= a.seconds && z.seconds > marker - 10 &&
      nonnegative(a.humanShots) && nonnegative(z.humanShots) &&
      z.humanShots > a.humanShots &&
      nonnegative(a.humanChangedCells) && nonnegative(z.humanChangedCells) &&
      z.humanChangedCells >= a.humanChangedCells &&
      a.humanShots >= frame.humanShots &&
      a.humanChangedCells >= frame.humanChangedCells &&
      Array.isArray(wave.actualCdpMouse) && wave.actualCdpMouse.length === 2 &&
      wave.actualCdpMouse.every(Number.isFinite) &&
      Array.isArray(wave.legs) && wave.legs.length === 4,
      'ORIGINAL_SAME_GAME_WAVE_' + marker);
    let lastTick = a.tick, travel = 0;
    for (const [j,leg] of wave.legs.entries()) {
      need(leg.code === ['KeyW','KeyA','KeyS','KeyD'][j] &&
        Number.isSafeInteger(leg.fromTick) && Number.isSafeInteger(leg.toTick) &&
        leg.fromTick >= lastTick && leg.toTick >= leg.fromTick + 8 &&
        leg.toTick <= z.tick && valid3(leg.from) && valid3(leg.to) &&
        leg.originalFootSolid === firstOriginal &&
        leg.originalSupport === true && leg.noActorTeleport === true &&
        Number.isFinite(leg.planarMeters) && leg.planarMeters >= 0 &&
        leg.planarMeters <= 3 &&
        Math.abs(Math.hypot(leg.to[0]-leg.from[0],leg.to[2]-leg.from[2]) -
          leg.planarMeters) <= 1e-7, 'GENUINE_CDPPHYSICAL_KEY_' + marker + '_' + j);
      travel += leg.planarMeters;
      lastTick = leg.toTick;
    }
    need(travel > .08 && Math.abs(wave.totalRealKccPlanarMeters-travel) < 1e-7,
      'NO_REAL_KCC_TRAVEL_' + marker);
    movements += travel; newShots += z.humanShots-a.humanShots;
    changedCells += z.humanChangedCells-a.humanChangedCells;
    prevTick = z.tick;
  }
  const last = rawB405.samples.at(-1);
  need(last.matchState === 'TIME_UP' && last.paused === true &&
    last.actualPointerLocked === false && last.remainingSeconds === 0 &&
    last.humanShots >= data.waves.at(-1).after.humanShots &&
    last.humanChangedCells >= data.waves.at(-1).after.humanChangedCells &&
    last.tick >= 10800 &&
    last.sourceScoreablePromotions === 0 &&
    last.cpuPhysicalRelocations === 0, 'GENUINE_SOURCE_TIME_UP');
  return {
    schema: 'B407_INDEPENDENT_TIME_DISTRIBUTED_NATIVE_HUMAN_VERDICT',
    verdict: 'PASS_FIVE_REAL_HUMAN_KCC_AND_FIRE_WAVES_IN_ONE_180S_SOURCE_GAME',
    observedMarkers: markers, recordedWaves: data.waves.length,
    realHumanKeys: 20, totalRealKccPlanarMeters: movements,
    additionalRealNativeHumanShots: newShots,
    additionalRealOriginalChangedCells: changedCells,
    actualNativeTimeUpTick: last.tick,
    observedNativeHumanCpuDirectHits: last.humanCpuDirectHits,
    observedNativeHumanCpuSplats: last.humanCpuDirectSplats,
    actualHumanEnemyHpHitActorChainCertified: false,
    actualHumanEnemyKillAnd150TickRespawnCertified: false,
    sourceOpposingRouteCertified: false,
    originalScoreableSurfaces: 0,
    officialWinner: 'NONE', formal4v4Certified: false,
    productionAuthorized: false, artAccepted: false
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  need(typeof dir === 'string' && dir.length > 0, 'MISSING_GENUINE_EVIDENCE');
  const data = JSON.parse(readFileSync(join(dir, 'b407-real-time-distributed-human.json')));
  const rawB405 = JSON.parse(readFileSync(join(dir, 'b405-same-original-180s-round.json')));
  const result = b407AuditRealHumanWaves(data, rawB405);
  writeFileSync(join(dir, 'b407-independent-verdict.json'),
    JSON.stringify(result, null, 2) + '\n');
  console.log('B407_INDEPENDENT_NATIVE_180S_REAL_HUMAN_WAVES',JSON.stringify(result));
}
