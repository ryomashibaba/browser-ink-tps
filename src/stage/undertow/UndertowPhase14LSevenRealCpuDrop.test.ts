import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import type {CrowdAgent} from 'recast-navigation';
import {CpuAgentSystem} from '../../ai/CpuAgentSystem';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff} from './UndertowPhase14ECpuHandoff';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';

const DT=1/60;
const SOURCE_SIDES=['positive-z','negative-z'] as const;
type SourceSide=typeof SOURCE_SIDES[number];
interface Bot{
  id:string;team:Team.A|Team.B;agent:CrowdAgent|null;entity:Entity;
  position:Vec3;previousPosition:Vec3;mobilityState:string;
  lifeState:string;thinkRemaining:number;paintRemaining:number;
  fireRemaining:number;
}
type QaCpu=Omit<CpuAgentSystem,'bots'>&{bots:Bot[]};
interface Observation{
  id:string;side:SourceSide;frame:number;
  rawStepMeters:number;originalRecast:true;
}
beforeAll(async()=>{
  await Promise.all([initializeRapier(),initializeRecastNavigation()]);
});
afterEach(()=>vi.restoreAllMocks());

describe('T21 Phase14L seven *actual* CPU controllers and original-source Rapier handoffs',()=>{
 it('drives the canonical seven CPU entities with real Recast navigation and records bounded collision-authoritative falls',()=>{
  // This test uses genuine CpuAgentSystem/Crowd/Rapier/PlayCanvas GraphNodes.
  // Headless GPU components alone are mocked; browser pixels remain the
  // independently gated Phase14K Chrome lane.
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const root=new Entity('T21-Phase14L-REAL-SEVEN-CPU');
  const stage=undertowT21dConnectivityQaStage();
  const stats=new PerformanceStats();
  const navigation=new RecastStageNavigation(stage,stats);
  const adapter=new UndertowPhase14ECpuHandoff(stage,true);
  const enqueue=vi.fn();
  const cpu=new CpuAgentSystem({root} as never,navigation,new GameplayInkSystem(),
    {enqueue} as never,stats,stage,Team.A,adapter) as unknown as QaCpu;
  const bots=cpu.bots;
  expect(bots.map(b=>b.id)).toEqual(['A1','A2','A3','B1','B2','B3','B4']);
  const trajectories=new Map(bots.map(b=>[b.id,{
    side:(b.team===Team.A?'positive-z':'negative-z') as SourceSide,
    firstFallFrame:-1,physicalFrames:0,stableRejoinFrame:-1,
    initialY:0,maxTickMeters:0,hitCollisionRejoinGate:false,
    seenFall:false,seenRejoin:false,navLandings:0,
    renderErrorMeters:0,firstRecastDistance:0
  }]));
  let frame=0;
  const observations:Observation[]=[];
  const originalObserve=adapter.observe.bind(adapter);
  vi.spyOn(adapter,'observe').mockImplementation((id,from,to,dt)=>{
    const accepted=originalObserve(id,from,to,dt);
    if(accepted){
      const raw=auditPhase14CrowdFrame(from,to,dt);
      const side=trajectories.get(id)?.side;
      if(!side||!raw.suspectedInstantTransition||
        Math.abs(dt-DT)>1e-8)
        throw Error('T21_PHASE14L_UNVERIFIED_OFFMESH_CPU_'+id);
      observations.push({
        id,side,frame,rawStepMeters:raw.travelledMeters,
        originalRecast:true
      });
    }
    return accepted;
  });
  // Spread canonical CPU inventory across the two original source-approved
  // first-drop paths; no geometry, source mask, nav link or floor alteration.
  for(const b of bots){
    const side=trajectories.get(b.id)!.side;
    const probe=UNDERTOW_T21D_CONNECTIVITY_PROBES.find(
      p=>p.id==='first-drop-'+side)!;
    expect(probe.expectation).toBe('MUST_REACH');
    expect(navigation.auditPath(new Vec3(...probe.from),
      new Vec3(...probe.to)).reachedTarget).toBe(true);
    if(b.agent)navigation.removeAgent(b.agent);
    b.agent=navigation.addAgent(new Vec3(...probe.from));
    const p=b.agent.position();
    b.position.set(p.x,p.y,p.z);
    b.previousPosition.copy(b.position);
    b.entity.setPosition(p.x,p.y+.68,p.z);
    b.agent.requestMoveTarget(navigation.closestPoint(new Vec3(...probe.to)));
    b.thinkRemaining=900;
    b.paintRemaining=900;
    b.fireRemaining=900;
    trajectories.get(b.id)!.initialY=p.y;
  }
  let completed=0;
  let peakActiveBodies=0;
  let unsafeException:null|{frame:number;reason:string;bots:unknown}=null;
  const start=performance.now();
  for(frame=1;frame<=780;frame++){
    const before=bots.map(b=>b.position.clone());
    const previousStates=bots.map(b=>b.mobilityState);
    try{
      cpu.fixedUpdate(DT,true,Team.A,new Vec3(0,7.5,0),false);
    }catch(e){
      unsafeException={
        frame,reason:String(e),bots:bots.map(b=>({
          id:b.id,state:b.mobilityState,position:
            [b.position.x,b.position.y,b.position.z],
          crowd:!!b.agent
        }))
      };
      break;
    }
    cpu.render(.5);
    peakActiveBodies=Math.max(peakActiveBodies,adapter.activeCount);
    for(const [i,b] of bots.entries()){
      const record=trajectories.get(b.id)!;
      const prev=before[i]!,oldState=previousStates[i]!;
      const delta=b.position.distance(prev);
      record.maxTickMeters=Math.max(record.maxTickMeters,delta);
      const visual=b.entity.getPosition();
      const err=Math.hypot(visual.x-(prev.x+b.position.x)/2,
        visual.y-(prev.y+b.position.y)/2-.68,
        visual.z-(prev.z+b.position.z)/2);
      record.renderErrorMeters=Math.max(record.renderErrorMeters,err);
      if(oldState==='GROUND'&&b.mobilityState==='FIRST_DROP_FALL'){
        record.firstFallFrame=frame;
        record.firstRecastDistance=observations.find(x=>x.id===b.id)!.rawStepMeters;
        record.seenFall=true;
        expect(b.agent).toBeNull();
      }
      if(oldState==='FIRST_DROP_FALL')record.physicalFrames++;
      if(b.mobilityState==='FIRST_DROP_REJOIN')record.seenRejoin=true;
      if(record.seenFall&&record.seenRejoin&&
        oldState==='FIRST_DROP_REJOIN'&&b.mobilityState==='GROUND'){
        record.stableRejoinFrame=frame;
        record.navLandings++;
      }
      expect(delta).toBeLessThan(.60);
      expect(err).toBeLessThan(.04);
      expect([b.position.x,b.position.y,b.position.z].every(Number.isFinite))
        .toBe(true);
    }
    expect(stats.cpuPaintRequests).toBe(0);
    expect(stats.cpuShots).toBe(0);
    expect(enqueue).not.toHaveBeenCalled();
    completed=bots.filter(b=>trajectories.get(b.id)!.stableRejoinFrame>0).length;
    if(completed===7)break;
  }
  const elapsedMs=performance.now()-start;
  const evidence={
    phase:'14L',origin:'ALL_SEVEN_REAL_CPU_AGENT_SYSTEM_ENTITIES',
    source:'UNCHANGED_25_SOLIDS_26_ORIGINAL_NAV_LINKS',
    completed,frame,elapsedMs,peakActiveBodies,
    observations,
    bots:bots.map(b=>({id:b.id,side:trajectories.get(b.id)!.side,
      state:b.mobilityState,agentRegistered:b.agent!==null,
      physicalFoot:[b.position.x,b.position.y,b.position.z],
      ...trajectories.get(b.id)})),
    unsafeException,
    actualGpuBrowserValidatedInThisTest:false,
    sevenCpuKccIntegrationApproved:!unsafeException&&completed===7,
    human4v4MatchApproved:false,
    paintCombatApproved:false,
    sourceGeometryChanged:false,activationAuthorized:false
  };
  console.log('T21_PHASE14L_SEVEN_REAL_CPU_RAPIER_INTEGRATION',JSON.stringify(evidence));
  // Resource hygiene, even after a fail-closed rejection.
  cpu.reset(Team.A);
  expect(adapter.activeCount).toBe(0);
  expect(cpu.bots).toHaveLength(7);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(unsafeException).toBeNull();
  expect(completed).toBe(7);
  expect(new Set(observations.map(x=>x.id)).size).toBe(7);
  expect(peakActiveBodies).toBeGreaterThan(0);
  expect(peakActiveBodies).toBeLessThanOrEqual(7);
  for(const record of trajectories.values()){
    expect(record.physicalFrames).toBeGreaterThanOrEqual(20);
    expect(record.physicalFrames).toBeLessThan(140);
    expect(record.firstRecastDistance).toBeGreaterThan(.5);
    expect(record.stableRejoinFrame).toBeGreaterThan(0);
    expect(record.renderErrorMeters).toBeLessThan(.04);
  }
 });
});