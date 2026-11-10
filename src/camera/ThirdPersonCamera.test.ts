import {afterEach,describe,expect,it,vi} from 'vitest';
import {ThirdPersonCamera} from './ThirdPersonCamera';
import type {Entity} from 'playcanvas';
import type {RapierStagePhysics} from '../physics/RapierStagePhysics';

/** Only the real T21 SOURCE player camera opts in. No simulated actor writes. */
type EventListener=(event:Record<string,unknown>)=>void;
function harness(storage?:{
  getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void
 }){
 const windowListeners=new Map<string,EventListener[]>();
 const documentListeners=new Map<string,EventListener[]>();
 const elements:{id:string;hidden:boolean;textContent:string}[]=[];
 const add=(map:Map<string,EventListener[]>)=>
  (name:string,callback:EventListener)=>{
   map.set(name,[...(map.get(name)??[]),callback]);
  };
 const canvasListeners=new Map<string,EventListener[]>();
 const canvas={
  addEventListener:add(canvasListeners),
 } as unknown as HTMLCanvasElement;
 const documentStub={
  pointerLockElement:canvas as HTMLCanvasElement|null,
  addEventListener:add(documentListeners),
  createElement:(_tag:string)=>{
   const elem={
    id:'',hidden:false,textContent:'',dataset:{} as Record<string,string>,
    style:{cssText:''},setAttribute:()=>{}
   };
   elements.push(elem);return elem;
  },
  body:{appendChild:()=>{}}
 };
 vi.stubGlobal('window',{addEventListener:add(windowListeners),
  location:{search:''},localStorage:storage});
 vi.stubGlobal('document',documentStub);
 const camera=new ThirdPersonCamera(canvas,{} as Entity,[],
  {} as RapierStagePhysics);
 const key=(code:string)=>{
  const prevented={called:false};
  for(const handler of windowListeners.get('keydown')??[])
   handler({code,repeat:false,altKey:false,ctrlKey:false,metaKey:false,
    preventDefault:()=>{prevented.called=true;}});
  return prevented.called;
 };
 const mouse=(movementY:number)=>{
  for(const handler of documentListeners.get('mousemove')??[])
   handler({movementX:0,movementY});
 };
 const pointerLock=()=>{
  for(const handler of documentListeners.get('pointerlockchange')??[])
   handler({});
 };
 const wheel=(deltaY:number)=>{
  let prevented=false;
  for(const handler of canvasListeners.get('wheel')??[])
   handler({deltaY,preventDefault:()=>{prevented=true;}});
  return prevented;
 };
 return {camera,key,mouse,pointerLock,documentStub,elements,canvas,wheel};
}
afterEach(()=>vi.unstubAllGlobals());

describe('F3 real SOURCE-only player camera controls',()=>{
 it('rejects new keys and vertical inversion on unchanged T20/default camera',()=>{
  const h=harness();
  expect(h.key('KeyI')).toBe(false);
  expect(h.key('Backslash')).toBe(false);
  h.mouse(10);
  expect(h.camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourcePracticeOnly:false,sourceAimInvertVertical:false,
   sourceAimSensitivityMultiplier:1,pitchDegrees:-13.8
  });
  expect(h.elements).toHaveLength(0);
 });
 it('real source option changes vertical direction but never world authority',()=>{
  const h=harness();h.camera.enableSourcePracticeControls();
  expect(h.key('BracketRight')).toBe(true);
  expect(h.camera.sourcePracticeViewSnapshot().sourceAimSensitivityMultiplier)
   .toBe(1.25);
  expect(h.key('KeyI')).toBe(true);
  expect(h.camera.sourcePracticeViewSnapshot().sourceAimInvertVertical).toBe(true);
  h.mouse(10);
  expect(h.camera.sourcePracticeViewSnapshot().pitchDegrees).toBe(-9.75);
  expect(h.key('Backslash')).toBe(true);
  const reset=h.camera.sourcePracticeViewSnapshot();
  expect(reset).toMatchObject({sourceAimSensitivityMultiplier:1,
   sourceAimInvertVertical:false,sourceCameraSettingsLocalOnly:true,
   sourcePhysicsModified:false,sourceNavigationModified:false});
  h.mouse(10);
  expect(h.camera.sourcePracticeViewSnapshot().pitchDegrees).toBe(-11.55);
 });
 it('source settings are gated by real pointer lock and feedback is temporary',()=>{
  const h=harness();h.camera.enableSourcePracticeControls();
  h.documentStub.pointerLockElement=null;
  expect(h.key('KeyI')).toBe(false);
  expect(h.camera.sourcePracticeViewSnapshot().sourceAimInvertVertical).toBe(false);
  h.documentStub.pointerLockElement={} as HTMLCanvasElement;
  h.mouse(10);
  expect(h.camera.sourcePracticeViewSnapshot().pitchDegrees).toBe(-12);
  h.pointerLock();
  expect(h.elements).toHaveLength(0);
 });
 it('real source camera Q remains view-only with accessible status feedback',()=>{
  const h=harness();h.camera.enableSourcePracticeControls();
  h.pointerLock();
  expect(h.elements).toHaveLength(1);
  expect(h.elements[0]?.id).toBe('t21-f3-source-camera-controls');
  expect(h.elements[0]?.textContent).toContain('I INVERT Y');
  expect(h.key('KeyQ')).toBe(true);
  expect(h.camera.sourcePracticeViewSnapshot().shoulderSide).toBe('LEFT');
  expect(h.elements[0]?.textContent).toContain('SHOULDER · LEFT');
  expect(h.key('KeyI')).toBe(true);
  expect(h.elements[0]?.textContent).toContain('VERTICAL LOOK · INVERTED');
  h.documentStub.pointerLockElement=null;
  h.pointerLock();
  expect(h.elements[0]?.hidden).toBe(true);
 });
});

