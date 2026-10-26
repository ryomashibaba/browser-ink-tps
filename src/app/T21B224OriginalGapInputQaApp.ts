/**
 * B224 isolated actual keyboard -> PlayerInput -> PlayerController -> Rapier QA.
 * Not a game route. Not production. Source-local initial spawn only.
 * The immutable source stage's 25 solids remain intact, and two previously
 * CI688-extracted original faces are appended to this temporary QA world.
 */
import {
 AppBase,AppOptions,CameraComponentSystem,Color,ContainerHandler,
 createGraphicsDevice,DEVICETYPE_WEBGL2,Entity,FILLMODE_FILL_WINDOW,
 RenderComponentSystem,RESOLUTION_AUTO,TextureHandler,Vec3
} from 'playcanvas';
import {GAME_CONFIG} from '../config/game/gameConfig';
import {PerformanceStats} from '../core/PerformanceStats';
import {GameplayInkSystem} from '../ink/GameplayInkSystem';
import {PlayerInput} from '../input/PlayerInput';
import {ThirdPersonCamera} from '../camera/ThirdPersonCamera';
import {PLAYER_CHARACTER_PHYSICS} from '../player/PlayerCharacterPhysics';
import {PlayerController} from '../player/PlayerController';
import {RapierStagePhysics,initializeRapier} from '../physics/RapierStagePhysics';
import type {StageDefinition,StageSolidDefinition,StageVector3} from '../stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_UNDERPASS_ROUTE_COMPONENTS as FACES}
 from '../stage/undertow/UndertowSpillwayUnderpassRouteGeometry';
import {undertowTemple01ModelXZToProjectXZ}
 from '../stage/undertow/UndertowSpillwayModelXZGeometry';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
type Direction='FLOOR_TO_SLOPE'|'SLOPE_TO_FLOOR';
const DT=1/60;
const faceId=(kind:string,side:Side)=>'underpass-route-'+kind+
 (side==='POSITIVE_Z'?'-positive-z':'-negative-z');
