import {describe,it,expect} from 'vitest';
import {b270ActorOnlyArtScopeAudit} from './B270SourceWholeViewAttribution';
const hash=(n:string)=>n.repeat(64);
const entry=(n:number,near:number,background:number,marker:string)=>({
 metadata:{source:'25/17/26/0',frameSize:[1600,900],
  realInkOwnedCells:115,artAccepted:false,nativeAsha:hash(marker),
  nativeBsha:hash('c')},
 roi:{entire_native_frame:{pixels:n,atLeast8:n-4000,atLeast24:n-23000},
  actor_nearfield:{pixels:near,atLeast8:near-4000,atLeast24:near-23000},
  reticle_and_ink:{pixels:9500,atLeast8:9000,atLeast24:6300},
  upper_stage_without_hud:{pixels:background,atLeast8:0,atLeast24:0}}
});
const fixture=()=>({B268:entry(45611,45610,1,'a'),
 B269:entry(45448,45446,2,'b'),crossrunSameBaseline:false});
describe('B270 original source genuine screen attribution',()=>{
 it('real screenshots constrain actor-only studies; no ART promotion',()=>{
  const x=b270ActorOnlyArtScopeAudit(fixture());
  expect(x.actors[0]!.outsideNearfieldChangedPixels).toBe(1);
  expect(x.actors[1]!.outsideNearfieldChangedPixels).toBe(2);
  expect(x.actors[0]!.nearfieldShareOfChange).toBeGreaterThan(.999);
  expect(x.artAccepted).toBe(false);
  expect(x.betterGameArtCertified).toBe(false);
  expect(x.originalSolids).toBe(25);
  expect(x.nextStage).toContain('REGISTRATION');
 });
 it('rejects fabricated baseline equivalence or non-original source',()=>{
  const f=fixture();f.crossrunSameBaseline=true;
  expect(()=>b270ActorOnlyArtScopeAudit(f)).toThrow(/DISTINCT_RUN_BASELINES/);
  const g=fixture();g.B269.metadata.source='25/18/26/0';
  expect(()=>b270ActorOnlyArtScopeAudit(g)).toThrow(/PINNED_GENUINE_SOURCE/);
 });
 it('refuses to mislabel widespread stage changes as actor-only',()=>{
  const f=fixture();f.B269.roi.actor_nearfield={pixels:35000,atLeast8:31000,atLeast24:19000};
  expect(()=>b270ActorOnlyArtScopeAudit(f)).toThrow(/ACTOR_ONLY_ATTRIBUTION/);
  const g=fixture();g.B268.roi.upper_stage_without_hud.pixels=800;
  expect(()=>b270ActorOnlyArtScopeAudit(g)).toThrow(/UPPER_STAGE_ALTERED/);
 });
 it('native source labels and screenshot hashes cannot be omitted',()=>{
  const f=fixture();f.B268.metadata.nativeAsha='unverified';
  expect(()=>b270ActorOnlyArtScopeAudit(f)).toThrow(/SOURCE_PROVENANCE/);
 });
});
