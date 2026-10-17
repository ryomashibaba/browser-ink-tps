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
  const canvas={addEventListener:()=>{}} as unknown as HTMLCanvasElement;
  return {input:new PlayerInput(canvas,qa),canvas,handlers};
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
