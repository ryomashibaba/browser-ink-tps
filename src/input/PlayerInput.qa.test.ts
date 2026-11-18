import {afterEach,expect,test,vi} from 'vitest';
import {PlayerInput} from './PlayerInput';
import {applyB379NativePlayerWeaponMobility}
 from '../app/B379NativePlayerWeaponMobility';

/** Native player behaviour remains unchanged; QA mode requires explicit ctor gate. */
function createInput(qa=false){
  const handlers=new Map<string,((event:any)=>void)[]>();
  const target={addEventListener:(name:string,callback:(event:any)=>void)=>{
    handlers.set(name,[...(handlers.get(name)??[]),callback]);
  }};
  vi.stubGlobal('window',target);
  vi.stubGlobal('document',{...target,pointerLockElement:null,hidden:false});
  const canvasHandlers=new Map<string,((event:any)=>void)[]>();
  const canvas={addEventListener:(name:string,callback:(event:any)=>void)=>{
    canvasHandlers.set(name,[...(canvasHandlers.get(name)??[]),callback]);
  }} as unknown as HTMLCanvasElement;
  return {input:new PlayerInput(canvas,qa),canvas,handlers,canvasHandlers};
}
afterEach(()=>vi.unstubAllGlobals());

test('normal player cannot inject QA axes',()=>{
  const {input}=createInput(false);
  expect(()=>input.setQaAxis(0,1)).toThrow('T21_QA_AXIS_NOT_AUTHORIZED');
  expect(input.moveX).toBe(0);
  expect(input.moveY).toBe(0);
});
test('QA axes are finite, bounded and reversible',()=>{
  const {input}=createInput(true);
  expect(()=>input.setQaAxis(Number.NaN,0)).toThrow();
  expect(()=>input.setQaAxis(0,Infinity)).toThrow();
  expect(()=>input.setQaAxis(1.01,0)).toThrow();
  expect(()=>input.setQaAxis(0,-1.1)).toThrow();
  input.setQaAxis(-0.4,1);
  expect(input.moveX).toBe(-0.4);
  expect(input.moveY).toBe(1);
  input.clearQaAxis();
  expect(input.moveX).toBe(0);
  expect(input.moveY).toBe(0);
});
test('QA axis does not persist after explicit cleanup',()=>{
  const {input}=createInput(true);
  input.setQaAxis(1,-1);
  input.clearQaAxis();
  input.clearQaAxis();
  expect([input.moveX,input.moveY]).toEqual([0,0]);
});
test('QA axis has no shooting, squid, or jump effects',()=>{
  const {input}=createInput(true);
  input.setQaAxis(0,1);
  expect(input.fireHeld).toBe(false);
  expect(input.secondaryHeld).toBe(false);
  expect(input.squidHeld).toBe(false);
  expect(input.consumeJump()).toBe(false);
});
test('native Pointer Lock input remains the baseline when QA is inactive',()=>{
  const {input,canvas,handlers}=createInput(false);
  (globalThis as unknown as {document:{pointerLockElement:any}}).document.pointerLockElement=canvas;
  const cb=handlers.get('keydown')![0]!;
  cb({code:'KeyW',repeat:false,preventDefault:()=>{}});
  expect(input.moveY).toBe(1);
  cb({code:'KeyD',repeat:false,preventDefault:()=>{}});
  expect(input.moveX).toBe(1);
});

/** Event delivery is simulated here; genuine browser input is checked separately. */
function lockedInput(){
  const state=createInput();
  Object.defineProperty(document,'pointerLockElement',{value:state.canvas,writable:true});
  const emit=(target:'window'|'canvas',name:string,event:any={})=>{
    const callbacks=(target==='canvas'?state.canvasHandlers:state.handlers).get(name)??[];
    for(const callback of callbacks)callback({preventDefault:()=>{},...event});
  };
  return {...state,emit};
}

