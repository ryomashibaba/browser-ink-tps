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
  glass:Record<Side,{bridgeMesh:StageTriangleMeshGeometry;nearestNonBridgeMesh:StageTriangleMeshGeometry|null}>;
  pass18g:{routes:{glass:Record<Side,{relaxedReachableComponentIds:string[];components:ChainComponent[]}>}};
}
interface Pair{a:StageVector3;b:StageVector3;distanceMeters:number;}
interface TrustedEndpoint{point:StageVector3;sourceSample:StageVector3;sampleSnapMeters:number;boundaryOffsetMeters:number;}
interface MatrixRow{from:string;reached:string[];}
interface MatrixSummary{reached:number;weak:number;strong:number;isolated:string[];rows:MatrixRow[];}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const TRUSTED_SNAP_METERS=0.30;
const UPSTREAM_FIXED_RETREAT_METERS=0.130;
const UPSTREAM_RADIUS_METERS=0.995;
const DOWNSTREAM_RADIUS_METERS=0.80;
const MAX_RETREAT_METERS=0.654737328492778;
const UPSTREAM_SUCCESS_POINTS:Record<Side,StageVector3>={
  POSITIVE_Z:[-10.67826430970341,6,12.118397071136153],
  NEGATIVE_Z:[10.907632598231574,6,-11.92383277567933]
};
const IDS:Record<Side,{floor:string;slope:string}>={
  POSITIVE_Z:{
    floor:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3'
  },
  NEGATIVE_Z:{
    floor:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13',
    slope:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23'
  }
};

