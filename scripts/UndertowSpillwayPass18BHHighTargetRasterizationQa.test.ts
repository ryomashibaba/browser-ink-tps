import { readFileSync } from 'node:fs';
import type { NavMeshQuery } from 'recast-navigation';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../src/core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../src/navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageNavigationLinkDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {
  undertowPass18bTraversableQaAnchors,
  vec3
} from '../src/stage/undertow/UndertowSpillwayConnectivityQa';

type Side='POSITIVE_Z'|'NEGATIVE_Z';
interface ChainComponent{
  id:string;
  sourceMaterial?:string;
  yRange?:[number,number];
  mesh:StageTriangleMeshGeometry;
}
interface Fixture{
  version:'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly:true;
  runtimePromotionAuthorized:false;
  glass:Record<Side,{
    bridgeMesh:StageTriangleMeshGeometry;
    nearestNonBridgeMesh:StageTriangleMeshGeometry|null;
  }>;
  pass18g:{
    routes:{
      glass:Record<Side,{
        relaxedReachableComponentIds:string[];
        components:ChainComponent[];
      }>;
    };
  };
}
interface Pair{
  a:StageVector3;
  b:StageVector3;
  distanceMeters:number;
}
interface MatrixRow{from:string;reached:string[];}
interface MatrixSummary{
  reached:number;
  weak:number;
  strong:number;
  isolated:string[];
  rows:MatrixRow[];
}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const UPSTREAM_FIXED_RETREAT_METERS=0.130;
const UPSTREAM_RADIUS_METERS=0.995;
const FLOOR_SLOPE_RADIUS_METERS=0.80;
const SLOPE_FLOOR00_RADIUS_METERS=0.669;
const TRUSTED_SNAP_METERS=0.30;
const DIRECTIONAL_RADIUS_METERS=0.7005;
const LOW_SLOPE_RADIUS_METERS=0.80;
const RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS=1.55;
const RAW_ENDPOINT_VERTICAL_HALF_EXTENT_METERS=0.40;
const TRUSTED_IDENTITY_HALF_EXTENTS_METERS=[0.05,0.10,0.20,0.30] as const;
const MAX_RETREAT_METERS=0.654737328492778;
const UPSTREAM_SUCCESS_POINTS:Record<Side,StageVector3>={
  POSITIVE_Z:[-10.67826430970341,6,12.118397071136153],
  NEGATIVE_Z:[10.907632598231574,6,-11.92383277567933]
};
const IDS:Record<Side,{
  floor02:string;
  slope:string;
  floor00:string;
  lowerFloor02:string;
  routeFloor02:string;
  lowSlopes:readonly [string,string];
  highTargetFloor02:string;
  lowTargetFloor01:string;
}>={
  POSITIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2',
    lowerFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c2',
    routeFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c3',
    lowSlopes:[
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c5',
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c7'
    ],
    highTargetFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c5',
    lowTargetFloor01:'Fld_Temple01_pCube21595_1__FloorConcrete01|Fld_Temple01_FloorConcrete01|c0'
  },
  NEGATIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9',
    lowerFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c17',
    routeFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c16',
    lowSlopes:[
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c26',
      'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c24'
    ],
    highTargetFloor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c11',
    lowTargetFloor01:'Fld_Temple01_pCube21595_1__FloorConcrete01|Fld_Temple01_FloorConcrete01|c1'
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
  if(!best)throw new Error('Pass 18BH triangle pair missing');
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
  if(!best)throw new Error('Pass 18BH empty mesh pair');
  return best;
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
function navOnlySolid(id:string,mesh:StageTriangleMeshGeometry):StageSolidDefinition{
  return {
    id,center:[0,0,0],size:meshBounds(mesh),material:'light',
    render:false,projectileBlocker:false,cameraBlocker:false,
    collisionEnabled:false,navigationEnabled:true,
    collisionBehavior:'SOLID',triangleMesh:mesh
  };
}
function qaStage(
  id:string,
  solids:readonly StageSolidDefinition[],
  links:readonly StageNavigationLinkDefinition[]
):StageDefinition{
  const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata:{
      id,displayName:id,worldBounds:base.worldBounds,
      teamASpawn:base.teamASpawnFloorPoint,
      teamBSpawn:base.teamBSpawnFloorPoint,
      teamASpawnSlots:[base.teamASpawnFloorPoint],
      teamBSpawnSlots:[base.teamBSpawnFloorPoint],
      tacticalNodes:[],splatZones:[]
    },
    solids,paintSurfaces:base.paintSurfaces,navigationLinks:links
  };
}
function matrixSummary(stage:StageDefinition):MatrixSummary{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const anchors=undertowPass18bTraversableQaAnchors();
  const rows=anchors.map(from=>({
    from:from.id,
    reached:anchors
      .filter(to=>nav.auditPath(vec3(from.point),vec3(to.point)).reachedTarget)
      .map(to=>to.id)
  }));
  const ids=rows.map(r=>r.from);
  const reach=new Map(rows.map(r=>[r.from,new Set(r.reached)] as const));
  const weakSeen=new Set<string>();
  let weak=0;
  for(const seed of ids){
    if(weakSeen.has(seed))continue;
    weak++;
    weakSeen.add(seed);
    const stack=[seed];
    while(stack.length){
      const cur=stack.pop()!;
      for(const candidate of ids){
        if(weakSeen.has(candidate))continue;
        if(reach.get(cur)!.has(candidate)||reach.get(candidate)!.has(cur)){
          weakSeen.add(candidate);
          stack.push(candidate);
        }
      }
    }
  }
  const strongSeen=new Set<string>();
  let strong=0;
  for(const seed of ids){
    if(strongSeen.has(seed))continue;
    strong++;
    for(const candidate of ids){
      if(reach.get(seed)!.has(candidate)&&reach.get(candidate)!.has(seed)){
        strongSeen.add(candidate);
      }
    }
  }
  return {
    reached:rows.reduce((n,row)=>n+row.reached.length,0),
    weak,strong,
    isolated:rows
      .filter(row=>row.reached.length===1&&row.reached[0]===row.from)
      .map(row=>row.from),
    rows
  };
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18BH missing component ${id}`);
  return found;
}
function mutualAnchorIds(
  nav:RecastStageNavigation,
  point:StageVector3
):string[]{
  const anchors=undertowPass18bTraversableQaAnchors();
  return anchors.filter(anchor=>
    nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
    nav.auditPath(vec3(anchor.point),vec3(point)).reachedTarget
  ).map(anchor=>anchor.id);
}


function triangleCentroid(
  a:StageVector3,b:StageVector3,c:StageVector3
):StageVector3{
  return [(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
}
function meshSamples(mesh:StageTriangleMeshGeometry):StageVector3[]{
  const samples=[...mesh.vertices];
  for(let i=0;i<mesh.indices.length;i+=3){
    samples.push(triangleCentroid(
      mesh.vertices[mesh.indices[i]!]!,
      mesh.vertices[mesh.indices[i+1]!]!,
      mesh.vertices[mesh.indices[i+2]!]!
    ));
  }
  return samples;
}
function trustedRepresentative(
  nav:RecastStageNavigation,
  mesh:StageTriangleMeshGeometry
):{point:StageVector3;snapMeters:number}|null{
  let best:{point:StageVector3;snapMeters:number}|null=null;
  for(const sample of meshSamples(mesh)){
    const p=nav.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snapMeters=distance(sample,point);
    if(snapMeters>TRUSTED_SNAP_METERS+1e-9)continue;
    if(!best||snapMeters<best.snapMeters)best={point,snapMeters};
  }
  return best;
}


function materialLeaf(material:string|undefined):string{
  if(!material)return 'UNKNOWN';
  return material
    .replace(/^Fld_Temple01_/,'')
    .replace(/^FldObj_Temple01_PntSet_/,'');
}






function directTrustedRepresentative(
  query:NavMeshQuery,
  mesh:StageTriangleMeshGeometry
):{
  sample:StageVector3;
  point:StageVector3;
  snapMeters:number;
  polyRef:number;
}|null{
  let best:{
    sample:StageVector3;
    point:StageVector3;
    snapMeters:number;
    polyRef:number;
  }|null=null;
  for(const sample of meshSamples(mesh)){
    const result=query.findClosestPoint({
      x:sample[0],y:sample[1],z:sample[2]
    });
    if(!result.success)continue;
    const point=[
      result.point.x,result.point.y,result.point.z
    ] as StageVector3;
    const snapMeters=distance(sample,point);
    if(snapMeters>TRUSTED_SNAP_METERS+1e-9)continue;
    if(!best||snapMeters<best.snapMeters){
      best={sample,point,snapMeters,polyRef:result.polyRef};
    }
  }
  return best;
}


function meshWalkabilityMetrics(mesh:StageTriangleMeshGeometry){
  let surfaceArea3d=0;
  let projectedAreaXZ=0;
  let upwardWalkableTriangleCount=0;
  let downwardTriangleCount=0;
  let degenerateTriangleCount=0;
  let minNormalY=Number.POSITIVE_INFINITY;
  let maxNormalY=Number.NEGATIVE_INFINITY;
  const slopesDegrees:number[]=[];
  for(let i=0;i<mesh.indices.length;i+=3){
    const a=mesh.vertices[mesh.indices[i]!]!;
    const b=mesh.vertices[mesh.indices[i+1]!]!;
    const c=mesh.vertices[mesh.indices[i+2]!]!;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy;
    const ny=uz*vx-ux*vz;
    const nz=ux*vy-uy*vx;
    const len=Math.hypot(nx,ny,nz);
    if(len<=1e-12){
      degenerateTriangleCount+=1;
      continue;
    }
    const normalY=ny/len;
    minNormalY=Math.min(minNormalY,normalY);
    maxNormalY=Math.max(maxNormalY,normalY);
    const slopeDegrees=Math.acos(Math.max(-1,Math.min(1,normalY)))*180/Math.PI;
    slopesDegrees.push(slopeDegrees);
    if(normalY<0)downwardTriangleCount+=1;
    if(slopeDegrees<=GAME_CONFIG.cpu.navigationMaxSlopeDegrees+1e-9){
      upwardWalkableTriangleCount+=1;
    }
    surfaceArea3d+=0.5*len;
    projectedAreaXZ+=0.5*Math.abs(ux*vz-uz*vx);
  }
  const bounds=meshBounds(mesh);
  return {
    vertexCount:mesh.vertices.length,
    triangleCount:mesh.indices.length/3,
    boundsMeters:bounds,
    horizontalBoundingAreaMeters2:bounds[0]*bounds[2],
    surfaceArea3dMeters2:surfaceArea3d,
    projectedAreaXZMeters2:projectedAreaXZ,
    upwardWalkableTriangleCount,
    downwardTriangleCount,
    degenerateTriangleCount,
    minNormalY:Number.isFinite(minNormalY)?minNormalY:null,
    maxNormalY:Number.isFinite(maxNormalY)?maxNormalY:null,
    minSlopeDegrees:slopesDegrees.length?Math.min(...slopesDegrees):null,
    maxSlopeDegrees:slopesDegrees.length?Math.max(...slopesDegrees):null
  };
}
function bestLowLevelProjection(
  query:NavMeshQuery,
  mesh:StageTriangleMeshGeometry
):{
  sample:StageVector3;
  point:StageVector3;
  snapMeters:number;
  polyRef:number;
}|null{
  let best:{
    sample:StageVector3;
    point:StageVector3;
    snapMeters:number;
    polyRef:number;
  }|null=null;
  for(const sample of meshSamples(mesh)){
    const result=query.findClosestPoint({
      x:sample[0],y:sample[1],z:sample[2]
    });
    if(!result.success)continue;
    const point=[result.point.x,result.point.y,result.point.z] as StageVector3;
    const snapMeters=distance(sample,point);
    if(!best||snapMeters<best.snapMeters){
      best={sample,point,snapMeters,polyRef:result.polyRef};
    }
  }
  return best;
}
function inspectRasterization(
  id:string,
  solids:readonly StageSolidDefinition[],
  mesh:StageTriangleMeshGeometry
){
  try{
    const nav=new RecastStageNavigation(
      qaStage(id,solids,[]),
      new PerformanceStats()
    );
    const query=(nav as unknown as {query:NavMeshQuery}).query;
    const direct=directTrustedRepresentative(query,mesh);
    const nearest=bestLowLevelProjection(query,mesh);
    return {
      buildSuccess:true,
      buildError:null,
      directTrusted:direct!==null,
      directRepresentative:direct,
      anyProjection:nearest!==null,
      nearestProjection:nearest
    };
  }catch(error){
    return {
      buildSuccess:false,
      buildError:error instanceof Error?error.message:String(error),
      directTrusted:false,
      directRepresentative:null,
      anyProjection:false,
      nearestProjection:null
    };
  }
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BH HIGH target rasterization eligibility diagnostic',()=>{
  it('isolates whether the direct-invalid HIGH target mesh can produce production-config Recast polygons alone, with its source, or only in the full source soup',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(GAME_CONFIG.cpu.navigationCellSizeMeters).toBe(0.18);
    expect(GAME_CONFIG.cpu.navigationCellHeightMeters).toBe(0.10);
    expect(GAME_CONFIG.cpu.navigationMaxSlopeDegrees).toBe(52);
    expect(GAME_CONFIG.cpu.navigationWalkableRadiusVoxels).toBe(2);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const allSourceSolids:StageSolidDefinition[]=[];
    const sideSourceSolids={} as Record<Side,StageSolidDefinition[]>;
    const sideData={} as Record<Side,{
      highSource:ChainComponent;
      highTarget:ChainComponent;
      bridgeMesh:StageTriangleMeshGeometry;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      const solids=route.relaxedReachableComponentIds.map(id=>{
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18BH missing component ${side} ${id}`);
        return navOnlySolid(`pass18bh-source:${side}:${id}`,component.mesh);
      });
      sideSourceSolids[side]=solids;
      allSourceSolids.push(...solids);
      allSourceSolids.push(navOnlySolid(
        `pass18bh-bridge:${side}`,glass.bridgeMesh
      ));
      sideData[side]={
        highSource:componentById(route.components,IDS[side].slope),
        highTarget:componentById(route.components,IDS[side].highTargetFloor02),
        bridgeMesh:glass.bridgeMesh
      };
    }

    const fullStageSolids=[...base.solids,...allSourceSolids];
    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const source=sideData[side].highSource;
      const target=sideData[side].highTarget;
      const sourceSolid=navOnlySolid(`pass18bh-high-source:${side}`,source.mesh);
      const targetSolid=navOnlySolid(`pass18bh-high-target:${side}`,target.mesh);
      const bridgeSolid=navOnlySolid(`pass18bh-high-bridge:${side}`,sideData[side].bridgeMesh);
      const sourceMetrics=meshWalkabilityMetrics(source.mesh);
      const targetMetrics=meshWalkabilityMetrics(target.mesh);
      return [side,{
        sourceId:source.id,
        targetId:target.id,
        sourceMaterial:materialLeaf(source.sourceMaterial),
        targetMaterial:materialLeaf(target.sourceMaterial),
        sourceYRange:source.yRange??null,
        targetYRange:target.yRange??null,
        sourceMetrics,
        targetMetrics,
        sourceOnly:inspectRasterization(
          `pass18bh-source-only-${side.toLowerCase()}`,
          [sourceSolid],
          source.mesh
        ),
        targetOnly:inspectRasterization(
          `pass18bh-target-only-${side.toLowerCase()}`,
          [targetSolid],
          target.mesh
        ),
        sourcePlusTarget:inspectRasterization(
          `pass18bh-source-target-${side.toLowerCase()}`,
          [sourceSolid,targetSolid],
          target.mesh
        ),
        sideSourceSoup:inspectRasterization(
          `pass18bh-side-soup-${side.toLowerCase()}`,
          [...sideSourceSolids[side],bridgeSolid],
          target.mesh
        ),
        fullSourceSoup:inspectRasterization(
          `pass18bh-full-soup-${side.toLowerCase()}`,
          fullStageSolids,
          target.mesh
        )
      }];
    }));

    console.log('T21PASS18BH_HIGH_TARGET_RASTERIZATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BG',
      productionRecastConfig:{
        cellSizeMeters:GAME_CONFIG.cpu.navigationCellSizeMeters,
        cellHeightMeters:GAME_CONFIG.cpu.navigationCellHeightMeters,
        maxSlopeDegrees:GAME_CONFIG.cpu.navigationMaxSlopeDegrees,
        walkableHeightVoxels:GAME_CONFIG.cpu.navigationWalkableHeightVoxels,
        walkableClimbVoxels:GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
        walkableRadiusVoxels:GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
        minRegionArea:3,
        mergeRegionArea:8
      },
      trustedEndpointsUsedAsLinks:false,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      sides
    }));

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        sourceMetrics:{triangleCount:number;upwardWalkableTriangleCount:number};
        targetMetrics:{triangleCount:number;upwardWalkableTriangleCount:number;downwardTriangleCount:number};
        sourceOnly:{directTrusted:boolean};
        fullSourceSoup:{directTrusted:boolean};
      };
      expect(result.sourceMetrics.triangleCount).toBeGreaterThan(0);
      expect(result.targetMetrics.triangleCount).toBeGreaterThan(0);
      expect(result.sourceMetrics.upwardWalkableTriangleCount).toBeGreaterThan(0);
      expect(result.sourceOnly.directTrusted).toBe(true);
      expect(result.fullSourceSoup.directTrusted).toBe(false);
      expect(result.targetMetrics.upwardWalkableTriangleCount).toBeGreaterThanOrEqual(0);
      expect(result.targetMetrics.downwardTriangleCount).toBeGreaterThanOrEqual(0);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
