import {Entity,Vec3} from 'playcanvas';
import {beforeAll,afterEach,describe,expect,it,vi} from 'vitest';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {Team} from '../../ink/types';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PRODUCTION_STAGE_DEFINITION} from '../StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {undertowTemple01ModelXZToProjectXZ}
 from './UndertowSpillwayModelXZGeometry';

// Only SOURCE-backed interior paths, never hand-authored floors or a route
// that pretends a void is walkable. These positions are model-space seeds
// against existing frozen Temple01 polygons; the actual Rapier collider is
// verified at runtime before a single movement tick is accepted.
const ROUTES=[
 {id:'SPAWN_POSITIVE',modelStart:[-22,59] as const,
  modelEnd:[-22,61] as const,y:7.5,
  support:'UndertowT21D:spawn-high-positive-z'},
 {id:'SPAWN_NEGATIVE',modelStart:[22,-59] as const,
  modelEnd:[22,-61] as const,y:7.5,
  support:'UndertowT21D:spawn-high-negative-z'},
 {id:'LANDING_POSITIVE',modelStart:[-22.5,43] as const,
  modelEnd:[-22.5,45] as const,y:3,
  support:'UndertowT21D:first-drop-landing-positive-z'},
 {id:'LANDING_NEGATIVE',modelStart:[22.5,-43] as const,
  modelEnd:[22.5,-45] as const,y:3,
  support:'UndertowT21D:first-drop-landing-negative-z'}
] as const;
const DT=1/60;
beforeAll(async()=>{await initializeRapier();});
afterEach(()=>vi.restoreAllMocks());

describe('W4: real Human KCC on four original-source supported walk interiors',()=>{
 for(const route of ROUTES){
  it(route.id+' retains genuine Rapier ground contact while moving',()=>{
   vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
   const stage=undertowT21dConnectivityQaStage();
   expect(stage.solids).toBe(freeze.solids);
   expect(stage.paintSurfaces).toBe(freeze.paintSurfaces);
   expect(stage.navigationLinks).toBe(freeze.navigationLinks);
   expect(stage.solids.length).toBe(25);
   expect(stage.paintSurfaces.length).toBe(17);
   expect(stage.navigationLinks?.length).toBe(26);
   expect(freeze.activationReady).toBe(false);
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
   const physics=new RapierStagePhysics(DT,stage);
   physics.step();
   const [sx,sz]=undertowTemple01ModelXZToProjectXZ(route.modelStart);
   const [ex,ez]=undertowTemple01ModelXZToProjectXZ(route.modelEnd);
   const bearing=new Vec3(ex-sx,0,ez-sz).normalize();
   const goalMeters=Math.hypot(ex-sx,ez-sz);
   // A vertical query verifies each endpoint and intermediate source floor.
   // Casting is read-only; never mutates StageDefinition or any collider.
   const sourceSupport=(x:number,z:number)=>{
    const hit=physics.castStageSegment(new Vec3(x,route.y+.8,z),
     new Vec3(x,route.y-.8,z),'ink-projectile');
    return hit?.solidId??null;
   };
   for(let u=0;u<=8;u++){
    const t=u/8;
    const x=sx+(ex-sx)*t,z=sz+(ez-sz)*t;
    expect(sourceSupport(x,z),route.id+' source-backed floor sample '+u)
     .toBe(route.support);
   }
   let forward=0;
   const input={
    get moveX(){return 0;},get moveY(){return forward;},
    get squidHeld(){return false;},get jumpHeld(){return false;},
    consumeJump(){return false;}
   } as PlayerInput;
   const camera=({
    getFlatForward:(out:Vec3)=>out.copy(bearing)
   }) as ThirdPersonCamera;
   const stats=new PerformanceStats(),ink=new GameplayInkSystem();
   const app={root:new Entity('W4_REAL_SOURCE_INTERIOR_KCC')} as never;
   const player=new PlayerController(app,physics,input,camera,ink,stats);
   player.setTeam(Team.A);
   player.teleport(new Vec3(sx,route.y+
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,sz));
   let groundedSettleTicks=0;
   for(let frame=0;frame<75;frame++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
    if(stats.playerGrounded)groundedSettleTicks++;
   }
   const settled=player.getPosition();
   const settledFootY=settled.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   expect(settledFootY,route.id+' initial settling')
    .toBeGreaterThan(route.y-.055);
   expect(settledFootY,route.id+' initial settling')
    .toBeLessThan(route.y+.055);
   expect(groundedSettleTicks).toBeGreaterThan(10);

   forward=1;
   let traveled=0,airborne=0,unsupported=0,minFootY=Infinity,maxFootY=-Infinity;
   let last=player.getPosition().clone();
   for(let frame=0;frame<28;frame++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
    const current=player.getPosition().clone();
    const d=Math.hypot(current.x-last.x,current.z-last.z);
    traveled+=d;
    if(!stats.playerGrounded)airborne++;
    const footY=current.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minFootY=Math.min(minFootY,footY);maxFootY=Math.max(maxFootY,footY);
    if(sourceSupport(current.x,current.z)!==route.support)unsupported++;
    last=current;
   }
   const audit={route:route.id,sourceSolidId:route.support,
    realKccFrames:28,groundedSettleTicks,traveledMeters:traveled,
    intendedDistanceMeters:goalMeters,airborneFrames:airborne,
    unsupportedFootprints:unsupported,minFootY,maxFootY,
    originalSolidsAdded:0,navLinksAdded:0,scoreablePromotions:0,
    sourceAuthoritative:true,sourceStageModified:false,
    productionApproved:false,fullRouteCertified:false};
   console.log('T21_W4_SOURCE_INTERIOR_KCC',JSON.stringify(audit));
   expect(traveled).toBeGreaterThan(.35);
   // Endpoints are source-floor witnesses, not an artificial movement cap.
   // Full-speed Human KCC may travel nearly the entire 2.074m test segment.
   // Every measured foot is independently checked against the real solid.
   expect(traveled).toBeLessThan(goalMeters+.08);
   expect(airborne).toBe(0);
   expect(unsupported).toBe(0);
   expect(minFootY).toBeGreaterThan(route.y-.06);
   expect(maxFootY).toBeLessThan(route.y+.06);
  });
 }
});


