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
type ContextName=
  |'TARGET_ONLY'
  |'HIGH_SOURCE_PLUS_TARGET'
  |'SIDE_ROUTE_SOUP'
  |'BOTH_ROUTE_SOUP'
  |'FULL_PARTIAL_STAGE_CONTEXT';

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
const CONTEXT_ORDER:readonly ContextName[]=[
  'TARGET_ONLY',
  'HIGH_SOURCE_PLUS_TARGET',
  'SIDE_ROUTE_SOUP',
  'BOTH_ROUTE_SOUP',
  'FULL_PARTIAL_STAGE_CONTEXT'
];
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
  if(!found)throw new Error(`Pass 18BQ missing component ${id}`);
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
function closestPair(
  a:StageTriangleMeshGeometry,
  b:StageTriangleMeshGeometry
):{a:StageVector3;b:StageVector3;distanceMeters:number}{
  let best:{a:StageVector3;b:StageVector3;distanceMeters:number}|null=null;
  const closestPointOnSegment=(
    p:StageVector3,x:StageVector3,y:StageVector3
  ):StageVector3=>{
    const vx=y[0]-x[0],vy=y[1]-x[1],vz=y[2]-x[2];
    const len2=vx*vx+vy*vy+vz*vz;
    if(len2<=1e-15)return x;
    const t=Math.max(0,Math.min(1,
      ((p[0]-x[0])*vx+(p[1]-x[1])*vy+(p[2]-x[2])*vz)/len2
    ));
    return [x[0]+vx*t,x[1]+vy*t,x[2]+vz*t];
  };
  const triangleSamples=(mesh:StageTriangleMeshGeometry)=>{
    const out:StageVector3[]=[...mesh.vertices];
    for(let i=0;i<mesh.indices.length;i+=3){
      const x=mesh.vertices[mesh.indices[i]!]!;
      const y=mesh.vertices[mesh.indices[i+1]!]!;
      const z=mesh.vertices[mesh.indices[i+2]!]!;
      out.push(triangleCentroid(x,y,z));
      for(const [p,q] of [[x,y],[y,z],[z,x]] as const){
        out.push([
          (p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2
        ]);
      }
    }
    return out;
  };
  const aa=triangleSamples(a),bb=triangleSamples(b);
  for(const p of aa){
    for(const q of bb){
      const d=distance(p,q);
      if(!best||d<best.distanceMeters)best={a:p,b:q,distanceMeters:d};
    }
  }
  // Also project samples against mesh edges so the diagnostic boundary is not
  // limited to vertex/centroid pairs.
  const edges=(mesh:StageTriangleMeshGeometry)=>{
    const out:Array<readonly [StageVector3,StageVector3]>=[];
    for(let i=0;i<mesh.indices.length;i+=3){
      const x=mesh.vertices[mesh.indices[i]!]!;
      const y=mesh.vertices[mesh.indices[i+1]!]!;
      const z=mesh.vertices[mesh.indices[i+2]!]!;
      out.push([x,y],[y,z],[z,x]);
    }
    return out;
  };
  for(const p of aa){
    for(const [x,y] of edges(b)){
      const q=closestPointOnSegment(p,x,y);
      const d=distance(p,q);
      if(!best||d<best.distanceMeters)best={a:p,b:q,distanceMeters:d};
    }
  }
  for(const p of bb){
    for(const [x,y] of edges(a)){
      const q=closestPointOnSegment(p,x,y);
      const d=distance(p,q);
      if(!best||d<best.distanceMeters)best={a:q,b:p,distanceMeters:d};
    }
  }
  if(!best)throw new Error('Pass 18BQ empty HIGH mesh pair');
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

describe('T21 Pass 18BQ HIGH proxy context-isolation diagnostic',()=>{
  it('adds geometry contexts monotonically around the fixed 1.237x HIGH proxy to find the first context that destroys direct target validity',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const base=UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY;
    const sideData={} as Record<Side,{
      source:ChainComponent;
      target:ChainComponent;
      proxy:StageTriangleMeshGeometry;
      rawTargetPoint:StageVector3;
      sideSoup:StageSolidDefinition[];
    }>;

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const route=fixture.pass18g.routes.glass[side];
      const source=componentById(route.components,IDS[side].highSource);
      const target=componentById(route.components,IDS[side].highTarget);
      const proxy=scaledProxyMesh(
        target.mesh,CLEARANCE_CENTERS_XZ[side],HIGH_PROXY_SCALE
      );
      const pair=closestPair(source.mesh,target.mesh);
      const byId=new Map(route.components.map(component=>[component.id,component] as const));
      const sideSoup=route.relaxedReachableComponentIds.map(id=>{
        const component=byId.get(id);
        if(!component)throw new Error(`Pass 18BQ missing route component ${side} ${id}`);
        return navOnlySolid(
          `pass18bq-side:${side}:${id}`,
          id===IDS[side].highTarget?proxy:component.mesh
        );
      });
      sideSoup.push(navOnlySolid(
        `pass18bq-predecessor:${side}`,
        fixture.glass[side].bridgeMesh
      ));
      sideData[side]={
        source,target,proxy,rawTargetPoint:pair.b,sideSoup
      };
    }

    const bothSoup=[
      ...sideData.POSITIVE_Z.sideSoup,
      ...sideData.NEGATIVE_Z.sideSoup
    ];

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const d=sideData[side];
      const contexts:Record<ContextName,ReturnType<typeof inspectContext>>={
        TARGET_ONLY:inspectContext(
          `pass18bq-target-only-${side.toLowerCase()}`,
          qaStage(
            `pass18bq-target-only-${side.toLowerCase()}`,
            [navOnlySolid(`pass18bq-target-only-solid-${side}`,d.proxy)]
          ),
          d.source.mesh,d.target.mesh,d.proxy,d.rawTargetPoint
        ),
        HIGH_SOURCE_PLUS_TARGET:inspectContext(
          `pass18bq-source-target-${side.toLowerCase()}`,
          qaStage(
            `pass18bq-source-target-${side.toLowerCase()}`,
            [
              navOnlySolid(`pass18bq-source-${side}`,d.source.mesh),
              navOnlySolid(`pass18bq-target-${side}`,d.proxy)
            ]
          ),
          d.source.mesh,d.target.mesh,d.proxy,d.rawTargetPoint
        ),
        SIDE_ROUTE_SOUP:inspectContext(
          `pass18bq-side-soup-${side.toLowerCase()}`,
          qaStage(
            `pass18bq-side-soup-${side.toLowerCase()}`,
            d.sideSoup
          ),
          d.source.mesh,d.target.mesh,d.proxy,d.rawTargetPoint
        ),
        BOTH_ROUTE_SOUP:inspectContext(
          `pass18bq-both-soup-${side.toLowerCase()}`,
          qaStage(
            `pass18bq-both-soup-${side.toLowerCase()}`,
            bothSoup
          ),
          d.source.mesh,d.target.mesh,d.proxy,d.rawTargetPoint
        ),
        FULL_PARTIAL_STAGE_CONTEXT:inspectContext(
          `pass18bq-full-context-${side.toLowerCase()}`,
          qaStage(
            `pass18bq-full-context-${side.toLowerCase()}`,
            [...base.solids,...bothSoup],
            base.paintSurfaces
          ),
          d.source.mesh,d.target.mesh,d.proxy,d.rawTargetPoint
        )
      };
      const firstInvalidTargetSourceContext=
        CONTEXT_ORDER.find(name=>!contexts[name].targetSourceDirectTrusted)??null;
      const firstInvalidTargetProxyContext=
        CONTEXT_ORDER.find(name=>!contexts[name].targetProxyDirectTrusted)??null;
      return [side,{
        highTargetId:d.target.id,
        highSourceId:d.source.id,
        highProxyScale:HIGH_PROXY_SCALE,
        rawTargetPoint:d.rawTargetPoint,
        contexts,
        firstInvalidTargetSourceContext,
        firstInvalidTargetProxyContext
      }];
    }));

    console.log('T21PASS18BQ_HIGH_PROXY_CONTEXT_ISOLATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BP',
      productionConfigUnchanged:true,
      sourceGeometryUnchanged:true,
      diagnosticProxyOnly:true,
      proxyScalingMode:'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      highTargetProxyScale:HIGH_PROXY_SCALE,
      contextOrder:CONTEXT_ORDER,
      trustedSnapMeters:TRUSTED_SNAP_METERS,
      rawEndpointHorizontalRadiusMeters:RAW_ENDPOINT_HORIZONTAL_RADIUS_METERS,
      rawEndpointVerticalHalfExtentMeters:RAW_ENDPOINT_VERTICAL_HALF_EXTENT_METERS,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      trustedNonLocalEndpointUsed:false,
      productionOffMeshLinkAuthorized:false,
      sides
    }));

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        contexts:Record<ContextName,ReturnType<typeof inspectContext>>;
        firstInvalidTargetSourceContext:ContextName|null;
        firstInvalidTargetProxyContext:ContextName|null;
      };
      expect(result.contexts.TARGET_ONLY.targetSourceDirectTrusted).toBe(true);
      expect(result.contexts.TARGET_ONLY.targetProxyDirectTrusted).toBe(true);
      expect(
        result.contexts.FULL_PARTIAL_STAGE_CONTEXT.targetSourceDirectTrusted
      ).toBe(false);
      expect(result.firstInvalidTargetSourceContext).not.toBeNull();
      expect(result.firstInvalidTargetProxyContext).not.toBeNull();
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
