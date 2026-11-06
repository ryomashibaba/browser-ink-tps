import {describe,it,expect} from 'vitest';
import {b473RealSourceCombatLifeReadoutSelected} from './B473RealSourceCombatLifeReadout';
import {b207CombatRoundUrl} from './B207SourceCombatRound';
import {b384SourceCircuitHref,b384SourceCircuitSelected} from './B384SourceCircuit';
import {sourcePlayFrontlineResearchUrl} from './SourcePlayPortal';

const portal='https://example.org/browser-ink-tps/play-source.html';
const genuine=()=>new URL(b207CombatRoundUrl(portal));

describe('B473 read-only real CPU lifecycle on player-selected B207 SOURCE combat',()=>{
 it('exposes existing genuine B207 180s and B441 research routes only',()=>{
  const basic=genuine();
  expect(b473RealSourceCombatLifeReadoutSelected(basic.searchParams)).toBe(true);
  const frontline=new URL(sourcePlayFrontlineResearchUrl(portal));
  expect(b473RealSourceCombatLifeReadoutSelected(frontline.searchParams)).toBe(true);
  expect(frontline.searchParams.get('t21W10B441')).toBe('sourceFrontline');
 });
 it('cannot activate from ordinary preview, production, A1, or QA input',()=>{
  const keys=[
   ['t21Play','production'],['t21QaDrive','other'],
   ['t21W10B112',''],['t21W10B183',''],
   ['t21W10B192',''],['t21W10B203',''],
   ['t21QaInput','deterministic'],['t21QaInput','manual'],
   ['t21W10B193','allyCoop']
  ] as const;
  for(const [key,value] of keys){
   const p=genuine().searchParams;p.set(key,value);
   expect(b473RealSourceCombatLifeReadoutSelected(p)).toBe(false);
  }
 });
 it('does not change B343/B367 historical shooter or B384 circuit gates',()=>{
  for(const [key,value] of [
   ['t21W10B343','sourceVolleyAtomic'],
   ['t21W10B367','realCpuLifecycle'],
   ['t21W10B384','loadoutCircuit']
  ] as const){
   const p=genuine().searchParams;p.set(key,value);
   expect(b473RealSourceCombatLifeReadoutSelected(p)).toBe(false);
  }
  const b384=b384SourceCircuitHref(
   'https://example.org/browser-ink-tps/?t21Play=preview',true);
  expect(b384).not.toBeNull();
  const selected=new URL(b384!).searchParams;
  expect(b384SourceCircuitSelected(selected)).toBe(true);
  expect(b473RealSourceCombatLifeReadoutSelected(selected)).toBe(false);
 });
 it('remains OFF for any missing genuine B207 provenance',()=>{
  const p=genuine().searchParams;
  for(const k of ['t21W10B112','t21W10B183','t21W10B192',
   't21W10B203','t21QaDrive']){
   const x=new URLSearchParams(p);x.delete(k);
   expect(b473RealSourceCombatLifeReadoutSelected(x)).toBe(false);
  }
 });
});
