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
  if(!found)throw new Error(`Pass 18BU missing component ${id}`);
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
  if(!best)throw new Error('Pass 18BU triangle pair missing');
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
  if(!best)throw new Error('Pass 18BU empty HIGH mesh pair');
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




function vertexKey(v:StageVector3):string{
  return `${v[0].toFixed(6)},${v[1].toFixed(6)},${v[2].toFixed(6)}`;
}
function splitTriangleComponents(
  mesh:StageTriangleMeshGeometry
):StageTriangleMeshGeometry[]{
  const triangleCount=Math.floor(mesh.indices.length/3);
  const triangleVertexKeys=Array.from({length:triangleCount},(_,tri)=>{
    const keys:string[]=[];
    for(let k=0;k<3;k+=1){
      const vi=mesh.indices[tri*3+k]!;
      keys.push(vertexKey(mesh.vertices[vi]!));
    }
    return keys;
  });
  const keyToTriangles=new Map<string,number[]>();
  for(let tri=0;tri<triangleCount;tri+=1){
    for(const key of triangleVertexKeys[tri]!){
      const list=keyToTriangles.get(key)??[];
      list.push(tri);
      keyToTriangles.set(key,list);
    }
  }
  const visited=new Set<number>();
  const groups:number[][]=[];
  for(let start=0;start<triangleCount;start+=1){
    if(visited.has(start))continue;
    const group:number[]=[];
    const queue=[start];
    visited.add(start);
    while(queue.length){
      const tri=queue.pop()!;
      group.push(tri);
      for(const key of triangleVertexKeys[tri]!){
        for(const next of keyToTriangles.get(key)??[]){
          if(visited.has(next))continue;
          visited.add(next);
          queue.push(next);
        }
      }
    }
    groups.push(group.sort((a,b)=>a-b));
  }

  return groups.map(group=>{
    const oldToNew=new Map<number,number>();
    const vertices:StageVector3[]=[];
    const indices:number[]=[];
    for(const tri of group){
      for(let k=0;k<3;k+=1){
        const oldIndex=mesh.indices[tri*3+k]!;
        let newIndex=oldToNew.get(oldIndex);
        if(newIndex===undefined){
          newIndex=vertices.length;
          oldToNew.set(oldIndex,newIndex);
          vertices.push(mesh.vertices[oldIndex]!);
        }
        indices.push(newIndex);
      }
    }
    return {vertices,indices};
  });
}
function meshCentroid(mesh:StageTriangleMeshGeometry):StageVector3{
  const n=mesh.vertices.length;
  if(n===0)return [0,0,0];
  const sum=mesh.vertices.reduce(
    (acc,v)=>[acc[0]+v[0],acc[1]+v[1],acc[2]+v[2]] as StageVector3,
    [0,0,0] as StageVector3
  );
  return [sum[0]/n,sum[1]/n,sum[2]/n];
}
function meshYRange(mesh:StageTriangleMeshGeometry):[number,number]{
  const ys=mesh.vertices.map(v=>v[1]);
  return [Math.min(...ys),Math.max(...ys)];
}