describe('W4: original first-drop landing edge is not an invented bridge',()=>{
 for(const mirror of [false,true]){
  it((mirror?'NEGATIVE':'POSITIVE')+' detects a real KCC departure from frozen landing support',()=>{
   vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
   const stage=undertowT21dConnectivityQaStage();
   const physics=new RapierStagePhysics(DT,stage);
   physics.step();
   const reflect=(x:number,z:number)=>mirror?[-x,-z] as const:[x,z] as const;
   const [sx,sz]=undertowTemple01ModelXZToProjectXZ(reflect(-22.5,47));
   const [ex,ez]=undertowTemple01ModelXZToProjectXZ(reflect(-22.5,54));
   const footSource='UndertowT21D:first-drop-landing-'+
    (mirror?'negative-z':'positive-z');
   const ray=(x:number,z:number)=>{
    const hit=physics.castStageSegment(
     new Vec3(x,3.8,z),new Vec3(x,2.2,z),'ink-projectile');
    return hit?.solidId??null;
   };
   expect(ray(sx,sz)).toBe(footSource);
   // An endpoint beyond this particular audited floor must not be
   // reclassified as that floor just to make a forward test pass.
   expect(ray(ex,ez)).not.toBe(footSource);
   const bearing=new Vec3(ex-sx,0,ez-sz).normalize();
   let axis=0;
   const input={get moveX(){return 0;},get moveY(){return axis;},
    get squidHeld(){return false;},get jumpHeld(){return false;},
    consumeJump(){return false;}} as PlayerInput;
   const camera=({getFlatForward:(out:Vec3)=>out.copy(bearing)}) as ThirdPersonCamera;
   const stats=new PerformanceStats(),ink=new GameplayInkSystem();
   const player=new PlayerController(
    {root:new Entity('W4_SOURCE_EDGE_PHYSICS')} as never,
    physics,input,camera,ink,stats);
   player.setTeam(Team.A);
   player.teleport(new Vec3(sx,3+
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,sz));
   for(let i=0;i<75;i++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
   }
   expect(stats.playerGrounded).toBe(true);
   let airborne=0,leftSource=0,firstAirborne=-1,firstLostFoot=-1;
   let maxDistance=0;
   axis=1;
   for(let frame=1;frame<=86;frame++){
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
    const p=player.getPosition();
    maxDistance=Math.max(maxDistance,Math.hypot(p.x-sx,p.z-sz));
    if(!stats.playerGrounded){
     airborne++;if(firstAirborne<0)firstAirborne=frame;
    }
    if(ray(p.x,p.z)!==footSource){
     leftSource++;if(firstLostFoot<0)firstLostFoot=frame;
    }
   }
   const end=player.getPosition();
   const evidence={side:mirror?'NEGATIVE_Z':'POSITIVE_Z',
    originalLandingSolid:footSource,airborneTicks:airborne,
    framesOutsideNamedFloor:leftSource,
    firstAirborneFrame:firstAirborne,firstNonLandingRayFrame:firstLostFoot,
    traveledHorizontalMeters:maxDistance,finalY:end.y,
    sourceFloorAdded:0,navLinkAdded:0,
    notAClaimOfOriginalGameDeathThreshold:true,
    originalActivationReady:freeze.activationReady};
   console.log('T21_W4_ORIGINAL_FLOOR_EDGE_KCC',JSON.stringify(evidence));
   expect(maxDistance).toBeGreaterThan(3);
   expect(leftSource).toBeGreaterThan(0);
   expect(airborne).toBeGreaterThan(0);
   expect(freeze.activationReady).toBe(false);
   expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  });
 }
});
