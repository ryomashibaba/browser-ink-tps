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
function exactQaStage(side:Side,corridor=false):StageDefinition{
 if(FROZEN.solids.length!==25||FROZEN.paintSurfaces.length!==17||
    FROZEN.navigationLinks.length!==26||FROZEN.activationReady!==false)
  throw Error('B224_SOURCE_AUTHORITY_DRIFT');
 const exact=(corridor?
  ['floor-concrete01','slope00-outer','floor-concrete02','slope00-inner','slope01']:
  ['floor-concrete01','slope00-outer']).map(kind=>{
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
  const b228=q.get('t21Qa')==='b228UnderpassInput'&&
    q.get('t21B228Source')==='isolated-ci688';
  const b226=b228||(q.get('t21Qa')==='b226InnerSlopeInput'&&
    q.get('t21B226Source')==='isolated-ci688');
  const corridor=b226||(q.get('t21Qa')==='b225OriginalCorridorInput'&&
    q.get('t21B225Source')==='isolated-ci688');
  if(!corridor&&(q.get('t21Qa')!=='b224OriginalGapInput'||
     q.get('t21B224Source')!=='isolated-ci688'))
   throw Error('B224_B225_EXPLICIT_SOURCE_QA_ONLY');
  const side=q.get('side'),direction=q.get('direction');
  if((side!=='POSITIVE_Z'&&side!=='NEGATIVE_Z')||
     (direction!=='FLOOR_TO_SLOPE'&&direction!=='SLOPE_TO_FLOOR'))
   throw Error('B224_EXPLICIT_SIDE_AND_DIRECTION_REQUIRED');
  if(corridor&&direction!=='FLOOR_TO_SLOPE')
   throw Error('B225_REQUIRES_CONTINUOUS_FORWARD_ROUTE');
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
  const stage=exactQaStage(side,corridor);
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
  // This endpoint lies on the *exact* FloorConcrete02 original triangles.
  // It is not a bridge surface, NavMesh point, or manufactured collider.
  const b225NextTarget=point(-6,4.5,14.30,side);
  const b225NextSolid='B224_QA_ONLY:'+faceId('floor-concrete02',side);
  // B226 follows same character from the B225 second landing.
  // Both target positions are interior to original CI688 extracted faces.
  const b226Waypoint=point(-12.1,4.5,12.2,side);
  const b226InnerTarget=point(-12.05,3+(10.15-6)/3,10.15,side);
  const b226InnerId='B224_QA_ONLY:'+faceId('slope00-inner',side);
  // B227 confirmed a real ORIGINAL 25-solid underpass floor here,
  // distinct from all five CI688 source QA meshes.
  const b228UnderpassTarget=point(-12.1,3,5.5,side);
  const b228UnderpassSolid='UndertowT21D:glass-underpass-'+
   (side==='POSITIVE_Z'?'positive-z':'negative-z');
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
  let stableTargetGroundedTicks=0,stableLandingTick:number|null=null;
  let stableLandingPosition:null|[number,number,number]=null;
  let closestGroundedTargetErrorMeters=Infinity;
  let lastInputX=0,lastInputY=0;
  let b225FirstGroundedTargetTick:number|null=null;
  let b225StableNextTick:number|null=null,b225StableNextTicks=0;
  let b225MinNextErrorMeters=Infinity;
  let b225NativeNextSupportedTicks=0,b225FirstNextSupportTick:number|null=null;
  let b225NativeSourceSupportOrder:string[]=[];
  let b225NativeSourceSupportTransitions=0;
  let b225LastSupportedId:string|null=null;
  let b225NativeAfterFirstLandingTicks=0;
  let b225SecondLegNoJumpInputsAtStart:number|null=null;
  let b225SecondLegStartedTick:number|null=null;
  let b225SecondLegUngroundedTicks=0,b225SecondLegGroundedTicks=0;
  let b225LongestUngroundedStreak=0,b225CurrentUngroundedStreak=0;
  let b226ThirdLegStartTick:number|null=null;
  let b226ActualInnerSupportTick:number|null=null;
  let b226StableInnerTick:number|null=null,b226StableInnerGroundedTicks=0;
  let b226ThirdLegGroundedTicks=0,b226ThirdLegUngroundedTicks=0;
  let b226ThirdLegLongestAirborneStreak=0,b226CurrentAirborneStreak=0;
  let b226NearestInnerMeters=Infinity;
  let b226WaypointNearestMeters=Infinity;
  let b226VisitedWaypoint=false;
  let b226ThirdLegJumpEventsAtStart:number|null=null;
  let b228FourthLegStartTick:number|null=null,b228FirstNativeFootTick:number|null=null;
  let b228StableNativeTick:number|null=null,b228StableNativeTicks=0;
  let b228NativeGroundedTicks=0,b228NativeUngroundedTicks=0;
  let b228MinUnderpassErrorMeters=Infinity;
  let b228ClosestNativeGroundedErrorMeters=Infinity;
  let b228NativeColliderSupportTicks=0;
  let b228LastNativeFootId:string|null=null;
  let b228FootTransitionSourceToRegistered=false;
  let b228NativeSupportBeforeFourth=false;
  let b228WasOnInnerWhenFourthStarted=false;
  let b228AtFourthJumpInputs:number|null=null;
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
    source:'CI688_EXACT_SOURCE_FACES',
    physicalSolidsInsideQa:corridor?30:27,
    b225CorridorEnabled:corridor,
    b226Enabled:b226,b226Waypoint,b226InnerTarget,b226InnerId,
    b228Enabled:b228,b228UnderpassTarget,b228UnderpassSolid,
    b228FourthLegStartTick,b228FirstNativeFootTick,b228StableNativeTick,
    b228StableNativeTicks,b228NativeGroundedTicks,b228NativeUngroundedTicks,
    b228NativeColliderSupportTicks,b228LastNativeFootId,
    b228FootTransitionSourceToRegistered,
    b228NativeSupportBeforeFourth,b228WasOnInnerWhenFourthStarted,
    b228AtFourthJumpInputs,
    b228MinUnderpassErrorMeters:Number.isFinite(b228MinUnderpassErrorMeters)?
     b228MinUnderpassErrorMeters:null,
    b228ClosestNativeGroundedErrorMeters:
     Number.isFinite(b228ClosestNativeGroundedErrorMeters)?
      b228ClosestNativeGroundedErrorMeters:null,
    b226ThirdLegStartTick,b226ActualInnerSupportTick,b226StableInnerTick,
    b226StableInnerGroundedTicks,b226ThirdLegGroundedTicks,
    b226ThirdLegUngroundedTicks,b226ThirdLegLongestAirborneStreak,
    b226NearestInnerMeters:Number.isFinite(b226NearestInnerMeters)?
       b226NearestInnerMeters:null,
    b226WaypointNearestMeters:Number.isFinite(b226WaypointNearestMeters)?
       b226WaypointNearestMeters:null,
    b226VisitedWaypoint,b226ThirdLegJumpEventsAtStart,
    b225NextTarget,b225NextSolid,
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
    finishAtSuccess,stableTargetGroundedTicks,stableLandingTick,
    stableLandingPosition,
    closestGroundedTargetErrorMeters:Number.isFinite(closestGroundedTargetErrorMeters)?closestGroundedTargetErrorMeters:null,
    b225FirstGroundedTargetTick,
    b225StableNextTick,b225StableNextTicks,
    b225MinNextErrorMeters:Number.isFinite(b225MinNextErrorMeters)?
      b225MinNextErrorMeters:null,
    b225NativeNextSupportedTicks,b225FirstNextSupportTick,
    b225NativeSourceSupportOrder,b225NativeSourceSupportTransitions,
    b225NativeAfterFirstLandingTicks,b225SecondLegNoJumpInputsAtStart,
    b225SecondLegStartedTick,
    b225SecondLegUngroundedTicks,b225SecondLegGroundedTicks,
    b225LongestUngroundedStreak,
    teleportsAfterQaSpawn:0,
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
     if(corridor&&stats.playerGrounded&&support?.startsWith('B224_QA_ONLY:')){
      if(support!==b225LastSupportedId){
       b225NativeSourceSupportTransitions++;
       b225NativeSourceSupportOrder.push(support);
      }
      b225LastSupportedId=support;
     }
     if(landed&&support===endSolid)firstLandingSupport??=support;
     if(landed&&stats.playerGrounded&&support===endSolid&&
        validJumpInputs===1&&input.moveX===0&&input.moveY===0){
      stableTargetGroundedTicks++;
      closestGroundedTargetErrorMeters=Math.min(
       closestGroundedTargetErrorMeters,dist);
      if(stableTargetGroundedTicks>=18&&dist<=.60&&stableLandingTick===null){
       stableLandingTick=tick;
       stableLandingPosition=[p.x,p.y,p.z];
      }
     }else{
      stableTargetGroundedTicks=0;
     }
     if(corridor&&stableLandingTick!==null){
      if(b225SecondLegStartedTick===null&&
         (input.moveX!==0||input.moveY!==0)){
       b225SecondLegStartedTick=tick;
       b225SecondLegNoJumpInputsAtStart=validJumpInputs;
      }
      if(b225SecondLegStartedTick!==null&&b225StableNextTick===null){
       if(stats.playerGrounded){
        b225SecondLegGroundedTicks++;
        b225CurrentUngroundedStreak=0;
       }else{
        b225SecondLegUngroundedTicks++;
        b225CurrentUngroundedStreak++;
        b225LongestUngroundedStreak=Math.max(
         b225LongestUngroundedStreak,b225CurrentUngroundedStreak);
       }
      }
      b225NativeAfterFirstLandingTicks++;
      const nextError=Math.hypot(p.x-b225NextTarget[0],p.z-b225NextTarget[2]);
      b225MinNextErrorMeters=Math.min(b225MinNextErrorMeters,nextError);
      if(stats.playerGrounded&&support===b225NextSolid){
       b225NativeNextSupportedTicks++;
       b225FirstNextSupportTick??=tick;
       if(b225FirstGroundedTargetTick===null)
        b225FirstGroundedTargetTick=tick;
       if(input.moveX===0&&input.moveY===0&&
          nextError<=.85&&validJumpInputs===1){
        b225StableNextTicks++;
        if(b225StableNextTicks>=18&&b225StableNextTick===null)
         b225StableNextTick=tick;
       }else b225StableNextTicks=0;
      }else b225StableNextTicks=0;
     }
     if(b226&&b225StableNextTick!==null){
      const toWaypoint=Math.hypot(
       p.x-b226Waypoint[0],p.z-b226Waypoint[2]);
      const toInner=Math.hypot(
       p.x-b226InnerTarget[0],p.z-b226InnerTarget[2]);
      b226WaypointNearestMeters=Math.min(b226WaypointNearestMeters,toWaypoint);
      b226NearestInnerMeters=Math.min(b226NearestInnerMeters,toInner);
      if(stats.playerGrounded&&support===b225NextSolid&&toWaypoint<.75)
       b226VisitedWaypoint=true;
      if(b226ThirdLegStartTick===null&&
         (input.moveX!==0||input.moveY!==0)){
       b226ThirdLegStartTick=tick;
       b226ThirdLegJumpEventsAtStart=validJumpInputs;
      }
      if(b226ThirdLegStartTick!==null&&b226StableInnerTick===null){
       if(stats.playerGrounded){
        b226ThirdLegGroundedTicks++;
        b226CurrentAirborneStreak=0;
       }else{
        b226ThirdLegUngroundedTicks++;
        b226CurrentAirborneStreak++;
        b226ThirdLegLongestAirborneStreak=Math.max(
         b226ThirdLegLongestAirborneStreak,b226CurrentAirborneStreak);
       }
       if(stats.playerGrounded&&support===b226InnerId){
        b226ActualInnerSupportTick??=tick;
        if(input.moveX===0&&input.moveY===0&&
           toInner<.90&&validJumpInputs===1){
         b226StableInnerGroundedTicks++;
         if(b226StableInnerGroundedTicks>=18)
          b226StableInnerTick??=tick;
        }else b226StableInnerGroundedTicks=0;
       }else b226StableInnerGroundedTicks=0;
      }
     }
     if(b228&&b226StableInnerTick!==null){
      const nativeDist=Math.hypot(
       p.x-b228UnderpassTarget[0],p.z-b228UnderpassTarget[2]);
      b228MinUnderpassErrorMeters=Math.min(
       b228MinUnderpassErrorMeters,nativeDist);
      if(b228FourthLegStartTick===null){
       if(support===b228UnderpassSolid)
        b228NativeSupportBeforeFourth=true;
       if(input.moveX!==0||input.moveY!==0){
        b228FourthLegStartTick=tick;
        b228WasOnInnerWhenFourthStarted=
         stats.playerGrounded&&support===b226InnerId;
        b228AtFourthJumpInputs=validJumpInputs;
       }
      }
      if(b228FourthLegStartTick!==null){
       if(stats.playerGrounded)b228NativeGroundedTicks++;
       else b228NativeUngroundedTicks++;
       if(support===b228UnderpassSolid&&stats.playerGrounded){
        b228FirstNativeFootTick??=tick;
        b228NativeColliderSupportTicks++;
        b228LastNativeFootId=support;
        b228ClosestNativeGroundedErrorMeters=Math.min(
         b228ClosestNativeGroundedErrorMeters,nativeDist);
        if(input.moveX===0&&input.moveY===0&&
           nativeDist<=.90&&validJumpInputs===1){
         b228StableNativeTicks++;
         if(b228StableNativeTicks>=18)
          b228StableNativeTick??=tick;
        }else b228StableNativeTicks=0;
       }else{
        if(support===b226InnerId)b228LastNativeFootId=support;
        b228StableNativeTicks=0;
       }
       if(b228FirstNativeFootTick!==null&&
          b228WasOnInnerWhenFourthStarted&&
          !b228NativeSupportBeforeFourth)
        b228FootTransitionSourceToRegistered=true;
      }
     }
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
