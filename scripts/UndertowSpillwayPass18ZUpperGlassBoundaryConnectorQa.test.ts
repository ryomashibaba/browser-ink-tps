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
const RAW_RADII = [0.30, 0.45, 0.60, 0.85, 1.00, 1.50] as const;

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
function closestVertexPair(a: StageTriangleMeshGeometry,b: StageTriangleMeshGeometry): Pair {
  let best: Pair|null=null;
  for(const av of a.vertices){
    for(const bv of b.vertices){
      const d=distance(av,bv);
      if(!best||d<best.distanceMeters) best={a:av,b:bv,distanceMeters:d};
    }
  }
  if(!best) throw new Error('Pass 18Z empty mesh pair');
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

describe('T21 Pass 18Z upper-glass localized predecessor/downstream connector diagnostic',()=>{
  it('sweeps only the exact KCC-feasible BridgeMetal -> nearest FloorConcrete02 boundary on the full source chain',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath) return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideData={} as Record<Side,{
      pair:Pair;
      bridgeTrusted:TrustedEndpoint|null;
      floorTrusted:TrustedEndpoint|null;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      expect(glass.nearestNonBridgeMesh).not.toBeNull();
      sourceSolids.push(navOnlySolid(`pass18z-predecessor:${side}`,glass.bridgeMesh));
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(c=>[c.id,c] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component) throw new Error(`Pass 18Z missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18z-downstream:${side}:${id}`,component.mesh));
      }
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    const baselineStage=qaStage('pass18z-baseline',solids,inherited);
    const baselineNav=new RecastStageNavigation(baselineStage,new PerformanceStats());
    const baseline=matrixSummary(baselineStage);

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const floor=glass.nearestNonBridgeMesh!;
      const pair=closestVertexPair(glass.bridgeMesh,floor);
      sideData[side]={
        pair,
        bridgeTrusted:trustedEndpoint(baselineNav,glass.bridgeMesh,pair.a),
        floorTrusted:trustedEndpoint(baselineNav,floor,pair.b)
      };
    }

    const variants:Record<string,{
      matrix:MatrixSummary;
      added:string[];
      removed:string[];
      sideProbes:Record<string,unknown>;
    }>={};
    const baselinePairs=pairSet(baseline.rows);
    let userId=19000;
    const runVariant=(id:string,links:StageNavigationLinkDefinition[])=>{
      const stage=qaStage(id,solids,[...inherited,...links]);
      const matrix=matrixSummary(stage);
      const pairs=pairSet(matrix.rows);
      variants[id]={
        matrix,
        added:[...pairs].filter(p=>!baselinePairs.has(p)).sort(),
        removed:[...baselinePairs].filter(p=>!pairs.has(p)).sort(),
        sideProbes:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
          side,{
            bridge:probeTrustedPair(stage,side,sideData[side].bridgeTrusted),
            floor:probeTrustedPair(stage,side,sideData[side].floorTrusted)
          }
        ]))
      };
    };

    for(const radius of RAW_RADII){
      const rawLinks=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
        id:`pass18z-raw-${side.toLowerCase()}-${radius}`,
        start:sideData[side].pair.a,
        end:sideData[side].pair.b,
        radiusMeters:radius,
        bidirectional:true,
        userId:userId++
      }));
      runVariant(`raw-both-${radius.toFixed(2)}`,rawLinks);
      for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
        runVariant(
          `raw-${side.toLowerCase()}-${radius.toFixed(2)}`,
          [rawLinks[side==='POSITIVE_Z'?0:1]!]
        );
      }
    }

    const trustedLinks=(['POSITIVE_Z','NEGATIVE_Z'] as const)
      .map(side=>{
        const a=sideData[side].bridgeTrusted?.point;
        const b=sideData[side].floorTrusted?.point;
        return a&&b?{
          id:`pass18z-trusted-${side.toLowerCase()}`,
          start:a,end:b,radiusMeters:0.30,bidirectional:true,userId:userId++
        }:null;
      })
      .filter((x):x is StageNavigationLinkDefinition=>x!==null);
    runVariant('trusted-both-0.30',trustedLinks);

    console.log('T21PASS18Z_UPPER_GLASS_LOCAL_CONNECTOR',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      trustedSnapMeters:TRUSTED_SNAP_METERS,
      rawRadiiMeters:RAW_RADII,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong,isolated:baseline.isolated},
      sideData:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,{
          sourceBoundaryDistanceMeters:sideData[side].pair.distanceMeters,
          rawStart:sideData[side].pair.a,
          rawEnd:sideData[side].pair.b,
          bridgeTrusted:sideData[side].bridgeTrusted,
          floorTrusted:sideData[side].floorTrusted,
          trustedEndpointDistanceMeters:
            sideData[side].bridgeTrusted&&sideData[side].floorTrusted
              ? distance(sideData[side].bridgeTrusted!.point,sideData[side].floorTrusted!.point)
              : null
        }
      ])),
      variants:Object.fromEntries(Object.entries(variants).map(([id,v])=>[
        id,{
          reached:v.matrix.reached,
          weak:v.matrix.weak,
          strong:v.matrix.strong,
          isolated:v.matrix.isolated,
          addedDirectedPairCount:v.added.length,
          removedDirectedPairCount:v.removed.length,
          added:v.added,
          removed:v.removed,
          sideProbes:v.sideProbes
        }
      ]))
    }));

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(sideData.POSITIVE_Z.pair.distanceMeters).toBeCloseTo(0.5185586972146101,12);
    expect(sideData.NEGATIVE_Z.pair.distanceMeters).toBeCloseTo(0.5185586972146126,12);
    expect(RAW_RADII).toEqual([0.30,0.45,0.60,0.85,1.00,1.50]);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },60000);
});
