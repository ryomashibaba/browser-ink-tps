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