describe('SOURCE gameplay wheel focus recovery',()=>{
 it('does not change SOURCE zoom or swallow scrolling when unlocked, while locked wheel and frozen T20 still work',()=>{
  const source=harness();source.camera.enableSourcePracticeControls();
  const before=source.camera.sourcePracticeViewSnapshot().zoomMeters;
  source.documentStub.pointerLockElement=null;
  expect(source.wheel(-300)).toBe(false);
  expect(source.camera.sourcePracticeViewSnapshot().zoomMeters).toBe(before);
  source.documentStub.pointerLockElement=source.canvas;
  expect(source.wheel(-300)).toBe(true);
  const locked=source.camera.sourcePracticeViewSnapshot().zoomMeters;
  expect(locked).toBeLessThan(before);
  source.documentStub.pointerLockElement=null;
  expect(source.wheel(300)).toBe(false);
  expect(source.camera.sourcePracticeViewSnapshot().zoomMeters).toBe(locked);
  expect(source.camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourcePhysicsModified:false,sourceNavigationModified:false
  });
  const frozen=harness();
  const original=frozen.camera.sourcePracticeViewSnapshot().zoomMeters;
  frozen.documentStub.pointerLockElement=null;
  expect(frozen.wheel(-300)).toBe(true);
  expect(frozen.camera.sourcePracticeViewSnapshot().zoomMeters).toBeLessThan(original);
 });
});

describe('SOURCE-only visual settings survive real 180-second replay',()=>{
 it('persists user choices but never reads them into unchanged T20 default',()=>{
  const saved=new Map<string,string>();
  const storage={getItem:(k:string)=>saved.get(k)??null,
   setItem:(k:string,v:string)=>{saved.set(k,v);}};
  const first=harness(storage);first.camera.enableSourcePracticeControls();
  expect(first.key('BracketRight')).toBe(true);
  expect(first.key('KeyI')).toBe(true);
  expect(first.key('KeyQ')).toBe(true);
  const newRound=harness(storage);
  expect(newRound.camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourcePracticeOnly:false,sourceAimSensitivityMultiplier:1,
   sourceAimInvertVertical:false,shoulderSide:'RIGHT'});
  newRound.camera.enableSourcePracticeControls();
  expect(newRound.camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourcePracticeOnly:true,sourceAimSensitivityMultiplier:1.25,
   sourceAimInvertVertical:true,shoulderSide:'LEFT'});
  expect(newRound.key('Backslash')).toBe(true);
  const replay=harness(storage);replay.camera.enableSourcePracticeControls();
  expect(replay.camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourceAimSensitivityMultiplier:1,sourceAimInvertVertical:false,
   shoulderSide:'LEFT'});
 });
});