test('cancelled pointer clears both held buttons and unconsumed taps without stopping keyboard movement',()=>{
  const {input,emit}=lockedInput();
  emit('window','keydown',{code:'KeyW'});
  emit('window','keydown',{code:'ShiftLeft'});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  expect([input.fireHeld,input.secondaryHeld]).toEqual([true,true]);
  emit('canvas','pointercancel');
  expect([input.fireHeld,input.secondaryHeld]).toEqual([false,false]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([false,false]);
  expect([input.moveY,input.squidHeld]).toEqual([1,true]);
});

test('completed short left and right taps survive until consumed exactly once',()=>{
  const {input,emit}=lockedInput();
  for(const button of [0,2]){
    emit('canvas','pointerdown',{button});
    emit('canvas','pointerup',{button});
  }
  expect([input.fireHeld,input.secondaryHeld]).toEqual([false,false]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([true,true]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([false,false]);
});

test('fresh pointer presses work immediately after cancellation and repeated cancellation is harmless',()=>{
  const {input,emit}=lockedInput();
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  emit('canvas','pointercancel');
  emit('canvas','pointercancel');
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  expect(input.primaryPressSequence).toBe(2);
  expect([input.fireHeld,input.secondaryHeld]).toEqual([true,true]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([true,true]);
});

test.each(['blur','visibilitychange','pointerlockchange'])('%s still clears all physical gameplay state',(eventName)=>{
  const {input,emit}=lockedInput();
  for(const code of ['KeyW','ShiftLeft','Space','KeyF','KeyG'])
    emit('window','keydown',{code,repeat:false});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  if(eventName==='visibilitychange')Object.defineProperty(document,'hidden',{value:true});
  if(eventName==='pointerlockchange')Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
  emit('window',eventName);
  expect([input.moveX,input.moveY]).toEqual([0,0]);
  expect([input.squidHeld,input.jumpHeld,input.fireHeld,input.secondaryHeld]).toEqual([false,false,false,false]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed(),
    input.consumeJump(),input.consumeSubPressed(),input.consumeSpecialPressed()]).toEqual([false,false,false,false,false]);
});

test('B374 actual splat clears held shots, kit taps and blocks rearming until genuine respawn',()=>{
  const {input,emit}=lockedInput();
  emit('window','keydown',{code:'KeyW',repeat:false});
  emit('window','keydown',{code:'ShiftLeft',repeat:false});
  emit('window','keydown',{code:'KeyF',repeat:false});
  emit('window','keydown',{code:'KeyG',repeat:false});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  expect([input.fireHeld,input.secondaryHeld]).toEqual([true,true]);
  const sequence=input.primaryPressSequence;
  input.setCombatInputActive(false);
  input.setCombatInputActive(false);
  expect([input.fireHeld,input.secondaryHeld,input.consumePrimaryPressed(),
    input.consumeSecondaryPressed(),input.consumeSubPressed(),
    input.consumeSpecialPressed()]).toEqual([false,false,false,false,false,false]);
  expect([input.moveY,input.squidHeld]).toEqual([1,true]);
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  emit('window','keydown',{code:'KeyF',repeat:false});
  emit('window','keydown',{code:'KeyG',repeat:false});
  expect(input.primaryPressSequence).toBe(sequence);
  input.setCombatInputActive(true);
  expect([input.fireHeld,input.secondaryHeld,input.consumePrimaryPressed(),
    input.consumeSecondaryPressed(),input.consumeSubPressed(),
    input.consumeSpecialPressed()]).toEqual([false,false,false,false,false,false]);
  emit('canvas','pointerup',{button:0});
  emit('canvas','pointerup',{button:2});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  emit('window','keydown',{code:'KeyF',repeat:false});
  emit('window','keydown',{code:'KeyG',repeat:false});
  expect(input.primaryPressSequence).toBe(sequence+1);
  expect([input.fireHeld,input.secondaryHeld,input.consumePrimaryPressed(),
    input.consumeSecondaryPressed(),input.consumeSubPressed(),
    input.consumeSpecialPressed()]).toEqual([true,true,true,true,true,true]);
});

test('B374 native splat discards delayed jump and prevents held Space surge after the true respawn',()=>{
  const {input,emit}=lockedInput();
  emit('window','keydown',{code:'KeyW',repeat:false});
  emit('window','keydown',{code:'Space',repeat:false});
  expect(input.consumeJump()).toBe(true);
  emit('window','keydown',{code:'Space',repeat:false});
  input.setCombatInputActive(false); // actual native death before jump consumption
  expect(input.consumeJump()).toBe(false);
  expect(input.jumpHeld).toBe(false);
  expect(input.moveY).toBe(1); // native WASD remains available
  emit('window','keydown',{code:'Space',repeat:true}); // dead held key repeat
  emit('window','keydown',{code:'Space',repeat:false}); // dead fresh action
  expect([input.jumpHeld,input.consumeJump()]).toEqual([false,false]);
  input.setCombatInputActive(true); // genuine native 150-tick respawn
  emit('window','keydown',{code:'Space',repeat:true}); // held before death
  emit('window','keydown',{code:'Space',repeat:false}); // still no keyup
  expect([input.jumpHeld,input.consumeJump()]).toEqual([false,false]);
  emit('window','keyup',{code:'Space'}); // actually released
  emit('window','keydown',{code:'Space',repeat:false});
  expect([input.jumpHeld,input.consumeJump(),input.consumeJump()]).toEqual([true,true,false]);
  emit('window','keyup',{code:'Space'});
  expect(input.jumpHeld).toBe(false);
});

test('unlocked and alt-modified left clicks never queue primary fire',()=>{
  const {input,emit}=lockedInput();
  emit('canvas','pointerdown',{button:0,altKey:true});
  Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  expect([input.fireHeld,input.secondaryHeld]).toEqual([false,false]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([false,false]);
});


test('normal SOURCE STAGING blocks early real WASD/squid/jump/fire without a fake floor',()=>{
 const {input,emit}=lockedInput();
 emit('window','keydown',{code:'KeyW',repeat:false});
 expect(input.moveY).toBe(1);
 input.setSourcePrestartMovementBlocked(true);
 for(const code of ['KeyW','KeyD','Space','ShiftLeft','KeyF','KeyG'])
  emit('window','keydown',{code,repeat:false});
 emit('canvas','pointerdown',{button:0});
 emit('canvas','pointerdown',{button:2});
 expect([input.moveX,input.moveY,input.squidHeld,input.jumpHeld,
  input.fireHeld,input.secondaryHeld,input.consumeJump(),
  input.consumePrimaryPressed(),input.consumeSecondaryPressed(),
  input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([0,0,false,false,false,false,false,false,false,false,false]);
 input.setSourcePrestartMovementBlocked(false);
 // A physical key held through 7/7 cannot suddenly move the human.
 emit('window','keydown',{code:'KeyW',repeat:true});
 expect(input.moveY).toBe(0);
 emit('window','keyup',{code:'KeyW'});
 emit('window','keydown',{code:'KeyW',repeat:false});
 expect(input.moveY).toBe(1);
 emit('window','keyup',{code:'KeyW'});
 expect(input.moveY).toBe(0);
 // Fresh live controls after real CPU7/7 are unaffected.
 emit('window','keyup',{code:'Space'});
 emit('window','keydown',{code:'Space',repeat:false});
 expect(input.consumeJump()).toBe(true);
 emit('canvas','pointerdown',{button:0});
 expect(input.consumePrimaryPressed()).toBe(true);
});

test('native SOURCE focus recovery rejects stale OS key repeats until a fresh press',()=>{
 const {input,canvas,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keydown',{code:'Space',repeat:false});
 Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
 emit('window','pointerlockchange');
 input.setSourcePrestartMovementBlocked(false);
 Object.defineProperty(document,'pointerLockElement',{value:canvas,writable:true});
 emit('window','pointerlockchange');
 for(const code of ['KeyW','Space','KeyF','KeyG','ShiftLeft'])
  emit('window','keydown',{code,repeat:true});
 expect([input.moveY,input.jumpHeld,input.squidHeld,input.consumeJump(),
  input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([0,false,false,false,false,false]);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keydown',{code:'KeyW',repeat:true});
 expect(input.moveY).toBe(1);
 emit('window','keyup',{code:'KeyW'});
 expect(input.moveY).toBe(0);
 emit('window','keydown',{code:'Space',repeat:false});
 expect(input.consumeJump()).toBe(true);
 emit('window','keydown',{code:'KeyD',repeat:false});
 Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
 emit('window','pointerlockchange');
 Object.defineProperty(document,'pointerLockElement',{value:canvas,writable:true});
 emit('window','pointerlockchange');
 emit('window','keydown',{code:'KeyD',repeat:true});
 expect(input.moveX).toBe(0);
 emit('window','keydown',{code:'KeyD',repeat:false});
 expect(input.moveX).toBe(1);
});

test('SOURCE quick Shift press and release between fixed ticks enters squid for exactly one tick',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'ShiftLeft',repeat:false});
 emit('window','keyup',{code:'ShiftLeft'});
 expect(input.squidHeld).toBe(false);
 expect(input.consumeSquidHeldForPlayerTick()).toBe(true);
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
 // A normal held key must remain active for every real fixed step.
 emit('window','keydown',{code:'ShiftRight',repeat:false});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(true);
 expect(input.consumeSquidHeldForPlayerTick()).toBe(true);
 emit('window','keyup',{code:'ShiftRight'});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
});

test('SOURCE STAGING, lock loss and real death cannot leak a queued squid tap',()=>{
 const {input,canvas,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 emit('window','keydown',{code:'ShiftLeft',repeat:false});
 emit('window','keyup',{code:'ShiftLeft'});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'ShiftLeft',repeat:false});
 emit('window','keyup',{code:'ShiftLeft'});
 Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
 emit('window','pointerlockchange');
 Object.defineProperty(document,'pointerLockElement',{value:canvas,writable:true});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
 emit('window','keydown',{code:'ShiftRight',repeat:true});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
 emit('window','keydown',{code:'ShiftRight',repeat:false});
 emit('window','keyup',{code:'ShiftRight'});
 input.setCombatInputActive(false);
 input.setCombatInputActive(true);
 expect(input.consumeSquidHeldForPlayerTick()).toBe(false);
 // Pressing again after physical release is immediately responsive.
 emit('window','keydown',{code:'ShiftRight',repeat:false});
 expect(input.consumeSquidHeldForPlayerTick()).toBe(true);
});

test('SOURCE repeated nonrepeat Space keydown cannot create a second jump without keyup',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'Space',repeat:false});
 expect(input.consumeJump()).toBe(true);
 emit('window','keydown',{code:'Space',repeat:false});
 expect(input.consumeJump()).toBe(false);
 emit('window','keyup',{code:'Space'});
 emit('window','keydown',{code:'Space',repeat:false});
 expect(input.consumeJump()).toBe(true);
});

test('QA-only deterministic source input keeps its existing authoritative axis',()=>{
 const {input}=createInput(true);
 input.setSourcePrestartMovementBlocked(true);
 input.setQaAxis(-.4,1);
 expect([input.moveX,input.moveY]).toEqual([-.4,1]);
 input.clearQaAxis();
});

test('SOURCE rejects stale WASD, squid, jump and buttons before pointerlockchange arrives',()=>{
 const {input,canvas,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keydown',{code:'ShiftLeft',repeat:false});
 emit('window','keydown',{code:'Space',repeat:false});
 emit('window','keydown',{code:'KeyF',repeat:false});
 emit('window','keydown',{code:'KeyG',repeat:false});
 emit('canvas','pointerdown',{button:0});
 emit('canvas','pointerdown',{button:2});
 expect(input.sourceLiveInputAvailable).toBe(true);
 expect([input.moveY,input.squidHeld,input.jumpHeld,input.fireHeld])
  .toEqual([1,true,true,true]);
 // Pointer Lock may be revoked before the browser dispatches its event.
 Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
 expect(input.sourceLiveInputAvailable).toBe(false);
 expect([input.moveX,input.moveY,input.squidHeld,input.jumpHeld,
  input.fireHeld,input.secondaryHeld,input.consumeJump(),
  input.consumeSquidHeldForPlayerTick(),input.consumePrimaryPressed(),
  input.consumeSecondaryPressed(),input.consumeSubPressed(),
  input.consumeSpecialPressed()])
  .toEqual([0,0,false,false,false,false,false,false,false,false,false,false]);
 emit('window','pointerlockchange');
 Object.defineProperty(document,'pointerLockElement',{value:canvas,writable:true});
 expect([input.moveY,input.squidHeld,input.jumpHeld]).toEqual([0,false,false]);
 emit('window','keydown',{code:'KeyW',repeat:false});
 expect(input.moveY).toBe(1);
});

test('SOURCE ignores shortcut-modified motion but keeps ordinary fresh controls',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyW',repeat:false,ctrlKey:true});
 emit('window','keydown',{code:'ShiftLeft',repeat:false,altKey:true});
 emit('window','keydown',{code:'Space',repeat:false,metaKey:true});
 expect([input.moveY,input.squidHeld,input.consumeJump()]).toEqual([0,false,false]);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keydown',{code:'ShiftLeft',repeat:false});
 emit('window','keydown',{code:'Space',repeat:false});
 expect([input.moveY,input.squidHeld,input.consumeJump()]).toEqual([1,true,true]);
});

test('SOURCE very short real WASD taps register exactly one native KCC step',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keyup',{code:'KeyW'});
 expect(input.moveY).toBe(0); // legacy per-frame held state loses the tap
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(1);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
 emit('window','keydown',{code:'KeyA',repeat:false});
 emit('window','keyup',{code:'KeyA'});
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(-1);
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
});

test('SOURCE rapid 60Hz WASD reversal follows the latest physically pressed direction',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 // W was actually released before S went down in this SAME native tick.
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keyup',{code:'KeyW'});
 emit('window','keydown',{code:'KeyS',repeat:false});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(-1);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(-1);
 emit('window','keyup',{code:'KeyS'});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
 // A fast three-reversal tap sequence cannot neutralize the final D.
 for(const code of ['KeyD','KeyA','KeyD']){
  emit('window','keydown',{code,repeat:false});
  emit('window','keyup',{code});
 }
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(1);
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
 // Reverse without any held key: the last genuine S tap wins.
 for(const code of ['KeyS','KeyW','KeyS']){
  emit('window','keydown',{code,repeat:false});
  emit('window','keyup',{code});
 }
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(-1);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
});

