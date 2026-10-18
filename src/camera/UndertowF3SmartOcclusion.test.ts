import {describe,expect,it} from 'vitest';
import {UndertowF3SmartOcclusion} from './UndertowF3SmartOcclusion';

const probe=(c:number,a:number,dt=1/60)=>({
 currentClearMeters:c,alternateClearMeters:a,
 desiredMeters:6.4,realDeltaSeconds:dt
});
describe('W10-B26 source-only genuinely blocked camera shoulder',()=>{
 it('switches only after sustained actual-collider advantage',()=>{
  const m=new UndertowF3SmartOcclusion();
  let side:'RIGHT'|'LEFT'='RIGHT';
  for(let i=0;i<13;i++){
   m.tick(1/60);
   side=m.observe(probe(1.8,6),side);
   expect(side).toBe('RIGHT');
  }
  m.tick(1/60);
  side=m.observe(probe(1.8,6),side);
  expect(side).toBe('LEFT');
  expect(m.snapshot()).toMatchObject({
   sourcePreviewOnly:true,automaticSwitchCount:1,
   gameplayGeometryModified:false,physicsCameraBypass:false,
   productionAuthorized:false
  });
 });
 it('does not switch for weak gains, tiny blockage or blocked alternate',()=>{
  const m=new UndertowF3SmartOcclusion();
  for(const [cur,alt] of [[5.9,6.4],[2,3.0],[3.2,4.1]] as const){
   for(let i=0;i<60;i++){m.tick(1/60);
    expect(m.observe(probe(cur,alt),'RIGHT')).toBe('RIGHT');}
  }
  expect(m.snapshot().automaticSwitchCount).toBe(0);
 });
 it('manual Q wins for 8 real seconds; cooldown prevents instant bounce',()=>{
  const m=new UndertowF3SmartOcclusion();
  m.manual('LEFT');
  for(let i=0;i<420;i++){
   m.tick(1/60);
   expect(m.mayProbe(1/60)).toBe(false);
  }
  expect(m.snapshot().lastSelected).toBe('LEFT');
  // Controller can re-check after the lockout genuinely expires.
  for(let i=0;i<61;i++)m.tick(1/60);
  expect(m.mayProbe(1/60)).toBe(true);
 });
 it('does not accumulate dwell across unblocked frames or invalid probes',()=>{
  const m=new UndertowF3SmartOcclusion();
  for(let i=0;i<10;i++){m.tick(1/60);
   expect(m.observe(probe(1,6),'RIGHT')).toBe('RIGHT');}
  m.resetCandidate();
  for(let i=0;i<10;i++){m.tick(1/60);
   expect(m.observe(probe(1,6),'RIGHT')).toBe('RIGHT');}
  expect(m.observe(probe(Number.NaN,6),'RIGHT')).toBe('RIGHT');
  expect(m.snapshot().automaticSwitchCount).toBe(0);
 });
 it('retains native physical authority in its entire diagnostic snapshot',()=>{
  const m=new UndertowF3SmartOcclusion();
  expect(m.snapshot()).toMatchObject({
   geometryAuthority:'EXISTING_RAPIER_STAGE_CAMERA_COLLIDERS_ONLY',
   automaticSwitchCount:0,alternateRaysCompared:0,
   productionAuthorized:false,gameplayGeometryModified:false
  });
 });
});
