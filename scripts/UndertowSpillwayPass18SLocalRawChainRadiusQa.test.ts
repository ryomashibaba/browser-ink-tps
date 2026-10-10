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

interface ChainComponent {
  id: string;
  mesh: StageTriangleMeshGeometry;
}
interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  grates: Record<'POSITIVE_Z' | 'NEGATIVE_Z', {
    anchor: StageVector3;
    mesh: StageTriangleMeshGeometry;
  }>;
  pass18g: {
    routes: {
      grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', {
        startComponentId: string;
        components: ChainComponent[];
        relaxedReachableComponentIds: string[];
      }>;
    };
  };
  pass18i: {
    grate: Record<'POSITIVE_Z' | 'NEGATIVE_Z', {
      aComponentId: string;
      bComponentId: string;
      aPointProject: StageVector3;
      bPointProject: StageVector3;
      modelDistanceMeters: number;
    }>;
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
  sampleCount: number;
  trustedSampleCount: number;
}
interface MatrixSummary {
  reached: number;
  weak: number;
  strong: number;
  isolated: string[];
  rows: Array<{ from: string; reached: string[] }>;
}

const fixturePath = process.env.T21_PASS18C_SOURCE_JSON ?? '';
const TRUSTED_SNAP_METERS = 0.30;
const LINK_RADIUS_METERS = 0.30;
const EPS = 1e-12;

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
    triangleMesh: mesh
  };
}
function add(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function sub(a: StageVector3, b: StageVector3): StageVector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function mul(a: StageVector3, s: number): StageVector3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}
function dot(a: StageVector3, b: StageVector3): number {
  return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}
