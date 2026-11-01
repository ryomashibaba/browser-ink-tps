import {describe,it,expect} from 'vitest';
import {b402OriginalSourceInkRadarSamples,type B402Surface}
 from './B402NativeSourceInkRadarSamples';
const original=[25,17,26,0] as const;
function surface(id:string,raw:number[]=[0,0,0,0],
 isActive=(x:number,y:number)=>true):B402Surface{
 return {id,isScoreable:false,widthCells:2,heightCells:2,
  widthMeters:2,heightMeters:2,cellSize:1,
  ownerGrid:new Int8Array(raw),isCellActive:isActive,
  localToWorld:(u,v)=>({x:u,y:1,z:v})};
}
const all=(s:B402Surface)=>[
 s,...Array.from({length:16},(_,i)=>surface('original-'+i))];
describe('B402 actual original SOURCE paint radar points',()=>{
 it('renders only real Team A/B occupied source pixels, not neutral area',()=>{
  const r=b402OriginalSourceInkRadarSamples(
   all(surface('first',[1,-1,0,1])),original,120,[0,1,0]);
  expect(r).toMatchObject({status:'SOURCE_PAINT_SAMPLES',
   realTeamADots:2,realTeamBDots:1,sampledOriginalSurfaces:17,
   fullCoverageInferred:false,sourceScoreable:0,officialWinner:'NONE',
   paintWrites:0,actorTeleports:0});
  expect(r.dots.map(d=>d.owner)).toEqual([1,-1,1]);
 });
 it('respects real original active cell masks and physical floor elevation',()=>{
  const r=b402OriginalSourceInkRadarSamples(
   all(surface('first',[1,-1,0,0],(x,y)=>x===0)),original,
   200,[0,1,0]);
  expect(r.dots.map(x=>x.owner)).toEqual([1]);
  const above=b402OriginalSourceInkRadarSamples(
   all(surface('first',[1,-1,0,0])),original,200,[0,12,0]);
  expect(above.dots).toHaveLength(0);
  const distant=b402OriginalSourceInkRadarSamples(
   all(surface('first',[1,-1,0,0])),original,200,[100,1,0]);
  expect(distant.dots).toHaveLength(0);
 });
 it('never invents floor paint on invalid stage or scoreable source',()=>{
  expect(b402OriginalSourceInkRadarSamples(
   all(surface('first',[1,0,0,0])),[25,17,27,0],1,[0,1,0]).status).toBe('HOLD');
  expect(b402OriginalSourceInkRadarSamples(
   all({...surface('first'),isScoreable:true}),original,1,[0,1,0]).dots).toHaveLength(0);
  expect(b402OriginalSourceInkRadarSamples(
   all(surface('first')),'bad-stage' as unknown as number[],1,[0,1,0]).status).toBe('HOLD');
 });
 it('clips a painted partial end cell inside the EXACT original surface',()=>{
  const s: B402Surface={...surface('edge',[0,0,0,1]),
   widthMeters:1.2,heightMeters:1.2,
   localToWorld:(u,v)=>({x:u,y:0,z:v})};
  const r=b402OriginalSourceInkRadarSamples(all(s),original,60,[0,0,0]);
  expect(r.status).toBe('SOURCE_PAINT_SAMPLES');
  expect(r.dots).toHaveLength(1);
  expect(r.dots[0]!.x).toBeLessThan(s.widthMeters);
  expect(r.dots[0]!.z).toBeLessThan(s.heightMeters);
 });
 it('bounded tile samples never claim complete ownerGrid coverage',()=>{
  const many={...surface('big',Array(1024).fill(1)),
   widthCells:32,heightCells:32,widthMeters:32,heightMeters:32};
  const r=b402OriginalSourceInkRadarSamples(
   all(many),original,60,[0,1,0]);
  expect(r.status).toBe('SOURCE_PAINT_SAMPLES');
  expect(r.dots.length).toBeLessThanOrEqual(72);
  expect(r.fullCoverageInferred).toBe(false);
 });
});
