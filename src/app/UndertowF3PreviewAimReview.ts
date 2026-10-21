/**
 * W10-B69 — intentionally manual, one-click source CPU aim review.
 * Not a new match mode. Never silently promotes B68 source-only SWEEP.
 */
export type B69PreviewAim='FIXED'|'SWEEP';
export interface B69PreviewAimView {
 mode:B69PreviewAim;
 headline:string;
 detail:string;
 switchLabel:string;
 nextMode:B69PreviewAim;
 sourceOnly:true;
 officialWinner:'NONE';
 original4v4Certified:false;
 defaultCpuChanged:false;
}
export function b69PreviewAimView(search:string):B69PreviewAimView|null {
 const q=new URLSearchParams(search.startsWith('?')?search.slice(1):search);
 if(q.get('t21Play')!=='preview'||q.has('t21QaDrive')||
    q.has('t21QaInput')||q.has('t21QaPauseOnBoot')||
    q.has('t21W10B64')||q.has('t21CpuKits'))
  return null;
 if(q.has('t21W10B68')&&q.get('t21W10B68')!=='previewSweep')
  return null;
 const mode:B69PreviewAim=q.get('t21W10B68')==='previewSweep'?
  'SWEEP':'FIXED';
 return {
  mode,
  headline:mode==='SWEEP'?
   'CPU AIM · SWEEP TRIAL (EXPLICIT OPT-IN)':
   'CPU AIM · FIXED (DEFAULT)',
  detail:mode==='SWEEP'?
   'Original source-floor paint aiming trial. Not a 4v4 result; owner GPU quality unverified.':
   'Proven original source-ground fixed patrol. SWEEP remains optional and never changes the default.',
  switchLabel:mode==='SWEEP'?
   'RETURN TO FIXED · RESTART SESSION':
   'TRY SWEEP · RESTART SESSION',
  nextMode:mode==='SWEEP'?'FIXED':'SWEEP',
  sourceOnly:true,officialWinner:'NONE',original4v4Certified:false,
  defaultCpuChanged:false
 };
}
/** Always restart a NEW nonproduction preview; carry no QA/debug flags,
 * game simulation objects, previous telemetry, source asset URL or score. */
export function b69NextSourcePreviewHref(
 pathname:string,nextMode:B69PreviewAim
):string {
 if(typeof pathname!=='string'||!pathname.startsWith('/')||
    pathname.startsWith('//')||pathname.includes('..')||
    pathname.includes('?')||pathname.includes('#')||
    /[\\\x00-\x1F]/.test(pathname))
  throw Error('B69_UNSAFE_PREVIEW_PATHNAME');
 if(nextMode!=='FIXED'&&nextMode!=='SWEEP')
  throw Error('B69_UNSUPPORTED_CPU_MODE');
 return pathname+'?t21Play=preview'+
  (nextMode==='SWEEP'?'&t21W10B68=previewSweep':'');
}