test('SOURCE held movement persists but same-tick opposite taps cancel',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyW',repeat:false});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(1);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(1);
 emit('window','keydown',{code:'KeyS',repeat:false});
 emit('window','keyup',{code:'KeyS'});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(1);
 emit('window','keyup',{code:'KeyW'});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
});

test('SOURCE does not replay tap axes after lock loss, STAGING or life transition',()=>{
 const {input,canvas,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 emit('window','keydown',{code:'KeyW',repeat:false});
 emit('window','keyup',{code:'KeyW'});
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyD',repeat:false});
 emit('window','keyup',{code:'KeyD'});
 input.setCombatInputActive(false);
 input.setCombatInputActive(true);
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
 emit('window','keydown',{code:'KeyD',repeat:false});
 emit('window','keyup',{code:'KeyD'});
 Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
 emit('window','pointerlockchange');
 Object.defineProperty(document,'pointerLockElement',{value:canvas,writable:true});
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
 emit('window','keydown',{code:'KeyD',repeat:false});
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(1);
});

test('SOURCE movement taps reject OS repeat and shortcut-modified keys; QA unaffected',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 emit('window','keydown',{code:'KeyW',repeat:true});
 emit('window','keydown',{code:'KeyA',repeat:false,ctrlKey:true});
 expect(input.consumeMoveAxesForPlayerTick().x).toBe(0);
 expect(input.consumeMoveAxesForPlayerTick().y).toBe(0);
 const deterministic=createInput(true);
 deterministic.input.setQaAxis(-.4,.8);
 expect(deterministic.input.consumeMoveAxesForPlayerTick())
  .toMatchObject({x:-.4,y:.8});
 deterministic.input.clearQaAxis();
});

