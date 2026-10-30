import {describe,expect,it} from 'vitest';
import {b364RealSourceCrosshair,type B364SourceAimInput}
 from './B364RealSourceCrosshair';
const sample=():B364SourceAimInput=>({
 stage:[25,17,26,0],nativeTick:1111,matchState:'PLAYING',
 paused:false,stopReason:null,playerView:true,pointerLocked:true,
 playerHp:100,weaponId:'pulse-sprayer',
 sourceCombatSelected:true,productionAuthorized:false,
 unrestricted4v4Certified:false,
 actual:{id:'B1',guarded:false,distanceMeters:12.5},
 cpu:[{id:'B1',lifeState:'ACTIVE',rejoined:true,hp:66}]
});
describe('B364 exact native physical CPU crosshair (not bullet hit)',()=>{
 it('shows real living B1 body alignment without claiming damage',()=>{
  const v=b364RealSourceCrosshair(sample());
  expect(v).toMatchObject({state:'REAL_CPU_BODY_CENTER_RAY',
   id:'B1',realHp:66,distanceMeters:12.5,scoreable:0,
   gameplayWrites:0,directHpDamageCertified:false,opponentRouteCertified:false});
  expect(v!.text).toContain('NO HIT GUARANTEE');
 });
 it('distinguishes original physical shield from actual HP damage',()=>{
  const x=sample();x.actual!.guarded=true;
  expect(b364RealSourceCrosshair(x)?.state).toBe('REAL_CPU_GUARD_CENTER_RAY');
  expect(b364RealSourceCrosshair(x)?.text).toContain('SHIELD');
 });
 it('rejects other actors, fake HP, missing native CPU or malformed hit',()=>{
  for(const apply of [
   (x:B364SourceAimInput)=>{x.actual!.id='UNIT_ONLY_B1';},
   (x:B364SourceAimInput)=>{x.actual!.id='A1';},
   (x:B364SourceAimInput)=>{x.actual!.distanceMeters=81;},
   (x:B364SourceAimInput)=>{x.actual!.distanceMeters=NaN;},
   (x:B364SourceAimInput)=>{x.actual!.guarded=null as never;},
   (x:B364SourceAimInput)=>{x.cpu[0]!.hp=0;},
   (x:B364SourceAimInput)=>{x.cpu[0]!.hp=Infinity;},
   (x:B364SourceAimInput)=>{x.cpu[0]!.rejoined=false;},
   (x:B364SourceAimInput)=>{x.cpu[0]!.lifeState='SPLATTED';},
   (x:B364SourceAimInput)=>{x.cpu=[];}
  ]){const x=sample();apply(x);expect(b364RealSourceCrosshair(x)).toBeNull();}
 });
 it('fails closed for unsupported stage, paused, QA, fake source and production',()=>{
  for(const apply of [
   (x:B364SourceAimInput)=>{x.stage=[26,17,26,0];},
   (x:B364SourceAimInput)=>{x.stage=[25,17,26,1];},
   (x:B364SourceAimInput)=>{x.paused=true;},
   (x:B364SourceAimInput)=>{x.playerView=false;},
   (x:B364SourceAimInput)=>{x.pointerLocked=false;},
   (x:B364SourceAimInput)=>{x.productionAuthorized=true;},
   (x:B364SourceAimInput)=>{x.unrestricted4v4Certified=true;},
   (x:B364SourceAimInput)=>{x.sourceCombatSelected=false;},
   (x:B364SourceAimInput)=>{x.matchState='TIME_UP';},
   (x:B364SourceAimInput)=>{x.weaponId='needle-smg';},
   (x:B364SourceAimInput)=>{x.playerHp=0;},
   (x:B364SourceAimInput)=>{x.nativeTick=1.5;}
  ]){const x=sample();apply(x);expect(b364RealSourceCrosshair(x)).toBeNull();}
 });
});
