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
const LOW_SLOPE_RADII_METERS=[0.30,0.50,0.60,0.70,0.80,1.00,1.20,1.50] as const;
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
    ]
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
  if(!best)throw new Error('Pass 18AX triangle pair missing');
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
  if(!best)throw new Error('Pass 18AX empty mesh pair');
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
  if(!found)throw new Error(`Pass 18AX missing component ${id}`);
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

describe('T21 Pass 18AX low-slope exact-raw minimality/radius diagnostic',()=>{
  it('compares candidate-1-only, candidate-2-only, and both exact bidirectional low-slope links while keeping the frozen upstream chain unchanged',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideComponents={} as Record<Side,ChainComponent[]>;
    const sideData={} as Record<Side,{
      bridgeFloor:Pair;
      floorSlope:Pair;
      slopeFloor00:Pair;
      floor00LowerFloor02:Pair;
      upstreamFixedEndpoint:StageVector3;
      lowerFloor02:ChainComponent;
      routeFloor02:ChainComponent;
      lowSlopes:readonly [ChainComponent,ChainComponent];
      lowPairs:readonly [Pair,Pair];
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      const components=route.relaxedReachableComponentIds.map(id=>{
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AX missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18ax-downstream:${side}:${id}`,component.mesh));
        return component;
      });
      sideComponents[side]=components;
      sourceSolids.push(navOnlySolid(`pass18ax-predecessor:${side}`,glass.bridgeMesh));

      const floor02=componentById(route.components,IDS[side].floor02);
      const slope=componentById(route.components,IDS[side].slope);
      const floor00=componentById(route.components,IDS[side].floor00);
      const lowerFloor02=componentById(route.components,IDS[side].lowerFloor02);
      const routeFloor02=componentById(route.components,IDS[side].routeFloor02);
      const lowSlopes=IDS[side].lowSlopes.map(id=>
        componentById(route.components,id)
      ) as unknown as readonly [ChainComponent,ChainComponent];

      const bridgeFloor=closestMeshPair(glass.bridgeMesh,floor02.mesh);
      const floorSlope=closestMeshPair(floor02.mesh,slope.mesh);
      const slopeFloor00=closestMeshPair(slope.mesh,floor00.mesh);
      const floor00LowerFloor02=closestMeshPair(floor00.mesh,lowerFloor02.mesh);
      const lowPairs=lowSlopes.map(lowSlope=>
        closestMeshPair(routeFloor02.mesh,lowSlope.mesh)
      ) as unknown as readonly [Pair,Pair];

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
        upstreamFixedEndpoint,lowerFloor02,routeFloor02,lowSlopes,lowPairs
      };
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    const anchors=undertowPass18bTraversableQaAnchors();
    let userId=21000;
    const frozenLinks:StageNavigationLinkDefinition[]=[];
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      frozenLinks.push({
        id:`pass18ax-upstream-${side.toLowerCase()}`,
        start:sideData[side].bridgeFloor.a,
        end:sideData[side].upstreamFixedEndpoint,
        radiusMeters:UPSTREAM_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18ax-floor-slope-${side.toLowerCase()}`,
        start:sideData[side].floorSlope.a,
        end:sideData[side].floorSlope.b,
        radiusMeters:FLOOR_SLOPE_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18ax-slope-floor00-${side.toLowerCase()}`,
        start:sideData[side].slopeFloor00.a,
        end:sideData[side].slopeFloor00.b,
        radiusMeters:SLOPE_FLOOR00_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18ax-drop-${side.toLowerCase()}`,
        start:sideData[side].floor00LowerFloor02.a,
        end:sideData[side].floor00LowerFloor02.b,
        radiusMeters:DIRECTIONAL_RADIUS_METERS,
        bidirectional:false,userId:userId++
      });
    }

    type Mode='CANDIDATE_1_ONLY'|'CANDIDATE_2_ONLY'|'BOTH';
    const evaluate=(radiusMeters:number,mode:Mode)=>{
      const links:StageNavigationLinkDefinition[]=[];
      for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
        const indices=mode==='CANDIDATE_1_ONLY'?[0]:mode==='CANDIDATE_2_ONLY'?[1]:[0,1];
        for(const index of indices){
          const pair=sideData[side].lowPairs[index]!;
          links.push({
            id:`pass18ax-low-${side.toLowerCase()}-${index+1}-${radiusMeters.toFixed(3)}`,
            start:pair.a,end:pair.b,radiusMeters,bidirectional:true,userId:userId++
          });
        }
      }
      const stage=qaStage(
        `pass18ax-${mode.toLowerCase()}-${radiusMeters.toFixed(3)}`,
        solids,[...inherited,...frozenLinks,...links]
      );
      const matrix=matrixSummary(stage);
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
        const ownGlassAnchors=anchors.filter(anchor=>anchor.id.startsWith(ownPrefix));
        const nonGlassAnchors=anchors.filter(anchor=>!anchor.id.startsWith('glass:'));
        const slopeRows=sideData[side].lowSlopes.map((component,index)=>{
          const representative=trustedRepresentative(nav,component.mesh);
          if(!representative)throw new Error(`Pass 18AX low slope representative missing ${side} ${index+1}`);
          const fromOwnGlass=ownGlassAnchors.some(anchor=>
            nav.auditPath(vec3(anchor.point),vec3(representative.point)).reachedTarget
          );
          const toOwnGlass=ownGlassAnchors.some(anchor=>
            nav.auditPath(vec3(representative.point),vec3(anchor.point)).reachedTarget
          );
          const outboundNonGlassIds=nonGlassAnchors.filter(anchor=>
            nav.auditPath(vec3(representative.point),vec3(anchor.point)).reachedTarget
          ).map(anchor=>anchor.id);
          return {
            id:component.id,index:index+1,fromOwnGlass,toOwnGlass,
            outboundNonGlassIds,representativeSnapMeters:representative.snapMeters
          };
        });
        return [side,{
          slopeRows,
          bothLowSlopesBidirectional:slopeRows.every(row=>row.fromOwnGlass&&row.toOwnGlass),
          anyNonGlassCollateral:slopeRows.some(row=>row.outboundNonGlassIds.length>0)
        }];
      }));
      return {
        radiusMeters,mode,
        matrix:{reached:matrix.reached,weak:matrix.weak,strong:matrix.strong,isolated:matrix.isolated},
        commonBothLowSlopesBidirectional:
          (sides.POSITIVE_Z as {bothLowSlopesBidirectional:boolean}).bothLowSlopesBidirectional &&
          (sides.NEGATIVE_Z as {bothLowSlopesBidirectional:boolean}).bothLowSlopesBidirectional,
        anyNonGlassCollateral:
          (sides.POSITIVE_Z as {anyNonGlassCollateral:boolean}).anyNonGlassCollateral ||
          (sides.NEGATIVE_Z as {anyNonGlassCollateral:boolean}).anyNonGlassCollateral,
        sides
      };
    };

    const modes:Mode[]=['CANDIDATE_1_ONLY','CANDIDATE_2_ONLY','BOTH'];
    const samples=LOW_SLOPE_RADII_METERS.map(radiusMeters=>
      Object.fromEntries(modes.map(mode=>[mode,evaluate(radiusMeters,mode)]))
    );
    const firstSuccessByMode=Object.fromEntries(modes.map(mode=>[
      mode,
      samples.map(row=>row[mode] as ReturnType<typeof evaluate>)
        .find(sample=>sample.commonBothLowSlopesBidirectional)??null
    ]));

    console.log('T21PASS18AX_LOW_SLOPE_MINIMALITY_RADIUS',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      sourcePass:'18AW',
      qaTraversalClass:'ORDINARY_WALK_BIDIRECTIONAL',
      upstreamDirectionalAssumption:'DROP_ONLY_QA_CONTINUATION',
      upstreamDirectionalRadiusMeters:DIRECTIONAL_RADIUS_METERS,
      trustedEndpointsUsedAsLinks:false,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      radiiMeters:LOW_SLOPE_RADII_METERS,
      physicalPairs:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,sideData[side].lowPairs.map((pair,index)=>({
          candidate:index+1,
          distanceMeters:pair.distanceMeters,
          from:pair.a,to:pair.b
        }))
      ])),
      firstSuccessByMode,
      samples
    }));

    expect(sideData.POSITIVE_Z.lowPairs[0].distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(sideData.POSITIVE_Z.lowPairs[1].distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(sideData.NEGATIVE_Z.lowPairs[0].distanceMeters).toBeCloseTo(0.5185586972146101,11);
    expect(sideData.NEGATIVE_Z.lowPairs[1].distanceMeters).toBeCloseTo(0.5185586972146133,11);
    const last=samples[samples.length-1]!;
    for(const mode of modes){
      const first=firstSuccessByMode[mode] as ReturnType<typeof evaluate>|null;
      expect(first).not.toBeNull();
      const terminal=last[mode] as ReturnType<typeof evaluate>;
      expect(terminal.commonBothLowSlopesBidirectional).toBe(true);
      expect(terminal.anyNonGlassCollateral).toBe(false);
      expect(terminal.matrix.reached).toBe(79);
      expect(terminal.matrix.weak).toBe(9);
      expect(terminal.matrix.strong).toBe(11);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