test('SOURCE 60Hz fast BRELLA right-click gives exactly one true shield tick with real movement penalty',()=>{
 const {input,emit}=lockedInput();
 emit('canvas','pointerdown',{button:2});
 emit('canvas','pointerup',{button:2});
 expect(input.secondaryHeld).toBe(false);
 const player={setWeaponMoveMultiplier:vi.fn(),requestWeaponDodge:vi.fn(()=>true)};
 const weapons={
  currentPlayerWeapon:{weaponClass:'BRELLA'},
  getMovementMultiplier:vi.fn((_fire:boolean,secondary:boolean)=>secondary?.74:1)
 };
 const step=()=>applyB379NativePlayerWeaponMobility({
  input,player,weapons,humanAlive:true,realPointerLocked:true,
  sourceRoundPhase:'PLAYING',stopped:false,canonicalSourceRound:true
 });
 const a=step();
 expect(a).toEqual({movementMultiplier:.74,
  realDodgeAccepted:false,realBrellaGuardTap:true});
 expect(weapons.getMovementMultiplier).toHaveBeenCalledWith(false,true);
 expect(player.setWeaponMoveMultiplier).toHaveBeenCalledWith(.74);
 expect(player.requestWeaponDodge).not.toHaveBeenCalled();
 const b=step();
 expect(b).toEqual({movementMultiplier:1,
  realDodgeAccepted:false,realBrellaGuardTap:false});
 expect(weapons.getMovementMultiplier).toHaveBeenLastCalledWith(false,false);
});

