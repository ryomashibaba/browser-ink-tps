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
const ROUTE_RADII_METERS=[
  0.10,0.20,0.30,0.40,0.50,0.60,0.70,0.80,0.90,1.00,1.20
] as const;
const MAX_RETREAT_METERS=0.654737328492778;
const UPSTREAM_SUCCESS_POINTS:Record<Side,StageVector3>={
  POSITIVE_Z:[-10.67826430970341,6,12.118397071136153],
  NEGATIVE_Z:[10.907632598231574,6,-11.92383277567933]
};
const IDS:Record<Side,{floor02:string;slope:string;floor00:string}>={
  POSITIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c2'
  },
  NEGATIVE_Z:{
    floor02:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    floor00:'Fld_Temple01_pCube21525_1__FloorConcrete00|Fld_Temple01_FloorConcrete00|c9'
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
  if(!best)throw new Error('Pass 18AN triangle pair missing');
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
  if(!best)throw new Error('Pass 18AN empty mesh pair');
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
  if(!found)throw new Error(`Pass 18AN missing component ${id}`);
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

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18AN FloorSlope00 to FloorConcrete00 radius diagnostic',()=>{
  it('holds the frozen 18AK+18AF source chain fixed and varies only the first route-continuing post-slope connector radius',()=>{
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
      upstreamFixedEndpoint:StageVector3;
      floor00Probe:StageVector3;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AN missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18an-downstream:${side}:${id}`,component.mesh));
      }
      sourceSolids.push(navOnlySolid(`pass18an-predecessor:${side}`,glass.bridgeMesh));

      const floor02=componentById(route.components,IDS[side].floor02);
      const slope=componentById(route.components,IDS[side].slope);
      const floor00=componentById(route.components,IDS[side].floor00);
      const bridgeFloor=closestMeshPair(glass.bridgeMesh,floor02.mesh);
      const floorSlope=closestMeshPair(floor02.mesh,slope.mesh);
      const slopeFloor00=closestMeshPair(slope.mesh,floor00.mesh);
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
        bridgeFloor,floorSlope,slopeFloor00,upstreamFixedEndpoint,
        floor00Probe:slopeFloor00.b
      };
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    let userId=19900;
    const frozenLinks:StageNavigationLinkDefinition[]=[];
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      frozenLinks.push({
        id:`pass18an-upstream-${side.toLowerCase()}`,
        start:sideData[side].bridgeFloor.a,
        end:sideData[side].upstreamFixedEndpoint,
        radiusMeters:UPSTREAM_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
      frozenLinks.push({
        id:`pass18an-floor-slope-${side.toLowerCase()}`,
        start:sideData[side].floorSlope.a,
        end:sideData[side].floorSlope.b,
        radiusMeters:FLOOR_SLOPE_RADIUS_METERS,
        bidirectional:true,userId:userId++
      });
    }

    const baselineStage=qaStage(
      'pass18an-frozen-chain',
      solids,
      [...inherited,...frozenLinks]
    );
    const baseline=matrixSummary(baselineStage);

    const evaluateRadius=(radiusMeters:number)=>{
      const routeLinks=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
        id:`pass18an-slope-floor00-${side.toLowerCase()}-${radiusMeters.toFixed(6)}`,
        start:sideData[side].slopeFloor00.a,
        end:sideData[side].slopeFloor00.b,
        radiusMeters,
        bidirectional:true,
        userId:userId++
      } satisfies StageNavigationLinkDefinition));
      const stage=qaStage(
        `pass18an-radius-${radiusMeters.toFixed(6)}`,
        solids,
        [...inherited,...frozenLinks,...routeLinks]
      );
      const matrix=matrixSummary(stage);
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
        const ids=mutualAnchorIds(nav,sideData[side].floor00Probe);
        return [side,{
          ownGlassBidirectional:ids.some(id=>id.startsWith(ownPrefix)),
          nonGlassAnchorIds:ids.filter(id=>!id.startsWith('glass:')),
          mutualAnchorIds:ids
        }];
      }));
      const pos=sides.POSITIVE_Z as {ownGlassBidirectional:boolean;nonGlassAnchorIds:string[]};
      const neg=sides.NEGATIVE_Z as {ownGlassBidirectional:boolean;nonGlassAnchorIds:string[]};
      return {
        radiusMeters,
        commonFloor00Success:pos.ownGlassBidirectional&&neg.ownGlassBidirectional,
        reachesAnyNonGlassAnchor:
          pos.nonGlassAnchorIds.length>0||neg.nonGlassAnchorIds.length>0,
        matrix:{
          reached:matrix.reached,weak:matrix.weak,strong:matrix.strong,
          isolated:matrix.isolated
        },
        sides
      };
    };

    const coarse=ROUTE_RADII_METERS.map(radiusMeters=>evaluateRadius(radiusMeters));
    const firstCoarseSuccessIndex=coarse.findIndex(sample=>sample.commonFloor00Success);
    const firstCoarseSuccess=
      firstCoarseSuccessIndex>=0?coarse[firstCoarseSuccessIndex]!:null;
    const lastCoarseFailure=
      firstCoarseSuccessIndex>0?coarse[firstCoarseSuccessIndex-1]!:null;

    const fineRadii:number[]=[];
    if(firstCoarseSuccess&&lastCoarseFailure){
      const lo=lastCoarseFailure.radiusMeters;
      const hi=firstCoarseSuccess.radiusMeters;
      for(let i=0;i<=10;i++){
        fineRadii.push(Number((lo+(hi-lo)*(i/10)).toFixed(6)));
      }
    }
    const fine=fineRadii.map(radiusMeters=>evaluateRadius(radiusMeters));
    const firstFineSuccessIndex=fine.findIndex(sample=>sample.commonFloor00Success);
    const firstFineSuccess=
      firstFineSuccessIndex>=0?fine[firstFineSuccessIndex]!:null;
    const lastFineFailure=
      firstFineSuccessIndex>0?fine[firstFineSuccessIndex-1]!:null;

    const terminalRadii:number[]=[];
    if(firstFineSuccess&&lastFineFailure){
      const lo=lastFineFailure.radiusMeters;
      const hi=firstFineSuccess.radiusMeters;
      for(let i=0;i<=10;i++){
        terminalRadii.push(Number((lo+(hi-lo)*(i/10)).toFixed(6)));
      }
    }
    const terminal=terminalRadii.map(radiusMeters=>evaluateRadius(radiusMeters));
    const firstTerminalSuccessIndex=
      terminal.findIndex(sample=>sample.commonFloor00Success);
    const firstTerminalSuccess=
      firstTerminalSuccessIndex>=0?terminal[firstTerminalSuccessIndex]!:null;
    const lastTerminalFailure=
      firstTerminalSuccessIndex>0?terminal[firstTerminalSuccessIndex-1]!:null;
    const qaCandidate=firstTerminalSuccess??firstFineSuccess??firstCoarseSuccess;

    console.log('T21PASS18AN_SLOPE_FLOOR00_RADIUS',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      humanKccSourcePass:'18AM',
      humanKccBidirectionalSuccess:true,
      upstream:{
        sourcePass:'18AK',
        retreatMeters:UPSTREAM_FIXED_RETREAT_METERS,
        radiusMeters:UPSTREAM_RADIUS_METERS
      },
      floorSlope:{
        sourcePass:'18AF',
        radiusMeters:FLOOR_SLOPE_RADIUS_METERS
      },
      slopeFloor00:{
        endpointMode:'EXACT_RAW_PHYSICAL_PAIR',
        bidirectional:true,
        radiiMeters:ROUTE_RADII_METERS,
        physicalDistances:Object.fromEntries(
          (['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
            side,sideData[side].slopeFloor00.distanceMeters
          ])
        )
      },
      baseline:{
        reached:baseline.reached,weak:baseline.weak,strong:baseline.strong,
        isolated:baseline.isolated
      },
      firstCoarseSuccess,lastCoarseFailure,
      fineRadiiMeters:fineRadii,
      firstFineSuccess,lastFineFailure,
      terminalRadiiMeters:terminalRadii,
      firstTerminalSuccess,lastTerminalFailure,
      qaCandidate,
      coarse,fine,terminal
    }));

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(sideData.POSITIVE_Z.slopeFloor00.distanceMeters).toBeCloseTo(
      0.5185586972146173,11
    );
    expect(sideData.NEGATIVE_Z.slopeFloor00.distanceMeters).toBeCloseTo(
      0.5185586972146101,11
    );
    expect(firstCoarseSuccess).not.toBeNull();
    expect(firstFineSuccess).not.toBeNull();
    expect(firstTerminalSuccess).not.toBeNull();
    expect(qaCandidate).not.toBeNull();
    if(qaCandidate){
      expect(qaCandidate.matrix.reached).toBeGreaterThanOrEqual(79);
      expect(qaCandidate.matrix.weak).toBeLessThanOrEqual(9);
      expect(qaCandidate.matrix.strong).toBeLessThanOrEqual(11);
      expect(qaCandidate.reachesAnyNonGlassAnchor).toBe(false);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },120000);
});
