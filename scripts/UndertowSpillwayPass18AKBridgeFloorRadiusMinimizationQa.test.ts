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
const FIXED_RETREAT_METERS = 0.130;
const COARSE_RADII_METERS = [
  0.01, 0.025, 0.05, 0.10, 0.20, 0.30, 0.45, 0.60, 0.80, 1.00, 1.25, 1.50
] as const;

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
  if(!best) throw new Error('Pass 18AK triangle pair missing');
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
  if(!best) throw new Error('Pass 18AK empty mesh pair');
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

describe('T21 Pass 18AK BridgeMetal to FloorConcrete02 fixed-retreat radius minimization',()=>{
  it('holds the 0.130m floor retreat and raw BridgeMetal endpoint fixed while coarse-then-fine sweeping only link radius',()=>{
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
    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideData={} as Record<Side,{
      pair:Pair;
      floorTrusted:TrustedEndpoint|null;
      floorMesh:StageTriangleMeshGeometry;
      direction:StageVector3;
      successDistance:number;
      fixedEndpoint:StageVector3;
      fixedEndpointSurfaceDistanceMeters:number;
      fixedEndpointProjectedSnapMeters:number;
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const floor=glass.nearestNonBridgeMesh!;
      sourceSolids.push(navOnlySolid(`pass18ak-predecessor:${side}`,glass.bridgeMesh));
      const route=fixture.pass18g.routes.glass[side];
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      for(const id of route.relaxedReachableComponentIds){
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AK missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18ak-downstream:${side}:${id}`,component.mesh));
      }
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    const baselineStage=qaStage('pass18ak-baseline',solids,inherited);
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
      expect(length).toBeCloseTo(MAX_RETREAT,12);
      const direction=[delta[0]/length,delta[1]/length,delta[2]/length] as StageVector3;
      const fixedEndpoint=[
        pair.b[0]+direction[0]*FIXED_RETREAT_METERS,
        pair.b[1]+direction[1]*FIXED_RETREAT_METERS,
        pair.b[2]+direction[2]*FIXED_RETREAT_METERS
      ] as StageVector3;
      const projectedRaw=baselineNav.closestPoint(vec3(fixedEndpoint));
      const projected=[projectedRaw.x,projectedRaw.y,projectedRaw.z] as StageVector3;
      sideData[side]={
        pair,
        floorTrusted:trustedEndpoint(baselineNav,floor,pair.b),
        floorMesh:floor,
        direction,
        successDistance:length,
        fixedEndpoint,
        fixedEndpointSurfaceDistanceMeters:pointToMeshDistance(fixedEndpoint,floor),
        fixedEndpointProjectedSnapMeters:distance(fixedEndpoint,projected)
      };
    }

    let userId=19700;
    const evaluateRadius=(radiusMeters:number)=>{
      const links=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
        id:`pass18ak-fixed-retreat-${side.toLowerCase()}-${radiusMeters.toFixed(6)}`,
        start:sideData[side].pair.a,
        end:sideData[side].fixedEndpoint,
        radiusMeters,
        bidirectional:true,
        userId:userId++
      } satisfies StageNavigationLinkDefinition));
      const stage=qaStage(
        `pass18ak-radius-${radiusMeters.toFixed(6)}`,
        solids,
        [...inherited,...links]
      );
      const matrix=matrixSummary(stage);
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const floorPoint=sideData[side].floorTrusted!.point;
        const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
        const mutualIds=anchors.filter(anchor=>
          nav.auditPath(vec3(floorPoint),vec3(anchor.point)).reachedTarget &&
          nav.auditPath(vec3(anchor.point),vec3(floorPoint)).reachedTarget
        ).map(anchor=>anchor.id);
        return [side,{
          ownGlassBidirectional:mutualIds.some(id=>id.startsWith(ownPrefix)),
          nonGlassBidirectional:mutualIds.filter(id=>!id.startsWith('glass:')),
          mutualAnchorIds:mutualIds
        }];
      }));
      const positive=sides.POSITIVE_Z as {ownGlassBidirectional:boolean;nonGlassBidirectional:string[]};
      const negative=sides.NEGATIVE_Z as {ownGlassBidirectional:boolean;nonGlassBidirectional:string[]};
      return {
        radiusMeters,
        commonSuccess:positive.ownGlassBidirectional&&negative.ownGlassBidirectional,
        noNonGlassCollateral:
          positive.nonGlassBidirectional.length===0&&
          negative.nonGlassBidirectional.length===0,
        reached:matrix.reached,
        weak:matrix.weak,
        strong:matrix.strong,
        isolated:matrix.isolated,
        sides
      };
    };

    const coarse=COARSE_RADII_METERS.map(radius=>evaluateRadius(radius));
    const firstCoarseSuccessIndex=coarse.findIndex(sample=>sample.commonSuccess);
    const firstCoarseSuccess=firstCoarseSuccessIndex>=0?coarse[firstCoarseSuccessIndex]!:null;
    const lastCoarseFailure=
      firstCoarseSuccessIndex>0?coarse[firstCoarseSuccessIndex-1]!:null;

    const fineRadii:number[]=[];
    if(firstCoarseSuccess&&lastCoarseFailure){
      const lo=lastCoarseFailure.radiusMeters;
      const hi=firstCoarseSuccess.radiusMeters;
      for(let i=0;i<=10;i++){
        fineRadii.push(Number((lo+(hi-lo)*(i/10)).toFixed(6)));
      }
    }else if(firstCoarseSuccess){
      fineRadii.push(firstCoarseSuccess.radiusMeters);
    }
    const fine=fineRadii.map(radius=>evaluateRadius(radius));
    const firstFineSuccessIndex=fine.findIndex(sample=>sample.commonSuccess);
    const firstFineSuccess=firstFineSuccessIndex>=0?fine[firstFineSuccessIndex]!:null;
    const lastFineFailure=
      firstFineSuccessIndex>0?fine[firstFineSuccessIndex-1]!:null;

    const terminalFineRadii:number[]=[];
    if(firstFineSuccess&&lastFineFailure){
      const lo=lastFineFailure.radiusMeters;
      const hi=firstFineSuccess.radiusMeters;
      for(let i=0;i<=20;i++){
        terminalFineRadii.push(Number((lo+(hi-lo)*(i/20)).toFixed(6)));
      }
    }else if(firstFineSuccess){
      terminalFineRadii.push(firstFineSuccess.radiusMeters);
    }
    const terminalFine=terminalFineRadii.map(radius=>evaluateRadius(radius));
    const firstTerminalFineSuccessIndex=
      terminalFine.findIndex(sample=>sample.commonSuccess);
    const firstTerminalFineSuccess=
      firstTerminalFineSuccessIndex>=0
        ?terminalFine[firstTerminalFineSuccessIndex]!
        :null;
    const lastTerminalFineFailure=
      firstTerminalFineSuccessIndex>0
        ?terminalFine[firstTerminalFineSuccessIndex-1]!
        :null;
    const qaCandidate=firstTerminalFineSuccess??firstFineSuccess;

    console.log('T21PASS18AK_BRIDGE_FLOOR_RADIUS_MINIMIZATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      fixedRetreatMeters:FIXED_RETREAT_METERS,
      bridgeEndpointMode:'EXACT_RAW_PHYSICAL_ENDPOINT',
      floorEndpointMode:'PASS18AJ_SOURCE_SURFACE_RETREAT_FIXED',
      bidirectional:true,
      globalRecastSettingsChanged:false,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong},
      sideData:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,{
          rawBoundaryDistanceMeters:sideData[side].pair.distanceMeters,
          rawBridgeEndpoint:sideData[side].pair.a,
          rawFloorEndpoint:sideData[side].pair.b,
          fixedFloorEndpoint:sideData[side].fixedEndpoint,
          fixedEndpointSurfaceDistanceMeters:sideData[side].fixedEndpointSurfaceDistanceMeters,
          fixedEndpointProjectedSnapMeters:sideData[side].fixedEndpointProjectedSnapMeters
        }
      ])),
      coarseRadiiMeters:COARSE_RADII_METERS,
      firstCoarseSuccess,
      lastCoarseFailure,
      fineRadiiMeters:fineRadii,
      firstFineSuccess,
      lastFineFailure,
      terminalFineRadiiMeters:terminalFineRadii,
      firstTerminalFineSuccess,
      lastTerminalFineFailure,
      qaCandidate,
      coarse,
      fine,
      terminalFine
    }));

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(FIXED_RETREAT_METERS).toBe(0.130);
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      expect(sideData[side].fixedEndpointSurfaceDistanceMeters).toBeLessThanOrEqual(1e-5);
    }
    expect(coarse.at(-1)?.radiusMeters).toBe(1.50);
    expect(coarse.at(-1)?.commonSuccess).toBe(true);
    expect(firstCoarseSuccess).not.toBeNull();
    expect(firstFineSuccess).not.toBeNull();
    expect(qaCandidate).not.toBeNull();
    if(qaCandidate){
      expect(qaCandidate.reached).toBe(79);
      expect(qaCandidate.weak).toBe(9);
      expect(qaCandidate.strong).toBe(11);
      expect(qaCandidate.noNonGlassCollateral).toBe(true);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },120000);
});
