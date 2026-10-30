import {describe,it,expect} from 'vitest';
import {B356RealSourceReticle,type B356RealReticleFrame} from './B356RealSourceReticle';
const frame=():B356RealReticleFrame=>({
 enabled:true,playerView:true,nativeTick:100,
 originalStage:[25,17,26,0],matchState:'PLAYING',paused:false,
 stopReason:null,productionAuthorized:false,unrestricted4v4Certified:false,
 playerHp:100,shotsFired:0,
 paint:{originalSourceOnly:true,scoreablePromotionCount:0,
 humanChangedImpactCount:0,humanChangedCells:0,
 lastImpactTick:null,lastImpactChangedCells:0}
});
describe('B356 truth-only viewport source reticle',()=>{
 it('true 3D shot is not paint, only native changed original owner cells are paint',()=>{
  const x=new B356RealSourceReticle(),a=frame();
  expect(x.observe(a)).toBeNull();
  a.nativeTick=112;a.shotsFired=2;
  expect(x.observe(a)).toMatchObject({mode:'ACTUAL_SHOT_ONLY',
   enemyHitCertified:false,scoreable:0});
  a.nativeTick=118;a.paint!.humanChangedImpactCount=1;
  a.paint!.humanChangedCells=12;a.paint!.lastImpactTick=118;
  a.paint!.lastImpactChangedCells=12;
  expect(x.observe(a)).toMatchObject({mode:'REAL_PAINT',
   realHumanChangedCells:12,enemyHitCertified:false});
  a.nativeTick=150;
  expect(x.observe(a)).toBeNull();
 });
 it('actual shot without any ownership changes never gets a paint hit marker',()=>{
  const x=new B356RealSourceReticle(),f=frame();x.observe(f);
  f.nativeTick=106;f.shotsFired=10;
  expect(x.observe(f)?.label).toContain('PAINT UNCONFIRMED');
  f.nativeTick=122;
  expect(x.observe(f)).toBeNull();
 });
 it('refuses score, counterfeit timestamps, stage, paused state and old ticks',()=>{
  for(const change of [
   (a:B356RealReticleFrame)=>{a.originalStage=[25,17,25,0]},
   a=>{a.productionAuthorized=true},
   a=>{a.paint!.scoreablePromotionCount=1},
   a=>{a.paint!.lastImpactTick=120},
   a=>{a.playerView=false},
   a=>{a.paused=true},
   a=>{a.enabled=false},
   a=>{a.originalStage=[25,17,26,1]},
   a=>{a.paint!.originalSourceOnly=false}
  ]){
   const f=frame();change(f);
   const x=new B356RealSourceReticle();expect(x.observe(f)).toBeNull();
  }
 });
});
