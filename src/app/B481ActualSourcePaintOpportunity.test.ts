import {describe,it,expect} from 'vitest';
import {b481ActualSourcePaintOpportunity as cue}
 from './B481ActualSourcePaintOpportunity';
import {SurfaceFlags,Team} from '../ink/types';
const frame=()=>({
 selected:true,playerView:true,stage:[25,17,26,0] as readonly number[],
 nativeTick:1180,matchState:'PLAYING',paused:false,pointerLocked:true,
 stopReason:null as string|null,playerHp:100,paintRayFirst:true,
 raySurfaceId:'UndertowT21D:right-low-team-a:paint',
 ownerSurfaceId:'UndertowT21D:right-low-team-a:paint',
 surfaceScoreable:false,surfaceFlags:SurfaceFlags.Paintable,
 cellActive:true,observedOwner:Team.Neutral as number|null
});
describe('B481 real original SOURCE aiming: owned, neutral, opponent',()=>{
 it('exposes genuine native neutral/own/opponent current cell with no hit',()=>{
  const neutral=cue(frame());
  expect(neutral).toMatchObject({owner:'NEUTRAL',nativeTick:1180,
   originalSurfaceOnly:true,paintImpactCertified:false,
   originalScoreable:0,officialWinner:'NONE',gameplayWrites:0});
  expect(neutral?.label).toContain('IF SHOT LANDS');
  expect(cue({...frame(),observedOwner:Team.A})?.owner).toBe('OWN');
  expect(cue({...frame(),observedOwner:Team.B})?.owner).toBe('OPPONENT');
 });
 it('does not infer owner or show deceptive hit from unverified ray',()=>{
  const unsafe=[
   {stage:[24,17,26,0]},{stage:[25,17,25,0]},
   {stage:[25,17,26,1]},{nativeTick:-1},{nativeTick:1.2},
   {selected:false},{playerView:false},{matchState:'STAGING'},
   {matchState:'TIME_UP'},{paused:true},{pointerLocked:false},
   {stopReason:'NATIVE_STOP'},{playerHp:0},{paintRayFirst:false},
   {raySurfaceId:null},{raySurfaceId:'InventedFloor:paint'},
   {ownerSurfaceId:'UndertowT21D:other:paint'},
   {surfaceScoreable:true},
   {surfaceFlags:SurfaceFlags.Paintable|SurfaceFlags.Scoreable},
   {surfaceFlags:0},{cellActive:false},{observedOwner:null},
   {observedOwner:3},{observedOwner:-2}
  ];
  for(const delta of unsafe)expect(cue({...frame(),...delta})).toBeNull();
 });
});
