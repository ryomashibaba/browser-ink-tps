import {describe,it,expect} from 'vitest';
import {B367RealCpuCombatTimeline,type B367NativeCombatFrame}
 from './B367RealCpuCombatTimeline';
const sample=():B367NativeCombatFrame=>({
 enabled:true,nativeTick:100,stage:[25,17,26,0],
 matchState:'PLAYING',paused:false,stopReason:null,
 productionAuthorized:false,unrestricted4v4Certified:false,
 humanDirectHits:0,humanDirectSplats:0,cpuSplats:0,cpuRespawns:0,
 source:{enabled:true,physicalHumanCpuHpHits:0,
  events:[],syntheticHits:0,actorRelocations:0,scoreable:0,
  source:'25/17/26/0',opponentRoutesCertified:false,
  productionAuthorized:false},
 cpu:['A1','A2','A3','B1','B2','B3','B4'].map(id=>({
  id,lifeState:'ACTIVE' as const,rejoined:true,hp:100}))
});
const shot=(x:B367NativeCombatFrame,hpAfter=60)=>{
 x.nativeTick++;
 x.humanDirectHits++;
 x.source.physicalHumanCpuHpHits++;
 x.cpu[3]!.hp=hpAfter;
 x.source.events=[...x.source.events,{sequence:x.humanDirectHits,
  nativeFrame:x.nativeTick,botId:'B1',weaponId:'pulse-sprayer',
  hpBefore:100,hpAfter,actualHpLoss:100-hpAfter,
  lethalHpZero:hpAfter===0}];
};
describe('B367 original physical CPU damage and native life',()=>{
 it('never invents a hit from 7 real active CPUs or original paint',()=>{
  const a=new B367RealCpuCombatTimeline();
  expect(a.observe(sample())).toBeNull();
  expect(a.observe(sample())).toBeNull();
 });
 it('identifies actual projectile-to-specific-CPU HP, not generic hit marker',()=>{
  const a=new B367RealCpuCombatTimeline(),f=sample();
  expect(a.observe(f)).toBeNull();shot(f);
  expect(a.observe(f)).toMatchObject({
   state:'ACTUAL_HP_LOSS',actorId:'B1',
   certifiedDirectHumanDamage:true,gameplayWrites:0,
   sourceScoreablePromotions:0,officialWinner:'NONE',
   naturalEnemyRouteCertified:false});
  expect(a.observe(f)?.description).toContain('HP 100 → 60');
 });
 it('separates genuine lethal HP zero, native splat and actual respawn',()=>{
  const a=new B367RealCpuCombatTimeline(),f=sample();
  a.observe(f);shot(f,0);
  expect(a.observe(f)?.state).toBe('LETHAL_HP_ZERO_PENDING_SPLAT');
  f.nativeTick++;
  f.cpu[3]!.lifeState='SPLATTED';f.cpu[3]!.hp=0;
  f.humanDirectSplats=1;f.cpuSplats=1;
  expect(a.observe(f)?.state).toBe('ACTUAL_CPU_SPLAT');
  f.nativeTick+=150;f.cpu[3]!.lifeState='ACTIVE';
  f.cpu[3]!.hp=100;f.cpuRespawns=1;
  expect(a.observe(f)).toMatchObject({
   state:'ACTUAL_CPU_RESPAWN',actorId:'B1'});
 });
 it('never mistakes source shield absorption or CPU damage for a human hit',()=>{
  const a=new B367RealCpuCombatTimeline(),f=sample();
  a.observe(f);f.nativeTick+=10;
  f.cpu[3]!.hp=70;f.cpuSplats=0;
  expect(a.observe(f)).toBeNull();
  f.nativeTick++;
  f.source.physicalHumanCpuHpHits=1;
  // Missing physical projectile event and counter must fail closed.
  expect(a.observe(f)).toBeNull();
 });
 it('rejects tampered provenance, QA score, crossmap authorizations and gaps',()=>{
  for(const apply of [
   (x:B367NativeCombatFrame)=>{x.stage=[30,17,26,0];},
   (x:B367NativeCombatFrame)=>{x.source.syntheticHits=1;},
   (x:B367NativeCombatFrame)=>{x.source.actorRelocations=1;},
   (x:B367NativeCombatFrame)=>{x.source.scoreable=1;},
   (x:B367NativeCombatFrame)=>{x.source.opponentRoutesCertified=true;},
   (x:B367NativeCombatFrame)=>{x.productionAuthorized=true;},
   (x:B367NativeCombatFrame)=>{x.unrestricted4v4Certified=true;},
   (x:B367NativeCombatFrame)=>{x.source.events[0]!.botId='A1';},
   (x:B367NativeCombatFrame)=>{x.source.events[0]!.actualHpLoss=999;},
   (x:B367NativeCombatFrame)=>{x.source.events[0]!.sequence=3;},
   (x:B367NativeCombatFrame)=>{x.humanDirectHits=0;}
  ]){
   const f=sample();shot(f);apply(f);
   expect(new B367RealCpuCombatTimeline().observe(f)).toBeNull();
  }
 });
 it('hides notices when paused or expired, preserving actual source evidence',()=>{
  const a=new B367RealCpuCombatTimeline(),f=sample();
  a.observe(f);shot(f);f.paused=true;
  expect(a.observe(f)).toBeNull();
  f.paused=false;f.matchState='TIME_UP';
  expect(a.observe(f)).toBeNull();
 });
});
