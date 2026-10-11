import { readFileSync } from 'node:fs';
import type { NavMeshQuery } from 'recast-navigation';
import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../src/core/PerformanceStats';
import {
  RecastStageNavigation,
  initializeRecastNavigation
} from '../src/navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
  type StageDefinition,
  type StageSolidDefinition,
  type StageTriangleMeshGeometry,
  type StageVector3
} from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

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

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const TRUSTED_SNAP_METERS=0.30;
const HIGH_PROXY_SCALE=1.237;
const RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS=1.55;
const RAW_ENDPOINT_VERTICAL_HALF_EXTENT_METERS=0.40;
const CLEARANCE_CENTERS_XZ:Record<Side,readonly [number,number]>={
  POSITIVE_Z:[-7.988395442411672,26.360607976493593],
  NEGATIVE_Z:[11.727375983212928,-27.076627408486683]
};
const IDS:Record<Side,{highSource:string;highTarget:string}>={
  POSITIVE_Z:{
    highSource:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    highTarget:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c5'
  },
  NEGATIVE_Z:{
    highSource:'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    highTarget:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c11'
  }
};
const BEST_CONSTRUCTIVE_CONTRIBUTOR_IDS:Record<Side,string>={
  POSITIVE_Z:
    'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00|FldObj_Temple01_PntSet_BridgeMetal00|c63',
  NEGATIVE_Z:
    'FldObj_Temple01_PntSet_mesh61_low_1__BridgeMetal00|FldObj_Temple01_PntSet_BridgeMetal00|c148'
};


