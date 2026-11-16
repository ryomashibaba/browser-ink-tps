import {describe,it,expect,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {WEAPON_ORDER} from '../weapons/WeaponCatalog';
import {ProjectileSystem} from './ProjectileSystem';
import {b351RealCpuDamageCue as cue} from './B351SourceHitFeedback';
describe('B351 true human pulse-sprayer CPU damage cue',()=>{
 it('only allows verified HP loss',()=>{
  expect(cue(true,'HUMAN','pulse-sprayer',8,9)).toBe(true);
 });
 it('rejects opt-out, shield, wall, other owner/weapon and false counts',()=>{
  const inputs:[boolean,'HUMAN'|'CPU',string,number,number][]=[
   [false,'HUMAN','pulse-sprayer',8,9],
   [true,'CPU','pulse-sprayer',8,9],
   [true,'HUMAN','metro-roller',8,9],
   [true,'HUMAN','pulse-sprayer',8,8],
   [true,'HUMAN','pulse-sprayer',8,10],
   [true,'HUMAN','pulse-sprayer',-1,0],
   [true,'HUMAN','pulse-sprayer',NaN,1],
   [true,'HUMAN','pulse-sprayer',8,Infinity]
  ];for(const args of inputs)expect(cue(...args)).toBe(false);
 });
});

describe('real SOURCE 12-weapon native HP-hit reaction',()=>{
 it('supports all 12 canonical main weapons only under selected-kit authority',()=>{
  for(const id of WEAPON_ORDER){
   expect(cue(false,'HUMAN',id,3,4,true)).toBe(true);
   if(id!=='pulse-sprayer')expect(cue(true,'HUMAN',id,3,4)).toBe(false);
  }
 });
 it('rejects fake weapons, CPU shots, unchanged HP, duplicate counts',()=>{
  expect(cue(false,'HUMAN','fake-weapon',3,4,true)).toBe(false);
  expect(cue(false,'CPU','rail-charger',3,4,true)).toBe(false);
  expect(cue(false,'HUMAN','rail-charger',3,3,true)).toBe(false);
  expect(cue(false,'HUMAN','rail-charger',3,5,true)).toBe(false);
  expect(cue(false,'HUMAN','rail-charger',-1,0,true)).toBe(false);
 });
 it('emits charger feedback from native CPU HP loss, never a shield-only ray',()=>{
  const p=Object.create(ProjectileSystem.prototype) as ProjectileSystem;
  const sys=p as unknown as Record<string,any>;
  const hitFeedback=vi.fn();
  sys.playerWeaponId='rail-charger';
  sys.nativeSourceHumanPhysicalMode={};
  sys.b351CueOn=false;sys.b367SelectedRealLoadout=true;
  sys.b351TrueDamageCues=0;sys.b367Enabled=false;
  sys.stats={humanCpuDirectHits:0};
  sys.feedback={confirmedHumanCpuDamage:hitFeedback};
  sys.physics={castStageSegment:()=>null};
  sys.findNearestSurfaceHit=()=>null;
  const hit={botId:'B1',distance:3,point:new Vec3(3,0,0),guarded:false};
  sys.combatTargets={findNearestHit:()=>null};
  sys.cpuAgents={findNearestCombatHit:()=>hit,
   applyProjectileHit:()=>{
    sys.stats.humanCpuDirectHits++;
    return {botId:'B1',sourceKind:'HUMAN',hpBefore:100,hpAfter:60,
     realHpLoss:40,shieldAbsorbed:false,lethalHpZero:false};
   }};
  const ray=(p as unknown as {resolveDirectRay:
   (o:Vec3,d:Vec3,r:number,t:number,damage:number)=>unknown})
    .resolveDirectRay.bind(p);
  ray(new Vec3(0,0,0),new Vec3(1,0,0),15,0,40);
  expect(sys.stats.humanCpuDirectHits).toBe(1);
  expect(sys.b351TrueDamageCues).toBe(1);
  expect(hitFeedback).toHaveBeenCalledOnce();
  sys.cpuAgents.applyProjectileHit=()=>({
   botId:'B1',sourceKind:'HUMAN',hpBefore:60,hpAfter:60,
   realHpLoss:0,shieldAbsorbed:true,lethalHpZero:false
  });
  ray(new Vec3(0,0,0),new Vec3(1,0,0),15,0,40);
  expect(hitFeedback).toHaveBeenCalledOnce();
  expect(sys.b351TrueDamageCues).toBe(1);
 });
});
