/**
 * B241: authentic source-only transverse width and physically driven
 * same-body local guided KCC ingress. NOT the live CpuAgentSystem.
 *
 * Original OBJ is SHA-verified and parsed upstream in the dedicated CI.
 * Never modify/expand triangles or register invented links or runtime floors.
 */
import RAPIER,{type Collider,type RigidBody} from '@dimforge/rapier3d-compat';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {Vec3} from 'playcanvas';
import {beforeAll,describe,it,expect} from 'vitest';
import {GAME_CONFIG} from '../src/config/game/gameConfig';
import {initializeRapier,RapierStagePhysics}
 from '../src/physics/RapierStagePhysics';
import {PLAYER_CHARACTER_PHYSICS as P,createConfiguredPlayerCharacterController}
 from '../src/player/PlayerCharacterPhysics';
import {b236InspectOriginalSlopeEntrance}
 from '../src/stage/undertow/B236OriginalSlope01IngressAudit';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY as FROZEN}
 from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {b240ReadPinnedSource,b240IsolatedOriginalStage,
 B240_SOURCE_PIN,type Side,type V3,type SourceSide}
 from './t21-b240-pinned-original-floorline-qa';

const DT=1/60, OFFSETS=[0,-.10,.10,-.20,.20,-.35,.35,-.50,.50] as const;
const TERMINAL:Record<Side,V3>={
 POSITIVE_Z:[5.604740142822266,4.599999904632568,35.83282470703125],
 NEGATIVE_Z:[-5.375261306762695,4.599999904632568,-35.627174377441406]
};
type Trace={version:string;originalSHA256:string;productionAuthorized:boolean;
 liveCpuCrossTeamRoutesCertified:string;
 results:Array<{side:Side;actualKcc:{walking:{
  initialReal25Supported:boolean;exactSourceIngressPhysicallyTraversed:boolean;
  teleportsAfterSpawn:number;maxAirborneFrames:number;
  sparseFrames:Array<{tick:number;foot:V3;grounded:boolean;physicalSupportId:string}>
 }}}>;
};
const len=(a:V3,b:V3)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const avg=(points:readonly V3[]):V3=>[
 points.reduce((a,p)=>a+p[0],0)/points.length,
 points.reduce((a,p)=>a+p[1],0)/points.length,
 points.reduce((a,p)=>a+p[2],0)/points.length];
const centroid=(v:readonly V3[]):V3=>avg(v);
function readPrior():Trace{
 const path=process.env.T21_B239_RESULT_OUTPUT;
 if(!path)throw Error('B241_NEEDS_FRESH_REAL_B239_KCC_TRACE');
 const report=JSON.parse(readFileSync(path,'utf8')) as Trace;
 if(report.version!=='B239_TRUE_NATIVE_ISOLATED_SOURCE_INGRESS_QA_V1'||
   report.originalSHA256!==B240_SOURCE_PIN||
   report.liveCpuCrossTeamRoutesCertified!=='0/12'||
   report.productionAuthorized!==false||report.results.length!==2)
  throw Error('B241_B239_TRACE_PROVENANCE_OR_STAGE_DRIFT');
 for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
  const t=report.results.find(x=>x.side===side)?.actualKcc.walking;
  if(!t?.initialReal25Supported||!t.exactSourceIngressPhysicallyTraversed||
    t.teleportsAfterSpawn!==0||t.maxAirborneFrames!==0||
    !t.sparseFrames.some(f=>f.grounded&&
     f.physicalSupportId.startsWith('B239_PINNED_ORIGINAL_FLOORLINE:')))
   throw Error('B241_NO_GENUINE_GROUNDED_SOURCE_PATH_'+side);
 }
 return report;
}
function support(w:RapierStagePhysics,p:V3){
 const hit=w.castCharacterFootSupport(
  new Vec3(p[0],p[1]+P.humanFootOffsetMeters+.06,p[2]),
  P.humanFootOffsetMeters,'HUMAN');
 return {id:hit?.solidId??null,pointY:hit?.point.y??null,
  mismatch:hit?Math.abs(p[1]-hit.point.y):null};
}
/**
 * Horizontal Y-isoline of the ORIGINAL sloping two-triangle surface.
 * Each cross-section is measured from original triangle edges, not
 * a synthetic walkable polygon. This reports source support width,
 * NOT proof that a capsule of that diameter can safely fit.
 */
