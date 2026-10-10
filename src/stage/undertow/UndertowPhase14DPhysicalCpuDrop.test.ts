import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {RapierStagePhysics,initializeRapier} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {rasterizeStageFootprint} from '../StageFootprint';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage} from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES as probes,
 undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {auditPhase14FirstDrop} from './UndertowPhase14FirstDropGate';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';
import {UndertowCpuDropBridge} from './UndertowPhase14DPhysicalCpuDrop';
const dt=1/60;
const sides=['positive-z','negative-z'] as const;
function supportedLanding(slug:typeof sides[number],origin:{x:number;z:number}){
 const id='UndertowT21D:first-drop-landing-'+slug;
 const s=stage.solids.find(x=>x.id===id)!;
 if(!s.footprint)throw Error('PHASE14D_SOURCE_MISSING_'+id);
 const fp=s.footprint,r=rasterizeStageFootprint(s.size[0],s.size[2],fp);
 const marginMeters=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+
   PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters+.02;
 const k=Math.ceil(marginMeters/fp.cellSizeMeters);
 let best:null|{x:number;y:number;z:number}=null;
 let minDistance=Number.POSITIVE_INFINITY;
 for(let z=k;z<r.depthCells-k;z++)for(let x=k;x<r.widthCells-k;x++){
  if(r.active[z*r.widthCells+x]!==1)continue;
  let solid=true;
  for(let dz=-k;dz<=k&&solid;dz++)for(let dx=-k;dx<=k;dx++){
   if(Math.hypot(dx,dz)*fp.cellSizeMeters>marginMeters)continue;
   if(r.active[(z+dz)*r.widthCells+x+dx]!==1){solid=false;break;}
  }
  if(solid){
   const point={
    x:s.center[0]-s.size[0]/2+(x+.5)*fp.cellSizeMeters,
    y:s.center[1]+s.size[1]/2,
    z:s.center[2]-s.size[2]/2+(z+.5)*fp.cellSizeMeters
   };
   const d=Math.hypot(point.x-origin.x,point.z-origin.z);
   if(d<minDistance){minDistance=d;best=point;}
  }
 }
 if(!best)throw Error('PHASE14D_NO_SOURCE_SUPPORTED_POINT_'+id);
 console.log('PHASE14D_SOURCE_LANDING_SELECTION',JSON.stringify({
  side:slug,originalStart:origin,sourceLanding:best,horizontalDistance:minDistance
 }));
 return best;
}
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
describe('T21 Phase14D genuine Crowd triggering isolated physical fall bridge',()=>{
 it('captures real offmesh instability then physically descends on both original landing colliders',()=>{
  expect(auditPhase14FirstDrop(stage,probes).readiness).toBe('ISOLATED_RUNTIME_QA_CANDIDATE');
  const nav=new RecastStageNavigation(undertowT21dConnectivityQaStage(),new PerformanceStats());
  const bots=sides.map(side=>{
   const p=probes.find(x=>x.id==='first-drop-'+side)!;
   const a=nav.addAgent(new Vec3(...p.from));
   a.requestMoveTarget(nav.closestPoint(new Vec3(...p.to)));
   return {side,agent:a,prev:{...a.position()},detected:null as null|{x:number;y:number;z:number},
     discontinuities:0,largest:0};
  });
  for(let frame=0;frame<720;frame++){
   nav.fixedUpdate(dt);
   for(const b of bots){
    const p=b.agent.position(),m=auditPhase14CrowdFrame(b.prev,p,dt);
    if(m.suspectedInstantTransition){
     b.discontinuities++;
     b.largest=Math.max(b.largest,m.travelledMeters);
     if(!b.detected&&p.y<b.prev.y)b.detected={...b.prev};
    }
    b.prev={...p};
   }
   if(bots.every(b=>b.detected))break;
  }
  for(const b of bots){
   expect(b.detected).not.toBeNull();
   expect(b.discontinuities).toBeGreaterThan(0);
   const sourceLanding=supportedLanding(b.side,b.detected!);
   const physics=new RapierStagePhysics(dt,{
    ...undertowT21dConnectivityQaStage(),
    solids:stage.solids.filter(s=>s.id==='UndertowT21D:first-drop-landing-'+b.side),
    paintSurfaces:[]
   });
   physics.step();
   const bridge=new UndertowCpuDropBridge(physics,b.detected!,sourceLanding);
   let landed=false,final=bridge.step(dt),largestPhysicalStep=final.stepMeters;
   for(let frame=1;frame<180&&!landed;frame++){
    expect(final.continuous).toBe(true);
    largestPhysicalStep=Math.max(largestPhysicalStep,final.stepMeters);
    if(final.landed){landed=true;break;}
    final=bridge.step(dt);
   }
   landed=landed||final.landed;
   console.log('T21_PHASE14D_REAL_CPU_PHYSICS',JSON.stringify({
    side:b.side,rawDiscontinuityFrames:b.discontinuities,
    rawLargestStepMeters:b.largest,physicalLandingReached:landed,
    physicsFrames:final.frame,physicalElapsedSeconds:final.frame*dt,
    maxPhysicalStepMeters:largestPhysicalStep,
    actualFoot:final.foot,sourceLanding,
    realCpuAgentSystemIntegration:false,
    runtimeActivationAuthorized:false
   }));
   expect(landed).toBe(true);
   expect(final.frame).toBeGreaterThan(20);
   expect(final.frame).toBeLessThan(150);
   expect(final.continuous).toBe(true);
   expect(Math.abs(final.foot.y-sourceLanding.y)).toBeLessThan(.14);
   bridge.dispose();
   nav.removeAgent(b.agent);
  }
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(stage.activationReady).toBe(false);
 });
 it('fails closed on incorrect Hz and invalid original-source endpoints',()=>{
  const physics=new RapierStagePhysics(dt,{
   ...undertowT21dConnectivityQaStage(),solids:[],paintSurfaces:[]
  });
  expect(()=>new UndertowCpuDropBridge(physics,{x:0,y:3,z:0},{x:0,y:3,z:0})).toThrow();
  expect(()=>new UndertowCpuDropBridge(physics,{x:0,y:8,z:0},{x:NaN,y:3,z:0})).toThrow();
  const b=new UndertowCpuDropBridge(physics,{x:0,y:8,z:0},{x:0,y:3,z:0});
  expect(()=>b.step(1/30)).toThrow('60HZ_REQUIRED');
  b.dispose();
 });
});
