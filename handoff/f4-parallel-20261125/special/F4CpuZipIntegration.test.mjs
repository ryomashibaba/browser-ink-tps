import assert from 'node:assert/strict';
import {CpuZipMotion} from './F4CpuZipMotion.mjs';
const candidate={start:[0,0,0],goal:[1,0,0],normal:[-1,0,0],supportId:'floor',colliderHandle:1,distance:1,targetDistance:3,targetClear:true};
function run(returnClear=true){
 const motion=new CpuZipMotion(candidate,0,'1');let foot=[1,0,0],tick=0;
 const step=(hp=100)=>{const r=motion.step({tick,lifeId:'1',foot,visible:true,hp},{returnClear:()=>returnClear,move:(delta)=>({foot:motion.phase==='CONTACT'||motion.phase==='ATTACHED'?foot:foot.map((v,i)=>v+delta[i]),wallContact:true,grounded:motion.phase==='LANDING',supportId:'floor'})});if(r.foot)foot=r.foot;tick++;return r;};
 const observe=(visible)=>motion.observeAttachedTarget(tick-1,visible);
 return {motion,step,observe,get tick(){return tick}};
}
let n=0;const check=(name,f)=>{f();n++;console.log('PASS '+name)};
check('contact still permits shot',()=>{const r=run();assert.equal(r.step().canFire,true);assert.equal(r.observe(true),true)});
check('missing target returns after 90 native ticks',()=>{const r=run();for(let i=0;i<90;i++){assert.equal(r.step().phase,'ATTACHED');r.observe(false)}assert.equal(r.step().phase,'RETURN')});
check('new visible target resets idle timer',()=>{const r=run();for(let i=0;i<89;i++){r.step();r.observe(false)}r.step();r.observe(true);for(let i=0;i<89;i++){assert.equal(r.step().phase,'ATTACHED');r.observe(false)}assert.equal(r.step().phase,'ATTACHED')});
check('blocked return uses actual fall-required state',()=>{const r=run(false);for(let i=0;i<90;i++){r.step();r.observe(false)}assert.equal(r.step().phase,'FALL_REQUIRED')});
check('stale observation rejected',()=>{const r=run();assert.equal(r.motion.observeAttachedTarget(0,false),false);r.step();assert.equal(r.motion.observeAttachedTarget(1,false),false)});
check('low HP still returns without idle',()=>{const r=run();r.step();r.observe(true);assert.equal(r.step(25).phase,'RETURN')});
check('duration cap still applies with continuous target',()=>{const r=run();for(let i=0;i<540;i++){assert.equal(r.step().phase,'ATTACHED');r.observe(true)}assert.equal(r.step().phase,'RETURN')});
console.log(n+' PASS');
