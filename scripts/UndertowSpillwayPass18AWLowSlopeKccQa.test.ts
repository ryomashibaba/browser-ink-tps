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

interface ChainComponent {
  id:string;
  sourceMaterial?:string;
  yRange?:[number,number];
  mesh:StageTriangleMeshGeometry;
}
interface Fixture {
  version:'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly:true;
  runtimePromotionAuthorized:false;
  pass18g:{
    routes:{
      glass:Record<Side,{
        relaxedReachableComponentIds:string[];
        components:ChainComponent[];
      }>;
    };
  };
}
interface Pair {
  a:StageVector3;
  b:StageVector3;
  distanceMeters:number;
}
interface TraverseResult {
  success:boolean;
  settledInitially:boolean;
  groundedTicks:number;
  airborneTicks:number;
  ticks:number;
  finalHorizontalErrorMeters:number;
  minimumFootY:number;
  maximumFootY:number;
  startSurface:StageVector3;
  targetSurface:StageVector3;
  physicalBoundaryDistanceMeters:number;
}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const DT=1/60;
const IDS:Record<Side,{floor:string;slopes:readonly string[]}>={
  POSITIVE_Z:{
    floor:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c3',
    slopes:[
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c5',
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c7'
    ]
  },
  NEGATIVE_Z:{
    floor:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c16',
    slopes:[
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c26',
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c24'
    ]
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
  if(!best)throw new Error('Pass 18AW triangle pair missing');
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
  if(!best)throw new Error('Pass 18AW empty mesh pair');
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
  if(!best)throw new Error('Pass 18AW nearest triangle missing');
  return best;
}
function insetSurfacePoint(
  mesh:StageTriangleMeshGeometry,
  boundary:StageVector3,
  insetMeters=0.10
):StageVector3{
  const centroid=nearestTriangleCentroid(mesh,boundary);
  const dx=centroid[0]-boundary[0],dz=centroid[2]-boundary[2];
  const horizontal=Math.hypot(dx,dz);
  if(horizontal<=1e-8)return boundary;
  const t=Math.min(0.45,insetMeters/horizontal);
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
  solids:readonly StageSolidDefinition[]
):StageDefinition{
  return {
    metadata:{
      id,displayName:id,
      worldBounds:UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.worldBounds,
      teamASpawn:[0,0,0],teamBSpawn:[0,0,0],
      teamASpawnSlots:[[0,0,0]],teamBSpawnSlots:[[0,0,0]],
      tacticalNodes:[],splatZones:[]
    },
    solids,paintSurfaces:[],navigationLinks:[]
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
    collider,
    desired,
    undefined,
    undefined,
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
function traverseHuman(
  id:string,
  slopeMesh:StageTriangleMeshGeometry,
  floorMesh:StageTriangleMeshGeometry,
  pair:Pair,
  reverse=false
):TraverseResult{
  const sourceMesh=reverse?floorMesh:slopeMesh;
  const targetMesh=reverse?slopeMesh:floorMesh;
  const sourceBoundary=reverse?pair.b:pair.a;
  const targetBoundary=reverse?pair.a:pair.b;
  const startSurface=insetSurfacePoint(sourceMesh,sourceBoundary);
  const targetSurface=insetSurfacePoint(targetMesh,targetBoundary);

  const physics=new RapierStagePhysics(
    DT,
    qaStage(id,[
      collisionSolid(`${id}:source`,sourceMesh),
      collisionSolid(`${id}:target`,targetMesh)
    ])
  );
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
  let groundedTicks=0,airborneTicks=0,ticks=0;
  let minimumFootY=Number.POSITIVE_INFINITY;
  let maximumFootY=Number.NEGATIVE_INFINITY;

  for(;ticks<180;ticks+=1){
    const p=body.translation();
    const dx=targetSurface[0]-p.x,dz=targetSurface[2]-p.z;
    const horizontalError=Math.hypot(dx,dz);
    if(horizontalError<=0.16)break;
    const step=Math.min(
      GAME_CONFIG.player.humanSpeedMetersPerSecond*DT,
      horizontalError
    );
    const dirX=horizontalError>1e-9?dx/horizontalError:0;
    const dirZ=horizontalError>1e-9?dz/horizontalError:0;
    verticalVelocity=Math.max(
      -GAME_CONFIG.player.maxFallSpeedMetersPerSecond,
      verticalVelocity-GAME_CONFIG.player.gravityMetersPerSecond2*DT
    );
    grounded=applyKccTick(
      physics,body,collider,character,
      new Vec3(dirX*step,verticalVelocity*DT,dirZ*step)
    );
    if(grounded){
      groundedTicks+=1;
      if(verticalVelocity<0)verticalVelocity=-0.5;
    }else{
      airborneTicks+=1;
    }
    const after=body.translation();
    const footY=after.y-PLAYER_CHARACTER_PHYSICS.humanFootOffsetMeters;
    minimumFootY=Math.min(minimumFootY,footY);
    maximumFootY=Math.max(maximumFootY,footY);
  }

  const final=body.translation();
  const finalHorizontalErrorMeters=Math.hypot(
    targetSurface[0]-final.x,
    targetSurface[2]-final.z
  );
  return {
    success:
      settledInitially&&
      finalHorizontalErrorMeters<=0.20&&
      minimumFootY>=Math.min(startSurface[1],targetSurface[1])-0.60,
    settledInitially,groundedTicks,airborneTicks,ticks,
    finalHorizontalErrorMeters,minimumFootY,maximumFootY,
    startSurface,targetSurface,
    physicalBoundaryDistanceMeters:pair.distanceMeters
  };
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18AW missing component ${id}`);
  return found;
}

beforeAll(async()=>{await initializeRapier();});

describe('T21 Pass 18AW lower FloorConcrete02 to low FloorSlope00 production-KCC diagnostic',()=>{
  it('tests all four exact Pass 18AV route-continuing low-slope candidate boundaries in both directions before any connector authoring',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(PLAYER_CHARACTER_PHYSICS.humanRadiusMeters).toBe(0.32);
    expect(PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters).toBe(0.025);
    expect(PLAYER_CHARACTER_PHYSICS.autostepMaxHeightMeters).toBe(0.34);
    expect(PLAYER_CHARACTER_PHYSICS.snapToGroundMeters).toBe(0.24);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const results:Record<string,TraverseResult>={};
    const boundaries:Record<string,Pair>={};
    const candidates:Array<{
      side:Side;
      index:number;
      floorId:string;
      slopeId:string;
      distanceMeters:number;
      boundaryVerticalDeltaMeters:number;
      floorToSlopeSuccess:boolean;
      slopeToFloorSuccess:boolean;
    }>=[];

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const components=fixture.pass18g.routes.glass[side].components;
      const floor=componentById(components,IDS[side].floor);
      for(const [index,slopeId] of IDS[side].slopes.entries()){
        const slope=componentById(components,slopeId);
        const pair=closestMeshPair(slope.mesh,floor.mesh);
        const key=`${side}:candidate-${index+1}`;
        boundaries[key]=pair;

        const floorToSlope=traverseHuman(
          `pass18aw-${side.toLowerCase()}-${index+1}-floor-to-slope`,
          slope.mesh,floor.mesh,pair,true
        );
        const slopeToFloor=traverseHuman(
          `pass18aw-${side.toLowerCase()}-${index+1}-slope-to-floor`,
          slope.mesh,floor.mesh,pair,false
        );
        results[`${key}:floor-to-slope`]=floorToSlope;
        results[`${key}:slope-to-floor`]=slopeToFloor;
        candidates.push({
          side,index:index+1,floorId:floor.id,slopeId:slope.id,
          distanceMeters:pair.distanceMeters,
          boundaryVerticalDeltaMeters:pair.b[1]-pair.a[1],
          floorToSlopeSuccess:floorToSlope.success,
          slopeToFloorSuccess:slopeToFloor.success
        });
      }
    }

    console.log('T21PASS18AW_LOW_SLOPE_KCC',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      sourcePass:'18AV',
      sourceBoundaryClass:'FloorConcrete02@Y1.5->FloorSlope00@Y0..1.5',
      effectiveHumanContactRadiusMeters:
        PLAYER_CHARACTER_PHYSICS.humanRadiusMeters+
        PLAYER_CHARACTER_PHYSICS.controllerOffsetMeters,
      candidates,boundaries,results
    }));

    expect(candidates).toHaveLength(4);
    expect(Object.keys(results)).toHaveLength(8);
    expect(candidates[0]!.distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(candidates[1]!.distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(candidates[2]!.distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(candidates[3]!.distanceMeters).toBeCloseTo(0.5185586972146133,11);
    for(const candidate of candidates){
      expect(Math.abs(candidate.boundaryVerticalDeltaMeters)).toBeLessThanOrEqual(1e-9);
    }
    for(const result of Object.values(results)){
      expect(result.settledInitially).toBe(true);
      expect(Number.isFinite(result.finalHorizontalErrorMeters)).toBe(true);
      expect(Number.isFinite(result.minimumFootY)).toBe(true);
      expect(Number.isFinite(result.maximumFootY)).toBe(true);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },90000);
});
