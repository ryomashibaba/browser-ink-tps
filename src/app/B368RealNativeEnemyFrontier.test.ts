import {describe,it,expect,vi} from 'vitest';
import {b368RealNativeEnemyFrontier,type B368EnemyFrontierInput}
 from './B368RealNativeEnemyFrontier';
const frame=():B368EnemyFrontierInput=>({
 enabled:true,stage:[25,17,26,0],nativeTick:1058,
 matchState:'PLAYING',paused:false,stopReason:null,
 productionAuthorized:false,unrestricted4v4Certified:false,
 humanBody:[0,8.4,67.9],humanHp:100,humanGrounded:true,
 humanOriginalSupportId:'UndertowT21D:spawn-high-positive-z',
 cpu:['A1','A2','A3','B1','B2','B3','B4'].map((id,i)=>({
  id,physicalFoot:[0,3.1,i<3?54:-51-i],mobilityState:'GROUND',
  rejoined:true,lifeState:'ACTIVE',hp:100
 })),
 stageRayBlocked:vi.fn(()=>true)
});
describe('B368 real original CPU-human proximity without a fake route',()=>{
 it('measures true distant physical opponents and no fabricated contact',()=>{
  const f=frame(),v=b368RealNativeEnemyFrontier(f);
  expect(v).toMatchObject({nearestId:'B1',scoreable:0,
   productionAuthorized:false,enemyRouteCertified:false,
   projectileHitCertified:false,actualEncounterCertified:false,
   actorRelocations:0,gameplayWrites:0,officialWinner:'NONE'});
  expect(v!.horizontalMeters).toBeGreaterThan(118);
  expect(v!.label).toContain('DISTANT');
  expect(v!.measuredEnemies).toHaveLength(4);
  expect(f.stageRayBlocked).toHaveBeenCalledTimes(1);
 });
 it('reports physical approach but never certifies full-map or actual shot',()=>{
  const f=frame(),a=b368RealNativeEnemyFrontier(f)!;
  f.humanBody=[6.6,5.4,49];
  f.humanOriginalSupportId='UndertowT21D:right-low-team-a';
  const b=b368RealNativeEnemyFrontier(f)!;
  expect(a.horizontalMeters-b.horizontalMeters).toBeGreaterThan(17);
  expect(b.horizontalMeters).toBeGreaterThan(95);
  expect(b.enemyRouteCertified).toBe(false);
  expect(b.actualEncounterCertified).toBe(false);
 });
 it('a ray clear cannot imply actual encounter or gameplay authority',()=>{
  const f=frame();f.humanBody=[0,3.9,-48];
  f.humanOriginalSupportId='UndertowT21D:right-low-team-b';
  f.stageRayBlocked=vi.fn(()=>false);
  const r=b368RealNativeEnemyFrontier(f)!;
  expect(r.label).toContain('STAGE RAY CLEAR ONLY');
  expect(r.actualEncounterCertified).toBe(false);
  expect(r.projectileHitCertified).toBe(false);
 });
 it('rejects unsupported stage, fake positions, untrusted and stopped world',()=>{
  const cases:Array<(x:B368EnemyFrontierInput)=>void>=[
   x=>{x.stage=[30,17,26,0];},
   x=>{x.stage=[25,17,26,1];},
   x=>{x.productionAuthorized=true;},
   x=>{x.unrestricted4v4Certified=true;},
   x=>{x.enabled=false;},
   x=>{x.nativeTick=1.5;},
   x=>{x.matchState='TIME_UP';},
   x=>{x.paused=true;},
   x=>{x.stopReason='STOP';},
   x=>{x.humanGrounded=false;},
   x=>{x.humanBody=[0,NaN,30];},
   x=>{x.humanOriginalSupportId='FAKE_RAMP';},
   x=>{x.cpu[3]!.physicalFoot=[0,Infinity,0];},
   x=>{x.cpu[3]!.id='A1';},
   x=>{x.cpu[3]!.hp=101;}
  ];
  for(const bad of cases){const f=frame();bad(f);
   expect(b368RealNativeEnemyFrontier(f)).toBeNull();}
 });
 it('no live opponent means HOLD, not an invented enemy',()=>{
  const f=frame();
  for(const c of f.cpu)if(c.id.startsWith('B'))c.rejoined=false;
  expect(b368RealNativeEnemyFrontier(f)).toBeNull();
 });
});