function distance(a:StageVector3,b:StageVector3):number{
  return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
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
    const point=[result.point.x,result.point.y,result.point.z] as StageVector3;
    const snapMeters=distance(sample,point);
    if(snapMeters>TRUSTED_SNAP_METERS+1e-9)continue;
    if(!best||snapMeters<best.snapMeters){
      best={sample,point,snapMeters,polyRef:result.polyRef};
    }
  }
  return best;
}
function componentById(
  components:readonly ChainComponent[],
  id:string
):ChainComponent{
  const found=components.find(component=>component.id===id);
  if(!found)throw new Error(`Pass 18BS missing component ${id}`);
  return found;
}
function scaledProxyMesh(
  mesh:StageTriangleMeshGeometry,
  centerXZ:readonly [number,number],
  scale:number
):StageTriangleMeshGeometry{
  return {
    vertices:mesh.vertices.map(vertex=>[
      centerXZ[0]+(vertex[0]-centerXZ[0])*scale,
      vertex[1],
      centerXZ[1]+(vertex[2]-centerXZ[1])*scale
    ] as StageVector3),
    indices:[...mesh.indices]
  };
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
  paintSurfaces:StageDefinition['paintSurfaces']=[]
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
    solids,
    paintSurfaces,
    navigationLinks:[]
  };
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
):{a:StageVector3;b:StageVector3;distanceMeters:number}{
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
):{a:StageVector3;b:StageVector3;distanceMeters:number}{
  let best:{a:StageVector3;b:StageVector3;distanceMeters:number}|null=null;
  const consider=(candidate:{a:StageVector3;b:StageVector3;distanceMeters:number})=>{
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
  if(!best)throw new Error('Pass 18BS triangle pair missing');
  return best;
}
function closestMeshPair(
  a:StageTriangleMeshGeometry,
  b:StageTriangleMeshGeometry
):{a:StageVector3;b:StageVector3;distanceMeters:number}{
  let best:{a:StageVector3;b:StageVector3;distanceMeters:number}|null=null;
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
  if(!best)throw new Error('Pass 18BS empty HIGH mesh pair');
  return best;
}
function projectRaw(
  query:NavMeshQuery,
  point:StageVector3
){
  const result=query.findClosestPoint(
    {x:point[0],y:point[1],z:point[2]},
    {halfExtents:{
      x:RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS,
      y:RAW_ENDPOINT_VERTICAL_HALF_EXTENT_METERS,
      z:RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS
    }}
  );
  const projected=result.success
    ?[result.point.x,result.point.y,result.point.z] as StageVector3
    :null;
  return {
    success:result.success,
    polyRef:result.polyRef,
    projectedPoint:projected,
    snapMeters:projected?distance(point,projected):Number.POSITIVE_INFINITY
  };
}
function inspectContext(
  id:string,
  stage:StageDefinition,
  sourceMesh:StageTriangleMeshGeometry,
  targetSourceMesh:StageTriangleMeshGeometry,
  targetProxyMesh:StageTriangleMeshGeometry,
  rawTargetPoint:StageVector3
){
  const nav=new RecastStageNavigation(stage,new PerformanceStats());
  const query=(nav as unknown as {query:NavMeshQuery}).query;
  const sourceDirect=directTrustedRepresentative(query,sourceMesh);
  const targetSourceDirect=directTrustedRepresentative(query,targetSourceMesh);
  const targetProxyDirect=directTrustedRepresentative(query,targetProxyMesh);
  const rawTargetProjection=projectRaw(query,rawTargetPoint);
  const pathMutual=(
    a:StageVector3|null,
    b:StageVector3|null
  )=>{
    if(!a||!b)return null;
    const ab=nav.auditPath(
      {x:a[0],y:a[1],z:a[2]},
      {x:b[0],y:b[1],z:b[2]},
      0.05
    );
    const ba=nav.auditPath(
      {x:b[0],y:b[1],z:b[2]},
      {x:a[0],y:a[1],z:a[2]},
      0.05
    );
    return {
      mutual:ab.reachedTarget&&ba.reachedTarget,
      abReached:ab.reachedTarget,
      baReached:ba.reachedTarget,
      abQuerySuccess:ab.querySuccess,
      baQuerySuccess:ba.querySuccess
    };
  };
  return {
    id,
    sourceDirectTrusted:sourceDirect!==null,
    sourceDirectRepresentative:sourceDirect,
    targetSourceDirectTrusted:targetSourceDirect!==null,
    targetSourceDirectRepresentative:targetSourceDirect,
    targetProxyDirectTrusted:targetProxyDirect!==null,
    targetProxyDirectRepresentative:targetProxyDirect,
    rawTargetProjection,
    rawTargetMutualWithSource:pathMutual(
      rawTargetProjection.projectedPoint,
      sourceDirect?.point??null
    ),
    rawTargetMutualWithTargetSource:pathMutual(
      rawTargetProjection.projectedPoint,
      targetSourceDirect?.point??null
    ),
    rawTargetMutualWithTargetProxy:pathMutual(
      rawTargetProjection.projectedPoint,
      targetProxyDirect?.point??null
    )
  };
}



beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BS HIGH proxy single-component suppressor diagnostic',()=>{
  it('holds each side best Pass 18BR constructive contributor fixed and adds every other route component singly to identify suppressors of proxy-island ownership',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const route=fixture.pass18g.routes.glass[side];
      const source=componentById(route.components,IDS[side].highSource);
      const target=componentById(route.components,IDS[side].highTarget);
      const bestId=BEST_CONSTRUCTIVE_CONTRIBUTOR_IDS[side];
      const best=componentById(route.components,bestId);
      const proxy=scaledProxyMesh(
        target.mesh,CLEARANCE_CENTERS_XZ[side],HIGH_PROXY_SCALE
      );
      const pair=closestMeshPair(source.mesh,target.mesh);
      const baseSolids=[
        navOnlySolid(`pass18bs-source-${side}`,source.mesh),
        navOnlySolid(`pass18bs-target-${side}`,proxy),
        navOnlySolid(`pass18bs-best-${side}`,best.mesh)
      ];
      const baseline=inspectContext(
        `pass18bs-baseline-${side.toLowerCase()}`,
        qaStage(
          `pass18bs-baseline-${side.toLowerCase()}`,
          baseSolids
        ),
        source.mesh,target.mesh,proxy,pair.b
      );

      const byId=new Map(
        route.components.map(component=>[component.id,component] as const)
      );
      const componentCandidates=route.relaxedReachableComponentIds
        .filter(id=>id!==source.id&&id!==target.id&&id!==bestId)
        .map(id=>{
          const component=byId.get(id);
          if(!component){
            throw new Error(`Pass 18BS missing route component ${side} ${id}`);
          }
          return {
            id,
            sourceMaterial:component.sourceMaterial??null,
            yRange:component.yRange??null,
            solid:navOnlySolid(`pass18bs-added:${side}:${id}`,component.mesh)
          };
        });
      const candidates=[
        ...componentCandidates,
        {
          id:'__PREDECESSOR_BRIDGE__',
          sourceMaterial:'BridgeMetal00',
          yRange:null,
          solid:navOnlySolid(
            `pass18bs-predecessor-${side}`,
            fixture.glass[side].bridgeMesh
          )
        }
      ];

      const results=candidates.map(candidate=>{
        const context=inspectContext(
          `pass18bs-single-${side.toLowerCase()}-${candidate.id}`,
          qaStage(
            `pass18bs-single-${side.toLowerCase()}-${candidate.id}`,
            [...baseSolids,candidate.solid]
          ),
          source.mesh,target.mesh,proxy,pair.b
        );
        const rawTargetMutualWithSource=
          context.rawTargetMutualWithSource?.mutual??null;
        const rawTargetMutualWithTargetProxy=
          context.rawTargetMutualWithTargetProxy?.mutual??null;
        return {
          id:candidate.id,
          sourceMaterial:candidate.sourceMaterial,
          yRange:candidate.yRange,
          targetSourceDirectTrusted:context.targetSourceDirectTrusted,
          targetProxyDirectTrusted:context.targetProxyDirectTrusted,
          rawTargetProjection:context.rawTargetProjection,
          rawTargetMutualWithSource,
          rawTargetMutualWithTargetProxy,
          sourceValidityChanged:
            context.targetSourceDirectTrusted!==baseline.targetSourceDirectTrusted,
          proxyValidityChanged:
            context.targetProxyDirectTrusted!==baseline.targetProxyDirectTrusted,
          rawTargetSourceMutualChanged:
            rawTargetMutualWithSource!==
            (baseline.rawTargetMutualWithSource?.mutual??null),
          rawTargetProxyMutualChanged:
            rawTargetMutualWithTargetProxy!==
            (baseline.rawTargetMutualWithTargetProxy?.mutual??null),
          restoresSourceIsland:rawTargetMutualWithSource===true,
          suppressesProxyIsland:rawTargetMutualWithTargetProxy===false,
          recreatesFullContextAbsorption:
            rawTargetMutualWithSource===true&&
            rawTargetMutualWithTargetProxy===false
        };
      });

      const fullSuppressors=results.filter(row=>row.recreatesFullContextAbsorption);
      const sourceRestorers=results.filter(row=>row.restoresSourceIsland);
      const proxySuppressors=results.filter(row=>row.suppressesProxyIsland);
      const bestSuppressor=[...fullSuppressors].sort((a,b)=>
        a.rawTargetProjection.snapMeters-b.rawTargetProjection.snapMeters ||
        a.id.localeCompare(b.id)
      )[0]??null;

      return [side,{
        highSourceId:source.id,
        highTargetId:target.id,
        bestConstructiveContributorId:bestId,
        bestConstructiveContributorMaterial:best.sourceMaterial??null,
        bestConstructiveContributorYRange:best.yRange??null,
        baseline:{
          targetSourceDirectTrusted:baseline.targetSourceDirectTrusted,
          targetProxyDirectTrusted:baseline.targetProxyDirectTrusted,
          rawTargetProjection:baseline.rawTargetProjection,
          rawTargetMutualWithSource:
            baseline.rawTargetMutualWithSource?.mutual??null,
          rawTargetMutualWithTargetProxy:
            baseline.rawTargetMutualWithTargetProxy?.mutual??null
        },
        candidateCount:results.length,
        sourceRestorerCount:sourceRestorers.length,
        proxySuppressorCount:proxySuppressors.length,
        fullSuppressorCount:fullSuppressors.length,
        bestSuppressor,
        fullSuppressors,
        sourceRestorers,
        proxySuppressors,
        results
      }];
    }));

    console.log('T21PASS18BS_HIGH_PROXY_SINGLE_COMPONENT_SUPPRESSORS',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BR',
      productionConfigUnchanged:true,
      sourceGeometryUnchanged:true,
      diagnosticProxyOnly:true,
      proxyScalingMode:'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      highTargetProxyScale:HIGH_PROXY_SCALE,
      baselineContext:
        'HIGH_SOURCE_PLUS_PROXY_TARGET_PLUS_BEST_CONSTRUCTIVE_CONTRIBUTOR',
      additiveContextMode:'ONE_OTHER_ROUTE_COMPONENT_AT_A_TIME',
      trustedSnapMeters:TRUSTED_SNAP_METERS,
      rawEndpointHorizontalRadiusMeters:RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS,
      rawEndpointVerticalHalfExtentMeters:RAW_ENDPOINT_VERTICAL_HALF_EXTENT_METERS,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      trustedNonLocalEndpointUsed:false,
      productionOffMeshLinkAuthorized:false,
      sides
    }));

    const positive=sides.POSITIVE_Z as {
      baseline:{
        targetProxyDirectTrusted:boolean;
        rawTargetMutualWithSource:boolean|null;
        rawTargetMutualWithTargetProxy:boolean|null;
      };
      candidateCount:number;
      fullSuppressorCount:number;
    };
    const negative=sides.NEGATIVE_Z as typeof positive;
    for(const side of [positive,negative]){
      expect(side.baseline.targetProxyDirectTrusted).toBe(true);
      expect(side.baseline.rawTargetMutualWithSource).toBe(false);
      expect(side.baseline.rawTargetMutualWithTargetProxy).toBe(true);
      expect(side.candidateCount).toBeGreaterThan(0);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
