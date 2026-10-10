import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {CombatTargetSystem} from '../../combat/CombatTargetSystem';
import {PlayerResources} from '../../combat/PlayerResources';
import {PerformanceStats} from '../../core/PerformanceStats';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {SurfaceFlags,Team} from '../../ink/types';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import {PlayerController} from '../../player/PlayerController';
import {ProjectileSystem} from '../../projectile/ProjectileSystem';
import {DEFAULT_WEAPON_ID} from '../../weapons/WeaponCatalog';
import {defineTestSurfaces,PRODUCTION_STAGE_DEFINITION} from '../TestStage';
import {undertowT21dConnectivityQaStage} from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {nearestT21SourceSupportedLanding} from './UndertowPhase14ECpuHandoff';
import type {PaintRequest} from '../../ink/PaintCoordinator';
import type {CpuFireRequest} from '../../ai/CpuAgentSystem';

const DT=1/60;
const stage=undertowT21dConnectivityQaStage();
const landingSolid=stage.solids.find(s=>
 s.id==='UndertowT21D:first-drop-landing-negative-z')!;
const originalLink=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
function sourceFoot(){
  return nearestT21SourceSupportedLanding(landingSolid,{
    x:originalLink.start[0],y:originalLink.start[1],z:originalLink.start[2]
  });
}
function qaWorld(){
  const stats=new PerformanceStats();
  const physics=new RapierStagePhysics(DT,stage);
  physics.step();
  const ink=new GameplayInkSystem();
  const surfaces=defineTestSurfaces(ink,stage);
  const root=new Entity('T21_PHASE14N_REAL_PLAYER_AND_PROJECTILE');
  const app={root} as never;
  let move=0;
  const input={
    get moveX(){return 0;},
    get moveY(){return move;},
    get squidHeld(){return false;},
    get jumpHeld(){return false;},
    consumeJump(){return false;}
  } as PlayerInput;
  const camera={getFlatForward:(out:Vec3)=>out.set(0,0,1)} as ThirdPersonCamera;
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  player.setTeam(Team.A);
  const landing=sourceFoot();
  player.teleport(new Vec3(
    landing.x,landing.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,
    landing.z
  ));
  function tickPlayer(){
    player.computeFixed(DT);
    physics.step();
    player.syncAfterPhysics(DT);
  }
  return {stats,physics,ink,surfaces,app,player,landing,tickPlayer,
    setMove:(v:number)=>{move=v;}};
}
beforeAll(async()=>{await initializeRapier();});
afterEach(()=>vi.restoreAllMocks());

