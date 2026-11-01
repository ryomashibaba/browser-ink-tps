import {describe,expect,it} from 'vitest';
import {b400RealOriginalSourceGridRecap,b400SourceGridDownloadRecap,
 b400Real180SourceEndGate,type B400SourceGrid} from './B400RealOriginalSourceGridRecap';
const stage=[25,17,26,0] as const;
const source=(name:string,owner:number[]= [1,-1,0,0],
 active=true):B400SourceGrid=>({
 id:name,isScoreable:false,widthCells:2,heightCells:2,
 ownerGrid:new Int8Array(owner),isCellActive:(x,y)=>active||(x+y<1)
});
const all=(first:B400SourceGrid)=>[
 first,...Array.from({length:16},(_,i)=>source('surface-'+i,[0,0,0,0]))
];
describe('B400 genuine 180s registered-source ownership (never official turf)',()=>{
 it('counts ONLY physically registered active ownerGrid cells at native time up',()=>{
  const a=all(source('original', [1,-1,0,1]));
  const original=a[0]!.ownerGrid.slice();
  const r=b400RealOriginalSourceGridRecap(a,true,stage);
  expect(r).toMatchObject({status:'FINAL_REGISTERED_SOURCE_ONLY',
   observedSurfaces:17,activeOriginalGridCells:68,
   teamACells:2,teamBCells:1,neutralCells:65,
   scoreableCells:0,winner:'NONE',gameplayWrites:0,
   countsAreNotOfficialTurfArea:true,productionAuthorized:false});
  expect(Array.from(a[0]!.ownerGrid)).toEqual(Array.from(original));
  expect(r.teamAPercentOfRegisteredCells+r.teamBPercentOfRegisteredCells+
   r.neutralPercentOfRegisteredCells).toBeCloseTo(100,8);
 });
 it('does not count inactive footprint pixels as paint area',()=>{
  const r=b400RealOriginalSourceGridRecap(
   all(source('original',[1,0,0,0],false)),true,stage);
  expect(r.status).toBe('FINAL_REGISTERED_SOURCE_ONLY');
  expect(r.activeOriginalGridCells).toBe(65);
  expect(r.teamACells).toBe(1);
 });
 it('rejects training timeout and fake or incomplete native 180s',()=>{
  const real={fullRound:true,matchState:'TIME_UP',
   timeRemainingSeconds:0,nativeTick:10805,stopReason:null};
  expect(b400Real180SourceEndGate(real)).toBe(true);
  expect(b400Real180SourceEndGate({...real,fullRound:false})).toBe(false);
  expect(b400Real180SourceEndGate({...real,nativeTick:3599})).toBe(false);
  expect(b400Real180SourceEndGate({...real,timeRemainingSeconds:1})).toBe(false);
  expect(b400Real180SourceEndGate({...real,matchState:'PLAYING'})).toBe(false);
  expect(b400Real180SourceEndGate({...real,stopReason:'SAFETY_STOP'})).toBe(false);
 });
 it('exports only real original-grid aggregates and never source geometry',()=>{
  const owned=b400RealOriginalSourceGridRecap(
   all(source('original',[1,1,-1,0])),true,stage);
  const x=b400SourceGridDownloadRecap(owned);
  expect(x).toMatchObject({status:'FINAL_REGISTERED_SOURCE_ONLY',
   originalRegisteredSurfaceCount:17,totalActiveOriginalGridCells:68,
   realTeamACells:2,realTeamBCells:1,realNeutralCells:65,
   officialWinner:'NONE',gameplayWrites:0,
   officialTurfScoreIncluded:false,originalMapGeometryIncluded:false,
   playerOrCpuPositionsIncluded:false});
  const json=JSON.stringify(x);
  expect(json).not.toContain('ownerGrid');
  expect(json).not.toContain('sourceFile');
  expect(json).not.toContain('position');
  expect(b400SourceGridDownloadRecap(null)).toMatchObject({
   status:'NOT_MEASURED',officialWinner:'NONE',gameplayWrites:0});
 });
 it('fails closed on any untrusted source ownership or score surface',()=>{
  const allNeutral=all(source('original'));
  expect(b400RealOriginalSourceGridRecap(allNeutral,false,stage).status).toBe('HOLD');
  expect(b400RealOriginalSourceGridRecap(allNeutral,true,[25,17,27,0]).status).toBe('HOLD');
  expect(b400RealOriginalSourceGridRecap(
   all({...source('original'),isScoreable:true}),true,stage).status).toBe('HOLD');
  expect(b400RealOriginalSourceGridRecap(
   all(source('original',[0,0,3,0])),true,stage).status).toBe('HOLD');
  expect(b400RealOriginalSourceGridRecap(
   all(source('original',[0,1,0,0],false)),true,stage).status).toBe('HOLD');
 });
});
