import { readFileSync } from 'node:fs';
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
const BRANCH_RADII_METERS=[1.500,1.510,1.515,1.520,1.522,1.524,1.525,1.530,1.540,1.550] as const;
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
  if(!best)throw new Error('Pass 18BC triangle pair missing');
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
  if(!best)throw new Error('Pass 18BC empty mesh pair');
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
  if(!found)throw new Error(`Pass 18BC missing component ${id}`);
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




beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BC HIGH exact-raw narrow-radius diagnostic',()=>{
  it('sweeps only the exact raw HIGH one-way endpoints immediately above the Pass 18BA 1.50m ceiling after Pass 18BB rejects local retreat',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideData={} as Record<Side,{
      bridgeFloor:Pair;
      floorSlope:Pair;
      slopeFloor00:Pair;
      floor00LowerFloor02:Pair;
      upstreamFixedEndpoint:StageVector3;
      lowPairs:readonly [Pair,Pair];
      highPair:Pair;
      lowPair:Pair;
      highSource:ChainComponent;
      highTarget:ChainComponent;
      lowSource:ChainComponent;
      lowTarget:ChainComponent;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18BC missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18bc-downstream:${side}:${id}`,component.mesh));
      }
      sourceSolids.push(navOnlySolid(`pass18bc-predecessor:${side}`,glass.bridgeMesh));

      const floor02=componentById(route.components,IDS[side].floor02);
      const slope=componentById(route.components,IDS[side].slope);
      const floor00=componentById(route.components,IDS[side].floor00);
      const lowerFloor02=componentById(route.components,IDS[side].lowerFloor02);
      const routeFloor02=componentById(route.components,IDS[side].routeFloor02);
      const lowSlopes=IDS[side].lowSlopes.map(id=>
        componentById(route.components,id)
      ) as unknown as readonly [ChainComponent,ChainComponent];
      const highTarget=componentById(route.components,IDS[side].highTargetFloor02);
      const lowTarget=componentById(route.components,IDS[side].lowTargetFloor01);

      const bridgeFloor=closestMeshPair(glass.bridgeMesh,floor02.mesh);
      const floorSlope=closestMeshPair(floor02.mesh,slope.mesh);
      const slopeFloor00=closestMeshPair(slope.mesh,floor00.mesh);
      const floor00LowerFloor02=closestMeshPair(floor00.mesh,lowerFloor02.mesh);
      const lowPairs=lowSlopes.map(lowSlope=>
        closestMeshPair(routeFloor02.mesh,lowSlope.mesh)
      ) as unknown as readonly [Pair,Pair];
      const highPair=closestMeshPair(slope.mesh,highTarget.mesh);
      const lowPair=closestMeshPair(lowSlopes[1].mesh,lowTarget.mesh);

      const target=UPSTREAM_SUCCESS_POINTS[side];
      const delta=sub(target,bridgeFloor.b);
      const length=Math.hypot(delta[0],delta[1],delta[2]);
      expect(length).toBeCloseTo(MAX_RETREAT_METERS,12);
      const direction=[
        delta[0]/length,delta[1]/length,delta[2]/length
      ] as StageVector3;
      const upstreamFixedEndpoint=[
        bridgeFloor.b[0]+direction[0]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloor.b[1]+direction[1]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloor.b[2]+direction[2]*UPSTREAM_FIXED_RETREAT_METERS
      ] as StageVector3;

      sideData[side]={
        bridgeFloor,floorSlope,slopeFloor00,floor00LowerFloor02,
        upstreamFixedEndpoint,lowPairs,highPair,lowPair,
        highSource:slope,highTarget,
        lowSource:lowSlopes[1],lowTarget
      };
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    let userId=23000;
    const frozenLinks:StageNavigationLinkDefinition[]=[];
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      frozenLinks.push({
        id:`pass18bc-upstream-${side.toLowerCase()}`,
        start:sideData[side].bridgeFloor.a,
        end:sideData[side].upstreamFixedEndpoint,
        radiusMeters:UPSTREAM_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18bc-floor-slope-${side.toLowerCase()}`,
        start:sideData[side].floorSlope.a,
        end:sideData[side].floorSlope.b,
        radiusMeters:FLOOR_SLOPE_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18bc-slope-floor00-${side.toLowerCase()}`,
        start:sideData[side].slopeFloor00.a,
        end:sideData[side].slopeFloor00.b,
        radiusMeters:SLOPE_FLOOR00_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18bc-drop-${side.toLowerCase()}`,
        start:sideData[side].floor00LowerFloor02.a,
        end:sideData[side].floor00LowerFloor02.b,
        radiusMeters:DIRECTIONAL_RADIUS_METERS,
        bidirectional:false,userId:userId++
      });
      for(const [index,pair] of sideData[side].lowPairs.entries()){
        frozenLinks.push({
          id:`pass18bc-low-${side.toLowerCase()}-${index+1}`,
          start:pair.a,end:pair.b,
          radiusMeters:LOW_SLOPE_RADIUS_METERS,
          bidirectional:true,userId:userId++
        });
      }
    }

    const baselineStage=qaStage(
      'pass18bc-frozen-chain',
      solids,[...inherited,...frozenLinks]
    );
    const baselineMatrix=matrixSummary(baselineStage);
    const baselineNav=new RecastStageNavigation(baselineStage,new PerformanceStats());
    const anchors=undertowPass18bTraversableQaAnchors();

    const representatives={} as Record<Side,{
      highSource:{point:StageVector3;snapMeters:number};
      highTarget:{point:StageVector3;snapMeters:number};
      lowSource:{point:StageVector3;snapMeters:number};
      lowTarget:{point:StageVector3;snapMeters:number};
    }>;
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const highSource=trustedRepresentative(baselineNav,sideData[side].highSource.mesh);
      const highTarget=trustedRepresentative(baselineNav,sideData[side].highTarget.mesh);
      const lowSource=trustedRepresentative(baselineNav,sideData[side].lowSource.mesh);
      const lowTarget=trustedRepresentative(baselineNav,sideData[side].lowTarget.mesh);
      if(!highSource||!highTarget||!lowSource||!lowTarget){
        throw new Error(`Pass 18BC trusted representative missing ${side}`);
      }
      representatives[side]={highSource,highTarget,lowSource,lowTarget};
    }

    const classify=(stage:StageDefinition,side:Side)=>{
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const rep=representatives[side];
      const nonGlass=anchors.filter(anchor=>!anchor.id.startsWith('glass:'));
      const highSourceToTarget=nav.auditPath(vec3(rep.highSource.point),vec3(rep.highTarget.point)).reachedTarget;
      const highTargetToSource=nav.auditPath(vec3(rep.highTarget.point),vec3(rep.highSource.point)).reachedTarget;
      const lowSourceToTarget=nav.auditPath(vec3(rep.lowSource.point),vec3(rep.lowTarget.point)).reachedTarget;
      const lowTargetToSource=nav.auditPath(vec3(rep.lowTarget.point),vec3(rep.lowSource.point)).reachedTarget;
      const targetPoints=[rep.highTarget.point,rep.lowTarget.point];
      const targetReachesNonGlass=targetPoints.some(point=>
        nonGlass.some(anchor=>nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget)
      );
      return {
        highSourceToTarget,highTargetToSource,
        lowSourceToTarget,lowTargetToSource,
        targetReachesNonGlass
      };
    };

    type Mode=
      |'HIGH_FORWARD_NO_JUMP'
      |'HIGH_REVERSE_JUMP'
      |'HIGH_BOTH';

    const evaluate=(radiusMeters:number,mode:Mode)=>{
      const links:StageNavigationLinkDefinition[]=[];
      const add=(side:Side,branch:'HIGH'|'LOW',forward:boolean)=>{
        const pair=branch==='HIGH'?sideData[side].highPair:sideData[side].lowPair;
        links.push({
          id:`pass18bc-${branch.toLowerCase()}-${forward?'forward':'reverse'}-${side.toLowerCase()}-${radiusMeters.toFixed(2)}`,
          start:forward?pair.a:pair.b,
          end:forward?pair.b:pair.a,
          radiusMeters,
          bidirectional:false,
          userId:userId++
        });
      };
      for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
        if(mode==='HIGH_FORWARD_NO_JUMP'||mode==='HIGH_BOTH')add(side,'HIGH',true);
        if(mode==='HIGH_REVERSE_JUMP'||mode==='HIGH_BOTH')add(side,'HIGH',false);
      }
      const stage=qaStage(
        `pass18bc-${mode.toLowerCase()}-${radiusMeters.toFixed(2)}`,
        solids,[...inherited,...frozenLinks,...links]
      );
      const matrix=matrixSummary(stage);
      const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,classify(stage,side)
      ]));
      return {
        radiusMeters,mode,
        matrix:{reached:matrix.reached,weak:matrix.weak,strong:matrix.strong,isolated:matrix.isolated},
        anyNonGlassCollateral:
          (sides.POSITIVE_Z as ReturnType<typeof classify>).targetReachesNonGlass ||
          (sides.NEGATIVE_Z as ReturnType<typeof classify>).targetReachesNonGlass,
        sides
      };
    };

    const modes:Mode[]=[
      'HIGH_FORWARD_NO_JUMP',
      'HIGH_REVERSE_JUMP',
      'HIGH_BOTH'
    ];
    const samples=BRANCH_RADII_METERS.map(radiusMeters=>
      Object.fromEntries(modes.map(mode=>[mode,evaluate(radiusMeters,mode)]))
    );

    const succeeds=(sample:ReturnType<typeof evaluate>,mode:Mode)=>{
      const pos=sample.sides.POSITIVE_Z as ReturnType<typeof classify>;
      const neg=sample.sides.NEGATIVE_Z as ReturnType<typeof classify>;
      if(mode==='HIGH_FORWARD_NO_JUMP')return pos.highSourceToTarget&&neg.highSourceToTarget;
      if(mode==='HIGH_REVERSE_JUMP')return pos.highTargetToSource&&neg.highTargetToSource;
      return (
        pos.highSourceToTarget&&pos.highTargetToSource&&
        neg.highSourceToTarget&&neg.highTargetToSource
      );
    };
    const firstSuccessByMode=Object.fromEntries(modes.map(mode=>[
      mode,
      samples.map(row=>row[mode] as ReturnType<typeof evaluate>).find(sample=>succeeds(sample,mode))??null
    ]));

    const baselineSides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
      side,classify(baselineStage,side)
    ]));

    console.log('T21PASS18BA_POST_LOW_SLOPE_DIRECTIONAL_ATTACHMENT',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BB',
      priorRawTargetSnapsMeters:{
        POSITIVE_Z:1.5146358772143251,
        NEGATIVE_Z:1.5236093815313405
      },
      localRetreatImprovedAttachment:false,
      trustedEndpointsUsedAsLinks:false,
      exactRawEndpointsUsed:true,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      upstreamDirectionalAssumption:'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters:DIRECTIONAL_RADIUS_METERS,
      lowSlopeRadiusMeters:LOW_SLOPE_RADIUS_METERS,
      radiiMeters:BRANCH_RADII_METERS,
      physicalDistances:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,{
          high:sideData[side].highPair.distanceMeters,
          low:sideData[side].lowPair.distanceMeters
        }
      ])),
      baseline:{
        matrix:{reached:baselineMatrix.reached,weak:baselineMatrix.weak,strong:baselineMatrix.strong,isolated:baselineMatrix.isolated},
        sides:baselineSides
      },
      representatives,
      firstSuccessByMode,
      samples
    }));

    expect(baselineMatrix.reached).toBe(79);
    expect(baselineMatrix.weak).toBe(9);
    expect(baselineMatrix.strong).toBe(11);
    expect(sideData.POSITIVE_Z.highPair.distanceMeters).toBeCloseTo(1.061284827751945,11);
    expect(sideData.NEGATIVE_Z.highPair.distanceMeters).toBeCloseTo(1.061284827751945,11);
    expect(sideData.POSITIVE_Z.lowPair.distanceMeters).toBeCloseTo(1.1595324972956065,11);
    expect(sideData.NEGATIVE_Z.lowPair.distanceMeters).toBeCloseTo(1.1595324972956047,11);
    for(const row of samples){
      for(const mode of modes){
        const sample=row[mode] as ReturnType<typeof evaluate>;
        expect(sample.matrix.reached).toBe(79);
        expect(sample.matrix.weak).toBe(9);
        expect(sample.matrix.strong).toBe(11);
        expect(sample.anyNonGlassCollateral).toBe(false);
      }
    }
    expect(firstSuccessByMode.HIGH_FORWARD_NO_JUMP).not.toBeNull();
    expect(firstSuccessByMode.HIGH_REVERSE_JUMP).not.toBeNull();
    expect(firstSuccessByMode.HIGH_BOTH).not.toBeNull();
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