describe('T21 Phase14N original-source real PlayerController and actual CPU projectile path',()=>{
 it('lands a real player HUMAN capsule on the ORIGINAL masked first-drop collider at 60 Hz',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const w=qaWorld();
  const before=w.player.getPosition();
  for(let i=0;i<90;i++)w.tickPlayer();
  const after=w.player.getPosition();
  const physicalFootY=after.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  expect(before.y).toBeGreaterThan(after.y);
  expect(Math.abs(physicalFootY-w.landing.y)).toBeLessThan(.13);
  expect(w.stats.playerGrounded).toBe(true);
  expect(w.stats.playerCollider).toBe('CAPSULE');
  expect(w.player.currentMode).toBe('HUMAN');
  expect(w.ink.sampleWorld(
    new Vec3(after.x,w.landing.y+.04,after.z),.3,SurfaceFlags.Paintable
  )).not.toBeNull();
  const start=after.clone();
  w.setMove(.65);
  for(let i=0;i<12;i++)w.tickPlayer();
  const walked=w.player.getPosition();
  expect(walked.distance(start)).toBeGreaterThan(.01);
  expect(walked.distance(start)).toBeLessThan(1.5);
  expect(Number.isFinite(walked.y)).toBe(true);
  expect(stage.solids).toHaveLength(25);
  expect(stage.paintSurfaces).toHaveLength(17);
  expect(stage.navigationLinks).toHaveLength(26);
  expect(freeze.activationReady).toBe(false);
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  console.log('T21_PHASE14N_ACTUAL_PLAYER_KCC_SOURCE_FLOOR_PASS',JSON.stringify({
    originalSupport:landingSolid.id,footStart:before.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,
    physicalFootY,sourceFloorY:w.landing.y,grounded:w.stats.playerGrounded,
    moveMeters:walked.distance(start),mode:w.player.currentMode,
    sourceColliders:25,sourceInkSurfaces:17,sourceNavLinks:26,
    activationAuthorized:false
  }));
 });
 it('routes an actual ballistic CPU projectile into an original-source-grounded physical player and applies real HP damage',()=>{
  vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
  const w=qaWorld();
  for(let i=0;i<75;i++)w.tickPlayer();
  const playerBody=w.player.getPosition();
  const foot=w.landing;
  const directions=[new Vec3(1,0,0),new Vec3(-1,0,0),
    new Vec3(0,0,1),new Vec3(0,0,-1),
    new Vec3(.707,0,.707),new Vec3(-.707,0,.707),
    new Vec3(.707,0,-.707),new Vec3(-.707,0,-.707)];
  const candidate=directions.map(v=>{
    const point=new Vec3(playerBody.x+v.x*1.35,playerBody.y,playerBody.z+v.z*1.35);
    const ink=w.ink.sampleWorld(new Vec3(point.x,foot.y+.06,point.z),
      .34,SurfaceFlags.Paintable);
    const blocker=w.physics.castStageSegment(point,playerBody,'ink-projectile');
    return {point,ink,blocker};
  }).find(x=>x.ink&&!x.blocker);
  expect(candidate,'must find actual source-supported clear firing segment').toBeDefined();
  const origin=candidate!.point;
  const resources=new PlayerResources(w.stats);
  const paints:PaintRequest[]=[];
  const coordinator={enqueue:(request:PaintRequest)=>paints.push(request)};
  const combat=new CombatTargetSystem(w.app,w.stats);
  const feedback={updateChargeVisual:vi.fn(),shot:vi.fn(),impact:vi.fn(),
    stringerFuse:vi.fn(),stringerBurst:vi.fn(),melee:vi.fn(),beam:vi.fn()};
  const cpu={findNearestCombatHit:()=>null,applyAreaDamage:()=>0,
    applyProjectileHit:()=>null};
  const projectiles=new ProjectileSystem(
    w.app,w.surfaces,w.physics,coordinator as never,resources,combat,
    cpu as never,feedback as never,w.stats
  );
  const request:CpuFireRequest={
    sourceId:'B1',team:Team.B,origin:origin.clone(),
    bodyPosition:new Vec3(origin.x,foot.y,origin.z),
    target:playerBody.clone(),weaponId:DEFAULT_WEAPON_ID,
    charge:0,action:'PROJECTILE'
  };
  projectiles.queueCpuShot(request);
  const oldHp=resources.currentHp;
  for(let i=0;i<55 && resources.currentHp===oldHp;i++){
    projectiles.fixedUpdate(DT,false,false,playerBody,
      new Vec3(0,0,1),Team.A,playerBody,false,true);
  }
  expect(resources.currentHp).toBeLessThan(oldHp);
  expect(w.stats.cpuPlayerHits).toBeGreaterThanOrEqual(1);
  expect(w.stats.projectileImpacts).toBeGreaterThanOrEqual(1);
  expect(feedback.shot).toHaveBeenCalled();
  for(const paint of paints){
    expect(stage.paintSurfaces.some(s=>s.id===paint.surfaceId)).toBe(true);
  }
  expect(w.ink.snapshot().areaA).toBe(0);
  expect(w.ink.snapshot().areaB).toBe(0);
  console.log('T21_PHASE14N_REAL_CPU_PROJECTILE_HITS_PHYSICAL_PLAYER',JSON.stringify({
    sourceId:request.sourceId,playerPhysics:'REAL_PLAYER_CONTROLLER_RAPIER_KCC',
    projectilePhysics:'REAL_PROJECTILE_SYSTEM_60HZ',
    weaponId:DEFAULT_WEAPON_ID,sourceFloor:w.landing.y,
    projectileOrigin:[origin.x,origin.y,origin.z],
    playerTarget:[playerBody.x,playerBody.y,playerBody.z],
    clearOriginalSourceRay:true,hpBefore:oldHp,hpAfter:resources.currentHp,
    confirmedCpuPlayerHits:w.stats.cpuPlayerHits,
    projectileImpacts:w.stats.projectileImpacts,
    originalSourcePaintRequests:paints.length,sourceScoreableArea:0,
    realUserInput:false,realFull4v4Match:false,activationAuthorized:false
  }));
 });
});
