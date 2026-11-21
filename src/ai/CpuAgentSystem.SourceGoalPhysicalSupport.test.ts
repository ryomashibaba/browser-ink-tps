import {describe,expect,it,vi} from 'vitest';
import {Vec3} from 'playcanvas';
import {Team} from '../ink/types';
import {CpuAgentSystem} from './CpuAgentSystem';

/**
 * The exact real CpuAgentSystem.fixedUpdate tactical goal-selection method
 * with controlled adapter witnesses. This tests that SOURCE target adoption
 * no longer vetoes a genuine .22-.244m original Rapier-supported ramp foot.
 * It does NOT claim to simulate Recast Crowd, Rapier KCC or a 180s match.
 */
function fixture(physicalGapMeters:number,routeStartSnap=0){
  const foot=new Vec3(-5.829700946807861,4.607137680053711,-48.33926010131836);
  const destination=new Vec3(-4.4,4.55,-45.7);
  const agent={
    position:vi.fn(()=>foot.clone()),
    requestMoveTarget:vi.fn(),teleport:vi.fn(),
    resetMoveTarget:vi.fn()
  };
  const bot:any={
    id:'B2',team:Team.B,lifeState:'ACTIVE',hp:100,
    mobilityState:'GROUND',position:foot,
    previousPosition:foot.clone(),agent,
    role:'PAINTER',slot:1,
    jumpCooldownSeconds:0,jumpRespawnWindowSeconds:0,
    subCooldownSeconds:0,specialDecisionCooldownSeconds:0,
    thinkRemaining:0,paintRemaining:10,fireRemaining:10
  };
  const cpu:any=Object.create(CpuAgentSystem.prototype);
  cpu.bots=[bot];
  cpu.stage={metadata:{id:'undertow-t21d-partial-connectivity-qa'},
    solids:[{id:'UndertowT21D:right-low-route-ramp-negative-z'}]};
  cpu.goal=new Vec3();
  cpu.f3dSourceGoals={
    isLiveRejoinedSourceCpu:vi.fn(()=>true),
    chooseSourceGoal:vi.fn((_id:string,_foot:Vec3,out:Vec3)=>{
      out.copy(destination);return true;
    }),
    noteRealSourceKccApprovedStep:vi.fn()
  };
  cpu.phase14qF2RecoverableSteps=true;
  cpu.phase14qGroundCollision={
    syncRealCpuFoot:vi.fn(),
    syncActualHumanFoot:vi.fn(),
    sourceFootSupport:vi.fn(()=>({
      solidId:'UndertowT21D:right-low-route-ramp-negative-z',
      point:new Vec3(foot.x,foot.y-physicalGapMeters,foot.z)
    })),
    auditGroundStep:vi.fn(()=>({approved:true,cause:null,colliderOwnerIds:[]}))
  };
  cpu.navigation={
    auditPath:vi.fn((from:Vec3,to:Vec3)=>({
      querySuccess:true,reachedTarget:true,pointCount:2,
      startSnapDistanceMeters:routeStartSnap,endSnapDistanceMeters:0,
      endpointErrorMeters:0,
      nativePathPoints:[from,to]
    })),
    closestPoint:vi.fn((p:Vec3)=>p.clone()),
    auditNavMeshProjection:vi.fn((p:Vec3)=>({
      success:true,
      nearestPoint:{x:p.x,y:p.y,z:p.z},
      distanceMeters:0
    })),
    fixedUpdate:vi.fn()
  };
  cpu.updateResources=vi.fn();
  cpu.observeSourceGroundStep=vi.fn();
  cpu.b234ObserveRealCpu=vi.fn();
  cpu.syncStats=vi.fn();
  cpu.qaContinuity={
    observe:vi.fn(),
    snapshot:vi.fn(()=>({
      suspectedStallCount:0,longestStallSeconds:0,actors:[]
    }))
  };
  cpu.qaMotionGoals=new Map();
  cpu.sourceLastAdmittedRouteGoal=new Map();
  cpu.sourceLiveNativeMotionGoal=new Map();
  cpu.sourceCrowdRefreshedThisLife=new Set();
  cpu.sourceLastPhysicalBlockedTick=new Map();
  // Object.create skips field initializers in the real CPU constructor.
  cpu.sourceCrowdProjectionHold=new Map();
  cpu.sourceLastRecoveryAuditTick=new Map();
  cpu.sourceNativeMotionTick=0;
  cpu.b35OptInNativeRefresh=false;
  cpu.b35LastNativeTarget=new Map();
  cpu.b178RealSourceInkRecovery=false;
  cpu.b212NativeLeadEnabled=false;
  cpu.b181OriginalCombatStageRay=null;
  cpu.phase14qHumanCrowd=null;
  cpu.stats={cpuTacticalRetargets:0,cpuQaSuspectedStalls:0,
    cpuQaLongestStationarySeconds:0};
  const tick=()=>cpu.fixedUpdate(
    1/60,true,Team.A,new Vec3(10,3,0),false,true,false,false
  );
  return {cpu,bot,agent,foot,destination,tick};
}

