import {describe,it,expect,vi} from 'vitest';
import {sourceB167EnemyCombatCue as cue,
 type B167NativeCombatCueInput} from './B167NativeEnemyCombatCue';
const sample=():B167NativeCombatCueInput=>({
 nativeTick:1200,sourceStage:[25,17,26,0],matchState:'PLAYING',
 paused:false,stopReason:null,
 human:{body:[0,3.9,48],grounded:true,alive:true},
 aim:[0,0,-1],
 cpu:[{id:'B1',physicalFoot:[3,3.1,44],rejoined:true,
  lifeState:'ACTIVE',hp:67}],
 stageRayBlocked:()=>false
});
describe('B167 native CPU source contact awareness',()=>{
 it('reveals native enemy HP/direction, not a hit or route certificate',()=>{
  expect(cue(sample())).toMatchObject({
   state:'STAGE_RAY_CLEAR',actorId:'B1',horizontalMeters:5,
   realOpponentHp:67,direction:'RIGHT',
   nativeProjectileHitCertified:false,
   originalCrossMapRouteCertified:false,officialWinner:'NONE',
   gameplayWrites:0
  });
  expect(cue(sample())?.label).toContain('NOT A SHOT GUARANTEE');
 });
 it('shows registered source cover without assuming a projectile impact',()=>{
  const f=sample(),ray=vi.fn(()=>true);f.stageRayBlocked=ray;
  expect(cue(f)?.state).toBe('ORIGINAL_STAGE_COVER');
  expect(ray).toHaveBeenCalledOnce();
 });
 it('does not cast fake stage rays for elevated / ungrounded contacts',()=>{
  const f=sample(),ray=vi.fn(()=>false);f.stageRayBlocked=ray;
  f.cpu[0]!.physicalFoot=[3,12,44];
  expect(cue(f)?.state).toBe('DIFFERENT_HEIGHT');
  expect(ray).not.toHaveBeenCalled();
  f.human.grounded=false;expect(cue(f)).toBeNull();
  f.human.grounded=true;f.human.alive=false;expect(cue(f)).toBeNull();
 });
 it('rejects teammate, unrejoined, splatted, bad and far CPU contacts',()=>{
  const f=sample();
  f.cpu=[{id:'A1',physicalFoot:[1,3.1,47],rejoined:true,
   lifeState:'ACTIVE',hp:100}];expect(cue(f)).toBeNull();
  f.cpu=[{id:'B1',physicalFoot:[1,3.1,47],rejoined:true,
   lifeState:'SPLATTED',hp:0}];expect(cue(f)).toBeNull();
  f.cpu=[{id:'B1',physicalFoot:[1,3.1,47],rejoined:false,
   lifeState:'ACTIVE',hp:100}];expect(cue(f)).toBeNull();
  f.cpu=[{id:'B1',physicalFoot:[NaN,3.1,47],rejoined:true,
   lifeState:'ACTIVE',hp:100}];expect(cue(f)).toBeNull();
  f.cpu=[{id:'B1',physicalFoot:[40,3.1,48],rejoined:true,
   lifeState:'ACTIVE',hp:100}];expect(cue(f)).toBeNull();
 });
 it('fails closed on source score promotion, pause and expired sessions',()=>{
  const f=sample();f.sourceStage=[25,17,26,1];
  expect(cue(f)).toBeNull();
  f.sourceStage=[25,17,26,0];f.matchState='TIME_UP';
  expect(cue(f)).toBeNull();
  f.matchState='PLAYING';f.paused=true;expect(cue(f)).toBeNull();
  f.paused=false;f.stopReason='HOLD';expect(cue(f)).toBeNull();
  f.stopReason=null;f.nativeTick=1.5;expect(cue(f)).toBeNull();
 });
});
