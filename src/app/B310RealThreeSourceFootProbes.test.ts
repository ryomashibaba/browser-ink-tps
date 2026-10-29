import {describe,it,expect} from 'vitest';
import {b310CheckOriginalTripleRoutes} from './B310RealThreeSourceFootProbes';
const probe=(i:number)=>({grid:[i,0] as [number,number],
 world:[i,3.1,50] as [number,number,number],owner:0,
 navCandidate:true,startSnap:.1,endSnap:.1,pathPointCount:3,
 endError:.1,footSolidId:'native-floor',footGapMeters:.1,footObserved:true});
const rows=()=>Array.from({length:17},(_,i)=>({
 surfaceId:'original-'+i,owned:i===0?380:0,active:1000,
 probes:[probe(0),probe(1),probe(2)]
}));
describe('B310 actual 17 source three-point original nav + human foot',()=>{
 it('never upgrades native observations to physical movement',()=>{
  const a=b310CheckOriginalTripleRoutes(rows(),380);
  expect(a.actualActiveOriginalCellProbes).toBe(51);
  expect(a.navPlusStaticFootSources).toHaveLength(16);
  expect(a.truePlayerKccTraversalProven).toBe(false);
 });
 it('rejects duplicate probes and synthetic ownership',()=>{
  expect(()=>b310CheckOriginalTripleRoutes(rows().slice(1),380)).toThrow();
  expect(()=>b310CheckOriginalTripleRoutes(rows(),381)).toThrow();
  const x=rows();x[1]!.probes=[probe(0),probe(0)];
  expect(()=>b310CheckOriginalTripleRoutes(x,380)).toThrow();
  const y=rows();y[2]!.probes=[{...probe(0),footObserved:false}];
  expect(()=>b310CheckOriginalTripleRoutes(y,380)).toThrow();
 });
});
