import {describe,expect,it} from 'vitest';
import {b245InitialSourceView,b247ShouldCompactSourceRadar,
 b245VisibleNativeSourceRadarCpu,b245ShouldShowSourceCircuitGoal,
 b245SourceFullRoundA1Choice,b245PlayerSightlineCss,b245NativeStopReason,
 b245LocalSourceBuildProvenance,
 b388VisibleNativeDescentWarning,
 b388SuppressDuplicateRampWarning,b245RealSourceLocalRampGuide,
 b245OriginalLandingRimWarning} from './B245SourcePresentation';
import {inspectB120OriginalFirstDropBoundary}
 from './W10B120OriginalSourceBoundary';
import {b389NativeBootWeapon} from './B389NativeSourceRoundReplay';
import {sourceCoopEligible,sourceCoopNavigationUrl}
 from './B193SourceCoopMode';
describe('B245 original-source player and QA view policy',()=>{
 it('defaults a human 180s SOURCE round to uncluttered player view',()=>{
  expect(b245InitialSourceView('?t21W10B203=fullRound')).toBe('PLAYER');
 });
 it('does not change pinned native QA or ordinary preview',()=>{
  expect(b245InitialSourceView(
   '?t21W10B203=fullRound&t21QaDrive=source&t21QaInput=deterministic'
  )).toBe('QA');
  expect(b245InitialSourceView('?t21Play=preview')).toBe('QA');
 });
 it('allows explicit developer display without changing round authority',()=>{
  expect(b245InitialSourceView(
   '?t21W10B203=fullRound&t21Presentation=qa'
  )).toBe('QA');
 });
});

describe('B245 real source PLAYER weapon guidance not clipped',()=>{
 const live='?t21Play=preview&t21QaDrive=source&'+
  't21W10B203=fullRound&t21W10B384=loadoutCircuit';
 it('keeps actual B338 weapon text wrapped without hiding the controls',()=>{
  const css=b245PlayerSightlineCss(live);
  const start=css.indexOf('#t21-f3-b338-source-guide');
  expect(start).toBeGreaterThan(0);
  const rule=css.slice(start,css.indexOf('}',start));
  expect(rule).toContain('max-height:none!important');
  expect(rule).toContain('overflow:visible!important');
  expect(rule).toContain('white-space:normal!important');
  expect(rule).toContain('line-height:1.4!important');
  expect(rule).not.toContain('text-overflow:ellipsis');
  const keyHelp=css.indexOf('#t21-f3-player-key-help');
  expect(keyHelp).toBeGreaterThan(0);
  expect(css.slice(keyHelp,css.indexOf('}',keyHelp)))
   .toContain('display:none!important');
 });
 it('never applies full-round player CSS to QA, lab or production',()=>{
  for(const q of [
   live.replace('t21QaDrive=source','t21QaDrive=lab'),
   live.replace('t21Play=preview','t21Play=production'),
   live.replace('t21W10B203=fullRound','t21W10B203=off'),
   live+'&t21QaInput=deterministic',live+'&production=true',
   live+'&scoreable=true'
  ])expect(b245PlayerSightlineCss(q)).toBe('');
 });
});

describe('B247 native radar focus must not be overwritten by 60Hz renders',()=>{
 it('compacts PLAYER READY even before pointer lock, preserving prior source data',()=>{
  expect(b247ShouldCompactSourceRadar(false,true,false)).toBe(true);
  expect(b247ShouldCompactSourceRadar(true,true,false)).toBe(true);
 });
 it('restores FULL for deliberate F8 QA inspection even during pointer lock',()=>{
  expect(b247ShouldCompactSourceRadar(false,false,true)).toBe(false);
  expect(b247ShouldCompactSourceRadar(true,false,true)).toBe(false);
 });
 it('retains legacy QA behavior in non-B245 source sessions',()=>{
  expect(b247ShouldCompactSourceRadar(false,false,false)).toBe(false);
  expect(b247ShouldCompactSourceRadar(true,false,false)).toBe(true);
 });
});