describe('F4 center transfer physical-abort integration',()=>{
 const create=(jump:boolean,landedFoot:Readonly<{x:number;y:number;z:number}>)=>{
  const from=jump?([-2.58,0,3.36] as const):
   ([1.40,1.5,-1.84] as const);
  const to=jump?([-.55,1.5,2.4] as const):
   ([3.8,0,-4.6] as const);
  const bot:any={id:'A1',position:new Vec3(...from),
   mobilityState:'F4_CENTER_TRANSFER',jumpCooldownSeconds:0,
   agent:null,thinkRemaining:5};
  const cpu:any=Object.create(CpuAgentSystem.prototype);
  cpu.f4CenterFlights=new Map([['A1',{
   transfer:{from,to,continueTo:[-1,1.5,0] as const,jump},
   speedY:0,elapsed:.6
  }]]);
  cpu.phase14qGroundCollision={
   moveF4CenterTransfer:vi.fn(()=>({
    foot:landedFoot,grounded:true
   })),
   syncRealCpuFoot:vi.fn()
  };
  const agent={id:'REJOINED_NATIVE_CROWD'};
  cpu.navigation={
   auditPath:vi.fn(()=>({
    querySuccess:true,reachedTarget:true,pointCount:2,
    startSnapDistanceMeters:0,endSnapDistanceMeters:0
   })),
   addAgent:vi.fn(()=>agent)
  };
  cpu.f3dSourceGoals={
   noteF4CenterTakeoffAbort:vi.fn(),noteF4CenterLanding:vi.fn()
  };
  return {cpu,bot,agent,from};
 };
 it('requeues a verified return to its own original takeoff without moving the CPU',()=>{
  const from={x:-2.58,y:0,z:3.36};
  const {cpu,bot,agent}=create(true,from);
  cpu.advanceF4CenterTransfer(bot,1/60);
  expect(bot.position).toMatchObject(from);
  expect(bot.agent).toBe(agent);
  expect(bot.mobilityState).toBe('GROUND');
  expect(bot.jumpCooldownSeconds).toBe(.75);
  expect(cpu.f4CenterFlights.size).toBe(0);
  expect(cpu.f3dSourceGoals.noteF4CenterTakeoffAbort)
   .toHaveBeenCalledExactlyOnceWith('A1');
  expect(cpu.f3dSourceGoals.noteF4CenterLanding).not.toHaveBeenCalled();
 });
 it('cannot mistake the same-height floor a meter away for the original takeoff',()=>{
  const {cpu,bot}=create(true,{x:-1.58,y:0,z:3.36});
  cpu.advanceF4CenterTransfer(bot,1/60);
  expect(bot.mobilityState).toBe('F4_CENTER_TRANSFER');
  expect(bot.agent).toBeNull();
  expect(cpu.f4CenterFlights.has('A1')).toBe(true);
  expect(cpu.f3dSourceGoals.noteF4CenterTakeoffAbort).not.toHaveBeenCalled();
  expect(cpu.navigation.addAgent).not.toHaveBeenCalled();
 });
 it('holds the upper shoulder reservation after a real failed descent',()=>{
  const {cpu,bot,agent}=create(false,{x:1.40,y:1.5,z:-1.84});
  cpu.advanceF4CenterTransfer(bot,1/60);
  expect(bot.mobilityState).toBe('GROUND');
  expect(bot.agent).toBe(agent);
  expect(cpu.f4CenterFlights.size).toBe(0);
  expect(cpu.f3dSourceGoals.noteF4CenterTakeoffAbort).not.toHaveBeenCalled();
  expect(cpu.f3dSourceGoals.noteF4CenterLanding).not.toHaveBeenCalled();
 });
});

