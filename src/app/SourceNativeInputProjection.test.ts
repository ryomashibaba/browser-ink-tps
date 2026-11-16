import {describe,expect,it} from 'vitest';
import {sourceNativeInputProjection,sourceNativePointerLockClickAllowed,sourceNativeEditingHotkeyTarget} from './SourceNativeInputProjection';
describe('T21 actual native D input projection',()=>{
 it('yaw=0 maps D to +X and W to -Z using existing player movement basis',()=>{
  const d=sourceNativeInputProjection({nativeTick:1304,axes:[1,0],
   yawDegrees:0,pointerLocked:true});
  const w=sourceNativeInputProjection({nativeTick:1304,axes:[0,1],
   yawDegrees:0,pointerLocked:true});
  expect(d.projectedWorldIntent[0]).toBeCloseTo(1,9);
  expect(d.projectedWorldIntent[1]).toBeCloseTo(0,9);
  expect(w.projectedWorldIntent[0]).toBeCloseTo(0,9);
  expect(w.projectedWorldIntent[1]).toBeCloseTo(-1,9);
 });
 it('yaw=-90 means D points in -Z, so real zero X alone is not a key failure',()=>{
  const d=sourceNativeInputProjection({nativeTick:1340,axes:[1,0],
   yawDegrees:-90,pointerLocked:true});
  expect(d.projectedWorldIntent[0]).toBeCloseTo(0,9);
  expect(d.projectedWorldIntent[1]).toBeCloseTo(-1,9);
 });
 it('unlocked, zero-axis sample never claims an accepted key',()=>{
  const f=sourceNativeInputProjection({nativeTick:1340,axes:[0,0],
   yawDegrees:0,pointerLocked:false});
  expect(f.nonzeroNativeAxes).toBe(false);
  expect(f.realPointerLockAtSampling).toBe(false);
  expect(f.desiredMotionProvesPhysicalMove).toBe(false);
 });
 it('normalizes diagonal input and rejects invalid samples',()=>{
  const f=sourceNativeInputProjection({nativeTick:1340,axes:[1,1],
   yawDegrees:35,pointerLocked:true});
  expect(Math.hypot(...f.projectedWorldIntent)).toBeCloseTo(1,9);
  expect(()=>sourceNativeInputProjection({nativeTick:1340,axes:[2,0],
   yawDegrees:0,pointerLocked:true})).toThrow('SOURCE_NATIVE_INPUT_PROJECTION_INVALID');
 });
});

describe('SOURCE player input ownership during actual menu and camera play',()=>{
 it('only source primary click acquires pointer lock, keeping non-SOURCE behavior',()=>{
  expect(sourceNativePointerLockClickAllowed(true,0)).toBe(true);
  expect(sourceNativePointerLockClickAllowed(true,1)).toBe(false);
  expect(sourceNativePointerLockClickAllowed(true,2)).toBe(false);
  expect(sourceNativePointerLockClickAllowed(false,2)).toBe(true);
 });
 it('does not classify an absent keyboard event target as editing',()=>{
  expect(sourceNativeEditingHotkeyTarget(null)).toBe(false);
 });
});
