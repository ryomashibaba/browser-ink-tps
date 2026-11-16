import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {UndertowF3SourceTraffic} from './UndertowF3SourceTraffic';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {describe,it,expect} from 'vitest';
import {b421RealEnemyStandoff} from './B421RealEnemyStandoff';
const p=(x:number,z=40,y=4)=>({x,y,z});
describe('B421 native physical opponent standoff source-only',()=>{
 it('stops 2 meters before a real CPU on each original side',()=>{
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(4),1)).toEqual(p(2));
  expect(b421RealEnemyStandoff(
   [p(0,-40),p(2,-40),p(4,-40)],p(4,-40),-1)).toEqual(p(2,-40));
 });
 it('never aims the movement into the real opponent capsule',()=>{
  expect(b421RealEnemyStandoff([p(3),p(4)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(6),1)).toBeNull();
 });
 it('refuses fake central connections, nonoriginal height, nonfinite position',()=>{
  expect(b421RealEnemyStandoff(
   [p(0),p(2,32),p(4,-40)],p(4,-40),1)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(2),p(4)],p(4,-40),1)).toBeNull();
  expect(b421RealEnemyStandoff(
   [p(0),p(2,40,6),p(4)],p(4),1)).toBeNull();
  expect(b421RealEnemyStandoff(
   [p(0),p(NaN),p(4)],p(4),1)).toBeNull();
 });
});

// Full gameplay batch: SOURCE path + actual weapon reach + native stage cover.
// These are PURE proposal tests, not fabricated runtime enemy encounters.
describe('source-licensed real-weapon engagement positions',()=>{
 const path=[p(0),p(4),p(8),p(12)];
 const weapon={
  nativeWeaponRangeMeters:12,
  nativeMuzzleHeightMeters:1.1,
  enemyHitHeightMeters:.68,
  originalStageRayBlocked:(_from:{x:number},_to:{x:number})=>false
 };
 it('uses an existing Recast path point in real weapon range, not the enemy capsule',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1,weapon)).toEqual(p(4));
  expect(b421RealEnemyStandoff(path.map(q=>p(q.x,-40)),p(12,-40),-1,weapon))
   .toEqual(p(4,-40));
 });
 it('selects a nearer real path point when original Rapier blocks longer sight',()=>{
  const result=b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,originalStageRayBlocked:from=>from.x<6
  });
  expect(result).toEqual(p(6));
 });
 it('does not claim a ranged sight when every source ray is blocked',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,originalStageRayBlocked:()=>true
  })).toEqual(p(10));
 });
 it('offers existing rising Recast path standoff without inventing actor motion',()=>{
  const live={x:4,y:4.5,z:-40};
  const path=[{x:0,y:3,z:-40},{x:2,y:3.5,z:-40},live];
  expect(b421RealEnemyStandoff(path,live,-1)).toEqual(path[1]);
  expect(b421RealEnemyStandoff(path,{x:4,y:7,z:-40},-1)).toBeNull();
  expect(b421RealEnemyStandoff(path.map(q=>({...q,z:40})),
    {...live,z:40},-1)).toBeNull();
 });
 it('preserves the strict 2m melee and legacy behavior',()=>{
  expect(b421RealEnemyStandoff(path,p(12),1)).toEqual(p(10));
  expect(b421RealEnemyStandoff(path,p(12),1,{
   ...weapon,nativeWeaponRangeMeters:2.4
  })).toEqual(p(10));
 });
 it('never invents a path endpoint, crossed side or unverified height',()=>{
  expect(b421RealEnemyStandoff(path,p(13),1,weapon)).toBeNull();
  expect(b421RealEnemyStandoff(path,p(12,-40),1,weapon)).toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(6,32),p(12)],p(12),1,weapon))
   .toBeNull();
  expect(b421RealEnemyStandoff([p(0),p(6,40,8),p(12)],p(12),1,weapon))
   .toBeNull();
 });
});


describe('SOURCE CPU pursuit uses physical SQUID height, no imaginary torso',()=>{
 it('consults native original cover at human current hit sphere, never CPU SQUID',()=>{
  const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
  traffic.enableB192HumanCombat=true;traffic.freeCombat=true;
  traffic.b192NativeHumanFoot=new Vec3();
  const rays:Array<{from:Vec3;to:Vec3}>=[];
  traffic.physics={castStageSegment:(from:Vec3,to:Vec3)=>{
   rays.push({from:from.clone(),to:to.clone()});
   return to.y>=4.6?{distance:2.5}:null;
  }};
  const path=[new Vec3(0,4,-40),new Vec3(4,4,-40),
   new Vec3(8,4,-40),new Vec3(12,4,-40)];
  const actor:any={id:'B1',team:Team.B,weaponId:'pulse-sprayer'};
  traffic.prepare(110,{x:12,y:4,z:-40,grounded:true,active:true,mode:'HUMAN'});
  traffic.chooseActualSourceCombatGoal(path,path[3],-1,actor,true);
  expect(rays.some(row=>row.to.y===4.68)).toBe(true);
  rays.length=0;
  traffic.prepare(111,{x:12,y:4,z:-40,grounded:true,active:true,mode:'SQUID'});
  const valid=traffic.chooseActualSourceCombatGoal(path,path[3],-1,actor,true);
  expect(valid).not.toBeNull();
  expect(rays.some(row=>Math.abs(row.to.y-
   (4+PLAYER_CHARACTER_PHYSICS.squidRadiusMeters))<1e-6)).toBe(true);
  expect(rays.every(row=>row.to.y<4.6)).toBe(true);
  // The same SOURCE CPU-vs-CPU target does not inherit human shape.
  rays.length=0;
  traffic.chooseActualSourceCombatGoal(path,path[3],-1,actor,false);
  expect(rays.some(row=>row.to.y===4.68)).toBe(true);
 });
 it('does not retain an invalid SQUID state after the native input ends',()=>{
  const traffic:any=Object.create(UndertowF3SourceTraffic.prototype);
  traffic.enableB192HumanCombat=true;traffic.freeCombat=true;
  traffic.b192NativeHumanFoot=new Vec3();
  traffic.prepare(120,{x:0,y:4,z:-40,active:true,grounded:true,mode:'SQUID'});
  expect(traffic.b192HumanAliveGrounded).toBe(true);
  expect(traffic.b192NativeHumanMode).toBe('SQUID');
  traffic.prepare(121,{x:0,y:4,z:-40,active:false,grounded:false,mode:'SQUID'});
  expect(traffic.b192HumanAliveGrounded).toBe(false);
  expect(traffic.b192NativeHumanMode).toBe('HUMAN');
  traffic.prepare(122,{x:0,y:4,z:-40,active:true,grounded:true});
  expect(traffic.b192NativeHumanMode).toBe('HUMAN');
 });
});
