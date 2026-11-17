import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {CpuAgentSystem} from './CpuAgentSystem';

/** Run the real CPU recovery method with SOURCE-registered authority
 * injected; never construct a fake live Recast/Rapier world or claim
 * this unit fixture proves a natural 180-second SOURCE playthrough. */
function fixture(){
 const foot=new Vec3(0,3,0);
 const goal=new Vec3(5,3,0);
 const agent={
  position:vi.fn(()=>foot.clone()),teleport:vi.fn(),resetMoveTarget:vi.fn()
 };
 const bot:any={
  id:'B1',hp:100,lifeState:'ACTIVE',mobilityState:'GROUND',
  position:foot,agent,thinkRemaining:1
 };
 const cpu:any=Object.create(CpuAgentSystem.prototype);
 cpu.bots=[bot];
 cpu.f3dSourceGoals={isLiveRejoinedSourceCpu:vi.fn(()=>true)};
 cpu.phase14qF2RecoverableSteps=true;
 cpu.stage={metadata:{id:'undertow-t21d-partial-connectivity-qa'},
  solids:[{id:'ORIGINAL_REGISTERED_SOLID'}]};
 cpu.sourceNativeMotionTick=600;
 cpu.sourceCrowdRefreshedThisLife=new Set<string>();
 cpu.sourceLastPhysicalBlockedTick=new Map<string,number>();
 cpu.sourceLastRecoveryAuditTick=new Map<string,number>();
 cpu.sourceLastAdmittedRouteGoal=new Map([['B1',goal]]);
 cpu.qaMotionGoals=new Map([['B1',goal.clone()]]);
 cpu.b35LastNativeTarget=new Map([['B1',{agent,goal,repeat:1}]]);
 cpu.phase14qGroundCollision={
  sourceFootSupport:vi.fn(()=>({
   solidId:'ORIGINAL_REGISTERED_SOLID',point:foot.clone()
  }))
 };
 cpu.navigation={
  auditNavMeshProjection:vi.fn(()=>({
   success:true,nearestPoint:{x:foot.x,y:foot.y,z:foot.z},
   distanceMeters:0
  })),
  auditPath:vi.fn((from:Vec3,to:Vec3)=>({
   querySuccess:true,reachedTarget:true,pointCount:2,
   nativePathPoints:[from,to],
   startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   endpointErrorMeters:0
  }))
 };
 const report:any={actors:[{
  id:'B1',stationarySeconds:5.1,suspectedNavigationStall:true
 }]};
 return {cpu,bot,agent,foot,goal,report};
}

describe('T21 V28 CPU actual method: bounded real-foot SOURCE steering recovery',()=>{
 it('reaudits original Rapier foot and native route; refreshes only Crowd proxy once',()=>{
  const {cpu,bot,agent,foot,goal,report}=fixture();
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(cpu.phase14qGroundCollision.sourceFootSupport)
   .toHaveBeenCalledWith('B1',foot);
  expect(cpu.navigation.auditPath).toHaveBeenCalledTimes(1);
  expect(cpu.navigation.auditPath.mock.calls[0][0]).toEqual(foot);
  expect(cpu.navigation.auditPath.mock.calls[0][1]).toEqual(goal);
  expect(agent.teleport).toHaveBeenCalledOnce();
  expect(agent.teleport).toHaveBeenCalledWith(
    {x:foot.x,y:foot.y,z:foot.z});
  expect(agent.resetMoveTarget).toHaveBeenCalledOnce();
  expect(bot.position).toEqual(foot);
  expect(cpu.b35LastNativeTarget.has('B1')).toBe(false);
  expect(cpu.qaMotionGoals.has('B1')).toBe(false);
  expect(cpu.sourceCrowdRefreshedThisLife.has('B1')).toBe(true);
  expect(bot.thinkRemaining).toBeLessThan(.08);
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).toHaveBeenCalledTimes(1);
 });
 it('acts on an early real 72-tick idle without changing the five-second QA verdict',()=>{
  const {cpu,agent,report}=fixture();
  report.actors[0].stationarySeconds=1.2;
  report.actors[0].suspectedNavigationStall=false;
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).toHaveBeenCalledOnce();
 });
 it('throttles denied expensive checks and retries only after 90 real native ticks',()=>{
  const {cpu,agent,report}=fixture();
  cpu.phase14qGroundCollision.sourceFootSupport.mockReturnValue(null);
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(cpu.phase14qGroundCollision.sourceFootSupport).toHaveBeenCalledOnce();
  cpu.sourceNativeMotionTick+=60;
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(cpu.phase14qGroundCollision.sourceFootSupport).toHaveBeenCalledOnce();
  cpu.sourceNativeMotionTick+=30;
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(cpu.phase14qGroundCollision.sourceFootSupport).toHaveBeenCalledTimes(2);
  expect(agent.teleport).not.toHaveBeenCalled();
 });
 it('never reseeds a real Rapier-blocked actor even after the QA 5s stall',()=>{
  const {cpu,agent,report}=fixture();
  cpu.sourceLastPhysicalBlockedTick.set('B1',590);
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).not.toHaveBeenCalled();
  expect(cpu.navigation.auditPath).not.toHaveBeenCalled();
 });
 it('never manufactures an alternate registered floor or opposite navmesh layer',()=>{
  const {cpu,agent,report}=fixture();
  cpu.phase14qGroundCollision.sourceFootSupport.mockReturnValue({
   solidId:'NOT_ORIGINAL',point:new Vec3(0,3,0)
  });
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).not.toHaveBeenCalled();
  cpu.phase14qGroundCollision.sourceFootSupport.mockReturnValue({
   solidId:'ORIGINAL_REGISTERED_SOLID',point:new Vec3(0,5,0)
  });
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).not.toHaveBeenCalled();
  cpu.phase14qGroundCollision.sourceFootSupport.mockReturnValue({
   solidId:'ORIGINAL_REGISTERED_SOLID',point:new Vec3(0,3,0)
  });
  cpu.navigation.auditNavMeshProjection.mockReturnValue({
   success:true,nearestPoint:{x:0,y:5,z:0},distanceMeters:0
  });
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).not.toHaveBeenCalled();
 });
 it('HOLDs a projected wrong-floor path regardless of reachedTarget flag',()=>{
  const {cpu,agent,report}=fixture();
  cpu.navigation.auditPath.mockImplementation((from:Vec3,to:Vec3)=>({
   querySuccess:true,reachedTarget:true,pointCount:2,
   nativePathPoints:[from,new Vec3(to.x,to.y+2.4,to.z)],
   startSnapDistanceMeters:0,endSnapDistanceMeters:0,
   endpointErrorMeters:0
  }));
  cpu.tryRefreshStalledOriginalSourceCrowd(report);
  expect(agent.teleport).not.toHaveBeenCalled();
  expect(cpu.sourceCrowdRefreshedThisLife.has('B1')).toBe(false);
 });
 it('does not activate on high-spawn, SPLATTED, or missing native goal',()=>{
  for(const reason of ['HIGH_SPAWN','SPLATTED','NO_GOAL']){
   const {cpu,bot,agent,report}=fixture();
   if(reason==='HIGH_SPAWN')
    cpu.f3dSourceGoals.isLiveRejoinedSourceCpu=()=>false;
   if(reason==='SPLATTED')bot.lifeState='SPLATTED';
   if(reason==='NO_GOAL')cpu.qaMotionGoals.clear();
   cpu.tryRefreshStalledOriginalSourceCrowd(report);
   expect(agent.teleport).not.toHaveBeenCalled();
  }
 });
});
