/** B407: ordinary CDP input against the SAME source 180s game, not simulation injection.
 * The caller is the B405 genuine Chromium driver; no player/CPU/physics/ink setters. */
const positionsEqual = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const guard = (condition, reason) => {
  if (!condition) throw Error('B407_REAL_NATIVE_INPUT_HOLD_' + reason);
};
const KEYS = [
  { code: 'KeyW', key: 'w', windowsVirtualKeyCode: 87, nativeVirtualKeyCode: 87 },
  { code: 'KeyA', key: 'a', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 },
  { code: 'KeyS', key: 's', windowsVirtualKeyCode: 83, nativeVirtualKeyCode: 83 },
  { code: 'KeyD', key: 'd', windowsVirtualKeyCode: 68, nativeVirtualKeyCode: 68 }
];
export async function b407RunNativeHumanWave({
  remaining, expectedFoot, aimCDP, send, read, snapshot, verifyAuthority, wait
}) {
  guard([150,120,90,60,30].includes(remaining), 'UNEXPECTED_TIME_MARKER');
  guard(typeof expectedFoot === 'string' && expectedFoot.startsWith('UndertowT21D:'),
    'NO_ORIGINAL_GROUND');
  guard(Array.isArray(aimCDP) && aimCDP.length === 2 &&
    aimCDP.every(Number.isFinite), 'NO_GENUINE_PRIOR_MOUSE_AIM');
  const foot = () => read('window.__t21F3.auditB312NativeHumanOwnerLedger()');
  const locked = () => read(
    'document.pointerLockElement===document.querySelector("#app-canvas")');
  const first = verifyAuthority(await snapshot());
  const originalFirst = await foot();
  guard(first.matchState === 'PLAYING' && !first.paused &&
    first.timeRemainingSeconds <= remaining + .001 &&
    first.timeRemainingSeconds > remaining - 5 &&
    first.cpu.physicalRejoins.length === 7 && await locked(),
    'MATCH_NOT_ACTIVELY_PLAYING_' + remaining);
  guard(positionsEqual(first.player.position) &&
    originalFirst?.source === '25/17/26/0' &&
    originalFirst.realHumanOriginalFootSupported === true &&
    originalFirst.genuineHumanOriginalFootSolid === expectedFoot &&
    originalFirst.genuineOriginalFootGapMeters <= .4, 'FIRST_REAL_ORIGINAL_FOOT');
  const legs = [];
  let motion = 0;
  for (const key of KEYS) {
    const before = verifyAuthority(await snapshot());
    guard(before.matchState === 'PLAYING' && !before.paused &&
      positionsEqual(before.player.position) && await locked(),
      'KEY_PRECONDITION_' + key.code);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
    try {
      await wait(async () => {
        const s = verifyAuthority(await snapshot());
        return s.tick >= before.tick + 8 ? s : false;
      }, 30000);
    } finally {
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
    }
    const after = verifyAuthority(await snapshot());
    const ground = await foot();
    const planar = Math.hypot(
      after.player.position[0] - before.player.position[0],
      after.player.position[2] - before.player.position[2]);
    const realSupport = ground?.source === '25/17/26/0' &&
      ground?.realHumanOriginalFootSupported === true &&
      ground?.genuineHumanOriginalFootSolid === expectedFoot &&
      Number.isFinite(ground?.genuineOriginalFootGapMeters) &&
      ground.genuineOriginalFootGapMeters >= 0 &&
      ground.genuineOriginalFootGapMeters <= .4;
    const native = after.tick > before.tick &&
      after.matchState === 'PLAYING' && !after.paused &&
      after.cpu.physicalFootRelocations === 0 && await locked();
    legs.push({ code: key.code, fromTick: before.tick, toTick: after.tick,
      from: before.player.position, to: after.player.position,
      planarMeters: planar, originalFootSolid: ground?.genuineHumanOriginalFootSolid,
      originalSupport: realSupport, noActorTeleport: native });
    guard(native && realSupport && Number.isFinite(planar) && planar <= 3,
      'TRUE_KCC_SUPPORT_OR_CONTINUITY_' + remaining + '_' + key.code);
    motion += planar;
  }
  guard(motion > .08, 'NO_MEANINGFUL_NATIVE_KCC_MOVEMENT_' + remaining);
  const preFire = verifyAuthority(await snapshot());
  guard(preFire.matchState === 'PLAYING' && !preFire.paused &&
    preFire.cpu.physicalRejoins.length === 7 && await locked(),
    'NO_LIVE_NATIVE_FIRE_WINDOW');
  // Tiny REAL mouse motion, not a synthetic aim ray/impact. Preserve the
  // B337 genuinely acquired active original-floor target and real pointer lock.
  const mouseX = aimCDP[0] + (remaining === 120 || remaining === 60 ? -3 : 3);
  const mouseY = aimCDP[1];
  guard(mouseX >= 10 && mouseX <= 1590 && mouseY >= 10 && mouseY <= 890,
    'INVALID_REAL_CDP_MOUSE');
  await send('Input.dispatchMouseEvent',
    { type: 'mouseMoved', x: mouseX, y: mouseY, button: 'none' });
  await send('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: mouseX, y: mouseY, button: 'left', clickCount: 1 });
  try {
    await wait(async () => {
      const s = verifyAuthority(await snapshot());
      return s.tick >= preFire.tick + 30 && s.shotsFired > preFire.shotsFired
        ? s : false;
    }, 30000);
  } finally {
    await send('Input.dispatchMouseEvent',
      { type: 'mouseReleased', x: mouseX, y: mouseY, button: 'left', clickCount: 1 });
  }
  const last = verifyAuthority(await snapshot());
  const lastFoot = await foot();
  guard(last.matchState === 'PLAYING' && !last.paused &&
    last.tick > preFire.tick && last.shotsFired > preFire.shotsFired &&
    last.b23HumanInkFeedback.humanChangedCells >=
      first.b23HumanInkFeedback.humanChangedCells &&
    lastFoot?.realHumanOriginalFootSupported === true &&
    lastFoot.genuineHumanOriginalFootSolid === expectedFoot &&
    lastFoot.genuineOriginalFootGapMeters <= .4 &&
    last.cpu.physicalFootRelocations === 0 && await locked(),
    'POST_NATIVE_WAVE_AUTHORITY');
  return {
    remaining, source: '25/17/26/0', sameOriginalNativeGame: true,
    injectedTime: false, injectedInk: false, injectedActorPositions: false,
    before: {
      tick: first.tick, seconds: first.timeRemainingSeconds,
      body: first.player.position, humanShots: first.shotsFired,
      humanChangedCells: first.b23HumanInkFeedback.humanChangedCells,
      sevenCpuRejoined: first.cpu.physicalRejoins.length,
      originalFootSolid: originalFirst.genuineHumanOriginalFootSolid,
      originalFootSupported: true, pointerLocked: true
    },
    legs, actualCdpMouse: [mouseX, mouseY], totalRealKccPlanarMeters: motion,
    after: {
      tick: last.tick, seconds: last.timeRemainingSeconds,
      body: last.player.position, humanShots: last.shotsFired,
      humanChangedCells: last.b23HumanInkFeedback.humanChangedCells,
      sevenCpuRejoined: last.cpu.physicalRejoins.length,
      originalFootSolid: lastFoot.genuineHumanOriginalFootSolid,
      originalFootSupported: true, pointerLocked: true,
      humanCpuDirectHits: last.humanCpuDirectHits,
      humanCpuDirectSplats: last.humanCpuDirectSplats
    }
  };
}
