import RAPIER, { type Collider, type RigidBody } from '@dimforge/rapier3d-compat';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { Vec3 } from 'playcanvas';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
import {
  PLAYER_CHARACTER_PHYSICS,
  createConfiguredPlayerCharacterController
} from '../src/player/PlayerCharacterPhysics';
import {
  RapierStagePhysics,
  initializeRapier
} from '../src/physics/RapierStagePhysics';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

type Side='POSITIVE_Z'|'NEGATIVE_Z';

interface ChainComponent{
  id:string;
  sourceMaterial:string;
  yRange:[number,number];
  mesh:StageTriangleMeshGeometry;
}
interface Fixture{
  version:'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly:true;
  runtimePromotionAuthorized:false;
  pass18g:{routes:{glass:Record<Side,{
    relaxedReachableComponentIds:string[];
    components:ChainComponent[];
  }>;}}};
}
interface Pair{
  a:StageVector3;
  b:StageVector3;
  distanceMeters:number;
}
interface TraverseResult{
  reachedTargetSurface:boolean;
  settledInitially:boolean;
  finalGrounded:boolean;
  jumpRequested:boolean;
  groundedTicks:number;
  airborneTicks:number;
  ticks:number;
  finalHorizontalErrorMeters:number;
  finalFootY:number;
  targetFootY:number;
  finalVerticalErrorMeters:number;
  minimumFootY:number;
  maximumFootY:number;
  maximumRiseAboveStartMeters:number;
  maximumDropBelowStartMeters:number;
  startSurface:StageVector3;
  targetSurface:StageVector3;
}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const DT=1/60;
const INSET_METERS=0.10;
const IDS:Record<Side,{highFloor00:string;lowFloor02:string}>={
  POSITIVE_Z:{
    highFloor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2',
    lowFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c2'
  },
  NEGATIVE_Z:{
    highFloor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9',
    lowFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c17'
  }
};

function distance(a:StageVector3,b:StageVector3):number{
  return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
}
function add(a:StageVector3,b:StageVector3):StageVector3{
  return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
}
function sub(a:StageVector3,b:StageVector3):StageVector3{
  return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}
function mul(a:StageVector3,s:number):StageVector3{
  return [a[0]*s,a[1]*s,a[2]*s];
}
function dot(a:StageVector3,b:StageVector3):number{
  return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}