function distance(a:StageVector3,b:StageVector3):number{return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);}
function add(a:StageVector3,b:StageVector3):StageVector3{return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a:StageVector3,b:StageVector3):StageVector3{return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a:StageVector3,s:number):StageVector3{return [a[0]*s,a[1]*s,a[2]*s];}
function dot(a:StageVector3,b:StageVector3):number{return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function closestPointOnTriangle(p:StageVector3,a:StageVector3,b:StageVector3,c:StageVector3):StageVector3{
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
  if(va<=0&&(d4-d3)>=0&&(d5-d6)>=0)return add(b,mul(sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))));
  const denom=1/(va+vb+vc),v=vb*denom,w=vc*denom;
  return add(a,add(mul(ab,v),mul(ac,w)));
}
function closestSegments(p1:StageVector3,q1:StageVector3,p2:StageVector3,q2:StageVector3):Pair{
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
function trianglePair(a0:StageVector3,a1:StageVector3,a2:StageVector3,b0:StageVector3,b1:StageVector3,b2:StageVector3):Pair{
  let best:Pair|null=null;
  const consider=(candidate:Pair)=>{if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;};
  for(const p of [a0,a1,a2]){const q=closestPointOnTriangle(p,b0,b1,b2);consider({a:p,b:q,distanceMeters:distance(p,q)});}
  for(const p of [b0,b1,b2]){const q=closestPointOnTriangle(p,a0,a1,a2);consider({a:q,b:p,distanceMeters:distance(q,p)});}
  for(const [ap,aq] of [[a0,a1],[a1,a2],[a2,a0]] as const)
    for(const [bp,bq] of [[b0,b1],[b1,b2],[b2,b0]] as const)consider(closestSegments(ap,aq,bp,bq));
  if(!best)throw new Error('Pass 18AL triangle pair missing');
  return best;
}
function closestMeshPair(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry):Pair{
  let best:Pair|null=null;
  for(let ai=0;ai<a.indices.length;ai+=3){
    const a0=a.vertices[a.indices[ai]!]!,a1=a.vertices[a.indices[ai+1]!]!,a2=a.vertices[a.indices[ai+2]!]!;
    for(let bi=0;bi<b.indices.length;bi+=3){
      const b0=b.vertices[b.indices[bi]!]!,b1=b.vertices[b.indices[bi+1]!]!,b2=b.vertices[b.indices[bi+2]!]!;
      const candidate=trianglePair(a0,a1,a2,b0,b1,b2);
      if(!best||candidate.distanceMeters<best.distanceMeters)best=candidate;
    }
  }
  if(!best)throw new Error('Pass 18AL empty mesh pair');
  return best;
}
function triangleCentroid(a:StageVector3,b:StageVector3,c:StageVector3):StageVector3{
  return [(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
}
function meshSamples(mesh:StageTriangleMeshGeometry):StageVector3[]{
  const samples=[...mesh.vertices];
  for(let i=0;i<mesh.indices.length;i+=3)samples.push(triangleCentroid(
    mesh.vertices[mesh.indices[i]!]!,
    mesh.vertices[mesh.indices[i+1]!]!,
    mesh.vertices[mesh.indices[i+2]!]!
  ));
  return samples;
}
function trustedEndpoint(nav:RecastStageNavigation,mesh:StageTriangleMeshGeometry,boundary:StageVector3):TrustedEndpoint|null{
  let best:TrustedEndpoint|null=null;
  for(const sample of meshSamples(mesh)){
    const p=nav.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snap=distance(sample,point);
    if(snap>TRUSTED_SNAP_METERS+1e-9)continue;
    const boundaryOffset=distance(boundary,point);
    if(!best||boundaryOffset<best.boundaryOffsetMeters-1e-9||
      (Math.abs(boundaryOffset-best.boundaryOffsetMeters)<=1e-9&&snap<best.sampleSnapMeters)){
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
  return {id,center:[0,0,0],size:meshBounds(mesh),material:'light',render:false,projectileBlocker:false,cameraBlocker:false,collisionEnabled:false,navigationEnabled:true,collisionBehavior:'SOLID',triangleMesh:mesh};
}
function qaStage(id:string,solids:readonly StageSolidDefinition[],links:readonly StageNavigationLinkDefinition[]):StageDefinition{
  const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
  return {metadata:{id,displayName:id,worldBounds:base.worldBounds,teamASpawn:base.teamASpawnFloorPoint,teamBSpawn:base.teamBSpawnFloorPoint,teamASpawnSlots:[base.teamASpawnFloorPoint],teamBSpawnSlots:[base.teamBSpawnFloorPoint],tacticalNodes:[],splatZones:[]},solids,paintSurfaces:base.paintSurfaces,navigationLinks:links};
}
function matrixSummary(stage:StageDefinition):MatrixSummary{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const anchors=undertowPass18bTraversableQaAnchors();
  const rows=anchors.map(from=>({from:from.id,reached:anchors.filter(to=>nav.auditPath(vec3(from.point),vec3(to.point)).reachedTarget).map(to=>to.id)}));
  const ids=rows.map(r=>r.from),reach=new Map(rows.map(r=>[r.from,new Set(r.reached)] as const));
  const weakSeen=new Set<string>();let weak=0;
  for(const seed of ids){if(weakSeen.has(seed))continue;weak++;weakSeen.add(seed);const stack=[seed];while(stack.length){const cur=stack.pop()!;for(const candidate of ids){if(weakSeen.has(candidate))continue;if(reach.get(cur)!.has(candidate)||reach.get(candidate)!.has(cur)){weakSeen.add(candidate);stack.push(candidate);}}}}
  const strongSeen=new Set<string>();let strong=0;
  for(const seed of ids){if(strongSeen.has(seed))continue;strong++;for(const candidate of ids){if(reach.get(seed)!.has(candidate)&&reach.get(candidate)!.has(seed))strongSeen.add(candidate);}}
  return {reached:rows.reduce((n,r)=>n+r.reached.length,0),weak,strong,isolated:rows.filter(r=>r.reached.length===1&&r.reached[0]===r.from).map(r=>r.from),rows};
}
function mutualAnchorIds(stage:StageDefinition,point:StageVector3):string[]{
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const anchors=undertowPass18bTraversableQaAnchors();
  return anchors.filter(anchor=>
    nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
    nav.auditPath(vec3(anchor.point),vec3(point)).reachedTarget
  ).map(anchor=>anchor.id);
}
function trustedRepresentative(nav:RecastStageNavigation,mesh:StageTriangleMeshGeometry):TrustedEndpoint|null{
  let best:TrustedEndpoint|null=null;
  for(const sample of meshSamples(mesh)){
    const p=nav.closestPoint(vec3(sample));
    const point=[p.x,p.y,p.z] as StageVector3;
    const snap=distance(sample,point);
    if(snap>TRUSTED_SNAP_METERS+1e-9)continue;
    if(!best||snap<best.sampleSnapMeters){
      best={point,sourceSample:sample,sampleSnapMeters:snap,boundaryOffsetMeters:0};
    }
  }
  return best;
}
function mutualAnchorIdsWithNav(nav:RecastStageNavigation,point:StageVector3):string[]{
  const anchors=undertowPass18bTraversableQaAnchors();
  return anchors.filter(anchor=>
    nav.auditPath(vec3(point),vec3(anchor.point)).reachedTarget &&
    nav.auditPath(vec3(anchor.point),vec3(point)).reachedTarget
  ).map(anchor=>anchor.id);
}
function componentById(components:ChainComponent[],id:string):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18AL missing component ${id}`);
  return found;
}


beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18AL combined upper-glass source-chain Recast diagnostic',()=>{
  it('combines only the frozen 18AK upstream and 18AF downstream QA links and localizes the first remaining source-chain break',()=>{
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
      floor:ChainComponent;
      slope:ChainComponent;
      bridgeFloorPair:Pair;
      floorSlopePair:Pair;
      upstreamDirection:StageVector3;
      upstreamFixedEndpoint:StageVector3;
    }>;

    const pointToMeshDistance=(point:StageVector3,mesh:StageTriangleMeshGeometry)=>{
      let best=Number.POSITIVE_INFINITY;
      for(let i=0;i<mesh.indices.length;i+=3){
        const q=closestPointOnTriangle(
          point,
          mesh.vertices[mesh.indices[i]!]!,
          mesh.vertices[mesh.indices[i+1]!]!,
          mesh.vertices[mesh.indices[i+2]!]!
        );
        best=Math.min(best,distance(point,q));
      }
      return best;
    };

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const glass=fixture.glass[side];
      const route=fixture.pass18g.routes.glass[side];
      const floor=componentById(route.components,IDS[side].floor);
      const slope=componentById(route.components,IDS[side].slope);
      sourceSolids.push(navOnlySolid(`pass18al-predecessor:${side}`,glass.bridgeMesh));
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      const components=route.relaxedReachableComponentIds.map(id=>{
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18AL missing downstream component ${side} ${id}`);
        sourceSolids.push(navOnlySolid(`pass18al-downstream:${side}:${id}`,component.mesh));
        return component;
      });
      sideComponents[side]=components;

      const bridgeFloorPair=closestMeshPair(glass.bridgeMesh,floor.mesh);
      const target=UPSTREAM_SUCCESS_POINTS[side];
      const delta=sub(target,bridgeFloorPair.b);
      const len=Math.hypot(delta[0],delta[1],delta[2]);
      expect(len).toBeCloseTo(MAX_RETREAT_METERS,12);
      const upstreamDirection=[
        delta[0]/len,delta[1]/len,delta[2]/len
      ] as StageVector3;
      const upstreamFixedEndpoint=[
        bridgeFloorPair.b[0]+upstreamDirection[0]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloorPair.b[1]+upstreamDirection[1]*UPSTREAM_FIXED_RETREAT_METERS,
        bridgeFloorPair.b[2]+upstreamDirection[2]*UPSTREAM_FIXED_RETREAT_METERS
      ] as StageVector3;
      expect(pointToMeshDistance(upstreamFixedEndpoint,floor.mesh)).toBeLessThanOrEqual(1e-5);

      sideData[side]={
        floor,
        slope,
        bridgeFloorPair,
        floorSlopePair:closestMeshPair(floor.mesh,slope.mesh),
        upstreamDirection,
        upstreamFixedEndpoint
      };
    }

    const solids=[...base.solids,...sourceSolids];
    const inherited=[...base.navigationLinks];
    let userId=19800;

    const upstreamLinks=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
      id:`pass18al-upstream-18ak-${side.toLowerCase()}`,
      start:sideData[side].bridgeFloorPair.a,
      end:sideData[side].upstreamFixedEndpoint,
      radiusMeters:UPSTREAM_RADIUS_METERS,
      bidirectional:true,
      userId:userId++
    } satisfies StageNavigationLinkDefinition));

    const downstreamLinks=(['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>({
      id:`pass18al-downstream-18af-${side.toLowerCase()}`,
      start:sideData[side].floorSlopePair.a,
      end:sideData[side].floorSlopePair.b,
      radiusMeters:DOWNSTREAM_RADIUS_METERS,
      bidirectional:true,
      userId:userId++
    } satisfies StageNavigationLinkDefinition));

    const stages={
      baseline:qaStage('pass18al-baseline',solids,inherited),
      upstreamOnly:qaStage('pass18al-upstream-only',solids,[...inherited,...upstreamLinks]),
      downstreamOnly:qaStage('pass18al-downstream-only',solids,[...inherited,...downstreamLinks]),
      combined:qaStage('pass18al-combined',solids,[...inherited,...upstreamLinks,...downstreamLinks])
    };
    const matrices=Object.fromEntries(
      Object.entries(stages).map(([name,stage])=>[name,matrixSummary(stage)])
    ) as Record<keyof typeof stages,MatrixSummary>;
    const anchors=undertowPass18bTraversableQaAnchors();

    const probe=(stage:StageDefinition,side:Side)=>{
      const nav=new RecastStageNavigation(stage,new PerformanceStats());
      const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
      const oppositePrefix=side==='POSITIVE_Z'?'glass:negative-z:':'glass:positive-z:';
      const samplePoints={
        rawFloorBoundary:sideData[side].bridgeFloorPair.b,
        fixedFloorEndpoint:sideData[side].upstreamFixedEndpoint,
        floorSlopeFloorBoundary:sideData[side].floorSlopePair.a,
        floorSlopeSlopeBoundary:sideData[side].floorSlopePair.b
      };
      const results=Object.fromEntries(Object.entries(samplePoints).map(([name,point])=>{
        const projectedRaw=nav.closestPoint(vec3(point));
        const projected=[projectedRaw.x,projectedRaw.y,projectedRaw.z] as StageVector3;
        const ids=anchors.filter(anchor=>
          nav.auditPath(vec3(projected),vec3(anchor.point)).reachedTarget &&
          nav.auditPath(vec3(anchor.point),vec3(projected)).reachedTarget
        ).map(anchor=>anchor.id);
        return [name,{
          rawPoint:point,
          projectedPoint:projected,
          projectedSnapMeters:distance(point,projected),
          ownGlassAnchorIds:ids.filter(id=>id.startsWith(ownPrefix)),
          oppositeGlassAnchorIds:ids.filter(id=>id.startsWith(oppositePrefix)),
          nonGlassAnchorIds:ids.filter(id=>!id.startsWith('glass:'))
        }];
      }));
      return results as Record<string,{
        rawPoint:StageVector3;
        projectedPoint:StageVector3;
        projectedSnapMeters:number;
        ownGlassAnchorIds:string[];
        oppositeGlassAnchorIds:string[];
        nonGlassAnchorIds:string[];
      }>;
    };

    const probes=Object.fromEntries(
      Object.entries(stages).map(([variant,stage])=>[
        variant,
        Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>[
          side,probe(stage,side)
        ]))
      ])
    ) as Record<keyof typeof stages,Record<Side,ReturnType<typeof probe>>>;

    const combined=matrices.combined;
    const combinedNav=new RecastStageNavigation(stages.combined,new PerformanceStats());
    const frontier=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const ownPrefix=side==='POSITIVE_Z'?'glass:positive-z:':'glass:negative-z:';
      const rows=sideComponents[side].map(component=>{
        const representative=trustedRepresentative(combinedNav,component.mesh);
        if(!representative)return null;
        const mutualAnchorIds=mutualAnchorIdsWithNav(combinedNav,representative.point);
        return {
          component,
          representative,
          mutualAnchorIds,
          ownGlass:mutualAnchorIds.some(id=>id.startsWith(ownPrefix)),
          nonGlass:mutualAnchorIds.filter(id=>!id.startsWith('glass:'))
        };
      }).filter((row):row is NonNullable<typeof row>=>row!==null);
      const connected=rows.filter(row=>row.ownGlass);
      const disconnected=rows.filter(row=>!row.ownGlass);
      const pairs:Array<{
        connectedId:string;
        connectedMaterial:string|null;
        connectedYRange:[number,number]|null;
        disconnectedId:string;
        disconnectedMaterial:string|null;
        disconnectedYRange:[number,number]|null;
        distanceMeters:number;
        connectedBoundary:StageVector3;
        disconnectedBoundary:StageVector3;
        disconnectedRepresentativeSnapMeters:number;
        disconnectedMutualAnchorIds:string[];
      }>=[];
      for(const a of connected){
        for(const b of disconnected){
          const pair=closestMeshPair(a.component.mesh,b.component.mesh);
          pairs.push({
            connectedId:a.component.id,
            connectedMaterial:a.component.sourceMaterial??null,
            connectedYRange:a.component.yRange??null,
            disconnectedId:b.component.id,
            disconnectedMaterial:b.component.sourceMaterial??null,
            disconnectedYRange:b.component.yRange??null,
            distanceMeters:pair.distanceMeters,
            connectedBoundary:pair.a,
            disconnectedBoundary:pair.b,
            disconnectedRepresentativeSnapMeters:b.representative.sampleSnapMeters,
            disconnectedMutualAnchorIds:b.mutualAnchorIds
          });
        }
      }
      pairs.sort((a,b)=>a.distanceMeters-b.distanceMeters);
      return [side,{
        trustedComponentCount:rows.length,
        connectedCount:connected.length,
        connectedIds:connected.map(row=>row.component.id),
        connectedByMaterial:Object.fromEntries(
          [...new Set(connected.map(row=>row.component.sourceMaterial??'UNKNOWN'))].sort().map(material=>[
            material,connected.filter(row=>(row.component.sourceMaterial??'UNKNOWN')===material).length
          ])
        ),
        disconnectedCount:disconnected.length,
        nearestBreak:pairs[0]??null,
        topBreaks:pairs.slice(0,12)
      }];
    }));

    const combinedBasePairs=new Set(matrices.baseline.rows.flatMap(row=>
      row.reached.map(to=>`${row.from}->${to}`)
    ));
    const combinedPairs=new Set(combined.rows.flatMap(row=>
      row.reached.map(to=>`${row.from}->${to}`)
    ));
    const addedPairs=[...combinedPairs].filter(pair=>!combinedBasePairs.has(pair)).sort();
    const removedPairs=[...combinedBasePairs].filter(pair=>!combinedPairs.has(pair)).sort();

    const sideSummary=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const combinedSlope=probes.combined[side].floorSlopeSlopeBoundary;
      const upstreamSlope=probes.upstreamOnly[side].floorSlopeSlopeBoundary;
      const downstreamSlope=probes.downstreamOnly[side].floorSlopeSlopeBoundary;
      return [side,{
        bridgeFloorPhysicalDistanceMeters:sideData[side].bridgeFloorPair.distanceMeters,
        upstreamRetreatMeters:UPSTREAM_FIXED_RETREAT_METERS,
        upstreamRadiusMeters:UPSTREAM_RADIUS_METERS,
        upstreamFixedEndpoint:sideData[side].upstreamFixedEndpoint,
        floorSlopePhysicalDistanceMeters:sideData[side].floorSlopePair.distanceMeters,
        downstreamRadiusMeters:DOWNSTREAM_RADIUS_METERS,
        baseline:probes.baseline[side],
        upstreamOnly:probes.upstreamOnly[side],
        downstreamOnly:probes.downstreamOnly[side],
        combined:probes.combined[side],
        combinedSlopeOwnGlassConnected:combinedSlope.ownGlassAnchorIds.length>0,
        combinedSlopeNonGlassAnchorIds:combinedSlope.nonGlassAnchorIds,
        upstreamOnlySlopeOwnGlassConnected:upstreamSlope.ownGlassAnchorIds.length>0,
        downstreamOnlySlopeOwnGlassConnected:downstreamSlope.ownGlassAnchorIds.length>0
      }];
    }));

    console.log('T21PASS18AL_COMBINED_SOURCE_CHAIN',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      globalRecastSettingsChanged:false,
      trustedEndpointsUsedAsLinks:false,
      upstream:{
        sourcePass:'18AK',
        retreatMeters:UPSTREAM_FIXED_RETREAT_METERS,
        radiusMeters:UPSTREAM_RADIUS_METERS,
        bridgeEndpoint:'EXACT_RAW_PHYSICAL_ENDPOINT',
        floorEndpoint:'SOURCE_SURFACE_FIXED_RETREAT'
      },
      downstream:{
        sourcePass:'18AF',
        radiusMeters:DOWNSTREAM_RADIUS_METERS,
        endpointMode:'EXACT_RAW_PHYSICAL_PAIR'
      },
      matrices:Object.fromEntries(Object.entries(matrices).map(([name,matrix])=>[
        name,{reached:matrix.reached,weak:matrix.weak,strong:matrix.strong,isolated:matrix.isolated}
      ])),
      combinedDelta:{addedPairs,removedPairs},
      sides:sideSummary,
      frontier
    }));

    expect(matrices.baseline.reached).toBe(79);
    expect(matrices.baseline.weak).toBe(9);
    expect(matrices.baseline.strong).toBe(11);
    expect(matrices.upstreamOnly.reached).toBe(79);
    expect(matrices.upstreamOnly.weak).toBe(9);
    expect(matrices.upstreamOnly.strong).toBe(11);
    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      expect(sideData[side].bridgeFloorPair.distanceMeters).toBeCloseTo(0.51855869721461,11);
      expect(sideData[side].floorSlopePair.distanceMeters).toBeCloseTo(0.51855869721461,11);
      expect(probes.upstreamOnly[side].fixedFloorEndpoint.ownGlassAnchorIds.length).toBeGreaterThan(0);
      expect(probes.combined[side].floorSlopeSlopeBoundary.ownGlassAnchorIds.length).toBeGreaterThan(0);
      const sideFrontier=frontier[side] as {
        trustedComponentCount:number;
        connectedCount:number;
        disconnectedCount:number;
        nearestBreak:{distanceMeters:number}|null;
      };
      expect(sideFrontier.trustedComponentCount).toBeGreaterThan(0);
      expect(sideFrontier.connectedCount).toBeGreaterThanOrEqual(2);
      expect(sideFrontier.disconnectedCount).toBeGreaterThan(0);
      expect(sideFrontier.nearestBreak).not.toBeNull();
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },120000);
});
