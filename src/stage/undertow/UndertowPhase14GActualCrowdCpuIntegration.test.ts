import {Entity, Vec3} from 'playcanvas';
import type {CrowdAgent} from 'recast-navigation';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {initializeRecastNavigation, RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES,undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
import {UndertowPhase14ECpuHandoff} from './UndertowPhase14ECpuHandoff';

const dt=1/60;
const sides=['positive-z','negative-z'] as const;
type Side=typeof sides[number];
interface QaBot {
  id:string; agent:CrowdAgent|null; entity:Entity;
  position:Vec3; previousPosition:Vec3; mobilityState:string;
  lifeState:'ACTIVE'|'SPLATTED'; respawnRemainingSeconds:number;
  thinkRemaining:number; paintRemaining:number; fireRemaining:number;
}
type QaCpu=Omit<CpuAgentSystem,'bots'> & {bots:QaBot[]};
function createActualCrowdScene(){
  // This test retains real Recast navmesh, Crowd, Rapier, CPU fixedUpdate,
  // and actual PlayCanvas GraphNode transforms. Only headless GPU components
  // are replaced; a separate Chrome test is required for pixel authority.
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const root=new Entity('T21-Phase14G-HEADLESS-REAL-CROWD');
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats();
  const nav=new RecastStageNavigation(stage,stats);
  const adapter=new UndertowPhase14ECpuHandoff(stage,true);
  const enqueue=vi.fn();
  const cpu=new CpuAgentSystem({root} as never,nav,new GameplayInkSystem(),
    {enqueue} as never,stats,stage,Team.A,adapter) as unknown as QaCpu;
  const selected=['A1','B1'].map(id=>{
    const b=cpu.bots.find(bot=>bot.id===id);
    if(!b)throw Error('T21_PHASE14G_CPU_MISSING_'+id);
    return b;
  });
  // Suppress other 5 CPUs, without changing canonical seven-bot spawning.
  for(const bot of cpu.bots){
    if(selected.includes(bot))continue;
    if(bot.agent)nav.removeAgent(bot.agent);
    bot.agent=null;bot.lifeState='SPLATTED';
    bot.respawnRemainingSeconds=1000;
    bot.entity.enabled=false;
  }
  const starts=sides.map((side,index)=>{
    const bot=selected[index]!;
    const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(
      p=>p.id==='first-drop-'+side)!;
    if(probe.expectation!=='MUST_REACH')throw Error('PHASE14G_SOURCE_PROBE_REJECTED');
    const path=nav.auditPath(new Vec3(...probe.from),new Vec3(...probe.to));
    expect(path.reachedTarget).toBe(true);
    if(bot.agent)nav.removeAgent(bot.agent);
    bot.agent=nav.addAgent(new Vec3(...probe.from));
    const p=bot.agent.position();
    bot.position.set(p.x,p.y,p.z);
    bot.previousPosition.copy(bot.position);
    bot.entity.setPosition(p.x,p.y+.68,p.z);
    bot.thinkRemaining=900;
    bot.paintRemaining=900;
    bot.fireRemaining=900;
    bot.agent.requestMoveTarget(nav.closestPoint(new Vec3(...probe.to)));
    return {side,id:bot.id,navInitial:[p.x,p.y,p.z],
      routeStart:probe.from,routeEnd:probe.to};
  });
  const accepted:Array<{id:string;frame:number;rawStep:number;side:Side}>=[];
  let frameNumber=0;
  const original=adapter.observe.bind(adapter);
  vi.spyOn(adapter,'observe').mockImplementation((id,from,to,tick)=>{
    const result=original(id,from,to,tick);
    if(result){
      const raw=auditPhase14CrowdFrame(from,to,tick);
      expect(raw.suspectedInstantTransition).toBe(true);
      const side=starts.find(s=>s.id===id)!.side;
      accepted.push({id,frame:frameNumber,rawStep:raw.travelledMeters,side});
    }
    return result;
  });
  return {cpu,root,nav,adapter,stats,enqueue,selected,accepted,starts,
    tick(){frameNumber++;cpu.fixedUpdate(dt,true,Team.A,new Vec3(0,7.5,0),false);},
    stop(){cpu.reset(Team.A);expect(adapter.activeCount).toBe(0);}};
}
beforeAll(async()=>{
  await Promise.all([initializeRapier(),initializeRecastNavigation()]);
});
afterEach(()=>vi.restoreAllMocks());
describe('T21 Phase14G real Recast Crowd -> real CpuAgentSystem -> Rapier KCC -> PlayCanvas',()=>{
  it('intercepts both real mirrored offmesh drops without source teleport and recovers normal CPU think',()=>{
    const s=createActualCrowdScene();
    const records=new Map(s.selected.map(b=>[b.id,{
      fell:false,physicalFrames:0,maxFallStep:0,groundedFrame:-1,
      startFallY:0,lastFoot:b.position.clone(),maxRenderError:0
    }]));
    for(let frame=0;frame<720;frame++){
      const previous=s.selected.map(b=>b.position.clone());
      const states=s.selected.map(b=>b.mobilityState);
      s.tick();
      s.cpu.render(0.5);
      for(let i=0;i<s.selected.length;i++){
        const bot=s.selected[i]!,before=previous[i]!;
        const r=records.get(bot.id)!;
        const starting=states[i]==='GROUND'&&bot.mobilityState==='FIRST_DROP_FALL';
        if(starting){
          r.fell=true;r.startFallY=before.y;
          expect(bot.position.distance(before)).toBeLessThan(0.15);
          expect(bot.agent).toBeNull();
        }
        const physical=states[i]==='FIRST_DROP_FALL';
        if(physical){
          r.physicalFrames++;
          const step=bot.position.distance(before);
          r.maxFallStep=Math.max(r.maxFallStep,step);
          if(step>=0.6)throw Error('PHASE14G_FALL_STEP_DIAGNOSTIC '+JSON.stringify({
            id:bot.id,frame,step,stateBefore:states[i],stateAfter:bot.mobilityState,
            before:[before.x,before.y,before.z],
            after:[bot.position.x,bot.position.y,bot.position.z],
            adapter:s.adapter.getActiveDrop(bot.id),
            interceptions:s.accepted,physicalFrames:r.physicalFrames
          }));
        }
        const visual=bot.entity.getPosition();
        const mx=(before.x+bot.position.x)*0.5;
        const my=(before.y+bot.position.y)*0.5+0.68;
        const mz=(before.z+bot.position.z)*0.5;
        const error=Math.hypot(visual.x-mx,visual.y-my,visual.z-mz);
        r.maxRenderError=Math.max(r.maxRenderError,error);
        // Existing *ground* animation has a small <=2.5cm bob.
        expect(error).toBeLessThan(0.035);
        if(physical&&bot.mobilityState==='GROUND'){
          r.groundedFrame=frame;
          expect(bot.agent).not.toBeNull();
          expect(Math.abs(bot.position.y-3)).toBeLessThan(0.2);
        }
      }
      if(s.selected.some(b=>b.mobilityState==='FIRST_DROP_FALL')){
        expect(s.stats.cpuShots).toBe(0);
        expect(s.stats.cpuPaintRequests).toBe(0);
        expect(s.stats.cpuSubUses).toBe(0);
        expect(s.stats.cpuSpecialActivations).toBe(0);
        expect(s.enqueue).not.toHaveBeenCalled();
      }
      if(s.selected.every(b=>records.get(b.id)!.groundedFrame>=0))break;
    }
    expect(s.accepted).toHaveLength(2);
    expect(new Set(s.accepted.map(x=>x.id)).size).toBe(2);
    expect(new Set(s.accepted.map(x=>x.side)).size).toBe(2);
    for(const bot of s.selected){
      const r=records.get(bot.id)!;
      expect(r.fell).toBe(true);
      expect(r.physicalFrames).toBeGreaterThan(20);
      expect(r.physicalFrames).toBeLessThan(150);
      expect(r.maxFallStep).toBeLessThan(0.6);
      expect(r.groundedFrame).toBeGreaterThan(0);
      expect(bot.agent).not.toBeNull();
    }
    expect(s.adapter.activeCount).toBe(0);
    // Actual think scheduling recovers after BOTH land. No guessed path link.
    for(const bot of s.selected)bot.thinkRemaining=0;
    const before=s.stats.cpuTacticalRetargets;
    s.tick();
    expect(s.stats.cpuTacticalRetargets).toBeGreaterThan(before);
    console.log('T21_PHASE14G_REAL_CROWD_CPU_KCC_PASS',JSON.stringify({
      origin:'REAL_RECAST_CROWD_UPPER_SOURCE',
      intercepted:s.accepted,
      outcomes:s.selected.map(b=>({
        id:b.id,frames:records.get(b.id)!.physicalFrames,
        maxStepMeters:records.get(b.id)!.maxFallStep,
        groundedFrame:records.get(b.id)!.groundedFrame,
        maxRenderMidpointErrorMeters:records.get(b.id)!.maxRenderError
      })),
      cpuThinkResumed:true,realGpuScreenshotValidated:false,
      t20ProductionUnchanged:true,activationAuthorized:false
    }));
    s.stop();
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(freeze.activationReady).toBe(false);
  });

  it('cleans actual Recast-triggered physical bodies on pause, and restores navigation without double registration',()=>{
    const s=createActualCrowdScene();
    for(let frame=0;frame<720 && s.accepted.length<2;frame++)s.tick();
    expect(s.accepted).toHaveLength(2);
    expect(s.adapter.activeCount).toBe(2);
    s.cpu.fixedUpdate(dt,false,Team.A,new Vec3(),false);
    expect(s.adapter.activeCount).toBe(0);
    for(const bot of s.selected){
      expect(bot.mobilityState).toBe('GROUND');
      expect(bot.agent).not.toBeNull();
    }
    s.cpu.fixedUpdate(dt,false,Team.A,new Vec3(),false);
    expect(s.adapter.activeCount).toBe(0);
    s.stop();
    expect(s.cpu.bots).toHaveLength(7);
  });
});