test('SOURCE held BRELLA stays held, and quick right-click never arms a noncanonical guard',()=>{
 const {input,emit}=lockedInput();
 const player={setWeaponMoveMultiplier:vi.fn(),requestWeaponDodge:vi.fn(()=>true)};
 const weapons={currentPlayerWeapon:{weaponClass:'BRELLA'},
  getMovementMultiplier:vi.fn((_fire:boolean,secondary:boolean)=>secondary?.74:1)};
 const step=(canonical:boolean)=>applyB379NativePlayerWeaponMobility({
  input,player,weapons,humanAlive:true,realPointerLocked:true,
  sourceRoundPhase:'PLAYING',stopped:false,canonicalSourceRound:canonical
 });
 emit('canvas','pointerdown',{button:2});
 expect(step(true).realBrellaGuardTap).toBe(false);
 expect(weapons.getMovementMultiplier).toHaveBeenLastCalledWith(false,true);
 emit('canvas','pointerup',{button:2});
 expect(step(true).realBrellaGuardTap).toBe(false);
 emit('canvas','pointerdown',{button:2});
 emit('canvas','pointerup',{button:2});
 expect(step(false).realBrellaGuardTap).toBe(false);
 expect(weapons.getMovementMultiplier).toHaveBeenLastCalledWith(false,false);
});