describe('B384 actual SOURCE local mission visible in PLAYER view',()=>{
 const b384='?t21Play=preview&t21QaDrive=source&t21W10B112=humanGround'+
  '&t21W10B183=firstDropPlay&t21W10B192=humanCombat'+
  '&t21W10B203=fullRound&t21W10B384=loadoutCircuit';
 it('preserves B343 established visibility and admits source-only B384',()=>{
  expect(b245ShouldShowSourceCircuitGoal(
   '?t21QaDrive=source&t21W10B183=firstDropPlay'+
   '&t21W10B192=humanCombat&t21W10B343=sourceVolleyAtomic')).toBe(true);
  expect(b245ShouldShowSourceCircuitGoal(b384)).toBe(true);
  expect(b245InitialSourceView(b384)).toBe('PLAYER');
 });
 it('never exposes fake source circuit to incomplete or benchmark-mixed modes',()=>{
  for(const [key,value] of [['t21W10B183','off'],['t21QaDrive','other'],
   ['t21W10B343','sourceVolleyAtomic'],['t21QaInput','deterministic'],
   ['t21W10B384','off']] as const){
   const params=new URLSearchParams(b384);
   params.set(key,value);
   expect(b245ShouldShowSourceCircuitGoal('?'+params.toString())).toBe(false);
  }
  expect(b245ShouldShowSourceCircuitGoal('?t21Play=preview')).toBe(false);
 });
});

describe('B388 live source warning vs persistent QA suspicion',()=>{
 const f=()=>({source12Kit:true,playerView:true,playing:true,paused:false,
  tick:1450,kccGrounded:true as boolean|null,
  originalSupport:'UndertowT21D:right-low-team-a' as string|null,
  unsupportedTicks:0,recordedSuspicions:2,lastDetectionTick:1300 as number|null});
 it('real raised-floor support removes old false warning, F8 QA keeps evidence',()=>{
  expect(b388VisibleNativeDescentWarning(f())).toBe(false);
  expect(b388VisibleNativeDescentWarning({...f(),playerView:false})).toBe(true);
 });
 it('only recent native unsupported descent may warn a player',()=>{
  const x={...f(),tick:1310,kccGrounded:false,
   originalSupport:null,unsupportedTicks:12};
  expect(b388VisibleNativeDescentWarning(x)).toBe(true);
  expect(b388VisibleNativeDescentWarning({...x,tick:1430})).toBe(false);
  expect(b388VisibleNativeDescentWarning({...x,paused:true})).toBe(false);
  expect(b388VisibleNativeDescentWarning({...x,unsupportedTicks:0})).toBe(false);
 });
 it('only redundant adjacent ramp label suppressed, not true source edge',()=>{
  const x={source12Kit:true,playerView:true,grounded:true,
   footId:'UndertowT21D:right-low-team-a',
   circuitCleared:true,rampState:'ADJACENT_TO_ORIGINAL_RAMP'};
  expect(b388SuppressDuplicateRampWarning(x)).toBe(true);
  for(const y of [{...x,playerView:false},
   {...x,rampState:'CRITICAL_SOURCE_EDGE'},
   {...x,grounded:false},{...x,circuitCleared:false}])
   expect(b388SuppressDuplicateRampWarning(y)).toBe(false);
 });
});

