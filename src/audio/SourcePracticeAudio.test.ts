import {describe,it,expect} from 'vitest';
import {sourceAudioCues,sourceShotTone,type SourceAudioFrame} from './SourcePracticeAudio';
import {WEAPON_ORDER} from '../weapons/WeaponCatalog';
const before:SourceAudioFrame={tick:10,phase:'PLAYING',locked:true,stopped:false,
 shots:1,dry:0,throws:0,explosions:0,hits:0,cpuSplats:0,damage:0,
 humanSplats:0,respawns:0};
const after=(p:Partial<SourceAudioFrame>={}):SourceAudioFrame=>({...before,tick:11,...p});
describe('SOURCE original native 60Hz actual audio events',()=>{
 it('requires consecutive live pointer-locked original practice',()=>{
  expect(sourceAudioCues(null,after({shots:2}))).toEqual([]);
  expect(sourceAudioCues(before,after({tick:20,shots:2}))).toEqual([]);
  expect(sourceAudioCues(before,after({locked:false,shots:2}))).toEqual([]);
  expect(sourceAudioCues(before,after({stopped:true,shots:2}))).toEqual([]);
  expect(sourceAudioCues({...before,phase:'STAGING'},after({shots:2}))).toEqual([]);
 });
 it('firing is real accepted projectile, dry fire separate',()=>{
  expect(sourceAudioCues(before,after({shots:2}))).toEqual(['SHOT']);
  expect(sourceAudioCues(before,after({dry:1}))).toEqual(['DRY']);
  expect(sourceAudioCues(before,after())).toEqual([]);
 });
 it('actual CPU HP hit, not camera aim or fabricated splat',()=>{
  expect(sourceAudioCues(before,after({hits:1}))).toEqual(['CPU_HIT']);
  expect(sourceAudioCues(before,after({hits:1,cpuSplats:1}))).toEqual(['CPU_SPLAT']);
  expect(sourceAudioCues(before,after({cpuSplats:1}))).toEqual([]);
 });
 it('real player hurt/death/respawn, sub and session end',()=>{
  expect(sourceAudioCues(before,after({damage:1}))).toEqual(['HURT']);
  expect(sourceAudioCues(before,after({humanSplats:1}))).toEqual(['SPLAT']);
  expect(sourceAudioCues(before,after({respawns:1}))).toEqual(['RESPAWN']);
  expect(sourceAudioCues(before,after({throws:1}))).toEqual(['THROW']);
  expect(sourceAudioCues(before,after({explosions:1}))).toEqual(['EXPLODE']);
  expect(sourceAudioCues(before,after({phase:'TIME_UP'}))).toEqual(['TIME_UP']);
 });
 it('fails closed on counter resets and nonfinite samples',()=>{
  expect(sourceAudioCues(before,after({shots:0}))).toEqual([]);
  expect(sourceAudioCues(before,after({hits:NaN}))).toEqual([]);
  expect(sourceAudioCues(before,after({damage:-1}))).toEqual([]);
 });
});

describe('SOURCE 12-weapon true gameplay sound and actual physical feedback',()=>{
 it('preserves all genuine audio through fractional HP damage counters',()=>{
  const previous={...before,damage:.25};
  expect(sourceAudioCues(previous,after({damage:.50,shots:2})))
   .toEqual(['HURT','SHOT']);
  expect(sourceAudioCues(previous,after({damage:NaN,shots:2}))).toEqual([]);
  expect(sourceAudioCues(previous,after({damage:.1,shots:2}))).toEqual([]);
 });
 it('only sounds a real post-PaintCoordinator new original cell',()=>{
  const p={...before,paintCells:14};
  expect(sourceAudioCues(p,after({paintCells:17}))).toEqual(['PAINT']);
  expect(sourceAudioCues(p,after({paintCells:14}))).toEqual([]);
  expect(sourceAudioCues(p,after({paintCells:13}))).toEqual([]);
  expect(sourceAudioCues(p,after({paintCells:NaN}))).toEqual([]);
 });
 it('physical ground arrival, native own-ink motion and actual refill',()=>{
  const grounded={...before,grounded:false};
  expect(sourceAudioCues(grounded,after({grounded:true}))).toEqual(['LAND']);
  const moving:SourceAudioFrame={...before,ink:51,inkRelation:'OWN',
   mode:'SQUID',grounded:true,body:[0,2,0]};
  expect(sourceAudioCues(moving,after({ink:52,inkRelation:'OWN',
   mode:'SQUID',grounded:true,body:[.09,2,0]})))
   .toEqual(['REFILL','SWIM']);
  expect(sourceAudioCues(moving,after({ink:52,inkRelation:'ENEMY',
   mode:'SQUID',grounded:true,body:[.09,2,0]}))).toEqual([]);
  expect(sourceAudioCues(moving,after({ink:52,inkRelation:'OWN',
   mode:'SQUID',grounded:true,body:[Infinity,2,0]}))).toEqual([]);
  expect(sourceAudioCues(moving,after({ink:52,inkRelation:'OWN',
   mode:'SQUID',grounded:true,body:[.09,2,0],locked:false}))).toEqual([]);
 });
 it('uses all 12 real weapon profiles for distinct shot pitch',()=>{
  expect(WEAPON_ORDER).toHaveLength(12);
  const pitches=WEAPON_ORDER.map(id=>sourceShotTone(id).pitch);
  expect(new Set(pitches).size).toBe(12);
  expect(sourceShotTone('rail-charger').wave).toBe('sine');
  expect(sourceShotTone('arc-blaster').wave).toBe('sawtooth');
  expect(sourceShotTone('rotor-splatling').wave).toBe('square');
 });
});
