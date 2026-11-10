import {describe,it,expect} from 'vitest';
import {B248_SOURCE_VISUAL_AUTHORITY,B248_SOURCE_GROUNDED_SQUID_VISUAL_Y_OFFSET_METERS,
 B248_SOURCE_SQUID_BODY_HEIGHT_METERS,B248_SOURCE_SQUID_PARENT_SCALE_Y,
 b248HumanParts,b249FacingDegrees,b249StrideDegrees}
 from './B248SourceActorVisuals';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
describe('B248 source-only actor visual boundary',()=>{
 it('never creates any game physics or score authority',()=>{
  expect(B248_SOURCE_VISUAL_AUTHORITY).toMatchObject({
   humanParts:14,visualOnly:true,solidsAdded:0,paintAdded:0,
   linksAdded:0,scoreableAdded:0,actorBodiesAdded:0,
   physicalActorsMoved:0,productionAuthorized:false
  });
 });
 it('uses bounded finite primitives and unique part identifiers',()=>{
  const parts=b248HumanParts();
  expect(new Set(parts.map(p=>p.name)).size).toBe(parts.length);
  for(const p of parts){
   expect(['box','sphere','capsule','cylinder']).toContain(p.type);
   expect(p.pos.every(Number.isFinite)).toBe(true);
   expect(p.size.every(x=>Number.isFinite(x)&&x>0&&x<1.2)).toBe(true);
  }
 });
 it('defines visible head, tank, feet and weapon distinct from a capsule',()=>{
  const names=b248HumanParts().map(x=>x.name);
  for(const x of ['helmet','visor','torso','boot-left','boot-right','ink-tank','nozzle'])
   expect(names).toContain(x);
 });
});

describe('B249 native actor-facing render-only animation',()=>{
 it('turns -Z local forward toward the actual measured direction',()=>{
  expect(b249FacingDegrees(0,-1,44)).toBe(0);
  expect(b249FacingDegrees(1,0,44)).toBe(-90);
  expect(b249FacingDegrees(-1,0,44)).toBe(90);
  expect(Math.abs(b249FacingDegrees(0,1,44))).toBe(180);
 });
 it('preserves actual prior facing if movement is too small or invalid',()=>{
  expect(b249FacingDegrees(0,0,42)).toBe(42);
  expect(b249FacingDegrees(Number.NaN,1,42)).toBe(42);
  expect(b249FacingDegrees(.00001,0,42)).toBe(42);
 });
 it('has bounded leg and arm stride and no animation without movement',()=>{
  expect(b249StrideDegrees(0,Math.PI/2)).toBe(0);
  expect(b249StrideDegrees(1,Math.PI/2)).toBeCloseTo(24);
  expect(b249StrideDegrees(2,-Math.PI/2)).toBeCloseTo(-24);
  expect(b249StrideDegrees(Number.NaN,1)).toBe(0);
  expect(b249StrideDegrees(.5,Number.NaN)).toBe(0);
 });
});

describe('B248 genuine grounded SOURCE squid visual foot correspondence',()=>{
 it('puts the rendered squid body on a recorded registered high-spawn foot without moving the Rapier ball',()=>{
  const realRegisteredFootY=7.525381927490234; // recorded native Windows original high spawn
  const humanBodyY=realRegisteredFootY+
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const visualHalfHeight=B248_SOURCE_SQUID_BODY_HEIGHT_METERS*
    B248_SOURCE_SQUID_PARENT_SCALE_Y/2;
  const before=humanBodyY+GAME_CONFIG.player.squidVisualOffsetYMeters-
   visualHalfHeight;
  expect(before-realRegisteredFootY).toBeCloseTo(.2816,4);
  const after=humanBodyY+B248_SOURCE_GROUNDED_SQUID_VISUAL_Y_OFFSET_METERS-
   visualHalfHeight;
  expect(after).toBeCloseTo(realRegisteredFootY,6);
  // No value in PlayerCharacterPhysics or the original-source collider moved.
  expect(PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters).toBeCloseTo(.87);
  expect(PLAYER_CHARACTER_PHYSICS.squidRadiusMeters).toBeCloseTo(.34);
 });
});
