import {Entity,Vec3} from 'playcanvas';
import {afterEach,beforeAll,describe,expect,it,vi} from 'vitest';
import {PlayerController} from '../../player/PlayerController';
import {PLAYER_CHARACTER_PHYSICS} from '../../player/PlayerCharacterPhysics';
import type {PlayerInput} from '../../input/PlayerInput';
import type {ThirdPersonCamera} from '../../camera/ThirdPersonCamera';
import {PerformanceStats} from '../../core/PerformanceStats';
import {initializeRecastNavigation,RecastStageNavigation} from '../../navigation/RecastStageNavigation';
import {proposeB441OriginalFrontline,proposeB441OriginalRampLocalGoals,b467MayRetryOriginalBFrontFromRealFoot} from '../../app/B441OriginalSourceFrontline';
import {GameplayInkSystem} from '../../ink/GameplayInkSystem';
import {SurfaceFlags} from '../../ink/types';
import {initializeRapier,RapierStagePhysics} from '../../physics/RapierStagePhysics';
import {defineTestSurfaces} from '../TestStage';
import {undertowT21dConnectivityQaStage}
 from './UndertowSpillwayConnectivityQa';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as freeze}
 from './UndertowSpillwayBlockoutGeometry';
import {nearestT21SourceSupportedLanding}
 from './UndertowPhase14ECpuHandoff';
import {UndertowPhase14QSharedActorCollision}
 from './UndertowPhase14QSharedActorCollision';

const DT=1/60;
beforeAll(async()=>{await Promise.all([initializeRapier(),initializeRecastNavigation()]);});
afterEach(()=>vi.restoreAllMocks());

