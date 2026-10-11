import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {PRODUCTION_STAGE_DEFINITION} from '../src/stage/StageDefinition';
import {UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY} from '../src/stage/undertow/UndertowSpillwayBlockoutGeometry';
import {UNDERTOW_T21_COVERAGE_LEDGER_V3} from '../src/stage/undertow/UndertowSpillwayCoverageLedgerV3';
import {UNDERTOW_T21_MACRO_OUTER_BOUNDARY} from '../src/stage/undertow/UndertowSpillwayMacroCoverage';
import {UNDERTOW_T21_PHASE12I_ORIGINAL_BROAD_PILLARS as I} from '../src/stage/undertow/UndertowSpillwayPhase12IOriginalBroadPillars';
import {UNDERTOW_T21_PHASE12K_ORIGINAL_PILLAR_NEIGHBORS as K} from '../src/stage/undertow/UndertowSpillwayPhase12KOriginalPillarNeighbors';
import {UNDERTOW_T21_PHASE12L_ORIGINAL_OBJECT_PARTS as L} from '../src/stage/undertow/UndertowSpillwayPhase12LOriginalObjectParts';
import {UNDERTOW_T21_PHASE12M_ORIGINAL_RIM_BANDS as M} from '../src/stage/undertow/UndertowSpillwayPhase12MOriginalRimBands';

// Phase12Z: numeric-condition and tolerance-sweep review of PINNED source
// evidence. No source edit, weld, inferred floor, nav, paint, collision or stage promotion.
const PIN='a32cff26b1a142d31e7658ebc48f213059b3ea42e86d32ed12cb80de5b03d046';
const OBJECT='Fld_Temple01_CellingBase_1__PillarOld00',MATERIAL='Fld_Temple01_PillarOld00';
const PLANE_EPS=1e-8, GAP_EPS=1e-8;
const SWEEP=[1e-12,1e-10,1e-9,1e-8] as const;
type V=readonly [number,number,number];
type Face={originalFaceIndex:number;originalOBJVertexIds:number[];
 originalProjectedTriangleXYZ:V[];sourceObject:string;sourceMaterial:string;
 originalProjectedNormal:V;originalAreaSquareMeters:number;projectedY:number;
 coveringBoundaryOccurrences:number};
type Part={sourceComponentMinFace:number;mirrorSourceMinFace:number;
 sourceBoundaryEdges:number;originalCoveringFaceIds:number[]};
type R={sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
 originalProjectedXYZ:V[];sourceCoveringFaces:{originalFaceIndex:number;originalOBJVertexIds:number[];
 sourceObject:string;sourceMaterial:string;startFraction:number;endFraction:number;spanMeters:number}[];
 noGap:boolean;gapIntervals:[number,number][];coveringFaceCount:number;
 physicalConnectionAuthorized:boolean};
function cross2(a:readonly number[],b:readonly number[],c:readonly number[]):number{
 return (b[0]!-a[0]!)*(c[1]!-a[1]!)-(b[1]!-a[1]!)*(c[0]!-a[0]!);
}
function cross3(a:V,b:V):V{
 return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}
