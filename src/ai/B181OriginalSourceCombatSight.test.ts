import {describe,expect,it,vi} from 'vitest';
import {chooseB181OriginalSourceSight as choose,
 b182ReuseNativeSight as reuse} from './B181OriginalSourceCombatSight';
const origin={x:0,y:4,z:0};
describe('B181 original-source combat visibility',()=>{
 it('chooses visible farther CPU instead of nearer original stage cover',()=>{
   const ray=vi.fn((_:unknown,to:{x:number})=>to.x===2);
   expect(choose(origin,[
     {id:'B1',body:{x:2,y:4,z:0}},
     {id:'B2',body:{x:4,y:4,z:0}}
   ],ray)).toMatchObject({actorId:'B2',rays:2,coverRejects:1});
   expect(ray).toHaveBeenCalledTimes(2);
 });
 it('allows actual HUMAN target priority only if clear and nearby',()=>{
   expect(choose(origin,[
     {id:'B1',body:{x:3,y:4,z:0}},
     {id:'HUMAN',body:{x:7,y:4,z:0}}
   ],()=>false,'HUMAN').actorId).toBe('HUMAN');
 });
 it('rejects different original floor levels, bad coordinates and far enemies',()=>{
   const ray=vi.fn(()=>false);
   expect(choose(origin,[
     {id:'B1',body:{x:2,y:10,z:0}},
     {id:'B2',body:{x:45,y:4,z:0}},
     {id:'B3',body:{x:NaN,y:4,z:0}}
   ],ray).target).toBeNull();
   expect(ray).not.toHaveBeenCalled();
 });
 it('never invents a clear shot through cover',()=>{
   expect(choose(origin,[{id:'B1',body:{x:4,y:4,z:0}}],
    ()=>true)).toMatchObject({actorId:null,rays:1,coverRejects:1});
   expect(choose({x:NaN,y:1,z:1},[],()=>false).target).toBeNull();
 });
});

// Genuine actor-lifecycle cache guards, not fabricated projectile impacts.
describe('B182 native source combat sight cache safety',()=>{
 const old={frame:100,actorId:'B1',
  origin:{x:0,y:4,z:0},target:{x:4,y:4,z:0}};
 it('keeps a moving living native CPU point, not a frozen aim coordinate',()=>{
  expect(reuse(old,103,{x:.02,y:4,z:0},[
   {id:'B1',body:{x:4.1,y:4,z:0}}
  ])).toEqual({x:4.1,y:4,z:0});
 });
 it('rejects a splatted, missing or unrejoined actor from caller candidates',()=>{
  expect(reuse(old,101,{x:0,y:4,z:0},[])).toBeNull();
  expect(reuse(old,101,{x:0,y:4,z:0},[
   {id:'B2',body:{x:4,y:4,z:0}}
  ])).toBeNull();
 });
 it('rechecks real Rapier cover after significant movement or eight ticks',()=>{
  expect(reuse(old,101,{x:0,y:4,z:.4},[
   {id:'B1',body:{x:4,y:4,z:0}}
  ])).toBeNull();
  expect(reuse(old,102,{x:0,y:4,z:0},[
   {id:'B1',body:{x:4.4,y:4,z:0}}
  ])).toBeNull();
  expect(reuse(old,108,{x:0,y:4,z:0},[
   {id:'B1',body:{x:4,y:4,z:0}}
  ])).toBeNull();
 });
 it('never infers line of sight across height or invalid native coordinates',()=>{
  expect(reuse(old,101,{x:0,y:4,z:0},[
   {id:'B1',body:{x:4,y:7.5,z:0}}
  ])).toBeNull();
  expect(reuse(old,101,{x:NaN,y:4,z:0},[
   {id:'B1',body:{x:4,y:4,z:0}}
  ])).toBeNull();
 });
});

describe('B383 actual native source weapon-reachable enemy prioritization',()=>{
 it('skips visible preferred HUMAN outside the real equipped Dualies 9.8m envelope',()=>{
  const ray=vi.fn(()=>false);
  const combat=choose(origin,[
   {id:'HUMAN',body:{x:11.8,y:4,z:0}},
   {id:'B1',body:{x:7.6,y:4,z:0}}
  ],ray,'HUMAN',9.8);
  expect(combat).toMatchObject({actorId:'B1',rays:1,coverRejects:0});
  // One fewer original Rapier ray: the unreachable target is never probed.
  expect(ray).toHaveBeenCalledTimes(1);
  // Preserve the independent B181 special/sub target semantics.
  expect(choose(origin,[
   {id:'HUMAN',body:{x:11.8,y:4,z:0}},
   {id:'B1',body:{x:7.6,y:4,z:0}}
  ],()=>false,'HUMAN').actorId).toBe('HUMAN');
 });
 it('never treats registered-source cover as a shootable nearby target',()=>{
  const blocked=vi.fn((_:unknown,to:{x:number})=>to.x===5);
  const result=choose(origin,[
   {id:'B1',body:{x:5,y:4,z:0}},
   {id:'HUMAN',body:{x:12,y:4,z:0}}
  ],blocked,null,9.8);
  expect(result).toMatchObject({actorId:null,target:null,rays:1,coverRejects:1});
 });
 it('accepts the closest actual in-range living candidate while retaining original actor priorities',()=>{
  const enemies=[
   {id:'B1',body:{x:3,y:4,z:0}},
   {id:'HUMAN',body:{x:8,y:4,z:0}}
  ];
  expect(choose(origin,enemies,()=>false,null,9.8).actorId).toBe('B1');
  expect(choose(origin,enemies,()=>false,'HUMAN',9.8).actorId).toBe('HUMAN');
  expect(choose(origin,enemies,()=>false,'HUMAN',3.5).actorId).toBe('B1');
 });
 it('cannot reuse a formerly visible cache contact after leaving actual weapon range',()=>{
  const old={frame:200,actorId:'HUMAN',
   origin:{x:0,y:4,z:0},target:{x:9.7,y:4,z:0}};
  expect(reuse(old,202,{x:0,y:4,z:0},[
   {id:'HUMAN',body:{x:9.86,y:4,z:0}}
  ],9.8)).toBeNull();
  expect(reuse(old,202,{x:0,y:4,z:0},[
   {id:'HUMAN',body:{x:9.79,y:4,z:0}}
  ],9.8)).toEqual({x:9.79,y:4,z:0});
 });
 it('invalid attack ranges fail closed, without granting reach or target',()=>{
  const enemy=[{id:'HUMAN',body:{x:3,y:4,z:0}}];
  expect(choose(origin,enemy,()=>false,null,NaN).actorId).toBeNull();
  expect(choose(origin,enemy,()=>false,null,0).actorId).toBeNull();
  const old={frame:30,actorId:'HUMAN',origin,target:enemy[0]!.body};
  expect(reuse(old,31,origin,enemy,Infinity)).toBeNull();
 });
});
