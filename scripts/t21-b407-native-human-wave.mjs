import {b408ChooseActiveOriginalCell,b408NativeMouseAligned}
 from './t21-b408-native-original-active-aim.mjs';
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
  remaining, expectedFoot, aimCDP, send, read, snapshot, verifyAuthority, wait,
  b408ActiveAim=false
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
  // B408 optional: use REAL ownerGrid and REAL camera after each key wave.
  // Plain B407 retains its already-proven original behavior when opt-in is off.
  let b408Aim=null;
  let mouseX=aimCDP[0]+(remaining===120||remaining===60?-3:3);
  let mouseY=aimCDP[1];
  if(b408ActiveAim){
    await send('Input.dispatchMouseEvent',
      {type:'mouseMoved',x:800,y:450,button:'none'});
    const liveFrame=verifyAuthority(await snapshot());
    const liveGrid=await foot();
    const plan=b408ChooseActiveOriginalCell(liveGrid,liveFrame,expectedFoot);
    mouseX=plan.cdp[0];mouseY=plan.cdp[1];
    b408Aim={plan,nativeMouseDispatched:false};
  }
  guard(mouseX>=10&&mouseX<=1590&&mouseY>=10&&mouseY<=890,
    'INVALID_REAL_CDP_MOUSE');
  await send('Input.dispatchMouseEvent',
    {type:'mouseMoved',x:mouseX,y:mouseY,button:'none'});
  if(b408Aim){
    const aligned=await wait(async()=>{
      const n=verifyAuthority(await snapshot());
      return b408NativeMouseAligned(b408Aim.plan,n.cameraSourcePractice)?
       n.cameraSourcePractice:false;
    },30000);
    b408Aim.realObservedCamera={
     yawDegrees:aligned.yawDegrees,pitchDegrees:aligned.pitchDegrees};
    b408Aim.nativeMouseDispatched=true;
  }
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
  if(b408Aim){
   b408Aim.impactTick=lastFoot?.humanLastImpactTick??null;
   b408Aim.realLastPaintSurface=lastFoot?.humanLastPaintedSurface??null;
   b408Aim.additionalShots=last.shotsFired-preFire.shotsFired;
   b408Aim.realAddedCells=
     last.b23HumanInkFeedback.humanChangedCells-
     first.b23HumanInkFeedback.humanChangedCells;
   guard(Number.isSafeInteger(b408Aim.impactTick)&&
     b408Aim.impactTick>b408Aim.plan.nativeTick&&
     b408Aim.realLastPaintSurface===b408Aim.plan.surfaceId&&
     b408Aim.additionalShots>0,
     'NO_REAL_ORIGINAL_IMPACT_AFTER_NATIVE_AIM_'+remaining);
  }
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
    ...(b408Aim?{b408Aim}:{}),
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
