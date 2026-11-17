import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {weaponProfile} from '../weapons/WeaponCatalog';
import {ProjectileSystem} from './ProjectileSystem';

/** Exercise the genuine weapon method without creating a fake game round. */
function fixture(realSourceBudget:boolean) {
  const game=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const state=game as unknown as Record<string,any>;
  const fire=vi.fn(()=>true);
  const profile=weaponProfile('rotor-splatling');
  Object.assign(state,{
    b343SourceVolleyAtomic:realSourceBudget,
    burstShotsRemaining:3,
    splatlingStoredChargeSeconds:profile.chargeSeconds,
    burstCooldown:-0.2,
    slots:[{active:true},{active:true}],
    stats:{playerWeaponChargeRing:2,playerWeaponAction:'READY'},
    fireProjectiles:fire
  });
  const advance=()=>state.updateSplatling(
    1/60,profile,false,false,new Vec3(),new Vec3(0,0,-1),Team.A
  );
  return {state,fire,advance};
}

describe('real SOURCE splatling committed burst physical pool safety',()=>{
  it('holds charged real shots when every projectile slot is occupied',()=>{
    const {state,fire,advance}=fixture(true);
    advance();
    expect(fire).not.toHaveBeenCalled();
    expect(state.burstShotsRemaining).toBe(3);
    expect(state.splatlingStoredChargeSeconds).toBeGreaterThan(0);
    expect(state.burstCooldown).toBe(0);
    expect(state.stats.playerWeaponChargeRing).toBe(2);
  });

  it('resumes with one real projectile when a physical slot becomes free',()=>{
    const {state,fire,advance}=fixture(true);
    advance();
    state.slots[1].active=false;
    advance();
    expect(fire).toHaveBeenCalledOnce();
    expect(state.burstShotsRemaining).toBe(2);
    expect(state.burstCooldown).toBeGreaterThan(0);
    // No backlog volley: cadence is bounded after the temporary wait.
    advance();
    expect(fire).toHaveBeenCalledOnce();
    state.burstCooldown=0;
    advance();
    expect(fire).toHaveBeenCalledTimes(2);
    expect(state.burstShotsRemaining).toBe(1);
  });

  it('still ends the burst on a genuine paid-fire rejection other than pool saturation',()=>{
    const {state,fire,advance}=fixture(true);
    state.slots[0].active=false;
    fire.mockReturnValue(false);
    advance();
    expect(fire).toHaveBeenCalledOnce();
    expect(state.burstShotsRemaining).toBe(0);
    expect(state.splatlingStoredChargeSeconds).toBe(0);
  });

  it('does not alter the frozen non-SOURCE failure behavior',()=>{
    const {state,fire,advance}=fixture(false);
    fire.mockReturnValue(false);
    advance();
    expect(fire).toHaveBeenCalledOnce();
    expect(state.burstShotsRemaining).toBe(0);
  });
});