function sub(a:V,b:V):V{return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mag(v:V){return Math.hypot(v[0],v[1],v[2]);}
function normal(tri:V[]){
 if(tri.length!==3||!tri.every(v=>v.length===3&&v.every(Number.isFinite)))
  throw Error('PHASE12Z_BAD_SOURCE_TRIANGLE');
 const u=sub(tri[1]!,tri[0]!),v=sub(tri[2]!,tri[0]!);
 const n=cross3(u,v),m=mag(n);
 if(m<1e-10)throw Error('PHASE12Z_DEGENERATE_SOURCE_FACE');
 return {unit:n.map(x=>x/m) as unknown as V,area:m/2};
}
// New independent half-plane line clip in projected XZ; unlike Phase12X
// it does not project by largest normal axis or use barycentric point area.
function clipXZ(p:V,q:V,tri:V[],tol:number):[number,number]|null{
 const a=tri[0]!,b=tri[1]!,c=tri[2]!;
 if(![p,q,...tri].every(v=>v.length===3&&v.every(Number.isFinite)))
   throw Error('PHASE12Z_NONFINITE_XYZ');
 const yy=a[1];
 if([p,q,b,c].some(v=>Math.abs(v[1]-yy)>PLANE_EPS))
   throw Error('PHASE12Z_PLANE_MISMATCH');
 const x=(v:V)=>[v[0],v[2]] as const;
 const verts=[x(a),x(b),x(c)],P=x(p),Q=x(q);
 const area=cross2(verts[0]!,verts[1]!,verts[2]!);
 if(Math.abs(area)<1e-12)throw Error('PHASE12Z_ZERO_PROJECTED_AREA');
 let lo=0,hi=1;
 for(let k=0;k<3;k++){
  const u=verts[k]!,v=verts[(k+1)%3]!;
  const l=cross2(u,v,P)/area;
  const r=cross2(u,v,Q)/area;
  const d=r-l;
  if(Math.abs(d)<1e-15){
   if(l< -tol)return null;
   continue;
  }
  const bound=(-tol-l)/d;
  if(d>0)lo=Math.max(lo,bound);
  else hi=Math.min(hi,bound);
 }
 if(lo>hi+1e-12)return null;
 return [Math.max(0,lo),Math.min(1,hi)];
}
function union(segments:readonly [number,number][],gapTol:number):{gap:number;overlap:number;merged:[number,number][]}{
 let hi=0,overlap=0,gap=0;
 const sorted=[...segments].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const merged:[number,number][]=[];
 for(const [a,b] of sorted){
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b>1||b<a)
   throw Error('PHASE12Z_BAD_SOURCE_INTERVAL');
  if(a>hi+gapTol)gap+=a-hi;
  overlap+=Math.max(0,Math.min(hi,b)-a);
  hi=Math.max(hi,b);
  if(merged.length&&a<=merged[merged.length-1]![1]+gapTol)
    merged[merged.length-1]![1]=Math.max(merged[merged.length-1]![1],b);
  else merged.push([a,b]);
 }
 if(hi<1-gapTol)gap+=1-hi;
 if(!sorted.length)gap=1;
 return {gap,overlap,merged};
}
const edge=(ids:readonly number[])=>[...ids].sort((a,b)=>a-b).join(':');
const key=(r:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[]})=>
  r.sourcePartMinFace+':'+r.sourceFace+':'+edge(r.originalOBJVertexIds);
