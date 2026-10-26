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
 const step=(dx:number,dy:number,dz:number)=>{
  const before=body.translation();
  kcc.computeColliderMovement(collider,new Vec3(dx,dy,dz),undefined,undefined,
   col=>world.shouldCharacterCollide(col,'HUMAN'));
  for(let i=0;i<kcc.numComputedCollisions();i++){
   const hit=kcc.computedCollision(i)?.collider;
   const id=hit?world.sourceSolidIdForCollider(hit):null;
   if(id)collide.add(id);
  }
  const v=kcc.computedMovement();
  body.setNextKinematicTranslation({x:before.x+v.x,y:before.y+v.y,z:before.z+v.z});
  grounded=kcc.computedGrounded();world.step();ticks++;return grounded;
 };
 for(let i=0;i<30&&!grounded;i++)step(0,-.12,0);
 const initially=support(world,current());
 let speed=0,vy=-.5,index=0,maxOffGround=0,offGround=0;
 let floorTicks=0,slopeTicks=0;
 let ungroundedWhileOnSource=0,unexpectedSupportTicks=0;
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
      (side==='POSITIVE_Z'?'positive-z':'negative-z'))
     unexpectedSupportTicks++;
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
 return {side,lateralDeviationMeters:offset,registeredInitialSupport:initially.id,
  sameNativeRapierBody:true,initialSpawnOnly:true,teleportsAfterSpawn:0,
  kccSteps:ticks,firstFloorlineTick:firstEntry,firstSlopeTick:firstSlope,
  floorlineSupportedFrames:floorTicks,slopeSupportedFrames:slopeTicks,
  maxAirborneFrames:maxOffGround,ungroundedAfterFloorline:ungroundedWhileOnSource,
  unexpectedSupportAfterFloorline:unexpectedSupportTicks,
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
   expect(baseline.unexpectedSupportAfterFloorline).toBe(0);
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
      firstFloorlineTick:w.firstFloorlineTick,firstSlopeTick:w.firstSlopeTick,
      lastGoalError:w.closestSlopeXZDistanceMeters}))})),
    cpuCertified:false,authority:'25/17/26/0;0/12;false'}));
 },120000);
});