test('SOURCE short right-click keeps real DUALIES dodge but cannot become BRELLA shield or stale paused action',()=>{
 const {input,emit}=lockedInput();
 const player={setWeaponMoveMultiplier:vi.fn(),requestWeaponDodge:vi.fn(()=>true)};
 const weapons={currentPlayerWeapon:{weaponClass:'DUALIES'},
  getMovementMultiplier:vi.fn(()=>1)};
 const step=(alive=true,locked=true,stopped=false)=>applyB379NativePlayerWeaponMobility({
  input,player,weapons,humanAlive:alive,realPointerLocked:locked,
  sourceRoundPhase:'PLAYING',stopped,canonicalSourceRound:true
 });
 emit('canvas','pointerdown',{button:2});
 emit('canvas','pointerup',{button:2});
 expect(step()).toEqual({movementMultiplier:1,
  realDodgeAccepted:true,realBrellaGuardTap:false});
 expect(player.requestWeaponDodge).toHaveBeenCalledOnce();
 emit('canvas','pointerdown',{button:2});
 emit('canvas','pointerup',{button:2});
 expect(step(false)).toEqual({movementMultiplier:1,
  realDodgeAccepted:false,realBrellaGuardTap:false});
 // The input edge is consumed even if a nonplaying/unsafe state rejected it.
 expect(step()).toEqual({movementMultiplier:1,
  realDodgeAccepted:false,realBrellaGuardTap:false});
 emit('canvas','pointerdown',{button:2});
 emit('canvas','pointerup',{button:2});
 expect(step(true,false,true).realDodgeAccepted).toBe(false);
 expect(step().realDodgeAccepted).toBe(false);
});

test('selected SOURCE F/G accept one actual press edge each, not duplicate non-repeat keydown or OS repeat',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 for(const [code,read] of [
  ['KeyF',()=>input.consumeSubPressed()],
  ['KeyG',()=>input.consumeSpecialPressed()]
 ] as const){
  emit('window','keydown',{code,repeat:false});
  expect(read()).toBe(true);
  expect(read()).toBe(false);
  emit('window','keydown',{code,repeat:false}); // duplicated down, no up
  expect(read()).toBe(false);
  emit('window','keydown',{code,repeat:true}); // native OS repeat
  expect(read()).toBe(false);
  emit('window','keyup',{code});
  emit('window','keydown',{code,repeat:false}); // actual new press
  expect(read()).toBe(true);
  emit('window','keyup',{code});
 }
});
test('selected SOURCE F/G release previous-life key state without late kit intent',()=>{
 const {input,emit}=lockedInput();
 input.setSourcePrestartMovementBlocked(true);
 input.setSourcePrestartMovementBlocked(false);
 for(const code of ['KeyF','KeyG'])
  emit('window','keydown',{code,repeat:false});
 input.setCombatInputActive(false); // real HP-zero life transition
 expect([input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([false,false]);
 for(const code of ['KeyF','KeyG'])
  emit('window','keydown',{code,repeat:false}); // dead: no intent
 input.setCombatInputActive(true); // real 150-native-tick new life
 expect([input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([false,false]);
 for(const code of ['KeyF','KeyG'])
  emit('window','keydown',{code,repeat:true}); // stale physical repeat
 expect([input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([false,false]);
 for(const code of ['KeyF','KeyG'])
  emit('window','keydown',{code,repeat:false}); // genuine new press
 expect([input.consumeSubPressed(),input.consumeSpecialPressed()])
  .toEqual([true,true]);
});
