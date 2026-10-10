import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {Team} from '../../ink/types';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as original} from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES as probes,
 undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
import {UndertowPhase14ECpuHandoff} from './UndertowPhase14ECpuHandoff';
const dt=1/60;
const sides=['positive-z','negative-z'] as const;
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
describe('T21 Phase14E explicitly gated CPU nav -> Rapier -> Crowd handoff',()=>{
 it('intercepts TWO true Recast offmesh jumps then physically lands and rebinds navigation',()=>{
  const qa=undertowT21dConnectivityQaStage();
  const handler=new UndertowPhase14ECpuHandoff(qa,true);
  const nav=new RecastStageNavigation(qa,new PerformanceStats());
  const actors=sides.map(side=>{
   const source=probes.find(p=>p.id==='first-drop-'+side)!;
   expect(source.expectation).toBe('MUST_REACH');
   const agent=nav.addAgent(new Vec3(...source.from));
   agent.requestMoveTarget(nav.closestPoint(new Vec3(...source.to)));
   return {id:'QA-'+side,side,
    agent:agent as typeof agent|null,
    previous:{...agent.position()},
    intercepted:false,physicalFrames:0,maxStep:0,
    rawDiscontinuity:0,landed:false,resumed:false,navSnapMeters:Infinity};
  });
  for(let frame=0;frame<720;frame++){
   nav.fixedUpdate(dt);
   for(const a of actors){
    if(!a.intercepted&&a.agent){
     const next=a.agent.position();
     const original=auditPhase14CrowdFrame(a.previous,next,dt);
     if(handler.observe(a.id,a.previous,next,dt)){
      expect(original.suspectedInstantTransition).toBe(true);
      a.rawDiscontinuity=original.travelledMeters;
      expect(handler.getActiveDrop(a.id)?.solidId)
        .toBe('UndertowT21D:first-drop-landing-'+a.side);
      nav.removeAgent(a.agent);
      a.agent=null;a.intercepted=true;
     }else a.previous={...next};
    }
    if(a.intercepted&&!a.resumed){
     const result=handler.advance(a.id,dt);
     expect(result).not.toBeNull();
     expect(result!.continuous).toBe(true);
     expect(result!.runtimeActivationAuthorized).toBe(false);
     a.physicalFrames++;
     a.maxStep=Math.max(a.maxStep,result!.stepMeters);
     if(result!.landed){
      a.landed=result!.grounded;
      const target=new Vec3(result!.foot.x,result!.foot.y,result!.foot.z);
      const snapped=nav.closestPoint(target);
      a.navSnapMeters=Math.hypot(snapped.x-target.x,snapped.y-target.y,
       snapped.z-target.z);
      expect(a.navSnapMeters).toBeLessThanOrEqual(.65);
      a.agent=nav.addAgent(target);
      handler.cancel(a.id);
      a.resumed=true;
     }
    }
   }
   if(actors.every(a=>a.resumed))break;
  }
  for(const a of actors){
   console.log('T21_PHASE14E_CPU_REATTACH',JSON.stringify({
    side:a.side,intercepted:a.intercepted,
    rawJumpMeters:a.rawDiscontinuity,fallFrames:a.physicalFrames,
    fallSeconds:a.physicalFrames*dt,maxFrameStepMeters:a.maxStep,
    grounded:a.landed,rejoined:a.resumed,navSnapErrorMeters:a.navSnapMeters,
    actualFullCpuCombatAnimationValidated:false,
    runtimeActivationAuthorized:false
   }));
   expect(a.intercepted).toBe(true);
   expect(a.rawDiscontinuity).toBeGreaterThan(.5);
   expect(a.physicalFrames).toBeGreaterThan(20);
   expect(a.physicalFrames).toBeLessThan(150);
   expect(a.maxStep).toBeLessThan(.6);
   expect(a.landed).toBe(true);
   expect(a.resumed).toBe(true);
   if(a.agent)nav.removeAgent(a.agent);
  }
  expect(handler.activeCount).toBe(0);
  handler.reset();
  expect(original.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
 });
 it('refuses T20 adapter injection and altered or unapproved T21 source',()=>{
  const qa=undertowT21dConnectivityQaStage();
  expect(()=>new UndertowPhase14ECpuHandoff(qa,false)).toThrow('NOT_OPTED_IN');
  expect(()=>new UndertowPhase14ECpuHandoff(PRODUCTION_STAGE_DEFINITION,true))
   .toThrow('NOT_OPTED_IN');
  const changed={...qa,solids:qa.solids.map(s=>s.id===
    'UndertowT21D:first-drop-landing-positive-z'?{...s}:s)};
  expect(()=>new UndertowPhase14ECpuHandoff(changed,true))
   .toThrow('ORIGINAL_SOURCE_IDENTITY_DRIFT');
  const handler=new UndertowPhase14ECpuHandoff(qa,true);
  expect(()=>new CpuAgentSystem(
   null as never,null as never,null as never,null as never,
   null as never,PRODUCTION_STAGE_DEFINITION,Team.A,handler))
   .toThrow('PRODUCTION_CPU_ADAPTER_FORBIDDEN');
  expect(handler.observe('UNKNOWN',{x:0,y:7.5,z:0},{x:0,y:3,z:0},dt))
   .toBe(false);
  handler.cancel('MISSING');
  handler.reset();
  expect(handler.activeCount).toBe(0);
 });
});