describe('SOURCE human-to-CPU live hit eligibility remains guarded',()=>{
 const live=(state:'GROUND'|'FIRST_DROP_FALL'|'JUMP_TRAVEL',hp=100,
  rejoined=true,lifeState:'ACTIVE'|'SPLATTED'='ACTIVE')=>{
  const cpu:any=Object.create(CpuAgentSystem.prototype);
  cpu.f3dSourceGoals={isLiveRejoinedSourceCpu:vi.fn(()=>rejoined)};
  cpu.f4CenterFlights=new Map();
  const bot:any={id:'B2',hp,lifeState,mobilityState:state,
   position:new Vec3(0,1,0)};
  return cpu.liveSourceCombatOpponent(bot);
 };
 it('allows a genuinely rejoined living SOURCE ground enemy',()=>{
  expect(live('GROUND')).toBe(true);
  expect(live('GROUND',100,false)).toBe(false);
 });
 it('holds dead, unjoined and non-F4 airborne source enemies',()=>{
  expect(live('GROUND',0)).toBe(false);
  expect(live('GROUND',100,true,'SPLATTED')).toBe(false);
  expect(live('FIRST_DROP_FALL')).toBe(false);
  expect(live('JUMP_TRAVEL')).toBe(false);
 });
});

describe('T21 V28 original Rapier supported foot -> genuine CPU tactical native goal',()=>{
  it('reissues actual original NavMesh goal at B2 .244m physical ramp support',()=>{
    const {cpu,bot,agent,destination,tick,foot}=fixture(.24438563346862807);
    tick();
    expect(agent.requestMoveTarget).toHaveBeenCalledOnce();
    expect(agent.requestMoveTarget.mock.calls[0]?.[0]).toMatchObject({
      x:destination.x,y:destination.y,z:destination.z
    });
    expect(cpu.sourceLastAdmittedRouteGoal.get('B2')).toEqual(destination);
    expect(cpu.sourceLiveNativeMotionGoal.get('B2')).toEqual({
      agent,goal:destination
    });
    expect(cpu.qaContinuity.observe.mock.lastCall?.[1]?.[0]?.expectsMotion)
      .toBe(true);
    expect(cpu.qaMotionGoals.get('B2')).toEqual(destination);
    expect(bot.position).toEqual(foot); // actor foot was never invented/moved
    expect(cpu.navigation.auditPath).toHaveBeenCalledOnce();
    expect(cpu.phase14qGroundCollision.auditGroundStep).toHaveBeenCalledOnce();
  });
  it('also recovers B4 .222m real supported original ramp foot',()=>{
    const {agent,tick}=fixture(.22215840578079238);
    tick();
    expect(agent.requestMoveTarget).toHaveBeenCalledOnce();
  });
  it('keeps a 0.251m physical support or failed original native route in HOLD',()=>{
    for(const [gap,startSnap] of ([
      [.251,0],[.24438563346862807,.201]
    ] as const)){
      const {agent,tick,cpu}=fixture(gap,startSnap);
      tick();
      expect(agent.requestMoveTarget).not.toHaveBeenCalled();
      expect(agent.resetMoveTarget).toHaveBeenCalledOnce();
      expect(cpu.sourceLastAdmittedRouteGoal.has('B2')).toBe(false);
      expect(cpu.sourceLiveNativeMotionGoal.has('B2')).toBe(false);
      expect(cpu.qaMotionGoals.has('B2')).toBe(false);
    }
  });
  it('clears historical MOVEMENT goal when SOURCE withholds its next goal',()=>{
    const {cpu,agent,tick}=fixture(.23);
    cpu.sourceLastAdmittedRouteGoal.set('B2',new Vec3(3,3,-42));
    cpu.f3dSourceGoals.chooseSourceGoal=vi.fn(()=>false);
    tick();
    expect(agent.requestMoveTarget).not.toHaveBeenCalled();
    expect(agent.resetMoveTarget).toHaveBeenCalledOnce();
    expect(cpu.sourceLastAdmittedRouteGoal.has('B2')).toBe(false);
    expect(cpu.sourceLiveNativeMotionGoal.has('B2')).toBe(false);
  });
  it('rejects a different-height Crowd endpoint even after TRUE native route audit passes',()=>{
    const {cpu,bot,agent,foot,tick}=fixture(.23);
    // Recast closestPoint is a NEW second query, not proof of the
    // previously audited terminal: wrong vertical layer must HOLD.
    cpu.navigation.auditNavMeshProjection=vi.fn((p:Vec3)=>({
      success:true,
      nearestPoint:{x:p.x,y:p.y+2.4,z:p.z},
      distanceMeters:2.4
    }));
    tick();
    expect(cpu.navigation.auditPath).toHaveBeenCalledOnce();
    expect(agent.requestMoveTarget).not.toHaveBeenCalled();
    expect(agent.resetMoveTarget).toHaveBeenCalledOnce();
    expect(cpu.sourceLastAdmittedRouteGoal.has('B2')).toBe(false);
    expect(cpu.sourceLiveNativeMotionGoal.has('B2')).toBe(false);
    expect(cpu.qaContinuity.observe.mock.lastCall?.[1]?.[0]?.expectsMotion)
      .toBe(false);
    expect(bot.position).toEqual(foot);
  });
  it('after true KCC reset preserves paid ink heading without reporting a live movement stall',()=>{
    const {cpu,bot,agent,foot,destination,tick}=fixture(.23);
    tick();
    expect(cpu.sourceLiveNativeMotionGoal.has('B2')).toBe(true);
    cpu.reconcileBlockedT21F2CrowdProxy(bot);
    expect(agent.resetMoveTarget).toHaveBeenCalledOnce();
    expect(cpu.qaMotionGoals.get('B2')).toEqual(destination);
    expect(cpu.sourceLiveNativeMotionGoal.has('B2')).toBe(false);
    // The next physical tick has no fresh authorized move submission;
    // it MUST NOT count stationary ink aim as pending Crowd movement.
    bot.thinkRemaining=1;
    tick();
    expect(cpu.qaContinuity.observe.mock.lastCall?.[1]?.[0]?.expectsMotion)
      .toBe(false);
    expect(bot.position).toEqual(foot);
  });
  it('does not misread old-agent native target as current after a real agent replacement',()=>{
    const {cpu,bot,agent,tick}=fixture(.23);
    tick();
    expect(cpu.sourceLiveNativeMotionGoal.get('B2')?.agent).toBe(agent);
    bot.agent={
      ...agent,requestMoveTarget:vi.fn(),resetMoveTarget:vi.fn()
    };
    bot.thinkRemaining=1;
    tick();
    expect(cpu.qaContinuity.observe.mock.lastCall?.[1]?.[0]?.expectsMotion)
      .toBe(false);
    expect(bot.agent.requestMoveTarget).not.toHaveBeenCalled();
    // A later SOURCE think reaudits the genuine physical foot and only
    // then grants a NEW agent its native movement request.
    bot.thinkRemaining=0;
    tick();
    expect(bot.agent.requestMoveTarget).toHaveBeenCalledOnce();
    expect(cpu.sourceLiveNativeMotionGoal.get('B2')?.agent).toBe(bot.agent);
  });

  it('does not turn failed native projection into an imaginary Crowd request',()=>{
    const {cpu,agent,tick}=fixture(.23);
    cpu.navigation.auditNavMeshProjection=vi.fn(()=>({
      success:false,nearestPoint:null,distanceMeters:null
    }));
    tick();
    expect(cpu.navigation.auditPath).toHaveBeenCalledOnce();
    expect(agent.requestMoveTarget).not.toHaveBeenCalled();
    expect(cpu.sourceLastAdmittedRouteGoal.size).toBe(0);
    expect(cpu.sourceLiveNativeMotionGoal.size).toBe(0);
  });
  it('submits the native-projected SAME-layer endpoint after strict SOURCE audit',()=>{
    const {cpu,agent,destination,tick}=fixture(.23);
    const endpoint={x:destination.x+.1,y:destination.y,z:destination.z};
    cpu.navigation.auditNavMeshProjection=vi.fn(()=>({
      success:true,nearestPoint:endpoint,distanceMeters:.1
    }));
    tick();
    expect(agent.requestMoveTarget).toHaveBeenCalledOnce();
    expect(agent.requestMoveTarget.mock.calls[0]?.[0]).toEqual(endpoint);
    expect(cpu.sourceLastAdmittedRouteGoal.get('B2')).toEqual(destination);
    expect(cpu.sourceLiveNativeMotionGoal.get('B2')?.goal)
      .toEqual(new Vec3(endpoint.x,endpoint.y,endpoint.z));
    expect(cpu.qaContinuity.observe.mock.lastCall?.[1]?.[0]?.expectsMotion)
      .toBe(true);
  });

});
