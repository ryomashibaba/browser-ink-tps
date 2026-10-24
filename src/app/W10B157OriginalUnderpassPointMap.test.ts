import {describe,it,expect} from 'vitest';
import type {B155SourceConnectivityReview}
 from './W10B155OriginalSourceConnectivityReview';
import type {B157OriginalBidirectionalSourceAudit}
 from './W10B157OriginalBidirectionalSourceAudit';
import {renderB157OriginalUnderpassPointMap as map}
 from './W10B157OriginalUnderpassPointMap';

const props=()=>{
 const sides=['POSITIVE_Z','NEGATIVE_Z'] as const;
 const routes=sides.map(side=>({
  id:'right-low-to-underpass-'+
    (side==='POSITIVE_Z'?'positive-z':'negative-z'),
  type:'DIAGNOSTIC_GAP',
  start:[2,4.5,side==='POSITIVE_Z'?48:-48],
  end:[-8,0,side==='POSITIVE_Z'?7:-7]
 }));
 const b155={
  stage:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  routes
 } as unknown as B155SourceConnectivityReview;
 const b157={
  originalAuthority:'25_SOLIDS_17_PAINT_26_NAVLINKS_0_SCOREABLE',
  originalFull4v4Certified:false,productionAuthorized:false,
  addedStageSolids:0,addedNavigationLinks:0,
  sides:sides.map(side=>({
   side,forwardNativeTerminal:[4,4.6,side==='POSITIVE_Z'?35:-35],
   reverseNativeTerminal:[-8,0,side==='POSITIVE_Z'?8:-8]
  }))
 } as unknown as B157OriginalBidirectionalSourceAudit;
 return {b155,b157};
};
describe('B157 original registered endpoint map visual is NOT a path',()=>{
 it('renders both source regions as observed points only',()=>{
  const {b155,b157}=props();
  const html=map(b155,b157);
  expect(html).toContain('Team A / +Z');
  expect(html).toContain('Team B / -Z');
  expect(html).toContain('native Recast forward terminal');
  expect(html).toContain('OBSERVED POINTS + 42 existing exact CI #688 source triangles only');
  expect(html.match(/<polygon /g)).toHaveLength(42);
  expect(html).toContain('CI688_EXACT_FACE_NOT_RUNTIME');
  expect(html.match(/<circle /g)).toHaveLength(8);
  expect(html).not.toContain('<line');
  expect(html).not.toContain('<path');
  expect(html).not.toContain('Scoreable=TRUE');
 });
 it('fails closed if original runtime score/nav authority changes',()=>{
  const {b155,b157}=props();
  const altered={...b157,addedNavigationLinks:1} as unknown as B157OriginalBidirectionalSourceAudit;
  expect(()=>map(b155,altered)).toThrow(/UNAUTHORIZED_SOURCE_MAP/);
 });
});
