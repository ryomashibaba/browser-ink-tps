import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {ThirdPersonCamera,sourceCameraPhysicalClearanceMeters} from './ThirdPersonCamera';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vec3,type Entity} from 'playcanvas';
import {RapierStagePhysics,initializeRapier}
 from '../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController}
 from '../player/PlayerCharacterPhysics';
import {undertowT21dConnectivityQaStage}
 from '../stage/undertow/UndertowSpillwayConnectivityQa';

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

describe('real SOURCE player camera against already registered Rapier blockers',()=>{
 it('never crosses a blocker closer than the old cosmetic camera minimum',()=>{
  expect(sourceCameraPhysicalClearanceMeters(6.4,null)).toBe(6.4);
  expect(sourceCameraPhysicalClearanceMeters(6.4,1.1)).toBeCloseTo(.92,6);
  expect(sourceCameraPhysicalClearanceMeters(6.4,.22)).toBeCloseTo(.04,6);
  expect(sourceCameraPhysicalClearanceMeters(6.4,.08)).toBe(0);
  expect(sourceCameraPhysicalClearanceMeters(6.4,Number.NaN)).toBe(0);
  expect(()=>sourceCameraPhysicalClearanceMeters(-1,null))
   .toThrow('T21_SOURCE_BAD_CAMERA_DISTANCE');
 });
 it('clips actual SOURCE camera on the same real ray; untouched T20 keeps its old profile',()=>{
  vi.stubGlobal('window',{addEventListener:vi.fn(),location:{search:''}});
  vi.stubGlobal('document',{addEventListener:vi.fn(),pointerLockElement:null});
  const canvas={addEventListener:vi.fn()} as unknown as HTMLCanvasElement;
  const eye=new Vec3();
  const entity={
   setPosition:(x:number,y:number,z:number)=>{eye.set(x,y,z);},
   lookAt:vi.fn()
  } as unknown as Entity;
  // Stubbed near-wall Rapier result: an existing SOURCE collider, not
  // claimed native Chromium/KCC or authority to register new geometry.
  const castStageSegment=vi.fn((_from:Vec3,_to:Vec3,kind:string)=>{
   expect(kind).toBe('camera');
   return {distance:.08,point:new Vec3(),
    solidId:'UndertowT21D:spawn-high-positive-z'};
  });
  const physics={castStageSegment} as unknown as RapierStagePhysics;
  const camera=new ThirdPersonCamera(canvas,entity,[],physics);
  const body=new Vec3(0,7,50),target=new Vec3(0,7.55,50);
  camera.update(body,1/60);
  expect(eye.distance(target)).toBeCloseTo(.12,6);
  camera.enableSourcePracticeControls();
  camera.update(body,1/60);
  expect(eye.distance(target)).toBeCloseTo(0,6);
  expect(camera.sourcePracticeViewSnapshot()).toMatchObject({
   sourcePracticeOnly:true,geometryClipped:true,
   cameraDistanceMeters:0,sourcePhysicsModified:false,
   sourceNavigationModified:false
  });
  expect(castStageSegment).toHaveBeenCalledTimes(2);
 });
});

/** Actual Rapier original stage + configured project KCC, but a UNIT
 * reconstruction of a prior native supported foot, never a new native
 * Chromium, 180s route, collision-version or player-control proof. */
describe('registered SOURCE player floor + real KCC camera line of sight',()=>{
 beforeAll(async()=>{await initializeRapier();});
 it('keeps the eye before the existing high-spawn floor while native-profile KCC is grounded',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const unchanged=[stage.solids,stage.paintSurfaces,stage.navigationLinks];
  expect([stage.solids.length,stage.paintSurfaces.length,
   stage.navigationLinks?.length]).toEqual([25,17,26]);
  const physics=new RapierStagePhysics(1/60,stage);
  const originalFoot=new Vec3(-4.770392417907715,
   7.525381927490234,52.723026275634766);
  const center=originalFoot.clone();
  center.y+=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const support=physics.castCharacterFootSupport(
   center,PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
  expect(support?.solidId).toBe('UndertowT21D:spawn-high-positive-z');
  const body=physics.world.createRigidBody(
   RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    center.x,center.y,center.z));
  const collider=physics.world.createCollider(
   RAPIER.ColliderDesc.capsule(
    PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
    PLAYER_CHARACTER_PHYSICS.humanRadiusMeters),body);
  const kcc=createConfiguredPlayerCharacterController(physics.world);
  physics.step();
  kcc.computeColliderMovement(collider,{x:0,y:-.06,z:0},
   undefined,undefined,(c)=>physics.shouldCharacterCollide(c,'HUMAN'));
  const motion=kcc.computedMovement();
  expect([motion.x,motion.y,motion.z].every(Number.isFinite)).toBe(true);
  expect(kcc.computedGrounded()).toBe(true);
  const supportedBody=center.clone().add(new Vec3(
   motion.x,motion.y,motion.z));
  const canvas={addEventListener:()=>{}} as unknown as HTMLCanvasElement;
  const movementHandlers:EventListener[]=[];
  vi.stubGlobal('window',{addEventListener:()=>{},
   location:{search:'?t21QaInput=deterministic'}});
  vi.stubGlobal('document',{pointerLockElement:canvas,
   addEventListener:(name:string,handler:EventListener)=>{
    if(name==='mousemove')movementHandlers.push(handler);
   }});
  const eye=new Vec3();
  const entity={setPosition:(x:number,y:number,z:number)=>eye.set(x,y,z),
   lookAt:()=>{}} as unknown as Entity;
  const view=new ThirdPersonCamera(canvas,entity,[],physics);
  view.enableSourcePracticeControls();
  for(const move of movementHandlers)
   move({movementX:0,movementY:-300});
  expect(view.sourcePracticeViewSnapshot().pitchDegrees).toBe(28);
  const target=supportedBody.clone().add(new Vec3(0,.55,0));
  const radians=28*Math.PI/180;
  const desired=new Vec3(target.x+.72,
   target.y-Math.sin(radians)*6.4,
   target.z+Math.cos(radians)*6.4);
  const hit=physics.castStageSegment(target,desired,'camera');
  expect(hit?.solidId).toBe('UndertowT21D:spawn-high-positive-z');
  view.update(supportedBody,1/60);
  const expected=sourceCameraPhysicalClearanceMeters(
   target.distance(desired),hit!.distance);
  expect(eye.distance(target)).toBeCloseTo(expected,5);
  expect(view.sourcePracticeViewSnapshot()).toMatchObject({
   geometryClipped:true,sourcePhysicsModified:false,
   sourceNavigationModified:false});
  expect(unchanged).toEqual([stage.solids,stage.paintSurfaces,
   stage.navigationLinks]);
  kcc.free();
 });
});
