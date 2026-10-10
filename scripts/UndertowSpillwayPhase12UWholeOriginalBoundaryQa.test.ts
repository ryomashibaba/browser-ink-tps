import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';

const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const labels=['OTHER_SOURCE_ORIGINAL_OBJ_ID_SHARED_EDGE',
 'OTHER_SOURCE_EXACT_XYZ_EDGE_DISTINCT_OBJ_IDS','NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES'] as const;
type Label=typeof labels[number];
type Row={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
 originalProjectedXYZ:number[][];priorHeld28Classification:string;
 wholeOriginalClassification:Label;wholeOriginalXYZEdgeWitnessCount:number;
 wholeOriginalOBJIDEdgeWitnessCount:number;
 wholeOriginalWitnessesFirst8:{originalFaceIndex:number;originalOBJVertexIds:number[];
  sourceObject:string;sourceMaterial:string;exactOriginalOBJVertexIDEdge:boolean}[];
 sourceOnly:boolean;gameplayAuthority:string};
type TRow={minFace:number;mirrorMinFace:number;boundary:number;
 originalBoundaryEvidence:{sourceFace:number;originalOBJEdge:number[];
 originalXYZ:number[][];classification:string}[]};
type U={version:string;originalSourceSHA256:string;originalActiveFacesParsed:number;
 sourceOnly:boolean;reviewOnly:boolean;runtimePromotionAuthorized:boolean;
 physicalWeldOrWalkableFloorProven:boolean;closedMeshOrGameplayAuthorized:boolean;
 sourceOriginalComponents:number;sourceOriginalFaces:number;sourceOriginalBoundaryEdges:number;
 priorHeld28Unmatched:number;priorHeld28Matched:number;searchedFacesBeyondShown:number;
 otherOptInSourceComponentsSearched:boolean;ownOriginalComponentExcludedPerBoundary:boolean;
 counters:Record<string,number>;perPart:{minFace:number;mirrorMinFace:number;
  boundary:number;counts:Record<string,number>}[];rows:Row[]};
