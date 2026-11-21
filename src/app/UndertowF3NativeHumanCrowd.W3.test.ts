import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {UndertowF3NativeHumanCrowd} from './UndertowF3NativeHumanCrowd';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as frozen}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';

function nativeRig(){
 let dx=.106,dy=.075,agentsAdded=0,agentsRemoved=0;
 const nav={
  closestPoint:(foot:Vec3)=>new Vec3(foot.x+dx,foot.y+dy,foot.z),
  addAgent:(initial:Vec3)=>{
   agentsAdded++;
   let pos=new Vec3(initial.x,initial.y,initial.z);
   return {
    position:()=>pos,
    teleport:(next:Vec3)=>{pos=new Vec3(next.x,next.y,next.z);},
    resetMoveTarget:vi.fn(),
    updateParameters:vi.fn()
   };
  },
  removeAgent:()=>{agentsRemoved++;}
 };
 const stage={metadata:{id:'undertow-t21d-partial-connectivity-qa'},
  solids:frozen.solids,paintSurfaces:frozen.paintSurfaces,
  navigationLinks:frozen.navigationLinks};
 return {nav,stage,setOffset:(x:number,y:number)=>{dx=x;dy=y;},
  added:()=>agentsAdded,removed:()=>agentsRemoved};
}

describe('W3 isolated human Crowd projection preflight',()=>{
 it('withholds a real hazardous high-spawn rim, but admits safe original interior feet',()=>{
  const rig=nativeRig();
  const crowd=new UndertowF3NativeHumanCrowd(rig.nav as never,rig.stage as never);
  // This exact real Windows foot triggered a >111m eighth-proxy drift.
  // Modern F3C deliberately withholds ONLY the passive steering agent,
  // not Rapier HUMAN, any CPU capsule, original NavMesh or SOURCE solids.
  const realRim={x:4.777252197265625,y:7.525097732543945,
   z:57.74844741821289};
  crowd.syncActualPlayerFoot(realRim,true);
  expect(crowd.snapshot.active).toBe(false);
  expect(crowd.snapshot.originalHighSpawnPassiveProxyGate?.withheld).toBe(true);
  expect(crowd.snapshot.originalHighSpawnProxyWithheldNativeTicks).toBe(1);
  expect(rig.added()).toBe(0);
  const interior={x:.01693030074238777,y:7.525,z:67.87103271484375};
  // A large *real* foot displacement cannot grant an instant 60Hz proxy.
  crowd.syncActualPlayerFoot(interior,true);
  expect(crowd.snapshot.active).toBe(false);
  crowd.syncActualPlayerFoot(interior,true);
  expect(crowd.snapshot.originalHighSpawnPassiveProxyGate?.withheld).toBe(false);
  expect(crowd.snapshot.active).toBe(true);
  expect(rig.added()).toBe(1);
  crowd.sealAfterCrowdUpdate(interior);
  // Current SOURCE authority verifies actual 3D native projection <=.22m.
  // A .36m off-nav projection removes only the passive steering proxy.
  rig.setOffset(.36,0);
  crowd.syncActualPlayerFoot(interior,true);
  expect(crowd.snapshot.active).toBe(false);
  expect(rig.removed()).toBe(1);
  rig.setOffset(.02,0);
  crowd.syncActualPlayerFoot(interior,true);
  expect(crowd.snapshot.active).toBe(true);
  expect(rig.added()).toBe(2);
  crowd.syncActualPlayerFoot(interior,false);
  expect(crowd.snapshot.active).toBe(false);
  expect(rig.removed()).toBe(2);
  expect(crowd.snapshot.fakeHumanPhysicalActors).toBe(0);
  expect(crowd.snapshot.playerFootMoved).toBe(false);
  expect(crowd.snapshot.sourceNavmeshChanged).toBe(false);
  expect(crowd.snapshot.productionAuthorized).toBe(false);
  crowd.dispose();
 });
 it('fails closed on an unrelated game stage',()=>{
  const rig=nativeRig();
  expect(()=>new UndertowF3NativeHumanCrowd(rig.nav as never,
   {...rig.stage,metadata:{id:'other-stage'}} as never))
   .toThrow(/PRODUCTION_ONLY/);
 });
});
