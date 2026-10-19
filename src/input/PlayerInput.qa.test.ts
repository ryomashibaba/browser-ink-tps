import {afterEach,expect,test,vi} from 'vitest';
import {PlayerInput} from './PlayerInput';

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

test('unlocked and alt-modified left clicks never queue primary fire',()=>{
  const {input,emit}=lockedInput();
  emit('canvas','pointerdown',{button:0,altKey:true});
  Object.defineProperty(document,'pointerLockElement',{value:null,writable:true});
  emit('canvas','pointerdown',{button:0});
  emit('canvas','pointerdown',{button:2});
  expect([input.fireHeld,input.secondaryHeld]).toEqual([false,false]);
  expect([input.consumePrimaryPressed(),input.consumeSecondaryPressed()]).toEqual([false,false]);
});