const edge=(ids:readonly number[])=>[...ids].sort((a,b)=>a-b).join(':');
const geo=(p:readonly number[][])=>p.map(x=>x.map(n=>Object.is(n,-0)?0:n).join(',')).sort().join('|');
describe('T21 Phase12U full SHA-pinned Temple01 original-edge evidence-only gate',()=>{
 it('freezes production, T21 inactive, all original source-only 22/488 and 64/42',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  for(const p of all){
   expect(p.reviewOnly).toBe(true);expect(p.runtimePromotionAuthorized).toBe(false);
   expect(p.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');
  }
 });
 it('synthetically separates original ID, XYZ coincidence and edge direction',()=>{
  expect(edge([9,2])).toBe('2:9');
  expect(geo([[1,-0,0],[2,0,0]])).toBe(geo([[2,0,0],[1,0,0]]));
  expect(new Set(labels).size).toBe(3);
 });
 it('requires full 70396 source evidence in dedicated gate and checks 524 edges',()=>{
  const p=process.env.T21_PHASE12U_REPORT_INPUT;
  const t=process.env.T21_PHASE12T_REPORT_INPUT;
  if(!p&&!t){
   if(process.env.T21_PHASE12U_REQUIRED==='1')
    throw Error('PHASE12U_PINNED_FULL_SOURCE_GATE_REQUIRED');
   return;
  }
  if(!p||!t||!existsSync(p)||!existsSync(t))
   throw Error('PHASE12U_PINNED_FULL_SOURCE_OR_T_REPORT_MISSING');
  const u=JSON.parse(readFileSync(p,'utf8')) as U;
  const prev=JSON.parse(readFileSync(t,'utf8')) as {
   originalSourceSHA256:string;originalComponents:number;originalFaces:number;
   originalBoundaryEdges:number;exactXYZSeparateOBJIDMatches:number;
   noExactEdgeInHeld28:number;reports:TRow[]};
  expect(prev.originalSourceSHA256).toBe(PIN);
  expect(prev.originalComponents).toBe(22);expect(prev.originalFaces).toBe(488);
  expect(prev.originalBoundaryEdges).toBe(524);
  expect(prev.exactXYZSeparateOBJIDMatches).toBe(176);
  expect(prev.noExactEdgeInHeld28).toBe(348);
  expect(u.originalSourceSHA256).toBe(PIN);
  expect(u.version).toBe('T21_PHASE12U_FULL_70396_ORIGINAL_ACTIVE_FACE_EDGE_SURVEY_V1');
  expect(u.originalActiveFacesParsed).toBe(70396);
  expect(u.sourceOnly).toBe(true);expect(u.reviewOnly).toBe(true);
  expect(u.runtimePromotionAuthorized).toBe(false);
  expect(u.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(u.closedMeshOrGameplayAuthorized).toBe(false);
  expect(u.sourceOriginalComponents).toBe(22);
  expect(u.sourceOriginalFaces).toBe(488);
  expect(u.sourceOriginalBoundaryEdges).toBe(524);
  expect(u.priorHeld28Matched).toBe(176);
  expect(u.priorHeld28Unmatched).toBe(348);
  expect(u.searchedFacesBeyondShown).toBe(70396-488);
  expect(u.otherOptInSourceComponentsSearched).toBe(true);
  expect(u.ownOriginalComponentExcludedPerBoundary).toBe(true);
  expect(u.rows).toHaveLength(524);
  expect(u.perPart).toHaveLength(22);
  const classes=new Set<string>(labels);
  const counter=new Map<string,number>();
  const index=new Map<string,Row>();
  for(const r of u.rows){
   expect(classes.has(r.wholeOriginalClassification)).toBe(true);
   expect(r.sourceOnly).toBe(true);expect(r.gameplayAuthority).toBe('NONE');
   expect(r.originalOBJVertexIds).toHaveLength(2);
   expect(r.originalProjectedXYZ).toHaveLength(2);
   expect(r.originalProjectedXYZ.every(x=>x.length===3&&x.every(Number.isFinite))).toBe(true);
   const k=r.sourcePartMinFace+':'+r.sourceFace+':'+edge(r.originalOBJVertexIds);
   expect(index.has(k)).toBe(false);index.set(k,r);
   counter.set(r.wholeOriginalClassification,(counter.get(r.wholeOriginalClassification)||0)+1);
   if(r.wholeOriginalClassification==='NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES'){
    expect(r.wholeOriginalXYZEdgeWitnessCount).toBe(0);
    expect(r.wholeOriginalOBJIDEdgeWitnessCount).toBe(0);
    expect(r.wholeOriginalWitnessesFirst8).toHaveLength(0);
   }else{
    expect(r.wholeOriginalXYZEdgeWitnessCount).toBeGreaterThan(0);
    expect(r.wholeOriginalWitnessesFirst8.length).toBeGreaterThan(0);
    expect(r.wholeOriginalWitnessesFirst8.length).toBeLessThanOrEqual(8);
    if(r.wholeOriginalClassification==='OTHER_SOURCE_ORIGINAL_OBJ_ID_SHARED_EDGE')
     expect(r.wholeOriginalOBJIDEdgeWitnessCount).toBeGreaterThan(0);
    else expect(r.wholeOriginalOBJIDEdgeWitnessCount).toBe(0);
   }
   for(const w of r.wholeOriginalWitnessesFirst8){
    expect(w.originalFaceIndex).toBeGreaterThanOrEqual(0);
    expect(w.originalFaceIndex).toBeLessThan(70396);
    expect(w.originalOBJVertexIds).toHaveLength(2);
    expect(w.exactOriginalOBJVertexIDEdge).toBe(edge(w.originalOBJVertexIds)===edge(r.originalOBJVertexIds));
   }
  }
  expect(index.size).toBe(524);
  for(const label of labels)expect(u.counters[label]||0).toBe(counter.get(label)||0);
  expect(labels.reduce((s,l)=>s+(u.counters[l]||0),0)).toBe(524);
  expect(prev.reports).toHaveLength(22);
  for(const part of prev.reports){
   const summary=u.perPart.find(s=>s.minFace===part.minFace);
   expect(summary).toBeDefined();
   expect(summary!.mirrorMinFace).toBe(part.mirrorMinFace);
   expect(summary!.boundary).toBe(part.boundary);
   expect(Object.values(summary!.counts).reduce((x,y)=>x+y,0)).toBe(part.boundary);
   for(const row of part.originalBoundaryEvidence){
    const k=part.minFace+':'+row.sourceFace+':'+edge(row.originalOBJEdge);
    const cur=index.get(k);
    expect(cur).toBeDefined();
    expect(cur!.priorHeld28Classification).toBe(row.classification);
    expect(geo(cur!.originalProjectedXYZ)).toBe(geo(row.originalXYZ));
    if(row.classification==='EXACT_XYZ_EDGE_SEPARATE_OBJ_IDS')
     expect(cur!.wholeOriginalClassification).not.toBe('NO_EXACT_EDGE_IN_FULL_ORIGINAL_ACTIVE_FACES');
   }
  }
  console.log('T21_PHASE12U_EVIDENCE_PASS',JSON.stringify({
   originalSourceFaces:70396,edges:524,counts:u.counters}));
 });
});
