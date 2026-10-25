import {describe,it,expect} from 'vitest';
import {B183OriginalHumanDescent,type B183OriginalDescentInput}
 from './B183OriginalHumanDescent';
const sample=(tick:number,y:number,grounded:boolean):B183OriginalDescentInput=>({
 tick,nativePlaying:true,alive:true,mode:'HUMAN',
 sourceStage:[25,17,26,0],body:[0,y,65],nativeGrounded:grounded,
 originalRapierSupportId:grounded?
  (y>=6?'UndertowT21D:spawn-high-positive-z':
    'UndertowT21D:first-drop-landing-positive-z'):null,
 sourceFootGapMeters:grounded?.025:null
});
describe('B183 first-drop player-facing native original challenge',()=>{
 it('requires upper true Rapier contact, native descent and actual lower contact',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe(sample(1,8.7,true));
  expect(d.snapshot().status).toBe('UPPER_READY');
  let y=8.7;
  for(let t=2;t<=13;t++){
   y-=.4;d.observe(sample(t,y,false));
  }
  expect(d.snapshot().status).toBe('DESCENDING');
  d.observe(sample(14,3.9,true));
  expect(d.snapshot()).toMatchObject({
   status:'SOURCE_LOWER_LANDED',trueNativeLandingTick:14,
   originalFirstDropLocalPracticeClear:true,
   crossTeamRouteCertified:false,sourceScoreablePromotions:0,
   officialWinner:'NONE'
  });
 });
 it('does not clear from a native lower source pad without upper movement',()=>{
  const d=new B183OriginalHumanDescent();
  for(let t=1;t<=8;t++)d.observe(sample(t,4.1,true));
  expect(d.snapshot().status).toBe('SEEK_UPPER');
  expect(d.snapshot().originalFirstDropLocalPracticeClear).toBe(false);
 });
 it('does not turn an upper-level jump landing into a drop clear',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe(sample(1,8.7,true));
  d.observe(sample(2,8.5,false));
  d.observe(sample(3,8.3,false));
  d.observe(sample(4,8.5,true));
  expect(d.snapshot().originalFirstDropLocalPracticeClear).toBe(false);
 });
 it('rejects a fake body teleport, skipped ticks and unknown stage',()=>{
  const a=new B183OriginalHumanDescent();
  a.observe(sample(1,8.7,true));
  a.observe(sample(2,4.1,true));
  expect(a.snapshot().status).toBe('WITNESS_INVALID');
  const b=new B183OriginalHumanDescent();
  b.observe(sample(1,8.7,true));
  b.observe(sample(3,8.3,false));
  expect(b.snapshot().status).toBe('WITNESS_INVALID');
  const c=new B183OriginalHumanDescent();
  c.observe({...sample(1,8.7,true),sourceStage:[25,17,26,1]});
  expect(c.snapshot().sourceStageMaintained).toBe(false);
 });
 it('cannot clear during splat, while paused or without a real floor',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe({...sample(1,8.7,true),alive:false});
  d.observe({...sample(2,8.7,true),nativePlaying:false});
  d.observe({...sample(3,8.7,true),originalRapierSupportId:null});
  expect(d.snapshot().status).toBe('SEEK_UPPER');
 });
});

// B184 genuine original-source collider identity and same-side provenance.
describe('B184 no invented first-drop authority',()=>{
 it('does not arm from another painted upper floor',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe({...sample(1,8.7,true),
   originalRapierSupportId:'UndertowT21D:glass-underpass-positive-z'});
  expect(d.snapshot().status).toBe('SEEK_UPPER');
 });
 it('does not accept an opposite-side landing',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe(sample(1,8.7,true));
  let y=8.7;
  for(let t=2;t<=13;t++){y-=.4;d.observe(sample(t,y,false));}
  d.observe({...sample(14,3.9,true),
   originalRapierSupportId:'UndertowT21D:first-drop-landing-negative-z'});
  expect(d.snapshot().originalFirstDropLocalPracticeClear).toBe(false);
 });
 it('never awards other original-source solids at the same low height',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe(sample(1,8.7,true));
  let y=8.7;
  for(let t=2;t<=13;t++){y-=.4;d.observe(sample(t,y,false));}
  d.observe({...sample(14,3.9,true),
   originalRapierSupportId:'UndertowT21D:center-low-positive-z'});
  expect(d.snapshot().status).toBe('SEEK_UPPER');
 });
 it('captures exact real upper and lower Rapier identities',()=>{
  const d=new B183OriginalHumanDescent();
  d.observe(sample(1,8.7,true));
  let y=8.7;
  for(let t=2;t<=13;t++){y-=.4;d.observe(sample(t,y,false));}
  d.observe(sample(14,3.9,true));
  expect(d.snapshot()).toMatchObject({
   actualOriginalRapierUpperStartId:'UndertowT21D:spawn-high-positive-z',
   actualOriginalRapierLowerLandingId:'UndertowT21D:first-drop-landing-positive-z',
   originalFirstDropLocalPracticeClear:true
  });
 });
});
