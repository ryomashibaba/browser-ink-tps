import { readFileSync } from 'node:fs';
import type { NavMeshQuery } from 'recast-navigation';
import { beforeAll, describe, expect, it } from 'vitest';
import { PerformanceStats } from '../src/core/PerformanceStats';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
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
  if(!found)throw new Error(`Pass 18BZ missing component ${id}`);
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
  if(!best)throw new Error('Pass 18BZ triangle pair missing');
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
  if(!best)throw new Error('Pass 18BZ empty HIGH mesh pair');
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
function triangleNormal(
  a:StageVector3,b:StageVector3,c:StageVector3
):StageVector3{
  const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]] as StageVector3;
  const ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]] as StageVector3;
  const cross=[
    ab[1]*ac[2]-ab[2]*ac[1],
    ab[2]*ac[0]-ab[0]*ac[2],
    ab[0]*ac[1]-ab[1]*ac[0]
  ] as StageVector3;
  const len=Math.hypot(cross[0],cross[1],cross[2]);
  return len>0?[cross[0]/len,cross[1]/len,cross[2]/len]:[0,0,0];
}
function triangleArea(
  a:StageVector3,b:StageVector3,c:StageVector3
):number{
  const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]] as StageVector3;
  const ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]] as StageVector3;
  return 0.5*Math.hypot(
    ab[1]*ac[2]-ab[2]*ac[1],
    ab[2]*ac[0]-ab[0]*ac[2],
    ab[0]*ac[1]-ab[1]*ac[0]
  );
}
function meshBbox(mesh:StageTriangleMeshGeometry){
  const xs=mesh.vertices.map(v=>v[0]);
  const ys=mesh.vertices.map(v=>v[1]);
  const zs=mesh.vertices.map(v=>v[2]);
  return {
    min:[Math.min(...xs),Math.min(...ys),Math.min(...zs)] as StageVector3,
    max:[Math.max(...xs),Math.max(...ys),Math.max(...zs)] as StageVector3
  };
}
function pointInTriangleXZ(
  p:StageVector3,a:StageVector3,b:StageVector3,c:StageVector3
):boolean{
  const px=p[0],pz=p[2];
  const ax=a[0],az=a[2],bx=b[0],bz=b[2],cx=c[0],cz=c[2];
  const d1=(px-bx)*(az-bz)-(ax-bx)*(pz-bz);
  const d2=(px-cx)*(bz-cz)-(bx-cx)*(pz-cz);
  const d3=(px-ax)*(cz-az)-(cx-ax)*(pz-az);
  const eps=1e-9;
  const hasNeg=d1<-eps||d2<-eps||d3<-eps;
  const hasPos=d1>eps||d2>eps||d3>eps;
  return !(hasNeg&&hasPos);
}
function pointInMeshXZ(
  point:StageVector3,
  mesh:StageTriangleMeshGeometry
):boolean{
  for(let i=0;i<mesh.indices.length;i+=3){
    const a=mesh.vertices[mesh.indices[i]!]!;
    const b=mesh.vertices[mesh.indices[i+1]!]!;
    const c=mesh.vertices[mesh.indices[i+2]!]!;
    if(pointInTriangleXZ(point,a,b,c))return true;
  }
  return false;
}
function xzBboxOverlap(a:StageTriangleMeshGeometry,b:StageTriangleMeshGeometry){
  const aa=meshBbox(a),bb=meshBbox(b);
  const overlapX=Math.max(0,Math.min(aa.max[0],bb.max[0])-Math.max(aa.min[0],bb.min[0]));
  const overlapZ=Math.max(0,Math.min(aa.max[2],bb.max[2])-Math.max(aa.min[2],bb.min[2]));
  return {
    overlapX,overlapZ,
    overlaps:overlapX>0&&overlapZ>0,
    rectangleArea:overlapX*overlapZ
  };
}


