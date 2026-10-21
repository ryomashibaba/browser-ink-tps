import {describe,it,expect} from 'vitest';
import {B70_STORAGE_KEY,captureB70Round,readB70Session,
 storeB70Round,compareB70Rounds,type B70Frame}
 from './UndertowF3OwnerAimComparison';
const make=(sweep:boolean):B70Frame=>({
 tick:11857,matchState:'TIME_UP',timeRemainingSeconds:0,stopReason:null,
 originalSourceSolids:25,originalPaintSurfaces:17,
 originalSourceNavigationLinks:26,sourceScoreablePromotions:0,
 productionAuthorized:false,unrestricted4v4Certified:false,
 shotsFired:7,cpuSourceTurfShots:sweep?491:112,
 cpuImpactInkCellsChanged:sweep?11779:3615,
 cpuSplats:0,humanSplats:0,humanRespawns:0,
 b23HumanInkFeedback:{humanChangedCells:281},
 cpu:{physicalRejoins:['A1','A2','A3','B1','B2','B3','B4'],
  sourcePatrol:{travelMeters:4951.404367}},
 cpuContinuity:{suspectedStallCount:0},
 sourceFrameQuality:{p95Ms:sweep?465.6:1158,liveUpdateFrames:3434},
 b64SourceInkSweep:{enabled:sweep}
});
describe('W10-B70 deliberate on-device source practice two-180s A/B',()=>{
 it('stores only two actual complete rounds, no source data, no winner',()=>{
  expect(B70_STORAGE_KEY).toContain('T21_B70');
  const a=captureB70Round('FIXED',make(false));
  const b=captureB70Round('SWEEP',make(true));
  const first=storeB70Round(null,a);
  expect(compareB70Rounds(first)).toBeNull();
  const both=storeB70Round(first,b);
  const measured=compareB70Rounds(both)!;
  expect(measured).toMatchObject({
   realCpuInkChangedCellsDelta:8164,
   realCpuInkChangeRatio:3.258,
   humanInputWasDifferent:false,
   winner:'NONE',defaultCpuUnchanged:true,
   original4v4Certified:false,noCausalWindowsGpuClaim:true
  });
  expect(JSON.stringify(measured)).not.toContain('SOURCE_PRIVATE_GUID');
 });
 it('does not accept paused incomplete, spoofed actor or scored turf',()=>{
  expect(()=>captureB70Round('FIXED',{...make(false),matchState:'PLAYING'}))
   .toThrow('GENUINE_NATIVE_180S_REQUIRED');
  expect(()=>captureB70Round('FIXED',{...make(false),tick:8999}))
   .toThrow('GENUINE_NATIVE_180S_REQUIRED');
  expect(()=>captureB70Round('SWEEP',make(false))).toThrow('MODE_MISMATCH');
  expect(()=>captureB70Round('FIXED',{...make(false),
   sourceScoreablePromotions:1})).toThrow('SOURCE_AUTHORITY');
  expect(()=>captureB70Round('FIXED',{...make(false),
   cpu:{...make(false).cpu,physicalRejoins:['A1','A1','B1','B2','B3','B4','A2']}}))
   .toThrow('SOURCE_AUTHORITY');
 });
 it('rejects private payload injection, corrupted or expired tab records',()=>{
  const raw=storeB70Round(null,captureB70Round('FIXED',make(false)));
  const leak=JSON.parse(raw);
  leak.fixed.originalSourceActorGUID='NONPUBLIC_SECRET';
  const safe=readB70Session(JSON.stringify(leak));
  expect(JSON.stringify(safe)).not.toContain('NONPUBLIC_SECRET');
  expect(readB70Session('{broken').fixed).toBeNull();
  expect(readB70Session('x'.repeat(3000)).sweep).toBeNull();
 });
 it('acknowledges noncomparable human input during A/B',()=>{
  const a=captureB70Round('FIXED',make(false));
  const b=captureB70Round('SWEEP',{...make(true),shotsFired:51});
  const state=storeB70Round(storeB70Round(null,a),b);
  expect(compareB70Rounds(state)!.humanInputWasDifferent).toBe(true);
 });
});