const point=(x:number,y:number,z:number,side:Side):StageVector3=>{
 const [px,pz]=undertowTemple01ModelXZToProjectXZ(
  side==='POSITIVE_Z'?[x,z]:[-x,-z]);
 return [px,y-3,pz];
};
const floor=(side:Side)=>point(-6,3,21.9,side);
const slope=(side:Side)=>point(-6,3+(19.5-19.1)/3,19.1,side);
function exactQaStage(side:Side):StageDefinition{
 if(FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||FROZEN.activationReady!==false)
  throw Error('B224_SOURCE_AUTHORITY_DRIFT');
 const exact=['floor-concrete01','slope00-outer'].map(kind=>{
  const id=faceId(kind,side);
  const record=FACES.find(f=>f.id===id);
  if(!record)throw Error('B224_MISSING_CI688_SOURCE_'+id);
  const vertices=record.mesh.vertices;
  const dim=(axis:0|1|2)=>Math.max(...vertices.map(v=>v[axis]))-
   Math.min(...vertices.map(v=>v[axis]));
  const solid:StageSolidDefinition={
   id:'B224_QA_ONLY:'+id,center:[0,0,0],size:[dim(0),dim(1),dim(2)],
   render:false,material:'medium',cameraBlocker:false,projectileBlocker:false,
   collisionEnabled:true,navigationEnabled:false,triangleMesh:record.mesh
  };
  return solid;
 });
 return {
  metadata:{id:'b224-original-input-qa',displayName:'B224 isolated input QA',
   worldBounds:FROZEN.worldBounds,teamASpawn:[0,0,0],
   teamBSpawn:[0,0,0],teamASpawnSlots:[[0,0,0]],
   teamBSpawnSlots:[[0,0,0]],tacticalNodes:[],splatZones:[]},
  solids:[...FROZEN.solids,...exact],
  paintSurfaces:FROZEN.paintSurfaces,
  navigationLinks:FROZEN.navigationLinks
 };
}
export class T21B224OriginalGapInputQaApp{
 static async boot(canvas:HTMLCanvasElement,_ui:HTMLElement){
  const q=new URL(location.href).searchParams;
  if(q.get('t21Qa')!=='b224OriginalGapInput'||
     q.get('t21B224Source')!=='isolated-ci688')
   throw Error('B224_EXPLICIT_SOURCE_QA_ONLY');
  const side=q.get('side'),direction=q.get('direction');
  if((side!=='POSITIVE_Z'&&side!=='NEGATIVE_Z')||
     (direction!=='FLOOR_TO_SLOPE'&&direction!=='SLOPE_TO_FLOOR'))
   throw Error('B224_EXPLICIT_SIDE_AND_DIRECTION_REQUIRED');
  await initializeRapier();
  const device=await createGraphicsDevice(canvas,{
   deviceTypes:[DEVICETYPE_WEBGL2],antialias:false,depth:true,stencil:false,
   powerPreference:'high-performance'});
  const options=new AppOptions();
  options.graphicsDevice=device;
  options.componentSystems=[RenderComponentSystem,CameraComponentSystem];
  options.resourceHandlers=[TextureHandler,ContainerHandler];
  const app=new AppBase(canvas);app.init(options);
  app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(RESOLUTION_AUTO);
  const stage=exactQaStage(side);
  const physics=new RapierStagePhysics(DT,stage);physics.step();
  const cameraEntity=new Entity('B224QA:Camera');
  const world=app.scene.layers.getLayerByName('World');
  cameraEntity.addComponent('camera',{
   clearColor:new Color(.025,.045,.075,1),nearClip:.08,farClip:250,fov:63,
   layers:world?[world.id]:undefined});
  app.root.addChild(cameraEntity);
  const stats=new PerformanceStats(),ink=new GameplayInkSystem();
  const input=new PlayerInput(canvas);
  const camera=new ThirdPersonCamera(canvas,cameraEntity,[],physics);
  const player=new PlayerController(app,physics,input,camera,ink,stats);
  const start=direction==='FLOOR_TO_SLOPE'?floor(side):slope(side);
  const target=direction==='FLOOR_TO_SLOPE'?slope(side):floor(side);
  const startSolid='B224_QA_ONLY:'+faceId(
   direction==='FLOOR_TO_SLOPE'?'floor-concrete01':'slope00-outer',side);
  const endSolid='B224_QA_ONLY:'+faceId(
   direction==='FLOOR_TO_SLOPE'?'slope00-outer':'floor-concrete01',side);
  // Only initial QA spawn. Absolutely no actor pose reassignment afterwards.
  player.teleport(new Vec3(start[0],start[1]+
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.06,start[2]));
  let accumulated=0,tick=0,ready=false,leftGround=false,landed=false;
  let validJumpInputs=0,firstJumpTick:number|null=null;
  let successTick:number|null=null,minimumTargetError=Infinity;
  let furthestTravel=0;
  let initialSupport:string|null=null,firstLandingSupport:string|null=null;
  let originalColliderContactCount=0;
  let finishAtSuccess:null|[number,number,number]=null;
  let physicallyEnteredTarget=false,groundedAtSuccess=false;
  let lastInputX=0,lastInputY=0;
  const vec=new Vec3();
  const floorHit=()=>{
   const p=player.getPosition(vec);
   return physics.castCharacterFootSupport(p,
    PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN')?.solidId??null;
  };
  // Pure observation of real keyboard event; never drives movement.
  window.addEventListener('keydown',event=>{
   if(event.code==='Space'&&!event.repeat&&
      document.pointerLockElement===canvas){
    validJumpInputs++;
    firstJumpTick??=tick;
   }
  });
  const snapshot=()=>{
   const p=player.getPosition(new Vec3());
   const err=Math.hypot(p.x-target[0],p.z-target[2]);
   return {schema:'B224_PLAYER_INPUT_NATIVE_SOURCE_QA',
    ready,tick,side,direction,
    actualPlayerInput:true,actualPlayerController:true,actualRapier:true,
    source:'CI688_EXACT_SOURCE_FACES',physicalSolidsInsideQa:27,
    originalSolidsStill25:FROZEN.solids.length===25,
    originalPaintStill17:FROZEN.paintSurfaces.length===17,
    originalNavLinksStill26:FROZEN.navigationLinks.length===26,
    sourceScoreablePromotions:0,qaOnly:true,productionAuthorized:false,
    originalCrossTeamRoutesCertified:'0/12',officialWinner:'NONE',
    pointerLocked:document.pointerLockElement===canvas,
    inputAxis:[input.moveX,input.moveY],
    actualCameraYawDegrees:camera.sourcePracticeViewSnapshot().yawDegrees,
    lastFixedInputAxis:[lastInputX,lastInputY],
    validJumpInputs,firstJumpTick,realWorldTick:tick,
    playerPosition:[p.x,p.y,p.z],
    start,target,
    grounded:stats.playerGrounded,leftGround,landed,
    currentFootSolid:floorHit(),
    initialSupport,firstLandingSupport,
    minimumTargetErrorMeters:Number.isFinite(minimumTargetError)?minimumTargetError:null,
    furthestTravelMeters:furthestTravel,
    originalColliderContactCount,
    physicallyEnteredTarget,groundedAtSuccess,successTick,
    finishAtSuccess,teleportsAfterQaSpawn:0,
    noNavMeshCertification:true};
  };
  (window as unknown as {__t21B224?:{snapshot:typeof snapshot}}).__t21B224=
   {snapshot};
  app.on('update',(seconds:number)=>{
   accumulated+=Math.min(.1,Math.max(0,seconds));
   let steps=0;
   while(accumulated>=DT&&steps<8){
    accumulated-=DT;steps++;tick++;
    lastInputX=input.moveX;lastInputY=input.moveY;
    player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
    if(tick===1)initialSupport=floorHit();
    if(tick>8&&!ready&&stats.playerGrounded)
     ready=initialSupport===startSolid||floorHit()===startSolid;
    if(ready){
     const p=player.getPosition(new Vec3());
     const dist=Math.hypot(p.x-target[0],p.z-target[2]);
     const travel=Math.hypot(p.x-start[0],p.z-start[2]);
     furthestTravel=Math.max(furthestTravel,travel);
     minimumTargetError=Math.min(minimumTargetError,dist);
     if(!stats.playerGrounded&&validJumpInputs>0)leftGround=true;
     if(leftGround&&stats.playerGrounded)landed=true;
     const support=floorHit();
     if(landed&&support===endSolid)firstLandingSupport??=support;
     if(dist<=.22&&stats.playerGrounded&&support===endSolid){
      physicallyEnteredTarget=true;
      if(successTick===null&&validJumpInputs>0&&leftGround&&landed){
       successTick=tick;groundedAtSuccess=true;
       finishAtSuccess=[p.x,p.y,p.z];
      }
     }
     // Actual PlayerController KCC contacts only, not a proxy raycast.
     for(const h of player.qaActualKccComputedColliderHandles()){
      const c=physics.world.getCollider(h);
      const id=c?physics.sourceSolidIdForCollider(c):null;
      if(id&&FROZEN.solids.some(s=>s.id===id))
       originalColliderContactCount++;
     }
    }
   }
   camera.update(player.getPosition(new Vec3()),Math.min(.1,seconds));
  });
  window.addEventListener('resize',()=>app.resizeCanvas());
  camera.update(player.getPosition(new Vec3()));
  app.start();
 }
}
