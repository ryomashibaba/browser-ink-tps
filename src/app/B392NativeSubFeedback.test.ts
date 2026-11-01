import {describe,expect,it} from 'vitest';
import {B392NativeSubFeedback,type B392NativeSubFrame}
 from './B392NativeSubFeedback';

function frame():B392NativeSubFrame {
 return {trustedSource:true,playerView:true,enabled:true,
  tick:100,matchState:'PLAYING',paused:false,stopReason:null,
  hp:100,subName:'Snap Bomb',throws:0,explosions:0};
}
describe('B392 real native human sub feedback only',()=>{
 it('native F throw and later explosion are different, never CPU hits',()=>{
  const model=new B392NativeSubFeedback(),s=frame();
  expect(model.observe(s)).toBeNull();
  s.tick=106;s.throws=1;
  expect(model.observe(s)).toMatchObject({
   mode:'THROWN',throws:1,explosions:0,
   cpuHitCertified:false,gameplayWrites:0,scoreable:0
  });
  s.tick=115;s.explosions=1;
  expect(model.observe(s)?.text).toBe(
   'REAL SUB DETONATED · Snap Bomb · NOT CPU HIT');
  s.tick=206;expect(model.observe(s)).toBeNull();
 });
 it('two genuine throws without explosions never imply impact',()=>{
  const model=new B392NativeSubFeedback(),s=frame();
  model.observe(s);s.tick=105;s.throws=2;
  expect(model.observe(s)?.mode).toBe('THROWN');
  s.tick=155;expect(model.observe(s)?.mode).toBe('THROWN');
  s.tick=200;expect(model.observe(s)).toBeNull();
 });
 it('initial nonzero counters and new round do not invent events',()=>{
  const model=new B392NativeSubFeedback(),s=frame();
  s.throws=3;s.explosions=2;
  expect(model.observe(s)).toBeNull();
  s.tick=111;s.throws=4;expect(model.observe(s)?.mode).toBe('THROWN');
  s.tick=0;s.throws=0;s.explosions=0;expect(model.observe(s)).toBeNull();
  s.tick=1;expect(model.observe(s)).toBeNull();
 });
 it('untrusted source, paused, dead, invalid or QA is never a cue',()=>{
  const changes:Array<(f:B392NativeSubFrame)=>void>=[
   f=>{f.trustedSource=false},f=>{f.playerView=false},
   f=>{f.enabled=false},f=>{f.paused=true},
   f=>{f.matchState='TIME_UP'},f=>{f.stopReason='SAFE_STOP'},
   f=>{f.hp=0},f=>{f.tick=-1},f=>{f.tick=.5},
   f=>{f.throws=-1},f=>{f.throws=NaN},
   f=>{f.explosions=3},f=>{f.explosions=Infinity},
   f=>{f.subName=''}
  ];
  for(const change of changes){
   const model=new B392NativeSubFeedback(),s=frame();model.observe(s);
   s.tick=104;s.throws=1;
   expect(model.observe(s)?.mode).toBe('THROWN');
   change(s);
   expect(model.observe(s)).toBeNull();
  }
 });
 it('counter regressions clear old signal and baseline at real native tick',()=>{
  const model=new B392NativeSubFeedback(),s=frame();
  model.observe(s);s.tick=105;s.throws=2;
  expect(model.observe(s)?.mode).toBe('THROWN');
  s.tick=106;s.throws=1;
  expect(model.observe(s)).toBeNull();
  s.tick=107;expect(model.observe(s)).toBeNull();
 });
});