/** B369: 9 source-only downward ray observations inside the ACTUAL
 * human capsule footprint, not a proxy collision or invented floor. */
function b369Footprint(world:RapierStagePhysics,foot:V3){
 const r=P.humanRadiusMeters*.78;
 const directions:readonly (readonly [number,number])[]=[
  [0,0],[r,0],[-r,0],[0,r],[0,-r],
  [r/Math.SQRT2,r/Math.SQRT2],[r/Math.SQRT2,-r/Math.SQRT2],
  [-r/Math.SQRT2,r/Math.SQRT2],[-r/Math.SQRT2,-r/Math.SQRT2]
 ];
 return directions.map(([dx,dz])=>{
  const p:V3=[foot[0]+dx,foot[1],foot[2]+dz];
  const hit=support(world,p);
  const near=hit.id!==null&&hit.mismatch!==null&&hit.mismatch<=.20;
  return {offsetXZ:[dx,dz] as const,realColliderId:hit.id,
   heightErrorMeters:hit.mismatch,nearFoot:near};
 });
}
function crossSection(c:SourceSide,portion:number){
 const v=c.triangles.flatMap(t=>t.vertices);
 const low=Math.min(...v.map(x=>x[1]));
 const high=Math.max(...v.map(x=>x[1]));
 const y=low+(high-low)*portion;
 const intersections:V3[]=[];
 for(const tri of c.triangles){
  for(let i=0;i<3;i++){
   const a=tri.vertices[i]!,b=tri.vertices[(i+1)%3]!;
   const da=a[1]-y,db=b[1]-y;
   if(da*db>0||Math.abs(a[1]-b[1])<1e-10)continue;
   const t=(y-a[1])/(b[1]-a[1]);
   if(t<0||t>1)continue;
   const p:V3=[a[0]+(b[0]-a[0])*t,y,a[2]+(b[2]-a[2])*t];
   if(!intersections.some(q=>len(q,p)<1e-6))intersections.push(p);
  }
 }
 if(intersections.length<2)throw Error('B241_NO_EXACT_SOURCE_SLICE_'+portion);
 let largest:[V3,V3]=[intersections[0]!,intersections[1]!],d=0;
 for(const a of intersections)for(const b of intersections){
  const trial=len(a,b);if(trial>d){d=trial;largest=[a,b];}
 }
 return {y,portion,edgeA:largest[0],edgeB:largest[1],
  horizontalSourceWidthMeters:d,midpoint:avg(largest)};
}
function centerLine(c:SourceSide){
 const p=c.rightLowWitness.originalTriangleNearestWitness;
 const q=c.slopeTopWitness.originalTriangleNearestWitness;
 const dx=q[0]-p[0],dz=q[2]-p[2],d=Math.hypot(dx,dz);
 if(d<.25)throw Error('B241_SOURCE_AXIS_TOO_SHORT');
 return {lateral:[-dz/d,dx/d] as const,axisLength:d};
}
function driven(side:Side,c:SourceSide,offset:number){
 const qa=b240IsolatedOriginalStage(side,c),world=new RapierStagePhysics(DT,qa);
 world.step();
 const initial=TERMINAL[side];
 const physicalFloorline='B240_EXACT_SOURCE_FLOORLINE:'+side;
 const physicalSlope='B235_EXACT_CI688_QA:underpass-route-slope01-'+
  (side==='POSITIVE_Z'?'positive-z':'negative-z');
 const registeredRight='UndertowT21D:right-low-team-'+
  (side==='POSITIVE_Z'?'a':'b');
 const sourceTop=c.rightLowWitness.originalTriangleNearestWitness;
 const approach=c.rightLowWitness.registeredBoundaryWitness;
 const inner=centroid(c.triangles[0]!.vertices);
 const sourceLow=c.slopeTopWitness.originalTriangleNearestWitness;
 const destination:V3=[...b236InspectOriginalSlopeEntrance(side).topFoot];
 const lateral=centerLine(c).lateral;
 const shift=(p:V3):V3=>[p[0]+offset*lateral[0],p[1],p[2]+offset*lateral[1]];
 // Only ORIGINAL-derived waypoints and a deliberate lateral deviation.
 // Original source triangles and physical collision world never move.
 const path:V3[]=[approach,shift(sourceTop),shift(inner),shift(sourceLow),destination];
 const body:RigidBody=world.world.createRigidBody(
  RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
   initial[0],initial[1]+P.humanFootOffsetMeters+.06,initial[2]));
 const collider:Collider=world.world.createCollider(
  RAPIER.ColliderDesc.capsule(P.humanHalfHeightMeters,P.humanRadiusMeters),body);
 const kcc=createConfiguredPlayerCharacterController(world.world);
 const current=():V3=>{const p=body.translation();return[p.x,p.y-P.humanFootOffsetMeters,p.z];};
 let ticks=0,grounded=false;
 const collide=new Set<string>();
 let b369LastKccContacts:Array<{
  originalCollisionId:string|null;normalY:number;
  originalWorldWitness:V3;timeOfImpact:number
 }>=[];
 // B370: actual before/after KCC movement; this is measurement only.
 let b370LastStep:{
  actualPreStepFoot:V3;actualPostStepFoot:V3;
  requestedMovement:V3;computedMovement:V3
 }|null=null;
 const step=(dx:number,dy:number,dz:number)=>{
  const actualPreStepFoot=current();
  const before=body.translation();
  kcc.computeColliderMovement(collider,new Vec3(dx,dy,dz),undefined,undefined,
   col=>world.shouldCharacterCollide(col,'HUMAN'));
  b369LastKccContacts=[];
  for(let i=0;i<kcc.numComputedCollisions();i++){
   const hit=kcc.computedCollision(i);
   const id=hit?.collider?world.sourceSolidIdForCollider(hit.collider):null;
   if(id)collide.add(id);
   if(hit) {
    const n=hit.normal1,p=hit.witness1;
    b369LastKccContacts.push({originalCollisionId:id,
     normalY:n.y,originalWorldWitness:[p.x,p.y,p.z],
     timeOfImpact:hit.toi});
   }
  }
  const v=kcc.computedMovement();
  body.setNextKinematicTranslation({x:before.x+v.x,y:before.y+v.y,z:before.z+v.z});
  grounded=kcc.computedGrounded();world.step();ticks++;
  b370LastStep={actualPreStepFoot,actualPostStepFoot:current(),
   requestedMovement:[dx,dy,dz],computedMovement:[v.x,v.y,v.z]};
  return grounded;
 };
 for(let i=0;i<30&&!grounded;i++)step(0,-.12,0);
 const initially=support(world,current());
 let speed=0,vy=-.5,index=0,maxOffGround=0,offGround=0;
 let floorTicks=0,slopeTicks=0;
 let ungroundedWhileOnSource=0,unexpectedSupportTicks=0;
 const unexpectedSupportDetails:Array<{tick:number;solidId:string|null;foot:V3;rayHeightMismatchMeters:number|null}>=[];
 const b369AmbiguousFrames:Array<{
  tick:number;trueKccGrounded:boolean;centerFootRayId:string|null;
  realBodyFoot:V3;actualKccContacts:typeof b369LastKccContacts;
  actualFootprintRays:ReturnType<typeof b369Footprint>;
  upwardSourceCollisionIds:string[];
  nearSourceFootprintRayIds:string[];
  collisionAndRayAgree:boolean;
  actualSourceCollisionAuthorityProven:false;
  cpuNativeRouteCertified:false
 }>=[];
 // Timeline is collected only on the zero-lateral-offset baseline.
 // Contact events are from native Rapier KCC, never a synthetic support.
 const b370NativeTimeline:Array<{
  tick:number;actualPreStepFoot:V3;actualPostStepFoot:V3;
  requestedMovement:V3;computedMovement:V3;computedGrounded:boolean;
  realUpwardSourceContacts:typeof b369LastKccContacts
 }>=[];
 let sourceEntered=false,firstEntry:number|null=null,firstSlope:number|null=null;
 let maxSourceSupportError=0,minDistanceToLast=Infinity;
 const frames:unknown[]=[];
 for(let i=0;i<540;i++){
  const p=current(),target=path[Math.min(index,path.length-1)]!;
  if(len(p,target)<.29&&index<path.length-1)index++;
  const t=path[Math.min(index,path.length-1)]!;
  const dx=t[0]-p[0],dz=t[2]-p[2],d=Math.hypot(dx,dz);
  const goalSpeed=Math.min(GAME_CONFIG.cpu.maxSpeedMetersPerSecond,
   Math.sqrt(2*GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2*d));
  speed=Math.min(goalSpeed,speed+GAME_CONFIG.cpu.maxAccelerationMetersPerSecond2*DT);
  vy=Math.max(-GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
   vy-GAME_CONFIG.player.gravityMetersPerSecond2*DT);
  step(d>1e-8?dx/d*speed*DT:0,vy*DT,d>1e-8?dz/d*speed*DT:0);
  if(grounded&&vy<0)vy=-.5;
  const q=current(),hit=support(world,q);
  if(offset===0&&b370LastStep) {
   b370NativeTimeline.push({tick:i,...b370LastStep,
    computedGrounded:grounded,
    realUpwardSourceContacts:b369LastKccContacts.filter(contact=>
     contact.originalCollisionId!==null&&contact.normalY>=.5&&
     Number.isFinite(contact.timeOfImpact)&&contact.timeOfImpact>=0)
     .map(contact=>({...contact}))});
  }
  const onFloor=grounded&&hit.id===physicalFloorline&&
   hit.mismatch!==null&&hit.mismatch<.20;
  const onSlope=grounded&&hit.id===physicalSlope&&
   hit.mismatch!==null&&hit.mismatch<.20&&len(q,destination)<.30;
  if(onFloor){floorTicks++;sourceEntered=true;if(firstEntry===null)firstEntry=i;}
  if(onSlope){slopeTicks++;if(firstSlope===null)firstSlope=i;}
  if(sourceEntered){
   if(!grounded)ungroundedWhileOnSource++;
   if(grounded&&hit.id!==physicalFloorline&&hit.id!==physicalSlope&&
    hit.id!==registeredRight&&
    hit.id!=='UndertowT21D:first-drop-landing-'+
      (side==='POSITIVE_Z'?'positive-z':'negative-z')) {
     unexpectedSupportTicks++;
     if(unexpectedSupportDetails.length<24)
      unexpectedSupportDetails.push({tick:i,solidId:hit.id,foot:q,
       rayHeightMismatchMeters:hit.mismatch});
     if(offset===0&&b369AmbiguousFrames.length<32){
      const rays=b369Footprint(world,q);
      const ids=[...new Set(rays.filter(r=>r.nearFoot&&r.realColliderId)
       .map(r=>r.realColliderId!))];
      const up=[...new Set(b369LastKccContacts.filter(c=>
       c.originalCollisionId!==null&&c.normalY>=.5&&
       Number.isFinite(c.timeOfImpact)&&c.timeOfImpact>=0
      ).map(c=>c.originalCollisionId!))];
      b369AmbiguousFrames.push({
       tick:i,trueKccGrounded:grounded,centerFootRayId:hit.id,
       realBodyFoot:q,actualKccContacts:b369LastKccContacts.map(x=>({...x})),
       actualFootprintRays:rays,upwardSourceCollisionIds:up,
       nearSourceFootprintRayIds:ids,
       collisionAndRayAgree:up.some(id=>ids.includes(id)),
       actualSourceCollisionAuthorityProven:false,
       cpuNativeRouteCertified:false
      });
     }
   }
  }
  if(hit.mismatch!==null&&sourceEntered)
   maxSourceSupportError=Math.max(maxSourceSupportError,hit.mismatch);
  if(!grounded){offGround++;maxOffGround=Math.max(maxOffGround,offGround);}
  else offGround=0;
  minDistanceToLast=Math.min(minDistanceToLast,len(q,destination));
  if(i%60===0||onFloor&&firstEntry===i||onSlope&&firstSlope===i)
   frames.push({tick:i,foot:q,sourceSolidId:hit.id,grounded,waypoint:index});
  if(floorTicks>=3&&slopeTicks>=3)break;
  if(q[1]<-8)break;
 }
 // B370: show the *real* nearest before/after source contacts around
 // B369's silent frames. Neighbour contacts are not same-tick support.
 const b370SilentFrames=b369AmbiguousFrames.filter(f=>
  f.actualKccContacts.length===0).map(f=>{
  const index=b370NativeTimeline.findIndex(x=>x.tick===f.tick);
  if(index<0)throw Error('B370_REAL_KCC_TIMELINE_MISSING_'+side+'_'+f.tick);
  const here=b370NativeTimeline[index]!;
  const previous=b370NativeTimeline.slice(0,index).reverse()
   .find(x=>x.realUpwardSourceContacts.length>0);
  const next=b370NativeTimeline.slice(index+1)
   .find(x=>x.realUpwardSourceContacts.length>0);
  const realDelta:V3=[
   here.actualPostStepFoot[0]-here.actualPreStepFoot[0],
   here.actualPostStepFoot[1]-here.actualPreStepFoot[1],
   here.actualPostStepFoot[2]-here.actualPreStepFoot[2]];
  const witness=(x:typeof here|undefined)=>x?{
   tick:x.tick,tickSeparation:Math.abs(x.tick-f.tick),
   genuineNativeUpwardContacts:x.realUpwardSourceContacts}:null;
  return {tick:f.tick,trueComputedGrounded:here.computedGrounded,
   sameFrameKccContacts:f.actualKccContacts,
   actualPreStepFoot:here.actualPreStepFoot,
   actualPostStepFoot:here.actualPostStepFoot,
   actualNativeBodyDisplacement:realDelta,
   actualRequestedMovement:here.requestedMovement,
   actualKccComputedMovement:here.computedMovement,
   nearestPreviousOriginalContact:witness(previous),
   nearestNextOriginalContact:witness(next),
   observedSourceFootprintRays:f.actualFootprintRays,
   configuredSnapToGroundMeters:P.snapToGroundMeters,
   snapAppliedInThisFrameCertified:false,
   sameFrameOriginalSourceContactCertified:false,
   continuousOriginalSupportCertified:false,
   autonomousCpuRouteCertified:false};
 });
 return {side,lateralDeviationMeters:offset,registeredInitialSupport:initially.id,
  sameNativeRapierBody:true,initialSpawnOnly:true,teleportsAfterSpawn:0,
  kccSteps:ticks,firstFloorlineTick:firstEntry,firstSlopeTick:firstSlope,
  floorlineSupportedFrames:floorTicks,slopeSupportedFrames:slopeTicks,
  maxAirborneFrames:maxOffGround,ungroundedAfterFloorline:ungroundedWhileOnSource,
  unexpectedSupportAfterFloorline:unexpectedSupportTicks,
  unexpectedSupportDetails,
  b370TemporalKccAudit:{
   silentFrames:b370SilentFrames,
   recordedReal60HzBaselineSteps:b370NativeTimeline.length,
   observedKccSilentGroundedCount:b370SilentFrames.length,
   actualRapierWorldUnchanged:true,
   newSourceCollidersAdded:0,liveCpuRouteCertified:false,
   officialTurfWinner:'NONE',productionAuthorized:false
  },
  b369PhysicalContactWitness:{
   ambiguousCenterRayFrames:b369AmbiguousFrames,
   countedFrames:b369AmbiguousFrames.length,
   framesWithKccUpwardRealCollision:b369AmbiguousFrames.filter(
    f=>f.upwardSourceCollisionIds.length>0).length,
   framesWithNearPerimeterRay:b369AmbiguousFrames.filter(
    f=>f.nearSourceFootprintRayIds.length>0).length,
   framesWhereNativeCollisionAndRayAgree:b369AmbiguousFrames.filter(
    f=>f.collisionAndRayAgree).length,
   realNativeRapierBody:true,realKccColliderWitness:true,
   humanCapsuleRadiusMeters:P.humanRadiusMeters,
   originalSourceCollisionSemanticsAuthenticated:false,
   authorizedCpuNavigation:false,addedStageSolidCount:0,
   officialTurfWinner:'NONE',productionAuthorized:false
  },
  strictOriginalSourceFootRayContinuity:
   sourceEntered&&unexpectedSupportTicks===0&&ungroundedWhileOnSource===0,
  maxObservedSupportMismatchMeters:maxSourceSupportError,
  sourceGroundSupportIds:[...collide].sort(),
  waypointIndex:index,closestSlopeXZDistanceMeters:minDistanceToLast,
  finalFoot:current(),samples:frames,
  physicallyTraversedOriginalSource:
   initially.id===registeredRight&&floorTicks>=3&&slopeTicks>=3&&
   maxOffGround===0&&ungroundedWhileOnSource===0,
  liveCpuAgentSystemInstantiated:false,certifiedCpuRoute:false};
}
beforeAll(async()=>initializeRapier());
describe('B241 real physical original FloorLine width and guided capsule lateral tolerance',()=>{
 it('keeps true source 25/17/26 geometry frozen and records both mirror lateral sensitivity',()=>{
  const s=b240ReadPinnedSource(),prior=readPrior(),rows=[];
  expect(FROZEN.activationReady).toBe(false);
  expect(FROZEN.solids).toHaveLength(25);
  expect(FROZEN.paintSurfaces).toHaveLength(17);
  expect(FROZEN.navigationLinks).toHaveLength(26);
  expect(P.humanRadiusMeters).toBe(.32);
  expect(GAME_CONFIG.cpu.agentRadiusMeters).toBe(.30);
  for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
   const c=s.sides[side],qa=b240IsolatedOriginalStage(side,c);
   const physics=new RapierStagePhysics(DT,qa);physics.step();
   const slices=[.10,.25,.50,.75,.90].map(t=>{
    const section=crossSection(c,t);
    const offsets=[-.50,-.35,-.20,-.10,0,.10,.20,.35,.50].map(offset=>{
     const w=section.edgeA,u=section.edgeB,dx=u[0]-w[0],dz=u[2]-w[2];
     const width=Math.hypot(dx,dz);
     const pos:V3=[section.midpoint[0]+dx/width*offset,
       section.y,section.midpoint[2]+dz/width*offset];
     const hit=support(physics,pos);
     return {offsetMeters:offset,originalRapierSourceId:hit.id,
      originalFloorlineRayGrounded:hit.id==='B240_EXACT_SOURCE_FLOORLINE:'+side&&
       hit.mismatch!==null&&hit.mismatch<.02};
    });
    return {...section,offsetWitnesses:offsets,
     sourceWidthExceedsCpuDiameter:section.horizontalSourceWidthMeters>=.60,
     sourceWidthExceedsHumanDiameter:section.horizontalSourceWidthMeters>=.64,
     sourceWidthIsNotCapsuleClearanceCertificate:true};
   });
   const attempts=OFFSETS.map(delta=>driven(side,c,delta));
   const baseline=attempts[0]!;
   // Exact B239 zero-deviation guidance is measured again, not assumed.
   expect(baseline.lateralDeviationMeters).toBe(0);
   expect(baseline.physicallyTraversedOriginalSource).toBe(true);
   expect(baseline.floorlineSupportedFrames).toBeGreaterThanOrEqual(3);
   expect(baseline.slopeSupportedFrames).toBeGreaterThanOrEqual(3);
   expect(baseline.maxAirborneFrames).toBe(0);
   const b369=baseline.b369PhysicalContactWitness;
   // This gate must remeasure B241's actual ambiguity instead of
   // treating a missing center ray as either a fall or a safe crossing.
   expect(b369.countedFrames).toBe(baseline.unexpectedSupportAfterFloorline);
   expect(b369.countedFrames).toBeGreaterThan(0);
   expect(b369.ambiguousCenterRayFrames.every(f=>
    f.trueKccGrounded&&f.actualFootprintRays.length===9&&
    f.actualKccContacts.every(q=>Number.isFinite(q.normalY)&&
     Number.isFinite(q.timeOfImpact)&&q.originalWorldWitness.length===3&&
     q.originalWorldWitness.every(Number.isFinite))&&
    f.actualSourceCollisionAuthorityProven===false&&
    f.cpuNativeRouteCertified===false)).toBe(true);
   // B369 measured 7/8 original center-ray misses, while actual
   // peripheral rays are present every frame. Do not turn geometry
   // proximity into a native CPU route: some KCC ticks have NO collision.
   expect(b369.framesWithNearPerimeterRay).toBe(b369.countedFrames);
   expect(b369.framesWithKccUpwardRealCollision).toBeGreaterThan(0);
   expect(b369.framesWithKccUpwardRealCollision).toBeLessThan(
    b369.countedFrames);
   expect(b369.framesWhereNativeCollisionAndRayAgree).toBe(
    b369.framesWithKccUpwardRealCollision);
   expect(b369.ambiguousCenterRayFrames.every(f=>
    f.centerFootRayId===null&&
    f.nearSourceFootprintRayIds.length>0)).toBe(true);
   expect(b369.ambiguousCenterRayFrames.some(f=>
    f.actualKccContacts.length===0&&f.nearSourceFootprintRayIds.length>0))
    .toBe(true);
   expect(b369.originalSourceCollisionSemanticsAuthenticated).toBe(false);
   expect(b369.authorizedCpuNavigation).toBe(false);
   // B370 records genuine temporal contact and actual motor displacement
   // without manufacturing six solver contacts at ground=true silent ticks.
   const b370=baseline.b370TemporalKccAudit;
   expect(b370.silentFrames).toHaveLength(3);
   expect(b370.recordedReal60HzBaselineSteps).toBeGreaterThan(100);
   expect(b370.silentFrames.every(f=>
    f.trueComputedGrounded&&f.sameFrameKccContacts.length===0&&
    f.observedSourceFootprintRays.length===9&&
    f.configuredSnapToGroundMeters===.24&&
    !f.snapAppliedInThisFrameCertified&&
    !f.sameFrameOriginalSourceContactCertified&&
    !f.continuousOriginalSupportCertified&&
    !f.autonomousCpuRouteCertified&&
    [...f.actualPreStepFoot,...f.actualPostStepFoot,
     ...f.actualRequestedMovement,...f.actualKccComputedMovement,
     ...f.actualNativeBodyDisplacement].every(Number.isFinite)&&
    f.actualNativeBodyDisplacement.every((v,j)=>
     Math.abs(v-f.actualKccComputedMovement[j]!)<1e-4)&&
    [f.nearestPreviousOriginalContact,f.nearestNextOriginalContact]
     .filter(x=>x!==null).every(x=>
      x!.tickSeparation>0&&
      x!.genuineNativeUpwardContacts.length>0))).toBe(true);
   expect(b370.newSourceCollidersAdded).toBe(0);
   expect(b370.liveCpuRouteCertified).toBe(false);
   // KCC computedGrounded is not proof of a raycast-confirmed exact
   // original foot solid in every frame. Keep the ambiguous contact
   // witnessed in the result instead of inventing source support.
   expect(baseline.strictOriginalSourceFootRayContinuity).toBe(
    baseline.unexpectedSupportAfterFloorline===0&&
    baseline.ungroundedAfterFloorline===0);
   // B241 measured real original *narrow* source: a 0.311m ribbon
   // alone cannot certify clearance for a 0.60m CPU or 0.64m human.
   expect(slices.every(x=>x.horizontalSourceWidthMeters>.30&&
    x.horizontalSourceWidthMeters<.32&&
    x.sourceWidthExceedsCpuDiameter===false&&
    x.sourceWidthExceedsHumanDiameter===false)).toBe(true);
   // First actual physical CI #40332224903: a +.50m excursion
   // produced unsupported KCC frames on BOTH genuine mirrors.
   // Never represent reaching the endpoint after an airborne fall
   // as a strictly grounded supported path.
   const risky=attempts.find(x=>x.lateralDeviationMeters===.50);
   expect(risky?.physicallyTraversedOriginalSource).toBe(false);
   expect(risky?.maxAirborneFrames).toBeGreaterThan(0);
   expect(attempts.every(x=>x.teleportsAfterSpawn===0&&
    x.sameNativeRapierBody&&x.liveCpuAgentSystemInstantiated===false)).toBe(true);
   expect(slices).toHaveLength(5);
   expect(slices.every(x=>x.horizontalSourceWidthMeters>0&&
    Number.isFinite(x.horizontalSourceWidthMeters))).toBe(true);
   expect(qa.solids).toHaveLength(31);
   rows.push({side,originalSourceFaceIDs:c.triangles.map(x=>x.originalFaceIndex),
    sourceOriginalMaterial:c.sourceMaterial,
    referenceB239OriginalWalkingKccCertified:
     prior.results.find(x=>x.side===side)?.actualKcc.walking.exactSourceIngressPhysicallyTraversed,
    widthSlices:slices,walkTests:attempts,
    stageSolidsInIsolatedQa:qa.solids.length,sourceOnly:true,
    autonomousCpuRouteCertified:false});
  }
  const result={version:'B241_PINNED_ORIGINAL_SOURCE_NATIVE_CAPSULE_LATERAL_QA_V1',
   originalSHA256:B240_SOURCE_PIN,rows,originalStage:'25/17/26/0',
   originalOpponentPathsCertified:'0/12',officialWinner:'NONE',
   productionAuthorized:false,full4v4Certified:false,
   sourceGeometryUnchanged:true,originalNavLinksUnchanged:true,
   noOffmeshLinkAdded:true,actualCpuAgentSystemTested:false};
  const file=process.env.T21_B241_RESULT_OUTPUT;
  if(file){mkdirSync(dirname(file),{recursive:true});
   writeFileSync(file,JSON.stringify(result,null,2));}
  console.log('B241_GENUINE_ORIGINAL_CAPSULE_TRANSVERSE_TOLERANCE_QA',
   JSON.stringify({version:result.version,originalSHA256:result.originalSHA256,
    sides:rows.map(r=>({side:r.side,
     widths:r.widthSlices.map(w=>({portion:w.portion,meters:w.horizontalSourceWidthMeters,
      cpuDiameterExceedsSource:w.horizontalSourceWidthMeters<.60,
      actualCenterRaySource:w.offsetWitnesses.find(o=>o.offsetMeters===0)?.originalFloorlineRayGrounded})),
     kccDeviationTrials:r.walkTests.map(w=>({offset:w.lateralDeviationMeters,
      walked:w.physicallyTraversedOriginalSource,
      floorlineFrames:w.floorlineSupportedFrames,slopeFrames:w.slopeSupportedFrames,
      airborne:w.maxAirborneFrames,afterEnteredUngrounded:w.ungroundedAfterFloorline,
      unexpectedSupport:w.unexpectedSupportAfterFloorline,
      ambiguousSupportDetails:w.unexpectedSupportDetails,
      b369NativeCapsuleContact:w.lateralDeviationMeters===0?
       w.b369PhysicalContactWitness:undefined,
      b370NativeTemporalContact:w.lateralDeviationMeters===0?
       w.b370TemporalKccAudit:undefined,
      strictSourceFootRayContinuity:w.strictOriginalSourceFootRayContinuity,
      firstFloorlineTick:w.firstFloorlineTick,firstSlopeTick:w.firstSlopeTick,
      lastGoalError:w.closestSlopeXZDistanceMeters}))})),
    cpuCertified:false,authority:'25/17/26/0;0/12;false'}));
 },120000);
});
