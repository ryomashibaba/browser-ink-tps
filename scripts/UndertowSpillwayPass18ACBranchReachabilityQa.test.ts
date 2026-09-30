import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_STAGE_DEFINITION } from '../src/stage/StageDefinition';
import { UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY } from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';

type Side='POSITIVE_Z'|'NEGATIVE_Z';

interface ChainComponent {
  id:string;
  sourceMaterial:string;
  yRange:[number,number];
}
interface ChainEdge {
  a:string;
  b:string;
  distanceMeters:number;
}
interface ChainSideFixture {
  startComponentId:string;
  excludedBacktrackComponentIds:string[];
  components:ChainComponent[];
  edges:ChainEdge[];
}
interface Fixture {
  version:'PASS18C_SOURCE_NATIVE_V1';
  diagnosticOnly:true;
  runtimePromotionAuthorized:false;
  pass18g:{
    routes:{
      glass:Record<Side,ChainSideFixture>;
    };
  };
}

const fixturePath=process.env.T21_PASS18C_SOURCE_JSON??'';
const EPS=1e-9;
const THRESHOLDS=[0.60,0.85,1.00,1.50,2.00] as const;

const SEEDS:Record<Side,string>={
  POSITIVE_Z:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c7',
  NEGATIVE_Z:'Fld_Temple01_pCube20989_1__FloorConcrete02|Fld_Temple01_FloorConcrete02|c13'
};
const CANDIDATES:Record<Side,readonly string[]>={
  POSITIVE_Z:[
    'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c61',
    'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c3',
    'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c59'
  ],
  NEGATIVE_Z:[
    'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c86',
    'Fld_Temple01_pCube21000_1__FloorSlope00|Fld_Temple01_FloorSlope00|c23',
    'Fld_Temple01_mesh69_low_10__BridgeMetal00|Fld_Temple01_BridgeMetal00|c87'
  ]
};

function materialLeaf(material:string):string{
  return material.replace(/^Fld_Temple01_/,'').replace(/^FldObj_Temple01_PntSet_/,'');
}

function adjacency(
  side:ChainSideFixture,
  threshold:number,
  excluded:ReadonlySet<string>
):Map<string,string[]>{
  const result=new Map<string,string[]>();
  for(const component of side.components){
    if(!excluded.has(component.id)) result.set(component.id,[]);
  }
  for(const edge of side.edges){
    if(edge.distanceMeters>threshold+EPS) continue;
    if(excluded.has(edge.a)||excluded.has(edge.b)) continue;
    result.get(edge.a)?.push(edge.b);
    result.get(edge.b)?.push(edge.a);
  }
  return result;
}

function reachable(
  side:ChainSideFixture,
  seed:string,
  threshold:number,
  excluded:ReadonlySet<string>
):string[]{
  if(excluded.has(seed)) return [];
  const graph=adjacency(side,threshold,excluded);
  if(!graph.has(seed)) return [];
  const seen=new Set<string>([seed]);
  const queue=[seed];
  while(queue.length){
    const current=queue.shift()!;
    for(const next of graph.get(current)??[]){
      if(seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return [...seen].sort();
}

function summarize(
  side:ChainSideFixture,
  ids:readonly string[]
){
  const byId=new Map(side.components.map(component=>[component.id,component] as const));
  const components=ids.map(id=>{
    const component=byId.get(id);
    if(!component) throw new Error(`Pass 18AC missing component ${id}`);
    return component;
  });
  const byMaterial=Object.fromEntries(
    [...new Set(components.map(component=>materialLeaf(component.sourceMaterial)))]
      .sort()
      .map(material=>[
        material,
        components.filter(component=>materialLeaf(component.sourceMaterial)===material).length
      ])
  );
  return {
    componentCount:components.length,
    byMaterial,
    yMin:components.length?Math.min(...components.map(component=>component.yRange[0])):null,
    yMax:components.length?Math.max(...components.map(component=>component.yRange[1])):null,
    floorSlopeCount:components.filter(component=>materialLeaf(component.sourceMaterial)==='FloorSlope00').length,
    floorConcreteCount:components.filter(component=>materialLeaf(component.sourceMaterial).startsWith('FloorConcrete')).length,
    bridgeMetalCount:components.filter(component=>materialLeaf(component.sourceMaterial)==='BridgeMetal00').length,
    reachesYAtOrBelow3:components.some(component=>component.yRange[0]<=3+EPS),
    reachesYAtOrBelow15:components.some(component=>component.yRange[0]<=1.5+EPS)
  };
}

describe('T21 Pass 18AC three-way upper-glass downstream branch classification',()=>{
  it('classifies each ~0.518559m branch without allowing backtracking through the Pass 18AA FloorConcrete02 seed',()=>{
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
    if(!fixturePath) return;

    const fixture=JSON.parse(readFileSync(fixturePath,'utf8')) as Fixture;
    expect(fixture.version).toBe('PASS18C_SOURCE_NATIVE_V1');
    expect(fixture.diagnosticOnly).toBe(true);
    expect(fixture.runtimePromotionAuthorized).toBe(false);

    const sides=Object.fromEntries((['POSITIVE_Z','NEGATIVE_Z'] as const).map(sideName=>{
      const side=fixture.pass18g.routes.glass[sideName];
      const seed=SEEDS[sideName];
      const candidates=CANDIDATES[sideName];
      const ids=new Set(side.components.map(component=>component.id));
      expect(ids.has(seed)).toBe(true);
      for(const candidate of candidates) expect(ids.has(candidate)).toBe(true);

      const excluded=new Set<string>([seed]);
      const branches=candidates.map(candidateId=>{
        const component=side.components.find(entry=>entry.id===candidateId)!;
        const thresholdResults=Object.fromEntries(THRESHOLDS.map(threshold=>{
          const reachableIds=reachable(side,candidateId,threshold,excluded);
          return [threshold.toFixed(2),{
            ...summarize(side,reachableIds),
            containsOtherCandidateIds:candidates.filter(
              id=>id!==candidateId&&reachableIds.includes(id)
            ),
            reachableIds
          }];
        }));
        return {
          candidateId,
          candidateMaterial:materialLeaf(component.sourceMaterial),
          candidateYRange:component.yRange,
          thresholdResults
        };
      });

      return [sideName,{
        seedId:seed,
        seedExcludedFromTraversal:true,
        candidateCount:candidates.length,
        branches
      }];
    }));

    console.log('T21PASS18AC_BRANCH_REACHABILITY',JSON.stringify({
      diagnosticOnly:true,
      runtimePromotionAuthorized:false,
      thresholdsMeters:THRESHOLDS,
      sides
    }));

    for(const sideName of ['POSITIVE_Z','NEGATIVE_Z'] as const){
      const side=sides[sideName] as {
        candidateCount:number;
        branches:Array<{
          thresholdResults:Record<string,{componentCount:number}>
        }>;
      };
      expect(side.candidateCount).toBe(3);
      expect(side.branches).toHaveLength(3);
      for(const branch of side.branches){
        expect(branch.thresholdResults['0.60']!.componentCount).toBeGreaterThanOrEqual(1);
        expect(branch.thresholdResults['2.00']!.componentCount)
          .toBeGreaterThanOrEqual(branch.thresholdResults['0.60']!.componentCount);
      }
    }
    expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
    expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  });
});