function closestPointOnTriangle(
  p:StageVector3,a:StageVector3,b:StageVector3,c:StageVector3
):StageVector3{
  const ab=sub(b,a),ac=sub(c,a),ap=sub(p,a);
  const d1=dot(ab,ap),d2=dot(ac,ap);
  if(d1<=0&&d2<=0)return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
  if(d3>=0&&d4<=d3)return b;
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0)return add(a,mul(ab,d1/(d1-d3)));
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
  if(d6>=0&&d5<=d6)return c;
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0)return add(a,mul(ac,d2/(d2-d6)));
  const va=d3*d6-d5*d4;
  if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0){
    return add(b,mul(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
  }
  const denom=1/(va+vb+vc),v=vb*denom,w=vc*denom;
  return add(a,add(mul(ab,v),mul(ac,w)));
}
function closestSegments(
  p1:StageVector3,q1:StageVector3,p2:StageVector3,q2:StageVector3
):Pair{
  const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2);
  const aa=dot(d1,d1),ee=dot(d2,d2),ff=dot(d2,r),eps=1e-15;
  let s=0,t=0;
  if(aa<=eps&&ee<=eps)return {a:p1,b:p2,distanceMeters:distance(p1,p2)};
  if(aa<=eps)t=Math.max(0,Math.min(1,ff/ee));
  else{
    const cc=dot(d1,r);
    if(ee<=eps)s=Math.max(0,Math.min(1,-cc/aa));
    else{
      const bb=dot(d1,d2),den=aa*ee-bb*bb;
      if(Math.abs(den)>eps)s=Math.max(0,Math.min(1,(bb*ff-cc*ee)/den));
      const tn=bb*s+ff;
      if(tn<0){t=0;s=Math.max(0,Math.min(1,-cc/aa));}
      else if(tn>ee){t=1;s=Math.max(0,Math.min(1,(bb-cc)/aa));}
      else t=tn/ee;
    }
  }
  const pa=add(p1,mul(d1,s)),pb=add(p2,mul(d2,t));
  return {a:pa,b:pb,distanceMeters:distance(pa,pb)};
}
function trianglePair(
  a0:StageVector3,a1:StageVector3,a2:StageVector3,
  b0:StageVector3,b1:StageVector3,b2:StageVector3
):Pair{
  let best:Pair|null=null;
  const consider=(candidate:Pair)=>{
    if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;
  };
  for(const p of [a0,a1,a2]){
    const q=closestPointOnTriangle(p,b0,b1,b2);
    consider({a:p,b:q,distanceMeters:distance(p,q)});
  }
  for(const p of [b0,b1,b2]){
    const q=closestPointOnTriangle(p,a0,a1,a2);
    consider({a:q,b:p,distanceMeters:distance(q,p)});
  }
  for(const [ap,aq] of [[a0,a1],[a1,a2],[a2,a0]] as const){
    for(const [bp,bq] of [[b0,b1],[b1,b2],[b2,b0]] as const){
      consider(closestSegments(ap,aq,bp,bq));
    }
  }
  if(!best)throw new Error('Pass 18AP triangle pair missing');
  return best;
}
function closestMeshPair(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry):Pair{
  let best:Pair|null=null;
  for(let ai=0;ai<a.indices.length;ai+=3){
    const a0=a.vertices[a.indices[ai]!]!;
    const a1=a.vertices[a.indices[ai+1]!]!;
    const a2=a.vertices[a.indices[ai+2]!]!;
    for(let bi=0;bi<b.indices.length;bi+=3){
      const b0=b.vertices[b.indices[bi]!]!;
      const b1=b.vertices[b.indices[bi+1]!]!;
      const b2=b.vertices[b.indices[bi+2]!]!;
      const candidate=trianglePair(a0,a1,a2,b0,b1,b2);
      if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;
    }
  }
  if(!best)throw new Error('Pass 18AP empty mesh pair');
  return best;
}
function nearestTriangleCentroid(
  mesh:StageTriangleMeshGeometry,
  boundary:StageVector3
):StageVector3{
  let bestDistance=Number.POSITIVE_INFINITY;
  let best:StageVector3|null=null;
  for(let i=0;i<mesh.indices.length;i+=3){
    const a=mesh.vertices[mesh.indices[i]!]!;
    const b=mesh.vertices[mesh.indices[i+1]!]!;
    const c=mesh.vertices[mesh.indices[i+2]!]!;
    const q=closestPointOnTriangle(boundary,a,b,c);
    const d=distance(boundary,q);
    if(d<bestDistance){
      bestDistance=d;
      best=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
    }
  }
  if(!best)throw new Error('Pass 18AP nearest triangle missing');
  return best;
}
function insetSurfacePoint(
  mesh:StageTriangleMeshGeometry,
  boundary:StageVector3
):StageVector3{
  const centroid=nearestTriangleCentroid(mesh,boundary);
  const dx=centroid[0]-boundary[0],dz=centroid[2]-boundary[2];
  const horizontal=Math.hypot(dx,dz);
  if(horizontal<=1e-8)return boundary;
  const t=Math.min(0.45,INSET_METERS/horizontal);
  return [
    boundary[0]+(centroid[0]-boundary[0])*t,
    boundary[1]+(centroid[1]-boundary[1])*t,
    boundary[2]+(centroid[2]-boundary[2])*t
  ];
}
function meshBounds(mesh:StageTriangleMeshGeometry):StageVector3{
  const xs=mesh.vertices.map(v=>v[0]);
  const ys=mesh.vertices.map(v=>v[1]);
  const zs=mesh.vertices.map(v=>v[2]);
  return [
    Math.max(...xs)-Math.min(...xs),
    Math.max(...ys)-Math.min(...ys),
    Math.max(...zs)-Math.min(...zs)
  ];
}
function collisionSolid(id:string,mesh:StageTriangleMeshGeometry):StageSolidDefinition{
  return {
    id,center:[0,0,0],size:meshBounds(mesh),material:'light',
    render:false,projectileBlocker:false,cameraBlocker:false,
    collisionEnabled:true,navigationEnabled:false,
    collisionBehavior:'SOLID',triangleMesh:mesh
  };
}
function qaStage(
  id:string,
  highMesh:StageTriangleMeshGeometry,
  lowMesh:StageTriangleMeshGeometry
):StageDefinition{
  return {
    metadata:{
      id,displayName:id,
      worldBounds:UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds,
      teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
      teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
      tacticalNodes:[],splatZones:[]
    },
    solids:[
      collisionSolid(`${id}:high`,highMesh),
      collisionSolid(`${id}:low`,lowMesh)
    ],
    paintSurfaces:[],navigationLinks:[]
  };
}
function createHumanCharacter(
  physics:RapierStagePhysics,
  surface:StageVector3
):{
  body:RigidBody;
  collider:Collider;
  character:ReturnType<typeof createConfiguredPlayerCharacterController>;
}{
  const body=physics.world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      surface[0],
      surface[1]+PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters+0.06,
      surface[2]
    )
  );
  const collider=physics.world.createCollider(
    RAPIER.ColliderDesc.capsule(
      PLAYER_CHARACTER_PHYSICS.humanHalfHeightMeters,
      PLAYER_CHARACTER_PHYSICS.humanRadiusMeters
    ),
    body
  );
  return {
    body,collider,
    character:createConfiguredPlayerCharacterController(physics.world)
  };
}
function applyKccTick(
  physics:RapierStagePhysics,
  body:RigidBody,
  collider:Collider,
  character:ReturnType<typeof createConfiguredPlayerCharacterController>,
  desired:Vec3
):boolean{
  const before=body.translation();
  character.computeColliderMovement(
    collider,desired,undefined,undefined,
    (candidate:Collider)=>physics.shouldCharacterCollide(candidate,'HUMAN')
  );
  const corrected=character.computedMovement();
  body.setNextKinematicTranslation({
    x:before.x+corrected.x,
    y:before.y+corrected.y,
    z:before.z+corrected.z
  });
  const grounded=character.computedGrounded();
  physics.step();
  return grounded;
}
function moveToward(current:number,target:number,maxDelta:number):number{
  if(current<target)return Math.min(target,current+maxDelta);
  if(current>target)return Math.max(target,current-maxDelta);
  return current;
}
function traverse(
  id:string,
  highMesh:StageTriangleMeshGeometry,
  lowMesh:StageTriangleMeshGeometry,
  startSurface:StageVector3,
  targetSurface:StageVector3,
  jumpRequested:boolean
):TraverseResult{
  const physics=new RapierStagePhysics(DT,qaStage(id,highMesh,lowMesh));
  physics.step();
  const {body,collider,character}=createHumanCharacter(physics,startSurface);

  let grounded=false;
  for(let tick=0;tick<30;tick+=1){
    grounded=applyKccTick(
      physics,body,collider,character,new Vec3(0,-0.12,0)
    );
    if(grounded)break;
  }

  const settledInitially=grounded;
  let verticalVelocity=grounded?-0.5:0;
  let horizontalSpeed=0;
  let jumpPending=jumpRequested;
  let groundedTicks=0,airborneTicks=0,ticks=0;
  let minimumFootY=Number.POSITIVE_INFINITY;
  let maximumFootY=Number.NEGATIVE_INFINITY;
  let finalGrounded=grounded;

  for(;ticks<240;ticks+=1){
    const position=body.translation();
    const footY=position.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    const dx=targetSurface[0]-position.x,dz=targetSurface[2]-position.z;
    const horizontalError=Math.hypot(dx,dz);
    const verticalError=Math.abs(targetSurface[1]-footY);
    if(grounded&&horizontalError<=0.16&&verticalError<=0.12)break;

    const dirX=horizontalError>1e-9?dx/horizontalError:0;
    const dirZ=horizontalError>1e-9?dz/horizontalError:0;
    horizontalSpeed=moveToward(
      horizontalSpeed,
      GAME_CONFIG.player.humanSpeedMetersPerSecond,
      GAME_CONFIG.player.groundAccelerationMetersPerSecond2*DT
    );
    const horizontalStep=Math.min(horizontalSpeed*DT,horizontalError);

    if(jumpPending&&grounded){
      verticalVelocity=GAME_CONFIG.player.jumpSpeedMetersPerSecond;
      grounded=false;
      jumpPending=false;
    }
    verticalVelocity=Math.max(
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      verticalVelocity-GAME_CONFIG.player.gravityMetersPerSecond2*DT
    );

    grounded=applyKccTick(
      physics,body,collider,character,
      new Vec3(dirX*horizontalStep,verticalVelocity*DT,dirZ*horizontalStep)
    );
    finalGrounded=grounded;
    if(grounded){
      groundedTicks+=1;
      if(verticalVelocity<0)verticalVelocity=-0.5;
    }else{
      airborneTicks+=1;
    }
    const after=body.translation();
    const afterFootY=after.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minimumFootY=Math.min(minimumFootY,afterFootY);
    maximumFootY=Math.max(maximumFootY,afterFootY);
  }

  const final=body.translation();
  const finalFootY=final.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
  const finalHorizontalErrorMeters=Math.hypot(
    targetSurface[0]-final.x,targetSurface[2]-final.z
  );
  const finalVerticalErrorMeters=Math.abs(targetSurface[1]-finalFootY);
  return {
    reachedTargetSurface:
      settledInitially&&finalGrounded&&
      finalHorizontalErrorMeters<=0.20&&
      finalVerticalErrorMeters<=0.12,
    settledInitially,finalGrounded,jumpRequested,
    groundedTicks,airborneTicks,ticks,
    finalHorizontalErrorMeters,finalFootY,
    targetFootY:targetSurface[1],finalVerticalErrorMeters,
    minimumFootY,maximumFootY,
    maximumRiseAboveStartMeters:
      Number.isFinite(maximumFootY)?maximumFootY-startSurface[1]:Number.NaN,
    maximumDropBelowStartMeters:
      Number.isFinite(minimumFootY)?startSurface[1]-minimumFootY:Number.NaN,
    startSurface,targetSurface
  };
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18AP missing component ${id}`);
  return found;
}

beforeAll(async()=>{await initializeRapier();});

describe('T21 Pass 18AP FloorConcrete00/FloorConcrete02 production-KCC traversal classification',()=>{
  it('separates ordinary walk, normal jump, and natural drop across the exact mirrored post-18AO source boundary',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters).toBe(0.34);
    expect(GAME_CONFIG.player.jumpSpeedMetersPerSecond).toBe(8.2);
    expect(GAME_CONFIG.player.gravityMetersPerSecond2).toBe(28);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const boundaries={} as Record<Side,Pair>;
    const geometry={} as Record<Side,{
      highSurface:StageVector3;
      lowSurface:StageVector3;
      boundaryHorizontalMeters:number;
      boundaryVerticalDeltaMeters:number;
    }>;
    const probes:Record<string,TraverseResult>={};

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const components=fixture.pass18g.routes.glass[side].components;
      const high=componentById(components,IDS[side].highFloor00);
      const low=componentById(components,IDS[side].lowFloor02);
      const pair=closestMeshPair(high.mesh,low.mesh);
      boundaries[side]=pair;
      const highSurface=insetSurfacePoint(high.mesh,pair.a);
      const lowSurface=insetSurfacePoint(low.mesh,pair.b);
      geometry[side]={
        highSurface,lowSurface,
        boundaryHorizontalMeters:Math.hypot(pair.a[0]-pair.b[0],pair.a[2]-pair.b[2]),
        boundaryVerticalDeltaMeters:pair.a[1]-pair.b[1]
      };

      probes[`${side}:low-to-high:walk`]=traverse(
        `pass18ap-${side.toLowerCase()}-low-high-walk`,
        high.mesh,low.mesh,lowSurface,highSurface,false
      );
      probes[`${side}:low-to-high:jump`]=traverse(
        `pass18ap-${side.toLowerCase()}-low-high-jump`,
        high.mesh,low.mesh,lowSurface,highSurface,true
      );
      probes[`${side}:high-to-low:drop`]=traverse(
        `pass18ap-${side.toLowerCase()}-high-low-drop`,
        high.mesh,low.mesh,highSurface,lowSurface,false
      );
    }

    console.log('T21PASS18AP_FLOOR00_FLOOR02_KCC',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      sourcePass:'18AO',
      sourceBoundary:'FloorConcrete00(Y=3)->FloorConcrete02(Y=1.5)',
      insetMeters:INSET_METERS,
      humanRadiusMeters:PLAYER_CHARACTER_PHYSICS.humanRadiusMeters,
      controllerOffsetMeters:PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
      autostepMaxHeightMeters:PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters,
      jumpSpeedMetersPerSecond:GAME_CONFIG.player.jumpSpeedMetersPerSecond,
      gravityMetersPerSecond2:GAME_CONFIG.player.gravityMetersPerSecond2,
      boundaries,geometry,probes
    }));

    expect(Object.keys(probes)).toHaveLength(6);
    expect(boundaries.POSITIVE_Z.distanceMeters).toBeCloseTo(
      1.8236261924604125,11
    );
    expect(boundaries.NEGATIVE_Z.distanceMeters).toBeCloseTo(
      1.8236261924604125,11
    );
    expect(geometry.POSITIVE_Z.boundaryVerticalDeltaMeters).toBeCloseTo(1.5,12);
    expect(geometry.NEGATIVE_Z.boundaryVerticalDeltaMeters).toBeCloseTo(1.5,12);
    expect(Object.values(probes).every(probe=>probe.settledInitially)).toBe(true);
    for(const probe of Object.values(probes)){
      expect(Number.isFinite(probe.finalHorizontalErrorMeters)).toBe(true);
      expect(Number.isFinite(probe.finalVerticalErrorMeters)).toBe(true);
      expect(Number.isFinite(probe.minimumFootY)).toBe(true);
      expect(Number.isFinite(probe.maximumFootY)).toBe(true);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },60000);
});
