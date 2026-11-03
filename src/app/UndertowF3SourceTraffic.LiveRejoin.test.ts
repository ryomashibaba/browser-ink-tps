import {describe,expect,it} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {UndertowF3SourceTraffic,sourceNativeLiveRejoinedCpu,
 type F3TrafficCpu} from './UndertowF3SourceTraffic';

function fixture(){
 const ids=['A1','A2','A3','B1','B2','B3','B4'];
 const bots:F3TrafficCpu[]=ids.map(id=>({
  id,team:id.startsWith('A')?Team.A:Team.B,
  position:new Vec3(0,3,id.startsWith('A')?40:-40),
  agent:null,mobilityState:'GROUND',thinkRemaining:0,
  paintRemaining:0,fireRemaining:0,jumpCooldownSeconds:0,
  lifeState:'ACTIVE',hp:100
 }));
 // Observe the real class methods without constructing mock stage solids,
 // routes, Crowd or Rapier. No bot/physics/world state is advanced.
 const traffic=Object.create(UndertowF3SourceTraffic.prototype)
  as UndertowF3SourceTraffic;
 const historical=new Set(ids);
 Object.assign(traffic,{
  bots,physicallyRejoined:historical,physicallyFalling:new Set(),
  respawnOriginalDrops:new Set(),cleared:new Set(),released:new Set(),
  lastMoved:new Map(),patrolIndex:new Map(),patrolGoals:new Map(),
  b93UpperDetours:new Map(),routePlan:{distinctFirstDropLinks:[]},
  freeCombat:true
 });
 return {traffic,bots,historical};
}
describe('F3 actual native CPU life beats stale F2 physical rejoin cache',()=>{
 it('all seven real living native CPUs retain their true prior rejoin',()=>{
  const {traffic}=fixture();
  expect(traffic.nativeCpuLifecycleFrames().map(c=>c.rejoined))
   .toEqual(Array(7).fill(true));
  expect(traffic.snapshot().physicalRejoins).toHaveLength(7);
 });
 it('immediate genuine HP-zero splat hides B1 BEFORE next traffic.observe()',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState='SPLATTED';bots[3]!.hp=0;
  expect(historical.has('B1')).toBe(true); // stale cache, no fake writes
  expect(traffic.nativeCpuLifecycleFrames()[3]).toMatchObject({
   id:'B1',lifeState:'SPLATTED',hp:0,rejoined:false
  });
  const visible=traffic.snapshot();
  expect(visible.physicalRejoins).toHaveLength(6);
  expect(visible.physicalRejoins).not.toContain('B1');
  expect(visible.cpu[3]).toMatchObject({
   id:'B1',lifeState:'SPLATTED',hp:0,rejoined:false
  });
  expect(historical.has('B1')).toBe(true); // evidence, not navigation edits
 });
 it('unknown life never invents a live CPU return or original patrol goal',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState=undefined;
  expect(sourceNativeLiveRejoinedCpu(bots[3]!,historical)).toBe(false);
  expect(traffic.nativeCpuLifecycleFrames()[3]).toMatchObject({
   id:'B1',lifeState:'UNKNOWN',rejoined:false
  });
  expect(traffic.snapshot().physicalRejoins).not.toContain('B1');
 });
 it('normal real source respawn must earn new physical rejoin',()=>{
  const {traffic,bots,historical}=fixture();
  bots[3]!.lifeState='SPLATTED';bots[3]!.hp=0;
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(false);
  // Existing real traffic.observe() clears the historical rejoin on splat.
  historical.delete('B1');
  bots[3]!.lifeState='ACTIVE';bots[3]!.hp=100;
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(false);
  expect(traffic.snapshot().physicalRejoins).toHaveLength(6);
  // Only a separately verified original F2 first-drop rejoin may add it.
  historical.add('B1');
  expect(traffic.nativeCpuLifecycleFrames()[3]!.rejoined).toBe(true);
 });
});
