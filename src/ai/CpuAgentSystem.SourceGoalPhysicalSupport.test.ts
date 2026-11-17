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

describe('T21 V28 original Rapier supported foot -> genuine CPU tactical native goal',()=>{
  it('reissues actual original NavMesh goal at B2 .244m physical ramp support',()=>{
    const {cpu,bot,agent,destination,tick,foot}=fixture(.24438563346862807);
    tick();
    expect(agent.requestMoveTarget).toHaveBeenCalledOnce();
    expect(agent.requestMoveTarget).toHaveBeenCalledWith(destination);
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
    cpu.navigation.closestPoint=vi.fn((p:Vec3)=>({
      x:p.x,y:p.y+2.4,z:p.z
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

});
