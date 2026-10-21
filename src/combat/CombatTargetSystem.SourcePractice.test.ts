import {describe,expect,it} from 'vitest';
import {Vec3,type AppBase} from 'playcanvas';
import {CombatTargetSystem} from './CombatTargetSystem';
import {PerformanceStats} from '../core/PerformanceStats';
import {Team} from '../ink/types';

describe('W10-B86 genuine F3 source combat without generic ghost targets',()=>{
 it('never constructs unauthorized generic actor meshes or their hit volumes',()=>{
  let genericEntityAdds=0;
  const fakeApp={
   root:{addChild:()=>{genericEntityAdds++;throw Error('GHOST_TARGET_SPAWN');}}
  } as unknown as AppBase;
  const stats=new PerformanceStats();
  const targets=new CombatTargetSystem(fakeApp,stats,false);
  expect(genericEntityAdds).toBe(0);
  expect(stats.targetAHp).toBe(0);
  expect(stats.targetBHp).toBe(0);
  const a=new Vec3(4,1,3),b=new Vec3(4,1,8);
  expect(targets.findNearestHit(a,b,Team.A)).toBeNull();
  expect(targets.findNearestHit(a,b,Team.B)).toBeNull();
  targets.applyProjectileHit({targetId:'B',distance:2,point:a},100);
  expect(targets.applyAreaDamage(a,50,100,Team.A)).toBe(0);
  targets.fixedUpdate(1/60);
  targets.reset();
  expect(genericEntityAdds).toBe(0);
  expect(stats.combatHits).toBe(0);
  expect(stats.combatTargetDowns).toBe(0);
  expect(stats.targetAHp).toBe(0);
  expect(stats.targetBHp).toBe(0);
 });
});
