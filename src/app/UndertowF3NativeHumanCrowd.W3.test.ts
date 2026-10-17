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
 it('withholds an off-seal projected neighbour, then attaches and safely detaches',()=>{
  const rig=nativeRig();
  const crowd=new UndertowF3NativeHumanCrowd(rig.nav as never,rig.stage as never);
  const foot={x:0,y:7.525,z:57.7};
  crowd.syncActualPlayerFoot(foot);
  crowd.sealAfterCrowdUpdate(foot);
  const guard=(crowd.snapshot as unknown as {
   projectionGuard:{status:string;horizontalMeters:number;verticalMeters:number;
    threeDMeters:number;limitHorizontalMeters:number;productionCertified:boolean};
   w3GuardedTicks:number;crowdAvoidanceCertified:boolean;
  });
  expect(crowd.snapshot.active).toBe(false);
  expect(guard.projectionGuard.status).toBe('WITHHELD_NAV_PROJECTION_HORIZONTAL');
  expect(guard.projectionGuard.horizontalMeters).toBeCloseTo(.106,5);
  expect(guard.projectionGuard.verticalMeters).toBeCloseTo(.075,5);
  expect(guard.projectionGuard.threeDMeters).toBeLessThan(.22);
  expect(guard.projectionGuard.limitHorizontalMeters).toBe(.065);
  expect(guard.w3GuardedTicks).toBe(1);
  expect(guard.crowdAvoidanceCertified).toBe(false);
  expect(rig.added()).toBe(0);
  expect(crowd.snapshot.fakeHumanPhysicalActors).toBe(0);
  expect(crowd.snapshot.playerFootMoved).toBe(false);
  expect(crowd.snapshot.sourceNavmeshChanged).toBe(false);
  // Reuse the original NavMesh, with a physically compatible projection.
  rig.setOffset(.02,0);
  crowd.syncActualPlayerFoot(foot);
  crowd.sealAfterCrowdUpdate(foot);
  expect(crowd.snapshot.active).toBe(true);
  expect(rig.added()).toBe(1);
  // Original offset returns: only the passive Crowd proxy is removed.
  rig.setOffset(.146,.087);
  crowd.syncActualPlayerFoot(foot);
  crowd.sealAfterCrowdUpdate(foot);
  expect(crowd.snapshot.active).toBe(false);
  expect(rig.removed()).toBe(1);
  crowd.dispose();
 });
 it('fails closed on an unrelated game stage',()=>{
  const rig=nativeRig();
  expect(()=>new UndertowF3NativeHumanCrowd(rig.nav as never,
   {...rig.stage,metadata:{id:'other-stage'}} as never))
   .toThrow(/PRODUCTION_ONLY/);
 });
});
