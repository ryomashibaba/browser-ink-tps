import {describe,it,expect} from 'vitest';
import {b371RealSourceMissionCue} from '../app/B371RealSourceMissionCue';
import {b343CanLaunchSourceVolley as allow,b343SourceShooterPracticeHref} from './B343OriginalSourceVolleyBudget';
describe('B343 real SOURCE volley capacity',()=>{
 it('rejects exhausted or partial physical pool without synthetic slots',()=>{
  expect(allow(0,1)).toBe(false);
  expect(allow(1,2)).toBe(false);
  expect(allow(2,2)).toBe(true);
  expect(allow(128,1)).toBe(true);
 });
 it('fails closed on invalid or fractional resource values',()=>{
  for(const n of [NaN,-1,0,1.5,Infinity])expect(allow(8,n)).toBe(false);
  for(const n of [NaN,-1,1.5,Infinity])expect(allow(n,1)).toBe(false);
 });
 it('real capacity conserves every 1 to 8 shot burst for 0 to 128 slots',()=>{
  for(let f=0;f<=128;f++)
   for(let n=1;n<=8;n++)expect(allow(f,n)).toBe(f>=n);
 });
});

describe('one-click genuine SOURCE shooter practice',()=>{
 const url='https://example.test/browser-ink-tps/?t21Play=preview&t21QaDrive=source&t21W10B348=sourceShooterAccuracyCandidate';
 it('boots a clean new 180s round with real physical pool protection and ink cues',()=>{
  const target=new URL(b343SourceShooterPracticeHref(url,true)!);
  expect(target.pathname).toBe('/browser-ink-tps/');
  for(const [k,v] of [
   ['t21Play','preview'],['t21QaDrive','source'],
   ['t21W10B183','firstDropPlay'],
   ['t21W10B192','humanCombat'],['t21W10B112','humanGround'],
   ['t21W10B203','fullRound'],
   ['t21W10B343','sourceVolleyAtomic'],
   ['t21W10B345','sourceShooterOpening'],
   ['t21W10B346','nativeShooterPhysicsWitness'],
   ['t21W10B348','sourceShooterAccuracyCandidate'],
   ['t21W10B351','realCpuHitCue'],
   ['t21W10B367','realCpuLifecycle'],
   ['t21W10B368','physicalEnemyFrontier'],
   ['t21W10B355','realInkHud'],
   ['t21W10B356','realImpactReticle']
  ] as [string,string][])expect(target.searchParams.get(k)).toBe(v);
  expect(target.searchParams.get('t21W10B348')).toBe('sourceShooterAccuracyCandidate');
  expect(target.searchParams.get('t21W10B351')).toBe('realCpuHitCue');
  expect(target.searchParams.has('t21W10B193')).toBe(false);
  expect(target.searchParams.has('t21QaInput')).toBe(false);
  expect(target.searchParams.has('cpuWarp')).toBe(false);
  expect(target.searchParams.has('t21W10B193')).toBe(false);
  expect(target.searchParams.has('t21QaInput')).toBe(false);
 });
 it('a true fresh-world circuit retry preserves every genuine shooter opt-in',()=>{
  const selected=b343SourceShooterPracticeHref(url,true)!;
  expect(b343SourceShooterPracticeHref(selected,true)).toBe(selected);
  const query=new URL(selected).searchParams;
  expect(query.get('t21W10B183')).toBe('firstDropPlay');
  expect(query.get('t21W10B192')).toBe('humanCombat');
  expect(query.get('t21W10B203')).toBe('fullRound');
  expect(query.get('t21W10B351')).toBe('realCpuHitCue');
  expect(query.has('t21W10B193')).toBe(false);
 });
 it('returns to baseline without retaining research flags',()=>{
  const target=b343SourceShooterPracticeHref(url,true)!;
  const reset=new URL(b343SourceShooterPracticeHref(target,false)!);
  expect(reset.searchParams.toString()).toBe('t21Play=preview&t21QaDrive=source');
 });
 it('rejects non-SOURCE or production pages',()=>{
  for(const x of ['https://example.test/',
   'https://example.test/?t21Play=preview',
   'https://example.test/?t21Play=preview&t21QaDrive=other'])
   expect(b343SourceShooterPracticeHref(x,true)).toBeNull();
 });
});

describe('B372 actual SOURCE physical shooter HUD budget integration',()=>{
 it('reflects the same real B343 free-slot contract with zero score authority',()=>{
  const original={originalStage:[25,17,26,0] as [number,number,number,number],
   genuineSourceShooterSelected:true,nativeTick:1550,
   status:'PAINT_ON_RAISED' as const,originalSourceLocalClear:false,
   realGroundedTravelMeters:11.2,requiredGroundedTravelMeters:2,
   realFreshHumanImpactCells:0,requiredFreshHumanImpactCells:60,
   actualHumanImpactEvents:0,sourceInkOnly:true,realAcceptedShots:9,
   actualInkPercent:100,playerAlive:true,
   matchState:'PLAYING' as const,stopped:false,
   shooterResources:{inkUnits:100,shotInkCostUnits:8,
    freePhysicalSlots:0,physicalPoolSize:128,
    realDryFireAttempts:0,realPoolRejections:1}
  };
  expect(allow(original.shooterResources.freePhysicalSlots,1)).toBe(false);
  expect(b371RealSourceMissionCue(original)).toMatchObject({
   step:'PAINT',progress:2,resourceState:'PHYSICAL_POOL_FULL',
   observedPoolRejections:1,crossTeamRouteCertified:false,
   physicalEnemyHitCertified:false,scoreablePromotions:0,gameplayWrites:0});
  original.shooterResources.freePhysicalSlots=1;
  expect(allow(original.shooterResources.freePhysicalSlots,1)).toBe(true);
  expect(b371RealSourceMissionCue(original)?.resourceState).toBe('INK_AND_SLOT_AVAILABLE');
  original.shooterResources.inkUnits=4;
  expect(b371RealSourceMissionCue(original)?.resourceState).toBe('LOW_INK');
 });
});