function world(){
 vi.spyOn(Entity.prototype,'addComponent').mockImplementation(()=>null as never);
 const stage=undertowT21dConnectivityQaStage();
 const stats=new PerformanceStats();
 const physics=new RapierStagePhysics(DT,stage);
 physics.step();
 const ink=new GameplayInkSystem();
 defineTestSurfaces(ink,stage);
 const input={moveX:0,moveY:0,squidHeld:false,jumpHeld:false,
   consumeJump:()=>false} as PlayerInput;
 const camera={getFlatForward:(v:Vec3)=>v.set(0,0,1)} as ThirdPersonCamera;
 const player=new PlayerController({root:new Entity('T21_Q_ACTUAL_PLAYER')} as never,
   physics,input,camera,ink,stats);
 const link=stage.navigationLinks!.find(l=>l.id==='first-drop-negative-z-3')!;
 const floor=stage.solids.find(s=>s.id==='UndertowT21D:first-drop-landing-negative-z')!;
 const foot=nearestT21SourceSupportedLanding(floor,{
  x:link.start[0],y:link.start[1],z:link.start[2]
 });
 player.teleport(new Vec3(foot.x,foot.y+
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+.15,foot.z));
 for(let i=0;i<75;i++){
  player.computeFixed(DT);physics.step();player.syncAfterPhysics(DT);
 }
 const realPlayer=player.getPosition();
 const humanFoot={x:realPlayer.x,y:realPlayer.y-
   PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:realPlayer.z};
 const actors=new UndertowPhase14QSharedActorCollision(physics,stage,true);
 actors.syncActualHumanFoot(humanFoot);
 return {stage,ink,stats,physics,player,realPlayer,humanFoot,actors};
}
describe('Phase14Q actual shared Rapier HUMAN/cpu capsule KCC authority: opt-in T21 only',()=>{
 it('drops the splatted real CPU proxy and rebinds the native respawn foot',()=>{
  const w=world();
  const first={x:w.humanFoot.x+1.45,y:w.humanFoot.y,z:w.humanFoot.z};
  // Exact frozen T21-D source-grounded QA high-pad position. This is
  // NOT evidence for the original game's authored spawn layout.
  const sourceSpawn=w.stage.metadata.teamBSpawn;
  const again={x:sourceSpawn[0],y:sourceSpawn[1],z:sourceSpawn[2]};
  const support=w.physics.castStageSegment(
   new Vec3(again.x,again.y+.70,again.z),
   new Vec3(again.x,again.y-.70,again.z),'ink-projectile');
  expect(support?.solidId).toBe('UndertowT21D:spawn-high-negative-z');
  w.actors.syncRealCpuFoot('B1',first);
  expect(w.actors.cpuColliderCount).toBe(1);
  w.actors.removeRealCpuFoot('B1');
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(()=>w.actors.auditGroundStep('B1',first,first,DT))
   .toThrow('T21_PHASE14Q_MISSING_REAL_CPU_COLLIDER_B1');
  w.actors.removeRealCpuFoot('B1');
  w.actors.syncRealCpuFoot('B1',again);
  expect(w.actors.cpuColliderCount).toBe(1);
  expect(()=>w.actors.auditGroundStep('B1',again,again,DT))
   .not.toThrow();
  w.actors.dispose();
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
 });
 it('uses one original-solid Rapier world for real player collider and CPU step; a proximity blocker is never promoted to a CPU teleport',()=>{
  const w=world();
  expect(w.stats.playerGrounded).toBe(true);
  const directions=[
   [1,0],[-1,0],[0,1],[0,-1],
   [.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]
  ] as const;
  const candidate=directions.map(([dx,dz])=>{
   const x=w.humanFoot.x+dx*.69,z=w.humanFoot.z+dz*.69;
   const source=w.ink.sampleWorld(new Vec3(x,w.humanFoot.y+.05,z),
     .34,SurfaceFlags.Paintable);
   const ray=w.physics.castStageSegment(
     new Vec3(x,w.realPlayer.y,z),w.realPlayer,'ink-projectile');
   return {x,z,dx,dz,source,ray};
  }).find(c=>c.source&&!c.ray);
  expect(candidate,'original masked landing must have a clear adjacent standing CPU').toBeDefined();
  const from={x:candidate!.x,y:w.humanFoot.y,z:candidate!.z};
  const to={x:from.x-candidate!.dx*.068,y:from.y,
    z:from.z-candidate!.dz*.068};
  const startBody=w.player.getPosition();
  w.actors.syncRealCpuFoot('B1',from);
  expect(w.actors.cpuColliderCount).toBe(1);
  const result=w.actors.auditGroundStep('B1',from,to,DT);
  console.log('T21_PHASE14Q_REAL_SHARED_RAPIER_CPU_HUMAN_CONTACT',JSON.stringify({
    result,sourceFloorY:w.humanFoot.y,sourceOriginalSolids:25,
    requestedCPUStart:[from.x,from.y,from.z],
    requestedCPUEnd:[to.x,to.y,to.z],
    realHuman:[w.realPlayer.x,w.realPlayer.y,w.realPlayer.z],
    actualPlayerPositionAfterAudit:w.player.getPosition()
  }));
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(result.productionAuthorized).toBe(false);
  expect(result.originalNavAuthorityOverridden).toBe(false);
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(w.player.getPosition().distance(startBody)).toBeLessThan(.00001);
  expect(result.requestedMeters).toBeLessThan(.075);
  expect(result.source).toBe('ORIGINAL_25_SOLID_RAPIER_SHARED_ACTOR_WORLD');
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('DYNAMIC_ACTOR_OR_STAGE_BLOCKER');
  // The actual Rapier HUMAN collider was contacted even though the
  // computed displacement differed by only 1.3cm: small tolerance MUST
  // NOT override positive actor-collider evidence.
  expect(result.horizontalDisagreementMeters).toBeGreaterThan(.005);
  expect(result.colliderOwnerIds).toContain('REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR');
  w.actors.dispose();
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(freeze.activationReady).toBe(false);
 });
 it('native real B-side CPU can consume a genuine Rapier teammate-contact slide on the original registered floor',()=>{
  const w=world(),proposals=proposeB441OriginalFrontline(w.stage,'B');
  expect(proposals.length).toBeGreaterThan(0);
  // ORIGINAL 25-solid, paint-backed, interior proposals only. The
  // actual swept CPU KCC must produce a slide: never inject movement.
  let witness:null|{
   from:{x:number;y:number;z:number};
   other:{x:number;y:number;z:number};
   requested:{x:number;y:number;z:number};
   physical:{x:number;y:number;z:number};
   sourceId:string
  }=null;
  const native=(p:{x:number;y:number;z:number})=>
    w.physics.castCharacterFootSupport(
      new Vec3(p.x,p.y+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,p.z),
      PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,'HUMAN');
  for(const proposal of proposals){
   if(witness)break;
   const [x,y,z]=proposal.point;
   const from={x,y,z};
   if(Math.hypot(x-w.humanFoot.x,z-w.humanFoot.z)<2.0)continue;
   const a=native(from);
   if(!a||a.solidId!==proposal.sourceSolidId||
      Math.abs(a.point.y-y)>.20)continue;
   for(const [ux,uz] of [[1,0],[-1,0],[0,1],[0,-1]] as const){
    if(witness)break;
    const other={x:x+ux*.61,y,z:z+uz*.61};
    const b=native(other);
    if(!b||b.solidId!==a.solidId||Math.abs(b.point.y-y)>.20)
     continue;
    w.actors.syncRealCpuFoot('B2',from);
    w.actors.syncRealCpuFoot('B3',other);
    w.physics.step();
    for(const sign of [-1,1]){
     const request={x:x+ux*.055-uz*sign*.040,y,
      z:z+uz*.055+ux*sign*.040};
     const original=w.actors.auditGroundStep(
      'B2',from,request,DT,true);
     const computed=w.actors.tryOriginalTeammateKccSlideStep(
      'B2',from,request,DT);
     if(!original.approved&&
        original.colliderOwnerIds.includes('B3')&&computed){
      witness={from,other,requested:request,
       physical:{...computed},sourceId:a.solidId};
      break;
     }
    }
    if(!witness)w.actors.removeRealCpuFoot('B3');
   }
  }
  expect(witness,'at least one genuine original-floor Rapier teammate slide')
   .not.toBeNull();
  if(witness){
   const foot=native(witness.physical);
   expect(foot?.solidId).toBe(witness.sourceId);
   expect(Math.abs(foot!.point.y-witness.physical.y)).toBeLessThan(.25);
   const moved=Math.hypot(witness.physical.x-witness.from.x,
    witness.physical.y-witness.from.y,
    witness.physical.z-witness.from.z);
   expect(moved).toBeGreaterThan(.01);
   expect(moved).toBeLessThan(.080);
   expect(Math.hypot(witness.physical.x-witness.other.x,
    witness.physical.z-witness.other.z)).toBeGreaterThanOrEqual(.57);
   // The KCC probe did NOT move the actor. The real CPU simulation
   // commits only this physically returned foot during its native tick.
   expect(w.actors.qaRegisteredRealCpuCapsule('B2')?.foot)
    .toEqual(witness.from);
   console.log('T21_NATIVE_GENUINE_TEAMMATE_RAPIER_SLIDE',
    JSON.stringify({witness,physicalTravelMeters:moved,
     originalStage:[25,17,26,0],
     bodyTeleportPerformed:false,originalPathAuthorizationChanged:false}));
  }
  w.actors.dispose();
 });
 it('never slides into the live human or permits an overspeed KCC shortcut',()=>{
  const w=world(),from={x:w.humanFoot.x+.655,y:w.humanFoot.y,
   z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B2',from);
  const towardHuman={x:from.x-.055,y:from.y,
   z:from.z+.040};
  expect(w.actors.tryOriginalTeammateKccSlideStep(
   'B2',from,towardHuman,DT)).toBeNull();
  w.actors.syncRealCpuFoot('B3',{x:from.x+.61,y:from.y,z:from.z});
  expect(w.actors.tryOriginalTeammateKccSlideStep('B2',from,
   {x:from.x+2,y:from.y,z:from.z},DT)).toBeNull();
  expect(w.actors.tryOriginalTeammateKccSlideStep(
   'B2',from,towardHuman,2*DT)).toBeNull();
  expect(w.actors.tryOriginalTeammateKccSlideStep(
   'A1',from,towardHuman,DT)).toBeNull();
  expect(w.stage.solids).toHaveLength(25);
  expect(w.stage.paintSurfaces).toHaveLength(17);
  expect(w.stage.navigationLinks).toHaveLength(26);
  w.actors.dispose();
 });
 it('reads true B2 stopped foot on original SOURCE collision and checks every existing native front path',()=>{
  // Exact observed B2 physical foot in genuine native #43882733229,
  // not an artificial relocated live actor or fabricated floor.
  const w=world();
  const foot={x:-5.8623,y:4.599999904632568,z:-48.252};
  const offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const support=(p:{x:number;y:number;z:number})=>{
   const hit=w.physics.castCharacterFootSupport(
     new Vec3(p.x,p.y+offset,p.z),offset,'HUMAN');
   const gap=hit?Math.abs(hit.point.y-p.y):Infinity;
   return {hit:hit??null,gap,registered:!!hit&&gap<=.25&&
     w.stage.solids.some(s=>s.id===hit.solidId)};
  };
  w.actors.syncRealCpuFoot('B2',foot);
  const physical=support(foot);
  const eligible=b467MayRetryOriginalBFrontFromRealFoot(w.stage,{
   id:'B2',nativeTick:1765,firstDeniedNativeTick:1062,
   lastRetryNativeTick:null,actualOriginalSolidId:physical.hit?.solidId??null,
   foot:[foot.x,foot.y,foot.z],rejoined:true,active:true,grounded:true
  });
  const nav=new RecastStageNavigation(w.stage,new PerformanceStats());
  const goals=proposeB441OriginalFrontline(w.stage,'B');
  let nativeReach=0,validEndpoints=0,originallySupported=0;
  const rejected:{goal:[number,number,number];reason:string;gap?:number}[]=[];
  for(const candidate of goals){
   const dest=new Vec3(...candidate.point);
   const route=nav.auditPath(new Vec3(foot.x,foot.y,foot.z),dest);
   if(!route.reachedTarget){rejected.push({goal:[...candidate.point],reason:'RECAST_UNREACHED'});continue;}
   nativeReach++;
   if(route.startSnapDistanceMeters>.20||route.endSnapDistanceMeters>.20){
    rejected.push({goal:[...candidate.point],reason:'RECAST_ENDPOINT_SNAP'});continue;
   }
   validEndpoints++;
   const coords=route.nativePathPoints;
   let fail='';let firstGap:number|undefined;
   const check=(p:{x:number;y:number;z:number})=>{
    const r=support(p);
    if(p.z> -33||p.y<2.5||p.y>5.5||
       !r.registered){fail='UNSUPPORTED_ORIGINAL_RAPIER';firstGap=r.gap;return false;}
    return true;
   };
   if(coords.length===0){fail='MISSING_NATIVE_PATH';}
   for(let i=0;i+1<coords.length&&!fail;i++){
    const a=coords[i]!,b=coords[i+1]!;
    const distance=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
    const n=Math.max(1,Math.ceil(distance/.30));
    for(let k=i===0?0:1;k<=n;k++){
     const f=k/n;
     if(!check({x:a.x+(b.x-a.x)*f,
        y:a.y+(b.y-a.y)*f,z:a.z+(b.z-a.z)*f}))break;
    }
   }
   if(!fail){originallySupported++;continue;}
   if(rejected.length<8)rejected.push({
    goal:[...candidate.point],reason:fail,gap:firstGap});
  }
  // The registered sloped FloorConcrete03 is a DIFFERENT solid from
  // the flat low floor. Verify actual original-slope candidates before
  // considering any threshold change or new source goal.
  const rampGoals=proposeB441OriginalRampLocalGoals(w.stage,'B');
  let rampReached=0,rampEndpoints=0,rampSupported=0;
  const rampFirstDenied:unknown[]=[];
  for(const candidate of rampGoals){
   const goal=new Vec3(...candidate.point);
   const r=nav.auditPath(new Vec3(foot.x,foot.y,foot.z),goal);
   if(!r.reachedTarget)continue;
   rampReached++;
   if(r.startSnapDistanceMeters>.20||r.endSnapDistanceMeters>.20)continue;
   rampEndpoints++;
   let approved=r.nativePathPoints.length>0,firstGap:null|number=null;
   for(let leg=0;leg+1<r.nativePathPoints.length;leg++){
    if(!approved)break;
    const a=r.nativePathPoints[leg]!,b=r.nativePathPoints[leg+1]!;
    const n=Math.max(1,Math.ceil(
     Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/.30));
    for(let k=leg===0?0:1;k<=n;k++){
     const p=k/n,coord={x:a.x+(b.x-a.x)*p,
      y:a.y+(b.y-a.y)*p,z:a.z+(b.z-a.z)*p};
     const grounded=support(coord);
     if(coord.z> -33||coord.y<2.5||coord.y>5.5||
         !grounded.registered){approved=false;firstGap=grounded.gap;break;}
    }
   }
   if(approved)rampSupported++;
   else if(rampFirstDenied.length<5)
    rampFirstDenied.push({goal:[...candidate.point],gap:firstGap,
     nativePathPoints:r.nativePathPoints.length});
  }
  console.log('T21_V28_B2_GENUINE_STOP_FOOT_ORIGINAL_SOURCE',JSON.stringify({
   fromRun:43882733229,foot,sourceSolidId:physical.hit?.solidId,
   originalPhysicalFloorGap:physical.gap,
   originalRegisteredFoot:physical.registered,
   b467MayRetryFromRealB2Foot:eligible,sourceProposals:goals.length,
   originalRampCandidates:rampGoals.length,
   rampRecastReached:rampReached,rampEndpointsUnder20cm:rampEndpoints,
   rampFullOriginalRapierRouteSupported:rampSupported,
   rampFirstDenied,
   trueRecastReached:nativeReach,nativeEndpointsUnder20cm:validEndpoints,
   fullyOriginalRapierRouteSupported:originallySupported,
   firstRejected:rejected.slice(0,5),source:'25/17/26/0',
   originalActorGoalWrites:0,originalStageWrites:0,
   crossingCertified:false
  }));
  expect(w.stage.solids).toHaveLength(25);
  expect(w.stage.paintSurfaces).toHaveLength(17);
  expect(w.stage.navigationLinks).toHaveLength(26);
  expect(physical.registered).toBe(true);
  expect(goals.length).toBeGreaterThan(0);
  w.actors.dispose();
 });
 it('real HUMAN production PlayerController KCC must not walk through a stationary CPU collider in its own Rapier stage world',()=>{
  // Proven original masked location, not an imaginary obstacle. No manual
  // player teleport after the first authentic Rapier ground settlement.
  const w=world();
  const cpuFoot={x:w.humanFoot.x,y:w.humanFoot.y,
    z:w.humanFoot.z+.78};
  const surface=w.ink.sampleWorld(new Vec3(
    cpuFoot.x,w.humanFoot.y+.05,cpuFoot.z),
    .34,SurfaceFlags.Paintable);
  expect(surface,'CPU contact fixture must belong to original landing paint surface')
    .not.toBeNull();
  w.actors.syncRealCpuFoot('B4',cpuFoot);
  // B149: actual PlayerController KCC collider handle, not generic
  // REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR owner-label inference.
  const sourceCpu=w.actors.qaRegisteredRealCpuCapsule('B4');
  expect(sourceCpu?.actualSharedRapierBodyAndFootAgree).toBe(true);
  expect(sourceCpu?.actualSharedWorld).toBe(true);
  const realB4Handle=sourceCpu!.actualRapierColliderHandle;
  let exactHumanKccB4ContactFrames=0;
  const input=(w.player as unknown as {input:PlayerInput}).input as unknown as {
    moveY:number
  };
  input.moveY=1;
  const before=w.player.getPosition();
  let minimumDistance=Number.POSITIVE_INFINITY;
  for(let frame=0;frame<45;frame++){
    w.player.computeFixed(DT);
    w.physics.step();
    w.player.syncAfterPhysics(DT);
    if(w.player.qaActualKccComputedColliderHandles().includes(realB4Handle))
      exactHumanKccB4ContactFrames++;
    const p=w.player.getPosition();
    minimumDistance=Math.min(minimumDistance,
      Math.hypot(p.x-cpuFoot.x,p.z-cpuFoot.z));
  }
  const after=w.player.getPosition();
  const playerTravel=after.distance(before);
  console.log('T21_PHASE14Q_ACTUAL_PLAYER_KCC_BLOCKED_BY_REAL_CPU_PROXY',JSON.stringify({
    playerTravelMeters:playerTravel,
    closestPlayerCpuHorizontalMeters:minimumDistance,
    cpuOriginalFoot:cpuFoot,
    humanFirst:[before.x,before.y,before.z],
    humanFinal:[after.x,after.y,after.z],
    cpuCapsuleCount:w.actors.cpuColliderCount,
    originalGeometryUnchanged:true,
    cpuRenderMovementFabricated:false,
    fullCpuCrowdCollisionCouplingApproved:false
  }));
  expect(w.stats.playerGrounded).toBe(true);
  expect(minimumDistance).toBeGreaterThan(.54);
  expect(exactHumanKccB4ContactFrames).toBeGreaterThan(0);
  expect(playerTravel).toBeGreaterThan(.01);
  expect(playerTravel).toBeLessThan(.65);
  expect(w.actors.cpuColliderCount).toBe(1);
  w.actors.dispose();
 });
 it('M4 rejects a real-KCC-shaped FIRST_DROP_FALL foot entering actual grounded HUMAN capsule while leaving actual CPU pose untouched',()=>{
  const w=world();
  const from={x:w.humanFoot.x+.665,y:w.humanFoot.y+.35,
    z:w.humanFoot.z};
  const next={x:w.humanFoot.x+.59,y:w.humanFoot.y+.10,
    z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B1',from);
  const sourcePlayer=w.player.getPosition().clone();
  const blocked=w.actors.auditAirborneSourceFoot('B1',from,next,DT,true);
  expect(blocked.approved).toBe(false);
  expect(blocked.cause).toBe('SHARED_ACTOR_CAPSULE_INTERSECTS');
  expect(blocked.actorCollisionCandidate).toBe('HUMAN_PLAYER_CONTROLLER');
  expect(blocked.cpuFootTeleportPerformed).toBe(false);
  expect(blocked.fullSharedWorldFallingKccProved).toBe(false);
  expect(w.player.getPosition().distance(sourcePlayer)).toBeLessThan(1e-7);
  const clear=w.actors.auditAirborneSourceFoot('B1',from,
    {x:from.x,y:from.y-.10,z:from.z},DT,true);
  expect(clear.approved).toBe(true);
  expect(clear.actorCollisionCandidate).toBeNull();
  const unproved=w.actors.auditAirborneSourceFoot('B1',from,
    {x:from.x,y:from.y-.10,z:from.z},DT,false);
  expect(unproved.approved).toBe(false);
  expect(unproved.cause).toBe('SOURCE_CONTINUITY_UNVERIFIED');
  expect(()=>w.actors.auditAirborneSourceFoot('B1',from,
    {x:from.x+.9,y:from.y,z:from.z},DT,true))
    .toThrow('T21_PHASE14Q_AIRBORNE_UNVERIFIED_KCC_STEP');
  console.log('T21_PHASE14Q_M4_ORIGINAL_KCC_FALL_CANDIDATE_HUMAN_VETO',
    JSON.stringify({blocked,clear,unproved,
      sameOriginalT21SourceFloor:true,realHumanBodyUnchanged:true,
      onlyActualFallAdapterMaySupplyApprovedContinuousFoot:true
    }));
  w.actors.dispose();
 });
 it('rejects a prospective CPU Crowd endpoint INSIDE the real HUMAN capsule before a tiny physical discrepancy is incorrectly tolerated',()=>{
  const w=world();
  const initial={x:w.humanFoot.x+.655,y:w.humanFoot.y,z:w.humanFoot.z};
  const unsafe={x:w.humanFoot.x+.59,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B3',initial);
  const result=w.actors.auditGroundStep('B3',initial,unsafe,DT);
  expect(result.requestedMeters).toBeLessThan(.075);
  expect(result.proposedActorCapsuleOverlap).toBe(true);
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('DYNAMIC_ACTOR_OR_STAGE_BLOCKER');
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(w.player.getPosition().x).toBeCloseTo(w.humanFoot.x);
  console.log('T21_PHASE14Q_M3_REJECT_PROSPECTIVE_REAL_HUMAN_CAPSULE_OVERLAP',
    JSON.stringify(result));
  w.actors.dispose();
 });
 it('fails closed on initial actual human/CPU overlap, even if a Rapier KCC does not depenetrate the stationary capsule',()=>{
  const w=world();
  const before={x:w.humanFoot.x+.04,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B4',before);
  const result=w.actors.auditGroundStep('B4',before,before,DT);
  expect(result.approved).toBe(false);
  expect(result.cause).toBe('UNSUPPORTED_INITIAL_OVERLAP');
  expect(result.realHumanCapsulePresent).toBe(true);
  expect(result.cpuVisualTeleportPerformed).toBe(false);
  expect(w.actors.cpuColliderCount).toBe(1);
  w.actors.dispose();
 });
 it('splatted human is not a ghost blocker for real SOURCE CPU landing, while living CPU separation stays enforced',()=>{
  const w=world();
  const foot={x:w.humanFoot.x+.30,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('A1',foot);
  expect(w.actors.shouldDeferF2FirstDrop('A1',foot)).toBe(true);
  const live=w.actors.auditGroundStep('A1',foot,foot,DT);
  expect(live.approved).toBe(false);
  expect(live.proposedActorCapsuleOverlap).toBe(true);
  // Exactly the in-game lethal transition: no live HUMAN collider remains.
  w.player.setLifecycleActive(false);
  w.actors.syncActualHumanFoot(w.humanFoot,false);
  expect(w.actors.shouldDeferF2FirstDrop('A1',foot)).toBe(false);
  const dead=w.actors.auditGroundStep('A1',foot,foot,DT);
  expect(dead.realHumanCapsulePresent).toBe(false);
  expect(dead.proposedActorCapsuleOverlap).toBe(false);
  // Real stage contact may still reject a stationary KCC probe. It must
  // never be reclassified as an absent HUMAN collider or bypassed.
  expect(dead.colliderOwnerIds)
   .not.toContain('REAL_PLAYER_OR_UNREGISTERED_DYNAMIC_ACTOR');
  if(!dead.approved)
   expect(dead.cause).toBe('DYNAMIC_ACTOR_OR_STAGE_BLOCKER');
  expect(w.actors.auditAirborneSourceFoot('A1',foot,foot,DT,true)
   .actorCollisionCandidate).toBeNull();
  // A DIFFERENT living real CPU can still queue this first-drop corridor.
  const other={x:foot.x+.65,y:foot.y,z:foot.z};
  w.actors.syncRealCpuFoot('B1',other);
  expect(w.actors.shouldDeferF2FirstDrop('A1',foot)).toBe(true);
  w.actors.removeRealCpuFoot('B1');
  expect(w.actors.shouldDeferF2FirstDrop('A1',foot)).toBe(false);
  // The same real human blocks again only AFTER its genuine respawn.
  w.player.setLifecycleActive(true);
  w.actors.syncActualHumanFoot(w.humanFoot,true);
  expect(w.actors.shouldDeferF2FirstDrop('A1',foot)).toBe(true);
  expect(w.actors.auditGroundStep('A1',foot,foot,DT).approved)
   .toBe(false);
  expect(w.actors.cpuColliderCount).toBe(1);
  expect(freeze.activationReady).toBe(false);
  w.actors.dispose();
 });
 it('uses the live HUMAN or SQUID Rapier radius for CPU separation, never a stale human-sized proxy',()=>{
  const w=world();
  expect(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters).toBe(.32);
  expect(PLAYER_CHARACTER_PHYSICS.squidRadiusMeters).toBe(.34);
  const candidate={x:w.humanFoot.x+.61,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('B1',candidate);
  // .61m is beyond the old .29+.32-.01m overlap threshold, but
  // INSIDE the real .29+.34-.01m SQUID/CPU footprint.
  expect(w.actors.auditGroundStep('B1',candidate,candidate,DT)
   .proposedActorCapsuleOverlap).toBe(false);
  expect(w.actors.qaRegisteredRealCpuCapsule('B1')!.actualHumanRadiusMeters)
   .toBe(.32);
  // Real in-game squid input swaps the actual PlayerController Rapier
  // capsule for its radius-0.34m ball; no game actor/terrain is teleported.
  const input=(w.player as unknown as {input:PlayerInput}).input as unknown as {
    squidHeld:boolean;
  };
  input.squidHeld=true;
  w.player.computeFixed(DT);w.physics.step();w.player.syncAfterPhysics(DT);
  expect(w.player.currentMode).toBe('SQUID');
  const human=w.player.getPosition();
  const foot={x:human.x,
   y:human.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters,z:human.z};
  w.actors.syncActualHumanFoot(foot,true,w.player.currentMode);
  expect(w.actors.qaRegisteredRealCpuCapsule('B1')!.actualHumanRadiusMeters)
   .toBe(.34);
  // The squid sphere is active. A same-floor endpoint which the HUMAN
  // approximation missed must NOT become an approved CPU step.
  const squid={x:foot.x+.61,y:foot.y,z:foot.z};
  w.actors.syncRealCpuFoot('B1',squid);
  const blocked=w.actors.auditGroundStep('B1',squid,squid,DT);
  expect(blocked.proposedActorCapsuleOverlap).toBe(true);
  expect(blocked.approved).toBe(false);
  expect(blocked.cpuVisualTeleportPerformed).toBe(false);
  w.actors.resetActors();
  expect(w.actors.cpuColliderCount).toBe(0);
  w.actors.dispose();
 });
 it('match reset removes every CPU proxy but retains the actual PlayerController and static original collision geometry',()=>{
  const w=world();
  const a={x:w.humanFoot.x+2,y:w.humanFoot.y,z:w.humanFoot.z};
  const b={x:w.humanFoot.x-2,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('A1',a);
  w.actors.syncRealCpuFoot('B4',b);
  expect(w.actors.cpuColliderCount).toBe(2);
  const originalHumanPosition=w.player.getPosition().clone();
  const originalProbe=w.physics.castStageSegment(
    new Vec3(w.humanFoot.x,w.humanFoot.y+1,w.humanFoot.z),
    new Vec3(w.humanFoot.x,w.humanFoot.y-1,w.humanFoot.z),'ink-projectile');
  expect(originalProbe?.solidId)
    .toBe('UndertowT21D:first-drop-landing-negative-z');
  w.actors.resetActors();
  expect(w.actors.cpuColliderCount).toBe(0);
  expect(w.player.getPosition().distance(originalHumanPosition)).toBeLessThan(1e-7);
  expect(w.physics.castStageSegment(
    new Vec3(w.humanFoot.x,w.humanFoot.y+1,w.humanFoot.z),
    new Vec3(w.humanFoot.x,w.humanFoot.y-1,w.humanFoot.z),'ink-projectile')
    ?.solidId).toBe(originalProbe?.solidId);
  w.actors.syncRealCpuFoot('B1',a);
  expect(()=>w.actors.auditGroundStep('B1',a,a,DT))
    .toThrow('T21_PHASE14Q_REAL_HUMAN_FOOT_NOT_SYNCHRONIZED');
  w.actors.syncActualHumanFoot(w.humanFoot);
  const audited=w.actors.auditGroundStep('B1',a,a,DT);
  expect(audited.realHumanCapsulePresent).toBe(true);
  expect(audited.originalSourceCollidersIntact).toBe(true);
  w.actors.dispose();
  expect(w.actors.cpuColliderCount).toBe(0);
 });
 it('a genuinely rejoined CPU cannot walk off registered original Rapier floor just because Recast proposed a step',()=>{
  const w=world();
  // Use the registered original upper source as a precise static floor
  // boundary fixture; the opt-in true flag represents a post-rejoin CPU.
  // No stage mesh, invisible bridge, actor foot or nav link is fabricated.
  const spawn=w.stage.metadata.teamBSpawn;
  const y=spawn[1],offset=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const supported=(x:number,z:number)=>{
   const hit=w.physics.castCharacterFootSupport(
    new Vec3(x,y+offset,z),offset,'HUMAN');
   return !!hit&&Math.abs(hit.point.y-y)<=.25&&
    w.stage.solids.some(s=>s.id===hit.solidId);
  };
  expect(supported(spawn[0],spawn[2])).toBe(true);
  let verifiedEdge=false;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]] as const){
   let prior={x:spawn[0],y,z:spawn[2]};
   for(let i=1;i<=600;i++){
    const to={x:spawn[0]+dx*i*.05,y,z:spawn[2]+dz*i*.05};
    if(supported(prior.x,prior.z)&&!supported(to.x,to.z)){
     // This CPU remains distant from the real human KCC.
     if(Math.hypot(prior.x-w.humanFoot.x,prior.z-w.humanFoot.z)>2){
      w.actors.syncRealCpuFoot('B1',prior);
      const result=w.actors.auditGroundStep('B1',prior,to,DT,true);
      if(result.cause==='UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION'){
       expect(result.approved).toBe(false);
       expect(result.requestedMeters).toBeCloseTo(.05,5);
       expect(result.colliderOwnerIds).not.toContain('HUMAN_PLAYER_CONTROLLER');
       expect(result.cpuVisualTeleportPerformed).toBe(false);
       expect(result.originalNavAuthorityOverridden).toBe(false);
       verifiedEdge=true;break;
      }
     }
     break;
    }
    prior=to;
   }
   if(verifiedEdge)break;
  }
  expect(verifiedEdge,'at least one genuine original floor edge must fail closed')
   .toBe(true);
  // Staging and first-drop continue through their existing separate
  // physics authority; no new floor check is imposed before rejoin.
  const nonrejoined={x:spawn[0],y,z:spawn[2]};
  w.actors.syncRealCpuFoot('B1',nonrejoined);
  const noStep=w.actors.auditGroundStep('B1',nonrejoined,nonrejoined,DT,false);
  expect(noStep.cause).not.toBe('UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
  w.actors.dispose();
 });
  it('permits B1 original downhill only through authentic unchanged Rapier KCC',()=>{
  const w=world();
  const foot={x:-5.89511775970459,y:4.619045257568359,z:-48.42698287963867};
  const goal={x:-4.364792823791504,y:3.8463597297668457,z:-49.683570861816406};
  const d=Math.hypot(goal.x-foot.x,goal.z-foot.z);
  const raw={x:foot.x+(goal.x-foot.x)*.03/d,y:foot.y,
   z:foot.z+(goal.z-foot.z)*.03/d};
  w.actors.syncRealCpuFoot('B1',foot);
  const original=w.actors.auditGroundStep('B1',foot,raw,DT,true);
  expect(original.cause).toBe('UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
  const recovered=w.actors.tryOriginalDownhillKccStep('B1',foot,raw,DT);
  expect(recovered).not.toBeNull();
  expect(recovered!.y).toBeLessThan(foot.y);
  const second=w.actors.auditGroundStep('B1',foot,recovered!,DT,true);
  expect(second.approved).toBe(true);
  expect(second.colliderOwnerIds).toEqual([]);
  const off=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const floor=w.physics.castCharacterFootSupport(
   new Vec3(recovered!.x,recovered!.y+off,recovered!.z),off,'HUMAN');
  expect(floor?.solidId).toBe('UndertowT21D:right-low-route-ramp-negative-z');
  expect(Math.abs(floor!.point.y-recovered!.y)).toBeLessThanOrEqual(.25);
  expect(w.actors.qaRegisteredRealCpuCapsule('B1')?.foot).toEqual(foot);
  expect(w.actors.tryOriginalDownhillKccStep('B2',foot,raw,DT)).toBeNull();
  expect(w.actors.tryOriginalDownhillKccStep('B1',foot,{
   x:raw.x,y:foot.y-.2,z:raw.z},DT)).toBeNull();
  expect([w.stage.solids.length,w.stage.paintSurfaces.length,
   w.stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(freeze.activationReady).toBe(false);
  w.actors.dispose();
 });
it('refuses unsafe 60Hz, overspeed, untrusted actor identity and production stages',()=>{
  const w=world();
  const at={x:w.humanFoot.x+2,y:w.humanFoot.y,z:w.humanFoot.z};
  w.actors.syncRealCpuFoot('A1',at);
  expect(()=>w.actors.auditGroundStep('A1',at,at,.03))
   .toThrow('T21_PHASE14Q_REQUIRES_EXACT_60HZ');
  expect(()=>w.actors.auditGroundStep('A1',at,{
   x:at.x+1,y:at.y,z:at.z},DT))
   .toThrow('T21_PHASE14Q_CPU_CROWD_OVERSPEED_UNAPPROVED');
  expect(()=>w.actors.syncRealCpuFoot('invalid',at))
   .toThrow('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  expect(()=>w.actors.syncRealCpuFoot('B1',{x:NaN,y:3,z:4}))
   .toThrow('T21_PHASE14Q_UNTRUSTED_ACTOR_SOURCE');
  expect(()=>new UndertowPhase14QSharedActorCollision(
   w.physics,w.stage,false)).toThrow('T21_PHASE14Q_NOT_AUTHORIZED_FOR_PRODUCTION');
  w.actors.dispose();
 });

 it('read-only genuine B1 90s ramp CPU KCC next-step support diagnosis',()=>{
  const w=world();
  const from={x:-5.89511775970459,y:4.619045257568359,z:-48.42698287963867};
  const goals=[
   [-4.364792823791504,3.8463597297668457,-49.683570861816406],
   [-2.270068883895874,3.1579973697662354,-50.71049118041992],
   [-6.460616111755371,4.640660762786865,-48.65611267089844],
   [-17.2657470703125,4.599999904632568,-48.05963134765625]
  ] as const;
  const realHuman=w.player.getPosition().clone();
  const support=(p:{x:number;y:number;z:number})=>{
   const off=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
   const hit=w.physics.castCharacterFootSupport(
    new Vec3(p.x,p.y+off,p.z),off,'HUMAN');
   return {solid:hit?.solidId??null,
    floor:hit?.point.y??null,
    gap:hit?hit.point.y-p.y:null,
    certified:!!hit&&Math.abs(hit.point.y-p.y)<=.25&&
     w.stage.solids.some(x=>x.id===hit.solidId)};
  };
  w.actors.syncRealCpuFoot('B1',from);
  const rows=[] as Array<unknown>;
  for(const goal of goals){
   const span=Math.hypot(goal[0]-from.x,goal[2]-from.z);
   for(const horizontalStep of [.008,.015,.03,.055]){
    const at={x:from.x+(goal[0]-from.x)/span*horizontalStep,
     y:from.y,z:from.z+(goal[2]-from.z)/span*horizontalStep};
    for(const descending of [0,.015,.035,.055]){
     // This is the frozen native 60Hz KCC speed cap, not a movement
     // authorization. Never probe an overspeed diagonal candidate.
     if(Math.hypot(horizontalStep,descending)>.045)continue;
     const proposed={x:at.x,y:at.y-descending,z:at.z};
     const verdict=w.actors.auditGroundStep('B1',from,proposed,DT,true);
     rows.push({goal:[...goal],horizontalStep,descending,
      source:support(from),candidate:support(proposed),
      verdict:{approved:verdict.approved,cause:verdict.cause,
       requestedMeters:verdict.requestedMeters,actualMeters:verdict.actualMeters,
       horizontalDisagreement:verdict.horizontalDisagreementMeters,
       verticalDisagreement:verdict.verticalDisagreementMeters,
       owners:verdict.colliderOwnerIds}});
    }
   }
  }
  console.log('T21_V28_B1_REAL_90S_ORIGINAL_KCC_DIAGNOSIS',
   JSON.stringify({run:43643359388,original:[25,17,26,0],
    foot:[from.x,from.y,from.z],genuineSourceOnly:true,
    sampleOnlyNoCpuMoves:true,allRows:rows,
    humanBefore:[realHuman.x,realHuman.y,realHuman.z],
    humanAfter:[w.player.getPosition().x,w.player.getPosition().y,
     w.player.getPosition().z]}));
  expect(rows.length).toBeGreaterThan(20);
  expect(w.player.getPosition().distance(realHuman)).toBeLessThan(1e-7);
  expect(w.stage.solids.length).toBe(25);
  expect(w.stage.paintSurfaces.length).toBe(17);
  expect(w.stage.navigationLinks?.length).toBe(26);
  expect(freeze.activationReady).toBe(false);
  w.actors.dispose();
 });

 it('B3 genuine 90s stationary ramp KCC direct native candidate diagnosis',()=>{
  const w=world();
  const from={x:-6.310656547546387,y:4.606138229370117,z:-49.365596771240234};
  const crowd={x:-6.315646648406982,y:4.608527660369873,z:-49.365909576416016};
  const goal={x:-6.460616111755371,y:4.640660762786865,z:-48.65611267089844};
  const off=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const proof=(p:{x:number;y:number;z:number})=>{
   const hit=w.physics.castCharacterFootSupport(
    new Vec3(p.x,p.y+off,p.z),off,'HUMAN');
   return {solid:hit?.solidId??null,floor:hit?.point.y??null,
    gap:hit?p.y-hit.point.y:null,
    supported:!!hit&&Math.abs(p.y-hit.point.y)<=.25&&
     w.stage.solids.some(s=>s.id===hit.solidId)};
  };
  w.actors.syncRealCpuFoot('B3',from);
  const samples=[crowd,
   {...crowd,y:from.y},{...crowd,y:from.y-.015},
   {...crowd,y:from.y-.035},
   {x:from.x-.015,y:from.y,z:from.z},
   {x:from.x-.015,y:from.y-.015,z:from.z},
   {x:from.x-.03,y:from.y-.015,z:from.z},
   {x:from.x,y:from.y,z:from.z+.02},
   {x:from.x,y:from.y-.015,z:from.z+.02}
  ].map(p=>{
   const verdict=w.actors.auditGroundStep('B3',from,p,DT,true);
   return {to:[p.x,p.y,p.z],support:proof(p),cause:verdict.cause,
    approved:verdict.approved,owners:verdict.colliderOwnerIds};
  });
  console.log('T21_V28_B3_GENUINE_90S_ORIGINAL_KCC_PROBE',
   JSON.stringify({run:43647240746,
    foot:[from.x,from.y,from.z],
    crowd:[crowd.x,crowd.y,crowd.z],
    goal:[goal.x,goal.y,goal.z],origin:proof(from),
    samples,b1OnlyMethod:w.actors.tryOriginalDownhillKccStep('B3',from,crowd,DT),
    noActorPositionWrites:true,source:[25,17,26,0]}));
  expect(samples.length).toBe(9);
  expect(proof(from).supported).toBe(true);
  expect([w.stage.solids.length,w.stage.paintSurfaces.length,
   w.stage.navigationLinks?.length]).toEqual([25,17,26]);
  w.actors.dispose();
 });

 it('B3 genuine 90s foot recovers only via ORIGINAL registered ramp KCC, not a floor bypass',()=>{
  const w=world();
  const from={x:-6.310656547546387,y:4.606138229370117,z:-49.365596771240234};
  const raw={x:-6.315646648406982,y:4.608527660369873,z:-49.365909576416016};
  w.actors.syncRealCpuFoot('B3',from);
  const first=w.actors.auditGroundStep('B3',from,raw,DT,true);
  expect(first.cause).toBe('UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
  expect(first.approved).toBe(false);
  const corrected=w.actors.tryOriginalDownhillKccStep('B3',from,raw,DT);
  expect(corrected).not.toBeNull();
  expect(corrected!.y).toBeLessThan(from.y);
  const physical=w.actors.auditGroundStep('B3',from,corrected!,DT,true);
  expect(physical.approved).toBe(true);
  expect(physical.colliderOwnerIds).toEqual([]);
  const off=PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const hit=w.physics.castCharacterFootSupport(
   new Vec3(corrected!.x,corrected!.y+off,corrected!.z),off,'HUMAN');
  expect(hit?.solidId).toBe('UndertowT21D:right-low-route-ramp-negative-z');
  expect(Math.abs(hit!.point.y-corrected!.y)).toBeLessThanOrEqual(.25);
  expect(w.actors.qaRegisteredRealCpuCapsule('B3')?.foot).toEqual(from);
  expect(w.actors.tryOriginalDownhillKccStep('B2',from,raw,DT)).toBeNull();
  expect(w.actors.tryOriginalDownhillKccStep('B4',from,raw,DT)).toBeNull();
  expect(w.actors.tryOriginalDownhillKccStep('B3',from,{
   x:raw.x,y:from.y-.2,z:raw.z},DT)).toBeNull();
  const flat=w.stage.metadata.teamBSpawn;
  const upper={x:flat[0],y:flat[1],z:flat[2]};
  w.actors.syncRealCpuFoot('B3',upper);
  const upperRaw={x:upper.x+.01,y:upper.y,z:upper.z};
  expect(w.actors.tryOriginalDownhillKccStep('B3',upper,upperRaw,DT))
   .toBeNull();
  expect([w.stage.solids.length,w.stage.paintSurfaces.length,
   w.stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(freeze.activationReady).toBe(false);
  w.actors.dispose();
 });

 it('applies the same original-ramp Rapier authority to the REAL B2 90s rejected foot, not an actor-name bypass',()=>{
  const w=world();
  // Genuine 90-second RAW at c3cd288d, Actions #43649553165.
  const from={x:-6.162266254425049,y:4.610341548919678,z:-49.032161712646484};
  const raw={x:-6.167247295379639,y:4.612900257110596,z:-49.0317268371582};
  w.actors.syncRealCpuFoot('B2',from);
  expect(w.actors.sourceFootSupport('B2',from)?.solidId)
   .toBe('UndertowT21D:right-low-route-ramp-negative-z');
  const first=w.actors.auditGroundStep('B2',from,raw,DT,true);
  expect(first.cause).toBe('UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
  const corrected=w.actors.tryOriginalDownhillKccStep('B2',from,raw,DT);
  expect(corrected).not.toBeNull();
  expect(corrected!.y).toBeLessThan(from.y);
  expect(w.actors.auditGroundStep('B2',from,corrected!,DT,true).approved)
   .toBe(true);
  expect(w.actors.qaRegisteredRealCpuCapsule('B2')?.foot).toEqual(from);
  expect([w.stage.solids.length,w.stage.paintSurfaces.length,
   w.stage.navigationLinks?.length]).toEqual([25,17,26]);
  expect(freeze.activationReady).toBe(false);
  w.actors.dispose();
 });
  it('keeps genuine 180s B2/B4 physical ramp height against tiny native Crowd Y drift only after original KCC',()=>{
   const w=world();
   // First round actual native RAW: Actions #43652042382, tick 11855.
   const stalled=[
    {id:'B2',from:{x:-5.877044419973234,y:4.605353034719721,z:-48.34676733420872},
     crowd:{x:-5.877044200897217,y:4.6287522315979,z:-48.34676742553711}},
    {id:'B4',from:{x:-6.2543789849807,y:4.5892939639091495,z:-49.22996341298023},
     crowd:{x:-6.254378795623779,y:4.609862327575684,z:-49.22996520996094}}
   ] as const;
   for(const {id,from,crowd} of stalled){
    w.actors.syncRealCpuFoot(id,from);
    expect(w.actors.sourceFootSupport(id,from)?.solidId)
     .toBe('UndertowT21D:right-low-route-ramp-negative-z');
    const rejected=w.actors.auditGroundStep(id,from,crowd,DT,true);
    expect(rejected.approved).toBe(false);
    expect(rejected.cause).toBe('UNSUPPORTED_ORIGINAL_SOURCE_DESTINATION');
    const corrected=w.actors.tryOriginalCrowdHeightMismatchKccStep(
     id,from,crowd,DT);
    expect(corrected).not.toBeNull();
    expect(corrected!.x).toBe(crowd.x);
    expect(corrected!.y).toBe(from.y);
    expect(corrected!.z).toBe(crowd.z);
    expect(w.actors.auditGroundStep(id,from,corrected!,DT,true).approved)
     .toBe(true);
    expect(w.actors.qaRegisteredRealCpuCapsule(id)?.foot).toEqual(from);
    expect(w.actors.tryOriginalCrowdHeightMismatchKccStep(id,from,
     {...crowd,y:from.y+.10},DT)).toBeNull();
    expect(w.actors.tryOriginalCrowdHeightMismatchKccStep(id,from,
     {...crowd,x:from.x+.08},DT)).toBeNull();
    w.actors.removeRealCpuFoot(id);
   }
   // An existing REAL CPU capsule overlapping the physical foot must
   // still veto the same tiny-height correction: KCC, not a fake walkway.
   const blocked=stalled[0]!;
   w.actors.syncRealCpuFoot('B2',blocked.from);
   w.actors.syncRealCpuFoot('B3',{
    x:blocked.from.x+.20,y:blocked.from.y,z:blocked.from.z
   });
   expect(w.actors.tryOriginalCrowdHeightMismatchKccStep(
    'B2',blocked.from,blocked.crowd,DT)).toBeNull();
   w.actors.removeRealCpuFoot('B3');
   w.actors.removeRealCpuFoot('B2');
   const upper=w.stage.metadata.teamBSpawn;
   const high={x:upper[0],y:upper[1],z:upper[2]};
   w.actors.syncRealCpuFoot('B2',high);
   expect(w.actors.tryOriginalCrowdHeightMismatchKccStep('B2',high,
    {...high,y:high.y+.023},DT)).toBeNull();
   expect(w.actors.tryOriginalCrowdHeightMismatchKccStep('B3',high,
    {...high,y:high.y+.023},DT)).toBeNull();
   expect([w.stage.solids.length,w.stage.paintSurfaces.length,
    w.stage.navigationLinks?.length]).toEqual([25,17,26]);
   expect(freeze.activationReady).toBe(false);
   w.actors.dispose();
  });
});
