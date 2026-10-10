import RAPIER from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {GAME_CONFIG} from '../../config/game/gameConfig';
import {PerformanceStats} from '../../core/PerformanceStats';
import {RecastStageNavigation,initializeRecastNavigation} from '../../navigation/RecastStageNavigation';
import {RapierStagePhysics,initializeRapier} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController} from '../../player/PlayerCharacterPhysics';
import {rasterizeStageFootprint} from '../StageFootprint';
import {PRODUCTION_STAGE_DEFINITION,type StageSolidDefinition} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage} from './UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21D_CONNECTIVITY_PROBES as probes,
 undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {auditPhase14FirstDrop} from './UndertowPhase14FirstDropGate';
import {auditPhase14CrowdFrame} from './UndertowPhase14CrowdMotionAudit';

type Mode='HUMAN'|'SQUID';
const step=1/60;
const sides=['positive-z','negative-z'] as const;
function floorPoint(solid:StageSolidDefinition,requiredRadius:number){
 if(!solid.footprint)throw Error('PHASE14C_ORIGINAL_FOOTPRINT_MISSING:'+solid.id);
 const f=solid.footprint;
 const raster=rasterizeStageFootprint(solid.size[0],solid.size[2],f);
 const radiusCells=Math.ceil(requiredRadius/f.cellSizeMeters);
 let best:readonly [number,number]|null=null;
 for(let z=radiusCells;z<raster.depthCells-radiusCells&&!best;z++)
  for(let x=radiusCells;x<raster.widthCells-radiusCells;x++){
   if(raster.active[z*raster.widthCells+x]!==1)continue;
   let safe=true;
   for(let dz=-radiusCells;dz<=radiusCells&&safe;dz++)
    for(let dx=-radiusCells;dx<=radiusCells;dx++){
     if(Math.hypot(dx,dz)*f.cellSizeMeters>requiredRadius)continue;
     if(raster.active[(z+dz)*raster.widthCells+x+dx]!==1){safe=false;break;}
    }
   if(safe){best=[x,z];break;}
  }
 if(!best)throw Error('PHASE14C_NO_ORIGINAL_SAFE_FLOOR:'+solid.id);
 return new Vec3(
  solid.center[0]-solid.size[0]/2+(best[0]+.5)*f.cellSizeMeters,
  solid.center[1]+solid.size[1]/2,
  solid.center[2]-solid.size[2]/2+(best[1]+.5)*f.cellSizeMeters);
}
const distance=(p:{x:number;y:number;z:number},q:{x:number;y:number;z:number})=>
 Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z);
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
describe('T21 Phase14C 60Hz isolated original first-drop descent and real Crowd movement',()=>{
 it('60Hz Rapier KCC descends original 4.5m stage height and lands on BOTH source-side footprints for BOTH forms',()=>{
  expect(auditPhase14FirstDrop(stage,probes).readiness).toBe('ISOLATED_RUNTIME_QA_CANDIDATE');
  const qa=undertowT21dConnectivityQaStage();
  const selected=sides.map(slug=>{
   const id='UndertowT21D:first-drop-landing-'+slug;
   const solid=stage.solids.find(s=>s.id===id);
   if(!solid)throw Error('PHASE14C_NO_SOURCE_LANDING:'+id);
   return {slug,id,solid};
  });
  const physics=new RapierStagePhysics(step,{...qa,
   solids:selected.map(r=>r.solid),
   paintSurfaces:stage.paintSurfaces.filter(p=>selected.some(r=>r.id===p.backingSolidId))});
  physics.step();
  for(const {slug,id,solid} of selected){
   const lower=floorPoint(solid,PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+
    PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters+.02);
   const probe=probes.find(p=>p.id==='first-drop-'+slug);
   expect(probe?.expectation).toBe('MUST_REACH');
   expect(probe!.from[1]-probe!.to[1]).toBe(4.5);
   for(const mode of ['HUMAN','SQUID'] as const){
    const startY=probe!.from[1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.08;
    const body=physics.world.createRigidBody(RAPIER.RigidBodyDesc
     .kinematicPositionBased().setTranslation(lower.x,startY,lower.z));
    const shape=mode==='HUMAN'
     ?RAPIER.ColliderDesc.capsule(PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
         PLAYER_CHARACTER_PHYSICS.humanRadiusMeters)
     :RAPIER.ColliderDesc.ball(PLAYER_CHARACTER_PHYSICS.squidRadiusMeters)
         .setTranslation(0,PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters,0);
    const collider=physics.world.createCollider(shape,body);
    const kcc=createConfiguredPlayerCharacterController(physics.world);
    let velocityY=0,landedFrame:number|null=null,minimumY=startY;
    for(let frame=0;frame<180;frame++){
     velocityY=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
       velocityY-GAME_CONFIG.player.gravityMetersPerSecond2*step);
     kcc.computeColliderMovement(collider,{x:0,y:velocityY*step,z:0},
       undefined,undefined,c=>physics.shouldCharacterCollide(c,mode));
     const movement=kcc.computedMovement(),p=body.translation();
     const next={x:p.x+movement.x,y:p.y+movement.y,z:p.z+movement.z};
     expect([next.x,next.y,next.z].every(Number.isFinite)).toBe(true);
     body.setNextKinematicTranslation(next);
     physics.step();
     minimumY=Math.min(minimumY,next.y);
     if(kcc.computedGrounded()&&frame>2){landedFrame=frame;break;}
    }
    const end=body.translation();
    const hit=physics.castStageSegment(
      new Vec3(lower.x,lower.y+.2,lower.z),
      new Vec3(lower.x,lower.y-.5,lower.z),'camera');
    console.log('T21_PHASE14C_60HZ_DESCENT',JSON.stringify({
      slug,mode,startY,landingY:lower.y,
      landedFrame,elapsedSeconds:landedFrame===null?null:(landedFrame+1)*step,
      endY:end.y,verticalTravelMeters:startY-end.y,
      collisionSourceId:hit?.solidId,actualGrounded:landedFrame!==null
    }));
    expect(landedFrame).not.toBeNull();
    expect(landedFrame!).toBeGreaterThan(25);
    expect(startY-end.y).toBeGreaterThan(4);
    expect(Math.abs(end.y-(lower.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters)))
     .toBeLessThan(.08);
    expect(hit?.solidId).toBe(id);
    physics.world.removeRigidBody(body);
    physics.world.removeCharacterController(kcc);
   }
  }
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(stage.activationReady).toBe(false);
 });
 it('moves BOTH actual Recast Crowd agents at 60Hz over existing one-way first-drop links',()=>{
  const navigation=new RecastStageNavigation(undertowT21dConnectivityQaStage(),new PerformanceStats());
  const agents=sides.map(slug=>{
   const probe=probes.find(p=>p.id==='first-drop-'+slug);
   if(!probe||probe.expectation!=='MUST_REACH')throw Error('PHASE14C_NO_ROUTE:'+slug);
   const from=new Vec3(...probe.from),to=new Vec3(...probe.to);
   const query=navigation.auditPath(from,to);
   expect(query.reachedTarget).toBe(true);
   const agent=navigation.addAgent(from);
   const destination=navigation.closestPoint(to);
   agent.requestMoveTarget(destination);
   return {slug,agent,from,to,destination,
    first:{...agent.position()},previous:{...agent.position()},
    bestErrorMeters:Number.POSITIVE_INFINITY,
    furthestMovedMeters:0,arrivalFrame:null as number|null,
    largestFrameDisplacementMeters:0,
    suspectInstantTransitionFrames:0,
    largestInstantVerticalChangeMeters:0};
  });
  for(let frame=0;frame<720;frame++){
   navigation.fixedUpdate(step);
   for(const a of agents){
    const p=a.agent.position();
    expect([p.x,p.y,p.z].every(Number.isFinite)).toBe(true);
    const frameAudit=auditPhase14CrowdFrame(a.previous,p,step);
    a.largestFrameDisplacementMeters=Math.max(
      a.largestFrameDisplacementMeters,frameAudit.travelledMeters);
    if(frameAudit.suspectedInstantTransition){
      a.suspectInstantTransitionFrames++;
      a.largestInstantVerticalChangeMeters=Math.max(
        a.largestInstantVerticalChangeMeters,frameAudit.verticalChangeMeters);
    }
    a.previous={x:p.x,y:p.y,z:p.z};
    a.bestErrorMeters=Math.min(a.bestErrorMeters,distance(p,a.destination));
    a.furthestMovedMeters=Math.max(a.furthestMovedMeters,distance(p,a.first));
    if(a.arrivalFrame===null&&a.bestErrorMeters<=.8)a.arrivalFrame=frame;
   }
   if(agents.every(x=>x.arrivalFrame!==null))break;
  }
  for(const a of agents){
   console.log('T21_PHASE14C_CROWD_FOLLOW',JSON.stringify({
    slug:a.slug,origin:a.first,target:a.destination,
    bestErrorMeters:a.bestErrorMeters,
    furthestMovedMeters:a.furthestMovedMeters,
    arrivalSeconds:a.arrivalFrame===null?null:(a.arrivalFrame+1)*step,
    largestFrameDisplacementMeters:a.largestFrameDisplacementMeters,
    suspectInstantTransitionFrames:a.suspectInstantTransitionFrames,
    largestInstantVerticalChangeMeters:a.largestInstantVerticalChangeMeters,
    crowdNavigationArrived:a.arrivalFrame!==null,
    crowdPhysicalFallCertified:false,
    cpuAgentSystemDecisionLogicVerified:false
   }));
   expect(a.furthestMovedMeters).toBeGreaterThan(3.2);
   expect(a.arrivalFrame).not.toBeNull();
   expect(a.bestErrorMeters).toBeLessThanOrEqual(.8);
   navigation.removeAgent(a.agent);
  }
  expect(stage.activationReady).toBe(false);
 });
});