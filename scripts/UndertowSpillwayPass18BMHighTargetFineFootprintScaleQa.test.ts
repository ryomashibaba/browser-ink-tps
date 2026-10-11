import { readFileSync } from 'node:fs';
import { NavMeshQuery } from 'recast-navigation';
import { generateSoloNavMesh } from 'recast-navigation/generators';
import { beforeAll, describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../src/config/game/gameConfig';
import { initializeRecastNavigation } from '../src/navigation/RecastStageNavigation';
import {
  PRODUCTION_STAGE_DEFINITION,
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
const TARGET_IDS:Record<Side,string>={
  POSITIVE_Z:
    'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c5',
  NEGATIVE_Z:
    'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c11'
};
const CLEARANCE_CENTERS_XZ:Record<Side,readonly [number,number]>={
  POSITIVE_Z:[-7.988395442411672,26.360607976493593],
  NEGATIVE_Z:[11.727375983212928,-27.076627408486683]
};
const BASE_CLEARANCE_METERS=0.42781092520205705;
const NOMINAL_EROSION_METERS=0.36;
const SCALE_FACTORS=[
  1.200,1.205,1.210,1.215,1.220,1.225,
  1.230,1.235,1.240,1.245,1.250
] as const;
const TRUSTED_SNAP_METERS=0.30;

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
  if(!found)throw new Error(`Pass 18BM missing component ${id}`);
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
function generateProductionProxyVariant(
  sourceMesh:StageTriangleMeshGeometry,
  centerXZ:readonly [number,number],
  scale:number
){
  const proxyMesh=scaledProxyMesh(sourceMesh,centerXZ,scale);
  const positions=proxyMesh.vertices.flatMap(v=>[v[0],v[1],v[2]]);
  const indices=[...proxyMesh.indices];
  const generated=generateSoloNavMesh(positions,indices,{
    cs:GAME_CONFIG.cpu.navigationCellSizeMeters,
    ch:GAME_CONFIG.cpu.navigationCellHeightMeters,
    walkableSlopeAngle:GAME_CONFIG.cpu.navigationMaxSlopeDegrees,
    walkableHeight:GAME_CONFIG.cpu.navigationWalkableHeightVoxels,
    walkableClimb:GAME_CONFIG.cpu.navigationWalkableClimbVoxels,
    walkableRadius:GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
    maxEdgeLen:24,
    maxSimplificationError:1.1,
    minRegionArea:3,
    mergeRegionArea:8,
    maxVertsPerPoly:6,
    detailSampleDist:6,
    detailSampleMaxError:1,
    offMeshConnections:[]
  });
  const predictedClearanceMeters=BASE_CLEARANCE_METERS*scale;
  const predictedResidualAfterErosionMeters=
    predictedClearanceMeters-NOMINAL_EROSION_METERS;
  const equivalentRadialExpansionAtClearancePointMeters=
    BASE_CLEARANCE_METERS*(scale-1);
  if(!generated.success){
    return {
      scale,
      predictedClearanceMeters,
      predictedResidualAfterErosionMeters,
      equivalentRadialExpansionAtClearancePointMeters,
      success:false,
      error:generated.error,
      sourceDirectTrusted:false,
      sourceDirectRepresentative:null,
      proxyDirectTrusted:false,
      proxyDirectRepresentative:null
    };
  }
  const query=new NavMeshQuery(generated.navMesh);
  const sourceDirect=directTrustedRepresentative(query,sourceMesh);
  const proxyDirect=directTrustedRepresentative(query,proxyMesh);
  return {
    scale,
    predictedClearanceMeters,
    predictedResidualAfterErosionMeters,
    equivalentRadialExpansionAtClearancePointMeters,
    success:true,
    error:null,
    sourceDirectTrusted:sourceDirect!==null,
    sourceDirectRepresentative:sourceDirect,
    proxyDirectTrusted:proxyDirect!==null,
    proxyDirectRepresentative:proxyDirect
  };
}

beforeAll(async()=>{await initializeRecastNavigation();});

describe('T21 Pass 18BM HIGH target fine local-footprint scale sweep',()=>{
  it('expands only a QA nav proxy around the Pass 18BK clearance center while keeping production Recast settings and source geometry unchanged',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    expect(GAME_CONFIG.cpu.navigationCellSizeMeters).toBe(0.18);
    expect(GAME_CONFIG.cpu.navigationWalkableRadiusVoxels).toBe(2);
    if(!fixturePath)return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(side=>{
      const route=fixture.pass18g.routes.glass[side];
      const target=componentById(route.components,TARGET_IDS[side]);
      const variants=SCALE_FACTORS.map(scale=>
        generateProductionProxyVariant(
          target.mesh,
          CLEARANCE_CENTERS_XZ[side],
          scale
        )
      );
      const firstSourceDirectTrusted=variants.find(
        variant=>variant.success&&variant.sourceDirectTrusted
      )??null;
      return [side,{
        targetId:target.id,
        targetMaterial:target.sourceMaterial??null,
        targetYRange:target.yRange??null,
        clearanceCenterXZ:CLEARANCE_CENTERS_XZ[side],
        variants,
        firstSourceDirectTrusted
      }];
    }));

    console.log('T21PASS18BM_HIGH_TARGET_FINE_FOOTPRINT_SCALE',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      gameplayDirectionalityResolved:false,
      gameplayJumpRequirementResolved:false,
      sourcePass:'18BL',
      coarseScaleBracket:[1.20,1.25],
      productionConfigUnchanged:true,
      sourceGeometryUnchanged:true,
      diagnosticProxyOnly:true,
      proxyScalingMode:'XZ_UNIFORM_ABOUT_BK_CLEARANCE_CENTER',
      productionCellSizeMeters:GAME_CONFIG.cpu.navigationCellSizeMeters,
      productionWalkableRadiusVoxels:GAME_CONFIG.cpu.navigationWalkableRadiusVoxels,
      nominalPhysicalErosionRadiusMeters:NOMINAL_EROSION_METERS,
      baseClearanceMeters:BASE_CLEARANCE_METERS,
      scaleFactors:SCALE_FACTORS,
      sides
    }));

    for(const side of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const result=sides[side] as {
        variants:Array<{
          scale:number;
          success:boolean;
          sourceDirectTrusted:boolean;
          predictedClearanceMeters:number;
          predictedResidualAfterErosionMeters:number;
          equivalentRadialExpansionAtClearancePointMeters:number;
        }>;
      };
      expect(result.variants).toHaveLength(SCALE_FACTORS.length);
      expect(result.variants[0]!.scale).toBe(1.20);
      expect(result.variants[0]!.success).toBe(false);
      expect(result.variants[0]!.sourceDirectTrusted).toBe(false);
      expect(result.variants[result.variants.length-1]!.scale).toBe(1.25);
      expect(result.variants[result.variants.length-1]!.success).toBe(true);
      expect(result.variants[result.variants.length-1]!.sourceDirectTrusted).toBe(true);
      for(const variant of result.variants){
        expect(Number.isFinite(variant.predictedClearanceMeters)).toBe(true);
        expect(Number.isFinite(variant.predictedResidualAfterErosionMeters)).toBe(true);
        expect(Number.isFinite(
          variant.equivalentRadialExpansionAtClearancePointMeters
        )).toBe(true);
      }
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  },180000);
});