describe('T21 Phase12Z independently bounded numeric sensitivity for original cover faces',()=>{
 it('preserves T20/T21 authority-free source and 124/64/42 hard freezes',()=>{
  expect(PRODUCTION_STAGE_DEFINITION.metadata.id).toBe('inkworks-junction');
  expect(UNDERTOW_T21D_PARTIAL_BLOCKOUT_GEOMETRY.activationReady).toBe(false);
  expect(UNDERTOW_T21_COVERAGE_LEDGER_V3.sourceInventory).toHaveLength(64);
  expect(UNDERTOW_T21_MACRO_OUTER_BOUNDARY).toHaveLength(42);
  expect([I.length,K.length,L.length,M.length]).toEqual([6,4,4,8]);
  const all=[...I,...K,...L,...M];
  expect(all).toHaveLength(22);
  expect(all.reduce((n,m)=>n+m.originalSourceTriangleCount,0)).toBe(488);
  for(const m of all){expect(m.reviewOnly).toBe(true);
   expect(m.runtimePromotionAuthorized).toBe(false);
   expect(m.gameplayFloorCollisionPaintNavScoringAuthority).toBe('NONE');}
 });
 it('synthetic negative: normal flip, source-plane drift, micrometer gap and tolerance dependence',()=>{
  const tri:V[]=[[0,46.5,0],[0,46.5,2],[2,46.5,0]];
  expect(normal(tri).unit[1]).toBeCloseTo(1,12);
  const reversed:V[]=[tri[0]!,tri[2]!,tri[1]!];
  expect(normal(reversed).unit[1]).toBeCloseTo(-1,12);
  const a:V=[.1,46.5,.1],b:V=[.2,46.5,.2];
  expect(clipXZ(a,b,reversed,1e-9)).toEqual([0,1]);
  expect(()=>clipXZ([.1,46.5000003,.1],b,reversed,1e-9)).toThrow('PHASE12Z_PLANE_MISMATCH');
  expect(union([[0,.4],[.4000000001,1]],1e-8).gap).toBe(0);
  expect(union([[0,.4],[.4001,1]],1e-8).gap).toBeGreaterThan(1e-5);
  expect(union([[0,1],[.5,1]],1e-8).overlap).toBeGreaterThan(.49);
  expect(()=>union([[.8,.2]],1e-8)).toThrow();
  const near:V=[-.000001,46.5,.5],end:V=[.1,46.5,.5];
  const strict=clipXZ(near,end,reversed,1e-12),relaxed=clipXZ(near,end,reversed,1e-8);
  expect(strict).not.toBeNull();expect(relaxed).not.toBeNull();
  expect(strict![0]).toBeGreaterThanOrEqual(relaxed![0]);
 });
 it('sweeps tolerance using Face IDs, original XYZ, finite plane & winding and emits read-only evidence',()=>{
  const X=process.env.T21_PHASE12X_REPORT_INPUT,Y=process.env.T21_PHASE12Y_REPORT_INPUT,
    W=process.env.T21_PHASE12W_REPORT_INPUT,out=process.env.T21_PHASE12Z_REPORT;
  if(!X&&!Y&&!W&&!out){if(process.env.T21_PHASE12Z_REQUIRED==='1')throw Error('PHASE12Z_REQUIRED_EVIDENCE');return;}
  if(!X||!Y||!W||!out||![X,Y,W].every(existsSync))
    throw Error('PHASE12Z_REQUIRED_SOURCE_REPORTS_MISSING');
  const x=JSON.parse(readFileSync(X,'utf8')) as {
   version:string;originalSourceSHA256:string;runtimePromotionAuthorized:boolean;
   physicalWeldOrWalkableFloorProven:boolean;edgesIndependentlyRechecked:number;
   singleFaceFullCoverageEdges:number;twoFaceUnionCoverageEdges:number;edgesWithGap:number;
   rows:R[]};
  const y=JSON.parse(readFileSync(Y,'utf8')) as {
   version:string;originalSourceSHA256:string;runtimePromotionAuthorized:boolean;
   originalOBJIDWeldBetweenTargetAndCoverProven:boolean;uniqueOriginalCoveringSourceFaces:number;
   originalFacePairsSharingOBJIDEdge:number;downwardOriginalFaces:number;
   sourceFaceRecords:Face[];sourceOriginalEdgePairs:{faces:[number,number];
    sharedOriginalOBJEdge:number[];oppositeOriginalWinding:boolean;normalDot:number}[];
   originalTargetToCoveringFaces:Part[]};
  const w=JSON.parse(readFileSync(W,'utf8')) as {
   originalSourceSHA256:string;originalActiveFacesParsed:number;
   phase12VUnresolvedEdges:number;runtimePromotionAuthorized:boolean;
   rows:{sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
     originalProjectedXYZ:V[];contactWitnesses:{originalFaceIndex:number;kind:string;
      originalProjectedTriangleXYZ:V[]}[]}[]};
  for(const p of [x,y,w])expect(p.originalSourceSHA256).toBe(PIN);
  expect(x.version).toBe('T21_PHASE12X_PINNED_ORIGINAL_FACE_INTERVAL_UNION_V1');
  expect(y.version).toBe('T21_PHASE12Y_ORIGINAL_FACE_MATERIAL_NORMAL_ID_ADJACENCY_V1');
  expect(w.originalActiveFacesParsed).toBe(70396);expect(w.phase12VUnresolvedEdges).toBe(88);
  expect(x.edgesIndependentlyRechecked).toBe(88);
  expect([x.singleFaceFullCoverageEdges,x.twoFaceUnionCoverageEdges,x.edgesWithGap]).toEqual([80,8,0]);
  expect([y.uniqueOriginalCoveringSourceFaces,y.originalFacePairsSharingOBJIDEdge,y.downwardOriginalFaces])
    .toEqual([8,4,8]);
  expect(x.runtimePromotionAuthorized).toBe(false);
  expect(x.physicalWeldOrWalkableFloorProven).toBe(false);
  expect(y.runtimePromotionAuthorized).toBe(false);
  expect(y.originalOBJIDWeldBetweenTargetAndCoverProven).toBe(false);
  expect(w.runtimePromotionAuthorized).toBe(false);
  expect(x.rows).toHaveLength(88);expect(y.sourceFaceRecords).toHaveLength(8);
  expect(y.sourceOriginalEdgePairs).toHaveLength(4);
  const known=new Map(y.sourceFaceRecords.map(f=>[f.originalFaceIndex,f]));
  expect(known.size).toBe(8);
  let largestPlaneResidual=0,smallestArea=Infinity,normalDeviation=0;
  for(const f of known.values()){
   expect(f.sourceObject).toBe(OBJECT);expect(f.sourceMaterial).toBe(MATERIAL);
   expect(f.originalOBJVertexIds).toHaveLength(3);
   const g=normal(f.originalProjectedTriangleXYZ);
   smallestArea=Math.min(smallestArea,g.area);
   expect(g.area).toBeCloseTo(f.originalAreaSquareMeters,8);
   expect(g.unit[1]).toBeLessThan(-.999999999);
   expect(f.projectedY).toBe(46.5);
   normalDeviation=Math.max(normalDeviation,Math.abs(g.unit[0]),Math.abs(g.unit[1]+1),Math.abs(g.unit[2]));
   for(const p of f.originalProjectedTriangleXYZ)
     largestPlaneResidual=Math.max(largestPlaneResidual,Math.abs(p[1]-46.5));
  }
  expect(largestPlaneResidual).toBeLessThanOrEqual(PLANE_EPS);
  expect(smallestArea).toBeGreaterThan(21);
  expect(normalDeviation).toBeLessThan(1e-10);
  for(const pair of y.sourceOriginalEdgePairs){
   expect(known.has(pair.faces[0])).toBe(true);expect(known.has(pair.faces[1])).toBe(true);
   expect(pair.oppositeOriginalWinding).toBe(true);expect(pair.normalDot).toBeCloseTo(1,10);
  }
  const prior=new Map(w.rows.map(r=>[key(r),r]));
  expect(prior.size).toBe(88);
  const seen=new Set<string>(),perEdge=[] as {
    sourcePartMinFace:number;sourceFace:number;originalOBJVertexIds:number[];
    originalProjectedXYZ:V[];coveringFaceIds:number[];
    sourceTargetPlaneResidualMeters:number;parameterSweeps:{
      barycentricTolerance:number;coverageGapFraction:number;positiveCoveringIntervals:number;
      maxWitnessIntervalDifferenceFraction:number;maxWitnessOverlapLengthErrorMeters:number;
      noGapAtNominalThreshold:boolean}[];fullCoverAtNominal:boolean}[];
  const byTolerance=new Map<number,{gap:number;gapEdges:number;worst:number;maxIntervalDifference:number;maxLengthError:number}>();
  for(const tol of SWEEP)byTolerance.set(tol,{gap:0,gapEdges:0,worst:0,maxIntervalDifference:0,maxLengthError:0});
  let positiveUses=0;
  for(const row of x.rows){
   const k=key(row),wr=prior.get(k);
   expect(wr).toBeDefined();expect(seen.has(k)).toBe(false);seen.add(k);
   expect(row.noGap).toBe(true);expect(row.physicalConnectionAuthorized).toBe(false);
   expect(row.originalProjectedXYZ).toEqual(wr!.originalProjectedXYZ);
   expect([1,2]).toContain(row.sourceCoveringFaces.length);
   const edgeLen=mag(sub(row.originalProjectedXYZ[1]!,row.originalProjectedXYZ[0]!));
   expect(edgeLen).toBeGreaterThan(1e-6);
   let largestRowPlaneResidual=0;
   const faces=row.sourceCoveringFaces.map(c=>{
     const f=known.get(c.originalFaceIndex);
     expect(f).toBeDefined();
     expect(f!.originalOBJVertexIds).toEqual(c.originalOBJVertexIds);
     expect(c.sourceObject).toBe(OBJECT);expect(c.sourceMaterial).toBe(MATERIAL);
     expect(c.originalOBJVertexIds.some(id=>row.originalOBJVertexIds.includes(id))).toBe(false);
     expect(wr!.contactWitnesses.some(witness=>witness.originalFaceIndex===c.originalFaceIndex&&
       witness.kind==='COPLANAR_FACE_INTERIOR_POSITIVE_SPAN'&&
       JSON.stringify(witness.originalProjectedTriangleXYZ)===JSON.stringify(f!.originalProjectedTriangleXYZ))).toBe(true);
     for(const p of row.originalProjectedXYZ)
       largestRowPlaneResidual=Math.max(largestRowPlaneResidual,Math.abs(p[1]-f!.projectedY));
     return {original:c,face:f!};
   });
   expect(largestRowPlaneResidual).toBeLessThanOrEqual(PLANE_EPS);
   positiveUses+=faces.length;
   const parameterSweeps=[] as typeof perEdge[number]['parameterSweeps'];
   for(const tol of SWEEP){
     const intervals:[number,number][]=[];
     let maxDifference=0,maxLengthError=0;
     for(const {original,face} of faces){
       const t=clipXZ(row.originalProjectedXYZ[0]!,row.originalProjectedXYZ[1]!,
         face.originalProjectedTriangleXYZ,tol);
       if(t!==null){
         intervals.push(t);
         if(tol===1e-9){
           maxDifference=Math.max(maxDifference,Math.abs(t[0]-original.startFraction),
             Math.abs(t[1]-original.endFraction));
           maxLengthError=Math.max(maxLengthError,
             Math.abs((t[1]-t[0])*edgeLen-original.spanMeters));
         }
       }
     }
     const merged=union(intervals,GAP_EPS);
     const noGap=merged.gap<=GAP_EPS;
     if(tol===1e-9){
       expect(intervals.length).toBe(faces.length);
       expect(maxDifference).toBeLessThan(3e-7);
       expect(maxLengthError).toBeLessThan(1e-6);
       expect(noGap).toBe(true);
     }
     const record=byTolerance.get(tol)!;
     record.gap+=merged.gap;
     record.gapEdges+=Number(!noGap);
     record.worst=Math.max(record.worst,merged.gap);
     record.maxIntervalDifference=Math.max(record.maxIntervalDifference,maxDifference);
     record.maxLengthError=Math.max(record.maxLengthError,maxLengthError);
     parameterSweeps.push({barycentricTolerance:tol,
       coverageGapFraction:Number(merged.gap.toPrecision(12)),
       positiveCoveringIntervals:intervals.length,
       maxWitnessIntervalDifferenceFraction:Number(maxDifference.toPrecision(12)),
       maxWitnessOverlapLengthErrorMeters:Number(maxLengthError.toPrecision(12)),
       noGapAtNominalThreshold:noGap});
   }
   perEdge.push({sourcePartMinFace:row.sourcePartMinFace,sourceFace:row.sourceFace,
     originalOBJVertexIds:row.originalOBJVertexIds,originalProjectedXYZ:row.originalProjectedXYZ,
     coveringFaceIds:row.sourceCoveringFaces.map(c=>c.originalFaceIndex).sort((a,b)=>a-b),
     sourceTargetPlaneResidualMeters:largestRowPlaneResidual,
     parameterSweeps,fullCoverAtNominal:true});
  }
  expect(seen.size).toBe(88);expect(positiveUses).toBe(96);
  expect(byTolerance.get(1e-9)!.gapEdges).toBe(0);
  const partCounts=new Map<number,number>();
  for(const row of perEdge)partCounts.set(row.sourcePartMinFace,(partCounts.get(row.sourcePartMinFace)||0)+1);
  expect(partCounts.size).toBe(8);
  expect([...partCounts.values()].every(n=>n===11)).toBe(true);
  expect(y.originalTargetToCoveringFaces).toHaveLength(8);
  const variants=SWEEP.map(tol=>({barycentricTolerance:tol,
    gapEdges:byTolerance.get(tol)!.gapEdges,
    largestGapFraction:Number(byTolerance.get(tol)!.worst.toPrecision(12)),
    sumGapFraction:Number(byTolerance.get(tol)!.gap.toPrecision(12)),
    maxBaselineIntervalReconstructionDifferenceFraction:Number(byTolerance.get(tol)!.maxIntervalDifference.toPrecision(12)),
    maxBaselineOverlapLengthErrorMeters:Number(byTolerance.get(tol)!.maxLengthError.toPrecision(12))}));
  const data={version:'T21_PHASE12Z_ORIGINAL_SOURCE_NUMERIC_STABILITY_V1',
    originalSourceSHA256:PIN,sourceOnly:true,reviewOnly:true,
    runtimePromotionAuthorized:false,physicalWeldOrWalkableFloorProven:false,
    gameplayCollisionPaintNavScoringAuthority:'NONE',
    originalActiveFacesProvenUpstream:70396,fullSourceObjRescannedInPhase12Z:false,
    originalTargetEdges:88,originalCoveringFaceIds:8,originalPositiveFaceUses:96,
    sourceComponents:8,nominalBarycentricTolerance:1e-9,
    sourcePlaneToleranceMeters:PLANE_EPS,sourceGapFractionTolerance:GAP_EPS,
    largestOriginalSourcePlaneResidualMeters:largestPlaneResidual,
    largestOriginalCoverNormalDeviationFromDownward:normalDeviation,
    minimumCoverSourceTriangleAreaSquareMeters:smallestArea,
    numericalToleranceVariants:variants,nominalCoverageEdgesWithGap:byTolerance.get(1e-9)!.gapEdges,
    results:perEdge};
  writeFileSync(out,JSON.stringify(data,null,2));
  console.log('T21_PHASE12Z_NUMERIC_CONDITION_SOURCE_ONLY',JSON.stringify({
   rows:88,positiveFaceUsages:96,nominalGapEdges:0,
   sweep:variants.map(x=>[x.barycentricTolerance,x.gapEdges]),
   maxNormalDeviation:normalDeviation}));
 });
});
