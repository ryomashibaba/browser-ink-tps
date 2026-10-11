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
  sourceObject: string;
  sourceMaterial: string;
  yRange: [number, number];
  mesh: StageTriangleMeshGeometry;
}
interface Fixture {
  version: 'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly: true;
  runtimePromotionAuthorized: false;
  glass: Record<Side, {
    bridgeMesh: StageTriangleMeshGeometry;
    nearestNonBridgeMesh: StageTriangleMeshGeometry | null;
  }>;
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
const LINK_RADIUS_METERS = 0.30;

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
  const eps=1e-15;
  let s=0,t=0;
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
  if(!best) throw new Error('Pass 18AA triangle pair missing');
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
  if(!best) throw new Error('Pass 18AA empty mesh pair');
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
  boundary?:StageVector3
):TrustedEndpoint|null{
  let best:TrustedEndpoint|null=null;
  for(const sample of meshSamples(mesh)){
    const p=navigation.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snap=distance(sample,point);
    if(snap>TRUSTED_SNAP_METERS+1e-9) continue;
    const boundaryOffset=boundary?distance(boundary,point):0;
    if(!best||
      (boundary
        ? boundaryOffset<best.boundaryOffsetMeters-1e-9 ||
          (Math.abs(boundaryOffset-best.boundaryOffsetMeters)<=1e-9&&snap<best.sampleSnapMeters)
        : snap<best.sampleSnapMeters)){
      best={point,sourceSample:sample,sampleSnapMeters:snap,boundaryOffsetMeters:boundaryOffset};
    }
  }
  return best;
}
function meshBounds(mesh:StageTriangleMeshGeometry):StageVector3{
  const xs=mesh.vertices.map(v=>v[0]),ys=mesh.vertices.map(v=>v[1]),zs=mesh.vertices.map(v=>v[2]);
  return [Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys),Math.max(...zs)-Math.min(...zs)];
}
function navOnlySolid(id:string,mesh:StageTriangleMeshGeometry):StageSolidDefinition{
  return {
    id,center:[0,0,0],size:meshBounds(mesh),material:'light',render:false,
    projectileBlocker:false,cameraBlocker:false,collisionEnabled:false,
    navigationEnabled:true,collisionBehavior:'SOLID',triangleMesh:mesh
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
      teamASpawn:base.teamASpawnFloorPoint,teamBSpawn:base.teamBSpawnFloorPoint,
      teamASpawnSlots:[base.teamASpawnFloorPoint],teamBSpawnSlots:[base.teamBSpawnFloorPoint],
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
    reached:rows.reduce((sum,row)=>sum+row.reached.length,0),
    weak,strong,
    isolated:rows.filter(r=>r.reached.length===1&&r.reached[0]===r.from).map(r=>r.from),
    rows
  };
}
function mutualAnchorIds(
  navigation:RecastStageNavigation,
  point:StageVector3
):string[]{
  const anchors=undertowPass18bTraversableQaAnchors();
  return anchors.filter(anchor=>
    navigation.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
    navigation.auditPath(vec3(anchor.point),vec3(point)).reachedTarget
  ).map(anchor=>anchor.id);
}
function materialLeaf(material:string):string{
  return material.replace(/^Fld_Temple01_/,'').replace(/^FldObj_Temple01_PntSet_/,'');
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18AA downstream SCC classification under trusted upper-glass control',()=>{
  it('classifies every trusted downstream source component after attaching the KCC-feasible predecessor boundary with the diagnostic trusted control',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath) return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sourceSolids:StageSolidDefinition[]=[];
    const sideComponents={} as Record<Side,ChainComponent[]>;
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      expect(glass.nearestNonBridgeMesh).not.toBeNull();
      sourceSolids.push(navOnlySolid(`pass18aa-predecessor:${side}`,glass.bridgeMesh));
      const route=fixture.pass18g.routes.glass[side];
      expect(route.relaxedReachableComponentIds).toHaveLength(58);
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      const components=route.relaxedReachableComponentIds.map(id=>{
        const component=byId.get(id);
        if(!component) throw new Error(`Pass 18AA missing component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18aa-downstream:${side}:${id}`,component.mesh));
        return component;
      });
      sideComponents[side]=components;
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    const baselineStage=qaStage('pass18aa-baseline',solids,inherited);
    const baselineNav=new RecastStageNavigation(baselineStage,new PerformanceStats());
    const baseline=matrixSummary(baselineStage);

    const links:StageNavigationLinkDefinition[]=[];
    const controlEndpoints={} as Record<Side,{
      boundary:Pair;
      bridge:TrustedEndpoint;
      floor:TrustedEndpoint;
    }>;
    let userId=19100;
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const floor=glass.nearestNonBridgeMesh!;
      const boundary=closestMeshPair(glass.bridgeMesh,floor);
      const bridge=trustedEndpoint(baselineNav,glass.bridgeMesh,boundary.a);
      const floorEndpoint=trustedEndpoint(baselineNav,floor,boundary.b);
      if(!bridge||!floorEndpoint){
        throw new Error(`Pass 18AA trusted control endpoint missing ${side}`);
      }
      controlEndpoints[side]={boundary,bridge,floor:floorEndpoint};
      links.push({
        id:`pass18aa-trusted-control-${side.toLowerCase()}`,
        start:bridge.point,end:floorEndpoint.point,
        radiusMeters:LINK_RADIUS_METERS,bidirectional:true,userId:userId++
      });
    }

    const candidateStage=qaStage(
      'pass18aa-trusted-control',
      solids,
      [...inherited,...links]
    );
    const candidate=matrixSummary(candidateStage);
    const candidateNav=new RecastStageNavigation(candidateStage,new PerformanceStats());

    const classifications=Object.fromEntries(
      (['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
        const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
        const oppositePrefix=side==='POSITIVE_Z'?'glass:negative-z:':'glass:positive-z:';
        const rows:Array<{
          id:string;
          sourceMaterial:string;
          yRange:[number,number];
          snapMeters:number;
          mutualAnchorIds:string[];
          ownGlass:boolean;
          oppositeGlass:boolean;
          nonGlass:string[];
        }>=[];
        for(const component of sideComponents[side]){
          const representative=trustedEndpoint(candidateNav,component.mesh);
          if(!representative) continue;
          const mutual=mutualAnchorIds(candidateNav,representative.point);
          rows.push({
            id:component.id,
            sourceMaterial:materialLeaf(component.sourceMaterial),
            yRange:component.yRange,
            snapMeters:representative.sampleSnapMeters,
            mutualAnchorIds:mutual,
            ownGlass:mutual.some(id=>id.startsWith(ownPrefix)),
            oppositeGlass:mutual.some(id=>id.startsWith(oppositePrefix)),
            nonGlass:mutual.filter(id=>!id.startsWith('glass:'))
          });
        }
        const ownGlassRows=rows.filter(row=>row.ownGlass);
        const oppositeGlassRows=rows.filter(row=>row.oppositeGlass);
        const nonGlassRows=rows.filter(row=>row.nonGlass.length>0);
        const ownGlassByMaterial=Object.fromEntries(
          [...new Set(ownGlassRows.map(row=>row.sourceMaterial))].sort().map(material=>[
            material,
            ownGlassRows.filter(row=>row.sourceMaterial===material).length
          ])
        );
        return [side,{
          downstreamComponentCount:sideComponents[side].length,
          trustedRepresentativeCount:rows.length,
          ownGlassConnectedCount:ownGlassRows.length,
          ownGlassConnectedIds:ownGlassRows.map(row=>row.id),
          ownGlassByMaterial,
          oppositeGlassConnectedCount:oppositeGlassRows.length,
          oppositeGlassConnectedIds:oppositeGlassRows.map(row=>row.id),
          nonGlassConnectedCount:nonGlassRows.length,
          nonGlassConnections:nonGlassRows.map(row=>({
            id:row.id,
            anchorIds:row.nonGlass
          })),
          rows
        }];
      })
    );

    console.log('T21PASS18AA_DOWNSTREAM_SCC_CLASSIFICATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      trustedSnapMeters:TRUSTED_SNAP_METERS,
      linkRadiusMeters:LINK_RADIUS_METERS,
      baseline:{reached:baseline.reached,weak:baseline.weak,strong:baseline.strong,isolated:baseline.isolated},
      candidate:{reached:candidate.reached,weak:candidate.weak,strong:candidate.strong,isolated:candidate.isolated},
      controlEndpoints:Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
        side,{
          sourceBoundaryDistanceMeters:controlEndpoints[side].boundary.distanceMeters,
          bridgeBoundaryOffsetMeters:controlEndpoints[side].bridge.boundaryOffsetMeters,
          floorBoundaryOffsetMeters:controlEndpoints[side].floor.boundaryOffsetMeters,
          trustedEndpointDistanceMeters:distance(
            controlEndpoints[side].bridge.point,
            controlEndpoints[side].floor.point
          )
        }
      ])),
      classifications
    }));

    expect(links).toHaveLength(2);
    expect(baseline.reached).toBe(79);
    expect(baseline.weak).toBe(9);
    expect(baseline.strong).toBe(11);
    expect(candidate.reached).toBe(79);
    expect(candidate.weak).toBe(9);
    expect(candidate.strong).toBe(11);
    expect(controlEndpoints.POSITIVE_Z.boundary.distanceMeters).toBeCloseTo(
      0.5185586972146101,
      12
    );
    expect(controlEndpoints.NEGATIVE_Z.boundary.distanceMeters).toBeCloseTo(
      0.5185586972146126,
      12
    );
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const classification=classifications[side] as {
        downstreamComponentCount:number;
        trustedRepresentativeCount:number;
        ownGlassConnectedCount:number;
      };
      expect(classification.downstreamComponentCount).toBe(58);
      expect(classification.trustedRepresentativeCount).toBe(15);
      expect(classification.ownGlassConnectedCount).toBeGreaterThanOrEqual(1);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },60000);
});
