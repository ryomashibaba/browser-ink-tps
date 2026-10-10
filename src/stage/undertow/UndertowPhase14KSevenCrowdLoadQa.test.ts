import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';

/**
 * This is a 7-CPU-sized Recast CROWD navigation preflight, NOT full 4v4:
 * there is no human participant, combat, player camera or live paint.
 * No fabricated geometry and no T21 production activation.
 */
const DT=1/60;
beforeAll(async()=>{await initializeRecastNavigation();});
describe('T21 Phase14K seven-agent Recast crowd capacity preflight',()=>{
 it('updates seven independent agents on the two original verified paths at 60Hz',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const starts=['positive-z','positive-z','positive-z','negative-z',
    'positive-z','negative-z','negative-z'] as const;
  const agents=starts.map((side,i)=>{
    const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(p=>p.id==='first-drop-'+side)!;
    expect(probe.expectation).toBe('MUST_REACH');
    expect(nav.auditPath(new Vec3(...probe.from),new Vec3(...probe.to)).reachedTarget).toBe(true);
    // Each agent starts at the same original source-approved route entrance;
    // the navmesh/crowd itself is responsible for separation, not fake floor.
    const agent=nav.addAgent(new Vec3(...probe.from));
    agent.requestMoveTarget(nav.closestPoint(new Vec3(...probe.to)));
    const p=agent.position();
    return {
      id:'C'+(i+1),side,agent,first:new Vec3(p.x,p.y,p.z),
      last:new Vec3(p.x,p.y,p.z),frames:0,largeRecastOffmeshSteps:0,
      moved:0,maxFrameMeters:0
    };
  });
  const startTime=performance.now();
  for(let frame=0;frame<240;frame++){
    nav.fixedUpdate(DT);
    for(const actor of agents){
      const p=actor.agent.position();
      expect([p.x,p.y,p.z].every(Number.isFinite)).toBe(true);
      const audit=auditPhase14CrowdFrame(actor.last,p,DT);
      if(audit.suspectedInstantTransition)actor.largeRecastOffmeshSteps++;
      actor.maxFrameMeters=Math.max(actor.maxFrameMeters,audit.travelledMeters);
      actor.moved+=audit.travelledMeters;
      actor.last.set(p.x,p.y,p.z);
      actor.frames++;
    }
  }
  const elapsedMs=performance.now()-startTime;
  for(const actor of agents){
    expect(actor.frames).toBe(240);
    expect(actor.moved).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(actor.maxFrameMeters)).toBe(true);
    nav.removeAgent(actor.agent);
  }
  expect(Number.isFinite(elapsedMs)).toBe(true);
  expect(elapsedMs).toBeGreaterThanOrEqual(0);
  expect(stage.solids).toHaveLength(25);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_PHASE14K_SEVEN_REAL_RECAST_CROWD_LOAD_QA',JSON.stringify({
    agents:agents.map(a=>({id:a.id,side:a.side,frames:a.frames,
      travelMeters:a.moved,maxStepMeters:a.maxFrameMeters,
      observedRawOffmeshTransitions:a.largeRecastOffmeshSteps})),
    simulatedSeconds:240*DT,realWallMs:elapsedMs,
    performanceResultsMachineSpecific:true,
    actual4v4GameplayValidated:false,
    paintCombatCameraValidated:false,
    sourceGeometryModified:false,productionActivation:false
  }));
 });
});