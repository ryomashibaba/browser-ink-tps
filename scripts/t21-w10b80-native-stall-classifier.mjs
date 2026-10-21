/**
 * B80: classify native clock stalls from real read-only Chromium snapshots.
 * No fake timesteps, no silent resuming, no URL/CPU/physics mutation.
 * These classifications are diagnostic labels, NOT source authenticity.
 */
export function b80ClassifyNativeStall(previous,current,wallIdleMs){
 const valid=x=>Number.isSafeInteger(x)&&x>=0;
 if(!current||!valid(current.tick)||!valid(current.renderFrames)||
    !valid(previous.tick)||!valid(previous.renderFrames)||
    !Number.isFinite(wallIdleMs)||wallIdleMs<0)
  return 'HOLD_INVALID_NATIVE_WITNESS';
 if(current.stop)return 'SOURCE_FAIL_CLOSED_STOP';
 if(current.matchState==='TIME_UP')return 'NATIVE_TIME_UP';
 if(current.paused)return 'APPLICATION_PAUSED';
 if(current.visibilityState!=='visible')return 'BROWSER_VISIBILITY_THROTTLED';
 if(current.tick<previous.tick||
    current.renderFrames<previous.renderFrames)
  return 'UNEXPECTED_CLOCK_OR_FRAME_REGRESSION';
 if(current.tick>previous.tick)return 'PHYSICS_RUNNING';
 if(wallIdleMs<90000)return 'INVESTIGATING_NO_NATIVE_TICK';
 if(current.renderFrames===previous.renderFrames)
  return 'PLAYCANVAS_RENDER_CALLBACKS_NOT_ADVANCING';
 return 'FIXED_STEP_CLOCK_NOT_ADVANCING_WHILE_RENDERING';
}
