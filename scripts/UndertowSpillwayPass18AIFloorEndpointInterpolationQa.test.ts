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

type Side = 'POSITIVE_Z' | 'NEGATIVE_Z';

interface ChainComponent {
  id: string;
  mesh: StageTriangleMeshGeometry;
}
interface GlassFixture {
  bridgeMesh: StageTriangleMeshGeometry;
  nearestNonBridgeMesh: StageTriangleMeshGeometry | null;
}
interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  glass: Record<Side, GlassFixture>;
  pass18g: {
    routes: {
      glass: Record<Side, {
        relaxedReachableComponentIds: string[];
        components: ChainComponent[];
      }>;
    };
  };
}
interface Pair {
  a: StageVector3;
  b: StageVector3;
  distanceMeters: number;
}
interface TrustedEndpoint {
  point: StageVector3;
  sourceSample: StageVector3;
  sampleSnapMeters: number;
  boundaryOffsetMeters: number;
}
interface MatrixRow {
  from: string;
  reached: string[];
}
interface MatrixSummary {
  reached: number;
  weak: number;
  strong: number;
  isolated: string[];
  rows: MatrixRow[];
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const TRUSTED_SNAP_METERS = 0.30;
const RAW_RADIUS_METERS = 1.50;

function meshBounds(mesh: StageTriangleMeshGeometry): StageVector3 {
  const xs = mesh.vertices.map((v) => v[0]);
  const ys = mesh.vertices.map((v) => v[1]);
  const zs = mesh.vertices.map((v) => v[2]);
  return [
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs)
  ];
}
function navOnlySolid(id: string, mesh: StageTriangleMeshGeometry): StageSolidDefinition {
  return {
    id,
    center: [0, 0, 0],
    size: meshBounds(mesh),
    material: 'light',
    render: false,
    projectileBlocker: false,
    cameraBlocker: false,
    collisionEnabled: false,
    navigationEnabled: true,
    collisionBehavior: 'SOLID',
    triangleMesh: mesh
  };
}
function qaStage(
  id: string,
  solids: readonly StageSolidDefinition[],
  links: readonly StageNavigationLinkDefinition[]
): StageDefinition {
  const base = UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata: {
      id,
      displayName: id,
      worldBounds: base.worldBounds,
      teamASpawn: base.teamASpawnFloorPoint,
      teamBSpawn: base.teamBSpawnFloorPoint,
      teamASpawnSlots: [base.teamASpawnFloorPoint],
      teamBSpawnSlots: [base.teamBSpawnFloorPoint],
      tacticalNodes: [],
      splatZones: []
    },
    solids,
    paintSurfaces: base.paintSurfaces,
    navigationLinks: links
  };
}
function distance(a: StageVector3, b: StageVector3): number {
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
  if(d1<=0&&d2<=0) return a;
  const bp=sub(p,b),d3=dot(ab,bp),d4=dot(ac,bp);
  if(d3>=0&&d4<=d3) return b;
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0) return add(a,mul(ab,d1/(d1-d3)));
  const cp=sub(p,c),d5=dot(ab,cp),d6=dot(ac,cp);
  if(d6>=0&&d5<=d6) return c;
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0) return add(a,mul(ac,d2/(d2-d6)));
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
  const aa=dot(d1,d1),ee=dot(d2,d2),ff=dot(d2,r);
  let s=0,t=0;
  const eps=1e-15;
  if(aa<=eps&&ee<=eps) return {a:p1,b:p2,distanceMeters:distance(p1,p2)};
  if(aa<=eps){
    t=Math.max(0,Math.min(1,ff/ee));
  }else{
    const cc=dot(d1,r);
    if(ee<=eps){
      s=Math.max(0,Math.min(1,-cc/aa));
    }else{
      const bb=dot(d1,d2),den=aa*ee-bb*bb;
      if(Math.abs(den)>eps) s=Math.max(0,Math.min(1,(bb*ff-cc*ee)/den));
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
    if(!best||candidate.distanceMeters<best.distanceMeters) best=candidate;
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
  if(!best) throw new Error('Pass 18AI triangle pair missing');
  return best;
}
function closestMeshPair(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry):Pair{
  let best:Pair|null=null;
  for(let ai=0;ai<a.indices.length;ai+=3){
    const a0=a.vertices[a.indices[ai]!]!,a1=a.vertices[a.indices[ai+1]!]!,a2=a.vertices[a.indices[ai+2]!]!;
    for(let bi=0;bi<b.indices.length;bi+=3){
      const b0=b.vertices[b.indices[bi]!]!,b1=b.vertices[b.indices[bi+1]!]!,b2=b.vertices[b.indices[bi+2]!]!;
      const candidate=trianglePair(a0,a1,a2,b0,b1,b2);
      if(!best||candidate.distanceMeters<best.distanceMeters) best=candidate;
    }
  }
  if(!best) throw new Error('Pass 18AI empty mesh pair');
  return best;
}
function triangleCentroid(a:StageVector3,b:StageVector3,c:StageVector3):StageVector3{
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
function trustedEndpoint(
  navigation:RecastStageNavigation,
  mesh:StageTriangleMeshGeometry,
  boundary:StageVector3
):TrustedEndpoint|null{
  let best:TrustedEndpoint|null=null;
  for(const sample of meshSamples(mesh)){
    const p=navigation.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snap=distance(sample,point);
    if(snap>TRUSTED_SNAP_METERS+1e-9) continue;
    const boundaryOffset=distance(boundary,point);
    if(!best||
      boundaryOffset<best.boundaryOffsetMeters-1e-9||
      (Math.abs(boundaryOffset-best.boundaryOffsetMeters)<=1e-9&&snap<best.sampleSnapMeters)){
      best={point,sourceSample:sample,sampleSnapMeters:snap,boundaryOffsetMeters:boundaryOffset};
    }
  }
  return best;
}
function matrixSummary(stage:StageDefinition):MatrixSummary{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const anchors=undertowPass18bTraversableQaAnchors();
  const rows=anchors.map(from=>({
    from:from.id,
    reached:anchors.filter(to=>nav.auditPath(vec3(from.point),vec3(to.point)).reachedTarget).map(to=>to.id)
  }));
  const ids=rows.map(r=>r.from);
  const reach=new Map(rows.map(r=>[r.from,new Set(r.reached)] as const));
  const weakSeen=new Set<string>(); let weak=0;
  for(const seed of ids){
    if(weakSeen.has(seed)) continue;
    weak++; weakSeen.add(seed); const stack=[seed];
    while(stack.length){
      const cur=stack.pop()!;
      for(const candidate of ids){
        if(weakSeen.has(candidate)) continue;
        if(reach.get(cur)!.has(candidate)||reach.get(candidate)!.has(cur)){
          weakSeen.add(candidate); stack.push(candidate);
        }
      }
    }
  }
  const strongSeen=new Set<string>(); let strong=0;
  for(const seed of ids){
    if(strongSeen.has(seed)) continue;
    strong++;
    for(const candidate of ids){
      if(reach.get(seed)!.has(candidate)&&reach.get(candidate)!.has(seed)){
        strongSeen.add(candidate);
      }
    }
  }
  return {
    reached:rows.reduce((n,r)=>n+r.reached.length,0),
    weak,strong,
    isolated:rows.filter(r=>r.reached.length===1&&r.reached[0]===r.from).map(r=>r.from),
    rows
  };
}
function pairSet(rows:readonly MatrixRow[]):Set<string>{
  return new Set(rows.flatMap(r=>r.reached.map(to=>`${r.from}->${to}`)));
}
function glassAnchors(side:Side){
  const prefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
  return undertowPass18bTraversableQaAnchors().filter(a=>a.id.startsWith(prefix));
}
function probeTrustedPair(
  stage:StageDefinition,
  side:Side,
  endpoint:TrustedEndpoint|null
){
  if(!endpoint) return {trusted:false,ownGlassBidirectional:false,nonGlassBidirectional:[] as string[]};
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const own=glassAnchors(side);
  const all=undertowPass18bTraversableQaAnchors();
  const mutual=(point:StageVector3,id:string)=>{
    const anchor=all.find(a=>a.id===id)!;
    return nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
      nav.auditPath(vec3(anchor.point),vec3(point)).reachedTarget;
  };
  return {
    trusted:true,
    ownGlassBidirectional:own.some(a=>mutual(endpoint.point,a.id)),
    nonGlassBidirectional:all.filter(a=>!a.id.startsWith('glass:')&&mutual(endpoint.point,a.id)).map(a=>a.id)
  };
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18AI FloorConcrete02 surface-validated interpolation sweep',()=>{
  it('fine-sweeps the boundary-to-first-success source segment and validates the first common local retreat without tracked-anchor collateral',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');

    const successPoints:Record<Side,StageVector3>={
      POSITIVE_Z:[-10.67826430970341,6,12.118397071136153],
      NEGATIVE_Z:[10.907632598231574,6,-11.92383277567933]
    };
    const MAX_RETREAT=0.654737328492778;
    const coarseRetreats=[
      0,0.05,0.10,0.15,0.20,0.25,0.30,0.35,0.40,0.45,0.50,0.55,0.60,0.65,
      MAX_RETREAT
    ] as const;

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideData={} as Record<Side,{
      pair:Pair;
      bridgeTrusted:TrustedEndpoint|null;
      floorTrusted:TrustedEndpoint|null;
      floorMesh:StageTriangleMeshGeometry;
      direction:StageVector3;
      successDistance:number;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const floor=glass.nearestNonBridgeMesh!;
      sourceSolids.push(navOnlySolid(`pass18ai-predecessor:${side}`,glass.bridgeMesh));
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AI missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18ai-downstream:${side}:${id}`,component.mesh));
      }
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    const baselineStage=qaStage('pass18ai-baseline',solids,inherited);
    const baselineNav=new RecastStageNavigation(baselineStage,new PerformanceStats());
    const baseline=matrixSummary(baselineStage);
    const anchors=undertowPass18bTraversableQaAnchors();

    const pointToMeshDistance=(point:StageVector3,mesh:StageTriangleMeshGeometry)=>{
      let best=Number.POSITIVE_INFINITY;
      for(let i=0;i<mesh.indices.length;i+=3){
        const closest=closestPointOnTriangle(
          point,
          mesh.vertices[mesh.indices[i]!]!,
          mesh.vertices[mesh.indices[i+1]!]!,
          mesh.vertices[mesh.indices[i+2]!]!
        );
        best=Math.min(best,distance(point,closest));
      }
      return best;
    };

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const floor=glass.nearestNonBridgeMesh!;
      const pair=closestMeshPair(glass.bridgeMesh,floor);
      const target=successPoints[side];
      const delta=sub(target,pair.b);
      const length=Math.hypot(delta[0],delta[1],delta[2]);
      sideData[side]={
        pair,
        bridgeTrusted:trustedEndpoint(baselineNav,glass.bridgeMesh,pair.a),
        floorTrusted:trustedEndpoint(baselineNav,floor,pair.b),
        floorMesh:floor,
        direction:[delta[0]/length,delta[1]/length,delta[2]/length],
        successDistance:length
      };
      expect(length).toBeCloseTo(MAX_RETREAT,12);
    }

    let userId=19600;
    const evaluate=(side:Side,retreatMeters:number)=>{
      const data=sideData[side];
      const retreat=Math.min(retreatMeters,data.successDistance);
      const endpoint:addReturn=undefined;
      const point:StageVector3=[
        data.pair.b[0]+data.direction[0]*retreat,
        data.pair.b[1]+data.direction[1]*retreat,
        data.pair.b[2]+data.direction[2]*retreat
      ];
      const surfaceDistanceMeters=pointToMeshDistance(point,data.floorMesh);
      const projectedRaw=baselineNav.closestPoint(vec3(point));
      const projected=[projectedRaw.x,projectedRaw.y,projectedRaw.z] as StageVector3;
      const projectedSnapMeters=distance(point,projected);
      if(surfaceDistanceMeters>1e-5){
        return {
          retreatMeters:retreat,
          point,
          surfaceDistanceMeters,
          projectedSnapMeters,
          surfaceValid:false,
          connected:false,
          floorNonGlass:[] as string[]
        };
      }

      const link:StageNavigationLinkDefinition={
        id:`pass18ai-${side.toLowerCase()}-${retreat.toFixed(6)}`,
        start:data.pair.a,
        end:point,
        radiusMeters:RAW_RADIUS_METERS,
        bidirectional:true,
        userId:userId++
      };
      const stage=qaStage(
        `pass18ai-stage-${side.toLowerCase()}-${retreat.toFixed(6)}`,
        solids,[...inherited,link]
      );
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const floorPoint=data.floorTrusted!.point;
      const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
      const mutualIds=anchors.filter(anchor=>
        nav.auditPath(vec3(floorPoint),vec3(anchor.point)).reachedTarget &&
        nav.auditPath(vec3(anchor.point),vec3(floorPoint)).reachedTarget
      ).map(anchor=>anchor.id);
      return {
        retreatMeters:retreat,
        point,
        surfaceDistanceMeters,
        projectedSnapMeters,
        surfaceValid:true,
        connected:mutualIds.some(id=>id.startsWith(ownPrefix)),
        floorNonGlass:mutualIds.filter(id=>!id.startsWith('glass:'))
      };
    };

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const rows=coarseRetreats.map(retreat=>evaluate(side,retreat));
      const valid=rows.filter(row=>row.surfaceValid);
      const firstSuccess=valid.find(row=>row.connected)??null;
      const lastFailureBeforeSuccess=firstSuccess
        ?valid.filter(row=>!row.connected&&row.retreatMeters<firstSuccess.retreatMeters).at(-1)??null
        :valid.filter(row=>!row.connected).at(-1)??null;
      return [side,{
        successDistanceMeters:sideData[side].successDistance,
        firstSuccess,
        lastFailureBeforeSuccess,
        rows
      }];
    }));

    const positive=sides.POSITIVE_Z as {
      firstSuccess:{retreatMeters:number;point:StageVector3}|null
    };
    const negative=sides.NEGATIVE_Z as {
      firstSuccess:{retreatMeters:number;point:StageVector3}|null
    };
    const commonFirstSuccessMeters=
      positive.firstSuccess&&negative.firstSuccess
        ?Math.max(positive.firstSuccess.retreatMeters,negative.firstSuccess.retreatMeters)
        :null;

    let commonCandidate=null;
    if(commonFirstSuccessMeters!==null){
      const links=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const data=sideData[side];
        const point:StageVector3=[
          data.pair.b[0]+data.direction[0]*commonFirstSuccessMeters,
          data.pair.b[1]+data.direction[1]*commonFirstSuccessMeters,
          data.pair.b[2]+data.direction[2]*commonFirstSuccessMeters
        ];
        return {
          id:`pass18ai-common-${side.toLowerCase()}`,
          start:data.pair.a,
          end:point,
          radiusMeters:RAW_RADIUS_METERS,
          bidirectional:true,
          userId:userId++
        } satisfies StageNavigationLinkDefinition;
      });
      const stage=qaStage('pass18ai-common-candidate',solids,[...inherited,...links]);
      const matrix=matrixSummary(stage);
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const nonGlassBySide=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const floorPoint=sideData[side].floorTrusted!.point;
        const mutual=anchors.filter(anchor=>
          nav.auditPath(vec3(floorPoint),vec3(anchor.point)).reachedTarget &&
          nav.auditPath(vec3(anchor.point),vec3(floorPoint)).reachedTarget
        ).map(anchor=>anchor.id);
        return [side,mutual.filter(id=>!id.startsWith('glass:'))];
      }));
      commonCandidate={
        retreatMeters:commonFirstSuccessMeters,
        reached:matrix.reached,
        weak:matrix.weak,
        strong:matrix.strong,
        isolated:matrix.isolated,
        nonGlassBySide
      };
    }

    console.log('T21PASS18AI_FLOOR_ENDPOINT_INTERPOLATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      rawRadiusMeters:RAW_RADIUS_METERS,
      interpolationRetreatsMeters:coarseRetreats,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong},
      commonFirstSuccessMeters,
      commonCandidate,
      sides
    }));

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        rows:Array<{surfaceDistanceMeters:number}>
      };
      expect(result.rows.every(row=>row.surfaceDistanceMeters<=1e-5)).toBe(true);
    }
    if(commonCandidate){
      expect(commonCandidate.reached).toBe(79);
      expect(commonCandidate.weak).toBe(9);
      expect(commonCandidate.strong).toBe(11);
      expect(
        Object.values(commonCandidate.nonGlassBySide).every(ids=>ids.length===0)
      ).toBe(true);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },60000);
});
