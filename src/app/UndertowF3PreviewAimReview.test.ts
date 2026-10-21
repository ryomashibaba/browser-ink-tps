import {describe,it,expect} from 'vitest';
import {b69PreviewAimView,b69NextSourcePreviewHref}
 from './UndertowF3PreviewAimReview';
describe('W10-B69 CPU source-only default isolation and opt-in review',()=>{
 it('starts with unchanged normal FIXED and explicit guarded alternate',()=>{
  const fixed=b69PreviewAimView('?t21Play=preview')!;
  expect(fixed).toMatchObject({mode:'FIXED',nextMode:'SWEEP',
   defaultCpuChanged:false,officialWinner:'NONE',sourceOnly:true});
  const sweep=b69PreviewAimView(
   '?t21Play=preview&t21W10B68=previewSweep')!;
  expect(sweep).toMatchObject({mode:'SWEEP',nextMode:'FIXED',
   defaultCpuChanged:false,original4v4Certified:false});
  expect(b69NextSourcePreviewHref('/browser-ink-tps/',fixed.nextMode))
   .toBe('/browser-ink-tps/?t21Play=preview&t21W10B68=previewSweep');
  expect(b69NextSourcePreviewHref('/browser-ink-tps/',sweep.nextMode))
   .toBe('/browser-ink-tps/?t21Play=preview');
 });
 it('source QA and production cannot show or use this review control',()=>{
  for(const query of ['','?t21Play=production','?t21QaDrive=source',
   '?t21Play=preview&t21QaDrive=source',
   '?t21Play=preview&t21W10B64=inkAngleSweep',
   '?t21Play=preview&t21W10B68=unknown',
   '?t21Play=preview&t21QaInput=deterministic',
   '?t21Play=preview&t21CpuKits=qa'])
   expect(b69PreviewAimView(query)).toBeNull();
 });
 it('one-click links discard all previous QA and avoid external redirect',()=>{
  for(const p of ['https://evil.example','//evil.example','/some/../escape',
   '/bad?mode=fake','/bad#fragment','/escape\\x0d'])
   expect(()=>b69NextSourcePreviewHref(p,'SWEEP')).toThrow('B69_UNSAFE');
  expect(()=>b69NextSourcePreviewHref('/browser-ink-tps/','UNKNOWN' as never))
   .toThrow('B69_UNSUPPORTED');
 });
});
