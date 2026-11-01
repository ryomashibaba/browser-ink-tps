import {describe,expect,it} from 'vitest';
import {b371RealSourceMissionCue} from './B371RealSourceMissionCue';

/** Native frame inputs are read-only; these tests never award game progress. */
const realFrame=()=>({
 originalStage:[25,17,26,0] as const,
 genuineSourceShooterSelected:false,
 genuineSourceOpenLoadoutSelected:true,
 nativeTick:2100,
 status:'REAL_LOCAL_CIRCUIT_CLEAR' as const,
 originalSourceLocalClear:true,
 realGroundedTravelMeters:11.34,
 requiredGroundedTravelMeters:2,
 realFreshHumanImpactCells:65,
 requiredFreshHumanImpactCells:60,
 actualHumanImpactEvents:12,
 sourceInkOnly:true,
 realAcceptedShots:37,
 actualInkPercent:72,
 playerAlive:true,
 matchState:'PLAYING' as const,
 stopped:false
});
describe('Real 180s source-life gameplay guidance',()=>{
 it('continues the actual 180s round after a source-local 3/3 clear',()=>{
  const cue=b371RealSourceMissionCue(realFrame());
  expect(cue).toMatchObject({step:'CLEAR',progress:3,completed:true,
   scoreablePromotions:0,crossTeamRouteCertified:false,
   officialWinner:'NONE',gameplayWrites:0});
  expect(cue?.text).toContain('KEEP PLAYING THE REAL 180s SOURCE ROUND');
  expect(cue?.text).toContain('NO TURF WINNER');
 });
 it('does not present a prior-life 3/3 as the splatted current life',()=>{
  const frame=realFrame();
  frame.playerAlive=false;
  // Model a temporarily stale current-life circuit at the authentic HP-zero tick.
  const cue=b371RealSourceMissionCue(frame);
  expect(cue).toMatchObject({step:'RESPAWN',progress:0,completed:false,
   scoreablePromotions:0,officialWinner:'NONE'});
  expect(cue?.text).toContain('PLAYER SPLATTED');
  expect(cue?.text).toContain('WAIT FOR NATIVE RESPAWN');
  expect(cue?.text).not.toContain('SOURCE CIRCUIT 3/3');
  expect(cue?.text).not.toContain('LOCAL CIRCUIT COMPLETE');
 });
 it('safety STOP has priority, and time-up does not say to keep playing',()=>{
  const stopped=realFrame();stopped.playerAlive=false;stopped.stopped=true;
  expect(b371RealSourceMissionCue(stopped)?.step).toBe('HOLD');
  const ended=realFrame();
  const cue=b371RealSourceMissionCue({...ended,matchState:'TIME_UP' as const});
  expect(cue?.step).toBe('CLEAR');
  expect(cue?.text).toContain('TIME UP');
  expect(cue?.text).not.toContain('KEEP PLAYING');
  expect(b371RealSourceMissionCue({
   ...ended,originalStage:[25,17,26,1] as const
  })).toBeNull();
 });
});