function reversedWinding(mesh:StageTriangleMeshGeometry):StageTriangleMeshGeometry{
  const indices:number[]=[];
  for(let i=0;i<mesh.indices.length;i+=3){
    indices.push(mesh.indices[i]!,mesh.indices[i+2]!,mesh.indices[i+1]!);
  }
  return {vertices:[...mesh.vertices],indices};
}
function degenerateBoundsProxy(mesh:StageTriangleMeshGeometry):StageTriangleMeshGeometry{
  const bbox=meshBbox(mesh);
  const a=bbox.min;
  const b=bbox.max;
  return {
    vertices:[a,b,a],
    indices:[0,1,2]
  };
}
function combinedBbox(meshes:readonly StageTriangleMeshGeometry[]){
  const vertices=meshes.flatMap(mesh=>mesh.vertices);
  return {
    min:[
      Math.min(...vertices.map(v=>v[0])),
      Math.min(...vertices.map(v=>v[1])),
      Math.min(...vertices.map(v=>v[2]))
    ] as StageVector3,
    max:[
      Math.max(...vertices.map(v=>v[0])),
      Math.max(...vertices.map(v=>v[1])),
      Math.max(...vertices.map(v=>v[2]))
    ] as StageVector3
  };
}
function gridSignature(meshes:readonly StageTriangleMeshGeometry[]){
  const bbox=combinedBbox(meshes);
  const cs=GAME_CONFIG.cpu.navigationCellSizeMeters;
  const ch=GAME_CONFIG.cpu.navigationCellHeightMeters;
  return {
    bbox,
    cs,ch,
    widthCells:Math.floor((bbox.max[0]-bbox.min[0])/cs+0.5),
    depthCells:Math.floor((bbox.max[2]-bbox.min[2])/cs+0.5),
    heightVoxels:Math.floor((bbox.max[1]-bbox.min[1])/ch+0.5)
  };
}