function distance(a: StageVector3, b: StageVector3): number {
  return Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
}
function centroid(a: StageVector3,b: StageVector3,c: StageVector3): StageVector3 {
  return [(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
}
function closestPointOnTriangle(
  p: StageVector3,a: StageVector3,b: StageVector3,c: StageVector3
): StageVector3 {
  const ab=sub(b,a), ac=sub(c,a), ap=sub(p,a);
  const d1=dot(ab,ap), d2=dot(ac,ap);
  if(d1<=0&&d2<=0) return a;
  const bp=sub(p,b), d3=dot(ab,bp), d4=dot(ac,bp);
  if(d3>=0&&d4<=d3) return b;
  const vc=d1*d4-d3*d2;
  if(vc<=0&&d1>=0&&d3<=0) return add(a,mul(ab,d1/(d1-d3)));
  const cp=sub(p,c), d5=dot(ab,cp), d6=dot(ac,cp);
  if(d6>=0&&d5<=d6) return c;
  const vb=d5*d2-d1*d6;
  if(vb<=0&&d2>=0&&d6<=0) return add(a,mul(ac,d2/(d2-d6)));
  const va=d3*d6-d5*d4;
  if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0) {
    return add(b,mul(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
  }
  const denom=1/(va+vb+vc), v=vb*denom, w=vc*denom;
  return add(a,add(mul(ab,v),mul(ac,w)));
}
function closestPointsOnSegments(
  p1: StageVector3,q1: StageVector3,p2: StageVector3,q2: StageVector3
): Pair {
  const d1=sub(q1,p1), d2=sub(q2,p2), r=sub(p1,p2);
  const a=dot(d1,d1), e=dot(d2,d2), f=dot(d2,r);
  let s=0,t=0;
  if(a<=EPS&&e<=EPS) return {a:p1,b:p2,distanceMeters:distance(p1,p2)};
  if(a<=EPS) t=Math.max(0,Math.min(1,f/e));
  else {
    const c=dot(d1,r);
    if(e<=EPS) s=Math.max(0,Math.min(1,-c/a));
    else {
      const b=dot(d1,d2), denom=a*e-b*b;
      if(Math.abs(denom)>EPS) s=Math.max(0,Math.min(1,(b*f-c*e)/denom));
      const tn=b*s+f;
      if(tn<0){t=0;s=Math.max(0,Math.min(1,-c/a));}
      else if(tn>e){t=1;s=Math.max(0,Math.min(1,(b-c)/a));}
      else t=tn/e;
    }
  }
  const pa=add(p1,mul(d1,s)), pb=add(p2,mul(d2,t));
  return {a:pa,b:pb,distanceMeters:distance(pa,pb)};
}
function triangleClosestPair(
  a0: StageVector3,a1: StageVector3,a2: StageVector3,
  b0: StageVector3,b1: StageVector3,b2: StageVector3
): Pair {
  let best: Pair|null=null;
  const consider=(candidate: Pair)=>{if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;};
  for(const p of [a0,a1,a2]){
    const q=closestPointOnTriangle(p,b0,b1,b2);
    consider({a:p,b:q,distanceMeters:distance(p,q)});
  }
  for(const p of [b0,b1,b2]){
    const q=closestPointOnTriangle(p,a0,a1,a2);
    consider({a:q,b:p,distanceMeters:distance(q,p)});
  }
  for(const [ap,aq] of [[a0,a1],[a1,a2],[a2,a0]] as const)
    for(const [bp,bq] of [[b0,b1],[b1,b2],[b2,b0]] as const)
      consider(closestPointsOnSegments(ap,aq,bp,bq));
  if(!best) throw new Error('Pass18S triangle pair missing');
  return best;
}
function meshClosestPair(a: StageTriangleMeshGeometry,b: StageTriangleMeshGeometry): Pair {
  let best: Pair|null=null;
  for(let ai=0;ai<a.indices.length;ai+=3){
    const a0=a.vertices[a.indices[ai]!]!,a1=a.vertices[a.indices[ai+1]!]!,a2=a.vertices[a.indices[ai+2]!]!;
    for(let bi=0;bi<b.indices.length;bi+=3){
      const b0=b.vertices[b.indices[bi]!]!,b1=b.vertices[b.indices[bi+1]!]!,b2=b.vertices[b.indices[bi+2]!]!;
      const candidate=triangleClosestPair(a0,a1,a2,b0,b1,b2);
      if(!best||candidate.distanceMeters<best.distanceMeters) best=candidate;
    }
  }
  if(!best) throw new Error('Pass18S mesh pair missing');
  return best;
}
function meshSurfaceSamples(mesh: StageTriangleMeshGeometry): StageVector3[] {
  const samples=[...mesh.vertices];
  for(let i=0;i<mesh.indices.length;i+=3){
    samples.push(centroid(
      mesh.vertices[mesh.indices[i]!]!,
      mesh.vertices[mesh.indices[i+1]!]!,
      mesh.vertices[mesh.indices[i+2]!]!
    ));
  }
  return samples;
}
function trustedEndpoint(
  navigation: RecastStageNavigation,
  mesh: StageTriangleMeshGeometry,
  boundary: StageVector3
): TrustedEndpoint|null {
  const samples=meshSurfaceSamples(mesh);
  let trustedSampleCount=0;
  let best: Omit<TrustedEndpoint,'sampleCount'|'trustedSampleCount'>|null=null;
  for(const sample of samples){
    const raw=navigation.closestPoint(vec3(sample));
    const point=[raw.x,raw.y,raw.z] as StageVector3;
    const sampleSnapMeters=distance(sample,point);
    if(sampleSnapMeters>TRUSTED_SNAP_METERS+1e-9) continue;
    trustedSampleCount+=1;
    const boundaryOffsetMeters=distance(boundary,point);
    if(!best||
      boundaryOffsetMeters<best.boundaryOffsetMeters-1e-9||
      (Math.abs(boundaryOffsetMeters-best.boundaryOffsetMeters)<=1e-9 &&
       sampleSnapMeters<best.sampleSnapMeters)){
      best={point,sourceSample:sample,sampleSnapMeters,boundaryOffsetMeters};
    }
  }
  return best?{...best,sampleCount:samples.length,trustedSampleCount}:null;
}
function qaStage(
  id:string,
  solids:readonly StageSolidDefinition[],
  links:readonly StageNavigationLinkDefinition[]
): StageDefinition {
  const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {
    metadata:{
      id,displayName:id,worldBounds:base.worldBounds,
      teamASpawn:base.teamASpawnFloorPoint,teamBSpawn:base.teamBSpawnFloorPoint,
      teamASpawnSlots:[base.teamASpawnFloorPoint],teamBSpawnSlots:[base.teamBSpawnFloorPoint],
      tacticalNodes:[],splatZones:[]
    },
    solids,paintSurfaces:base.paintSurfaces,navigationLinks:links
  };
}
function matrixSummary(
  stage:StageDefinition,
  anchors:ReturnType<typeof sourceAnchors>
):MatrixSummary{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const rows=anchors.map(from=>({
    from:from.id,
    reached:anchors.filter(to=>nav.auditPath(vec3(from.point),vec3(to.point)).reachedTarget).map(to=>to.id)
  }));
  const ids=rows.map(r=>r.from), reach=new Map(rows.map(r=>[r.from,new Set(r.reached)] as const));
  const weakSeen=new Set<string>(); let weak=0;
  for(const seed of ids){
    if(weakSeen.has(seed)) continue;
    weak++; const stack=[seed]; weakSeen.add(seed);
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
  const remaining=new Set(ids); let strong=0;
  while(remaining.size){
    const seed=remaining.values().next().value as string; strong++;
    for(const candidate of [...remaining]){
      if(reach.get(seed)!.has(candidate)&&reach.get(candidate)!.has(seed)) remaining.delete(candidate);
    }
  }
  return {
    reached:rows.reduce((n,r)=>n+r.reached.length,0),
    weak,strong,
    isolated:rows.filter(r=>r.reached.length===1&&r.reached[0]===r.from).map(r=>r.from),
    rows
  };
}
function sourceAnchors(fixture:Fixture){
  const base=undertowPass18bTraversableQaAnchors().filter(a=>a.kind!=='GRATE');
  return [
    ...base,
    {id:'grate:UndertowT21D:negative-z-grate-mesh:0',kind:'GRATE' as const,point:fixture.grates.NEGATIVE_Z.anchor},
    {id:'grate:UndertowT21D:positive-z-grate-mesh:0',kind:'GRATE' as const,point:fixture.grates.POSITIVE_Z.anchor}
  ];
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(c=>c.id===id);
  if(!found) throw new Error(`Pass18S missing component ${id}`);
  return found;
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18S local raw-chain radius diagnostic',()=>{
  it('finds minimum local attachment radii for the 40mm positive ingress start and raw final gap before combining them',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath) return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const withoutVectorGrates=base.solids.filter(s=>!s.id.includes('grate-mesh:'));
    const sourceGrates:StageSolidDefinition[]=[];
    const chainSolids:StageSolidDefinition[]=[];
    const sideRecords:Record<string,unknown>={};

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      sourceGrates.push(navOnlySolid(`pass18s-source-grate:${side}`,fixture.grates[side].mesh));
      const route=fixture.pass18g.routes.grate[side];
      for(const id of route.relaxedReachableComponentIds){
        const comp=componentById(route.components,id);
        chainSolids.push(navOnlySolid(`pass18s-chain:${side}:${id}`,comp.mesh));
      }
    }

    const solids=[...withoutVectorGrates,...sourceGrates,...chainSolids];
    const inherited=[...base.navigationLinks];
    const stage0=qaStage('pass18s-source-chain-baseline',solids,inherited);
    const baselineNav=new RecastStageNavigation(stage0,new PerformanceStats());
    const linkRecords:Record<'POSITIVE_Z'|'NEGATIVE_Z',{
      rawIngressStart:StageVector3;rawIngressEnd:StageVector3;
      rawFinalStart:StageVector3;rawFinalEnd:StageVector3;
      trustedIngressStart:StageVector3;trustedIngressEnd:StageVector3;
      trustedFinalStart:StageVector3;trustedFinalEnd:StageVector3;
    }>={
      POSITIVE_Z:null as never,
      NEGATIVE_Z:null as never
    };
    let userId=18950;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const route=fixture.pass18g.routes.grate[side];
      const startComp=componentById(route.components,route.startComponentId);
      const ingressBoundary=meshClosestPair(fixture.grates[side].mesh,startComp.mesh);
      const ingressA=trustedEndpoint(baselineNav,fixture.grates[side].mesh,ingressBoundary.a);
      const ingressB=trustedEndpoint(baselineNav,startComp.mesh,ingressBoundary.b);

      const gap=fixture.pass18i.grate[side];
      const gapAComp=componentById(route.components,gap.aComponentId);
      const gapBComp=componentById(route.components,gap.bComponentId);
      const gapA=trustedEndpoint(baselineNav,gapAComp.mesh,gap.aPointProject);
      const gapB=trustedEndpoint(baselineNav,gapBComp.mesh,gap.bPointProject);

      if(!ingressA||!ingressB||!gapA||!gapB){
        throw new Error(`Pass18S trusted endpoint missing side=${side}`);
      }

      linkRecords[side]={
        rawIngressStart:ingressBoundary.a,
        rawIngressEnd:ingressBoundary.b,
        rawFinalStart:gap.aPointProject,
        rawFinalEnd:gap.bPointProject,
        trustedIngressStart:ingressA.point,
        trustedIngressEnd:ingressB.point,
        trustedFinalStart:gapA.point,
        trustedFinalEnd:gapB.point
      };
      sideRecords[side]={
        ingressBoundaryDistanceMeters:ingressBoundary.distanceMeters,
        ingressA,ingressB,
        finalBoundaryModelMeters:gap.modelDistanceMeters,
        finalA:gapA,finalB:gapB,
        ingressTrustedEndpointDistanceMeters:distance(ingressA.point,ingressB.point),
        finalTrustedEndpointDistanceMeters:distance(gapA.point,gapB.point)
      };
    }

    const anchors=sourceAnchors(fixture);
    const baseline=matrixSummary(stage0,anchors);
    const RADII=[0.30,0.36,0.45,0.60,0.75,0.90,1.00] as const;
    const POSITIVE_RETREAT_METERS=0.040;
    const sideIds={
      POSITIVE_Z:{
        grate:'grate:UndertowT21D:positive-z-grate-mesh:0',
        spawn:'paint:UndertowT21D:spawn-high-positive-z'
      },
      NEGATIVE_Z:{
        grate:'grate:UndertowT21D:negative-z-grate-mesh:0',
        spawn:'paint:UndertowT21D:spawn-high-negative-z'
      }
    } as const;
    const makeLink=(id:string,start:StageVector3,end:StageVector3,radiusMeters:number):StageNavigationLinkDefinition=>({
      id,start,end,radiusMeters,bidirectional:true,userId:userId++
    });
    const evaluate=(id:string,links:StageNavigationLinkDefinition[],side:'POSITIVE_Z'|'NEGATIVE_Z')=>{
      const nav=new RecastStageNavigation(
        qaStage(id,solids,[...inherited,...links]),
        new PerformanceStats()
      );
      const ids=sideIds[side];
      const grate=anchors.find((a)=>a.id===ids.grate)!;
      const spawn=anchors.find((a)=>a.id===ids.spawn)!;
      const forward=nav.auditPath(vec3(grate.point),vec3(spawn.point));
      const reverse=nav.auditPath(vec3(spawn.point),vec3(grate.point));
      return {bidirectionallyReached:forward.reachedTarget&&reverse.reachedTarget,forward,reverse};
    };
    const lerp=(a:StageVector3,b:StageVector3,t:number):StageVector3=>[
      a[0]+(b[0]-a[0])*t,
      a[1]+(b[1]-a[1])*t,
      a[2]+(b[2]-a[2])*t
    ];
    const snapInfo=(point:StageVector3)=>{
      const projectedRaw=baselineNav.closestPoint(vec3(point));
      const projected=[projectedRaw.x,projectedRaw.y,projectedRaw.z] as StageVector3;
      return {point,projected,snapMeters:distance(point,projected)};
    };

    const prepared=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map((side)=>{
      const r=linkRecords[side];
      const startTravel=distance(r.rawIngressStart,r.trustedIngressStart);
      const localIngressStart=side==='POSITIVE_Z'
        ? lerp(r.rawIngressStart,r.trustedIngressStart,POSITIVE_RETREAT_METERS/startTravel)
        : r.rawIngressStart;
      return [side,{
        localIngressStart,
        rawIngressEnd:r.rawIngressEnd,
        rawFinalStart:r.rawFinalStart,
        rawFinalEnd:r.rawFinalEnd,
        trustedIngressStart:r.trustedIngressStart,
        trustedIngressEnd:r.trustedIngressEnd,
        trustedFinalStart:r.trustedFinalStart,
        trustedFinalEnd:r.trustedFinalEnd,
        localIngressStartSnap:snapInfo(localIngressStart),
        rawIngressEndSnap:snapInfo(r.rawIngressEnd),
        rawFinalStartSnap:snapInfo(r.rawFinalStart),
        rawFinalEndSnap:snapInfo(r.rawFinalEnd)
      }];
    })) as Record<'POSITIVE_Z'|'NEGATIVE_Z',{
      localIngressStart:StageVector3;
      rawIngressEnd:StageVector3;
      rawFinalStart:StageVector3;
      rawFinalEnd:StageVector3;
      trustedIngressStart:StageVector3;
      trustedIngressEnd:StageVector3;
      trustedFinalStart:StageVector3;
      trustedFinalEnd:StageVector3;
      localIngressStartSnap:ReturnType<typeof snapInfo>;
      rawIngressEndSnap:ReturnType<typeof snapInfo>;
      rawFinalStartSnap:ReturnType<typeof snapInfo>;
      rawFinalEndSnap:ReturnType<typeof snapInfo>;
    }>;

    const sideSweeps=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map((side)=>{
      const p=prepared[side];
      const ingressSweep=RADII.map((radiusMeters)=>{
        const ingress=makeLink(
          `pass18s-ingress-${side.toLowerCase()}-${radiusMeters}`,
          p.localIngressStart,p.rawIngressEnd,radiusMeters
        );
        const trustedFinal=makeLink(
          `pass18s-trusted-final-control-${side.toLowerCase()}-${radiusMeters}`,
          p.trustedFinalStart,p.trustedFinalEnd,LINK_RADIUS_METERS
        );
        return {
          radiusMeters,
          result:evaluate(
            `pass18s-ingress-sweep-${side}-${radiusMeters}`,
            [ingress,trustedFinal],side
          )
        };
      });
      const finalSweep=RADII.map((radiusMeters)=>{
        const trustedIngress=makeLink(
          `pass18s-trusted-ingress-control-${side.toLowerCase()}-${radiusMeters}`,
          p.trustedIngressStart,p.trustedIngressEnd,LINK_RADIUS_METERS
        );
        const final=makeLink(
          `pass18s-final-${side.toLowerCase()}-${radiusMeters}`,
          p.rawFinalStart,p.rawFinalEnd,radiusMeters
        );
        return {
          radiusMeters,
          result:evaluate(
            `pass18s-final-sweep-${side}-${radiusMeters}`,
            [trustedIngress,final],side
          )
        };
      });
      const firstIngress=ingressSweep.find((row)=>row.result.bidirectionallyReached)??null;
      const firstFinal=finalSweep.find((row)=>row.result.bidirectionallyReached)??null;
      let combined:null|{
        ingressRadiusMeters:number;
        finalRadiusMeters:number;
        result:ReturnType<typeof evaluate>;
      }=null;
      if(firstIngress&&firstFinal){
        const ingress=makeLink(
          `pass18s-combined-ingress-${side.toLowerCase()}`,
          p.localIngressStart,p.rawIngressEnd,firstIngress.radiusMeters
        );
        const final=makeLink(
          `pass18s-combined-final-${side.toLowerCase()}`,
          p.rawFinalStart,p.rawFinalEnd,firstFinal.radiusMeters
        );
        combined={
          ingressRadiusMeters:firstIngress.radiusMeters,
          finalRadiusMeters:firstFinal.radiusMeters,
          result:evaluate(
            `pass18s-combined-${side}`,
            [ingress,final],side
          )
        };
      }
      return [side,{
        localIngressStart:p.localIngressStart,
        localIngressStartSnap:p.localIngressStartSnap,
        rawIngressEndSnap:p.rawIngressEndSnap,
        rawFinalStartSnap:p.rawFinalStartSnap,
        rawFinalEndSnap:p.rawFinalEndSnap,
        ingressSweep,
        finalSweep,
        firstIngress,
        firstFinal,
        combined
      }];
    }));

    console.log('T21PASS18S_LOCAL_RAW_CHAIN_RADIUS',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      positiveRetreatMeters:POSITIVE_RETREAT_METERS,
      trustedControlRadiusMeters:LINK_RADIUS_METERS,
      testedRadiiMeters:RADII,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong,isolated:baseline.isolated},
      sides:sideSweeps
    }));

    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(RADII).toHaveLength(7);
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const record=sideSweeps[side];
      expect(record.firstIngress).not.toBeNull();
      expect(record.firstFinal).not.toBeNull();
      expect(record.firstIngress!.radiusMeters).toBe(0.75);
      expect(record.firstIngress!.result.bidirectionallyReached).toBe(true);
      expect(record.firstFinal!.radiusMeters).toBe(0.90);
      expect(record.firstFinal!.result.bidirectionallyReached).toBe(true);
      expect(record.combined).not.toBeNull();
      expect(record.combined!.ingressRadiusMeters).toBe(0.75);
      expect(record.combined!.finalRadiusMeters).toBe(0.90);
      expect(record.combined!.result.bidirectionallyReached).toBe(true);
      expect(
        record.ingressSweep.map((row)=>row.result.bidirectionallyReached)
      ).toEqual([false,false,false,false,true,true,true]);
      expect(
        record.finalSweep.map((row)=>row.result.bidirectionallyReached)
      ).toEqual([false,false,false,false,false,true,true]);
    }
    expect(POSITIVE_RETREAT_METERS).toBe(0.040);
    expect(LINK_RADIUS_METERS).toBe(0.30);
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },60000);
});
