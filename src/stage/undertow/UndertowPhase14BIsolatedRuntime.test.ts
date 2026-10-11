import RAPIER from '@dimforge/rapier3d-compat';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,expect,it} from 'vitest';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {PaintSurface} from '../../ink/PaintSurface';
import {PaintEventType,PaintSource,SurfaceFlags,Team} from '../../ink/types';
import {RapierStagePhysics,initializeRapier} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS,createConfiguredPlayerCharacterController} from '../../player/PlayerCharacterPhysics';
import {rasterizeStageFootprint} from '../StageFootprint';
import type {StageSolidDefinition} from '../StageDefinition';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as stage} from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage,UNDERTOW_T21D_CONNECTIVITY_PROBES as probes} from './UndertowSpillwayConnectivityQa';
import {auditPhase14FirstDrop} from './UndertowPhase14FirstDropGate';

const names=['spawn-high-positive-z','spawn-high-negative-z',
 'first-drop-landing-positive-z','first-drop-landing-negative-z'];
const selected=names.map(name=>{
 const id='UndertowT21D:'+name;
 const solid=stage.solids.find(s=>s.id===id);
 const surface=stage.paintSurfaces.find(p=>p.backingSolidId===id);
 if(!solid||!surface||!solid.footprint)throw Error('PHASE14B_SOURCE_MISSING:'+id);
 return {id,solid,surface};
});
function interior(s:StageSolidDefinition){
 if(!s.footprint)throw Error('PHASE14B_FOOTPRINT_MISSING');
 const r=rasterizeStageFootprint(s.size[0],s.size[2],s.footprint);
 // Merged rectangles may be 0.125m wide even over a fully supported
 // contiguous region. Audit the full original active-cell mask instead.
 const cell=s.footprint.cellSizeMeters;
 const supportRadius=PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+
   PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters+.02;
 const radiusCells=Math.ceil(supportRadius/cell);
 let chosen:readonly [number,number]|null=null;
 for(let z=radiusCells;z<r.depthCells-radiusCells&&!chosen;z++){
  for(let x=radiusCells;x<r.widthCells-radiusCells;x++){
   if(r.active[z*r.widthCells+x]!==1)continue;
   let supported=true;
   for(let dz=-radiusCells;dz<=radiusCells&&supported;dz++){
    for(let dx=-radiusCells;dx<=radiusCells;dx++){
     if(Math.hypot(dx,dz)*cell>supportRadius)continue;
     if(r.active[(z+dz)*r.widthCells+x+dx]!==1){
      supported=false;break;
     }
    }
   }
   if(supported){chosen=[x,z];break;}
  }
 }
 if(!chosen)throw Error('PHASE14B_SOURCE_SUPPORT_RADIUS_NOT_PROVEN:'+s.id);
 return {x:s.center[0]-s.size[0]/2+(chosen[0]+.5)*cell,
  y:s.center[1]+s.size[1]/2,
  z:s.center[2]-s.size[2]/2+(chosen[1]+.5)*cell};
}
beforeAll(async()=>{await initializeRapier();});
describe('Phase14B actual isolated source-backed physics and ink, NOT full gameplay',()=>{
 it('runs Rapier camera-ray and production-shared HUMAN/SQUID KCC grounding',()=>{
  expect(auditPhase14FirstDrop(stage,probes).readiness).toBe('ISOLATED_RUNTIME_QA_CANDIDATE');
  const qa=undertowT21dConnectivityQaStage();
  const world=new RapierStagePhysics(1/60,{...qa,
   solids:selected.map(v=>v.solid),paintSurfaces:selected.map(v=>v.surface)});
  world.step();
  for(const {solid,id} of selected){
   const pos=interior(solid);
   const ray=world.castStageSegment(new Vec3(pos.x,pos.y+1.2,pos.z),
    new Vec3(pos.x,pos.y-1.2,pos.z),'camera');
   expect(ray?.solidId).toBe(id);
   expect(ray?.point.y).toBeCloseTo(pos.y,2);
   for(const mode of ['HUMAN','SQUID'] as const){
    const body=world.world.createRigidBody(RAPIER.RigidBodyDesc
      .kinematicPositionBased().setTranslation(pos.x,
       pos.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.65,pos.z));
    const desc=mode==='HUMAN'
      ?RAPIER.ColliderDesc.capsule(
        PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
        PLAYER_CHARACTER_PHYSICS.humanRadiusMeters)
      :RAPIER.ColliderDesc.ball(PLAYER_CHARACTER_PHYSICS.squidRadiusMeters)
        .setTranslation(0,PLAYER_CHARACTER_PHYSICS.squidCenterOffsetYMeters,0);
    const collider=world.world.createCollider(desc,body);
    const ctl=createConfiguredPlayerCharacterController(world.world);
    ctl.computeColliderMovement(collider,{x:0,y:-1.8,z:0},
     undefined,undefined,c=>world.shouldCharacterCollide(c,mode));
    const corrected=ctl.computedMovement(),grounded=ctl.computedGrounded();
    console.log('PHASE14B_RAPIER_KCC',JSON.stringify({
     id,mode,requestedFallMeters:1.8,actualFallMeters:-corrected.y,grounded}));
    expect(Number.isFinite(corrected.y)).toBe(true);
    expect(-corrected.y).toBeGreaterThan(.2);
    expect(-corrected.y).toBeLessThan(1.35);
    expect(grounded).toBe(true);
    world.world.removeRigidBody(body);
    world.world.removeCharacterController(ctl);
   }
  }
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(stage.activationReady).toBe(false);
 });
 it('persists original footprint-backed team ink in GameplayInkSystem, without Turf score',()=>{
  const ink=new GameplayInkSystem();
  const items=selected.map(({id,solid,surface})=>{
   expect((surface.flags & SurfaceFlags.Paintable)!==0).toBe(true);
   expect((surface.flags & SurfaceFlags.Scoreable)===0).toBe(true);
   const paint=new PaintSurface(surface.id,new Vec3(...surface.center),
    new Vec3(...surface.uAxis),new Vec3(...surface.vAxis),
    surface.widthMeters,surface.heightMeters,
    solid.footprint!.cellSizeMeters,surface.flags,8,
    surface.footprint??solid.footprint);
   ink.registerSurface(paint);
   return {id,solid,surface,paint};
  });
  for(const {id,solid,surface,paint} of items){
   const p=interior(solid),uv=paint.projectWorldPoint(new Vec3(p.x,p.y+.002,p.z));
   expect(uv.inside).toBe(true);
   const team=id.includes('positive-z')?Team.A:Team.B;
   const result=ink.apply({tick:1,source:PaintSource.Debug,team,
    surfaceId:surface.id,centerU:uv.u,centerV:uv.v,radiusU:.25,
    radiusV:.25,angle:0,type:PaintEventType.Debug,strength:1});
   const sample=ink.sampleWorld(new Vec3(p.x,p.y+.002,p.z),.10,SurfaceFlags.Paintable);
   console.log('PHASE14B_GAMEPLAY_INK',JSON.stringify({
     id,changedCells:result.changedCells,owner:sample?.owner,
     surface:sample?.surface.id,scoreableArea:result.scoreableAreaMeters2Changed}));
   expect(result.changedCells).toBeGreaterThan(0);
   expect(result.scoreableAreaMeters2Changed).toBe(0);
   expect(sample?.surface.id).toBe(surface.id);
   expect(sample?.owner).toBe(team);
  }
  expect(ink.snapshot().areaA).toBe(0);
  expect(ink.snapshot().areaB).toBe(0);
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
 });
});