type ActiveAxis='X'|'Z';
function activeAxisIndex(axis:ActiveAxis):0|2{
  return axis==='X'?0:2;
}
function activeAxisMinBoundsProxy(
  baseMeshes:readonly StageTriangleMeshGeometry[],
  axis:ActiveAxis,
  minMeters:number
):StageTriangleMeshGeometry{
  const base=combinedBbox(baseMeshes);
  const index=activeAxisIndex(axis);
  const center:StageVector3=[
    (base.min[0]+base.max[0])/2,
    (base.min[1]+base.max[1])/2,
    (base.min[2]+base.max[2])/2
  ];
  const a=[...center] as StageVector3;
  const b=[...center] as StageVector3;
  a[index]=minMeters;
  b[index]=(base.min[index]+base.max[index])/2;
  return {vertices:[a,b,a],indices:[0,1,2]};
}
function activeAxisCellCount(
  grid:ReturnType<typeof gridSignature>,
  axis:ActiveAxis
):number{
  return axis==='X'?grid.widthCells:grid.depthCells;
}
beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BZ fixed-cell active-min phase sweep diagnostic',()=>{
  it('maps the sub-cell grid-origin transition while holding the enlarged active-axis cell count fixed',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const sweepStepMeters=0.005;
    const sweepMaxMeters=0.080;
    const sweepDeltas=Array.from(
      {length:Math.round(sweepMaxMeters/sweepStepMeters)+1},
      (_,index)=>Number((index*sweepStepMeters).toFixed(3))
    );

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const route=fixture.pass18g.routes.glass[side];
      const source=componentById(route.components,IDS[side].highSource);
      const target=componentById(route.components,IDS[side].highTarget);
      const best=componentById(route.components,BEST_CONSTRUCTIVE_CONTRIBUTOR_IDS[side]);
      const proxy=scaledProxyMesh(
        target.mesh,CLEARANCE_CENTERS_XZ[side],HIGH_PROXY_SCALE
      );
      const physicalPair=closestMeshPair(source.mesh,target.mesh);
      const components=splitTriangleComponents(fixture.glass[side].bridgeMesh);
      const shared=components[0];
      if(!shared)throw new Error(`Pass 18BZ shared component missing ${side}`);
      const topCap=triangleSubsetMesh(shared,[4,5]);

      const baseMeshes=[source.mesh,proxy,best.mesh] as const;
      const baseSolids=[
        navOnlySolid(`pass18bz-source-${side}`,source.mesh),
        navOnlySolid(`pass18bz-target-${side}`,proxy),
        navOnlySolid(`pass18bz-best-${side}`,best.mesh)
      ];
      const inspect=(label:string,extraMesh:StageTriangleMeshGeometry|null)=>{
        const solids=extraMesh
          ? [...baseSolids,navOnlySolid(`pass18bz-${label}-${side}`,extraMesh)]
          : baseSolids;
        const context=inspectContext(
          `pass18bz-${label}-${side.toLowerCase()}`,
          qaStage(`pass18bz-${label}-${side.toLowerCase()}`,solids),
          source.mesh,target.mesh,proxy,physicalPair.b
        );
        return {
          rawTargetProjection:context.rawTargetProjection,
          rawTargetMutualWithSource:context.rawTargetMutualWithSource?.mutual??null,
          rawTargetMutualWithTargetProxy:context.rawTargetMutualWithTargetProxy?.mutual??null,
          grid:gridSignature(extraMesh?[...baseMeshes,extraMesh]:baseMeshes)
        };
      };
      const absorbs=(result:ReturnType<typeof inspect>)=>
        result.rawTargetMutualWithSource===true&&
        result.rawTargetMutualWithTargetProxy===false;

      const activeAxis:ActiveAxis=side==='POSITIVE_Z'?'Z':'X';
      const axisIndex=activeAxisIndex(activeAxis);
      const baseBbox=combinedBbox(baseMeshes);
      const topCapBbox=meshBbox(topCap);
      const baselineActiveMinMeters=baseBbox.min[axisIndex];
      const actualActiveMinMeters=topCapBbox.min[axisIndex];
      const activeMinShiftMeters=baselineActiveMinMeters-actualActiveMinMeters;
      const cellSizeMeters=GAME_CONFIG.cpu.navigationCellSizeMeters;
      const integerCellShiftCount=Math.floor(
        activeMinShiftMeters/cellSizeMeters+1e-9
      );
      const integerCellShiftMeters=integerCellShiftCount*cellSizeMeters;
      const actualPhaseRemainderMeters=
        activeMinShiftMeters-integerCellShiftMeters;
      const extentOnlyActiveMinMeters=
        baselineActiveMinMeters-integerCellShiftMeters;

      const baseline=inspect('baseline',null);
      const extentOnly=inspect(
        'extent-only',
        activeAxisMinBoundsProxy(
          baseMeshes,activeAxis,extentOnlyActiveMinMeters
        )
      );
      const actualPhase=inspect(
        'actual-phase',
        activeAxisMinBoundsProxy(
          baseMeshes,activeAxis,
          extentOnlyActiveMinMeters-actualPhaseRemainderMeters
        )
      );
      const fixedCellCount=activeAxisCellCount(extentOnly.grid,activeAxis);
      const sweep=sweepDeltas.map(deltaMeters=>{
        const result=inspect(
          `phase-${deltaMeters.toFixed(3)}`,
          activeAxisMinBoundsProxy(
            baseMeshes,activeAxis,extentOnlyActiveMinMeters-deltaMeters
          )
        );
        return {
          deltaMeters,
          activeMinMeters:extentOnlyActiveMinMeters-deltaMeters,
          activeCells:activeAxisCellCount(result.grid,activeAxis),
          rawTargetPolyRef:result.rawTargetProjection.polyRef,
          rawTargetSnapMeters:result.rawTargetProjection.snapMeters,
          rawTargetMutualWithSource:result.rawTargetMutualWithSource,
          rawTargetMutualWithTargetProxy:result.rawTargetMutualWithTargetProxy,
          absorbs:absorbs(result)
        };
      });
      const absorbingSweepDeltasMeters=sweep
        .filter(sample=>sample.absorbs)
        .map(sample=>sample.deltaMeters);
      const transitions=sweep.slice(1).flatMap((sample,index)=>{
        const previous=sweep[index]!;
        return previous.absorbs===sample.absorbs?[]:[{
          fromDeltaMeters:previous.deltaMeters,
          toDeltaMeters:sample.deltaMeters,
          fromAbsorbs:previous.absorbs,
          toAbsorbs:sample.absorbs
        }];
      });
      const allSweepSamplesKeepFixedCellCount=sweep.every(
        sample=>sample.activeCells===fixedCellCount
      );

      return [side,{
        physicalHighBoundaryDistanceMeters:physicalPair.distanceMeters,
        activeAxis,
        cellSizeMeters,
        sweepStepMeters,
        sweepMaxMeters,
        baselineActiveMinMeters,
        extentOnlyActiveMinMeters,
        actualActiveMinMeters,
        integerCellShiftCount,
        integerCellShiftMeters,
        actualPhaseRemainderMeters,
        fixedCellCount,
        baselineCellCount:activeAxisCellCount(baseline.grid,activeAxis),
        baselineAbsorbs:absorbs(baseline),
        extentOnlyAbsorbs:absorbs(extentOnly),
        actualPhaseAbsorbs:absorbs(actualPhase),
        actualPhaseRawTargetPolyRef:actualPhase.rawTargetProjection.polyRef,
        allSweepSamplesKeepFixedCellCount,
        sweep,
        absorbingSweepDeltasMeters,
        transitionCount:transitions.length,
        transitions
      }];
    }));

    console.log('T21PASS18BZ_ACTIVE_MIN_PHASE_SWEEP',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BY',
      productionConfigUnchanged:true,
      sourceGeometryUnchanged:true,
      diagnosticProxyOnly:true,
      highTargetProxyScale:HIGH_PROXY_SCALE,
      sharedBridgeComponentIndex:0,
      sharedTopCapTriangles:[4,5],
      sweepStepMeters,
      sweepMaxMeters,
      globalRecastSettingsChanged:false,
      broadFrontierLinkAuthorized:false,
      trustedNonLocalEndpointUsed:false,
      productionOffMeshLinkAuthorized:false,
      sides
    }));

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        cellSizeMeters:number;
        sweepStepMeters:number;
        sweepMaxMeters:number;
        actualPhaseRemainderMeters:number;
        fixedCellCount:number;
        baselineCellCount:number;
        baselineAbsorbs:boolean;
        extentOnlyAbsorbs:boolean;
        actualPhaseAbsorbs:boolean;
        allSweepSamplesKeepFixedCellCount:boolean;
        sweep:readonly {deltaMeters:number;activeCells:number}[];
      };
      expect(result.cellSizeMeters).toBe(0.18);
      expect(result.sweepStepMeters).toBe(0.005);
      expect(result.sweepMaxMeters).toBe(0.080);
      expect(result.actualPhaseRemainderMeters).toBeGreaterThan(0);
      expect(result.actualPhaseRemainderMeters).toBeLessThan(result.sweepMaxMeters);
      expect(result.fixedCellCount).toBeGreaterThan(result.baselineCellCount);
      expect(result.baselineAbsorbs).toBe(false);
      expect(result.extentOnlyAbsorbs).toBe(false);
      expect(result.actualPhaseAbsorbs).toBe(true);
      expect(result.allSweepSamplesKeepFixedCellCount).toBe(true);
      expect(result.sweep).toHaveLength(17);
      expect(result.sweep[0]?.deltaMeters).toBe(0);
      expect(result.sweep.at(-1)?.deltaMeters).toBe(0.080);
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