function triangleSubsetMesh(
  mesh:StageTriangleMeshGeometry,
  triangleIndices:readonly number[]
):StageTriangleMeshGeometry{
  const oldToNew=new Map<number,number>();
  const vertices:StageVector3[]=[];
  const indices:number[]=[];
  for(const tri of triangleIndices){
    for(let k=0;k<3;k+=1){
      const oldIndex=mesh.indices[tri*3+k]!;
      let newIndex=oldToNew.get(oldIndex);
      if(newIndex===undefined){
        newIndex=vertices.length;
        oldToNew.set(oldIndex,newIndex);
        vertices.push(mesh.vertices[oldIndex]!);
      }
      indices.push(newIndex);
    }
  }
  return {vertices,indices};
}
function triangleVertexKeySet(
  mesh:StageTriangleMeshGeometry,
  triangleIndex:number
):Set<string>{
  const keys=new Set<string>();
  for(let k=0;k<3;k+=1){
    const v=mesh.vertices[mesh.indices[triangleIndex*3+k]!]!;
    keys.add(`${v[0].toFixed(6)},${v[1].toFixed(6)},${v[2].toFixed(6)}`);
  }
  return keys;
}
function sharedVertexCount(a:Set<string>,b:Set<string>):number{
  let count=0;
  for(const key of a)if(b.has(key))count+=1;
  return count;
}
function triangleCentroidLocal(
  mesh:StageTriangleMeshGeometry,
  triangleIndex:number
):StageVector3{
  const a=mesh.vertices[mesh.indices[triangleIndex*3]!]!;
  const b=mesh.vertices[mesh.indices[triangleIndex*3+1]!]!;
  const c=mesh.vertices[mesh.indices[triangleIndex*3+2]!]!;
  return triangleCentroid(a,b,c);
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BU predecessor-bridge shared-component internal suppressor isolation diagnostic',()=>{
  it('tests every triangle and every shared-edge triangle pair inside shared component 0 for suppression sufficiency and necessity under the frozen constructive baseline',()=>{
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
      const bridgeComponents=splitTriangleComponents(fixture.glass[side].bridgeMesh);
      const sharedComponent=bridgeComponents[0];
      if(!sharedComponent)throw new Error(`Pass 18BU shared component 0 missing ${side}`);
      const triangleCount=sharedComponent.indices.length/3;
      expect(triangleCount).toBe(24);

      const baseSolids=[
        navOnlySolid(`pass18bu-source-${side}`,source.mesh),
        navOnlySolid(`pass18bu-target-${side}`,proxy),
        navOnlySolid(`pass18bu-best-${side}`,best.mesh)
      ];
      const baseline=inspectContext(
        `pass18bu-baseline-${side.toLowerCase()}`,
        qaStage(`pass18bu-baseline-${side.toLowerCase()}`,baseSolids),
        source.mesh,target.mesh,proxy,pair.b
      );
      const full=inspectContext(
        `pass18bu-full-component-${side.toLowerCase()}`,
        qaStage(
          `pass18bu-full-component-${side.toLowerCase()}`,
          [...baseSolids,navOnlySolid(`pass18bu-full-${side}`,sharedComponent)]
        ),
        source.mesh,target.mesh,proxy,pair.b
      );

      const summarize=(context:ReturnType<typeof inspectContext>)=>{
        const sourceMutual=context.rawTargetMutualWithSource?.mutual??null;
        const proxyMutual=context.rawTargetMutualWithTargetProxy?.mutual??null;
        return {
          targetSourceDirectTrusted:context.targetSourceDirectTrusted,
          targetProxyDirectTrusted:context.targetProxyDirectTrusted,
          rawTargetProjection:context.rawTargetProjection,
          rawTargetMutualWithSource:sourceMutual,
          rawTargetMutualWithTargetProxy:proxyMutual,
          recreatesFullContextAbsorption:
            sourceMutual===true&&proxyMutual===false,
          restoresConstructiveProxyState:
            sourceMutual===false&&proxyMutual===true
        };
      };

      const triangleRows=Array.from({length:triangleCount},(_,index)=>{
        const single=triangleSubsetMesh(sharedComponent,[index]);
        const retained=triangleSubsetMesh(
          sharedComponent,
          Array.from({length:triangleCount},(_,i)=>i).filter(i=>i!==index)
        );
        const addContext=inspectContext(
          `pass18bu-add-tri-${side.toLowerCase()}-${index}`,
          qaStage(
            `pass18bu-add-tri-${side.toLowerCase()}-${index}`,
            [...baseSolids,navOnlySolid(`pass18bu-tri-${side}-${index}`,single)]
          ),
          source.mesh,target.mesh,proxy,pair.b
        );
        const removeContext=inspectContext(
          `pass18bu-remove-tri-${side.toLowerCase()}-${index}`,
          qaStage(
            `pass18bu-remove-tri-${side.toLowerCase()}-${index}`,
            [...baseSolids,navOnlySolid(`pass18bu-retained-${side}-${index}`,retained)]
          ),
          source.mesh,target.mesh,proxy,pair.b
        );
        return {
          index,
          centroid:triangleCentroidLocal(sharedComponent,index),
          yRange:meshYRange(single),
          addOne:summarize(addContext),
          removeOne:summarize(removeContext)
        };
      });

      const keySets=Array.from({length:triangleCount},(_,i)=>
        triangleVertexKeySet(sharedComponent,i)
      );
      const edgePairs:Array<[number,number]>=[];
      for(let i=0;i<triangleCount;i+=1){
        for(let j=i+1;j<triangleCount;j+=1){
          if(sharedVertexCount(keySets[i]!,keySets[j]!)===2)edgePairs.push([i,j]);
        }
      }
      const pairRows=edgePairs.map(([a,b])=>{
        const pairMesh=triangleSubsetMesh(sharedComponent,[a,b]);
        const retained=triangleSubsetMesh(
          sharedComponent,
          Array.from({length:triangleCount},(_,i)=>i).filter(i=>i!==a&&i!==b)
        );
        const addContext=inspectContext(
          `pass18bu-add-pair-${side.toLowerCase()}-${a}-${b}`,
          qaStage(
            `pass18bu-add-pair-${side.toLowerCase()}-${a}-${b}`,
            [...baseSolids,navOnlySolid(`pass18bu-pair-${side}-${a}-${b}`,pairMesh)]
          ),
          source.mesh,target.mesh,proxy,pair.b
        );
        const removeContext=inspectContext(
          `pass18bu-remove-pair-${side.toLowerCase()}-${a}-${b}`,
          qaStage(
            `pass18bu-remove-pair-${side.toLowerCase()}-${a}-${b}`,
            [...baseSolids,navOnlySolid(`pass18bu-pair-retained-${side}-${a}-${b}`,retained)]
          ),
          source.mesh,target.mesh,proxy,pair.b
        );
        return {
          triangles:[a,b] as const,
          centroid:meshCentroid(pairMesh),
          yRange:meshYRange(pairMesh),
          addPair:summarize(addContext),
          removePair:summarize(removeContext)
        };
      });

      const sufficientTriangles=triangleRows.filter(
        row=>row.addOne.recreatesFullContextAbsorption
      );
      const necessaryTriangles=triangleRows.filter(
        row=>row.removeOne.restoresConstructiveProxyState
      );
      const sufficientPairs=pairRows.filter(
        row=>row.addPair.recreatesFullContextAbsorption
      );
      const necessaryPairs=pairRows.filter(
        row=>row.removePair.restoresConstructiveProxyState
      );

      return [side,{
        bestConstructiveContributorId:bestId,
        sharedComponentIndex:0,
        sharedComponentTriangleCount:triangleCount,
        sharedComponentVertexCount:sharedComponent.vertices.length,
        sharedComponentYRange:meshYRange(sharedComponent),
        baseline:summarize(baseline),
        fullSharedComponent:summarize(full),
        edgeAdjacentPairCount:edgePairs.length,
        sufficientTriangleCount:sufficientTriangles.length,
        necessaryTriangleCount:necessaryTriangles.length,
        sufficientPairCount:sufficientPairs.length,
        necessaryPairCount:necessaryPairs.length,
        sufficientTriangles,
        necessaryTriangles,
        sufficientPairs,
        necessaryPairs,
        triangleRows,
        pairRows
      }];
    }));

    console.log('T21PASS18BU_SHARED_BRIDGE_INTERNAL_ISOLATION',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BT',
      productionConfigUnchanged:true,
      sourceGeometryUnchanged:true,
      diagnosticProxyOnly:true,
      proxyScalingMode:'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      highTargetProxyScale:HIGH_PROXY_SCALE,
      baselineContext:
        'HIGH_SOURCE_PLUS_PROXY_TARGET_PLUS_BEST_CONSTRUCTIVE_CONTRIBUTOR',
      sharedBridgeComponentIndex:0,
      internalSubdivisionModes:[
        'INDIVIDUAL_TRIANGLE',
        'SHARED_EDGE_TRIANGLE_PAIR'
      ],
      experimentModes:[
        'ADD_SUBSET_SUFFICIENCY',
        'FULL_COMPONENT_REMOVE_SUBSET_NECESSITY'
      ],
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      trustedNonLocalEndpointUsed:false,
      productionOffMeshLinkAuthorized:false,
      sides
    }));

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        sharedComponentTriangleCount:number;
        edgeAdjacentPairCount:number;
        baseline:{rawTargetMutualWithSource:boolean|null;rawTargetMutualWithTargetProxy:boolean|null};
        fullSharedComponent:{recreatesFullContextAbsorption:boolean};
      };
      expect(result.sharedComponentTriangleCount).toBe(24);
      expect(result.edgeAdjacentPairCount).toBeGreaterThan(0);
      expect(result.baseline.rawTargetMutualWithSource).toBe(false);
      expect(result.baseline.rawTargetMutualWithTargetProxy).toBe(true);
      expect(result.fullSharedComponent.recreatesFullContextAbsorption).toBe(true);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },240000);
});
