import {describe,it,expect} from 'vitest';
import {sourceAudioCues,type SourceAudioFrame} from './SourcePracticeAudio';
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