describe('SOURCE real F3/F5 player radar keeps enemy locations secret',()=>{
 it('normal PLAYER displays only physically observed A-team allies',()=>{
  for(const id of ['A1','A2','A3'])
   expect(b245VisibleNativeSourceRadarCpu(id,true,false)).toBe(true);
  for(const id of ['B1','B2','B3','B4'])
   expect(b245VisibleNativeSourceRadarCpu(id,true,false)).toBe(false);
 });
 it('explicit F8 QA and non-B245 lab preserve all genuine actor evidence',()=>{
  for(const id of ['A1','A2','A3','B1','B2','B3','B4']){
   expect(b245VisibleNativeSourceRadarCpu(id,false,true)).toBe(true);
   expect(b245VisibleNativeSourceRadarCpu(id,true,true)).toBe(true);
   expect(b245VisibleNativeSourceRadarCpu(id,false,false)).toBe(true);
  }
 });
});
describe('SOURCE READY launches genuine A1 cooperation with a NEW world',()=>{
 it('takes 12-weapon combat session to original-only cooperative practice',()=>{
  const old='https://example.com/game?t21Play=preview&t21QaDrive=source'+
   '&t21W10B112=humanGround&t21W10B183=firstDropPlay'+
   '&t21W10B192=humanCombat&t21W10B203=fullRound'+
   '&t21W10B384=loadoutCircuit&t21W10B389=twin-comets';
  const coop=new URL(sourceCoopNavigationUrl(old,true));
  expect(sourceCoopEligible(coop.searchParams)).toBe(true);
  expect(coop.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(coop.searchParams.get('t21W10B183')).toBe('firstDropPlay');
  // B472 preserved an explicitly VERIFIED real weapon in the fresh
  // cooperative SOURCE world; stale B245 must not erase that selection.
  for(const incompatible of ['t21W10B192','t21W10B384',
   't21W10B112'])
   expect(coop.searchParams.has(incompatible)).toBe(false);
  expect(coop.searchParams.get('t21W10B389')).toBe('twin-comets');
  expect(b389NativeBootWeapon(coop.searchParams)).toBe('twin-comets');
  const solo=new URL(sourceCoopNavigationUrl(coop.href,false));
  expect(sourceCoopEligible(solo.searchParams)).toBe(false);
  expect(solo.searchParams.get('t21W10B203')).toBe('fullRound');
  expect(solo.searchParams.has('t21W10B193')).toBe(false);
  expect(solo.searchParams.has('t21W10B389')).toBe(false);
 });
});
describe('existing A1 co-op choice available on normal SOURCE 180s READY',()=>{
 const base='t21Play=preview&t21QaDrive=source&t21W10B203=fullRound';
 it('covers real B207 combat, B384 12-weapon and B193 A1 worlds',()=>{
  for(const tail of ['&t21W10B192=humanCombat',
   '&t21W10B384=loadoutCircuit&t21W10B192=humanCombat',
   '&t21W10B193=allyCoop'])
   expect(b245SourceFullRoundA1Choice(new URLSearchParams(base+tail))).toBe(true);
 });
 it('rejects deterministic and unrelated source/non-source configurations',()=>{
  for(const s of [base+'&t21QaInput=deterministic',
   base.replace('t21W10B203=fullRound','t21W10B203=off'),
   base.replace('t21QaDrive=source','t21QaDrive=other'),
   base.replace('t21Play=preview','t21Play=production'),
   't21Play=preview'])
   expect(b245SourceFullRoundA1Choice(new URLSearchParams(s))).toBe(false);
 });
});

describe('B245 original registered source landing-to-ramp PLAYER cue',()=>{
 const base=()=>({stage:[25,17,26,0] as const,tick:1300,
  phase:'PLAYING',paused:false,stopReason:null,humanAlive:true,
  humanMode:true,grounded:true,surveying:false,
  body:[-.0544,3.8977,47.6779] as const,
  supportId:'UndertowT21D:first-drop-landing-positive-z',
  footGap:.0277,yawDegrees:0});
 it('uses only live landing for S backstep then D across known KCC footprint',()=>{
  const s=b245RealSourceLocalRampGuide(base());
  expect(s.state).toBe('BACKSTEP_S');
  expect(s.text).toContain('STOP W');
  const d=b245RealSourceLocalRampGuide({...base(),tick:1342,
   body:[-.05449,3.895,49.32492]});
  expect(d.state).toBe('STRAFE_D');
  expect(d.geometryOrActorWrites).toBe(0);
  expect(d.fullStageTraversalCertified).toBe(false);
 });
 it('verified Z50.557 landing and X2.043 D steps show cue without new floor',()=>{
  // True native RAW 42468824473, grounded on the *registered* original
  // landing; the old 50.2m/1.8m bounds hid an otherwise useful D cue.
  const start=b245RealSourceLocalRampGuide({...base(),tick:1267,
   body:[-.07938151061534882,3.8949952125549316,50.55711364746094],
   footGap:.024995});
  expect(start.state).toBe('STRAFE_D');
  const nearRamp=b245RealSourceLocalRampGuide({...base(),tick:1297,
   body:[2.043227434158325,3.8974015712738037,50.081546783447266],
   footGap:.027402});
  expect(nearRamp.state).toBe('STRAFE_D');
  // Nearby coordinates alone never authorize guidance without a real
  // registered physical foot; yaw/stage safety checks remain active.
  expect(b245RealSourceLocalRampGuide({...base(),
   body:[-.07938151061534882,3.8949952125549316,50.55711364746094],
   supportId:null,footGap:null}).state).toBe('OFF');
  expect(b245RealSourceLocalRampGuide({...base(),
   body:[-.07938151061534882,3.8949952125549316,50.55711364746094],
   yawDegrees:90}).state).toBe('ALIGN_CAMERA');
  expect(b245RealSourceLocalRampGuide({...base(),
   body:[-.079,3.895,50.9]}).state).toBe('OFF');
 });
 it('one true registered ramp foot contact does not certify onward route',()=>{
  const c=b245RealSourceLocalRampGuide({...base(),tick:1372,
   body:[2.0517,3.9383,49.8099],
   supportId:'UndertowT21D:right-low-route-ramp-positive-z',
   footGap:.04255});
  expect(c.state).toBe('REGISTERED_RAMP_CONTACT');
  expect(c.text).toContain('NOT CERTIFIED');
 });
 it('nonzero yaw fails safe to camera alignment rather than wrong key',()=>{
  const c=b245RealSourceLocalRampGuide({...base(),yawDegrees:90});
  expect(c.state).toBe('ALIGN_CAMERA');
 });
 it('other side, no Rapier support, other stage and inactive phase are OFF',()=>{
  const b=base();
  for(const f of [
   {...b,stage:[26,17,26,0] as const},
   {...b,grounded:false},{...b,footGap:.5},
   {...b,paused:true},{...b,phase:'STAGING'},
   {...b,stopReason:'SAFE STOP'},
   {...b,humanAlive:false},{...b,humanMode:false},
   {...b,surveying:true},
   {...b,body:[-.054,3.89,45] as const},
   {...b,supportId:'UndertowT21D:first-drop-landing-negative-z'}
  ])expect(b245RealSourceLocalRampGuide(f).state).toBe('OFF');
 });
});

describe('real SOURCE first STOP must remain truthy even on malformed exceptions',()=>{
 it('preserves the original nonempty native cause',()=>{
  expect(b245NativeStopReason(new Error('ORIGINAL_RAPIER_FAILURE')))
   .toBe('ORIGINAL_RAPIER_FAILURE');
  expect(b245NativeStopReason('real native failure'))
   .toBe('real native failure');
 });
 it('never returns a falsy reason for empty, missing or whitespace-only throws',()=>{
  for(const e of [new Error(''),new Error('   '),'',null,undefined]){
   const reason=b245NativeStopReason(e);
   expect(reason).toBe('UNKNOWN_NATIVE_SOURCE_EXCEPTION');
   expect(Boolean(reason)).toBe(true);
  }
 });
 it('does not throw if the original non-error exception cannot be stringified',()=>{
  expect(b245NativeStopReason(Object.create(null)))
   .toBe('UNKNOWN_NATIVE_SOURCE_EXCEPTION');
 });
});

describe('one-click Windows local SOURCE build provenance stays honest',()=>{
 const full='0123456789abcdef0123456789abcdef01234567';
 it('records only locally inspected Git HEAD and tracked-modification flag',()=>{
  const meta=b245LocalSourceBuildProvenance(full.toUpperCase(),'FALSE');
  expect(meta.localCheckoutHead).toBe(full);
  expect(meta.trackedChangesPresent).toBe(false);
  expect(meta.untrackedInputsChecked).toBe(false);
  expect(meta.claim).toBe('LOCAL_CHECKOUT_METADATA_NOT_EXACT_BUILT_CONTENT_SHA');
  expect(b245LocalSourceBuildProvenance(full,'TRUE').trackedChangesPresent)
   .toBe(true);
 });
 it('never invents a Git SHA for copied, stale or invalid checkouts',()=>{
  for(const candidate of ['UNKNOWN','',full.slice(1),full+'0',null,42]){
   const row=b245LocalSourceBuildProvenance(candidate,'UNKNOWN');
   expect(row.localCheckoutHead).toBeNull();
   expect(row.trackedChangesPresent).toBeNull();
  }
 });
});


describe('P1 source-only real Windows landing-rim native foot protection',()=>{
 const mk=(tick:number,body:readonly [number,number,number])=>{
  const b=inspectB120OriginalFirstDropBoundary({
   nativeTick:tick,actualRapierBody:body,side:'positive-z'});
  return {stage:[25,17,26,0] as const,nativeTick:tick,
   phase:'PLAYING',paused:false,stopReason:null,
   grounded:true,humanMode:true,humanAlive:true,
   actualOriginalSupportId:b.originalSourceSolidId,
   actualFootGapMeters:b.actualFootVerticalToSourceTopMeters,
   originalBoundary:b,originalNextFootSupportedAtSameY:false as boolean|null};
 };
 it('detects true Windows 1498 floor trace last grounded rim overhang',()=>{
  // The actual 1355 source-support body precedes the 1356 unsupported tick.
  const row=mk(1355,[-.9098284840583801,3.8951027393341064,
   46.98916244506836]);
  expect(row.originalBoundary.originalFootInsideXZ).toBe(false);
  expect(row.originalBoundary.actualHorizontalDistanceToOriginalPolygonEdgeMeters)
   .toBeGreaterThan(0);
  expect(row.originalBoundary.actualHorizontalDistanceToOriginalPolygonEdgeMeters)
   .toBeLessThan(.32);
  const decision=b245OriginalLandingRimWarning(row);
  expect(decision.state).toBe('ACTUAL_FOOT_OUTSIDE_REGISTERED_LANDING');
  expect(decision.sourceFloorHoleCertified).toBe(false);
  expect(decision.sourceRouteCertified).toBe(false);
  expect(decision.actualKccMoved).toBe(false);
  expect(decision.originalSourceGeometryModified).toBe(false);
  expect(decision.originalSevenCpuModified).toBe(false);
 });
 it('inside but true 1.5m SAME-HEIGHT ray missing warns without inventing ground',()=>{
  const row=mk(258,[-.1739107072353363,3.895097494125366,
   47.10128402709961]);
  expect(row.originalBoundary.originalFootInsideXZ).toBe(true);
  expect(b245OriginalLandingRimWarning(row).state)
   .toBe('NO_VERIFIED_SAME_HEIGHT_SUPPORT_1_5M_CENTREWARD');
  expect(b245OriginalLandingRimWarning({
   ...row,originalNextFootSupportedAtSameY:true}).state).toBe('OFF');
 });
 it('withholds any advice for nonphysical, untrusted or stale evidence',()=>{
  const row=mk(1355,[-.9098284840583801,3.8951027393341064,
   46.98916244506836]);
  for(const other of [
   {...row,grounded:false},
   {...row,actualOriginalSupportId:null},
   {...row,actualFootGapMeters:null},
   {...row,actualFootGapMeters:.5},
   {...row,stage:[25,17,27,0]},
   {...row,paused:true},
   {...row,phase:'STAGING'},
   {...row,humanMode:false},
   {...row,humanAlive:false},
   {...row,nativeTick:1354},
   {...row,stopReason:'SAFE_STOP'}
  ])expect(b245OriginalLandingRimWarning(other).state).toBe('OFF');
 });
});
