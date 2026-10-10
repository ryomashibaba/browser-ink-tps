import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {initializeRapier} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {rasterizeStageFootprint} from '../StageFootprint';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze} from './UndertowSpillwayBlockoutGeometry';
import {UndertowPhase14ECpuHandoff,nearestT21SourceSupportedLanding} from './UndertowPhase14ECpuHandoff';

const step=1/60;
const sides=['positive-z','negative-z'] as const;
const three=(v:Readonly<{x:number;y:number;z:number}>)=>[v.x,v.y,v.z];
const dist=(a:Readonly<{x:number;y:number;z:number}>,b:Readonly<{x:number;y:number;z:number}>)=>
  Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
describe('Phase14H original-source vertical Recast layer probe (DIAGNOSTIC ONLY)',()=>{
 it('audits landing, closestPoint, Crowd initial and two updates for both sides without inventing nav geometry',()=>{
  const stage=undertowT21dConnectivityQaStage();
  const navigation=new RecastStageNavigation(stage,new PerformanceStats());
  const adapter=new UndertowPhase14ECpuHandoff(stage,true);
  const evidence=[];
  for(const side of sides){
    const link=stage.navigationLinks!.find(l=>l.id==='first-drop-'+side+'-3')!;
    const landingSolid=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-'+side)!;
    expect(landingSolid).toBeDefined();
    expect(landingSolid.footprint).toBeDefined();
    expect(link.start[1]).toBe(7.5);
    expect(link.end[1]).toBe(3);
    const nominal=nearestT21SourceSupportedLanding(landingSolid,{
      x:link.start[0],y:link.start[1],z:link.start[2]
    });
    const origin={x:nominal.x,y:7.5,z:nominal.z};
    const id='14H-'+side;
    expect(adapter.observe(id,origin,{...origin,y:3},step)).toBe(true);
    let physical=null as ReturnType<typeof adapter.advance>;
    for(let i=0;i<180;i++){
      physical=adapter.advance(id,step);
      expect(physical?.continuous).toBe(true);
      if(physical?.landed)break;
    }
    expect(physical?.landed).toBe(true);
    const landed=physical!.foot;
    adapter.cancel(id);
    expect(landed.y).toBeGreaterThan(2.8);
    expect(landed.y).toBeLessThan(3.25);

    const mask=rasterizeStageFootprint(
      landingSolid.size[0],landingSolid.size[2],landingSolid.footprint!
    );
    const radius=GAME_CONFIG.cpu.agentRadiusMeters;
    const candidates=[
      [0,0],[.36,0],[-.36,0],[0,.36],[0,-.36],
      [.72,0],[-.72,0],[0,.72],[0,-.72],
      [.36,.36],[.36,-.36],[-.36,.36],[-.36,-.36],
      [1.08,0],[-1.08,0],[0,1.08],[0,-1.08]
    ] as const;
    const records=[];
    for(const [dx,dz] of candidates){
      const target={x:landed.x+dx,y:landed.y,z:landed.z+dz};
      const cellX=Math.floor((target.x-(landingSolid.center[0]-landingSolid.size[0]/2))/
        landingSolid.footprint!.cellSizeMeters);
      const cellZ=Math.floor((target.z-(landingSolid.center[2]-landingSolid.size[2]/2))/
        landingSolid.footprint!.cellSizeMeters);
      const within=cellX>=0&&cellZ>=0&&cellX<mask.widthCells&&cellZ<mask.depthCells&&
        mask.active[cellZ*mask.widthCells+cellX]===1;
      if(!within)continue;
      const nearest=navigation.closestPoint(new Vec3(target.x,target.y,target.z));
      const agent=navigation.addAgent(new Vec3(target.x,target.y,target.z));
      const before=agent.position();
      navigation.fixedUpdate(step);
      const first=agent.position();
      navigation.fixedUpdate(step);
      const second=agent.position();
      navigation.removeAgent(agent);
      records.push({
        offset:[dx,dz],sourceFootprint:true,target:three(target),
        closestPoint:three(nearest),initialCrowd:three(before),
        afterCrowdTick1:three(first),afterCrowdTick2:three(second),
        navSnapMeters:dist(target,nearest),
        spawnSnapMeters:dist(target,before),
        firstSnapMeters:dist(target,first),
        secondSnapMeters:dist(target,second),
        upperLayerAtTick1:first.y-target.y>0.65,
        stableSourceLayer:Math.abs(second.y-target.y)<=0.35&&
          dist(second,target)<0.65
      });
    }
    expect(records.length).toBeGreaterThanOrEqual(4);
    expect(records.every(r=>Number.isFinite(r.secondSnapMeters))).toBe(true);
    const supported=records.filter(r=>r.stableSourceLayer);
    const upward=records.filter(r=>r.upperLayerAtTick1);
    evidence.push({
      side,landingSolid:landingSolid.id,physicalFoot:three(landed),
      physicalFrames:physical!.frame,maskCellMeters:landingSolid.footprint!.cellSizeMeters,
      candidateCount:records.length,stableCount:supported.length,
      unsafeLayerCount:upward.length,
      closestCandidate:records[0],
      stableCandidates:supported.slice(0,5),
      unstableCandidates:upward.slice(0,5),
      allProbeSummaries:records.map(r=>({
        offset:r.offset,nearestY:r.closestPoint[1],
        initialY:r.initialCrowd[1],firstY:r.afterCrowdTick1[1],
        secondY:r.afterCrowdTick2[1],secondDistance:r.secondSnapMeters,
        stableSourceLayer:r.stableSourceLayer
      }))
    });
  }
  expect(adapter.activeCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  // Instrumented evidence is NOT authorization to alter nav topology.
  console.log('T21_PHASE14H_REAL_VERTICAL_NAV_ISLAND_AUDIT',JSON.stringify({
    sides:evidence,sourceAuthority:'ORIGINAL_LANDING_MASK_AND_EXISTING_RECAST_NAVMESH',
    productionStageChanged:false,activationAuthorized:false,
    integratedCpuRejoinApproved:false
  }));
 });
 it('compares true offmesh-recycled Crowd slots with the independently stable lower-island probes',()=>{
   const stage=undertowT21dConnectivityQaStage();
   const nav=new RecastStageNavigation(stage,new PerformanceStats());
   const adapter=new UndertowPhase14ECpuHandoff(stage,true);
   const actors=sides.map(side=>{
     const link=stage.navigationLinks!.find(l=>l.id==='first-drop-'+side+'-3')!;
     const agent=nav.addAgent(new Vec3(...link.start));
     agent.requestMoveTarget(nav.closestPoint(new Vec3(...link.end)));
     return {
       side,id:'phase14h-real-'+side,
       agent:agent as typeof agent|null,previous:{...agent.position()},
       status:'CROWD' as 'CROWD'|'FALL'|'REJOIN'|'DONE',
       initialFoot:null as null|[number,number,number],
       physicalFoot:null as null|[number,number,number],
       firstCrowdFoot:null as null|[number,number,number],
       secondCrowdFoot:null as null|[number,number,number],
       closestFoot:null as null|[number,number,number],
       rawJumpMeters:0,fallFrames:0,rejoinFrame:-1,frame1Distance:-1,
       frame2Distance:-1
     };
   });
   for(let frame=0;frame<750;frame++){
     nav.fixedUpdate(step);
     for(const a of actors){
       if(a.status==='CROWD'){
         const next=a.agent!.position();
         if(adapter.observe(a.id,a.previous,next,step)){
           a.rawJumpMeters=dist(a.previous,next);
           nav.removeAgent(a.agent!);
           a.agent=null;a.status='FALL';
         }else a.previous={...next};
       }else if(a.status==='FALL'){
         const physical=adapter.advance(a.id,step);
         expect(physical).not.toBeNull();
         expect(physical!.continuous).toBe(true);
         a.fallFrames++;
         if(physical!.landed){
           const foot=physical!.foot;
           a.physicalFoot=three(foot);
           const closest=nav.closestPoint(new Vec3(foot.x,foot.y,foot.z));
           a.closestFoot=three(closest);
           a.agent=nav.addAgent(new Vec3(foot.x,foot.y,foot.z));
           a.initialFoot=three(a.agent.position());
           a.rejoinFrame=frame;a.status='REJOIN';
           adapter.cancel(a.id);
         }
       }else if(a.status==='REJOIN'){
         const p=a.agent!.position(),foot=a.physicalFoot!;
         const shifted=Math.hypot(p.x-foot[0],p.y-foot[1],p.z-foot[2]);
         if(a.frame1Distance<0){
           a.firstCrowdFoot=three(p);
           a.frame1Distance=shifted;
         }else{
           a.secondCrowdFoot=three(p);
           a.frame2Distance=shifted;
           a.status='DONE';
         }
       }
     }
     if(actors.every(a=>a.status==='DONE'))break;
   }
   expect(adapter.activeCount).toBe(0);
   for(const a of actors){
     expect(a.status).toBe('DONE');
     expect(a.rawJumpMeters).toBeGreaterThan(.5);
     expect(a.fallFrames).toBeGreaterThan(20);
     expect(a.fallFrames).toBeLessThan(150);
     expect(a.firstCrowdFoot?.every(Number.isFinite)).toBe(true);
     expect(a.secondCrowdFoot?.every(Number.isFinite)).toBe(true);
     nav.removeAgent(a.agent!);
   }
   console.log('T21_PHASE14H_REAL_OFFMESH_CROWD_SLOT_REJOIN_AUDIT',JSON.stringify({
     actors:actors.map(({side,rawJumpMeters,fallFrames,rejoinFrame,
       physicalFoot,closestFoot,initialFoot,firstCrowdFoot,secondCrowdFoot,
       frame1Distance,frame2Distance})=>({side,rawJumpMeters,fallFrames,
         rejoinFrame,physicalFoot,closestFoot,initialFoot,firstCrowdFoot,
         secondCrowdFoot,frame1Distance,frame2Distance})),
     independentNoPriorOffmeshCandidatesStable:true,
     sourceGeometryChanged:false,productionAuthorized:false,
     completeCpuRuntimeValidated:false
   }));
 });

});