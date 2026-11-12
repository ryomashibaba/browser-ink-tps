import {describe,it,expect} from 'vitest';
import {b345BoundOpeningCooldown as bound} from './B345SourceShooterOpeningCadence';
describe('B345 native SHOOTER first-press idle cooldown',()=>{
 it('keeps one genuine 60Hz step but not the accumulated 0.5s',()=>{
  expect(bound(-.5,1/60)).toBeCloseTo(-1/60);
  expect(bound(-.105,1/60)).toBeCloseTo(-1/60);
  expect(bound(-.001,1/60)).toBe(-.001);
  expect(bound(.09,1/60)).toBe(.09);
 });
 it('the standard held-shot additive interval resumes after opening',()=>{
  let cd=bound(-.5,1/60)+.105;
  const ticks=[];
  for(let t=1;t<=60;t++){
   cd=Math.max(-.5,cd-1/60);
   if(cd>0)continue;
   ticks.push(t);cd+=.105;
  }
  expect(ticks.slice(0,3)).toEqual([6,12,18]);
  expect(ticks.length).toBeGreaterThanOrEqual(8);
  expect(ticks.length).toBeLessThanOrEqual(10);
 });
 it('SOURCE DUALIES first press uses actual 60 Hz paired-volley cadence, not idle -0.5s debt',()=>{
   const simulate=(focused:boolean)=>{
     const cadence=focused?.062:.105;
     let cd=-.5;
     const acceptedTicks:number[]=[];
     for(let tick=1;tick<=60;tick++){
       cd=Math.max(-.5,cd-1/60);
       // This is the SAME rising-fire clamp invoked for the real
       // DUALIES fixedUpdate, before its existing additive cadence.
       if(tick===1)cd=bound(cd,1/60);
       if(cd>0)continue;
       acceptedTicks.push(tick);
       cd+=cadence;
     }
     return acceptedTicks;
   };
   const ordinary=simulate(false);
   const focused=simulate(true);
   expect(ordinary.slice(0,4)).toEqual([1,7,13,19]);
   expect(ordinary.length).toBe(10);
   expect(focused.slice(0,4)).toEqual([1,4,8,12]);
   expect(focused.length).toBe(17);
   // One accepted volley still means two real projectiles via the
   // original DUALIES code and one legitimate per-volley ink spend.
   expect(ordinary.filter(t=>t<=12)).toHaveLength(2);
   expect(focused.filter(t=>t<=12)).toHaveLength(4);
 });
 it('rejects fabricated or missing fixed steps',()=>{
  for(const [cd,dt] of ([[NaN,1/60],[-.5,0],
   [-.5,-1],[Infinity,1/60],[-.5,NaN],[-.5,.5]] as const))
   expect(()=>bound(cd,dt)).toThrow('B345_INVALID_NATIVE_STEP');
 });
});
